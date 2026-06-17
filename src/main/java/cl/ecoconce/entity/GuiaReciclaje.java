package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "guias_reciclaje")
public class GuiaReciclaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Lob
    @Column(nullable = false)
    private String descripcion;

    @Lob
    @Column(nullable = false)
    private String contenido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }


    public GuiaReciclaje() {
    }

    public GuiaReciclaje(Long id, String titulo, String descripcion, String contenido, Material material, LocalDateTime fechaCreacion) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.contenido = contenido;
        this.material = material;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public static GuiaReciclajeBuilder builder() {
        return new GuiaReciclajeBuilder();
    }

    public static class GuiaReciclajeBuilder {
        private Long id;
        private String titulo;
    private String descripcion;
    private String contenido;
        private Material material;
        private LocalDateTime fechaCreacion;

        public GuiaReciclajeBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public GuiaReciclajeBuilder titulo(String titulo) {
            this.titulo = titulo;
            return this;
        }

        public GuiaReciclajeBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public GuiaReciclajeBuilder contenido(String contenido) {
            this.contenido = contenido;
            return this;
        }

        public GuiaReciclajeBuilder material(Material material) {
            this.material = material;
            return this;
        }

        public GuiaReciclajeBuilder fechaCreacion(LocalDateTime fechaCreacion) {
            this.fechaCreacion = fechaCreacion;
            return this;
        }

        public GuiaReciclaje build() {
            return new GuiaReciclaje(id, titulo, descripcion, contenido, material, fechaCreacion);
        }
    }
}
