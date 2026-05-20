package cl.ecoconce.dto;

import java.time.LocalDateTime;

public record ReporteResponse(
        Long id,
        Long usuarioId,
        String usuario,
        Long puntoId,
        String punto,
        Long mantenedorId,
        String mantenedor,
        Long tipoReporteId,
        String tipoReporte,
        String descripcion,
        LocalDateTime fechaReporte
) {}