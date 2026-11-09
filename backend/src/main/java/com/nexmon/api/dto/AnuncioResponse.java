package com.nexmon.api.dto;

import com.nexmon.api.model.Anuncio;
import com.nexmon.api.model.Modalidade;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

/**
 * Anúncio como o front vai receber, já com dados do dono (sem e-mail/senha) e as fotos.
 * datasBloqueadas = datas bloqueadas pelo dono + datas já ocupadas por reservas pendentes/aprovadas.
 */
public record AnuncioResponse(
        Long id,
        String titulo,
        String descricao,
        BigDecimal preco,
        Modalidade modalidade,
        String categoria,
        Boolean ativo,
        Long donoId,
        String donoNome,
        String estado,
        String cidade,
        Integer minDias,
        Integer maxDias,
        List<LocalDate> datasBloqueadas,
        List<String> fotos) {

    public static AnuncioResponse de(Anuncio a, Collection<LocalDate> datasIndisponiveis) {
        return new AnuncioResponse(
                a.getId(),
                a.getTitulo(),
                a.getDescricao(),
                a.getPreco(),
                a.getModalidade(),
                a.getCategoria(),
                a.getAtivo(),
                a.getUsuario().getId(),
                a.getUsuario().getNome(),
                a.getEstado(),
                a.getCidade(),
                a.getMinDias(),
                a.getMaxDias(),
                datasIndisponiveis.stream().sorted().toList(),
                List.copyOf(a.getFotos()));
    }
}
