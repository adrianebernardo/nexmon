package com.nexmon.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Serve a pasta "frontend" pelo próprio Spring: abrindo http://localhost:8080
 * o site e a API ficam na MESMA origem (sem CORS e sem Live Server).
 * A pasta é procurada em: nexmon.frontend.dir (se definido), ../frontend e ./frontend.
 * Se não achar, a API continua funcionando normalmente, só sem servir o site.
 */
@Configuration
public class FrontendConfig implements WebMvcConfigurer {

    @Value("${nexmon.frontend.dir:}")
    private String dirConfigurado;

    private Path localizar() {
        List<String> candidatos = new ArrayList<>();
        if (dirConfigurado != null && !dirConfigurado.isBlank()) {
            candidatos.add(dirConfigurado);
        }
        candidatos.add("../frontend");
        candidatos.add("frontend");
        for (String c : candidatos) {
            Path pasta = Paths.get(c).toAbsolutePath().normalize();
            if (Files.exists(pasta.resolve("index.html"))) {
                return pasta;
            }
        }
        return null;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path pasta = localizar();
        if (pasta != null) {
            registry.addResourceHandler("/**").addResourceLocations(pasta.toUri().toString());
        }
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        if (localizar() != null) {
            registry.addRedirectViewController("/", "/index.html");
        }
    }
}
