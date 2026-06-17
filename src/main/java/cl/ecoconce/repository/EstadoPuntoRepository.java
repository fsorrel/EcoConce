package cl.ecoconce.repository;

import cl.ecoconce.entity.EstadoPunto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoPuntoRepository extends JpaRepository<EstadoPunto, Long> {
    Optional<EstadoPunto> findByNombreIgnoreCase(String nombre);
}