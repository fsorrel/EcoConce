package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "regiones")
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;


    public Region() {
    }

    public Region(Long id, String nombre) {
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

    public static RegionBuilder builder() {
        return new RegionBuilder();
    }

    public static class RegionBuilder {
        private Long id;
        private String nombre;

        public RegionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public RegionBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public Region build() {
            return new Region(id, nombre);
        }
    }
}
