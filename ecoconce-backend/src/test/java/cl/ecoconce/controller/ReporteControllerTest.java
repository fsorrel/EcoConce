package cl.ecoconce.controller;

import cl.ecoconce.dto.ReporteRequest;
import cl.ecoconce.dto.ReporteResponse;
import cl.ecoconce.dto.TipoReporteDto;
import cl.ecoconce.security.JwtService;
import cl.ecoconce.service.ReporteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = ReporteController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
class ReporteControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean ReporteService reporteService;
    // JwtAuthenticationFilter (bean Filter) entra en el slice de @WebMvcTest y requiere JwtService
    @MockBean JwtService jwtService;

    @Test
    void crearReporte_ok() throws Exception {
        ReporteResponse response = new ReporteResponse(
                1L, 2L, "Ciudadano", 3L, "Punto Centro", null, null, 1L, "Punto lleno", "Descripción", LocalDateTime.now());
        when(reporteService.crear(any())).thenReturn(response);

        ReporteRequest request = new ReporteRequest(2L, 3L, 1L, "Descripción");

        mockMvc.perform(post("/api/reportes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void listarTipos_devuelveLista() throws Exception {
        when(reporteService.listarTipos()).thenReturn(List.of(
                new TipoReporteDto(1L, "Punto lleno"),
                new TipoReporteDto(2L, "Punto dañado")));

        mockMvc.perform(get("/api/reportes/tipos").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("Punto lleno"));
    }

    @Test
    void listarAdmin_devuelveLista() throws Exception {
        when(reporteService.listarAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/api/reportes/admin").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void listarMantenedor_devuelveReportesDelMantenedor() throws Exception {
        ReporteResponse r = new ReporteResponse(
                1L, 5L, "Ciudadano", 2L, "Punto Sur", null, null, 1L, "Punto colapsado", "Descripción", LocalDateTime.now());
        when(reporteService.listarMantenedor(5L)).thenReturn(List.of(r));

        mockMvc.perform(get("/api/reportes/mantenedor/5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].punto").value("Punto Sur"));
    }
}
