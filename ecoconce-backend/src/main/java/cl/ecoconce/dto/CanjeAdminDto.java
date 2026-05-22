package cl.ecoconce.dto;

import java.time.LocalDateTime;

public record CanjeAdminDto(
        Long id,
        Long usuarioId,
        String usuario,
        String correo,
        Long premioId,
        String premio,
        Integer puntosGastados,
        String codigoCanje,
        String estado,
        String envioDomicilio,
        String direccionEnvio,
        String observacion,
        LocalDateTime fechaCanje,
        LocalDateTime fechaEntrega
) {}