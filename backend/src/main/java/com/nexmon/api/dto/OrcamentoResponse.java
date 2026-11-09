package com.nexmon.api.dto;

import com.nexmon.api.model.Orcamento;
import com.nexmon.api.model.StatusOrcamento;

import java.math.BigDecimal;

public record OrcamentoResponse(
        Long id,
        Long anuncioId,
        String anuncioTitulo,
        Long prestadorId,
        Long clienteId,
        String clienteNome,
        String descricaoProjeto,
        Integer prazoDias,
        BigDecimal valorEstimado,
        StatusOrcamento status) {

    public static OrcamentoResponse de(Orcamento o) {
        return new OrcamentoResponse(
                o.getId(),
                o.getAnuncioServico().getId(),
                o.getAnuncioServico().getTitulo(),
                o.getAnuncioServico().getUsuario().getId(),
                o.getCliente().getId(),
                o.getCliente().getNome(),
                o.getDescricaoProjeto(),
                o.getPrazoDias(),
                o.getValorEstimado(),
                o.getStatus());
    }
}
