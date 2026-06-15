package cl.ecoconce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_reporte")
public class TipoReporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;


    public TipoReporte() {
    }

    public TipoReporte(Long id, String nombre) {
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

    public static TipoReporteBuilder builder() {
        return new TipoReporteBuilder();
    }

    public static class TipoReporteBuilder {
        private Long id;
        private String nombre;

        public TipoReporteBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TipoReporteBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public TipoReporte build() {
            return new TipoReporte(id, nombre);
        }
    }
}
