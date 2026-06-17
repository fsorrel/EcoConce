package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "comunas", uniqueConstraints = @UniqueConstraint(columnNames = {"nombre", "region_id"}))
public class Comuna {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    private Region region;


    public Comuna() {
    }

    public Comuna(Long id, String nombre, Region region) {
        this.id = id;
        this.nombre = nombre;
        this.region = region;
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

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public static ComunaBuilder builder() {
        return new ComunaBuilder();
    }

    public static class ComunaBuilder {
        private Long id;
        private String nombre;
        private Region region;

        public ComunaBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ComunaBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public ComunaBuilder region(Region region) {
            this.region = region;
            return this;
        }

        public Comuna build() {
            return new Comuna(id, nombre, region);
        }
    }
}
