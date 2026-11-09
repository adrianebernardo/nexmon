package com.nexmon.api.model;

/** Ciclo de vida de um orçamento de serviço. */
public enum StatusOrcamento {
    SOLICITADO,  // cliente pediu
    RESPONDIDO,  // prestador mandou valor e prazo
    ACEITO,
    REJEITADO
}
