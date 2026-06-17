package cl.ecoconce.dto;

public record MedallaDto(
        String nombre,
        String descripcion,
        Integer puntosRequeridos,
        boolean obtenida,
        String icono
) {}
