package cl.ecoconce.controller;

import cl.ecoconce.dto.FormularioMaterialRequest;
import cl.ecoconce.dto.FormularioRequest;
import cl.ecoconce.dto.FormularioResponse;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.DetalleFormularioMaterialRepository;
import cl.ecoconce.repository.FormularioReciclajeRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.security.JwtService;
import cl.ecoconce.service.FormularioReciclajeService;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = FormularioReciclajeController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
class FormularioReciclajeControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean FormularioReciclajeService formularioService;
    @MockBean FormularioReciclajeRepository formularioRepository;
    @MockBean DetalleFormularioMaterialRepository detalleRepository;
    @MockBean UsuarioRepository usuarioRepository;
    // JwtAuthenticationFilter (bean Filter) entra en el slice de @WebMvcTest y requiere JwtService
    @MockBean JwtService jwtService;

    private FormularioRequest requestValido() {
        return new FormularioRequest(
                1L, 10.5, null,
                List.of(new FormularioMaterialRequest(1L, 1, "UNIDAD", null)));
    }

    @Test
    void crearFormulario_ok() throws Exception {
        FormularioResponse response = new FormularioResponse(
                1L, 1L, "Punto Centro", 10.5, 50, "PENDIENTE", LocalDateTime.now());
        when(formularioService.crear(anyLong(), any())).thenReturn(response);

        mockMvc.perform(post("/api/formularios/usuario/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.totalPuntosObtenidos").value(50));
    }

    @Test
    void crearFormulario_duplicadoPendiente_devuelve400() throws Exception {
        when(formularioService.crear(anyLong(), any()))
                .thenThrow(new ReglaNegocioException("Ya tienes un formulario pendiente para este punto"));

        // ApiExceptionHandler mapea ReglaNegocioException → 400 Bad Request
        mockMvc.perform(post("/api/formularios/usuario/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestValido())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aprobarFormulario_ok() throws Exception {
        FormularioResponse response = new FormularioResponse(
                1L, 1L, "Punto Centro", 10.5, 50, "APROBADO", LocalDateTime.now());
        when(formularioService.aprobar(1L)).thenReturn(response);

        mockMvc.perform(put("/api/formularios/1/aprobar").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADO"));
    }

    @Test
    void rechazarFormulario_ok() throws Exception {
        FormularioResponse response = new FormularioResponse(
                1L, 1L, "Punto Centro", 10.5, 0, "RECHAZADO", LocalDateTime.now());
        when(formularioService.rechazar(eq(1L), anyString())).thenReturn(response);

        mockMvc.perform(put("/api/formularios/1/rechazar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"observacion\":\"Sin materiales\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECHAZADO"));
    }

    @Test
    void listarTodos_admin_ok() throws Exception {
        when(formularioRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/formularios/admin/todos").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}
