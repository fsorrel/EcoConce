package cl.ecoconce.service;

import cl.ecoconce.dto.CanjeResponse;
import cl.ecoconce.entity.Premio;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.HistorialPremioCanjeadoRepository;
import cl.ecoconce.repository.MovimientoPuntosUsuarioRepository;
import cl.ecoconce.repository.PremioRepository;
import cl.ecoconce.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de la lógica de negocio de canje (sin levantar Spring).
 * Cubren el camino feliz y los casos de error (premio inactivo, sin stock,
 * puntos insuficientes, usuario/premio inexistente).
 */
@ExtendWith(MockitoExtension.class)
class CanjeServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PremioRepository premioRepository;
    @Mock
    private HistorialPremioCanjeadoRepository canjeRepository;
    @Mock
    private MovimientoPuntosUsuarioRepository movimientoRepository;

    @InjectMocks
    private CanjeService canjeService;

    private Usuario usuario(int puntos) {
        return Usuario.builder()
                .id(1L)
                .correo("ciudadano@ecoconce.cl")
                .puntos(puntos)
                .direccion("Concepción centro")
                .build();
    }

    private Premio premio(int stock, int costo, String activo, String envioDomicilio) {
        return Premio.builder()
                .id(1L)
                .nombre("Bolsa Reutilizable")
                .descripcion("Bolsa de tela")
                .costoPuntos(costo)
                .stock(stock)
                .activo(activo)
                .envioDomicilio(envioDomicilio)
                .build();
    }

    @Test
    @DisplayName("Canje exitoso descuenta puntos y stock")
    void canjear_exitoso_descuentaPuntosYStock() {
        Usuario usuario = usuario(200);
        Premio premio = premio(5, 100, "S", "N");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio));
        when(canjeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CanjeResponse response = canjeService.canjear(1L, 1L);

        assertThat(premio.getStock()).isEqualTo(4);       // stock -1
        assertThat(usuario.getPuntos()).isEqualTo(100);   // puntos -100
        assertThat(response.puntosRestantes()).isEqualTo(100);
        verify(canjeRepository).save(any());
        verify(movimientoRepository).save(any());
    }

    @Test
    @DisplayName("Canje de premio inactivo lanza excepción")
    void canjear_premioInactivo_lanzaExcepcion() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario(200)));
        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio(5, 100, "N", "N")));

        assertThatThrownBy(() -> canjeService.canjear(1L, 1L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("activo");
    }

    @Test
    @DisplayName("Canje con stock = 0 lanza excepción")
    void canjear_stockCero_lanzaExcepcion() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario(200)));
        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio(0, 100, "S", "N")));

        assertThatThrownBy(() -> canjeService.canjear(1L, 1L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("stock");
    }

    @Test
    @DisplayName("Canje con puntos insuficientes lanza excepción")
    void canjear_puntosInsuficientes_lanzaExcepcion() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario(100)));
        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio(5, 500, "S", "N")));

        assertThatThrownBy(() -> canjeService.canjear(1L, 1L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("puntos");
    }

    @Test
    @DisplayName("Canje que requiere envío sin dirección lanza excepción")
    void canjear_envioSinDireccion_lanzaExcepcion() {
        Usuario usuario = Usuario.builder().id(1L).puntos(2000).direccion("   ").build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(premioRepository.findById(1L)).thenReturn(Optional.of(premio(5, 100, "S", "S")));

        assertThatThrownBy(() -> canjeService.canjear(1L, 1L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("domicilio");
    }

    @Test
    @DisplayName("Usuario inexistente lanza RecursoNoEncontrado")
    void canjear_usuarioInexistente_lanzaExcepcion() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> canjeService.canjear(99L, 1L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("Usuario");
    }

    @Test
    @DisplayName("Premio inexistente lanza RecursoNoEncontrado")
    void canjear_premioInexistente_lanzaExcepcion() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario(200)));
        when(premioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> canjeService.canjear(1L, 99L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("Premio");
    }
}
