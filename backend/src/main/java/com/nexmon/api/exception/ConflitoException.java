package com.nexmon.api.exception;

/** Lançada quando o pedido conflita com algo que já existe (e-mail repetido, datas ocupadas). Vira HTTP 409. */
public class ConflitoException extends RuntimeException {
    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
