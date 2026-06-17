package cl.ecoconce.service;

import cl.ecoconce.entity.*;
import cl.ecoconce.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {
    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;
    private final RolRepository rolRepository;
    private final EstadoPuntoRepository estadoRepository;
    private final TipoReporteRepository tipoReporteRepository;
    private final MaterialRepository materialRepository;
    private final UsuarioRepository usuarioRepository;
    private final PuntoReciclajeRepository puntoRepository;
    private final PuntoMaterialRepository puntoMaterialRepository;
    private final GuiaReciclajeRepository guiaRepository;
    private final PremioRepository premioRepository;
    private final FormularioReciclajeRepository formularioRepository;
    private final DetalleFormularioMaterialRepository detalleRepository;
    private final MovimientoPuntosUsuarioRepository movimientoRepository;
    private final HistorialRecoleccionPuntoRepository recoleccionRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        Region bioBio = regionRepository.findByNombre("Biobío")
                .orElseGet(() -> regionRepository.save(Region.builder()
                        .nombre("Biobío")
                        .build()));

        Comuna concepcion = comunaRepository.findByNombreAndRegionId("Concepción", bioBio.getId())
                .orElseGet(() -> comunaRepository.save(Comuna.builder()
                        .nombre("Concepción")
                        .region(bioBio)
                        .build()));
        Rol usuarioRol = rolRepository.save(Rol.builder().nombre("USUARIO").build());
        Rol adminRol = rolRepository.save(Rol.builder().nombre("ADMIN").build());
        Rol mantenedorRol = rolRepository.save(Rol.builder().nombre("MANTENEDOR").build());

        EstadoPunto operativo = estadoRepository.save(EstadoPunto.builder().nombre("OPERATIVO").build());
        EstadoPunto lleno = estadoRepository.save(EstadoPunto.builder().nombre("LLENO").build());
        estadoRepository.save(EstadoPunto.builder().nombre("MANTENIMIENTO").build());

        tipoReporteRepository.save(TipoReporte.builder().nombre("CONTENEDOR LLENO").build());
        tipoReporteRepository.save(TipoReporte.builder().nombre("DAÑADO").build());
        tipoReporteRepository.save(TipoReporte.builder().nombre("MAL USO").build());

        Material pilas = materialRepository.save(Material.builder().nombre("Pilas").codigoIdentificador("PILAS").descripcion("Pilas y baterías pequeñas para reciclaje o disposición segura.").build());
        Material electronicos = materialRepository.save(Material.builder().nombre("Electrónicos").codigoIdentificador("ELECTRONICOS").descripcion("Aparatos electrónicos pequeños y residuos eléctricos domiciliarios.").build());
        Material otrosMetales = materialRepository.save(Material.builder().nombre("Otros metales").codigoIdentificador("OTROS_METALES").descripcion("Metales distintos al aluminio, limpios y separados.").build());
        Material aluminio = materialRepository.save(Material.builder().nombre("Aluminio").codigoIdentificador("ALUMINIO").descripcion("Latas y piezas de aluminio limpias y compactadas.").build());
        Material ppRigido = materialRepository.save(Material.builder().nombre("PP rígido").codigoIdentificador("PP_RIGIDO").descripcion("Plástico PP rígido limpio y separado de otros materiales.").build());
        Material ps = materialRepository.save(Material.builder().nombre("PS").codigoIdentificador("PS").descripcion("Poliestireno limpio y separado para reciclaje.").build());
        Material peBolsaPeRigido = materialRepository.save(Material.builder().nombre("PE Bolsa + PE rígido").codigoIdentificador("PE_BOLSA_PE_RIGIDO").descripcion("Plástico PE en bolsa o rígido, limpio y separado.").build());
        Material petColor = materialRepository.save(Material.builder().nombre("PET color").codigoIdentificador("PET_COLOR").descripcion("Botellas PET de color limpias, idealmente aplastadas.").build());
        Material petTransparente = materialRepository.save(Material.builder().nombre("PET transparente").codigoIdentificador("PET_TRANSPARENTE").descripcion("Botellas PET transparentes limpias, idealmente aplastadas.").build());
        Material tetra = materialRepository.save(Material.builder().nombre("Tetra").codigoIdentificador("TETRA").descripcion("Envases tipo Tetra Pak limpios y aplastados.").build());
        Material cartonesCartulinas = materialRepository.save(Material.builder().nombre("Cartones o cartulinas").codigoIdentificador("CARTONES_CARTULINAS").descripcion("Cartones y cartulinas limpias, secas y compactadas.").build());
        Material papelCafe = materialRepository.save(Material.builder().nombre("Papel café").codigoIdentificador("PAPEL_CAFE").descripcion("Papel kraft o café limpio y seco.").build());
        Material papelBlancoTintaNegra = materialRepository.save(Material.builder().nombre("Papel blanco o con tinta negra").codigoIdentificador("PAPEL_BLANCO_TINTA_NEGRA").descripcion("Papel blanco o impreso solo con tinta negra, limpio y seco.").build());

        Usuario jordan = usuarioRepository.save(Usuario.builder()
                .rut("12345678-9")
                .nombreAlias("Jordan Díaz")
                .correo("jordan@ecoconce.cl")
                .contrasena(passwordEncoder.encode("1234"))
                .sexoGenero("No especifica")
                .fechaNacimiento(LocalDate.of(1998, 4, 12))
                .telefono("+56912345678")
                .comuna(concepcion)
                .direccion("Concepción centro")
                .puntos(2550)
                .rol(usuarioRol)
                .activo("S")
                .build());

        Usuario admin = usuarioRepository.save(Usuario.builder()
                .rut("11111111-1")
                .nombreAlias("Admin EcoConce")
                .correo("admin@ecoconce.cl")
                .contrasena(passwordEncoder.encode("1234"))
                .comuna(concepcion)
                .puntos(0)
                .rol(adminRol)
                .activo("S")
                .build());

        Usuario mantenedor = usuarioRepository.save(Usuario.builder()
                .rut("22222222-2")
                .nombreAlias("Mantenedor Plaza")
                .correo("mantenedor@ecoconce.cl")
                .contrasena(passwordEncoder.encode("1234"))
                .comuna(concepcion)
                .puntos(0)
                .rol(mantenedorRol)
                .activo("S")
                .build());

        PuntoReciclaje plazaPeru = puntoRepository.save(PuntoReciclaje.builder()
                .nombre("Ecopunto Universidad de Concepción")
                .descripcion("Punto principal para reciclaje domiciliario limpio.")
                .comuna(concepcion)
                .direccion("Universidad de Concepción, Concepción")
                .latitud(-36.828617)
                .longitud(-73.036050)
                .radioValidacionM(50)
                .estado(operativo)
                .mantenedor(mantenedor)
                .build());

        PuntoReciclaje parqueEcuador = puntoRepository.save(PuntoReciclaje.builder()
                .nombre("Ecopunto Parque Ecuador")
                .descripcion("Punto cercano al centro, recomendado para botellas y cartón.")
                .comuna(concepcion)
                .direccion("Parque Ecuador, Concepción")
                .latitud(-36.833247)
                .longitud(-73.047194)
                .radioValidacionM(50)
                .estado(operativo)
                .mantenedor(mantenedor)
                .build());

        PuntoReciclaje costanera = puntoRepository.save(PuntoReciclaje.builder()
                .nombre("Ecopunto Costanera Biobío")
                .descripcion("Punto con alta demanda durante fines de semana.")
                .comuna(concepcion)
                .direccion("Costanera, Concepción")
                .latitud(-36.831030)
                .longitud(-73.064286)
                .radioValidacionM(50)
                .estado(lleno)
                .mantenedor(mantenedor)
                .build());

        PuntoReciclaje duoc = puntoRepository.save(PuntoReciclaje.builder()
                .nombre("Ecopunto Duoc UC San Andrés")
                .descripcion("Punto de prueba.")
                .comuna(concepcion)
                .direccion("Duoc UC: Sede San Andrés")
                .latitud(-36.795416)
                .longitud(-73.062681)
                .radioValidacionM(100)
                .estado(operativo)
                .mantenedor(mantenedor)
                .build());

        guardarMaterialesPunto(plazaPeru, pilas, electronicos, aluminio, petTransparente, petColor, tetra, cartonesCartulinas, papelCafe, papelBlancoTintaNegra);
        guardarMaterialesPunto(parqueEcuador, otrosMetales, aluminio, ppRigido, ps, peBolsaPeRigido, petTransparente, cartonesCartulinas);
        guardarMaterialesPunto(costanera, petColor, petTransparente, tetra, cartonesCartulinas, papelCafe, papelBlancoTintaNegra);
        guardarMaterialesPunto(duoc, pilas, electronicos, aluminio, petTransparente, petColor, tetra, cartonesCartulinas, papelCafe, papelBlancoTintaNegra);
        
        guiaRepository.save(GuiaReciclaje.builder().titulo("Aprende a separar residuos en casa").descripcion("Guía rápida para preparar tus materiales antes de reciclar.").contenido("Lava los envases, aplasta botellas, separa tapas y separa plásticos, papeles, metales y envases Tetra antes de llevarlos al ecopunto.").material(petTransparente).build());
        guiaRepository.save(GuiaReciclaje.builder().titulo("Cómo declarar materiales correctamente").descripcion("Consejos para usar las unidades permitidas del formulario.").contenido("Elige el material exacto y luego selecciona solo una de las unidades permitidas: unidad, bolsa, caja, saco u otro, según corresponda.").material(cartonesCartulinas).build());
        guiaRepository.save(GuiaReciclaje.builder().titulo("Preparación de PET, papel y cartón").descripcion("Consejos para entregar materiales limpios y compactados.").contenido("Lava envases, aplasta botellas PET, pliega cartones y mantén papel blanco, papel café y cartulinas separados.").material(petColor).build());

       premioRepository.save(Premio.builder()
                .nombre("Bolsa reutilizable EcoConce")
                .descripcion("Bolsa de tela para compras diarias.")
                .costoPuntos(800)
                .stock(20)
                .activo("S")
                .envioDomicilio("S")
                .build());

        premioRepository.save(Premio.builder()
                .nombre("Descuento comercio local")
                .descripcion("Cupón de descuento para comercios asociados.")
                .costoPuntos(1500)
                .stock(12)
                .activo("S")
                .envioDomicilio("N")
                .build());

        premioRepository.save(Premio.builder()
                .nombre("Kit compostaje inicial")
                .descripcion("Guía impresa y contenedor pequeño para compost.")
                .costoPuntos(3000)
                .stock(4)
                .activo("S")
                .envioDomicilio("S")
                .build());

        FormularioReciclaje formulario = formularioRepository.save(FormularioReciclaje.builder()
                .usuario(jordan)
                .punto(plazaPeru)
                .distanciaMetros(35.0)
                .totalPuntosObtenidos(2550)
                .estado("APROBADO")
                .observacion("Registro inicial de demostración")
                .build());

        detalleRepository.save(DetalleFormularioMaterial.builder().formulario(formulario).material(petTransparente).cantidadDeclarada(4.0).unidadDeclarada("BOLSA").puntosObtenidos(950).build());
        detalleRepository.save(DetalleFormularioMaterial.builder().formulario(formulario).material(aluminio).cantidadDeclarada(2.0).unidadDeclarada("SACO").puntosObtenidos(700).build());
        detalleRepository.save(DetalleFormularioMaterial.builder().formulario(formulario).material(papelBlancoTintaNegra).cantidadDeclarada(3.0).unidadDeclarada("BOLSA").puntosObtenidos(450).build());
        detalleRepository.save(DetalleFormularioMaterial.builder().formulario(formulario).material(cartonesCartulinas).cantidadDeclarada(2.0).unidadDeclarada("CAJA").puntosObtenidos(450).build());

        movimientoRepository.save(MovimientoPuntosUsuario.builder()
                .usuario(jordan)
                .tipoMovimiento("GANANCIA")
                .puntos(2550)
                .formulario(formulario)
                .descripcion("Carga inicial de puntos")
                .build());

        recoleccionRepository.save(HistorialRecoleccionPunto.builder()
                .punto(plazaPeru)
                .material(petTransparente)
                .mantenedor(mantenedor)
                .cantidadRetiradaCompactada(12)
                .observacion("Retiro mensual de materiales compactados")
                .build());
    }

    private void guardarMaterialesPunto(PuntoReciclaje punto, Material... materiales) {
        int actual = 8;
        for (Material material : materiales) {
            puntoMaterialRepository.save(PuntoMaterial.builder()
                    .punto(punto)
                    .material(material)
                    .capacidadCompactado(100)
                    .actualCompactado(actual)
                    .build());
            actual += 11;
        }
    }


    public DataSeeder(RegionRepository regionRepository, ComunaRepository comunaRepository, RolRepository rolRepository, EstadoPuntoRepository estadoRepository, TipoReporteRepository tipoReporteRepository, MaterialRepository materialRepository, UsuarioRepository usuarioRepository, PuntoReciclajeRepository puntoRepository, PuntoMaterialRepository puntoMaterialRepository, GuiaReciclajeRepository guiaRepository, PremioRepository premioRepository, FormularioReciclajeRepository formularioRepository, DetalleFormularioMaterialRepository detalleRepository, MovimientoPuntosUsuarioRepository movimientoRepository, HistorialRecoleccionPuntoRepository recoleccionRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
        this.rolRepository = rolRepository;
        this.estadoRepository = estadoRepository;
        this.tipoReporteRepository = tipoReporteRepository;
        this.materialRepository = materialRepository;
        this.usuarioRepository = usuarioRepository;
        this.puntoRepository = puntoRepository;
        this.puntoMaterialRepository = puntoMaterialRepository;
        this.guiaRepository = guiaRepository;
        this.premioRepository = premioRepository;
        this.formularioRepository = formularioRepository;
        this.detalleRepository = detalleRepository;
        this.movimientoRepository = movimientoRepository;
        this.recoleccionRepository = recoleccionRepository;
        this.passwordEncoder = passwordEncoder;
    }
}
