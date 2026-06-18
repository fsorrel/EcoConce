package cl.ecoconce.dto;

public record UsuarioResumenDto(
        Long id,
        String nombreAlias,
        String correo,
        Integer puntos,
        String rol
) {}
