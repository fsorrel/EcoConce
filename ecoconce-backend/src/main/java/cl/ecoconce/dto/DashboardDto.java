package cl.ecoconce.dto;

import java.util.List;

public record DashboardDto(
        UsuarioResumenDto usuario,
        ResumenReciclajeDto resumen,
        List<MedallaDto> medallas,
        List<PuntoReciclajeDto> puntos,
        List<GuiaDto> guias,
        List<MaterialDto> materiales,
        List<PremioDto> premios
) {}
