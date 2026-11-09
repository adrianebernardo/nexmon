package com.nexmon.api.dto;

import com.nexmon.api.model.Modalidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Dados para criar um anúncio.
 * usuarioId = id do dono. (Quando houver token de login, esse id virá do usuário logado.)
 */
public record AnuncioRequest(
        @NotBlank(message = "Título é obrigatório") @Size(max = 80, message = "Título deve ter no máximo 80 caracteres") String titulo,
        @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres") String descricao,
        @PositiveOrZero(message = "Preço não pode ser negativo") BigDecimal preco,
        @NotNull(message = "Modalidade é obrigatória") Modalidade modalidade,
        @NotBlank(message = "Categoria é obrigatória") String categoria,
        @NotBlank(message = "Estado é obrigatório") @Size(min = 2, max = 2, message = "Estado deve ter 2 letras (UF)") String estado,
        @NotBlank(message = "Cidade é obrigatória") @Size(max = 60, message = "Cidade deve ter no máximo 60 caracteres") String cidade,
        @NotNull(message = "usuarioId é obrigatório") Long usuarioId,
        @Positive(message = "minDias deve ser maior que zero") Integer minDias,
        @Positive(message = "maxDias deve ser maior que zero") Integer maxDias,
        List<LocalDate> datasBloqueadas,
        List<String> fotos) {
}
