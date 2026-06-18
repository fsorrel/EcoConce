package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "punto_materiales", uniqueConstraints = @UniqueConstraint(columnNames = {"punto_id", "material_id"}))
public class PuntoMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "punto_id")
    private PuntoReciclaje punto;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "capacidad_compactado", nullable = false)
    private Integer capacidadCompactado;

    @Column(name = "actual_compactado", nullable = false)
    private Integer actualCompactado;

    @PrePersist
    void prePersist() {
        if (capacidadCompactado == null) capacidadCompactado = 0;
        if (actualCompactado == null) actualCompactado = 0;
    }


    public PuntoMaterial() {
    }

    public PuntoMaterial(Long id, PuntoReciclaje punto, Material material, Integer capacidadCompactado, Integer actualCompactado) {
        this.id = id;
        this.punto = punto;
        this.material = material;
        this.capacidadCompactado = capacidadCompactado;
        this.actualCompactado = actualCompactado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PuntoReciclaje getPunto() {
        return punto;
    }

    public void setPunto(PuntoReciclaje punto) {
        this.punto = punto;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public Integer getCapacidadCompactado() {
        return capacidadCompactado;
    }

    public void setCapacidadCompactado(Integer capacidadCompactado) {
        this.capacidadCompactado = capacidadCompactado;
    }

    public Integer getActualCompactado() {
        return actualCompactado;
    }

    public void setActualCompactado(Integer actualCompactado) {
        this.actualCompactado = actualCompactado;
    }

    public static PuntoMaterialBuilder builder() {
        return new PuntoMaterialBuilder();
    }

    public static class PuntoMaterialBuilder {
        private Long id;
        private PuntoReciclaje punto;
        private Material material;
        private Integer capacidadCompactado;
        private Integer actualCompactado;

        public PuntoMaterialBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PuntoMaterialBuilder punto(PuntoReciclaje punto) {
            this.punto = punto;
            return this;
        }

        public PuntoMaterialBuilder material(Material material) {
            this.material = material;
            return this;
        }

        public PuntoMaterialBuilder capacidadCompactado(Integer capacidadCompactado) {
            this.capacidadCompactado = capacidadCompactado;
            return this;
        }

        public PuntoMaterialBuilder actualCompactado(Integer actualCompactado) {
            this.actualCompactado = actualCompactado;
            return this;
        }

        public PuntoMaterial build() {
            return new PuntoMaterial(id, punto, material, capacidadCompactado, actualCompactado);
        }
    }
}
