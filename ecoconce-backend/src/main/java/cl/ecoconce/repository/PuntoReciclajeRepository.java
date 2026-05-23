package cl.ecoconce.repository;

import cl.ecoconce.entity.PuntoReciclaje;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PuntoReciclajeRepository extends JpaRepository<PuntoReciclaje, Long> {
    @Override
    @EntityGraph(attributePaths = {"comuna", "estado", "mantenedor"})
    List<PuntoReciclaje> findAll();

    @Override
    @EntityGraph(attributePaths = {"comuna", "estado", "mantenedor"})
    Optional<PuntoReciclaje> findById(Long id);

    @EntityGraph(attributePaths = {"comuna", "estado", "mantenedor"})
    List<PuntoReciclaje> findByMantenedorId(Long mantenedorId);
}