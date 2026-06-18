package cl.ecoconce.repository;

import cl.ecoconce.entity.HistorialEstadoPunto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoPuntoRepository extends JpaRepository<HistorialEstadoPunto, Long> {
    @Override
    @EntityGraph(attributePaths = {"punto", "estadoAnterior", "estadoNuevo"})
    List<HistorialEstadoPunto> findAll();
}
