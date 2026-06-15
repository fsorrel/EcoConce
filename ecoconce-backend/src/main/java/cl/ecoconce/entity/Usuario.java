package cl.ecoconce.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 12)
    private String rut;

    @Column(name = "nombre_alias", nullable = false, length = 100)
    private String nombreAlias;

    @Column(nullable = false, unique = true, length = 120)
    private String correo;

    @Column(nullable = false, length = 255)
    private String contrasena;

    @Column(name = "sexo_genero", length = 50)
    private String sexoGenero;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(length = 20)
    private String telefono;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "comuna_id")
    private Comuna comuna;

    @Column(length = 200)
    private String direccion;

    @Column(nullable = false)
    private Integer puntos;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_id")
    private Rol rol;

    @Column(nullable = false, length = 1)
    private String activo;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_ultimo_acceso")
    private LocalDateTime fechaUltimoAcceso;

    @PrePersist
    void prePersist() {
        if (puntos == null) puntos = 0;
        if (activo == null) activo = "S";
        if (fechaRegistro == null) fechaRegistro = LocalDateTime.now();
    }


    public Usuario() {
    }

    public Usuario(Long id, String rut, String nombreAlias, String correo, String contrasena, String sexoGenero, LocalDate fechaNacimiento, String telefono, Comuna comuna, String direccion, Integer puntos, Rol rol, String activo, LocalDateTime fechaRegistro, LocalDateTime fechaUltimoAcceso) {
        this.id = id;
        this.rut = rut;
        this.nombreAlias = nombreAlias;
        this.correo = correo;
        this.contrasena = contrasena;
        this.sexoGenero = sexoGenero;
        this.fechaNacimiento = fechaNacimiento;
        this.telefono = telefono;
        this.comuna = comuna;
        this.direccion = direccion;
        this.puntos = puntos;
        this.rol = rol;
        this.activo = activo;
        this.fechaRegistro = fechaRegistro;
        this.fechaUltimoAcceso = fechaUltimoAcceso;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRut() {
        return rut;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public String getNombreAlias() {
        return nombreAlias;
    }

    public void setNombreAlias(String nombreAlias) {
        this.nombreAlias = nombreAlias;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getSexoGenero() {
        return sexoGenero;
    }

    public void setSexoGenero(String sexoGenero) {
        this.sexoGenero = sexoGenero;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Comuna getComuna() {
        return comuna;
    }

    public void setComuna(Comuna comuna) {
        this.comuna = comuna;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public void setPuntos(Integer puntos) {
        this.puntos = puntos;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public String getActivo() {
        return activo;
    }

    public void setActivo(String activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public LocalDateTime getFechaUltimoAcceso() {
        return fechaUltimoAcceso;
    }

    public void setFechaUltimoAcceso(LocalDateTime fechaUltimoAcceso) {
        this.fechaUltimoAcceso = fechaUltimoAcceso;
    }

    public static UsuarioBuilder builder() {
        return new UsuarioBuilder();
    }

    public static class UsuarioBuilder {
        private Long id;
        private String rut;
        private String nombreAlias;
        private String correo;
        private String contrasena;
        private String sexoGenero;
        private LocalDate fechaNacimiento;
        private String telefono;
        private Comuna comuna;
        private String direccion;
        private Integer puntos;
        private Rol rol;
        private String activo;
        private LocalDateTime fechaRegistro;
        private LocalDateTime fechaUltimoAcceso;

        public UsuarioBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UsuarioBuilder rut(String rut) {
            this.rut = rut;
            return this;
        }

        public UsuarioBuilder nombreAlias(String nombreAlias) {
            this.nombreAlias = nombreAlias;
            return this;
        }

        public UsuarioBuilder correo(String correo) {
            this.correo = correo;
            return this;
        }

        public UsuarioBuilder contrasena(String contrasena) {
            this.contrasena = contrasena;
            return this;
        }

        public UsuarioBuilder sexoGenero(String sexoGenero) {
            this.sexoGenero = sexoGenero;
            return this;
        }

        public UsuarioBuilder fechaNacimiento(LocalDate fechaNacimiento) {
            this.fechaNacimiento = fechaNacimiento;
            return this;
        }

        public UsuarioBuilder telefono(String telefono) {
            this.telefono = telefono;
            return this;
        }

        public UsuarioBuilder comuna(Comuna comuna) {
            this.comuna = comuna;
            return this;
        }

        public UsuarioBuilder direccion(String direccion) {
            this.direccion = direccion;
            return this;
        }

        public UsuarioBuilder puntos(Integer puntos) {
            this.puntos = puntos;
            return this;
        }

        public UsuarioBuilder rol(Rol rol) {
            this.rol = rol;
            return this;
        }

        public UsuarioBuilder activo(String activo) {
            this.activo = activo;
            return this;
        }

        public UsuarioBuilder fechaRegistro(LocalDateTime fechaRegistro) {
            this.fechaRegistro = fechaRegistro;
            return this;
        }

        public UsuarioBuilder fechaUltimoAcceso(LocalDateTime fechaUltimoAcceso) {
            this.fechaUltimoAcceso = fechaUltimoAcceso;
            return this;
        }

        public Usuario build() {
            return new Usuario(id, rut, nombreAlias, correo, contrasena, sexoGenero, fechaNacimiento, telefono, comuna, direccion, puntos, rol, activo, fechaRegistro, fechaUltimoAcceso);
        }
    }
}
