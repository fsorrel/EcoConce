package cl.ecoconce.service;

import cl.ecoconce.dto.ReporteRequest;
import cl.ecoconce.dto.ReporteResponse;
import cl.ecoconce.dto.TipoReporteDto;
import cl.ecoconce.entity.PuntoReciclaje;
import cl.ecoconce.entity.ReportePunto;
import cl.ecoconce.entity.TipoReporte;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.repository.PuntoReciclajeRepository;
import cl.ecoconce.repository.ReportePuntoRepository;
import cl.ecoconce.repository.TipoReporteRepository;
import cl.ecoconce.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReporteService {
    private final UsuarioRepository usuarioRepository;
    private final PuntoReciclajeRepository puntoRepository;
    private final TipoReporteRepository tipoRepository;
    private final ReportePuntoRepository reporteRepository;
    private final MapperService mapper;

    @Transactional
    public ReporteResponse crear(ReporteRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        PuntoReciclaje punto = puntoRepository.findById(request.puntoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        TipoReporte tipo = tipoRepository.findById(request.tipoReporteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de reporte no encontrado"));

        ReportePunto reporte = reporteRepository.save(ReportePunto.builder()
                .usuario(usuario)
                .punto(punto)
                .tipoReporte(tipo)
                .descripcion(limpiarTexto(request.descripcion()))
                .build());

        return mapper.toReporte(reporte);
    }

    @Transactional(readOnly = true)
    public List<ReporteResponse> listarAdmin() {
        return reporteRepository.findAllByOrderByFechaReporteDesc().stream()
                .map(mapper::toReporte)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReporteResponse> listarMantenedor(Long mantenedorId) {
        if (!usuarioRepository.existsById(mantenedorId)) {
            throw new RecursoNoEncontradoException("Mantenedor no encontrado");
        }

        return reporteRepository.findByPuntoMantenedorIdOrderByFechaReporteDesc(mantenedorId).stream()
                .map(mapper::toReporte)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TipoReporteDto> listarTipos() {
        return tipoRepository.findAllByOrderByNombreAsc().stream()
                .map(mapper::toTipoReporte)
                .toList();
    }

    private String limpiarTexto(String texto) {
        return texto == null ? "" : texto.trim();
    }

    public ReporteService(
            UsuarioRepository usuarioRepository,
            PuntoReciclajeRepository puntoRepository,
            TipoReporteRepository tipoRepository,
            ReportePuntoRepository reporteRepository,
            MapperService mapper
    ) {
        this.usuarioRepository = usuarioRepository;
        this.puntoRepository = puntoRepository;
        this.tipoRepository = tipoRepository;
        this.reporteRepository = reporteRepository;
        this.mapper = mapper;
    }
}