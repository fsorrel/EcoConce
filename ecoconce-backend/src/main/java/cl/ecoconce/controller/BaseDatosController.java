package cl.ecoconce.controller;

import cl.ecoconce.entity.*;
import cl.ecoconce.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@Transactional(readOnly = true)
@RequestMapping("/api/bd")
public class BaseDatosController {
    private final ComunaRepository comunaRepository;
    private final DetalleFormularioMaterialRepository detalleFormularioMaterialRepository;
    private final EstadoPuntoRepository estadoPuntoRepository;
    private final FormularioReciclajeRepository formularioReciclajeRepository;
    private final GuiaReciclajeRepository guiaReciclajeRepository;
    private final HistorialEstadoPuntoRepository historialEstadoPuntoRepository;
    private final HistorialPremioCanjeadoRepository historialPremioCanjeadoRepository;
    private final HistorialRecoleccionPuntoRepository historialRecoleccionPuntoRepository;
    private final MaterialRepository materialRepository;
    private final MovimientoPuntosUsuarioRepository movimientoPuntosUsuarioRepository;
    private final PremioRepository premioRepository;
    private final PuntoMaterialRepository puntoMaterialRepository;
    private final PuntoReciclajeRepository puntoReciclajeRepository;
    private final RegionRepository regionRepository;
    private final ReportePuntoRepository reportePuntoRepository;
    private final RolRepository rolRepository;
    private final TipoReporteRepository tipoReporteRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/comunas")
    public List<Map<String, Object>> comunas() {
        return comunaRepository.findAll().stream().map(this::mapComuna).toList();
    }

    @GetMapping("/detalle-formulario-materiales")
    public List<Map<String, Object>> detalleFormularioMateriales() {
        return detalleFormularioMaterialRepository.findAll().stream().map(this::mapDetalleFormularioMaterial).toList();
    }

    @GetMapping("/estado-punto")
    public List<Map<String, Object>> estadoPunto() {
        return estadoPuntoRepository.findAll().stream().map(this::mapEstadoPunto).toList();
    }

    @GetMapping("/formularios-reciclaje")
    public List<Map<String, Object>> formulariosReciclaje() {
        return formularioReciclajeRepository.findAll().stream().map(this::mapFormularioReciclaje).toList();
    }

    @GetMapping("/guias-reciclaje")
    public List<Map<String, Object>> guiasReciclaje() {
        return guiaReciclajeRepository.findAll().stream().map(this::mapGuiaReciclaje).toList();
    }

    @GetMapping("/historial-estado-puntos")
    public List<Map<String, Object>> historialEstadoPuntos() {
        return historialEstadoPuntoRepository.findAll().stream().map(this::mapHistorialEstadoPunto).toList();
    }

    @GetMapping("/historial-premios-canjeados")
    public List<Map<String, Object>> historialPremiosCanjeados() {
        return historialPremioCanjeadoRepository.findAll().stream().map(this::mapHistorialPremioCanjeado).toList();
    }

    @GetMapping("/historial-recolecciones-puntos")
    public List<Map<String, Object>> historialRecoleccionesPuntos() {
        return historialRecoleccionPuntoRepository.findAll().stream().map(this::mapHistorialRecoleccionPunto).toList();
    }

    @GetMapping("/materiales")
    public List<Map<String, Object>> materiales() {
        return materialRepository.findAll().stream().map(this::mapMaterial).toList();
    }

    @GetMapping("/movimientos-puntos-usuario")
    public List<Map<String, Object>> movimientosPuntosUsuario() {
        return movimientoPuntosUsuarioRepository.findAll().stream().map(this::mapMovimientoPuntosUsuario).toList();
    }

    @GetMapping("/premios")
    public List<Map<String, Object>> premios() {
        return premioRepository.findAll().stream().map(this::mapPremio).toList();
    }

    @GetMapping("/punto-materiales")
    public List<Map<String, Object>> puntoMateriales() {
        return puntoMaterialRepository.findAll().stream().map(this::mapPuntoMaterial).toList();
    }

    @GetMapping("/puntos-reciclaje")
    public List<Map<String, Object>> puntosReciclaje() {
        return puntoReciclajeRepository.findAll().stream().map(this::mapPuntoReciclaje).toList();
    }

    @GetMapping("/regiones")
    public List<Map<String, Object>> regiones() {
        return regionRepository.findAll().stream().map(this::mapRegion).toList();
    }

    @GetMapping("/reportes-puntos")
    public List<Map<String, Object>> reportesPuntos() {
        return reportePuntoRepository.findAll().stream().map(this::mapReportePunto).toList();
    }

    @GetMapping("/roles")
    public List<Map<String, Object>> roles() {
        return rolRepository.findAll().stream().map(this::mapRol).toList();
    }

    @GetMapping("/tipo-reporte")
    public List<Map<String, Object>> tipoReporte() {
        return tipoReporteRepository.findAll().stream().map(this::mapTipoReporte).toList();
    }

    @GetMapping("/usuarios")
    public List<Map<String, Object>> usuarios() {
        return usuarioRepository.findAll().stream().map(this::mapUsuario).toList();
    }

    private Map<String, Object> mapComuna(Comuna e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        m.put("region_id", id(e.getRegion()));
        return m;
    }

    private Map<String, Object> mapDetalleFormularioMaterial(DetalleFormularioMaterial e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("formulario_id", id(e.getFormulario()));
        m.put("material_id", id(e.getMaterial()));
        m.put("cantidad_declarada", e.getCantidadDeclarada());
        m.put("unidad_declarada", e.getUnidadDeclarada());
        m.put("puntos_obtenidos", e.getPuntosObtenidos());
        m.put("observacion", e.getObservacion());
        return m;
    }

    private Map<String, Object> mapEstadoPunto(EstadoPunto e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        return m;
    }

    private Map<String, Object> mapFormularioReciclaje(FormularioReciclaje e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("usuario_id", id(e.getUsuario()));
        m.put("punto_id", id(e.getPunto()));
        m.put("distancia_metros", e.getDistanciaMetros());
        m.put("total_puntos_obtenidos", e.getTotalPuntosObtenidos());
        m.put("estado", e.getEstado());
        m.put("observacion", e.getObservacion());
        m.put("fecha_formulario", e.getFechaFormulario());
        return m;
    }

    private Map<String, Object> mapGuiaReciclaje(GuiaReciclaje e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("titulo", e.getTitulo());
        m.put("descripcion", e.getDescripcion());
        m.put("contenido", e.getContenido());
        m.put("material_id", id(e.getMaterial()));
        m.put("fecha_creacion", e.getFechaCreacion());
        return m;
    }

    private Map<String, Object> mapHistorialEstadoPunto(HistorialEstadoPunto e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("punto_id", id(e.getPunto()));
        m.put("estado_anterior_id", id(e.getEstadoAnterior()));
        m.put("estado_nuevo_id", id(e.getEstadoNuevo()));
        m.put("descripcion", e.getDescripcion());
        m.put("fecha_historial", e.getFechaHistorial());
        return m;
    }

    private Map<String, Object> mapHistorialPremioCanjeado(HistorialPremioCanjeado e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("usuario_id", id(e.getUsuario()));
        m.put("premio_id", id(e.getPremio()));
        m.put("nombre_premio", e.getNombrePremio());
        m.put("puntos_gastados", e.getPuntosGastados());
        m.put("codigo_canje", e.getCodigoCanje());
        m.put("estado", e.getEstado());
        m.put("fecha_canje", e.getFechaCanje());
        m.put("fecha_entrega", e.getFechaEntrega());
        m.put("observacion", e.getObservacion());
        return m;
    }

    private Map<String, Object> mapHistorialRecoleccionPunto(HistorialRecoleccionPunto e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("punto_id", id(e.getPunto()));
        m.put("material_id", id(e.getMaterial()));
        m.put("mantenedor_id", id(e.getMantenedor()));
        m.put("cantidad_retirada_compactada", e.getCantidadRetiradaCompactada());
        m.put("observacion", e.getObservacion());
        m.put("fecha_recoleccion", e.getFechaRecoleccion());
        return m;
    }

    private Map<String, Object> mapMaterial(Material e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        m.put("codigo_identificador", e.getCodigoIdentificador());
        m.put("descripcion", e.getDescripcion());
        return m;
    }

    private Map<String, Object> mapMovimientoPuntosUsuario(MovimientoPuntosUsuario e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("usuario_id", id(e.getUsuario()));
        m.put("tipo_movimiento", e.getTipoMovimiento());
        m.put("puntos", e.getPuntos());
        m.put("formulario_id", id(e.getFormulario()));
        m.put("canje_id", id(e.getCanje()));
        m.put("descripcion", e.getDescripcion());
        m.put("fecha_movimiento", e.getFechaMovimiento());
        return m;
    }

    private Map<String, Object> mapPremio(Premio e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        m.put("descripcion", e.getDescripcion());
        m.put("costo_puntos", e.getCostoPuntos());
        m.put("stock", e.getStock());
        m.put("activo", e.getActivo());
        return m;
    }

    private Map<String, Object> mapPuntoMaterial(PuntoMaterial e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("punto_id", id(e.getPunto()));
        m.put("material_id", id(e.getMaterial()));
        m.put("capacidad_compactado", e.getCapacidadCompactado());
        m.put("actual_compactado", e.getActualCompactado());
        return m;
    }

    private Map<String, Object> mapPuntoReciclaje(PuntoReciclaje e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        m.put("descripcion", e.getDescripcion());
        m.put("comuna_id", id(e.getComuna()));
        m.put("direccion", e.getDireccion());
        m.put("latitud", e.getLatitud());
        m.put("longitud", e.getLongitud());
        m.put("radio_validacion_m", e.getRadioValidacionM());
        m.put("estado_id", id(e.getEstado()));
        m.put("mantenedor_id", id(e.getMantenedor()));
        m.put("fecha_creacion", e.getFechaCreacion());
        m.put("ultima_actualizacion", e.getUltimaActualizacion());
        return m;
    }

    private Map<String, Object> mapRegion(Region e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        return m;
    }

    private Map<String, Object> mapReportePunto(ReportePunto e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("usuario_id", id(e.getUsuario()));
        m.put("punto_id", id(e.getPunto()));
        m.put("tipo_reporte_id", id(e.getTipoReporte()));
        m.put("descripcion", e.getDescripcion());
        m.put("fecha_reporte", e.getFechaReporte());
        return m;
    }

    private Map<String, Object> mapRol(Rol e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        return m;
    }

    private Map<String, Object> mapTipoReporte(TipoReporte e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("nombre", e.getNombre());
        return m;
    }

    private Map<String, Object> mapUsuario(Usuario e) {
        Map<String, Object> m = row();
        m.put("id", e.getId());
        m.put("rut", e.getRut());
        m.put("nombre_alias", e.getNombreAlias());
        m.put("correo", e.getCorreo());
        m.put("contrasena", e.getContrasena());
        m.put("sexo_genero", e.getSexoGenero());
        m.put("fecha_nacimiento", e.getFechaNacimiento());
        m.put("telefono", e.getTelefono());
        m.put("comuna_id", id(e.getComuna()));
        m.put("direccion", e.getDireccion());
        m.put("puntos", e.getPuntos());
        m.put("rol_id", id(e.getRol()));
        m.put("activo", e.getActivo());
        m.put("fecha_registro", e.getFechaRegistro());
        m.put("fecha_ultimo_acceso", e.getFechaUltimoAcceso());
        return m;
    }

    private Map<String, Object> row() {
        return new LinkedHashMap<>();
    }

    private Long id(Object entity) {
        if (entity == null) return null;
        if (entity instanceof Region e) return e.getId();
        if (entity instanceof Comuna e) return e.getId();
        if (entity instanceof Rol e) return e.getId();
        if (entity instanceof EstadoPunto e) return e.getId();
        if (entity instanceof TipoReporte e) return e.getId();
        if (entity instanceof Material e) return e.getId();
        if (entity instanceof Usuario e) return e.getId();
        if (entity instanceof PuntoReciclaje e) return e.getId();
        if (entity instanceof FormularioReciclaje e) return e.getId();
        if (entity instanceof HistorialPremioCanjeado e) return e.getId();
        return null;
    }

    public BaseDatosController(ComunaRepository comunaRepository, DetalleFormularioMaterialRepository detalleFormularioMaterialRepository, EstadoPuntoRepository estadoPuntoRepository, FormularioReciclajeRepository formularioReciclajeRepository, GuiaReciclajeRepository guiaReciclajeRepository, HistorialEstadoPuntoRepository historialEstadoPuntoRepository, HistorialPremioCanjeadoRepository historialPremioCanjeadoRepository, HistorialRecoleccionPuntoRepository historialRecoleccionPuntoRepository, MaterialRepository materialRepository, MovimientoPuntosUsuarioRepository movimientoPuntosUsuarioRepository, PremioRepository premioRepository, PuntoMaterialRepository puntoMaterialRepository, PuntoReciclajeRepository puntoReciclajeRepository, RegionRepository regionRepository, ReportePuntoRepository reportePuntoRepository, RolRepository rolRepository, TipoReporteRepository tipoReporteRepository, UsuarioRepository usuarioRepository) {
        this.comunaRepository = comunaRepository;
        this.detalleFormularioMaterialRepository = detalleFormularioMaterialRepository;
        this.estadoPuntoRepository = estadoPuntoRepository;
        this.formularioReciclajeRepository = formularioReciclajeRepository;
        this.guiaReciclajeRepository = guiaReciclajeRepository;
        this.historialEstadoPuntoRepository = historialEstadoPuntoRepository;
        this.historialPremioCanjeadoRepository = historialPremioCanjeadoRepository;
        this.historialRecoleccionPuntoRepository = historialRecoleccionPuntoRepository;
        this.materialRepository = materialRepository;
        this.movimientoPuntosUsuarioRepository = movimientoPuntosUsuarioRepository;
        this.premioRepository = premioRepository;
        this.puntoMaterialRepository = puntoMaterialRepository;
        this.puntoReciclajeRepository = puntoReciclajeRepository;
        this.regionRepository = regionRepository;
        this.reportePuntoRepository = reportePuntoRepository;
        this.rolRepository = rolRepository;
        this.tipoReporteRepository = tipoReporteRepository;
        this.usuarioRepository = usuarioRepository;
    }
}
