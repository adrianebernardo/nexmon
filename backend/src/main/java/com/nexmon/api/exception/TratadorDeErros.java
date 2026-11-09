package com.nexmon.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Pega as exceções lançadas em QUALQUER controller/service e transforma em
 * resposta HTTP bonitinha (404, 400, 409) em vez de um erro 500 feio.
 */
@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException ex) {
        return montar(HttpStatus.NOT_FOUND, ex.getMessage(), List.of());
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResposta> regraNegocio(RegraNegocioException ex) {
        return montar(HttpStatus.BAD_REQUEST, ex.getMessage(), List.of());
    }

    @ExceptionHandler(NaoAutorizadoException.class)
    public ResponseEntity<ErroResposta> naoAutorizado(NaoAutorizadoException ex) {
        return montar(HttpStatus.UNAUTHORIZED, ex.getMessage(), List.of());
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResposta> conflito(ConflitoException ex) {
        return montar(HttpStatus.CONFLICT, ex.getMessage(), List.of());
    }

    // Disparada quando o JSON falha nas validações (@NotBlank, @Email, @NotNull...).
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException ex) {
        List<String> detalhes = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .toList();
        return montar(HttpStatus.BAD_REQUEST, "Dados inválidos", detalhes);
    }

    // Disparada quando o JSON está quebrado ou tem valor de enum inexistente (ex.: "PIRATA").
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResposta> jsonInvalido(HttpMessageNotReadableException ex) {
        return montar(HttpStatus.BAD_REQUEST,
                "JSON inválido. Confira a sintaxe, as datas (AAAA-MM-DD) e os valores dos enums.", List.of());
    }

    private ResponseEntity<ErroResposta> montar(HttpStatus status, String mensagem, List<String> detalhes) {
        ErroResposta corpo = new ErroResposta(LocalDateTime.now(), status.value(), mensagem, detalhes);
        return ResponseEntity.status(status).body(corpo);
    }
}
