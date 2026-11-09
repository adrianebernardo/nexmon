package com.nexmon.api.exception;

/** Credenciais erradas (vira HTTP 401). */
public class NaoAutorizadoException extends RuntimeException {
    public NaoAutorizadoException(String mensagem) {
        super(mensagem);
    }
}
