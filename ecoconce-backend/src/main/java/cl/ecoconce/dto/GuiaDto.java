package cl.ecoconce.dto;

public record GuiaDto(
        Long id,
        String titulo,
        String descripcion,
        String contenido,
        String material
) {}
