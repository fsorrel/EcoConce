package cl.ecoconce.repository;

import cl.ecoconce.entity.ReportePunto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportePuntoRepository extends JpaRepository<ReportePunto, Long> {
    @Override
    @EntityGraph(attributePaths = {"usuario", "punto", "punto.mantenedor", "tipoReporte"})
    List<ReportePunto> findAll();

    @EntityGraph(attributePaths = {"usuario", "punto", "punto.mantenedor", "tipoReporte"})
    List<ReportePunto> findAllByOrderByFechaReporteDesc();

    @EntityGraph(attributePaths = {"usuario", "punto", "punto.mantenedor", "tipoReporte"})
    List<ReportePunto> findByPuntoMantenedorIdOrderByFechaReporteDesc(Long mantenedorId);
}