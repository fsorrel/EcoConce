package cl.ecoconce.service;

import cl.ecoconce.dto.FormularioMaterialRequest;
import cl.ecoconce.dto.FormularioRequest;
import cl.ecoconce.dto.FormularioResponse;
import cl.ecoconce.entity.*;
import cl.ecoconce.exception.RecursoNoEncontradoException;
import cl.ecoconce.exception.ReglaNegocioException;
import cl.ecoconce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class FormularioReciclajeService {
    private final UsuarioRepository usuarioRepository;
    private final PuntoReciclajeRepository puntoRepository;
    private final MaterialRepository materialRepository;
    private final FormularioReciclajeRepository formularioRepository;
    private final DetalleFormularioMaterialRepository detalleRepository;
    private final MovimientoPuntosUsuarioRepository movimientoRepository;
    private final PuntoMaterialRepository puntoMaterialRepository;
    private final MapperService mapper;

    private static final Map<String, List<String>> UNIDADES_POR_MATERIAL = Map.ofEntries(
            Map.entry("pilas", List.of("UNIDAD", "OTRO")),
            Map.entry("electronicos", List.of("UNIDAD", "OTRO")),
            Map.entry("otros metales", List.of("UNIDAD", "BOLSA", "SACO", "OTRO")),
            Map.entry("aluminio", List.of("UNIDAD", "BOLSA", "SACO", "OTRO")),
            Map.entry("pp rigido", List.of("UNIDAD", "BOLSA", "SACO", "OTRO")),
            Map.entry("ps", List.of("UNIDAD", "BOLSA", "SACO", "OTRO")),
            Map.entry("pe bolsa + pe rigido", List.of("BOLSA", "UNIDAD", "SACO", "OTRO")),
            Map.entry("pet color", List.of("BOLSA", "UNIDAD", "SACO", "OTRO")),
            Map.entry("pet transparente", List.of("BOLSA", "UNIDAD", "SACO", "OTRO")),
            Map.entry("tetra", List.of("UNIDAD", "BOLSA", "CAJA", "OTRO")),
            Map.entry("cartones o cartulinas", List.of("CAJA", "BOLSA", "SACO", "OTRO")),
            Map.entry("papel cafe", List.of("BOLSA", "CAJA", "SACO", "OTRO")),
            Map.entry("papel blanco o con tinta negra", List.of("BOLSA", "CAJA", "SACO", "OTRO"))
    );

    @Transactional
    public FormularioResponse crear(Long usuarioId, FormularioRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        PuntoReciclaje punto = puntoRepository.findById(request.puntoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Punto de reciclaje no encontrado"));

        validarDistancia(request.distanciaMetros(), punto);
        validarMaterialesDelFormulario(punto, request.materiales());

        String estadoInicial = punto.getMantenedor() == null ? "PUNTO_SIN_REVISOR" : "PENDIENTE";

        FormularioReciclaje formulario = FormularioReciclaje.builder()
                .usuario(usuario)
                .punto(punto)
                .distanciaMetros(request.distanciaMetros())
                .estado(estadoInicial)
                .observacion(request.observacion())
                .totalPuntosObtenidos(0)
                .build();

        formulario = formularioRepository.save(formulario);

        int total = 0;

        for (FormularioMaterialRequest item : request.materiales()) {
            Material material = materialRepository.findById(item.materialId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Material no encontrado"));

            String unidad = normalizarUnidad(material, item.unidadDeclarada());
            int puntos = calcularPuntos(material, item.cantidadDeclarada());
            total += puntos;

            detalleRepository.save(DetalleFormularioMaterial.builder()
                    .formulario(formulario)
                    .material(material)
                    .cantidadDeclarada(item.cantidadDeclarada().doubleValue())
                    .unidadDeclarada(unidad)
                    .puntosObtenidos(puntos)
                    .observacion(item.observacion())
                    .build());
        }

        formulario.setTotalPuntosObtenidos(total);
        formulario = formularioRepository.save(formulario);

        return mapper.toFormulario(formulario);
    }

    @Transactional
    public FormularioResponse aprobar(Long formularioId) {
        FormularioReciclaje formulario = formularioRepository.findById(formularioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Formulario no encontrado"));

        if ("APROBADO".equals(formulario.getEstado())) {
            return mapper.toFormulario(formulario);
        }

        if ("RECHAZADO".equals(formulario.getEstado())) {
            throw new ReglaNegocioException("No se puede aprobar un formulario rechazado");
        }

        Usuario usuario = formulario.getUsuario();
        usuario.setPuntos(usuario.getPuntos() + formulario.getTotalPuntosObtenidos());
        formulario.setEstado("APROBADO");

        usuarioRepository.save(usuario);
        formularioRepository.save(formulario);

        movimientoRepository.save(MovimientoPuntosUsuario.builder()
                .usuario(usuario)
                .tipoMovimiento("GANANCIA")
                .puntos(formulario.getTotalPuntosObtenidos())
                .formulario(formulario)
                .descripcion("Puntos ganados por formulario de reciclaje aprobado")
                .build());

        return mapper.toFormulario(formulario);
    }

    @Transactional
    public FormularioResponse rechazar(Long formularioId, String observacion) {
        FormularioReciclaje formulario = formularioRepository.findById(formularioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Formulario no encontrado"));

        if ("APROBADO".equals(formulario.getEstado())) {
            throw new ReglaNegocioException("No se puede rechazar un formulario aprobado");
        }

        formulario.setEstado("RECHAZADO");
        formulario.setObservacion(observacion);

        return mapper.toFormulario(formularioRepository.save(formulario));
    }

    private void validarDistancia(Double distancia, PuntoReciclaje punto) {
        if (distancia == null || distancia <= 0) {
            throw new ReglaNegocioException("Debes calcular la distancia con GPS antes de enviar el formulario");
        }

        if (distancia > 50) {
            throw new ReglaNegocioException("El formulario solo acepta puntos a 50 metros o menos");
        }

        if (punto.getRadioValidacionM() != null && distancia > punto.getRadioValidacionM()) {
            throw new ReglaNegocioException("Estás fuera del radio permitido para este punto de reciclaje");
        }
    }

    private void validarMaterialesDelFormulario(PuntoReciclaje punto, List<FormularioMaterialRequest> materialesRequest) {
        if (materialesRequest == null || materialesRequest.isEmpty()) {
            throw new ReglaNegocioException("Debes ingresar al menos un material reciclado");
        }

        List<PuntoMaterial> materialesDelPunto = puntoMaterialRepository.findByPuntoId(punto.getId());

        if (materialesDelPunto.isEmpty()) {
            throw new ReglaNegocioException("Este punto no tiene materiales disponibles para reciclar");
        }

        Set<Long> materialesUsados = new HashSet<>();

        for (FormularioMaterialRequest item : materialesRequest) {
            if (item.materialId() == null) {
                throw new ReglaNegocioException("Debes seleccionar un material válido");
            }

            if (!materialesUsados.add(item.materialId())) {
                throw new ReglaNegocioException("No puedes repetir el mismo material en el formulario");
            }

            if (item.cantidadDeclarada() == null || item.cantidadDeclarada() <= 0) {
                throw new ReglaNegocioException("La cantidad declarada debe ser mayor a 0");
            }

            PuntoMaterial puntoMaterial = materialesDelPunto.stream()
                    .filter(pm -> pm.getMaterial().getId().equals(item.materialId()))
                    .findFirst()
                    .orElseThrow(() -> new ReglaNegocioException("El material seleccionado no está disponible en este punto"));

            Integer capacidad = puntoMaterial.getCapacidadCompactado() == null ? 0 : puntoMaterial.getCapacidadCompactado();
            Integer actual = puntoMaterial.getActualCompactado() == null ? 0 : puntoMaterial.getActualCompactado();

            if (capacidad > 0 && actual >= capacidad) {
                throw new ReglaNegocioException("El material " + puntoMaterial.getMaterial().getNombre() + " está lleno en este punto. Debes elegir otro punto de reciclaje");
            }
        }
    }

    private String normalizarUnidad(Material material, String unidad) {
        String materialNormalizado = normalizarTexto(material.getNombre());
        List<String> permitidas = UNIDADES_POR_MATERIAL.get(materialNormalizado);

        if (permitidas == null) {
            throw new ReglaNegocioException("El material " + material.getNombre() + " no está habilitado para el formulario de reciclaje");
        }

        String valor = unidad == null || unidad.isBlank()
                ? permitidas.get(0)
                : unidad.toUpperCase(Locale.ROOT).trim();

        if (!permitidas.contains(valor)) {
            throw new ReglaNegocioException("La unidad " + valor + " no está permitida para " + material.getNombre());
        }

        return valor;
    }

    private String normalizarTexto(String valor) {
        String texto = valor == null ? "" : valor;

        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private int calcularPuntos(Material material, Integer cantidad) {
        int base = switch (material.getCodigoIdentificador().toUpperCase(Locale.ROOT)) {
            case "PILAS" -> 25;
            case "ELECTRONICOS" -> 30;
            case "OTROS_METALES" -> 18;
            case "ALUMINIO" -> 18;
            case "PP_RIGIDO" -> 14;
            case "PS" -> 12;
            case "PE_BOLSA_PE_RIGIDO" -> 14;
            case "PET_COLOR" -> 15;
            case "PET_TRANSPARENTE" -> 16;
            case "TETRA" -> 12;
            case "CARTONES_CARTULINAS" -> 10;
            case "PAPEL_CAFE" -> 8;
            case "PAPEL_BLANCO_TINTA_NEGRA" -> 9;
            default -> 5;
        };

        return Math.max(1, base * cantidad);
    }

    public FormularioReciclajeService(
            UsuarioRepository usuarioRepository,
            PuntoReciclajeRepository puntoRepository,
            MaterialRepository materialRepository,
            FormularioReciclajeRepository formularioRepository,
            DetalleFormularioMaterialRepository detalleRepository,
            MovimientoPuntosUsuarioRepository movimientoRepository,
            PuntoMaterialRepository puntoMaterialRepository,
            MapperService mapper
    ) {
        this.usuarioRepository = usuarioRepository;
        this.puntoRepository = puntoRepository;
        this.materialRepository = materialRepository;
        this.formularioRepository = formularioRepository;
        this.detalleRepository = detalleRepository;
        this.movimientoRepository = movimientoRepository;
        this.puntoMaterialRepository = puntoMaterialRepository;
        this.mapper = mapper;
    }
}