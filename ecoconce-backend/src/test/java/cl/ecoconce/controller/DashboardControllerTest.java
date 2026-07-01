package cl.ecoconce.controller;

import cl.ecoconce.dto.DashboardDto;
import cl.ecoconce.dto.ResumenReciclajeDto;
import cl.ecoconce.dto.UsuarioResumenDto;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.security.JwtService;
import cl.ecoconce.service.DashboardService;
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

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = DashboardController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
class DashboardControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean DashboardService dashboardService;
    // JwtAuthenticationFilter (bean Filter) entra en el slice de @WebMvcTest y requiere JwtService
    @MockBean JwtService jwtService;

    private DashboardDto dashboardDummy() {
        UsuarioResumenDto usuario = new UsuarioResumenDto(1L, "EcoCiudadano", "eco@test.cl", 500, "CIUDADANO");
        ResumenReciclajeDto resumen = new ResumenReciclajeDto(10, 500, 2, 1);
        return new DashboardDto(usuario, resumen, List.of(), List.of(), List.of(), List.of(), List.of());
    }

    @Test
    void obtenerDashboard_devuelveDto() throws Exception {
        when(dashboardService.obtenerDashboard(1L)).thenReturn(dashboardDummy());

        mockMvc.perform(get("/api/dashboard/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.nombreAlias").value("EcoCiudadano"))
                .andExpect(jsonPath("$.resumen.puntosGanados").value(500));
    }

    @Test
    void obtenerDashboard_usuarioInexistente_devuelve404() throws Exception {
        when(dashboardService.obtenerDashboard(999L))
                .thenThrow(new RecursoNoEncontradoException("Usuario no encontrado"));

        mockMvc.perform(get("/api/dashboard/999").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
