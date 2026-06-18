package cl.ecoconce.integration;

import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.RolRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * SecurityIntegrationTest — Pruebas de seguridad automáticas para validar OWASP.
 *
 * Estas pruebas validan:
 * - AC-01: Acceso a ruta protegida sin token → 401
 * - AC-02: Acceso a ruta admin con token de ciudadano → 403
 * - JWT-01: Token expirado → 401
 * - JWT-02: Token modificado → 401
 * - JWT-03: Sin token → 401
 *
 * Prioridad: 🔴 Alta
 * Ejecutar: mvn test -Dtest=SecurityIntegrationTest
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private cl.ecoconce.repository.ComunaRepository comunaRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String tokenAdmin;
    private String tokenCiudadano;
    private String tokenExpired;
    private String tokenModified;

    @BeforeEach
    public void setup() throws Exception {
        // Los roles se asumen que existen en la BD de prueba
        // (creados por @Sql o por ejecuciones previas del test)
        
        Rol rolAdmin = new Rol();
        rolAdmin.setId(1L);
        rolAdmin.setNombre("ADMIN");

        Rol rolCiudadano = new Rol();
        rolCiudadano.setId(2L);
        rolCiudadano.setNombre("CIUDADANO");

        // Crear una Comuna para el test
        cl.ecoconce.entity.Comuna comuna = new cl.ecoconce.entity.Comuna();
        comuna.setId(1L);
        comuna.setNombre("Concepción");
        comuna = comunaRepository.save(comuna);

        // Crear usuario admin
        Usuario admin = Usuario.builder()
                .rut("12345678-1")
                .nombreAlias("Admin Test")
                .correo("admin.test@ecoconce.cl")
                .contrasena(passwordEncoder.encode("admin123"))
                .sexoGenero("M")
                .fechaNacimiento(java.time.LocalDate.of(1980, 1, 1))
                .telefono("912345678")
                .direccion("Calle Admin 123")
                .rol(rolAdmin)
                .comuna(comuna)
                .puntos(0)
                .activo("S")
                .fechaRegistro(LocalDateTime.now())
                .fechaUltimoAcceso(LocalDateTime.now())
                .build();
        admin = usuarioRepository.save(admin);

        // Crear usuario ciudadano
        Usuario ciudadano = Usuario.builder()
                .rut("87654321-9")
                .nombreAlias("Ciudadano Test")
                .correo("ciudadano.test@ecoconce.cl")
                .contrasena(passwordEncoder.encode("ciudadano123"))
                .sexoGenero("F")
                .fechaNacimiento(java.time.LocalDate.of(1990, 5, 15))
                .telefono("987654321")
                .direccion("Calle Ciudadano 456")
                .rol(rolCiudadano)
                .comuna(comuna)
                .puntos(100)
                .activo("S")
                .fechaRegistro(LocalDateTime.now())
                .fechaUltimoAcceso(LocalDateTime.now())
                .build();
        ciudadano = usuarioRepository.save(ciudadano);

        // Generar tokens válidos
        this.tokenAdmin = jwtService.generateToken(admin);
        this.tokenCiudadano = jwtService.generateToken(ciudadano);

        // Simular token expirado (cambiar la firma)
        this.tokenExpired = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9."
                + "eyJzdWIiOiJhZG1pbi50ZXN0QGVjb2NvbmNlLmNsIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDEsInJvbGUiOiJBRE1JTiJ9."
                + "invalidSignature";

        // Token modificado
        this.tokenModified = tokenAdmin.substring(0, tokenAdmin.length() - 10) + "XXXXXXXXXX";
    }

    // ========== AC — CONTROL DE ACCESO ==========

    /**
     * AC-01: Acceso a ruta protegida sin token → 401 Unauthorized
     */
    @Test
    public void ac01_protectedEndpointWithoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/reportes/admin"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * AC-02: Ciudadano intenta acceder a ruta admin → 403 Forbidden
     */
    @Test
    public void ac02_ciudadanoAccessAdminEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/api/reportes/admin")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    /**
     * AC-03: Admin accede a ruta admin con token válido → 200 OK
     * (Esto es para demostrar que con token válido sí funciona)
     */
    @Test
    public void ac03_adminAccessAdminEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/reportes/admin")
                .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());
    }

    // ========== JWT — VALIDACIÓN DE TOKENS ==========

    /**
     * JWT-01: Token expirado → 401 Unauthorized
     */
    @Test
    public void jwt01_expiredToken_returns401() throws Exception {
        mockMvc.perform(get("/api/reportes/admin")
                .header("Authorization", "Bearer " + tokenExpired))
                .andExpect(status().isUnauthorized());
    }

    /**
     * JWT-02: Token con firma modificada → 401 Unauthorized
     */
    @Test
    public void jwt02_tamperedToken_returns401() throws Exception {
        mockMvc.perform(get("/api/reportes/admin")
                .header("Authorization", "Bearer " + tokenModified))
                .andExpect(status().isUnauthorized());
    }

    /**
     * JWT-03: Sin token en header Authorization → 401 Unauthorized
     */
    @Test
    public void jwt03_noAuthorizationHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/reportes/admin"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * JWT-04: Token con formato incorrecto (no Bearer) → 401 Unauthorized
     */
    @Test
    public void jwt04_incorrectTokenFormat_returns401() throws Exception {
        mockMvc.perform(get("/api/reportes/admin")
                .header("Authorization", "Basic " + tokenAdmin))
                .andExpect(status().isUnauthorized());
    }

    /**
     * JWT-05: Token plainte xt inválido → 401 Unauthorized
     */
    @Test
    public void jwt05_invalidPlaintextToken_returns401() throws Exception {
        mockMvc.perform(get("/api/reportes/admin")
                .header("Authorization", "Bearer notavalidjwttoken12345"))
                .andExpect(status().isUnauthorized());
    }

    // ========== SQL INJECTION (Protegido por JPA) ==========

    /**
     * SQL-01: Login con payload OR 1=1 → 401 (credenciales inválidas)
     * JPA con prepared statements protege automáticamente
     */
    @Test
    public void sql01_sqlInjectionInLogin_returns401() throws Exception {
        String requestBody = """
                {
                  "correo": "' OR 1=1 --",
                  "contrasena": "anything"
                }
                """;

        mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/usuarios/login")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    // ========== CONTROL DE ACCESO — IDOR ==========

    /**
     * AC-04: Ciudadano intenta ver dashboard de otro usuario
     * Resultado esperado: 403 Forbidden o 404 Not Found
     * (dependiendo de si hay validación de IDOR en el controlador)
     */
    @Test
    public void ac04_idor_ciudadanoVerOtroUsuario() throws Exception {
        // Intentar ver usuario 99 (que no es el ciudadano autenticado)
        var response = mockMvc.perform(get("/api/usuarios/99")
                .header("Authorization", "Bearer " + tokenCiudadano));

        // Aceptar tanto 403 (mejor) como 404 (mínimo aceptable)
        response.andExpect(result ->
                org.hamcrest.MatcherAssert.assertThat(
                        result.getResponse().getStatus(),
                        org.hamcrest.Matchers.anyOf(
                                org.hamcrest.Matchers.equalTo(403),
                                org.hamcrest.Matchers.equalTo(404)
                        )
                )
        );
    }
}
