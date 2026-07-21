package com.ashram.feedback.config;

import com.ashram.feedback.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                "/api-docs/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/residents/manage/**").hasRole("ADMIN")
                        .requestMatchers("/api/ai-settings/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/dishes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/dishes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/dishes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/menus/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/menus/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/menus/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/announcements/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/announcements/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/announcements/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/health-tips/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/health-tips/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/health-tips/**").hasRole("ADMIN")

                        // Authenticated endpoints (both roles)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
