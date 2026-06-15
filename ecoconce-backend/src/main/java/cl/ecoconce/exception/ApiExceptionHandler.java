package cl.ecoconce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> recursoNoEncontrado(RecursoNoEncontradoException ex) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, Object>> reglaNegocio(ReglaNegocioException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Datos inválidos");
        return respuesta(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> errorGeneral(Exception ex) {
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> respuesta(HttpStatus estado, String mensaje) {
        Map<String, Object> body = new HashMap<>();
        body.put("fecha", LocalDateTime.now());
        body.put("estado", estado.value());
        body.put("mensaje", mensaje);
        return ResponseEntity.status(estado).body(body);
    }
}
