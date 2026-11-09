package com.nexmon.api.dto;

import com.nexmon.api.model.StatusReserva;
import jakarta.validation.constraints.NotNull;

/** Resposta do dono do anúncio a uma solicitação: APROVADO ou RECUSADO. */
public record ReservaStatusRequest(
        @NotNull(message = "usuarioId é obrigatório") Long usuarioId,
        @NotNull(message = "status é obrigatório") StatusReserva status) {
}
