package cl.ecoconce.repository;

import cl.ecoconce.entity.GuiaReciclaje;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuiaReciclajeRepository extends JpaRepository<GuiaReciclaje, Long> {
    @Override
    @EntityGraph(attributePaths = {"material"})
    List<GuiaReciclaje> findAll();
}
