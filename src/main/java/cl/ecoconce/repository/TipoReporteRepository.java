package cl.ecoconce.repository;

import cl.ecoconce.entity.TipoReporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TipoReporteRepository extends JpaRepository<TipoReporte, Long> {
    List<TipoReporte> findAllByOrderByNombreAsc();
}