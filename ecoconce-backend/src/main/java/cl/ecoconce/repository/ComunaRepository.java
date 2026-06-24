package cl.ecoconce.repository;

import cl.ecoconce.entity.Comuna;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComunaRepository extends JpaRepository<Comuna, Long> {
    @Override
    @EntityGraph(attributePaths = {"region"})
    List<Comuna> findAll();

    @Override
    @EntityGraph(attributePaths = {"region"})
    Optional<Comuna> findById(Long id);

    Optional<Comuna> findByNombreAndRegionId(String nombre, Long regionId);
}