package cl.ecoconce.dto;

public record PuntoMaterialDto(
        Long materialId,
        String nombre,
        Integer capacidadCompactado,
        Integer actualCompactado,
        Boolean lleno,
        Boolean disponible
) {
}