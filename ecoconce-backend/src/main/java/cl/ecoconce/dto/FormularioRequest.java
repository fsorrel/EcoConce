package cl.ecoconce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

public record FormularioRequest(
        @NotNull Long puntoId,
        @NotNull @PositiveOrZero Double distanciaMetros,
        String observacion,
        @NotEmpty List<@Valid FormularioMaterialRequest> materiales
) {
}