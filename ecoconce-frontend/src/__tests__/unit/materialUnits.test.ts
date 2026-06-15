import { describe, it, expect } from 'vitest';
import {
  normalizarNombreMaterial,
  getUnidadesPermitidasPorMaterial,
  materialPermitidoEnFormulario,
  ordenarMaterialesFormulario,
  unidadLabel,
} from '../../app/lib/materialUnits';

describe('materialUnits Unit Tests', () => {
  // Test 1: normalizarNombreMaterial con texto simple
  it('normalizarNombreMaterial debe convertir a minúsculas y quitar espacios en los bordes', () => {
    expect(normalizarNombreMaterial('  Cartones o Cartulinas  ')).toBe('cartones o cartulinas');
  });

  // Test 2: normalizarNombreMaterial con acentos y caracteres especiales
  it('normalizarNombreMaterial debe eliminar acentos y diacríticos', () => {
    expect(normalizarNombreMaterial('Plásticos y Pilás')).toBe('plasticos y pilas');
  });

  // Test 3: normalizarNombreMaterial con múltiples espacios internos
  it('normalizarNombreMaterial debe colapsar múltiples espacios internos a uno solo', () => {
    expect(normalizarNombreMaterial('aluminio    y   metales')).toBe('aluminio y metales');
  });

  // Test 4: getUnidadesPermitidasPorMaterial con material existente
  it('getUnidadesPermitidasPorMaterial debe retornar las unidades correctas para pilas', () => {
    expect(getUnidadesPermitidasPorMaterial('pilas')).toEqual(['UNIDAD', 'OTRO']);
  });

  // Test 5: getUnidadesPermitidasPorMaterial con material inexistente
  it('getUnidadesPermitidasPorMaterial debe retornar un arreglo vacío para un material inexistente', () => {
    expect(getUnidadesPermitidasPorMaterial('madera')).toEqual([]);
  });

  // Test 6: materialPermitidoEnFormulario para material permitido
  it('materialPermitidoEnFormulario debe retornar true para pet transparente', () => {
    expect(materialPermitidoEnFormulario('pet transparente')).toBe(true);
  });

  // Test 7: materialPermitidoEnFormulario para material no permitido
  it('materialPermitidoEnFormulario debe retornar false para vidrio', () => {
    expect(materialPermitidoEnFormulario('vidrio')).toBe(false);
  });

  // Test 8: ordenarMaterialesFormulario ordena correctamente según el índice predefinido
  it('ordenarMaterialesFormulario debe ordenar los materiales según el orden oficial', () => {
    const materiales = [
      { nombre: 'aluminio' },
      { nombre: 'pilas' },
      { nombre: 'cartones o cartulinas' },
    ];
    const ordenados = ordenarMaterialesFormulario(materiales);
    expect(ordenados[0].nombre).toBe('pilas');
    expect(ordenados[1].nombre).toBe('aluminio');
    expect(ordenados[2].nombre).toBe('cartones o cartulinas');
  });

  // Test 9: ordenarMaterialesFormulario filtra materiales no permitidos
  it('ordenarMaterialesFormulario debe filtrar los materiales no permitidos', () => {
    const materiales = [
      { nombre: 'pilas' },
      { nombre: 'vidrio y escombros' }, // No permitido
      { nombre: 'aluminio' },
    ];
    const ordenados = ordenarMaterialesFormulario(materiales);
    expect(ordenados.length).toBe(2);
    expect(ordenados.map(m => m.nombre)).toEqual(['pilas', 'aluminio']);
  });

  // Test 10: unidadLabel retorna etiquetas bonitas o el mismo valor si no coincide
  it('unidadLabel debe retornar la etiqueta con mayúscula inicial o el valor original', () => {
    expect(unidadLabel('UNIDAD')).toBe('Unidad');
    expect(unidadLabel('BOLSA')).toBe('Bolsa');
    expect(unidadLabel('CAJA')).toBe('Caja');
    expect(unidadLabel('SACO')).toBe('Saco');
    expect(unidadLabel('OTRO')).toBe('Otro');
    expect(unidadLabel('KILOGRAMO')).toBe('KILOGRAMO'); // No mapeado, retorna igual
  });
});
