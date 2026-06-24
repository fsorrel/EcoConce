package cl.ecoconce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PuntoMaterialUpdateRequest(
        @NotNull Long materialId,
        @Min(value = 0, message = "Las cantidades no pueden ser negativas") Integer capacidadCompactado,
        @Min(value = 0, message = "Las cantidades no pueden ser negativas") Integer actualCompactado
) {
}