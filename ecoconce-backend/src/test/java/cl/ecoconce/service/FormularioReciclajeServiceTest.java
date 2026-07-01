package cl.ecoconce.service;

import cl.ecoconce.dto.FormularioMaterialRequest;
import cl.ecoconce.dto.FormularioRequest;
import cl.ecoconce.entity.FormularioReciclaje;
import cl.ecoconce.entity.Material;
import cl.ecoconce.entity.PuntoMaterial;
import cl.ecoconce.entity.PuntoReciclaje;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.DetalleFormularioMaterialRepository;
import cl.ecoconce.repository.FormularioReciclajeRepository;
import cl.ecoconce.repository.MaterialRepository;
import cl.ecoconce.repository.MovimientoPuntosUsuarioRepository;
import cl.ecoconce.repository.PuntoMaterialRepository;
import cl.ecoconce.repository.PuntoReciclajeRepository;
import cl.ecoconce.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de FormularioReciclajeService (sin levantar Spring).
 * Cubren la acumulación de puntos al aprobar, la idempotencia de la aprobación,
 * el rechazo de un formulario ya aprobado y las validaciones de creación
 * (distancia, usuario inexistente y formulario pendiente duplicado).
 */
@ExtendWith(MockitoExtension.class)
class FormularioReciclajeServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock PuntoReciclajeRepository puntoRepository;
    @Mock MaterialRepository materialRepository;
    @Mock FormularioReciclajeRepository formularioRepository;
    @Mock DetalleFormularioMaterialRepository detalleRepository;
    @Mock MovimientoPuntosUsuarioRepository movimientoRepository;
    @Mock PuntoMaterialRepository puntoMaterialRepository;
    @Mock MapperService mapper;

    @InjectMocks FormularioReciclajeService service;

    private Usuario usuario;
    private PuntoReciclaje punto;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder().id(1L).puntos(100).build();
        punto = PuntoReciclaje.builder().id(1L).radioValidacionM(50).build();
    }

    @Test
    @DisplayName("Aprobar acumula los puntos al usuario y registra el movimiento")
    void aprobar_acumulaPuntosYRegistraMovimiento() {
        FormularioReciclaje formulario = FormularioReciclaje.builder()
                .id(1L)
                .usuario(usuario)
                .punto(punto)
                .estado("PENDIENTE")
                .totalPuntosObtenidos(50)
                .build();

        when(formularioRepository.findById(1L)).thenReturn(Optional.of(formulario));

        service.aprobar(1L);

        assertThat(usuario.getPuntos()).isEqualTo(150);   // 100 + 50
        assertThat(formulario.getEstado()).isEqualTo("APROBADO");
        verify(usuarioRepository).save(usuario);
        verify(movimientoRepository).save(any());
    }

    @Test
    @DisplayName("Aprobar un formulario ya aprobado no vuelve a sumar puntos")
    void aprobar_yaAprobado_noVuelveASumar() {
        FormularioReciclaje formulario = FormularioReciclaje.builder()
                .id(1L)
                .usuario(usuario)
                .punto(punto)
                .estado("APROBADO")
                .totalPuntosObtenidos(50)
                .build();

        when(formularioRepository.findById(1L)).thenReturn(Optional.of(formulario));

        service.aprobar(1L);

        assertThat(usuario.getPuntos()).isEqualTo(100);   // sin cambios
        verify(movimientoRepository, never()).save(any());
    }

    @Test
    @DisplayName("No se puede rechazar un formulario ya aprobado")
    void rechazar_aprobado_lanzaReglaNegocio() {
        FormularioReciclaje formulario = FormularioReciclaje.builder()
                .id(1L)
                .usuario(usuario)
                .punto(punto)
                .estado("APROBADO")
                .totalPuntosObtenidos(50)
                .build();

        when(formularioRepository.findById(1L)).thenReturn(Optional.of(formulario));

        assertThatThrownBy(() -> service.rechazar(1L, "motivo"))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("aprobado");
    }

    @Test
    @DisplayName("Crear sin distancia válida lanza ReglaNegocio")
    void crear_distanciaInvalida_lanzaReglaNegocio() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));

        FormularioRequest request = new FormularioRequest(1L, null, null, List.of());

        assertThatThrownBy(() -> service.crear(1L, request))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("distancia");
    }

    @Test
    @DisplayName("Crear con usuario inexistente lanza RecursoNoEncontrado")
    void crear_usuarioInexistente_lanzaRecursoNoEncontrado() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        FormularioRequest request = new FormularioRequest(1L, 10.0, null, List.of());

        assertThatThrownBy(() -> service.crear(99L, request))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("Usuario");
    }

    @Test
    @DisplayName("No se permite un segundo formulario pendiente para el mismo punto")
    void crear_formularioPendienteDuplicado_lanzaReglaNegocio() {
        Material material = Material.builder()
                .id(1L)
                .nombre("PET transparente")
                .codigoIdentificador("PET_TRANSPARENTE")
                .build();
        PuntoMaterial puntoMaterial = PuntoMaterial.builder()
                .material(material)
                .capacidadCompactado(100)
                .actualCompactado(0)
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(puntoRepository.findById(1L)).thenReturn(Optional.of(punto));
        when(puntoMaterialRepository.findByPuntoId(1L)).thenReturn(List.of(puntoMaterial));
        when(formularioRepository.existsByUsuarioIdAndPuntoIdAndEstadoIgnoreCase(1L, 1L, "PENDIENTE"))
                .thenReturn(true);

        FormularioRequest request = new FormularioRequest(
                1L, 10.0, null,
                List.of(new FormularioMaterialRequest(1L, 1, "UNIDAD", null)));

        assertThatThrownBy(() -> service.crear(1L, request))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("pendiente");
    }
}
