package cl.ecoconce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UsuarioRequest(
        @NotBlank String rut,
        @NotBlank String nombreAlias,
        @NotBlank @Email String correo,
        @NotBlank String contrasena,
        String sexoGenero,
        LocalDate fechaNacimiento,
        String telefono,
        @NotNull Long comunaId,
        String direccion,
        @NotNull Long rolId
) {}
