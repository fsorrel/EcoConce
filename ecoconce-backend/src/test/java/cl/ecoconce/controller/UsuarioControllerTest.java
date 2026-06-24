package cl.ecoconce.controller;

import cl.ecoconce.dto.UsuarioAdminDto;
import cl.ecoconce.dto.UsuarioAdminUpdateRequest;
import cl.ecoconce.dto.UsuarioRequest;
import cl.ecoconce.dto.UsuarioResumenDto;
import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.RegionRepository;
import cl.ecoconce.repository.RolRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.service.MapperService;
import cl.ecoconce.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = UsuarioController.class, excludeAutoConfiguration = { SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
public class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private ComunaRepository comunaRepository;

    @MockBean
    private RegionRepository regionRepository;

    @MockBean
    private RolRepository rolRepository;

    @MockBean
    private MapperService mapperService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    // --- PRUEBAS DE LISTADO Y BÚSQUEDA ---

    @Test
    public void listarUsuarios_ok() throws Exception {
        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuario = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        UsuarioResumenDto resumenDto = new UsuarioResumenDto(1L, "Juan Perez", "juan@example.com", 0, "CIUDADANO");

        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
        when(mapperService.toUsuarioResumen(usuario)).thenReturn(resumenDto);

        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].correo").value("juan@example.com"));
    }

    @Test
    public void buscarUsuario_ok() throws Exception {
        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuario = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        UsuarioResumenDto resumenDto = new UsuarioResumenDto(1L, "Juan Perez", "juan@example.com", 0, "CIUDADANO");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(mapperService.toUsuarioResumen(usuario)).thenReturn(resumenDto);

        mockMvc.perform(get("/api/usuarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreAlias").value("Juan Perez"));
    }

    @Test
    public void buscarUsuario_noEncontrado() throws Exception {
        when(usuarioRepository.findById(9999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/usuarios/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Usuario no encontrado")));
    }

    // --- PRUEBAS DE CREACIÓN DE USUARIO ---

    @Test
    public void crearUsuario_ok() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "12345678-9",
                "Juan Perez",
                "juan@example.com",
                "password123",
                "M",
                LocalDate.of(1990, 1, 1),
                "987654321",
                1L,
                "Calle Falsa 123",
                2L
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuarioGuardado = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        UsuarioResumenDto resumenDto = new UsuarioResumenDto(1L, "Juan Perez", "juan@example.com", 0, "CIUDADANO");

        when(usuarioRepository.existsByRut(request.rut())).thenReturn(false);
        when(usuarioRepository.existsByCorreo(request.correo())).thenReturn(false);
        when(comunaRepository.findById(request.comunaId())).thenReturn(Optional.of(comuna));
        when(rolRepository.findById(request.rolId())).thenReturn(Optional.of(rol));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);
        when(mapperService.toUsuarioResumen(any(Usuario.class))).thenReturn(resumenDto);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").exists())
                .andExpect(jsonPath("$.correo").value("juan@example.com"));
    }

    @Test
    public void crearUsuario_rutDuplicado() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "12345678-9",
                "Juan Perez",
                "juan@example.com",
                "password123",
                "M",
                LocalDate.of(1990, 1, 1),
                "987654321",
                1L,
                "Calle Falsa 123",
                2L
        );

        when(usuarioRepository.existsByRut(request.rut())).thenReturn(true);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("Ya existe un usuario con ese RUT")));
    }

    @Test
    public void crearUsuario_correoDuplicado() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "12345678-9",
                "Juan Perez",
                "juan@example.com",
                "password123",
                "M",
                LocalDate.of(1990, 1, 1),
                "987654321",
                1L,
                "Calle Falsa 123",
                2L
        );

        when(usuarioRepository.existsByRut(request.rut())).thenReturn(false);
        when(usuarioRepository.existsByCorreo(request.correo())).thenReturn(true);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("Ya existe un usuario con ese correo")));
    }

    @Test
    public void crearUsuario_comunaNoEncontrada() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "12345678-9",
                "Juan Perez",
                "juan@example.com",
                "password123",
                "M",
                LocalDate.of(1990, 1, 1),
                "987654321",
                1L,
                "Calle Falsa 123",
                2L
        );

        when(usuarioRepository.existsByRut(request.rut())).thenReturn(false);
        when(usuarioRepository.existsByCorreo(request.correo())).thenReturn(false);
        when(comunaRepository.findById(request.comunaId())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Comuna no encontrada")));
    }

    @Test
    public void crearUsuario_rolNoEncontrado() throws Exception {
        UsuarioRequest request = new UsuarioRequest(
                "12345678-9",
                "Juan Perez",
                "juan@example.com",
                "password123",
                "M",
                LocalDate.of(1990, 1, 1),
                "987654321",
                1L,
                "Calle Falsa 123",
                2L
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);

        when(usuarioRepository.existsByRut(request.rut())).thenReturn(false);
        when(usuarioRepository.existsByCorreo(request.correo())).thenReturn(false);
        when(comunaRepository.findById(request.comunaId())).thenReturn(Optional.of(comuna));
        when(rolRepository.findById(request.rolId())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Rol no encontrado")));
    }

    // --- PRUEBAS DE VISTA Y EDICIÓN ADMIN ---

    @Test
    public void listarActivosAdmin_ok() throws Exception {
        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuario = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        UsuarioAdminDto adminDto = new UsuarioAdminDto(
                1L, "12345678-9", "Juan Perez", "juan@example.com", "M", LocalDate.of(1990,1,1),
                "987654321", 1L, "Concepcion", "Calle 1", 0, 2L, "CIUDADANO", "S",
                LocalDateTime.now(), LocalDateTime.now(), false
        );

        when(usuarioRepository.findByActivoOrderByIdAsc("S")).thenReturn(List.of(usuario));
        when(mapperService.toUsuarioAdminDto(usuario)).thenReturn(adminDto);

        mockMvc.perform(get("/api/usuarios/admin/activos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].correo").value("juan@example.com"));
    }

    @Test
    public void actualizarUsuarioAdmin_ok() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Juan Editado",
                "editado@example.com",
                "999999999",
                1L,
                "Calle Editada 123",
                2L,
                "S"
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuarioExistente = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        UsuarioAdminDto adminDto = new UsuarioAdminDto(
                1L, "12345678-9", "Juan Editado", "editado@example.com", "M", LocalDate.of(1990,1,1),
                "999999999", 1L, "Concepcion", "Calle Editada 123", 0, 2L, "CIUDADANO", "S",
                LocalDateTime.now(), LocalDateTime.now(), false
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByCorreo("editado@example.com")).thenReturn(Optional.empty());
        when(rolRepository.findById(2L)).thenReturn(Optional.of(rol));
        when(comunaRepository.findById(1L)).thenReturn(Optional.of(comuna));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioExistente);
        when(mapperService.toUsuarioAdminDto(any(Usuario.class))).thenReturn(adminDto);

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreAlias").value("Juan Editado"))
                .andExpect(jsonPath("$.correo").value("editado@example.com"));
    }

    @Test
    public void actualizarUsuarioAdmin_noEncontrado() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Juan Editado", "editado@example.com", "999999999", 1L, "Calle 123", 2L, "S"
        );

        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Usuario no encontrado")));
    }

    @Test
    public void actualizarUsuarioAdmin_esAdminOriginal() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Admin Original Edit", "admin@ecoconce.cl", "999999999", 1L, "Calle 123", 2L, "S"
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "ADMINISTRADOR");
        Usuario adminOriginal = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Admin")
                .correo("admin@ecoconce.cl") // Correo reservado para admin original
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(adminOriginal));

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("No se puede modificar el administrador original")));
    }

    @Test
    public void actualizarUsuarioAdmin_activoInvalido() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Juan Editado", "editado@example.com", "999999999", 1L, "Calle 123", 2L,
                "X" // Valor inválido, solo S o N
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuarioExistente = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioExistente));

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("El estado activo solo puede ser S o N")));
    }

    @Test
    public void actualizarUsuarioAdmin_correoDuplicadoOtroUsuario() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Juan Editado", "duplicado@example.com", "999999999", 1L, "Calle 123", 2L, "S"
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuarioExistente = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        Usuario otroUsuario = Usuario.builder()
                .id(2L) // ID distinto
                .rut("98765432-1")
                .nombreAlias("Otro Usuario")
                .correo("duplicado@example.com") // Mismo correo que solicitamos actualizar
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByCorreo("duplicado@example.com")).thenReturn(Optional.of(otroUsuario));

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("Ya existe otro usuario con ese correo")));
    }

    @Test
    public void actualizarUsuarioAdmin_rolNoEncontrado() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Juan Editado", "editado@example.com", "999999999", 1L, "Calle 123", 2L, "S"
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuarioExistente = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByCorreo("editado@example.com")).thenReturn(Optional.empty());
        when(rolRepository.findById(2L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Rol no encontrado")));
    }

    @Test
    public void actualizarUsuarioAdmin_comunaNoEncontrada() throws Exception {
        UsuarioAdminUpdateRequest request = new UsuarioAdminUpdateRequest(
                "Juan Editado", "editado@example.com", "999999999", 1L, "Calle 123", 2L, "S"
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        Rol rol = new Rol(2L, "CIUDADANO");
        Usuario usuarioExistente = Usuario.builder()
                .id(1L)
                .rut("12345678-9")
                .nombreAlias("Juan Perez")
                .correo("juan@example.com")
                .comuna(comuna)
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioExistente));
        when(usuarioRepository.findByCorreo("editado@example.com")).thenReturn(Optional.empty());
        when(rolRepository.findById(2L)).thenReturn(Optional.of(rol));
        when(comunaRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/usuarios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Comuna no encontrada")));
    }
}
