package cl.ecoconce.integration;

import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Region;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.RegionRepository;
import cl.ecoconce.repository.RolRepository;
import cl.ecoconce.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UsuarioIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComunaRepository comunaRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    public void guardarYRecuperarUsuario() {
        // Crear Region, Comuna y Rol con nombres únicos para no colisionar con seeders
        Region region = regionRepository.save(Region.builder().nombre("Region Test Integracion Rec").build());
        Comuna comuna = comunaRepository.save(Comuna.builder().nombre("Comuna Test Integracion Rec").region(region).build());
        
        // Buscamos si existe o creamos un rol de prueba
        Rol rol = rolRepository.save(Rol.builder().nombre("ROL_TEST_INT_REC").build());

        // Crear Usuario con su builder usando un RUT y correo únicos
        Usuario usuario = Usuario.builder()
                .rut("99999999-K")
                .nombreAlias("Juan Perez Int")
                .correo("juan.perez.int@ecoconce.cl")
                .contrasena("password123")
                .sexoGenero("M")
                .fechaNacimiento(LocalDate.of(1990, 1, 1))
                .telefono("987654321")
                .comuna(comuna)
                .direccion("Calle Falsa 123")
                .rol(rol)
                .build();

        // save
        Usuario guardado = usuarioRepository.saveAndFlush(usuario);
        assertNotNull(guardado.getId());

        // findById
        Usuario recuperado = usuarioRepository.findById(guardado.getId()).orElse(null);
        assertNotNull(recuperado);

        // Assert que rut y correo coinciden, activo="S", puntos=0
        assertEquals("99999999-K", recuperado.getRut());
        assertEquals("juan.perez.int@ecoconce.cl", recuperado.getCorreo());
        assertEquals("S", recuperado.getActivo());
        assertEquals(0, recuperado.getPuntos());
    }

    @Test
    public void unicidadRut() {
        // Crear Region, Comuna y Rol con nombres únicos para no colisionar con seeders
        Region region = regionRepository.save(Region.builder().nombre("Region Test Integracion Uni").build());
        Comuna comuna = comunaRepository.save(Comuna.builder().nombre("Comuna Test Integracion Uni").region(region).build());
        Rol rol = rolRepository.save(Rol.builder().nombre("ROL_TEST_INT_UNI").build());

        // Guardar usuario
        Usuario usuario1 = Usuario.builder()
                .rut("88888888-K")
                .nombreAlias("Alias 1")
                .correo("alias1.int@ecoconce.cl")
                .contrasena("pass123")
                .comuna(comuna)
                .rol(rol)
                .build();
        usuarioRepository.saveAndFlush(usuario1);

        // Intentar guardar otro con mismo rut -> debe lanzar excepción
        Usuario usuario2 = Usuario.builder()
                .rut("88888888-K") // Mismo RUT
                .nombreAlias("Alias 2")
                .correo("alias2.int@ecoconce.cl")
                .contrasena("pass456")
                .comuna(comuna)
                .rol(rol)
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            usuarioRepository.saveAndFlush(usuario2);
        });
    }
}
