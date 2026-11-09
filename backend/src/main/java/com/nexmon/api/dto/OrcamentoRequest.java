package com.nexmon.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Pedido de orçamento: o cliente descreve o projeto e (opcionalmente) o prazo que deseja. */
public record OrcamentoRequest(
        @NotNull(message = "anuncioId é obrigatório") Long anuncioId,
        @NotNull(message = "clienteId é obrigatório") Long clienteId,
        @NotBlank(message = "Descreva o projeto") String descricaoProjeto,
        @Positive(message = "Prazo deve ser maior que zero") Integer prazoDias) {
}
