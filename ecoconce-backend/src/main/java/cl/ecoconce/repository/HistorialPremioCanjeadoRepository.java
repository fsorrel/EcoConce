package cl.ecoconce.repository;

import cl.ecoconce.entity.HistorialPremioCanjeado;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialPremioCanjeadoRepository extends JpaRepository<HistorialPremioCanjeado, Long> {
    @Override
    @EntityGraph(attributePaths = {"usuario", "premio"})
    List<HistorialPremioCanjeado> findAll();

    @EntityGraph(attributePaths = {"usuario", "premio"})
    List<HistorialPremioCanjeado> findAllByOrderByFechaCanjeDesc();

    @EntityGraph(attributePaths = {"usuario", "premio"})
    List<HistorialPremioCanjeado> findByEstadoOrderByFechaCanjeDesc(String estado);
}