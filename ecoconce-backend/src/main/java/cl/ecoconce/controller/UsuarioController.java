package cl.ecoconce.controller;

import cl.ecoconce.dto.LoginRequest;
import cl.ecoconce.dto.LoginResponse;
import cl.ecoconce.dto.UsuarioAdminDto;
import cl.ecoconce.dto.UsuarioAdminUpdateRequest;
import cl.ecoconce.dto.UsuarioRequest;
import cl.ecoconce.dto.UsuarioResumenDto;
import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.CredencialesInvalidasException;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.RegionRepository;
import cl.ecoconce.repository.RolRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.security.JwtService;
import cl.ecoconce.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private static final String CORREO_ADMIN_ORIGINAL = "admin@ecoconce.cl";

    private final UsuarioRepository usuarioRepository;
    private final ComunaRepository comunaRepository;
    private final RegionRepository regionRepository;
    private final RolRepository rolRepository;
    private final MapperService mapper;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            ComunaRepository comunaRepository,
            RegionRepository regionRepository,
            RolRepository rolRepository,
            MapperService mapper,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.comunaRepository = comunaRepository;
        this.regionRepository = regionRepository;
        this.rolRepository = rolRepository;
        this.mapper = mapper;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // Datos de referencia para el formulario de registro (públicos, sin token).
    // Reemplazan a /api/bd/regiones y /api/bd/comunas con el mismo formato JSON.
    @Transactional(readOnly = true)
    @GetMapping("/regiones")
    public List<Map<String, Object>> regiones() {
        return regionRepository.findAll().stream().map(region -> {
            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("id", region.getId());
            fila.put("nombre", region.getNombre());
            return fila;
        }).toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/comunas")
    public List<Map<String, Object>> comunas() {
        return comunaRepository.findAll().stream().map(comuna -> {
            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("id", comuna.getId());
            fila.put("nombre", comuna.getNombre());
            fila.put("region_id", comuna.getRegion() == null ? null : comuna.getRegion().getId());
            return fila;
        }).toList();
    }

    @PostMapping("/login")
    @Transactional
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new CredencialesInvalidasException("Credenciales inválidas"));

        // Mismo mensaje para todos los casos: evita enumeración de usuarios
        if (!"S".equalsIgnoreCase(usuario.getActivo())
                || !passwordEncoder.matches(request.contrasena(), usuario.getContrasena())) {
            throw new CredencialesInvalidasException("Credenciales inválidas");
        }

        usuario.setFechaUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario);
        return new LoginResponse(token, usuario.getId(), usuario.getRol().getNombre());
    }

    @Transactional(readOnly = true)
    @GetMapping
    public List<UsuarioResumenDto> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(mapper::toUsuarioResumen)
                .toList();
    }

    /**
     * Devuelve los datos completos del usuario autenticado (a partir del JWT).
     * Reemplaza el patrón inseguro de descargar TODA la lista de usuarios para
     * buscar al propio por correo. Sin IDOR: siempre retorna "yo".
     */
    @Transactional(readOnly = true)
    @GetMapping("/me")
    public UsuarioAdminDto miPerfil(Authentication authentication) {
        String correo = authentication.getName();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        return mapper.toUsuarioAdminDto(usuario);
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

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    @GetMapping("/admin/activos")
    public List<UsuarioAdminDto> listarActivosAdmin() {
        return usuarioRepository.findByActivoOrderByIdAsc("S")
                .stream()
                .map(mapper::toUsuarioAdminDto)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
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

    @PreAuthorize("hasRole('ADMIN') or authentication.principal.username == #id.toString()")
    @Transactional
    @DeleteMapping("/{id}/cuenta")
    public ResponseEntity<Map<String, String>> solicitarBajaCuenta(@PathVariable Long id) {
        anonimizarCuenta(id);
        return ResponseEntity.ok(Map.of(
            "mensaje", "Tu cuenta ha sido anonimizada. Los datos de auditoría se eliminarán en 30 días conforme a la Ley 21.719.",
            "estado", "cuenta_anonimizada"
        ));
    }

    private void anonimizarCuenta(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        // Anonimizar datos personales identificables
        String anonimo = "ANONIMO_" + usuarioId;
        usuario.setNombreAlias(anonimo);
        usuario.setCorreo(anonimo + "@eliminado.ecoconce.cl");
        usuario.setRut("00000000-0");
        usuario.setTelefono(null);
        usuario.setDireccion(null);
        usuario.setSexoGenero(null);
        usuario.setFechaNacimiento(null);
        usuario.setContrasena("[CUENTA_ELIMINADA]");
        usuario.setActivo("N");

        usuarioRepository.save(usuario);
    }

    private boolean esAdminOriginal(Usuario usuario) {
        return usuario.getCorreo() != null
                && usuario.getCorreo().equalsIgnoreCase(CORREO_ADMIN_ORIGINAL);
    }
}
