package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "materiales")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "codigo_identificador", nullable = false, unique = true, length = 100)
    private String codigoIdentificador;

    @Lob
    @Column(nullable = false)
    private String descripcion;


    public Material() {
    }

    public Material(Long id, String nombre, String codigoIdentificador, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.codigoIdentificador = codigoIdentificador;
        this.descripcion = descripcion;
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

    public String getCodigoIdentificador() {
        return codigoIdentificador;
    }

    public void setCodigoIdentificador(String codigoIdentificador) {
        this.codigoIdentificador = codigoIdentificador;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public static MaterialBuilder builder() {
        return new MaterialBuilder();
    }

    public static class MaterialBuilder {
        private Long id;
        private String nombre;
        private String codigoIdentificador;
    private String descripcion;

        public MaterialBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MaterialBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public MaterialBuilder codigoIdentificador(String codigoIdentificador) {
            this.codigoIdentificador = codigoIdentificador;
            return this;
        }

        public MaterialBuilder descripcion(String descripcion) {
            this.descripcion = descripcion;
            return this;
        }

        public Material build() {
            return new Material(id, nombre, codigoIdentificador, descripcion);
        }
    }
}
