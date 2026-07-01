package cl.ecoconce.integration;

import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Region;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.RegionRepository;
import cl.ecoconce.repository.RolRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de la anonimización de cuenta (Ley 21.719 — derecho al olvido).
 *
 * Verifica el fix del @PreAuthorize de DELETE /api/usuarios/{id}/cuenta:
 * - El propio titular puede anonimizar su cuenta (antes daba 403 por comparar correo vs id).
 * - Un ciudadano NO puede anonimizar la cuenta de otro → 403.
 * - Un ADMIN puede anonimizar cualquier cuenta.
 *
 * Crea sus propios datos (usuarios + JWT reales) en lugar de depender de ids sembrados.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AnonimizacionCuentaTest {

    @Autowired MockMvc mockMvc;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired RolRepository rolRepository;
    @Autowired ComunaRepository comunaRepository;
    @Autowired RegionRepository regionRepository;
    @Autowired JwtService jwtService;
    @Autowired PasswordEncoder passwordEncoder;

    private Usuario owner;
    private String tokenOwner;
    private String tokenIntruso;
    private String tokenAdmin;

    @BeforeEach
    void setUp() {
        Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("ADMIN").build()));
        Rol rolCiudadano = rolRepository.findByNombre("USUARIO")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("USUARIO").build()));

        Comuna comuna = comunaRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Region region = regionRepository.findAll().stream().findFirst()
                            .orElseGet(() -> regionRepository.save(Region.builder().nombre("Biobío").build()));
                    return comunaRepository.save(Comuna.builder().nombre("Concepción").region(region).build());
                });

        owner = usuarioRepository.findByCorreo("owner.anon@ecoconce.cl")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .rut("90100001-1")
                        .nombreAlias("Dueño Anonimizacion")
                        .correo("owner.anon@ecoconce.cl")
                        .contrasena(passwordEncoder.encode("owner123"))
                        .rol(rolCiudadano)
                        .comuna(comuna)
                        .puntos(0)
                        .activo("S")
                        .build()));

        Usuario intruso = usuarioRepository.findByCorreo("intruso.anon@ecoconce.cl")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .rut("90100002-2")
                        .nombreAlias("Intruso Anonimizacion")
                        .correo("intruso.anon@ecoconce.cl")
                        .contrasena(passwordEncoder.encode("intruso123"))
                        .rol(rolCiudadano)
                        .comuna(comuna)
                        .puntos(0)
                        .activo("S")
                        .build()));

        Usuario admin = usuarioRepository.findByCorreo("admin.anon@ecoconce.cl")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .rut("90100003-3")
                        .nombreAlias("Admin Anonimizacion")
                        .correo("admin.anon@ecoconce.cl")
                        .contrasena(passwordEncoder.encode("admin123"))
                        .rol(rolAdmin)
                        .comuna(comuna)
                        .puntos(0)
                        .activo("S")
                        .build()));

        tokenOwner = jwtService.generateToken(owner);
        tokenIntruso = jwtService.generateToken(intruso);
        tokenAdmin = jwtService.generateToken(admin);
    }

    @Test
    void titularPuedeAnonimizarSuPropiaCuenta() throws Exception {
        Long id = owner.getId();

        mockMvc.perform(delete("/api/usuarios/" + id + "/cuenta")
                        .header("Authorization", "Bearer " + tokenOwner)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("cuenta_anonimizada"));

        Usuario anonimizado = usuarioRepository.findById(id).orElseThrow();
        assertThat(anonimizado.getCorreo()).contains("@eliminado.ecoconce.cl");
        assertThat(anonimizado.getNombreAlias()).startsWith("ANONIMO_");
        assertThat(anonimizado.getActivo()).isEqualTo("N");
    }

    @Test
    void ciudadanoNoPuedeAnonimizarCuentaAjena() throws Exception {
        mockMvc.perform(delete("/api/usuarios/" + owner.getId() + "/cuenta")
                        .header("Authorization", "Bearer " + tokenIntruso)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminPuedeAnonimizarCualquierCuenta() throws Exception {
        mockMvc.perform(delete("/api/usuarios/" + owner.getId() + "/cuenta")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("cuenta_anonimizada"));
    }
}
