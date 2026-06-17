package cl.ecoconce.config;

import cl.ecoconce.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny()) // protección clickjacking
                .contentTypeOptions(Customizer.withDefaults())
            )
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers(
                    "/api/usuarios/login",
                    "/api/usuarios/register",
                    "/api/usuarios",             // POST registro
                    "/api/puntos",               // GET mapa público
                    "/api/guias",                // GET guías públicas
                    "/api/materiales",           // GET materiales
                    "/api/bd/regiones",          // Regiones públicas para registro
                    "/api/bd/comunas",           // Comunas públicas para registro
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                // Rutas solo ADMIN
                .requestMatchers(
                    "/api/premios/admin/**",
                    "/api/usuarios/admin/**",
                    "/api/reportes/admin/**",
                    "/api/canjes/admin/**"
                ).hasRole("ADMIN")
                // Rutas ADMIN o MANTENEDOR
                .requestMatchers(
                    "/api/puntos/mantenedor/**",
                    "/api/reportes/mantenedor/**"
                ).hasAnyRole("ADMIN", "MANTENEDOR")
                // Todo lo demás requiere token válido
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
