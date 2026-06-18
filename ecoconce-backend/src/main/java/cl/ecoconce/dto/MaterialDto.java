package cl.ecoconce.dto;

public record MaterialDto(
        Long id,
        String nombre,
        String codigoIdentificador,
        String descripcion
) {}
