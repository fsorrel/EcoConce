package cl.ecoconce.controller;

import cl.ecoconce.dto.CanjeAdminDto;
import cl.ecoconce.dto.CanjeEstadoRequest;
import cl.ecoconce.dto.CanjeResponse;
import cl.ecoconce.dto.PremioAdminRequest;
import cl.ecoconce.dto.PremioDto;
import cl.ecoconce.entity.Premio;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.PremioRepository;
import cl.ecoconce.service.CanjeService;
import cl.ecoconce.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/premios")
public class PremioController {
    private final PremioRepository premioRepository;
    private final MapperService mapper;
    private final CanjeService canjeService;

    @Transactional(readOnly = true)
    @GetMapping
    public List<PremioDto> listar() {
        return premioRepository.findByActivo("S").stream()
                .map(mapper::toPremio)
                .toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/admin")
    public List<PremioDto> listarAdmin() {
        return premioRepository.findAll().stream()
                .sorted(Comparator.comparing(Premio::getId))
                .map(mapper::toPremio)
                .toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/admin/canjes")
    public List<CanjeAdminDto> listarCanjesAdmin() {
        return canjeService.listarCanjesAdmin();
    }

    @Transactional(readOnly = true)
    @GetMapping("/admin/canjes/pendientes")
    public List<CanjeAdminDto> listarCanjesPendientesAdmin() {
        return canjeService.listarCanjesPendientesAdmin();
    }

    @Transactional
    @PutMapping("/admin/canjes/{canjeId}/estado")
    public CanjeAdminDto actualizarEstadoCanjeAdmin(
            @PathVariable Long canjeId,
            @RequestBody CanjeEstadoRequest request
    ) {
        return canjeService.actualizarEstadoAdmin(canjeId, request);
    }

    @Transactional
    @PostMapping("/admin")
    public PremioDto crearAdmin(@Valid @RequestBody PremioAdminRequest request) {
        Premio premio = Premio.builder()
                .nombre(limpiarTexto(request.nombre()))
                .descripcion(limpiarTexto(request.descripcion()))
                .costoPuntos(request.costoPuntos())
                .stock(request.stock())
                .activo(normalizarSiNo(request.activo(), "S"))
                .envioDomicilio(normalizarSiNo(request.envioDomicilio(), "N"))
                .build();

        return mapper.toPremio(premioRepository.save(premio));
    }

    @Transactional
    @PutMapping("/admin/{id}")
    public PremioDto actualizarAdmin(@PathVariable Long id, @Valid @RequestBody PremioAdminRequest request) {
        Premio premio = buscarPremio(id);

        premio.setNombre(limpiarTexto(request.nombre()));
        premio.setDescripcion(limpiarTexto(request.descripcion()));
        premio.setCostoPuntos(request.costoPuntos());
        premio.setStock(request.stock());
        premio.setActivo(normalizarSiNo(request.activo(), "S"));
        premio.setEnvioDomicilio(normalizarSiNo(request.envioDomicilio(), "N"));

        return mapper.toPremio(premioRepository.save(premio));
    }

    @Transactional
    @PutMapping("/admin/{id}/activar")
    public PremioDto activarAdmin(@PathVariable Long id) {
        Premio premio = buscarPremio(id);
        premio.setActivo("S");

        return mapper.toPremio(premioRepository.save(premio));
    }

    @Transactional
    @PutMapping("/admin/{id}/desactivar")
    public PremioDto desactivarAdmin(@PathVariable Long id) {
        Premio premio = buscarPremio(id);
        premio.setActivo("N");

        return mapper.toPremio(premioRepository.save(premio));
    }

    @PostMapping("/{premioId}/canjear")
    public CanjeResponse canjear(@PathVariable Long premioId, @RequestParam Long usuarioId) {
        return canjeService.canjear(usuarioId, premioId);
    }

    private Premio buscarPremio(Long id) {
        return premioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Premio no encontrado"));
    }

    private String limpiarTexto(String texto) {
        return texto == null ? "" : texto.trim();
    }

    private String normalizarSiNo(String valor, String defecto) {
        if (valor == null || valor.isBlank()) return defecto;

        String normalizado = valor.trim().toUpperCase();

        if (!normalizado.equals("S") && !normalizado.equals("N")) {
            throw new ReglaNegocioException("El valor debe ser S o N");
        }

        return normalizado;
    }

    public PremioController(
            PremioRepository premioRepository,
            MapperService mapper,
            CanjeService canjeService
    ) {
        this.premioRepository = premioRepository;
        this.mapper = mapper;
        this.canjeService = canjeService;
    }
}