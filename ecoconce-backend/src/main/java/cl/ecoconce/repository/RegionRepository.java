package cl.ecoconce.repository;

import cl.ecoconce.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Long> {
    Optional<Region> findByNombre(String nombre);
}