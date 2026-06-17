package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado_puntos")
public class HistorialEstadoPunto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "punto_id")
    private PuntoReciclaje punto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_anterior_id")
    private EstadoPunto estadoAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_nuevo_id")
    private EstadoPunto estadoNuevo;

    @Lob
    private String descripcion;

    @Column(name = "fecha_historial")
    private LocalDateTime fechaHistorial;

    @PrePersist
    void prePersist() {
        if (fechaHistorial == null) fechaHistorial = LocalDateTime.now();
    }


    public HistorialEstadoPunto() {
    }

    public HistorialEstadoPunto(Long id, PuntoReciclaje punto, EstadoPunto estadoAnterior, EstadoPunto estadoNuevo, String descripcion, LocalDateTime fechaHistorial) {
        this.id = id;
        this.punto = punto;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.descripcion = descripcion;
        this.fechaHistorial = fechaHistorial;
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

    public EstadoPunto getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(EstadoPunto estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public EstadoPunto getEstadoNuevo() {
        return estadoNuevo;
    }

    public void setEstadoNuevo(EstadoPunto estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaHistorial() {
        return fechaHistorial;
    }

    public void setFechaHistorial(LocalDateTime fechaHistorial) {
        this.fechaHistorial = fechaHistorial;
    }

    public static HistorialEstadoPuntoBuilder builder() {
        return new HistorialEstadoPuntoBuilder();
    }

    public static class HistorialEstadoPuntoBuilder {
        private Long id;
        private PuntoReciclaje punto;
        private EstadoPunto estadoAnterior;
        private EstadoPunto estadoNuevo;
    private String descripcion;
        private LocalDateTime fechaHistorial;

        public HistorialEstadoPuntoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HistorialEstadoPuntoBuilder punto(PuntoReciclaje punto) {
            this.punto = punto;
            return this;
        }

        public HistorialEstadoPuntoBuilder estadoAnterior(EstadoPunto estadoAnterior) {
            this.estadoAnterior = estadoAnterior;
            return this;
        }

        public HistorialEstadoPuntoBuilder estadoNuevo(EstadoPunto estadoNuevo) {
            this.estadoNuevo = estadoNuevo;
            return this;
        }

        public HistorialEstadoPuntoBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public HistorialEstadoPuntoBuilder fechaHistorial(LocalDateTime fechaHistorial) {
            this.fechaHistorial = fechaHistorial;
            return this;
        }

        public HistorialEstadoPunto build() {
            return new HistorialEstadoPunto(id, punto, estadoAnterior, estadoNuevo, descripcion, fechaHistorial);
        }
    }
}
