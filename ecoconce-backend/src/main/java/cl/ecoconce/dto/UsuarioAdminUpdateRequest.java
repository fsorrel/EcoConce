package cl.ecoconce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioAdminUpdateRequest(
        @NotBlank String nombreAlias,
        @NotBlank @Email String correo,
        String telefono,
        Long comunaId,
        String direccion,
        @NotNull Long rolId,
        @NotBlank String activo
) {
}