package com.nexmon.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS: por padrão o navegador BLOQUEIA o front (ex.: http://localhost:5500 do Live Server)
 * de chamar uma API em outra porta (8080). Esta classe libera isso para o desenvolvimento.
 * "null" é a origem de quem abre o index.html direto do disco (file://).
 * Em produção, troque pelos endereços reais do site.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("null")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
