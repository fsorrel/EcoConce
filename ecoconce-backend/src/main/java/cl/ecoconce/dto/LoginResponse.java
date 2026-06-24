package cl.ecoconce.dto;

public record LoginResponse(
        String token,
        Long userId,
        String rol
) {}
