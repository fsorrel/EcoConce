package cl.ecoconce.security;

import cl.ecoconce.entity.Rol;
import cl.ecoconce.entity.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pruebas de JwtService: generación, validación y extracción de claims.
 * Verifican que un token alterado o un string arbitrario no se consideren válidos.
 */
@SpringBootTest
@ActiveProfiles("test")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    private Usuario usuarioMock() {
        Rol rol = new Rol();
        rol.setNombre("CIUDADANO");

        Usuario u = new Usuario();
        u.setId(1L);
        u.setCorreo("test@ecoconce.cl");
        u.setRol(rol);
        return u;
    }

    @Test
    @DisplayName("Token generado es válido")
    void generateToken_tokenEsValido() {
        String token = jwtService.generateToken(usuarioMock());
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Token extraído tiene los claims correctos")
    void generateToken_claimsCorrectos() {
        String token = jwtService.generateToken(usuarioMock());
        assertThat(jwtService.extractUsername(token)).isEqualTo("test@ecoconce.cl");
        assertThat(jwtService.extractUserId(token)).isEqualTo(1L);
        assertThat(jwtService.extractRole(token)).isEqualTo("CIUDADANO");
    }

    @Test
    @DisplayName("Token modificado es inválido")
    void isTokenValid_tokenModificado_retornaFalse() {
        String token = jwtService.generateToken(usuarioMock());
        String tokenModificado = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtService.isTokenValid(tokenModificado)).isFalse();
    }

    @Test
    @DisplayName("String aleatorio o vacío no es token válido")
    void isTokenValid_stringAleatorio_retornaFalse() {
        assertThat(jwtService.isTokenValid("esto.no.es.un.jwt")).isFalse();
        assertThat(jwtService.isTokenValid("")).isFalse();
    }
}
