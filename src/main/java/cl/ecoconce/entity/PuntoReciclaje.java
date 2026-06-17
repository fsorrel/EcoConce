package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "puntos_reciclaje")
public class PuntoReciclaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Lob
    @Column(nullable = false)
    private String descripcion;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "comuna_id")
    private Comuna comuna;

    @Column(length = 200)
    private String direccion;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(name = "radio_validacion_m", nullable = false)
    private Integer radioValidacionM;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id")
    private EstadoPunto estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mantenedor_id")
    private Usuario mantenedor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    @PrePersist
    void prePersist() {
        if (radioValidacionM == null) radioValidacionM = 50;
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (ultimaActualizacion == null) ultimaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        ultimaActualizacion = LocalDateTime.now();
    }


    public PuntoReciclaje() {
    }

    public PuntoReciclaje(Long id, String nombre, String descripcion, Comuna comuna, String direccion, Double latitud, Double longitud, Integer radioValidacionM, EstadoPunto estado, Usuario mantenedor, LocalDateTime fechaCreacion, LocalDateTime ultimaActualizacion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.comuna = comuna;
        this.direccion = direccion;
        this.latitud = latitud;
        this.longitud = longitud;
        this.radioValidacionM = radioValidacionM;
        this.estado = estado;
        this.mantenedor = mantenedor;
        this.fechaCreacion = fechaCreacion;
        this.ultimaActualizacion = ultimaActualizacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Comuna getComuna() {
        return comuna;
    }

    public void setComuna(Comuna comuna) {
        this.comuna = comuna;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public Integer getRadioValidacionM() {
        return radioValidacionM;
    }

    public void setRadioValidacionM(Integer radioValidacionM) {
        this.radioValidacionM = radioValidacionM;
    }

    public EstadoPunto getEstado() {
        return estado;
    }

    public void setEstado(EstadoPunto estado) {
        this.estado = estado;
    }

    public Usuario getMantenedor() {
        return mantenedor;
    }

    public void setMantenedor(Usuario mantenedor) {
        this.mantenedor = mantenedor;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getUltimaActualizacion() {
        return ultimaActualizacion;
    }

    public void setUltimaActualizacion(LocalDateTime ultimaActualizacion) {
        this.ultimaActualizacion = ultimaActualizacion;
    }

    public static PuntoReciclajeBuilder builder() {
        return new PuntoReciclajeBuilder();
    }

    public static class PuntoReciclajeBuilder {
        private Long id;
        private String nombre;
    private String descripcion;
        private Comuna comuna;
        private String direccion;
        private Double latitud;
        private Double longitud;
        private Integer radioValidacionM;
        private EstadoPunto estado;
        private Usuario mantenedor;
        private LocalDateTime fechaCreacion;
        private LocalDateTime ultimaActualizacion;

        public PuntoReciclajeBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PuntoReciclajeBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public PuntoReciclajeBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public PuntoReciclajeBuilder comuna(Comuna comuna) {
            this.comuna = comuna;
            return this;
        }

        public PuntoReciclajeBuilder direccion(String direccion) {
            this.direccion = direccion;
            return this;
        }

        public PuntoReciclajeBuilder latitud(Double latitud) {
            this.latitud = latitud;
            return this;
        }

        public PuntoReciclajeBuilder longitud(Double longitud) {
            this.longitud = longitud;
            return this;
        }

        public PuntoReciclajeBuilder radioValidacionM(Integer radioValidacionM) {
            this.radioValidacionM = radioValidacionM;
            return this;
        }

        public PuntoReciclajeBuilder estado(EstadoPunto estado) {
            this.estado = estado;
            return this;
        }

        public PuntoReciclajeBuilder mantenedor(Usuario mantenedor) {
            this.mantenedor = mantenedor;
            return this;
        }

        public PuntoReciclajeBuilder fechaCreacion(LocalDateTime fechaCreacion) {
            this.fechaCreacion = fechaCreacion;
            return this;
        }

        public PuntoReciclajeBuilder ultimaActualizacion(LocalDateTime ultimaActualizacion) {
            this.ultimaActualizacion = ultimaActualizacion;
            return this;
        }

        public PuntoReciclaje build() {
            return new PuntoReciclaje(id, nombre, descripcion, comuna, direccion, latitud, longitud, radioValidacionM, estado, mantenedor, fechaCreacion, ultimaActualizacion);
        }
    }
}
