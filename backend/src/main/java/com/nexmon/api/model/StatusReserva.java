package com.nexmon.api.model;

import java.util.List;

/** Ciclo de vida de uma reserva / solicitação. */
public enum StatusReserva {
    PENDENTE,    // acabou de ser pedida
    APROVADO,    // o dono aceitou
    RECUSADO,    // o dono recusou (libera as datas)
    CONCLUIDA,   // já aconteceu
    CANCELADA;   // não vale mais (libera as datas)

    /** Só reservas PENDENTES e APROVADAS "seguram" as datas do anúncio. */
    public static final List<StatusReserva> BLOQUEIAM = List.of(PENDENTE, APROVADO);
}
