package cl.ecoconce.service;

import cl.ecoconce.dto.*;
import cl.ecoconce.entity.*;
import cl.ecoconce.repository.PuntoMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MapperService {
    private final PuntoMaterialRepository puntoMaterialRepository;

    public MapperService(PuntoMaterialRepository puntoMaterialRepository) {
        this.puntoMaterialRepository = puntoMaterialRepository;
    }

    public UsuarioResumenDto toUsuarioResumen(Usuario usuario) {
        return new UsuarioResumenDto(
                usuario.getId(),
                usuario.getNombreAlias(),
                usuario.getCorreo(),
                usuario.getPuntos(),
                usuario.getRol().getNombre()
        );
    }

    public MaterialDto toMaterial(Material material) {
        return new MaterialDto(
                material.getId(),
                material.getNombre(),
                material.getCodigoIdentificador(),
                material.getDescripcion()
        );
    }

    public PuntoReciclajeDto toPunto(PuntoReciclaje punto) {
        List<PuntoMaterial> puntoMateriales = puntoMaterialRepository.findByPuntoId(punto.getId());

        List<String> materiales = puntoMateriales.stream()
                .map(pm -> pm.getMaterial().getNombre())
                .toList();

        List<PuntoMaterialDto> materialesDetalle = puntoMateriales.stream()
                .map(pm -> {
                    Integer capacidad = pm.getCapacidadCompactado() == null ? 0 : pm.getCapacidadCompactado();
                    Integer actual = pm.getActualCompactado() == null ? 0 : pm.getActualCompactado();
                    boolean lleno = capacidad > 0 && actual >= capacidad;

                    return new PuntoMaterialDto(
                            pm.getMaterial().getId(),
                            pm.getMaterial().getNombre(),
                            capacidad,
                            actual,
                            lleno,
                            !lleno
                    );
                })
                .toList();

        return new PuntoReciclajeDto(
                punto.getId(),
                punto.getNombre(),
                punto.getDescripcion(),
                punto.getComuna() == null ? null : punto.getComuna().getId(),
                punto.getComuna() == null ? null : punto.getComuna().getNombre(),
                punto.getDireccion(),
                punto.getLatitud(),
                punto.getLongitud(),
                punto.getRadioValidacionM(),
                punto.getEstado() == null ? null : punto.getEstado().getId(),
                punto.getEstado() == null ? null : punto.getEstado().getNombre(),
                punto.getMantenedor() == null ? null : punto.getMantenedor().getId(),
                punto.getMantenedor() == null ? null : punto.getMantenedor().getNombreAlias(),
                materiales,
                materialesDetalle
        );
    }

    public GuiaDto toGuia(GuiaReciclaje guia) {
        return new GuiaDto(
                guia.getId(),
                guia.getTitulo(),
                guia.getDescripcion(),
                guia.getContenido(),
                guia.getMaterial() == null ? null : guia.getMaterial().getNombre()
        );
    }

    public PremioDto toPremio(Premio premio) {
        return new PremioDto(
                premio.getId(),
                premio.getNombre(),
                premio.getDescripcion(),
                premio.getCostoPuntos(),
                premio.getStock(),
                premio.getActivo(),
                premio.getEnvioDomicilio() == null ? "N" : premio.getEnvioDomicilio()
        );
        }

    public FormularioResponse toFormulario(FormularioReciclaje formulario) {
        return new FormularioResponse(
                formulario.getId(),
                formulario.getUsuario().getId(),
                formulario.getPunto().getNombre(),
                formulario.getDistanciaMetros(),
                formulario.getTotalPuntosObtenidos(),
                formulario.getEstado(),
                formulario.getFechaFormulario()
        );
    }

    public ReporteResponse toReporte(ReportePunto reporte) {
        return new ReporteResponse(
                reporte.getId(),
                reporte.getUsuario() == null ? null : reporte.getUsuario().getId(),
                reporte.getUsuario() == null ? null : reporte.getUsuario().getNombreAlias(),
                reporte.getPunto() == null ? null : reporte.getPunto().getId(),
                reporte.getPunto() == null ? null : reporte.getPunto().getNombre(),
                reporte.getPunto() == null || reporte.getPunto().getMantenedor() == null
                        ? null
                        : reporte.getPunto().getMantenedor().getId(),
                reporte.getPunto() == null || reporte.getPunto().getMantenedor() == null
                        ? "Sin mantenedor"
                        : reporte.getPunto().getMantenedor().getNombreAlias(),
                reporte.getTipoReporte() == null ? null : reporte.getTipoReporte().getId(),
                reporte.getTipoReporte() == null ? null : reporte.getTipoReporte().getNombre(),
                reporte.getDescripcion(),
                reporte.getFechaReporte()
        );
        }

public TipoReporteDto toTipoReporte(TipoReporte tipoReporte) {
    return new TipoReporteDto(
            tipoReporte.getId(),
            tipoReporte.getNombre()
    );
}

    public UsuarioAdminDto toUsuarioAdminDto(Usuario usuario) {
        boolean protegido = usuario.getCorreo() != null
                && usuario.getCorreo().equalsIgnoreCase("admin@ecoconce.cl");

        return new UsuarioAdminDto(
                usuario.getId(),
                usuario.getRut(),
                usuario.getNombreAlias(),
                usuario.getCorreo(),
                usuario.getSexoGenero(),
                usuario.getFechaNacimiento(),
                usuario.getTelefono(),
                usuario.getComuna() == null ? null : usuario.getComuna().getId(),
                usuario.getComuna() == null ? null : usuario.getComuna().getNombre(),
                usuario.getDireccion(),
                usuario.getPuntos(),
                usuario.getRol() == null ? null : usuario.getRol().getId(),
                usuario.getRol() == null ? null : usuario.getRol().getNombre(),
                usuario.getActivo(),
                usuario.getFechaRegistro(),
                usuario.getFechaUltimoAcceso(),
                protegido
        );
    }
}