package cl.ecoconce.dto;

import java.time.LocalDateTime;

public record FormularioResponse(
        Long id,
        Long usuarioId,
        String punto,
        Double distanciaMetros,
        Integer totalPuntosObtenidos,
        String estado,
        LocalDateTime fechaFormulario
) {}
