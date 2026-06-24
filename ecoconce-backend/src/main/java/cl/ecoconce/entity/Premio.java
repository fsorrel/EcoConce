package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "premios")
public class Premio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Lob
    @Column(nullable = false)
    private String descripcion;

    @Column(name = "costo_puntos", nullable = false)
    private Integer costoPuntos;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false, length = 1)
    private String activo;

    @Column(name = "envio_domicilio", nullable = false, length = 1)
    private String envioDomicilio;

    // Control de concurrencia optimista: evita que dos canjes simultáneos
    // descuenten stock sobre la misma versión del registro.
    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    void prePersist() {
        if (stock == null) stock = 0;
        if (activo == null) activo = "S";
        if (envioDomicilio == null) envioDomicilio = "N";
    }

    public Premio() {
    }

    public Premio(Long id, String nombre, String descripcion, Integer costoPuntos, Integer stock, String activo, String envioDomicilio) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.costoPuntos = costoPuntos;
        this.stock = stock;
        this.activo = activo;
        this.envioDomicilio = envioDomicilio;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Integer getCostoPuntos() {
        return costoPuntos;
    }

    public Integer getStock() {
        return stock;
    }

    public String getActivo() {
        return activo;
    }

    public String getEnvioDomicilio() {
        return envioDomicilio;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setCostoPuntos(Integer costoPuntos) {
        this.costoPuntos = costoPuntos;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setActivo(String activo) {
        this.activo = activo;
    }

    public void setEnvioDomicilio(String envioDomicilio) {
        this.envioDomicilio = envioDomicilio;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public static PremioBuilder builder() {
        return new PremioBuilder();
    }

    public static class PremioBuilder {
        private Long id;
        private String nombre;
        private String descripcion;
        private Integer costoPuntos;
        private Integer stock;
        private String activo;
        private String envioDomicilio;

        public PremioBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PremioBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public PremioBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public PremioBuilder costoPuntos(Integer costoPuntos) {
            this.costoPuntos = costoPuntos;
            return this;
        }

        public PremioBuilder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public PremioBuilder activo(String activo) {
            this.activo = activo;
            return this;
        }

        public PremioBuilder envioDomicilio(String envioDomicilio) {
            this.envioDomicilio = envioDomicilio;
            return this;
        }

        public Premio build() {
            return new Premio(id, nombre, descripcion, costoPuntos, stock, activo, envioDomicilio);
        }
    }
}