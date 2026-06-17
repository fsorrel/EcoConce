package cl.ecoconce.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schema")
public class SchemaController {
    @GetMapping
    public List<Map<String, Object>> listarSchema() {
        return List.of(
                tabla("comunas", List.of("id", "nombre", "region_id")),
                tabla("detalle_formulario_materiales", List.of("id", "formulario_id", "material_id", "cantidad_declarada", "unidad_declarada", "puntos_obtenidos", "observacion")),
                tabla("estado_punto", List.of("id", "nombre")),
                tabla("formularios_reciclaje", List.of("id", "usuario_id", "punto_id", "distancia_metros", "total_puntos_obtenidos", "estado", "observacion", "fecha_formulario")),
                tabla("guias_reciclaje", List.of("id", "titulo", "descripcion", "contenido", "material_id", "fecha_creacion")),
                tabla("historial_estado_puntos", List.of("id", "punto_id", "estado_anterior_id", "estado_nuevo_id", "descripcion", "fecha_historial")),
                tabla("historial_premios_canjeados", List.of("id", "usuario_id", "premio_id", "nombre_premio", "puntos_gastados", "codigo_canje", "estado", "fecha_canje", "fecha_entrega", "observacion")),
                tabla("historial_recolecciones_puntos", List.of("id", "punto_id", "material_id", "mantenedor_id", "cantidad_retirada_compactada", "observacion", "fecha_recoleccion")),
                tabla("materiales", List.of("id", "nombre", "codigo_identificador", "descripcion")),
                tabla("movimientos_puntos_usuario", List.of("id", "usuario_id", "tipo_movimiento", "puntos", "formulario_id", "canje_id", "descripcion", "fecha_movimiento")),
                tabla("premios", List.of("id", "nombre", "descripcion", "costo_puntos", "stock", "activo")),
                tabla("punto_materiales", List.of("id", "punto_id", "material_id", "capacidad_compactado", "actual_compactado")),
                tabla("puntos_reciclaje", List.of("id", "nombre", "descripcion", "comuna_id", "direccion", "latitud", "longitud", "radio_validacion_m", "estado_id", "mantenedor_id", "fecha_creacion", "ultima_actualizacion")),
                tabla("regiones", List.of("id", "nombre")),
                tabla("reportes_puntos", List.of("id", "usuario_id", "punto_id", "tipo_reporte_id", "descripcion", "fecha_reporte")),
                tabla("roles", List.of("id", "nombre")),
                tabla("tipo_reporte", List.of("id", "nombre")),
                tabla("usuarios", List.of("id", "rut", "nombre_alias", "correo", "contrasena", "sexo_genero", "fecha_nacimiento", "telefono", "comuna_id", "direccion", "puntos", "rol_id", "activo", "fecha_registro", "fecha_ultimo_acceso"))
        );
    }

    private Map<String, Object> tabla(String nombre, List<String> columnas) {
        return Map.of("tabla", nombre, "totalColumnas", columnas.size(), "columnas", columnas);
    }
}
