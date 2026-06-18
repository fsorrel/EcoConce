package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_recolecciones_puntos")
public class HistorialRecoleccionPunto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "punto_id")
    private PuntoReciclaje punto;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mantenedor_id")
    private Usuario mantenedor;

    @Column(name = "cantidad_retirada_compactada", nullable = false)
    private Integer cantidadRetiradaCompactada;

    @Lob
    private String observacion;

    @Column(name = "fecha_recoleccion")
    private LocalDateTime fechaRecoleccion;

    @PrePersist
    void prePersist() {
        if (fechaRecoleccion == null) fechaRecoleccion = LocalDateTime.now();
    }


    public HistorialRecoleccionPunto() {
    }

    public HistorialRecoleccionPunto(Long id, PuntoReciclaje punto, Material material, Usuario mantenedor, Integer cantidadRetiradaCompactada, String observacion, LocalDateTime fechaRecoleccion) {
        this.id = id;
        this.punto = punto;
        this.material = material;
        this.mantenedor = mantenedor;
        this.cantidadRetiradaCompactada = cantidadRetiradaCompactada;
        this.observacion = observacion;
        this.fechaRecoleccion = fechaRecoleccion;
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

    public Usuario getMantenedor() {
        return mantenedor;
    }

    public void setMantenedor(Usuario mantenedor) {
        this.mantenedor = mantenedor;
    }

    public Integer getCantidadRetiradaCompactada() {
        return cantidadRetiradaCompactada;
    }

    public void setCantidadRetiradaCompactada(Integer cantidadRetiradaCompactada) {
        this.cantidadRetiradaCompactada = cantidadRetiradaCompactada;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public LocalDateTime getFechaRecoleccion() {
        return fechaRecoleccion;
    }

    public void setFechaRecoleccion(LocalDateTime fechaRecoleccion) {
        this.fechaRecoleccion = fechaRecoleccion;
    }

    public static HistorialRecoleccionPuntoBuilder builder() {
        return new HistorialRecoleccionPuntoBuilder();
    }

    public static class HistorialRecoleccionPuntoBuilder {
        private Long id;
        private PuntoReciclaje punto;
        private Material material;
        private Usuario mantenedor;
        private Integer cantidadRetiradaCompactada;
    private String observacion;
        private LocalDateTime fechaRecoleccion;

        public HistorialRecoleccionPuntoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HistorialRecoleccionPuntoBuilder punto(PuntoReciclaje punto) {
            this.punto = punto;
            return this;
        }

        public HistorialRecoleccionPuntoBuilder material(Material material) {
            this.material = material;
            return this;
        }

        public HistorialRecoleccionPuntoBuilder mantenedor(Usuario mantenedor) {
            this.mantenedor = mantenedor;
            return this;
        }

        public HistorialRecoleccionPuntoBuilder cantidadRetiradaCompactada(Integer cantidadRetiradaCompactada) {
            this.cantidadRetiradaCompactada = cantidadRetiradaCompactada;
            return this;
        }

        public HistorialRecoleccionPuntoBuilder observacion(String observacion) {
            this.observacion = observacion;
            return this;
        }

        public HistorialRecoleccionPuntoBuilder fechaRecoleccion(LocalDateTime fechaRecoleccion) {
            this.fechaRecoleccion = fechaRecoleccion;
            return this;
        }

        public HistorialRecoleccionPunto build() {
            return new HistorialRecoleccionPunto(id, punto, material, mantenedor, cantidadRetiradaCompactada, observacion, fechaRecoleccion);
        }
    }
}
