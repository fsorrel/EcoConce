package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "estado_punto")
public class EstadoPunto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;


    public EstadoPunto() {
    }

    public EstadoPunto(Long id, String nombre) {
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

    public static EstadoPuntoBuilder builder() {
        return new EstadoPuntoBuilder();
    }

    public static class EstadoPuntoBuilder {
        private Long id;
        private String nombre;

        public EstadoPuntoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public EstadoPuntoBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public EstadoPunto build() {
            return new EstadoPunto(id, nombre);
        }
    }
}
