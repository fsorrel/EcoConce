package cl.ecoconce.repository;

import cl.ecoconce.entity.PuntoMaterial;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PuntoMaterialRepository extends JpaRepository<PuntoMaterial, Long> {
    @Override
    @EntityGraph(attributePaths = {"punto", "material"})
    List<PuntoMaterial> findAll();

    @EntityGraph(attributePaths = {"punto", "material"})
    List<PuntoMaterial> findByPuntoId(Long puntoId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from PuntoMaterial pm where pm.punto.id = :puntoId")
    int deleteByPuntoId(@Param("puntoId") Long puntoId);
}