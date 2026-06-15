package cl.ecoconce.repository;

import cl.ecoconce.entity.MovimientoPuntosUsuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovimientoPuntosUsuarioRepository extends JpaRepository<MovimientoPuntosUsuario, Long> {
    @Override
    @EntityGraph(attributePaths = {"usuario", "formulario", "canje"})
    List<MovimientoPuntosUsuario> findAll();

    @Query("select coalesce(sum(m.puntos), 0) from MovimientoPuntosUsuario m where m.usuario.id = :usuarioId and m.tipoMovimiento = 'GANANCIA'")
    Long sumarPuntosGanadosPorUsuario(@Param("usuarioId") Long usuarioId);
}
