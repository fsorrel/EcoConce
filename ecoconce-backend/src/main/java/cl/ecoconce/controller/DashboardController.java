package cl.ecoconce.controller;

import cl.ecoconce.dto.DashboardDto;
import cl.ecoconce.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    // IDOR: el dashboard expone puntos, actividad y medallería del usuario;
    // solo el titular (o un ADMIN) puede consultarlo.
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #usuarioId)")
    @GetMapping("/{usuarioId}")
    public DashboardDto obtener(@PathVariable Long usuarioId) {
        return dashboardService.obtenerDashboard(usuarioId);
    }


    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
}
