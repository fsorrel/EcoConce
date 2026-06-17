package cl.ecoconce.controller;

import cl.ecoconce.dto.LoginRequest;
import cl.ecoconce.dto.UsuarioAdminDto;
import cl.ecoconce.dto.UsuarioAdminUpdateRequest;
import cl.ecoconce.dto.UsuarioRequest;
import cl.ecoconce.dto.UsuarioResumenDto;
import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.RolRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.security.JwtService;
import cl.ecoconce.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private static final String CORREO_ADMIN_ORIGINAL = "admin@ecoconce.cl";

    private final UsuarioRepository usuarioRepository;
    private final ComunaRepository comunaRepository;
    private final RolRepository rolRepository;
    private final MapperService mapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            ComunaRepository comunaRepository,
            RolRepository rolRepository,
            MapperService mapper,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.comunaRepository = comunaRepository;
        this.rolRepository = rolRepository;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public List<UsuarioResumenDto> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(mapper::toUsuarioResumen)
                .toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public UsuarioResumenDto buscar(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(mapper::toUsuarioResumen)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    @PostMapping
    public UsuarioResumenDto crear(@Valid @RequestBody UsuarioRequest request) {
        if (usuarioRepository.existsByRut(request.rut())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese RUT");
        }

        if (usuarioRepository.existsByCorreo(request.correo())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese correo");
        }

        Comuna comuna = comunaRepository.findById(request.comunaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Comuna no encontrada"));

        Rol rol = rolRepository.findById(request.rolId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado"));

        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .rut(request.rut())
                .nombreAlias(request.nombreAlias())
                .correo(request.correo())
                .contrasena(passwordEncoder.encode(request.contrasena()))
                .sexoGenero(request.sexoGenero())
                .fechaNacimiento(request.fechaNacimiento())
                .telefono(request.telefono())
                .comuna(comuna)
                .direccion(request.direccion())
                .rol(rol)
                .puntos(0)
                .activo("S")
                .build());

        return mapper.toUsuarioResumen(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new ReglaNegocioException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.contrasena(), usuario.getContrasena())) {
            throw new ReglaNegocioException("Credenciales inválidas");
        }

        if (!usuario.isActivo()) {
            throw new ReglaNegocioException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(usuario);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("id", usuario.getId());
        response.put("rut", usuario.getRut() != null ? usuario.getRut() : "");
        response.put("nombreAlias", usuario.getNombreAlias() != null ? usuario.getNombreAlias() : "");
        response.put("correo", usuario.getCorreo());
        response.put("sexoGenero", usuario.getSexoGenero() != null ? usuario.getSexoGenero() : "");
        response.put("fechaNacimiento", usuario.getFechaNacimiento() != null ? usuario.getFechaNacimiento().toString() : "");
        response.put("telefono", usuario.getTelefono() != null ? usuario.getTelefono() : "");
        response.put("comunaId", usuario.getComuna() != null ? usuario.getComuna().getId() : 0);
        response.put("comuna", (usuario.getComuna() != null && usuario.getComuna().getNombre() != null) ? usuario.getComuna().getNombre() : "");
        response.put("direccion", usuario.getDireccion() != null ? usuario.getDireccion() : "");
        response.put("puntos", usuario.getPuntos() != null ? usuario.getPuntos() : 0);
        response.put("rolId", usuario.getRol() != null ? usuario.getRol().getId() : 1);
        response.put("rol", (usuario.getRol() != null && usuario.getRol().getNombre() != null) ? usuario.getRol().getNombre() : "USUARIO");
        response.put("activo", usuario.getActivo() != null ? usuario.getActivo() : "S");
        response.put("fechaRegistro", usuario.getFechaRegistro() != null ? usuario.getFechaRegistro().toString() : "");

        return ResponseEntity.ok(response);
    }

    @Transactional(readOnly = true)
    @GetMapping("/admin/activos")
    public List<UsuarioAdminDto> listarActivosAdmin() {
        return usuarioRepository.findByActivoOrderByIdAsc("S")
                .stream()
                .map(mapper::toUsuarioAdminDto)
                .toList();
    }

    @Transactional
    @PutMapping("/admin/{id}")
    public UsuarioAdminDto actualizarUsuarioAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioAdminUpdateRequest request
    ) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (esAdminOriginal(usuario)) {
            throw new ReglaNegocioException("No se puede modificar el administrador original");
        }

        if (!request.activo().equalsIgnoreCase("S") && !request.activo().equalsIgnoreCase("N")) {
            throw new ReglaNegocioException("El estado activo solo puede ser S o N");
        }

        Usuario usuarioConCorreo = usuarioRepository.findByCorreo(request.correo()).orElse(null);
        if (usuarioConCorreo != null && !usuarioConCorreo.getId().equals(usuario.getId())) {
            throw new ReglaNegocioException("Ya existe otro usuario con ese correo");
        }

        Rol rol = rolRepository.findById(request.rolId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado"));

        Comuna comuna = usuario.getComuna();
        if (request.comunaId() != null) {
            comuna = comunaRepository.findById(request.comunaId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Comuna no encontrada"));
        }

        usuario.setNombreAlias(request.nombreAlias());
        usuario.setCorreo(request.correo());
        usuario.setTelefono(request.telefono());
        usuario.setComuna(comuna);
        usuario.setDireccion(request.direccion());
        usuario.setRol(rol);
        usuario.setActivo(request.activo().toUpperCase());

        Usuario actualizado = usuarioRepository.save(usuario);
        return mapper.toUsuarioAdminDto(actualizado);
    }

    private boolean esAdminOriginal(Usuario usuario) {
        return usuario.getCorreo() != null
                && usuario.getCorreo().equalsIgnoreCase(CORREO_ADMIN_ORIGINAL);
    }
}