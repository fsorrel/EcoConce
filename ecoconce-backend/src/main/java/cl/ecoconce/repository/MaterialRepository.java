package cl.ecoconce.repository;

import cl.ecoconce.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    Optional<Material> findByCodigoIdentificador(String codigoIdentificador);
}
