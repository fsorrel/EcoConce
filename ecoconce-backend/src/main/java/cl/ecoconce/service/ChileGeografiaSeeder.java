package cl.ecoconce.service;

import cl.ecoconce.entity.Comuna;
import cl.ecoconce.entity.Region;
import cl.ecoconce.repository.ComunaRepository;
import cl.ecoconce.repository.RegionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class ChileGeografiaSeeder implements CommandLineRunner {
    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;

    public ChileGeografiaSeeder(RegionRepository regionRepository, ComunaRepository comunaRepository) {
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (RegionData regionData : REGIONES_CHILE) {
            Region region = regionRepository.findByNombre(regionData.nombre())
                    .orElseGet(() -> regionRepository.save(Region.builder().nombre(regionData.nombre()).build()));

            for (String comunaNombre : regionData.comunas()) {
                if (comunaRepository.findByNombreAndRegionId(comunaNombre, region.getId()).isEmpty()) {
                    comunaRepository.save(Comuna.builder()
                            .nombre(comunaNombre)
                            .region(region)
                            .build());
                }
            }
        }
    }

    private record RegionData(String nombre, List<String> comunas) {}

    private static final List<RegionData> REGIONES_CHILE = List.of(
            new RegionData("Arica y Parinacota", List.of(
                    "Arica", "Camarones", "Putre", "General Lagos"
            )),
            new RegionData("Tarapacá", List.of(
                    "Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"
            )),
            new RegionData("Antofagasta", List.of(
                    "Antofagasta", "Mejillones", "Sierra Gorda", "Taltal",
                    "Calama", "Ollagüe", "San Pedro de Atacama",
                    "Tocopilla", "María Elena"
            )),
            new RegionData("Atacama", List.of(
                    "Copiapó", "Caldera", "Tierra Amarilla",
                    "Chañaral", "Diego de Almagro",
                    "Vallenar", "Alto del Carmen", "Freirina", "Huasco"
            )),
            new RegionData("Coquimbo", List.of(
                    "La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña",
                    "Illapel", "Canela", "Los Vilos", "Salamanca",
                    "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"
            )),
            new RegionData("Valparaíso", List.of(
                    "Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar",
                    "Rapa Nui",
                    "Los Andes", "Calle Larga", "Rinconada", "San Esteban",
                    "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar",
                    "Quillota", "La Calera", "Hijuelas", "La Cruz", "Nogales",
                    "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo",
                    "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María",
                    "Quilpué", "Limache", "Olmué", "Villa Alemana"
            )),
            new RegionData("Metropolitana de Santiago", List.of(
                    "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
                    "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana",
                    "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú",
                    "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura",
                    "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura",
                    "Puente Alto", "Pirque", "San José de Maipo",
                    "Colina", "Lampa", "Tiltil",
                    "San Bernardo", "Buin", "Calera de Tango", "Paine",
                    "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro",
                    "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
            )),
            new RegionData("Libertador General Bernardo O'Higgins", List.of(
                    "Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras",
                    "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco",
                    "Rengo", "Requínoa", "San Vicente",
                    "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones",
                    "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo",
                    "Placilla", "Pumanque", "Santa Cruz"
            )),
            new RegionData("Maule", List.of(
                    "Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue",
                    "Río Claro", "San Clemente", "San Rafael",
                    "Cauquenes", "Chanco", "Pelluhue",
                    "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia",
                    "Teno", "Vichuquén",
                    "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"
            )),
            new RegionData("Ñuble", List.of(
                    "Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo",
                    "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo",
                    "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián",
                    "San Ignacio", "San Nicolás", "Treguaco", "Yungay"
            )),
            new RegionData("Biobío", List.of(
                    "Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco",
                    "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén",
                    "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa",
                    "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete",
                    "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"
            )),
            new RegionData("La Araucanía", List.of(
                    "Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea",
                    "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco",
                    "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún",
                    "Villarrica", "Cholchol",
                    "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces",
                    "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"
            )),
            new RegionData("Los Ríos", List.of(
                    "Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco",
                    "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"
            )),
            new RegionData("Los Lagos", List.of(
                    "Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos",
                    "Llanquihue", "Maullín", "Puerto Varas",
                    "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón",
                    "Queilén", "Quellón", "Quemchi", "Quinchao",
                    "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro",
                    "San Juan de la Costa", "San Pablo",
                    "Chaitén", "Futaleufú", "Hualaihué", "Palena"
            )),
            new RegionData("Aysén del General Carlos Ibáñez del Campo", List.of(
                    "Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas",
                    "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"
            )),
            new RegionData("Magallanes y de la Antártica Chilena", List.of(
                    "Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio",
                    "Cabo de Hornos", "Antártica",
                    "Porvenir", "Primavera", "Timaukel",
                    "Natales", "Torres del Paine"
            ))
    );
}