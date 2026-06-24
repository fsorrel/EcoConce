package cl.ecoconce.repository;

import cl.ecoconce.entity.Premio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PremioRepository extends JpaRepository<Premio, Long> {
    List<Premio> findByActivo(String activo);
}
