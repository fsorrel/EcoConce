package cl.ecoconce.controller;

import cl.ecoconce.dto.CanjeAdminDto;
import cl.ecoconce.dto.CanjeEstadoRequest;
import cl.ecoconce.dto.CanjeResponse;
import cl.ecoconce.dto.PremioAdminRequest;
import cl.ecoconce.dto.PremioDto;
import cl.ecoconce.entity.Premio;
import cl.ecoconce.repository.PremioRepository;
import cl.ecoconce.service.CanjeService;
import cl.ecoconce.service.MapperService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import cl.ecoconce.security.JwtService;
import cl.ecoconce.security.UserDetailsServiceImpl;
import cl.ecoconce.security.JwtAuthenticationFilter;

@WebMvcTest(PremioController.class)
@Import(JwtAuthenticationFilter.class)
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
public class PremioControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PremioRepository premioRepository;

    @MockBean
    private MapperService mapperService;

    @MockBean
    private CanjeService canjeService;

    // --- LISTADOS PÚBLICOS ---

    @Test
    public void listarPremios_soloActivos() throws Exception {
        Premio premio = Premio.builder()
                .id(1L)
                .nombre("Termo Ecológico")
                .descripcion("Mantiene la temperatura")
                .costoPuntos(500)
                .stock(10)
                .activo("S")
                .envioDomicilio("N")
                .build();

        PremioDto dto = new PremioDto(1L, "Termo Ecológico", "Mantiene la temperatura", 500, 10, "S", "N");

        when(premioRepository.findByActivo("S")).thenReturn(List.of(premio));
        when(mapperService.toPremio(premio)).thenReturn(dto);

        mockMvc.perform(get("/api/premios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].nombre").value("Termo Ecológico"))
                .andExpect(jsonPath("$[0].activo").value("S"));
    }

    // --- LISTADOS Y CANJES ADMIN ---

    @Test
    public void listarAdmin_ok() throws Exception {
        Premio premio1 = Premio.builder().id(1L).nombre("Premio A").costoPuntos(100).stock(5).activo("S").build();
        Premio premio2 = Premio.builder().id(2L).nombre("Premio B").costoPuntos(200).stock(2).activo("N").build();

        PremioDto dto1 = new PremioDto(1L, "Premio A", "Desc", 100, 5, "S", "N");
        PremioDto dto2 = new PremioDto(2L, "Premio B", "Desc", 200, 2, "N", "N");

        when(premioRepository.findAll()).thenReturn(List.of(premio2, premio1)); // Devuelve desordenado para probar la ordenación en el controller
        when(mapperService.toPremio(premio1)).thenReturn(dto1);
        when(mapperService.toPremio(premio2)).thenReturn(dto2);

        mockMvc.perform(get("/api/premios/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[1].id").value(2L));
    }

    @Test
    public void listarCanjesAdmin_ok() throws Exception {
        CanjeAdminDto canjeDto = new CanjeAdminDto(
                1L, 2L, "Usuario", "correo@test.com", 3L, "Premio", 100, "COD", "PENDIENTE",
                "N", null, "Ninguna", LocalDateTime.now(), null
        );

        when(canjeService.listarCanjesAdmin()).thenReturn(List.of(canjeDto));

        mockMvc.perform(get("/api/premios/admin/canjes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    public void listarCanjesPendientesAdmin_ok() throws Exception {
        CanjeAdminDto canjeDto = new CanjeAdminDto(
                1L, 2L, "Usuario", "correo@test.com", 3L, "Premio", 100, "COD", "PENDIENTE",
                "N", null, "Ninguna", LocalDateTime.now(), null
        );

        when(canjeService.listarCanjesPendientesAdmin()).thenReturn(List.of(canjeDto));

        mockMvc.perform(get("/api/premios/admin/canjes/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));
    }

    @Test
    public void actualizarEstadoCanjeAdmin_ok() throws Exception {
        CanjeEstadoRequest request = new CanjeEstadoRequest("ENTREGADO", "Entregado en mano");
        CanjeAdminDto responseDto = new CanjeAdminDto(
                1L, 2L, "Usuario", "correo@test.com", 3L, "Premio", 100, "COD", "ENTREGADO",
                "N", null, "Entregado en mano", LocalDateTime.now(), LocalDateTime.now()
        );

        when(canjeService.actualizarEstadoAdmin(eq(1L), any(CanjeEstadoRequest.class))).thenReturn(responseDto);

        mockMvc.perform(put("/api/premios/admin/canjes/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ENTREGADO"))
                .andExpect(jsonPath("$.observacion").value("Entregado en mano"));
    }

    // --- CREACIÓN Y ACTUALIZACIÓN ADMIN ---

    @Test
    public void crearPremioAdmin_ok() throws Exception {
        PremioAdminRequest request = new PremioAdminRequest("Eco Bolsa", "Bolsa de tela", 150, 100, "S", "S");
        Premio premioGuardado = Premio.builder().id(1L).nombre("Eco Bolsa").descripcion("Bolsa de tela").costoPuntos(150).stock(100).activo("S").envioDomicilio("S").build();
        PremioDto dto = new PremioDto(1L, "Eco Bolsa", "Bolsa de tela", 150, 100, "S", "S");

        when(premioRepository.save(any(Premio.class))).thenReturn(premioGuardado);
        when(mapperService.toPremio(any(Premio.class))).thenReturn(dto);

        mockMvc.perform(post("/api/premios/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Eco Bolsa"))
                .andExpect(jsonPath("$.activo").value("S"))
                .andExpect(jsonPath("$.envioDomicilio").value("S"));
    }

    @Test
    public void crearPremioAdmin_conValoresPorDefecto() throws Exception {
        // Enviar activo y envioDomicilio nulos o vacíos para comprobar defaults en controller
        PremioAdminRequest request = new PremioAdminRequest("Eco Bolsa", "Bolsa de tela", 150, 100, "", null);
        Premio premioGuardado = Premio.builder().id(1L).nombre("Eco Bolsa").descripcion("Bolsa de tela").costoPuntos(150).stock(100).activo("S").envioDomicilio("N").build();
        PremioDto dto = new PremioDto(1L, "Eco Bolsa", "Bolsa de tela", 150, 100, "S", "N");

        when(premioRepository.save(any(Premio.class))).thenReturn(premioGuardado);
        when(mapperService.toPremio(any(Premio.class))).thenReturn(dto);

        mockMvc.perform(post("/api/premios/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value("S"))
                .andExpect(jsonPath("$.envioDomicilio").value("N"));
    }

    @Test
    public void crearPremio_activoInvalido() throws Exception {
        PremioAdminRequest request = new PremioAdminRequest(
                "Termo Ecológico", "Mantiene la temperatura", 500, 10, "X", "N"
        );

        mockMvc.perform(post("/api/premios/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("El valor debe ser S o N")));
    }

    @Test
    public void actualizarPremioAdmin_ok() throws Exception {
        PremioAdminRequest request = new PremioAdminRequest("Eco Bolsa Mod", "Bolsa de tela mod", 180, 80, "N", "N");
        Premio premioExistente = Premio.builder().id(1L).nombre("Eco Bolsa").descripcion("Bolsa").costoPuntos(150).stock(100).activo("S").envioDomicilio("S").build();
        PremioDto dto = new PremioDto(1L, "Eco Bolsa Mod", "Bolsa de tela mod", 180, 80, "N", "N");

        when(premioRepository.findById(1L)).thenReturn(Optional.of(premioExistente));
        when(premioRepository.save(any(Premio.class))).thenReturn(premioExistente);
        when(mapperService.toPremio(any(Premio.class))).thenReturn(dto);

        mockMvc.perform(put("/api/premios/admin/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Eco Bolsa Mod"))
                .andExpect(jsonPath("$.activo").value("N"));
    }

    @Test
    public void actualizarPremioAdmin_noEncontrado() throws Exception {
        PremioAdminRequest request = new PremioAdminRequest("Eco Bolsa", "Desc", 150, 100, "S", "N");

        when(premioRepository.findById(9999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/premios/admin/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Premio no encontrado")));
    }

    // --- ACTIVAR Y DESACTIVAR ---

    @Test
    public void activarPremioAdmin_ok() throws Exception {
        Premio premio = Premio.builder().id(1L).nombre("Premio").activo("N").build();
        PremioDto dto = new PremioDto(1L, "Premio", "Desc", 100, 10, "S", "N");

        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio));
        when(premioRepository.save(any(Premio.class))).thenReturn(premio);
        when(mapperService.toPremio(any(Premio.class))).thenReturn(dto);

        mockMvc.perform(put("/api/premios/admin/1/activar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value("S"));
    }

    @Test
    public void desactivarPremioAdmin_ok() throws Exception {
        Premio premio = Premio.builder().id(1L).nombre("Premio").activo("S").build();
        PremioDto dto = new PremioDto(1L, "Premio", "Desc", 100, 10, "N", "N");

        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio));
        when(premioRepository.save(any(Premio.class))).thenReturn(premio);
        when(mapperService.toPremio(any(Premio.class))).thenReturn(dto);

        mockMvc.perform(put("/api/premios/admin/1/desactivar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value("N"));
    }

    // --- CANJES ---

    @Test
    public void canjear_ok() throws Exception {
        CanjeResponse canjeResponse = new CanjeResponse(
                1L, 1L, "Termo Ecológico", 500, "CANJE-12345", "COMPLETADO", "N", null, 1500, LocalDateTime.now()
        );

        when(canjeService.canjear(1L, 1L)).thenReturn(canjeResponse);

        mockMvc.perform(post("/api/premios/1/canjear")
                        .param("usuarioId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.premio").value("Termo Ecológico"))
                .andExpect(jsonPath("$.puntosGastados").value(500));
    }
}
