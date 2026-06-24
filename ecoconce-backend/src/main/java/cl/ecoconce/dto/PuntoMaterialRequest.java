package cl.ecoconce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PuntoMaterialRequest(
        @NotNull Long materialId,
        @Min(0) Integer capacidadCompactado,
        @Min(0) Integer actualCompactado
) {
}