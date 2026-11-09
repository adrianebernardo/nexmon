package com.nexmon.api.dto;

import com.nexmon.api.model.Reserva;
import com.nexmon.api.model.StatusReserva;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReservaResponse(
        Long id,
        Long anuncioId,
        String anuncioTitulo,
        Long locatarioId,
        String locatarioNome,
        Long locadorId,
        String locadorNome,
        LocalDate dataInicio,
        LocalDate dataFim,
        BigDecimal valorTotal,
        StatusReserva status) {

    public static ReservaResponse de(Reserva r) {
        return new ReservaResponse(
                r.getId(),
                r.getAnuncio().getId(),
                r.getAnuncio().getTitulo(),
                r.getUsuarioRenter().getId(),
                r.getUsuarioRenter().getNome(),
                r.getAnuncio().getUsuario().getId(),
                r.getAnuncio().getUsuario().getNome(),
                r.getDataInicio(),
                r.getDataFim(),
                r.getValorTotal(),
                r.getStatus());
    }
}
