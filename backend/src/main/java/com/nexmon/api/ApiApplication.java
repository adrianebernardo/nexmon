package com.nexmon.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de partida da aplicação. É daqui que o "Run" liga tudo.
 * O @SpringBootApplication faz o Spring varrer todos os pacotes dentro de
 * com.nexmon.api procurando @Entity, @Service, @RestController etc.
 * (por isso todas as pastas precisam ficar DENTRO de com.nexmon.api).
 */
@SpringBootApplication
public class ApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }
}
