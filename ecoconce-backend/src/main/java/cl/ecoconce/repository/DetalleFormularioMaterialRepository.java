package cl.ecoconce.repository;

import cl.ecoconce.entity.DetalleFormularioMaterial;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DetalleFormularioMaterialRepository extends JpaRepository<DetalleFormularioMaterial, Long> {
    @Override
    @EntityGraph(attributePaths = {"formulario", "material"})
    List<DetalleFormularioMaterial> findAll();

    @Query("select coalesce(sum(d.cantidadDeclarada), 0) from DetalleFormularioMaterial d where d.formulario.usuario.id = :usuarioId and d.formulario.estado = 'APROBADO'")
    Double sumarCantidadAprobadaPorUsuario(@Param("usuarioId") Long usuarioId);
}
