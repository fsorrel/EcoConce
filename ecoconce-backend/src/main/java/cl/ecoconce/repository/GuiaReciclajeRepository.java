package cl.ecoconce.repository;

import cl.ecoconce.entity.GuiaReciclaje;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface GuiaReciclajeRepository extends JpaRepository<GuiaReciclaje, Long> {
    @Override
    @EntityGraph(attributePaths = {"material"})
    List<GuiaReciclaje> findAll();

    // Permite sembrar guías de forma idempotente (insertar solo las que faltan)
    boolean existsByTitulo(String titulo);

    // Permite limpiar guías obsoletas por título
    long deleteByTituloIn(Collection<String> titulos);
}
