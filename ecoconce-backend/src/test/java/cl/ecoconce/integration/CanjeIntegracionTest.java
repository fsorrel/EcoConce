package cl.ecoconce.integration;

import cl.ecoconce.entity.Premio;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.PremioRepository;
import cl.ecoconce.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Prueba de integración del flujo completo de canje (doc 03, sección 3):
 * login real -> obtención de token JWT -> canje con el token -> verificación de stock.
 *
 * Usa los datos sembrados por DataSeeder sobre H2 (perfil "test").
 * @Transactional para que los cambios se reviertan y no contaminen otros tests.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CanjeIntegracionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PremioRepository premioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Flujo completo: login -> canje -> el stock disminuye")
    void flujoCompleto_loginYCanje_stockDisminuye() throws Exception {
        // 1. Login con un usuario sembrado (jordan@ecoconce.cl / 1234)
        String loginBody = """
                { "correo": "jordan@ecoconce.cl", "contrasena": "1234" }
                """;

        MvcResult loginResult = mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();
        assertThat(token).isNotBlank();

        Usuario jordan = usuarioRepository.findByCorreo("jordan@ecoconce.cl").orElseThrow();
        // Capturamos los valores ANTES del canje: jordan/premio son entidades gestionadas
        // y el canje (misma transacción) modifica sus instancias en memoria.
        int puntosIniciales = jordan.getPuntos();
        Long jordanId = jordan.getId();

        // 2. Elegir un premio canjeable: sin envío a domicilio, con stock y costo <= puntos del usuario
        Premio premio = premioRepository.findAll().stream()
                .filter(p -> "N".equalsIgnoreCase(p.getEnvioDomicilio())
                        && p.getStock() > 0
                        && p.getCostoPuntos() <= puntosIniciales)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay premio canjeable sembrado para el test"));

        Long premioId = premio.getId();
        int stockInicial = premio.getStock();
        int costo = premio.getCostoPuntos();

        // 3. Canjear con el token JWT
        mockMvc.perform(post("/api/premios/" + premioId + "/canjear")
                        .param("usuarioId", String.valueOf(jordanId))
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoCanje").exists())
                .andExpect(jsonPath("$.puntosRestantes").value(puntosIniciales - costo));

        // 4. Verificar que el stock disminuyó en 1
        Premio actualizado = premioRepository.findById(premioId).orElseThrow();
        assertThat(actualizado.getStock()).isEqualTo(stockInicial - 1);
    }

    @Test
    @DisplayName("Canjear sin token JWT devuelve 401")
    void canjearSinToken_devuelve401() throws Exception {
        Premio premio = premioRepository.findAll().stream()
                .findFirst()
                .orElseThrow();

        mockMvc.perform(post("/api/premios/" + premio.getId() + "/canjear")
                        .param("usuarioId", "1"))
                .andExpect(status().isUnauthorized());
    }
}
