package cl.ecoconce.security;

import cl.ecoconce.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Helper de seguridad para expresiones SpEL en @PreAuthorize.
 *
 * Resuelve la comparación "¿el usuario autenticado es el dueño del recurso?"
 * a partir del correo (que es el username del JWT) y el id numérico del recurso.
 * Reemplaza la comparación incorrecta {@code authentication.principal.username == #id.toString()}
 * que comparaba el correo contra un id numérico y siempre daba falso.
 */
@Component("userSecurity")
public class UserSecurity {

    private final UsuarioRepository usuarioRepository;

    public UserSecurity(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public boolean isOwner(Authentication authentication, Long usuarioId) {
        if (authentication == null || usuarioId == null) {
            return false;
        }
        String correo = authentication.getName();
        return usuarioRepository.findByCorreo(correo)
                .map(usuario -> usuario.getId().equals(usuarioId))
                .orElse(false);
    }
}
