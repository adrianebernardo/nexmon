package com.nexmon.api.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Pedido de reserva. As datas chegam no formato AAAA-MM-DD (ex.: "2026-12-10").
 * Datas são obrigatórias só para aluguel e empréstimo (o service confere);
 * para venda e serviço elas podem ser omitidas.
 */
public record ReservaRequest(
        @NotNull(message = "anuncioId é obrigatório") Long anuncioId,
        @NotNull(message = "usuarioId é obrigatório") Long usuarioId,
        LocalDate dataInicio,
        LocalDate dataFim) {
}
