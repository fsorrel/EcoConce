package cl.ecoconce.dto;

import jakarta.validation.constraints.NotNull;

public record PuntoEstadoRequest(
        @NotNull Long estadoId,
        String descripcion
) {
}