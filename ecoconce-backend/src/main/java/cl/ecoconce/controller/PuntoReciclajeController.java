package cl.ecoconce.controller;

import cl.ecoconce.dto.PuntoEstadoRequest;
import cl.ecoconce.dto.PuntoMaterialRequest;
import cl.ecoconce.dto.PuntoReciclajeDto;
import cl.ecoconce.dto.PuntoReciclajeRequest;
import cl.ecoconce.dto.PuntoMaterialUpdateRequest;
import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.EstadoPunto;
import cl.ecoconce.entity.Material;
import cl.ecoconce.entity.PuntoMaterial;
import cl.ecoconce.entity.PuntoReciclaje;
import cl.ecoconce.entity.Usuario;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.EstadoPuntoRepository;
import cl.ecoconce.repository.MaterialRepository;
import cl.ecoconce.repository.PuntoMaterialRepository;
import cl.ecoconce.repository.PuntoReciclajeRepository;
import cl.ecoconce.repository.UsuarioRepository;
import cl.ecoconce.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/puntos")
public class PuntoReciclajeController {
    private final PuntoReciclajeRepository puntoRepository;
    private final PuntoMaterialRepository puntoMaterialRepository;
    private final MaterialRepository materialRepository;
    private final ComunaRepository comunaRepository;
    private final EstadoPuntoRepository estadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MapperService mapper;

    public PuntoReciclajeController(
            PuntoReciclajeRepository puntoRepository,
            PuntoMaterialRepository puntoMaterialRepository,
            MaterialRepository materialRepository,
            ComunaRepository comunaRepository,
            EstadoPuntoRepository estadoRepository,
            UsuarioRepository usuarioRepository,
            MapperService mapper
    ) {
        this.puntoRepository = puntoRepository;
        this.puntoMaterialRepository = puntoMaterialRepository;
        this.materialRepository = materialRepository;
        this.comunaRepository = comunaRepository;
        this.estadoRepository = estadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public List<PuntoReciclajeDto> listar() {
        return puntoRepository.findAll()
                .stream()
                .map(mapper::toPunto)
                .toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/mantenedor/{mantenedorId}")
    public List<PuntoReciclajeDto> listarPorMantenedor(@PathVariable Long mantenedorId) {
        return puntoRepository.findByMantenedorId(mantenedorId)
                .stream()
                .map(mapper::toPunto)
                .toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public PuntoReciclajeDto buscar(@PathVariable Long id) {
        return puntoRepository.findById(id)
                .map(mapper::toPunto)
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));
    }

    @Transactional
    @PostMapping("/admin")
    public PuntoReciclajeDto crearAdmin(@Valid @RequestBody PuntoReciclajeRequest request) {
        PuntoReciclaje punto = new PuntoReciclaje();

        aplicarDatosPunto(punto, request);

        PuntoReciclaje guardado = puntoRepository.save(punto);
        guardarMaterialesDelPunto(guardado, request.materiales());

        return mapper.toPunto(guardado);
    }

    @Transactional
    @PutMapping("/admin/{id}")
    public PuntoReciclajeDto actualizarAdmin(
            @PathVariable Long id,
            @Valid @RequestBody PuntoReciclajeRequest request
    ) {
        PuntoReciclaje punto = puntoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        aplicarDatosPunto(punto, request);

        PuntoReciclaje actualizado = puntoRepository.save(punto);
        guardarMaterialesDelPunto(actualizado, request.materiales());

        return mapper.toPunto(actualizado);
    }

    @Transactional
    @PutMapping("/admin/{id}/desactivar")
    public PuntoReciclajeDto desactivarAdmin(@PathVariable Long id) {
        PuntoReciclaje punto = puntoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        EstadoPunto inactivo = estadoRepository.findByNombreIgnoreCase("INACTIVO")
                .orElseGet(() -> estadoRepository.save(
                        EstadoPunto.builder()
                                .nombre("INACTIVO")
                                .build()
                ));

        punto.setEstado(inactivo);

        PuntoReciclaje actualizado = puntoRepository.save(punto);
        return mapper.toPunto(actualizado);
    }

    @Transactional
    @PutMapping("/admin/{id}/activar")
    public PuntoReciclajeDto activarAdmin(@PathVariable Long id) {
        PuntoReciclaje punto = puntoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        EstadoPunto operativo = estadoRepository.findByNombreIgnoreCase("OPERATIVO")
                .orElseThrow(() -> new RecursoNoEncontradoException("Estado OPERATIVO no encontrado"));

        punto.setEstado(operativo);

        PuntoReciclaje actualizado = puntoRepository.save(punto);
        return mapper.toPunto(actualizado);
    }

    @Transactional
    @PutMapping("/mantenedor/{mantenedorId}/{puntoId}/estado")
    public PuntoReciclajeDto actualizarEstadoMantenedor(
            @PathVariable Long mantenedorId,
            @PathVariable Long puntoId,
            @Valid @RequestBody PuntoEstadoRequest request
    ) {
        PuntoReciclaje punto = puntoRepository.findById(puntoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        validarPuntoPerteneceAlMantenedor(punto, mantenedorId);

        EstadoPunto estado = estadoRepository.findById(request.estadoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Estado de punto no encontrado"));

        punto.setEstado(estado);

        PuntoReciclaje actualizado = puntoRepository.save(punto);
        return mapper.toPunto(actualizado);
    }

    @Transactional
    @PutMapping("/mantenedor/{mantenedorId}/{puntoId}/materiales")
    public PuntoReciclajeDto actualizarMaterialesMantenedor(
            @PathVariable Long mantenedorId,
            @PathVariable Long puntoId,
            @Valid @RequestBody List<PuntoMaterialUpdateRequest> request
    ) {
        if (request == null || request.isEmpty()) {
            throw new ReglaNegocioException("Debes enviar al menos un material para actualizar");
        }

        PuntoReciclaje punto = puntoRepository.findById(puntoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        validarPuntoPerteneceAlMantenedor(punto, mantenedorId);

        List<PuntoMaterial> materialesActuales = puntoMaterialRepository.findByPuntoId(puntoId);

        if (materialesActuales.isEmpty()) {
            throw new ReglaNegocioException("Este punto no tiene materiales asociados");
        }

        Set<Long> materialesUsados = new HashSet<>();

        for (PuntoMaterialUpdateRequest item : request) {
            if (!materialesUsados.add(item.materialId())) {
                throw new ReglaNegocioException("No se puede repetir el mismo material en la actualización");
            }

            PuntoMaterial puntoMaterial = materialesActuales.stream()
                    .filter(pm -> pm.getMaterial().getId().equals(item.materialId()))
                    .findFirst()
                    .orElseThrow(() -> new ReglaNegocioException("El material no está asociado a este punto"));

            Integer capacidadCompactado = item.capacidadCompactado() == null ? 0 : item.capacidadCompactado();
            Integer actualCompactado = item.actualCompactado() == null ? 0 : item.actualCompactado();

            if (capacidadCompactado < 0 || actualCompactado < 0) {
                throw new ReglaNegocioException("Las cantidades no pueden ser negativas");
            }

            if (capacidadCompactado > 0 && actualCompactado > capacidadCompactado) {
                throw new ReglaNegocioException("La cantidad actual no puede superar la capacidad compactada");
            }

            puntoMaterial.setCapacidadCompactado(capacidadCompactado);
            puntoMaterial.setActualCompactado(actualCompactado);
        }

        puntoMaterialRepository.saveAll(materialesActuales);

        return mapper.toPunto(punto);
    }

    private void validarPuntoPerteneceAlMantenedor(PuntoReciclaje punto, Long mantenedorId) {
        if (punto.getMantenedor() == null) {
            throw new ReglaNegocioException("Este punto no tiene mantenedor asignado");
        }

        if (!punto.getMantenedor().getId().equals(mantenedorId)) {
            throw new ReglaNegocioException("No puedes modificar un punto asignado a otro mantenedor");
        }

        if (!"S".equalsIgnoreCase(punto.getMantenedor().getActivo())) {
            throw new ReglaNegocioException("El mantenedor asignado no está activo");
        }
    }

    private void aplicarDatosPunto(PuntoReciclaje punto, PuntoReciclajeRequest request) {
        Comuna comuna = comunaRepository.findById(request.comunaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Comuna no encontrada"));

        EstadoPunto estado = estadoRepository.findById(request.estadoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Estado de punto no encontrado"));

        Usuario mantenedor = obtenerMantenedor(request.mantenedorId());

        punto.setNombre(request.nombre().trim());
        punto.setDescripcion(request.descripcion().trim());
        punto.setComuna(comuna);
        punto.setDireccion(request.direccion());
        punto.setLatitud(request.latitud());
        punto.setLongitud(request.longitud());
        punto.setRadioValidacionM(request.radioValidacionM());
        punto.setEstado(estado);
        punto.setMantenedor(mantenedor);
    }

    private Usuario obtenerMantenedor(Long mantenedorId) {
        if (mantenedorId == null) {
            return null;
        }

        Usuario mantenedor = usuarioRepository.findById(mantenedorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Mantenedor no encontrado"));

        String rol = mantenedor.getRol() == null ? "" : mantenedor.getRol().getNombre();

        if (!rol.equalsIgnoreCase("MANTENEDOR")) {
            throw new ReglaNegocioException("El usuario asignado no tiene rol de mantenedor");
        }

        if (!"S".equalsIgnoreCase(mantenedor.getActivo())) {
            throw new ReglaNegocioException("El mantenedor asignado no está activo");
        }

        return mantenedor;
    }

    private void guardarMaterialesDelPunto(PuntoReciclaje punto, List<PuntoMaterialRequest> materiales) {
        if (materiales == null || materiales.isEmpty()) {
            throw new ReglaNegocioException("El punto debe tener al menos un material asociado");
        }

        puntoMaterialRepository.deleteByPuntoId(punto.getId());
        puntoMaterialRepository.flush();

        Set<Long> materialesUsados = new HashSet<>();

        for (PuntoMaterialRequest item : materiales) {
            if (!materialesUsados.add(item.materialId())) {
                throw new ReglaNegocioException("No se puede repetir el mismo material en un punto");
            }

            Material material = materialRepository.findById(item.materialId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Material no encontrado"));

            Integer capacidadCompactado = item.capacidadCompactado() == null ? 0 : item.capacidadCompactado();
            Integer actualCompactado = item.actualCompactado() == null ? 0 : item.actualCompactado();

            if (capacidadCompactado > 0 && actualCompactado > capacidadCompactado) {
                throw new ReglaNegocioException("La cantidad actual no puede superar la capacidad compactada");
            }

            puntoMaterialRepository.save(PuntoMaterial.builder()
                    .punto(punto)
                    .material(material)
                    .capacidadCompactado(capacidadCompactado)
                    .actualCompactado(actualCompactado)
                    .build());
        }
    }
}