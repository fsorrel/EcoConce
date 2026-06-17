package cl.ecoconce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FormularioMaterialRequest(
        @NotNull Long materialId,
        @NotNull @Min(1) Integer cantidadDeclarada,
        String unidadDeclarada,
        String observacion
) {
}