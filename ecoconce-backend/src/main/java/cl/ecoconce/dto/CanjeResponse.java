package cl.ecoconce.dto;

import java.time.LocalDateTime;

public record CanjeResponse(
        Long id,
        Long premioId,
        String premio,
        Integer puntosGastados,
        String codigoCanje,
        String estado,
        String envioDomicilio,
        String direccionEnvio,
        Integer puntosRestantes,
        LocalDateTime fechaCanje
) {}