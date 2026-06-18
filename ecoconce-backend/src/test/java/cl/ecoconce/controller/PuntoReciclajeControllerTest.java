package cl.ecoconce.controller;

import cl.ecoconce.dto.PuntoEstadoRequest;
import cl.ecoconce.dto.PuntoMaterialRequest;
import cl.ecoconce.dto.PuntoMaterialUpdateRequest;
import cl.ecoconce.dto.PuntoReciclajeDto;
import cl.ecoconce.dto.PuntoReciclajeRequest;
import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.EstadoPunto;
import cl.ecoconce.entity.Material;
import cl.ecoconce.entity.PuntoMaterial;
import cl.ecoconce.entity.PuntoReciclaje;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.EstadoPuntoRepository;
import cl.ecoconce.repository.MaterialRepository;
import cl.ecoconce.repository.PuntoMaterialRepository;
import cl.ecoconce.repository.PuntoReciclajeRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.service.MapperService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = PuntoReciclajeController.class, excludeAutoConfiguration = { SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class })
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class PuntoReciclajeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PuntoReciclajeRepository puntoRepository;

    @MockBean
    private PuntoMaterialRepository puntoMaterialRepository;

    @MockBean
    private MaterialRepository materialRepository;

    @MockBean
    private ComunaRepository comunaRepository;

    @MockBean
    private EstadoPuntoRepository estadoRepository;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private MapperService mapperService;

    // --- LISTADOS Y BÚSQUEDAS ---

    @Test
    public void listarPuntos_ok() throws Exception {
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Verde", "Desc", 1L, "Concepcion", "Calle 1", -36.8, -73.0,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findAll()).thenReturn(List.of(punto));
        when(mapperService.toPunto(punto)).thenReturn(dto);

        mockMvc.perform(get("/api/puntos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].nombre").value("Punto Verde"));
    }

    @Test
    public void listarPorMantenedor_ok() throws Exception {
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Verde", "Desc", 1L, "Concepcion", "Calle 1", -36.8, -73.0,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findByMantenedorId(2L)).thenReturn(List.of(punto));
        when(mapperService.toPunto(punto)).thenReturn(dto);

        mockMvc.perform(get("/api/puntos/mantenedor/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].mantenedorId").value(2L));
    }

    @Test
    public void buscarPunto_ok() throws Exception {
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Verde", "Desc", 1L, "Concepcion", "Calle 1", -36.8, -73.0,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(mapperService.toPunto(punto)).thenReturn(dto);

        mockMvc.perform(get("/api/puntos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    public void buscarPunto_noEncontrado() throws Exception {
        when(puntoRepository.findById(9999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/puntos/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Punto de reciclaje no encontrado")));
    }

    // --- CREACIÓN Y EDICIÓN ADMIN ---

    @Test
    public void crearPuntoAdmin_ok() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                List.of(new PuntoMaterialRequest(3L, 100, 10))
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        EstadoPunto estado = new EstadoPunto(1L, "OPERATIVO");
        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        Material material = new Material(3L, "Plástico", "PLA", "Desc");
        PuntoReciclaje puntoGuardado = new PuntoReciclaje();
        puntoGuardado.setId(1L);

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Centro", "Descripcion", 1L, "Concepcion", "Calle 1", -36.82, -73.05,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(comunaRepository.findById(1L)).thenReturn(Optional.of(comuna));
        when(estadoRepository.findById(1L)).thenReturn(Optional.of(estado));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(mantenedor));
        when(materialRepository.findById(3L)).thenReturn(Optional.of(material));
        when(puntoRepository.save(any(PuntoReciclaje.class))).thenReturn(puntoGuardado);
        when(mapperService.toPunto(any(PuntoReciclaje.class))).thenReturn(dto);

        mockMvc.perform(post("/api/puntos/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Punto Centro"));
    }

    @Test
    public void crearPunto_sinMateriales() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                Collections.emptyList()
        );

        mockMvc.perform(post("/api/puntos/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void crearPunto_materialesDuplicados() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                List.of(new PuntoMaterialRequest(3L, 100, 10), new PuntoMaterialRequest(3L, 50, 5)) // Duplicado ID 3
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        EstadoPunto estado = new EstadoPunto(1L, "OPERATIVO");
        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        PuntoReciclaje puntoGuardado = new PuntoReciclaje();
        puntoGuardado.setId(1L);

        when(comunaRepository.findById(1L)).thenReturn(Optional.of(comuna));
        when(estadoRepository.findById(1L)).thenReturn(Optional.of(estado));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(mantenedor));
        when(puntoRepository.save(any(PuntoReciclaje.class))).thenReturn(puntoGuardado);
        // FIX: el controlador busca el material en el repositorio (dentro del bucle) antes de poder
        // detectar el duplicado. Sin este stub, findById devuelve vacio y responde 404 en vez de 400.
        when(materialRepository.findById(3L)).thenReturn(Optional.of(new Material(3L, "Plástico", "PLA", "Desc")));

        mockMvc.perform(post("/api/puntos/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("No se puede repetir el mismo material en un punto")));
    }

    @Test
    public void crearPunto_mantenedorNoTieneRolAdecuado() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                List.of(new PuntoMaterialRequest(3L, 100, 10))
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        EstadoPunto estado = new EstadoPunto(1L, "OPERATIVO");
        Rol rol = new Rol(2L, "CIUDADANO"); // Rol incorrecto
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();

        when(comunaRepository.findById(1L)).thenReturn(Optional.of(comuna));
        when(estadoRepository.findById(1L)).thenReturn(Optional.of(estado));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(mantenedor));

        mockMvc.perform(post("/api/puntos/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("El usuario asignado no tiene rol de mantenedor")));
    }

    @Test
    public void crearPunto_mantenedorInactivo() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                List.of(new PuntoMaterialRequest(3L, 100, 10))
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        EstadoPunto estado = new EstadoPunto(1L, "OPERATIVO");
        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("N").rol(rol).build(); // Inactivo

        when(comunaRepository.findById(1L)).thenReturn(Optional.of(comuna));
        when(estadoRepository.findById(1L)).thenReturn(Optional.of(estado));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(mantenedor));

        mockMvc.perform(post("/api/puntos/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("El mantenedor asignado no está activo")));
    }

    @Test
    public void crearPunto_actualCompactadoSuperaCapacidad() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                List.of(new PuntoMaterialRequest(3L, 50, 60)) // actual 60 > capacidad 50
        );

        Comuna comuna = new Comuna(1L, "Concepcion", null);
        EstadoPunto estado = new EstadoPunto(1L, "OPERATIVO");
        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        PuntoReciclaje puntoGuardado = new PuntoReciclaje();
        puntoGuardado.setId(1L);

        when(comunaRepository.findById(1L)).thenReturn(Optional.of(comuna));
        when(estadoRepository.findById(1L)).thenReturn(Optional.of(estado));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(mantenedor));
        when(puntoRepository.save(any(PuntoReciclaje.class))).thenReturn(puntoGuardado);
        // FIX: la validacion de capacidad se evalua despues de buscar el material en el repositorio.
        // Sin este stub, findById devuelve vacio y responde 404 en vez de 400.
        when(materialRepository.findById(3L)).thenReturn(Optional.of(new Material(3L, "Plástico", "PLA", "Desc")));

        mockMvc.perform(post("/api/puntos/admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("La cantidad actual no puede superar la capacidad compactada")));
    }

    @Test
    public void actualizarPuntoAdmin_noEncontrado() throws Exception {
        PuntoReciclajeRequest request = new PuntoReciclajeRequest(
                "Punto Centro", "Descripcion", 1L, "Calle 1", -36.82, -73.05, 50, 1L, 2L,
                List.of(new PuntoMaterialRequest(3L, 100, 10))
        );

        when(puntoRepository.findById(9999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/puntos/admin/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje", containsString("Punto de reciclaje no encontrado")));
    }

    // --- ACTIVAR Y DESACTIVAR ---

    @Test
    public void desactivarPuntoAdmin_ok() throws Exception {
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        EstadoPunto inactivo = new EstadoPunto(2L, "INACTIVO");

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Centro", "Descripcion", 1L, "Concepcion", "Calle 1", -36.82, -73.05,
                50, 2L, "INACTIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(estadoRepository.findByNombreIgnoreCase("INACTIVO")).thenReturn(Optional.of(inactivo));
        when(puntoRepository.save(any(PuntoReciclaje.class))).thenReturn(punto);
        when(mapperService.toPunto(any(PuntoReciclaje.class))).thenReturn(dto);

        mockMvc.perform(put("/api/puntos/admin/1/desactivar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("INACTIVO"));
    }

    @Test
    public void activarPuntoAdmin_ok() throws Exception {
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        EstadoPunto operativo = new EstadoPunto(1L, "OPERATIVO");

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Centro", "Descripcion", 1L, "Concepcion", "Calle 1", -36.82, -73.05,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(estadoRepository.findByNombreIgnoreCase("OPERATIVO")).thenReturn(Optional.of(operativo));
        when(puntoRepository.save(any(PuntoReciclaje.class))).thenReturn(punto);
        when(mapperService.toPunto(any(PuntoReciclaje.class))).thenReturn(dto);

        mockMvc.perform(put("/api/puntos/admin/1/activar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("OPERATIVO"));
    }

    // --- ACTUALIZACIÓN MANTENEDOR ---

    @Test
    public void actualizarEstadoMantenedor_ok() throws Exception {
        PuntoEstadoRequest request = new PuntoEstadoRequest(1L, "Cambio de estado");
        
        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);
        
        EstadoPunto operativo = new EstadoPunto(1L, "OPERATIVO");

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Centro", "Descripcion", 1L, "Concepcion", "Calle 1", -36.82, -73.05,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(estadoRepository.findById(1L)).thenReturn(Optional.of(operativo));
        when(puntoRepository.save(any(PuntoReciclaje.class))).thenReturn(punto);
        when(mapperService.toPunto(any(PuntoReciclaje.class))).thenReturn(dto);

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("OPERATIVO"));
    }

    @Test
    public void actualizarEstadoMantenedor_noPerteneceAlMantenedor() throws Exception {
        PuntoEstadoRequest request = new PuntoEstadoRequest(1L, "Cambio de estado");
        
        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedorAsignado = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedorAsignado); // Asignado a ID 2, pero solicitamos con ID 3
        
        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));

        mockMvc.perform(put("/api/puntos/mantenedor/3/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("No puedes modificar un punto asignado a otro mantenedor")));
    }

    @Test
    public void actualizarMaterialesMantenedor_ok() throws Exception {
        List<PuntoMaterialUpdateRequest> request = List.of(new PuntoMaterialUpdateRequest(3L, 100, 50));

        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);

        Material material = new Material(3L, "Plástico", "PLA", "Desc");
        PuntoMaterial pm = PuntoMaterial.builder().material(material).punto(punto).capacidadCompactado(100).actualCompactado(10).build();

        PuntoReciclajeDto dto = new PuntoReciclajeDto(
                1L, "Punto Centro", "Descripcion", 1L, "Concepcion", "Calle 1", -36.82, -73.05,
                50, 1L, "OPERATIVO", 2L, "Mantenedor", List.of("Plástico"), Collections.emptyList()
        );

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(List.of(pm));
        when(mapperService.toPunto(any(PuntoReciclaje.class))).thenReturn(dto);

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    public void actualizarMaterialesMantenedor_vacio() throws Exception {
        List<PuntoMaterialUpdateRequest> request = new ArrayList<>();

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("Debes enviar al menos un material para actualizar")));
    }

    @Test
    public void actualizarMaterialesMantenedor_sinMaterialesAsociados() throws Exception {
        List<PuntoMaterialUpdateRequest> request = List.of(new PuntoMaterialUpdateRequest(3L, 100, 50));

        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(Collections.emptyList()); // Sin materiales asociados

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("Este punto no tiene materiales asociados")));
    }

    @Test
    public void actualizarMaterialesMantenedor_repetidos() throws Exception {
        List<PuntoMaterialUpdateRequest> request = List.of(
                new PuntoMaterialUpdateRequest(3L, 100, 50),
                new PuntoMaterialUpdateRequest(3L, 80, 40) // Repetido ID 3
        );

        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);

        Material material = new Material(3L, "Plástico", "PLA", "Desc");
        PuntoMaterial pm = PuntoMaterial.builder().material(material).punto(punto).build();

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        // FIX: sin materiales actuales mockeados, el controlador lanza "Este punto no tiene materiales
        // asociados" antes de evaluar el duplicado. Se provee la lista para alcanzar la validacion.
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(List.of(pm));

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("No se puede repetir el mismo material en la actualización")));
    }

    @Test
    public void actualizarMaterialesMantenedor_materialNoAsociado() throws Exception {
        List<PuntoMaterialUpdateRequest> request = List.of(new PuntoMaterialUpdateRequest(4L, 100, 50)); // Material ID 4

        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);

        Material material = new Material(3L, "Plástico", "PLA", "Desc"); // Material ID 3
        PuntoMaterial pm = PuntoMaterial.builder().material(material).punto(punto).build();

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(List.of(pm));

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("El material no está asociado a este punto")));
    }

    @Test
    public void actualizarMaterialesMantenedor_valoresNegativos() throws Exception {
        List<PuntoMaterialUpdateRequest> request = List.of(new PuntoMaterialUpdateRequest(3L, -100, 50)); // Capacidad negativa

        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);

        Material material = new Material(3L, "Plástico", "PLA", "Desc");
        PuntoMaterial pm = PuntoMaterial.builder().material(material).punto(punto).build();

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(List.of(pm));

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("Las cantidades no pueden ser negativas")));
    }

    @Test
    public void actualizarMaterialesMantenedor_actualSuperaCapacidad() throws Exception {
        List<PuntoMaterialUpdateRequest> request = List.of(new PuntoMaterialUpdateRequest(3L, 50, 60)); // 60 > 50

        Rol rol = new Rol(2L, "MANTENEDOR");
        Usuario mantenedor = Usuario.builder().id(2L).activo("S").rol(rol).build();
        
        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setId(1L);
        punto.setMantenedor(mantenedor);

        Material material = new Material(3L, "Plástico", "PLA", "Desc");
        PuntoMaterial pm = PuntoMaterial.builder().material(material).punto(punto).build();

        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(List.of(pm));

        mockMvc.perform(put("/api/puntos/mantenedor/2/1/materiales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("La cantidad actual no puede superar la capacidad compactada")));
    }
}
