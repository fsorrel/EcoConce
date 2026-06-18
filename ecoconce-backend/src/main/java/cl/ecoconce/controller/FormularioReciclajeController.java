package cl.ecoconce.controller;

import cl.ecoconce.dto.FormularioRequest;
import cl.ecoconce.dto.FormularioResponse;
import cl.ecoconce.service.FormularioReciclajeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/formularios")
public class FormularioReciclajeController {
    private final FormularioReciclajeService formularioService;

    @PostMapping("/usuario/{usuarioId}")
    public FormularioResponse crear(@PathVariable Long usuarioId, @Valid @RequestBody FormularioRequest request) {
        return formularioService.crear(usuarioId, request);
    }

    @PutMapping("/{id}/aprobar")
    public FormularioResponse aprobar(@PathVariable Long id) {
        return formularioService.aprobar(id);
    }

    @PutMapping("/{id}/rechazar")
    public FormularioResponse rechazar(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String observacion = body == null ? null : body.get("observacion");
        return formularioService.rechazar(id, observacion);
    }


    public FormularioReciclajeController(FormularioReciclajeService formularioService) {
        this.formularioService = formularioService;
    }
}
