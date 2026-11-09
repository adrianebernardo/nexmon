package com.nexmon.api.model;

/** Como o anúncio é oferecido. */
public enum Modalidade {
    VENDA,       // comprar de vez
    ALUGUEL,     // pagar por dia
    EMPRESTIMO,  // sem custo, por um período
    SERVICO      // trabalho sob encomenda (ilustração, costura...) -> usa Orçamento
}
