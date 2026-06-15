package cl.ecoconce.dto;

import jakarta.validation.constraints.NotNull;

public record ReporteRequest(
        @NotNull Long usuarioId,
        @NotNull Long puntoId,
        @NotNull Long tipoReporteId,
        String descripcion
) {}
