package com.nexmon.api.exception;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Formato padrão de erro devolvido em JSON para o front.
 * "record" é uma classe curta só para guardar dados: o Java cria sozinho
 * o construtor e os getters (timestamp(), status()...).
 */
public record ErroResposta(LocalDateTime timestamp, int status, String mensagem, List<String> detalhes) {
}
