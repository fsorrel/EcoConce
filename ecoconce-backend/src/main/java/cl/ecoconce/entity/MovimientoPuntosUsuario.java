package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_puntos_usuario")
public class MovimientoPuntosUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private String tipoMovimiento;

    @Column(nullable = false)
    private Integer puntos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formulario_id")
    private FormularioReciclaje formulario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "canje_id")
    private HistorialPremioCanjeado canje;

    @Lob
    private String descripcion;

    @Column(name = "fecha_movimiento")
    private LocalDateTime fechaMovimiento;

    @PrePersist
    void prePersist() {
        if (fechaMovimiento == null) fechaMovimiento = LocalDateTime.now();
    }


    public MovimientoPuntosUsuario() {
    }

    public MovimientoPuntosUsuario(Long id, Usuario usuario, String tipoMovimiento, Integer puntos, FormularioReciclaje formulario, HistorialPremioCanjeado canje, String descripcion, LocalDateTime fechaMovimiento) {
        this.id = id;
        this.usuario = usuario;
        this.tipoMovimiento = tipoMovimiento;
        this.puntos = puntos;
        this.formulario = formulario;
        this.canje = canje;
        this.descripcion = descripcion;
        this.fechaMovimiento = fechaMovimiento;
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

    public String getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(String tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public void setPuntos(Integer puntos) {
        this.puntos = puntos;
    }

    public FormularioReciclaje getFormulario() {
        return formulario;
    }

    public void setFormulario(FormularioReciclaje formulario) {
        this.formulario = formulario;
    }

    public HistorialPremioCanjeado getCanje() {
        return canje;
    }

    public void setCanje(HistorialPremioCanjeado canje) {
        this.canje = canje;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaMovimiento() {
        return fechaMovimiento;
    }

    public void setFechaMovimiento(LocalDateTime fechaMovimiento) {
        this.fechaMovimiento = fechaMovimiento;
    }

    public static MovimientoPuntosUsuarioBuilder builder() {
        return new MovimientoPuntosUsuarioBuilder();
    }

    public static class MovimientoPuntosUsuarioBuilder {
        private Long id;
        private Usuario usuario;
        private String tipoMovimiento;
        private Integer puntos;
        private FormularioReciclaje formulario;
        private HistorialPremioCanjeado canje;
    private String descripcion;
        private LocalDateTime fechaMovimiento;

        public MovimientoPuntosUsuarioBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder usuario(Usuario usuario) {
            this.usuario = usuario;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder tipoMovimiento(String tipoMovimiento) {
            this.tipoMovimiento = tipoMovimiento;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder puntos(Integer puntos) {
            this.puntos = puntos;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder formulario(FormularioReciclaje formulario) {
            this.formulario = formulario;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder canje(HistorialPremioCanjeado canje) {
            this.canje = canje;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public MovimientoPuntosUsuarioBuilder fechaMovimiento(LocalDateTime fechaMovimiento) {
            this.fechaMovimiento = fechaMovimiento;
            return this;
        }

        public MovimientoPuntosUsuario build() {
            return new MovimientoPuntosUsuario(id, usuario, tipoMovimiento, puntos, formulario, canje, descripcion, fechaMovimiento);
        }
    }
}
