package cl.ecoconce.controller;

import cl.ecoconce.dto.FormularioRequest;
import cl.ecoconce.dto.FormularioResponse;
import cl.ecoconce.entity.DetalleFormularioMaterial;
import cl.ecoconce.entity.FormularioReciclaje;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.repository.DetalleFormularioMaterialRepository;
import cl.ecoconce.repository.FormularioReciclajeRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.service.FormularioReciclajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formularios")
public class FormularioReciclajeController {
    private final FormularioReciclajeService formularioService;
    private final FormularioReciclajeRepository formularioRepository;
    private final DetalleFormularioMaterialRepository detalleRepository;
    private final UsuarioRepository usuarioRepository;

    // IDOR: un ciudadano solo puede registrar formularios a su propio nombre
    // (un ADMIN puede hacerlo por cualquiera). Evita atribuir reciclajes a terceros.
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #usuarioId)")
    @PostMapping("/usuario/{usuarioId}")
    public FormularioResponse crear(@PathVariable Long usuarioId, @Valid @RequestBody FormularioRequest request) {
        return formularioService.crear(usuarioId, request);
    }

    // Aprobar/rechazar es una decisión administrativa (RF15): solo ADMIN.
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/aprobar")
    public FormularioResponse aprobar(@PathVariable Long id) {
        return formularioService.aprobar(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/rechazar")
    public FormularioResponse rechazar(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String observacion = body == null ? null : body.get("observacion");
        return formularioService.rechazar(id, observacion);
    }

    // Todos los formularios (solo ADMIN). Reemplaza /api/bd/formularios-reciclaje.
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    @GetMapping("/admin/todos")
    public List<Map<String, Object>> listarTodos() {
        return formularioRepository.findAll().stream().map(this::toFila).toList();
    }

    // Formularios de un usuario (el propio, o cualquiera si es ADMIN).
    @Transactional(readOnly = true)
    @GetMapping("/usuario/{usuarioId}")
    public List<Map<String, Object>> listarPorUsuario(@PathVariable Long usuarioId, Authentication auth) {
        validarAccesoUsuario(usuarioId, auth);
        return formularioRepository.findByUsuarioIdOrderByFechaFormularioDesc(usuarioId).stream()
                .map(this::toFila)
                .toList();
    }

    // Detalles de los formularios de un usuario (el propio, o cualquiera si es ADMIN).
    @Transactional(readOnly = true)
    @GetMapping("/usuario/{usuarioId}/detalles")
    public List<Map<String, Object>> listarDetallesPorUsuario(@PathVariable Long usuarioId, Authentication auth) {
        validarAccesoUsuario(usuarioId, auth);
        return detalleRepository.findByFormularioUsuarioId(usuarioId).stream()
                .map(this::toFilaDetalle)
                .toList();
    }

    private void validarAccesoUsuario(Long usuarioId, Authentication auth) {
        if (esAdmin(auth)) {
            return;
        }
        Usuario actual = usuarioRepository.findByCorreo(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado"));
        if (!actual.getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes ver formularios de otro usuario");
        }
    }

    private boolean esAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private Map<String, Object> toFila(FormularioReciclaje f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("usuario_id", f.getUsuario() == null ? null : f.getUsuario().getId());
        m.put("punto_id", f.getPunto() == null ? null : f.getPunto().getId());
        m.put("distancia_metros", f.getDistanciaMetros());
        m.put("total_puntos_obtenidos", f.getTotalPuntosObtenidos());
        m.put("estado", f.getEstado());
        m.put("observacion", f.getObservacion());
        m.put("fecha_formulario", f.getFechaFormulario());
        return m;
    }

    private Map<String, Object> toFilaDetalle(DetalleFormularioMaterial d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("formulario_id", d.getFormulario() == null ? null : d.getFormulario().getId());
        m.put("material_id", d.getMaterial() == null ? null : d.getMaterial().getId());
        m.put("cantidad_declarada", d.getCantidadDeclarada());
        m.put("unidad_declarada", d.getUnidadDeclarada());
        m.put("puntos_obtenidos", d.getPuntosObtenidos());
        m.put("observacion", d.getObservacion());
        return m;
    }

    public FormularioReciclajeController(
            FormularioReciclajeService formularioService,
            FormularioReciclajeRepository formularioRepository,
            DetalleFormularioMaterialRepository detalleRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.formularioService = formularioService;
        this.formularioRepository = formularioRepository;
        this.detalleRepository = detalleRepository;
        this.usuarioRepository = usuarioRepository;
    }
}
