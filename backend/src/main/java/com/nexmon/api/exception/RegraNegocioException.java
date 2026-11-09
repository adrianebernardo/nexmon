package com.nexmon.api.exception;

/** Lançada quando o pedido viola uma regra do sistema. Vira HTTP 400. */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
