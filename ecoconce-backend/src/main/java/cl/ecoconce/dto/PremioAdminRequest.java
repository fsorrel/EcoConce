package cl.ecoconce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PremioAdminRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
        String nombre,

        @NotBlank(message = "La descripción es obligatoria")
        String descripcion,

        @NotNull(message = "El costo en puntos es obligatorio")
        @Min(value = 1, message = "El costo en puntos debe ser mayor a 0")
        Integer costoPuntos,

        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock,

        String activo,

        String envioDomicilio
) {}