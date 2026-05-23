package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_premios_canjeados")
public class HistorialPremioCanjeado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "premio_id")
    private Premio premio;

    @Column(name = "nombre_premio", nullable = false, length = 120)
    private String nombrePremio;

    @Column(name = "puntos_gastados", nullable = false)
    private Integer puntosGastados;

    @Column(name = "codigo_canje", unique = true, length = 80)
    private String codigoCanje;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "envio_domicilio", nullable = false, length = 1)
    private String envioDomicilio;

    @Column(name = "direccion_envio", length = 255)
    private String direccionEnvio;

    @Column(name = "fecha_canje")
    private LocalDateTime fechaCanje;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @Lob
    private String observacion;

    @PrePersist
    void prePersist() {
        if (estado == null) estado = "PENDIENTE";
        if (envioDomicilio == null) envioDomicilio = "N";
        if (fechaCanje == null) fechaCanje = LocalDateTime.now();
    }

    public HistorialPremioCanjeado() {
    }

    public HistorialPremioCanjeado(
            Long id,
            Usuario usuario,
            Premio premio,
            String nombrePremio,
            Integer puntosGastados,
            String codigoCanje,
            String estado,
            String envioDomicilio,
            String direccionEnvio,
            LocalDateTime fechaCanje,
            LocalDateTime fechaEntrega,
            String observacion
    ) {
        this.id = id;
        this.usuario = usuario;
        this.premio = premio;
        this.nombrePremio = nombrePremio;
        this.puntosGastados = puntosGastados;
        this.codigoCanje = codigoCanje;
        this.estado = estado;
        this.envioDomicilio = envioDomicilio;
        this.direccionEnvio = direccionEnvio;
        this.fechaCanje = fechaCanje;
        this.fechaEntrega = fechaEntrega;
        this.observacion = observacion;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Premio getPremio() {
        return premio;
    }

    public String getNombrePremio() {
        return nombrePremio;
    }

    public Integer getPuntosGastados() {
        return puntosGastados;
    }

    public String getCodigoCanje() {
        return codigoCanje;
    }

    public String getEstado() {
        return estado;
    }

    public String getEnvioDomicilio() {
        return envioDomicilio;
    }

    public String getDireccionEnvio() {
        return direccionEnvio;
    }

    public LocalDateTime getFechaCanje() {
        return fechaCanje;
    }

    public LocalDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public void setPremio(Premio premio) {
        this.premio = premio;
    }

    public void setNombrePremio(String nombrePremio) {
        this.nombrePremio = nombrePremio;
    }

    public void setPuntosGastados(Integer puntosGastados) {
        this.puntosGastados = puntosGastados;
    }

    public void setCodigoCanje(String codigoCanje) {
        this.codigoCanje = codigoCanje;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public void setEnvioDomicilio(String envioDomicilio) {
        this.envioDomicilio = envioDomicilio;
    }

    public void setDireccionEnvio(String direccionEnvio) {
        this.direccionEnvio = direccionEnvio;
    }

    public void setFechaCanje(LocalDateTime fechaCanje) {
        this.fechaCanje = fechaCanje;
    }

    public void setFechaEntrega(LocalDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public static HistorialPremioCanjeadoBuilder builder() {
        return new HistorialPremioCanjeadoBuilder();
    }

    public static class HistorialPremioCanjeadoBuilder {
        private Long id;
        private Usuario usuario;
        private Premio premio;
        private String nombrePremio;
        private Integer puntosGastados;
        private String codigoCanje;
        private String estado;
        private String envioDomicilio;
        private String direccionEnvio;
        private LocalDateTime fechaCanje;
        private LocalDateTime fechaEntrega;
        private String observacion;

        public HistorialPremioCanjeadoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HistorialPremioCanjeadoBuilder usuario(Usuario usuario) {
            this.usuario = usuario;
            return this;
        }

        public HistorialPremioCanjeadoBuilder premio(Premio premio) {
            this.premio = premio;
            return this;
        }

        public HistorialPremioCanjeadoBuilder nombrePremio(String nombrePremio) {
            this.nombrePremio = nombrePremio;
            return this;
        }

        public HistorialPremioCanjeadoBuilder puntosGastados(Integer puntosGastados) {
            this.puntosGastados = puntosGastados;
            return this;
        }

        public HistorialPremioCanjeadoBuilder codigoCanje(String codigoCanje) {
            this.codigoCanje = codigoCanje;
            return this;
        }

        public HistorialPremioCanjeadoBuilder estado(String estado) {
            this.estado = estado;
            return this;
        }

        public HistorialPremioCanjeadoBuilder envioDomicilio(String envioDomicilio) {
            this.envioDomicilio = envioDomicilio;
            return this;
        }

        public HistorialPremioCanjeadoBuilder direccionEnvio(String direccionEnvio) {
            this.direccionEnvio = direccionEnvio;
            return this;
        }

        public HistorialPremioCanjeadoBuilder fechaCanje(LocalDateTime fechaCanje) {
            this.fechaCanje = fechaCanje;
            return this;
        }

        public HistorialPremioCanjeadoBuilder fechaEntrega(LocalDateTime fechaEntrega) {
            this.fechaEntrega = fechaEntrega;
            return this;
        }

        public HistorialPremioCanjeadoBuilder observacion(String observacion) {
            this.observacion = observacion;
            return this;
        }

        public HistorialPremioCanjeado build() {
            return new HistorialPremioCanjeado(
                    id,
                    usuario,
                    premio,
                    nombrePremio,
                    puntosGastados,
                    codigoCanje,
                    estado,
                    envioDomicilio,
                    direccionEnvio,
                    fechaCanje,
                    fechaEntrega,
                    observacion
            );
        }
    }
}