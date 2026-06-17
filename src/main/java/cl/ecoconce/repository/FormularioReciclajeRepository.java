package cl.ecoconce.repository;

import cl.ecoconce.entity.FormularioReciclaje;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FormularioReciclajeRepository extends JpaRepository<FormularioReciclaje, Long> {
    @Override
    @EntityGraph(attributePaths = {"usuario", "punto"})
    List<FormularioReciclaje> findAll();

    @Override
    @EntityGraph(attributePaths = {"usuario", "punto"})
    Optional<FormularioReciclaje> findById(Long id);

    Long countByUsuarioIdAndEstado(Long usuarioId, String estado);

    @EntityGraph(attributePaths = {"usuario", "punto"})
    List<FormularioReciclaje> findTop5ByUsuarioIdOrderByFechaFormularioDesc(Long usuarioId);
}
