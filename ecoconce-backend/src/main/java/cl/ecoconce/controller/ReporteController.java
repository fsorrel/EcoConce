package cl.ecoconce.controller;

import cl.ecoconce.dto.ReporteRequest;
import cl.ecoconce.dto.ReporteResponse;
import cl.ecoconce.dto.TipoReporteDto;
import cl.ecoconce.service.ReporteService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    private final ReporteService reporteService;

    @PostMapping
    public ReporteResponse crear(@Valid @RequestBody ReporteRequest request) {
        return reporteService.crear(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public List<ReporteResponse> listarAdmin() {
        return reporteService.listarAdmin();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANTENEDOR')")
    @GetMapping("/mantenedor/{mantenedorId}")
    public List<ReporteResponse> listarMantenedor(@PathVariable Long mantenedorId) {
        return reporteService.listarMantenedor(mantenedorId);
    }

    @GetMapping("/tipos")
    public List<TipoReporteDto> listarTipos() {
        return reporteService.listarTipos();
    }

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }
}