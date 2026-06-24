package cl.ecoconce.service;

import cl.ecoconce.dto.CanjeAdminDto;
import cl.ecoconce.dto.CanjeEstadoRequest;
import cl.ecoconce.dto.CanjeResponse;
import cl.ecoconce.entity.HistorialPremioCanjeado;
import cl.ecoconce.entity.MovimientoPuntosUsuario;
import cl.ecoconce.entity.Premio;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.HistorialPremioCanjeadoRepository;
import cl.ecoconce.repository.MovimientoPuntosUsuarioRepository;
import cl.ecoconce.repository.PremioRepository;
import cl.ecoconce.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CanjeService {
    private static final Logger log = LoggerFactory.getLogger(CanjeService.class);

    private final UsuarioRepository usuarioRepository;
    private final PremioRepository premioRepository;
    private final HistorialPremioCanjeadoRepository canjeRepository;
    private final MovimientoPuntosUsuarioRepository movimientoRepository;

    @Transactional
    public CanjeResponse canjear(Long usuarioId, Long premioId) {
        log.info("Intento de canje: usuarioId={}, premioId={}", usuarioId, premioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Premio premio = premioRepository.findById(premioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Premio no encontrado"));

        if (!"S".equals(premio.getActivo())) throw new ReglaNegocioException("El premio no está activo");
        if (premio.getStock() <= 0) throw new ReglaNegocioException("El premio no tiene stock");
        if (usuario.getPuntos() < premio.getCostoPuntos()) throw new ReglaNegocioException("El usuario no tiene puntos suficientes");

        String envioDomicilio = normalizarSiNo(premio.getEnvioDomicilio());
        String direccionEnvio = null;

        if ("S".equals(envioDomicilio)) {
            direccionEnvio = limpiarTexto(usuario.getDireccion());

            if (direccionEnvio.isBlank()) {
                throw new ReglaNegocioException("Este premio requiere envío a domicilio. Debes completar tu dirección en el perfil antes de canjearlo.");
            }
        }

        usuario.setPuntos(usuario.getPuntos() - premio.getCostoPuntos());
        premio.setStock(premio.getStock() - 1);

        usuarioRepository.save(usuario);
        premioRepository.save(premio);

        HistorialPremioCanjeado canje = canjeRepository.save(HistorialPremioCanjeado.builder()
                .usuario(usuario)
                .premio(premio)
                .nombrePremio(premio.getNombre())
                .puntosGastados(premio.getCostoPuntos())
                .codigoCanje("ECO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .estado("PENDIENTE")
                .envioDomicilio(envioDomicilio)
                .direccionEnvio(direccionEnvio)
                .observacion("Canje generado desde la aplicación")
                .build());

        movimientoRepository.save(MovimientoPuntosUsuario.builder()
                .usuario(usuario)
                .tipoMovimiento("CANJE")
                .puntos(premio.getCostoPuntos())
                .canje(canje)
                .descripcion("Canje de premio: " + premio.getNombre())
                .build());

        log.info("Canje exitoso: usuarioId={}, premioId={}, codigo={}, stockRestante={}, puntosRestantes={}",
                usuarioId, premioId, canje.getCodigoCanje(), premio.getStock(), usuario.getPuntos());

        return toCanjeResponse(canje, usuario.getPuntos());
    }

    @Transactional(readOnly = true)
    public List<CanjeAdminDto> listarCanjesAdmin() {
        return canjeRepository.findAllByOrderByFechaCanjeDesc().stream()
                .map(this::toCanjeAdmin)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CanjeAdminDto> listarCanjesPendientesAdmin() {
        return canjeRepository.findByEstadoOrderByFechaCanjeDesc("PENDIENTE").stream()
                .map(this::toCanjeAdmin)
                .toList();
    }

    @Transactional
    public CanjeAdminDto actualizarEstadoAdmin(Long canjeId, CanjeEstadoRequest request) {
        HistorialPremioCanjeado canje = canjeRepository.findById(canjeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Canje no encontrado"));

        String estado = normalizarEstado(request.estado());

        canje.setEstado(estado);
        canje.setObservacion(limpiarTexto(request.observacion()));

        if ("ENTREGADO".equals(estado)) {
            canje.setFechaEntrega(LocalDateTime.now());
        }

        return toCanjeAdmin(canjeRepository.save(canje));
    }

    private CanjeResponse toCanjeResponse(HistorialPremioCanjeado canje, Integer puntosRestantes) {
        return new CanjeResponse(
                canje.getId(),
                canje.getPremio().getId(),
                canje.getNombrePremio(),
                canje.getPuntosGastados(),
                canje.getCodigoCanje(),
                canje.getEstado(),
                normalizarSiNo(canje.getEnvioDomicilio()),
                canje.getDireccionEnvio(),
                puntosRestantes,
                canje.getFechaCanje()
        );
    }

    private CanjeAdminDto toCanjeAdmin(HistorialPremioCanjeado canje) {
        Usuario usuario = canje.getUsuario();
        Premio premio = canje.getPremio();

        return new CanjeAdminDto(
                canje.getId(),
                usuario == null ? null : usuario.getId(),
                usuario == null ? "Usuario no disponible" : usuario.getNombreAlias(),
                usuario == null ? "" : usuario.getCorreo(),
                premio == null ? null : premio.getId(),
                canje.getNombrePremio(),
                canje.getPuntosGastados(),
                canje.getCodigoCanje(),
                canje.getEstado(),
                normalizarSiNo(canje.getEnvioDomicilio()),
                canje.getDireccionEnvio(),
                canje.getObservacion(),
                canje.getFechaCanje(),
                canje.getFechaEntrega()
        );
    }

    private String normalizarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new ReglaNegocioException("Debes indicar el estado del canje");
        }

        String normalizado = estado.trim().toUpperCase();

        if (!List.of("PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO").contains(normalizado)) {
            throw new ReglaNegocioException("Estado de canje no válido");
        }

        return normalizado;
    }

    private String normalizarSiNo(String valor) {
        return valor != null && valor.trim().equalsIgnoreCase("S") ? "S" : "N";
    }

    private String limpiarTexto(String texto) {
        return texto == null ? "" : texto.trim();
    }

    public CanjeService(
            UsuarioRepository usuarioRepository,
            PremioRepository premioRepository,
            HistorialPremioCanjeadoRepository canjeRepository,
            MovimientoPuntosUsuarioRepository movimientoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.premioRepository = premioRepository;
        this.canjeRepository = canjeRepository;
        this.movimientoRepository = movimientoRepository;
    }
}