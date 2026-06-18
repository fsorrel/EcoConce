package cl.ecoconce.service;

import cl.ecoconce.dto.*;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final UsuarioRepository usuarioRepository;
    private final PuntoReciclajeRepository puntoRepository;
    private final GuiaReciclajeRepository guiaRepository;
    private final MaterialRepository materialRepository;
    private final PremioRepository premioRepository;
    private final DetalleFormularioMaterialRepository detalleRepository;
    private final FormularioReciclajeRepository formularioRepository;
    private final MovimientoPuntosUsuarioRepository movimientoRepository;
    private final MapperService mapper;

    public DashboardDto obtenerDashboard(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        long materiales = Math.round(detalleRepository.sumarCantidadAprobadaPorUsuario(usuarioId));
        long puntosGanados = movimientoRepository.sumarPuntosGanadosPorUsuario(usuarioId);
        long desafios = formularioRepository.countByUsuarioIdAndEstado(usuarioId, "APROBADO");
        long niveles = calcularNivel(usuario.getPuntos());

        return new DashboardDto(
                mapper.toUsuarioResumen(usuario),
                new ResumenReciclajeDto(materiales, puntosGanados, desafios, niveles),
                medallas(usuario.getPuntos()),
                puntoRepository.findAll().stream().map(mapper::toPunto).toList(),
                guiaRepository.findAll().stream().map(mapper::toGuia).toList(),
                materialRepository.findAll().stream().map(mapper::toMaterial).toList(),
                premioRepository.findByActivo("S").stream().map(mapper::toPremio).toList()
        );
    }

    private long calcularNivel(Integer puntos) {
        if (puntos == null) return 1;
        return Math.max(1, (puntos / 2500) + 1);
    }

    private List<MedallaDto> medallas(Integer puntosActuales) {
        int puntos = puntosActuales == null ? 0 : puntosActuales;
        return List.of(
                medalla("Eco Novato", "Primeros pasos reciclando", 0, puntos, "♻️"),
                medalla("Recolector Verde", "Alcanza 5.000 puntos", 5000, puntos, "🌱"),
                medalla("Guardián Ambiental", "Alcanza 10.000 puntos", 10000, puntos, "🏆"),
                medalla("Campeón del Reciclaje", "Alcanza 15.000 puntos", 15000, puntos, "🥇")
        );
    }

    private MedallaDto medalla(String nombre, String descripcion, int puntosRequeridos, int puntosActuales, String icono) {
        return new MedallaDto(nombre, descripcion, puntosRequeridos, puntosActuales >= puntosRequeridos, icono);
    }


    public DashboardService(UsuarioRepository usuarioRepository, PuntoReciclajeRepository puntoRepository, GuiaReciclajeRepository guiaRepository, MaterialRepository materialRepository, PremioRepository premioRepository, DetalleFormularioMaterialRepository detalleRepository, FormularioReciclajeRepository formularioRepository, MovimientoPuntosUsuarioRepository movimientoRepository, MapperService mapper) {
        this.usuarioRepository = usuarioRepository;
        this.puntoRepository = puntoRepository;
        this.guiaRepository = guiaRepository;
        this.materialRepository = materialRepository;
        this.premioRepository = premioRepository;
        this.detalleRepository = detalleRepository;
        this.formularioRepository = formularioRepository;
        this.movimientoRepository = movimientoRepository;
        this.mapper = mapper;
    }
}
