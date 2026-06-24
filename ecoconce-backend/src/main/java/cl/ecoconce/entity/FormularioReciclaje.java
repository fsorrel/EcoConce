package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "formularios_reciclaje")
public class FormularioReciclaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "punto_id")
    private PuntoReciclaje punto;

    @Column(name = "distancia_metros", nullable = false)
    private Double distanciaMetros;

    @Column(name = "total_puntos_obtenidos", nullable = false)
    private Integer totalPuntosObtenidos;

    @Column(nullable = false, length = 20)
    private String estado;

    @Lob
    private String observacion;

    @Column(name = "fecha_formulario")
    private LocalDateTime fechaFormulario;

    @PrePersist
    void prePersist() {
        if (totalPuntosObtenidos == null) totalPuntosObtenidos = 0;
        if (estado == null) estado = "PENDIENTE";
        if (fechaFormulario == null) fechaFormulario = LocalDateTime.now();
    }


    public FormularioReciclaje() {
    }

    public FormularioReciclaje(Long id, Usuario usuario, PuntoReciclaje punto, Double distanciaMetros, Integer totalPuntosObtenidos, String estado, String observacion, LocalDateTime fechaFormulario) {
        this.id = id;
        this.usuario = usuario;
        this.punto = punto;
        this.distanciaMetros = distanciaMetros;
        this.totalPuntosObtenidos = totalPuntosObtenidos;
        this.estado = estado;
        this.observacion = observacion;
        this.fechaFormulario = fechaFormulario;
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

    public Double getDistanciaMetros() {
        return distanciaMetros;
    }

    public void setDistanciaMetros(Double distanciaMetros) {
        this.distanciaMetros = distanciaMetros;
    }

    public Integer getTotalPuntosObtenidos() {
        return totalPuntosObtenidos;
    }

    public void setTotalPuntosObtenidos(Integer totalPuntosObtenidos) {
        this.totalPuntosObtenidos = totalPuntosObtenidos;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public LocalDateTime getFechaFormulario() {
        return fechaFormulario;
    }

    public void setFechaFormulario(LocalDateTime fechaFormulario) {
        this.fechaFormulario = fechaFormulario;
    }

    public static FormularioReciclajeBuilder builder() {
        return new FormularioReciclajeBuilder();
    }

    public static class FormularioReciclajeBuilder {
        private Long id;
        private Usuario usuario;
        private PuntoReciclaje punto;
        private Double distanciaMetros;
        private Integer totalPuntosObtenidos;
        private String estado;
    private String observacion;
        private LocalDateTime fechaFormulario;

        public FormularioReciclajeBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FormularioReciclajeBuilder usuario(Usuario usuario) {
            this.usuario = usuario;
            return this;
        }

        public FormularioReciclajeBuilder punto(PuntoReciclaje punto) {
            this.punto = punto;
            return this;
        }

        public FormularioReciclajeBuilder distanciaMetros(Double distanciaMetros) {
            this.distanciaMetros = distanciaMetros;
            return this;
        }

        public FormularioReciclajeBuilder totalPuntosObtenidos(Integer totalPuntosObtenidos) {
            this.totalPuntosObtenidos = totalPuntosObtenidos;
            return this;
        }

        public FormularioReciclajeBuilder estado(String estado) {
            this.estado = estado;
            return this;
        }

        public FormularioReciclajeBuilder observacion(String observacion) {
            this.observacion = observacion;
            return this;
        }

        public FormularioReciclajeBuilder fechaFormulario(LocalDateTime fechaFormulario) {
            this.fechaFormulario = fechaFormulario;
            return this;
        }

        public FormularioReciclaje build() {
            return new FormularioReciclaje(id, usuario, punto, distanciaMetros, totalPuntosObtenidos, estado, observacion, fechaFormulario);
        }
    }
}
