package cl.ecoconce.dto;

public record PremioDto(
        Long id,
        String nombre,
        String descripcion,
        Integer costoPuntos,
        Integer stock,
        String activo,
        String envioDomicilio
) {}