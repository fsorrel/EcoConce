package cl.ecoconce.dto;

import java.util.List;

public record PuntoReciclajeDto(
        Long id,
        String nombre,
        String descripcion,
        Long comunaId,
        String comuna,
        String direccion,
        Double latitud,
        Double longitud,
        Integer radioValidacionM,
        Long estadoId,
        String estado,
        Long mantenedorId,
        String mantenedor,
        List<String> materiales,
        List<PuntoMaterialDto> materialesDetalle
) {
}