package cl.ecoconce.controller;

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
import cl.ecoconce.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private static final String CORREO_ADMIN_ORIGINAL = "admin@ecoconce.cl";

    private final UsuarioRepository usuarioRepository;
    private final ComunaRepository comunaRepository;
    private final RolRepository rolRepository;
    private final MapperService mapper;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            ComunaRepository comunaRepository,
            RolRepository rolRepository,
            MapperService mapper
    ) {
        this.usuarioRepository = usuarioRepository;
        this.comunaRepository = comunaRepository;
        this.rolRepository = rolRepository;
        this.mapper = mapper;
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
                .contrasena(request.contrasena())
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