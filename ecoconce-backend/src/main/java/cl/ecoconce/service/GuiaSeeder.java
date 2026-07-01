package cl.ecoconce.service;

import cl.ecoconce.entity.GuiaReciclaje;
import cl.ecoconce.entity.Material;
import cl.ecoconce.repository.GuiaReciclajeRepository;
import cl.ecoconce.repository.MaterialRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Siembra las guías de reciclaje de forma idempotente: inserta cada guía solo si
 * no existe ya una con el mismo título. A diferencia de DataSeeder (que solo corre
 * en una base vacía), este seeder corre en cada arranque, por lo que las guías
 * nuevas aparecen sin necesidad de recrear ni borrar datos.
 *
 * Cada guía se asocia a un Material por su código identificador; la guía del
 * Kit de Compostaje no tiene material (es de tipo general).
 */
@Component
@Order(2) // Corre después de DataSeeder, cuando los materiales ya existen
public class GuiaSeeder implements CommandLineRunner {

    private final GuiaReciclajeRepository guiaRepository;
    private final MaterialRepository materialRepository;

    public GuiaSeeder(GuiaReciclajeRepository guiaRepository, MaterialRepository materialRepository) {
        this.guiaRepository = guiaRepository;
        this.materialRepository = materialRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Elimina las 3 guías genéricas antiguas, reemplazadas por las guías por material
        guiaRepository.deleteByTituloIn(List.of(
                "Aprende a separar residuos en casa",
                "Cómo declarar materiales correctamente",
                "Preparación de PET, papel y cartón"
        ));

        crear("Botellas PET transparentes: paso a paso",
                "Cómo dejar listas tus botellas plásticas transparentes para reciclar.",
                "Las botellas PET transparentes (agua, bebidas) son uno de los plásticos más fáciles de reciclar.\n\n"
                        + "Cómo prepararlas:\n"
                        + "1. Vacíalas por completo.\n"
                        + "2. Enjuágalas con un poco de agua.\n"
                        + "3. Aplástalas para que ocupen menos espacio.\n"
                        + "4. Vuelve a ponerles la tapa para no perderla.\n\n"
                        + "✅ Sí: botellas de agua, bebidas y jugos.\n"
                        + "🚫 No: botellas con aceite, restos de comida o líquidos.\n\n"
                        + "💡 Tip: una botella aplastada ocupa hasta 4 veces menos espacio en el ecopunto.",
                "PET_TRANSPARENTE");

        crear("Botellas PET de color",
                "Botellas plásticas de color, listas para reciclar.",
                "El PET de color (verde, azul o ámbar) se recicla aparte del transparente porque su pigmento cambia el resultado final.\n\n"
                        + "Cómo prepararlas:\n"
                        + "1. Vacía y enjuaga.\n"
                        + "2. Aplasta para reducir volumen.\n"
                        + "3. Sepáralas de las transparentes cuando puedas.\n\n"
                        + "✅ Sí: botellas de bebidas de color, envases de limpieza enjuagados.\n"
                        + "🚫 No: envases con químicos sin enjuagar.\n\n"
                        + "💡 Tip: si dudas del color, déjala en PET de color.",
                "PET_COLOR");

        crear("Cartón y cartulina",
                "Cajas y cartulinas limpias y secas para reciclar.",
                "El cartón es 100% reciclable siempre que esté limpio y seco.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Desarma las cajas y aplánalas.\n"
                        + "2. Retira cintas adhesivas, plumavit y plásticos.\n"
                        + "3. Mantenlo seco (el cartón mojado no sirve).\n\n"
                        + "✅ Sí: cajas, cartulinas y tubos de cartón.\n"
                        + "🚫 No: cartón con grasa (cajas de pizza sucias), encerado o plastificado.\n\n"
                        + "💡 Tip: aplanar el cartón te deja llevar mucho más en un solo viaje.",
                "CARTONES_CARTULINAS");

        crear("Papel de oficina",
                "Hojas blancas o impresas con tinta negra.",
                "El papel blanco es de los materiales de mayor valor para reciclar.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Retira corchetes, clips y espirales.\n"
                        + "2. Mantenlo seco y sin arrugar de más.\n"
                        + "3. Júntalo en un solo paquete o bolsa.\n\n"
                        + "✅ Sí: hojas, cuadernos (sin tapa plástica), sobres sin ventana.\n"
                        + "🚫 No: papel mojado, con comida, servilletas o papel higiénico.\n\n"
                        + "💡 Tip: el papel se puede reciclar varias veces antes de perder calidad.",
                "PAPEL_BLANCO_TINTA_NEGRA");

        crear("Papel y bolsas kraft (café)",
                "Papel café y bolsas de tipo kraft.",
                "El papel café o kraft (bolsas, envoltorios) se recicla junto a las fibras de papel.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Sacude restos de comida o tierra.\n"
                        + "2. Mantenlo seco.\n"
                        + "3. Dóblalo o agrúpalo.\n\n"
                        + "✅ Sí: bolsas de pan, envoltorios kraft, papel de embalaje café.\n"
                        + "🚫 No: papel con grasa o muy sucio.\n\n"
                        + "💡 Tip: si tiene ventana plástica o mucha cinta, retírala primero.",
                "PAPEL_CAFE");

        crear("Latas de aluminio",
                "Latas de bebida y piezas de aluminio.",
                "El aluminio se recicla infinitas veces sin perder calidad y ahorra muchísima energía.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Vacía y enjuaga la lata.\n"
                        + "2. Aplástala para ahorrar espacio.\n"
                        + "3. Junta varias antes de llevarlas.\n\n"
                        + "✅ Sí: latas de bebida, papel aluminio limpio, bandejas de aluminio.\n"
                        + "🚫 No: latas con líquido o restos de comida.\n\n"
                        + "💡 Tip: reciclar una lata ahorra mucha de la energía de fabricarla desde cero.",
                "ALUMINIO");

        crear("Otros metales",
                "Metales distintos al aluminio, limpios y separados.",
                "Aquí van los metales que no son aluminio: hojalata, acero y piezas pequeñas.\n\n"
                        + "Cómo prepararlos:\n"
                        + "1. Enjuaga si tuvieron alimentos.\n"
                        + "2. Separa por tamaño.\n"
                        + "3. Junta las piezas pequeñas en una bolsa para que no se pierdan.\n\n"
                        + "✅ Sí: latas de conserva (hojalata), tapas metálicas, piezas pequeñas de metal.\n"
                        + "🚫 No: envases de aerosol con contenido, metales con pintura tóxica.\n\n"
                        + "💡 Tip: un imán ayuda a distinguir el acero (sí pega) del aluminio (no pega).",
                "OTROS_METALES");

        crear("Pilas y baterías",
                "Disposición segura de pilas y baterías pequeñas.",
                "⚠️ Las pilas NUNCA van a la basura común: una sola puede contaminar miles de litros de agua.\n\n"
                        + "Cómo prepararlas:\n"
                        + "1. No las mojes ni las abras.\n"
                        + "2. Si una está hinchada o con fugas, ponla en una bolsa aparte.\n"
                        + "3. Llévalas a un ecopunto que reciba pilas.\n\n"
                        + "✅ Sí: pilas AA/AAA, de botón y baterías pequeñas de celular.\n"
                        + "🚫 No: tirarlas al basurero ni al desagüe.\n\n"
                        + "💡 Tip: junta tus pilas usadas en un frasco en casa hasta tener varias.",
                "PILAS");

        crear("Residuos electrónicos (e-waste)",
                "Aparatos eléctricos y electrónicos pequeños.",
                "Los electrónicos tienen materiales valiosos (cobre, oro) y otros peligrosos, por eso se reciclan aparte.\n\n"
                        + "Cómo prepararlos:\n"
                        + "1. Borra tus datos personales antes de entregar un dispositivo.\n"
                        + "2. Retira las pilas o baterías (van por separado).\n"
                        + "3. Enrolla y junta los cables.\n\n"
                        + "✅ Sí: cargadores, cables, audífonos, controles y equipos pequeños.\n"
                        + "🚫 No: electrodomésticos grandes (tienen retiro especial).\n\n"
                        + "💡 Tip: un celular en desuso igual sirve: sus metales se recuperan.",
                "ELECTRONICOS");

        crear("Envases Tetra Pak",
                "Cajas de leche, jugo y similares.",
                "El Tetra Pak combina cartón, plástico y aluminio, y se recicla en plantas especiales.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Vacíalo bien.\n"
                        + "2. Enjuágalo con un poco de agua.\n"
                        + "3. Ábrelo y aplástalo para que quede plano.\n\n"
                        + "✅ Sí: cajas de leche, jugo, crema y caldos.\n"
                        + "🚫 No: envases con líquido o restos.\n\n"
                        + "💡 Tip: dejar la cajita abierta ayuda a que se seque y no genere olor.",
                "TETRA");

        crear("Plástico PP rígido",
                "Potes y envases de polipropileno rígido.",
                "El PP rígido (símbolo 5) es común en potes de yogur, margarina y envases de cocina.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Vacía y enjuaga.\n"
                        + "2. Retira tapas y láminas de aluminio.\n"
                        + "3. Encájalos entre sí para ahorrar espacio.\n\n"
                        + "✅ Sí: potes de yogur/margarina, tapas plásticas, baldes pequeños.\n"
                        + "🚫 No: envases con restos de comida.\n\n"
                        + "💡 Tip: revisa el número dentro del triángulo: el 5 es PP.",
                "PP_RIGIDO");

        crear("Poliestireno (PS)",
                "Plástico rígido tipo PS, limpio y separado.",
                "El PS (símbolo 6) aparece en vasos, cubiertos desechables y algunos envases rígidos.\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Enjuaga si tuvo alimentos.\n"
                        + "2. Sepáralo del plumavit (aislapol), que se trata distinto.\n"
                        + "3. Agrúpalo limpio.\n\n"
                        + "✅ Sí: vasos y cubiertos de plástico rígido, bandejas PS.\n"
                        + "🚫 No: plumavit sucio o con comida.\n\n"
                        + "💡 Tip: si se quiebra haciendo 'crack', suele ser PS.",
                "PS");

        crear("Plásticos PE: bolsas y rígidos",
                "Bolsas plásticas y envases de polietileno.",
                "El PE incluye las bolsas (PE flexible) y envases como las botellas de shampoo (PE rígido).\n\n"
                        + "Cómo prepararlo:\n"
                        + "1. Vacía y enjuaga los envases rígidos.\n"
                        + "2. Junta las bolsas limpias y secas dentro de una sola bolsa.\n"
                        + "3. Retira restos de comida o etiquetas sueltas.\n\n"
                        + "✅ Sí: bolsas de supermercado limpias, botellas de shampoo/detergente enjuagadas.\n"
                        + "🚫 No: bolsas sucias, con comida o muy rotas.\n\n"
                        + "💡 Tip: 'una bolsa llena de bolsas' es la forma más cómoda de entregarlas.",
                "PE_BOLSA_PE_RIGIDO");

        // Guía destacada del premio (sin material asociado)
        crear("Cómo usar tu Kit de Compostaje Inicial 🌱",
                "Guía amigable para empezar a compostar en casa con el kit que canjeaste en EcoConce.",
                "¡Felicitaciones! 🎉 Canjeaste el Kit de Compostaje Inicial y diste el primer paso para convertir tus restos de comida en abono para tus plantas.\n\n"
                        + "📦 ¿Qué incluye tu kit?\n"
                        + "• Un contenedor pequeño con tapa.\n"
                        + "• Una guía impresa de inicio rápido.\n\n"
                        + "🟢 Lo que SÍ puedes compostar (mezcla \"verdes\" y \"cafés\"):\n"
                        + "• Verdes (húmedos): cáscaras de fruta y verdura, restos de café y té, pasto fresco.\n"
                        + "• Cafés (secos): hojas secas, cartón sin tinta, servilletas de papel, cáscaras de huevo.\n\n"
                        + "🔴 Lo que NO va al compost:\n"
                        + "• Carne, pescado, huesos y lácteos (atraen plagas y dan mal olor).\n"
                        + "• Aceites y comida cocinada con grasa.\n"
                        + "• Plásticos, metales o vidrio.\n\n"
                        + "🪴 Paso a paso para empezar:\n"
                        + "1. Pon una base de material café (hojas o cartón) en el fondo del contenedor.\n"
                        + "2. Agrega tus restos verdes a medida que cocinas.\n"
                        + "3. Por cada porción de verdes, suma una de cafés para equilibrar.\n"
                        + "4. Revuelve cada 3-4 días para darle aire.\n"
                        + "5. Mantén una humedad de \"esponja exprimida\": ni seca ni empapada.\n\n"
                        + "⏱️ ¿Cuándo está listo?\n"
                        + "En 6 a 10 semanas tendrás un abono oscuro, suelto y con olor a tierra de bosque. ¡Eso es compost!\n\n"
                        + "🌻 Cómo usar tu compost:\n"
                        + "• Mezcla un puñado con la tierra de tus macetas.\n"
                        + "• Espárcelo alrededor de tus plantas como abono natural.\n\n"
                        + "💚 Así evitas que tus residuos terminen en el vertedero y le devuelves vida a la tierra. ¡Gracias por reciclar con EcoConce!",
                null);
    }

    private void crear(String titulo, String descripcion, String contenido, String codigoMaterial) {
        if (guiaRepository.existsByTitulo(titulo)) {
            return;
        }

        Material material = codigoMaterial == null
                ? null
                : materialRepository.findByCodigoIdentificador(codigoMaterial).orElse(null);

        guiaRepository.save(GuiaReciclaje.builder()
                .titulo(titulo)
                .descripcion(descripcion)
                .contenido(contenido)
                .material(material)
                .build());
    }
}
