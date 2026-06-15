package cl.ecoconce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record PuntoReciclajeRequest(
        @NotBlank String nombre,
        @NotBlank String descripcion,
        @NotNull Long comunaId,
        String direccion,
        @NotNull Double latitud,
        @NotNull Double longitud,
        @NotNull @Positive Integer radioValidacionM,
        @NotNull Long estadoId,
        Long mantenedorId,
        @NotEmpty List<@Valid PuntoMaterialRequest> materiales
) {
}