export const UNIDADES_POR_MATERIAL: Record<string, string[]> = {
  "pilas": ["UNIDAD", "OTRO"],
  "electronicos": ["UNIDAD", "OTRO"],
  "otros metales": ["UNIDAD", "BOLSA", "SACO", "OTRO"],
  "aluminio": ["UNIDAD", "BOLSA", "SACO", "OTRO"],
  "pp rigido": ["UNIDAD", "BOLSA", "SACO", "OTRO"],
  "ps": ["UNIDAD", "BOLSA", "SACO", "OTRO"],
  "pe bolsa + pe rigido": ["BOLSA", "UNIDAD", "SACO", "OTRO"],
  "pet color": ["BOLSA", "UNIDAD", "SACO", "OTRO"],
  "pet transparente": ["BOLSA", "UNIDAD", "SACO", "OTRO"],
  "tetra": ["UNIDAD", "BOLSA", "CAJA", "OTRO"],
  "cartones o cartulinas": ["CAJA", "BOLSA", "SACO", "OTRO"],
  "papel cafe": ["BOLSA", "CAJA", "SACO", "OTRO"],
  "papel blanco o con tinta negra": ["BOLSA", "CAJA", "SACO", "OTRO"],
};

export const ORDEN_MATERIALES_FORMULARIO = [
  "pilas",
  "electronicos",
  "otros metales",
  "aluminio",
  "pp rigido",
  "ps",
  "pe bolsa + pe rigido",
  "pet color",
  "pet transparente",
  "tetra",
  "cartones o cartulinas",
  "papel cafe",
  "papel blanco o con tinta negra",
];

export const normalizarNombreMaterial = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const getUnidadesPermitidasPorMaterial = (nombre: string) =>
  UNIDADES_POR_MATERIAL[normalizarNombreMaterial(nombre)] ?? [];

export const materialPermitidoEnFormulario = (nombre: string) =>
  getUnidadesPermitidasPorMaterial(nombre).length > 0;

export const ordenarMaterialesFormulario = <T extends { nombre: string }>(materiales: T[]) =>
  [...materiales]
    .filter((material) => materialPermitidoEnFormulario(material.nombre))
    .sort((a, b) => {
      const indexA = ORDEN_MATERIALES_FORMULARIO.indexOf(normalizarNombreMaterial(a.nombre));
      const indexB = ORDEN_MATERIALES_FORMULARIO.indexOf(normalizarNombreMaterial(b.nombre));
      return indexA - indexB;
    });

export const unidadLabel = (unidad: string) => {
  const normalized = unidad.toUpperCase();
  if (normalized === "UNIDAD") return "Unidad";
  if (normalized === "BOLSA") return "Bolsa";
  if (normalized === "CAJA") return "Caja";
  if (normalized === "SACO") return "Saco";
  if (normalized === "OTRO") return "Otro";
  return unidad;
};
