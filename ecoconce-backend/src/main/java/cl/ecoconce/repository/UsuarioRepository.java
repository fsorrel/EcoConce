package cl.ecoconce.repository;

import cl.ecoconce.entity.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    @Override
    @EntityGraph(attributePaths = {"comuna", "rol"})
    List<Usuario> findAll();

    @Override
    @EntityGraph(attributePaths = {"comuna", "rol"})
    Optional<Usuario> findById(Long id);

    @EntityGraph(attributePaths = {"comuna", "rol"})
    Optional<Usuario> findByCorreo(String correo);

    @EntityGraph(attributePaths = {"comuna", "rol"})
    List<Usuario> findByActivoOrderByIdAsc(String activo);

    boolean existsByCorreo(String correo);
    boolean existsByRut(String rut);
}