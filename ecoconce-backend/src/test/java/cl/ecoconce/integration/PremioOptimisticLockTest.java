package cl.ecoconce.integration;

import cl.ecoconce.entity.Premio;
import cl.ecoconce.repository.PremioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Verifica el control de concurrencia optimista (@Version) en Premio.
 *
 * No usa @Transactional a propósito: cada llamada al repositorio confirma y
 * deja la entidad "detached", lo que permite simular dos transacciones que
 * leen la misma versión y luego intentan actualizar (como dos canjes
 * simultáneos del mismo premio).
 */
@SpringBootTest
@ActiveProfiles("test")
public class PremioOptimisticLockTest {

    @Autowired
    private PremioRepository premioRepository;

    private Long premioId;

    @AfterEach
    void limpiar() {
        if (premioId != null) {
            premioRepository.findById(premioId).ifPresent(premioRepository::delete);
            premioId = null;
        }
    }

    private Premio nuevoPremio() {
        // costo muy alto y envío "S" para que no interfiera con otros tests de canje
        return premioRepository.saveAndFlush(Premio.builder()
                .nombre("Premio Concurrencia Test")
                .descripcion("Premio para probar bloqueo optimista")
                .costoPuntos(999999)
                .stock(5)
                .activo("S")
                .envioDomicilio("S")
                .build());
    }

    @Test
    @DisplayName("La versión se inicializa en 0 y se incrementa al actualizar")
    void version_seIncrementaAlActualizar() {
        Premio premio = nuevoPremio();
        premioId = premio.getId();
        assertThat(premio.getVersion()).isEqualTo(0L);

        premio.setStock(4);
        Premio actualizado = premioRepository.saveAndFlush(premio);

        assertThat(actualizado.getVersion()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Dos actualizaciones sobre la misma versión lanzan OptimisticLockException")
    void actualizacionConcurrente_lanzaOptimisticLock() {
        premioId = nuevoPremio().getId();

        // Dos copias "detached" que simulan dos transacciones leyendo la misma versión (0)
        Premio copiaA = premioRepository.findById(premioId).orElseThrow();
        Premio copiaB = premioRepository.findById(premioId).orElseThrow();

        // La primera actualiza con éxito: version 0 -> 1
        copiaA.setStock(4);
        premioRepository.saveAndFlush(copiaA);

        // La segunda aún tiene la versión vieja (0) y choca con la nueva (1)
        copiaB.setStock(3);
        assertThatThrownBy(() -> premioRepository.saveAndFlush(copiaB))
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);
    }
}
