package cl.ecoconce.repository;

import cl.ecoconce.entity.HistorialRecoleccionPunto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialRecoleccionPuntoRepository extends JpaRepository<HistorialRecoleccionPunto, Long> {
    @Override
    @EntityGraph(attributePaths = {"punto", "material", "mantenedor"})
    List<HistorialRecoleccionPunto> findAll();
}
