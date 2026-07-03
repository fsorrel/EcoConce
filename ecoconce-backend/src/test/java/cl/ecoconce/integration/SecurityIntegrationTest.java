package cl.ecoconce.integration;

import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Region;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.RegionRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
    private RegionRepository regionRepository;

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
        // Reutilizamos los datos sembrados por DataSeeder (rol ADMIN, rol USUARIO,
        // y una Comuna válida con su Región). Si no existieran, se crean con datos
        // mínimos válidos. La creación de usuarios es idempotente (findByCorreo) para
        // no chocar con datos previos cuando el contexto/BD H2 se comparte entre tests.
        Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("ADMIN").build()));

        Rol rolCiudadano = rolRepository.findByNombre("USUARIO")
                .orElseGet(() -> rolRepository.save(Rol.builder().nombre("USUARIO").build()));

        Comuna comuna = comunaRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Region region = regionRepository.findAll().stream().findFirst()
                            .orElseGet(() -> regionRepository.save(Region.builder().nombre("Biobío").build()));
                    return comunaRepository.save(Comuna.builder()
                            .nombre("Concepción")
                            .region(region)
                            .build());
                });

        Usuario admin = usuarioRepository.findByCorreo("admin.security@ecoconce.cl")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .rut("90000001-1")
                        .nombreAlias("Admin Security Test")
                        .correo("admin.security@ecoconce.cl")
                        .contrasena(passwordEncoder.encode("admin123"))
                        .sexoGenero("M")
                        .fechaNacimiento(LocalDate.of(1980, 1, 1))
                        .telefono("912345678")
                        .direccion("Calle Admin 123")
                        .rol(rolAdmin)
                        .comuna(comuna)
                        .puntos(0)
                        .activo("S")
                        .fechaRegistro(LocalDateTime.now())
                        .fechaUltimoAcceso(LocalDateTime.now())
                        .build()));

        Usuario ciudadano = usuarioRepository.findByCorreo("ciudadano.security@ecoconce.cl")
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .rut("90000002-2")
                        .nombreAlias("Ciudadano Security Test")
                        .correo("ciudadano.security@ecoconce.cl")
                        .contrasena(passwordEncoder.encode("ciudadano123"))
                        .sexoGenero("F")
                        .fechaNacimiento(LocalDate.of(1990, 5, 15))
                        .telefono("987654321")
                        .direccion("Calle Ciudadano 456")
                        .rol(rolCiudadano)
                        .comuna(comuna)
                        .puntos(100)
                        .activo("S")
                        .fechaRegistro(LocalDateTime.now())
                        .fechaUltimoAcceso(LocalDateTime.now())
                        .build()));

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

    /**
     * /api/usuarios/me con token devuelve SOLO los datos del usuario autenticado.
     */
    @Test
    public void me_conToken_devuelveUsuarioAutenticado() throws Exception {
        mockMvc.perform(get("/api/usuarios/me")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("ciudadano.security@ecoconce.cl"));
    }

    /**
     * /api/usuarios/me sin token → 401 (no expone datos de nadie).
     */
    @Test
    public void me_sinToken_returns401() throws Exception {
        mockMvc.perform(get("/api/usuarios/me"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * @PreAuthorize a nivel de método: ciudadano en endpoint solo-ADMIN → 403 (no 500).
     */
    @Test
    public void preAuthorize_ciudadanoEnEndpointAdmin_returns403() throws Exception {
        mockMvc.perform(get("/api/formularios/admin/todos")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    @Test
    public void estados_ciudadano_returns403() throws Exception {
        mockMvc.perform(get("/api/puntos/estados")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    /**
     * IDOR: ciudadano pide formularios de otro usuario → 403.
     */
    @Test
    public void idor_formulariosDeOtroUsuario_returns403() throws Exception {
        mockMvc.perform(get("/api/formularios/usuario/999999")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    /**
     * Datos de referencia públicos (sin token) → 200, para el formulario de registro.
     */
    @Test
    public void regiones_publicas_returns200() throws Exception {
        mockMvc.perform(get("/api/usuarios/regiones"))
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
     * SQL-01: Login con payload OR 1=1 → no autentica.
     * JPA con prepared statements protege automáticamente y, además, la validación
     * @Email del LoginRequest rechaza el payload. Por eso el resultado aceptable es
     * 400 (Bad Request, validación) o 401 (Unauthorized, credenciales inválidas):
     * en ningún caso se emite token. Coincide con lo documentado en 02_Pruebas_Seguridad.
     */
    @Test
    public void sql01_sqlInjectionInLogin_noAutentica() throws Exception {
        String requestBody = """
                {
                  "correo": "' OR 1=1 --",
                  "contrasena": "anything"
                }
                """;

        var response = mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/usuarios/login")
                        .contentType("application/json")
                        .content(requestBody));

        response.andExpect(result ->
                org.hamcrest.MatcherAssert.assertThat(
                        result.getResponse().getStatus(),
                        org.hamcrest.Matchers.anyOf(
                                org.hamcrest.Matchers.equalTo(400),
                                org.hamcrest.Matchers.equalTo(401)
                        )
                )
        );
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

    // ========== CONTROL DE ACCESO — FUNCIONES ADMINISTRATIVAS (RF15) ==========

    /**
     * PA-03: Ciudadano intenta aprobar un formulario (función solo-ADMIN) → 403.
     * @PreAuthorize se evalúa antes del cuerpo, por lo que responde 403 aun si el id no existe.
     */
    @Test
    public void pa03_ciudadanoApruebaFormulario_returns403() throws Exception {
        mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/formularios/1/aprobar")
                        .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    /**
     * PA-04: Ciudadano intenta rechazar un formulario (función solo-ADMIN) → 403.
     */
    @Test
    public void pa04_ciudadanoRechazaFormulario_returns403() throws Exception {
        mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/formularios/1/rechazar")
                        .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    // ========== CONTROL DE ACCESO — IDOR (recursos de otros usuarios) ==========

    /**
     * IDOR-02: Ciudadano intenta canjear un premio con los ecopuntos de OTRO usuario → 403.
     * Sin esta protección, cualquiera podría gastar los puntos ajenos pasando su id por query.
     */
    @Test
    public void idor02_ciudadanoCanjeaConPuntosDeOtro_returns403() throws Exception {
        mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/premios/1/canjear")
                        .param("usuarioId", "999999")
                        .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    /**
     * IDOR-03: Ciudadano intenta ver el dashboard (puntos, actividad, medallas) de otro → 403.
     */
    @Test
    public void idor03_ciudadanoVeDashboardDeOtro_returns403() throws Exception {
        mockMvc.perform(get("/api/dashboard/999999")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    /**
     * IDOR-04: Listado completo de usuarios (expone correos, PII) es solo-ADMIN → 403 para ciudadano.
     */
    @Test
    public void idor04_ciudadanoListaTodosLosUsuarios_returns403() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                .header("Authorization", "Bearer " + tokenCiudadano))
                .andExpect(status().isForbidden());
    }

    // ========== ESCALADA DE PRIVILEGIOS EN EL REGISTRO ==========

    /**
     * PRIV-01: El auto-registro (público) intenta crear un ADMIN enviando rolId=2.
     * El sistema DEBE ignorar el rol solicitado y crear siempre un ciudadano (rol "USUARIO").
     */
    @Test
    public void priv01_registroConRolAdmin_creaCiudadano() throws Exception {
        String cuerpo = """
                {
                  "rut": "77777777-7",
                  "nombreAlias": "Intruso",
                  "correo": "intruso.priv@ecoconce.cl",
                  "contrasena": "password123",
                  "sexoGenero": "M",
                  "comunaId": %d,
                  "rolId": 2,
                  "consentimientoGeneral": true,
                  "consentimientoSexoGenero": true
                }
                """.formatted(comunaRepository.findAll().get(0).getId());

        mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/usuarios")
                        .contentType("application/json")
                        .content(cuerpo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("USUARIO"));
    }
}
