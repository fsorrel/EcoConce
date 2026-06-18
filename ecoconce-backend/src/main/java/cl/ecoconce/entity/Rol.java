package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;


    public Rol() {
    }

    public Rol(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
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

    public static RolBuilder builder() {
        return new RolBuilder();
    }

    public static class RolBuilder {
        private Long id;
        private String nombre;

        public RolBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public RolBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public Rol build() {
            return new Rol(id, nombre);
        }
    }
}
