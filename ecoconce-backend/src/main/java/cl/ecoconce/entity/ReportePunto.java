package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_puntos")
public class ReportePunto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "punto_id")
    private PuntoReciclaje punto;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_reporte_id")
    private TipoReporte tipoReporte;

    @Lob
    private String descripcion;

    @Column(name = "fecha_reporte")
    private LocalDateTime fechaReporte;

    @PrePersist
    void prePersist() {
        if (fechaReporte == null) fechaReporte = LocalDateTime.now();
    }


    public ReportePunto() {
    }

    public ReportePunto(Long id, Usuario usuario, PuntoReciclaje punto, TipoReporte tipoReporte, String descripcion, LocalDateTime fechaReporte) {
        this.id = id;
        this.usuario = usuario;
        this.punto = punto;
        this.tipoReporte = tipoReporte;
        this.descripcion = descripcion;
        this.fechaReporte = fechaReporte;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public PuntoReciclaje getPunto() {
        return punto;
    }

    public void setPunto(PuntoReciclaje punto) {
        this.punto = punto;
    }

    public TipoReporte getTipoReporte() {
        return tipoReporte;
    }

    public void setTipoReporte(TipoReporte tipoReporte) {
        this.tipoReporte = tipoReporte;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaReporte() {
        return fechaReporte;
    }

    public void setFechaReporte(LocalDateTime fechaReporte) {
        this.fechaReporte = fechaReporte;
    }

    public static ReportePuntoBuilder builder() {
        return new ReportePuntoBuilder();
    }

    public static class ReportePuntoBuilder {
        private Long id;
        private Usuario usuario;
        private PuntoReciclaje punto;
        private TipoReporte tipoReporte;
    private String descripcion;
        private LocalDateTime fechaReporte;

        public ReportePuntoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ReportePuntoBuilder usuario(Usuario usuario) {
            this.usuario = usuario;
            return this;
        }

        public ReportePuntoBuilder punto(PuntoReciclaje punto) {
            this.punto = punto;
            return this;
        }

        public ReportePuntoBuilder tipoReporte(TipoReporte tipoReporte) {
            this.tipoReporte = tipoReporte;
            return this;
        }

        public ReportePuntoBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public ReportePuntoBuilder fechaReporte(LocalDateTime fechaReporte) {
            this.fechaReporte = fechaReporte;
            return this;
        }

        public ReportePunto build() {
            return new ReportePunto(id, usuario, punto, tipoReporte, descripcion, fechaReporte);
        }
    }
}
