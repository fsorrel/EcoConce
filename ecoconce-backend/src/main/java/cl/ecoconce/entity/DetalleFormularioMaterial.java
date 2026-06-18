package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_formulario_materiales", uniqueConstraints = @UniqueConstraint(columnNames = {"formulario_id", "material_id"}))
public class DetalleFormularioMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "formulario_id")
    private FormularioReciclaje formulario;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "cantidad_declarada", nullable = false)
    private Double cantidadDeclarada;

    @Column(name = "unidad_declarada", nullable = false, length = 30)
    private String unidadDeclarada;

    @Column(name = "puntos_obtenidos", nullable = false)
    private Integer puntosObtenidos;

    @Lob
    private String observacion;

    @PrePersist
    void prePersist() {
        if (unidadDeclarada == null) unidadDeclarada = "UNIDAD";
        if (puntosObtenidos == null) puntosObtenidos = 0;
    }


    public DetalleFormularioMaterial() {
    }

    public DetalleFormularioMaterial(Long id, FormularioReciclaje formulario, Material material, Double cantidadDeclarada, String unidadDeclarada, Integer puntosObtenidos, String observacion) {
        this.id = id;
        this.formulario = formulario;
        this.material = material;
        this.cantidadDeclarada = cantidadDeclarada;
        this.unidadDeclarada = unidadDeclarada;
        this.puntosObtenidos = puntosObtenidos;
        this.observacion = observacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FormularioReciclaje getFormulario() {
        return formulario;
    }

    public void setFormulario(FormularioReciclaje formulario) {
        this.formulario = formulario;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public Double getCantidadDeclarada() {
        return cantidadDeclarada;
    }

    public void setCantidadDeclarada(Double cantidadDeclarada) {
        this.cantidadDeclarada = cantidadDeclarada;
    }

    public String getUnidadDeclarada() {
        return unidadDeclarada;
    }

    public void setUnidadDeclarada(String unidadDeclarada) {
        this.unidadDeclarada = unidadDeclarada;
    }

    public Integer getPuntosObtenidos() {
        return puntosObtenidos;
    }

    public void setPuntosObtenidos(Integer puntosObtenidos) {
        this.puntosObtenidos = puntosObtenidos;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public static DetalleFormularioMaterialBuilder builder() {
        return new DetalleFormularioMaterialBuilder();
    }

    public static class DetalleFormularioMaterialBuilder {
        private Long id;
        private FormularioReciclaje formulario;
        private Material material;
        private Double cantidadDeclarada;
        private String unidadDeclarada;
        private Integer puntosObtenidos;
    private String observacion;

        public DetalleFormularioMaterialBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public DetalleFormularioMaterialBuilder formulario(FormularioReciclaje formulario) {
            this.formulario = formulario;
            return this;
        }

        public DetalleFormularioMaterialBuilder material(Material material) {
            this.material = material;
            return this;
        }

        public DetalleFormularioMaterialBuilder cantidadDeclarada(Double cantidadDeclarada) {
            this.cantidadDeclarada = cantidadDeclarada;
            return this;
        }

        public DetalleFormularioMaterialBuilder unidadDeclarada(String unidadDeclarada) {
            this.unidadDeclarada = unidadDeclarada;
            return this;
        }

        public DetalleFormularioMaterialBuilder puntosObtenidos(Integer puntosObtenidos) {
            this.puntosObtenidos = puntosObtenidos;
            return this;
        }

        public DetalleFormularioMaterialBuilder observacion(String observacion) {
            this.observacion = observacion;
            return this;
        }

        public DetalleFormularioMaterial build() {
            return new DetalleFormularioMaterial(id, formulario, material, cantidadDeclarada, unidadDeclarada, puntosObtenidos, observacion);
        }
    }
}
