package cl.ecoconce.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UsuarioAdminDto(
        Long id,
        String rut,
        String nombreAlias,
        String correo,
        String sexoGenero,
        LocalDate fechaNacimiento,
        String telefono,
        Long comunaId,
        String comuna,
        String direccion,
        Integer puntos,
        Long rolId,
        String rol,
        String activo,
        LocalDateTime fechaRegistro,
        LocalDateTime fechaUltimoAcceso,
        Boolean protegido
) {
}