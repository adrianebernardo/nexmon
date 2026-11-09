package com.nexmon.api.dto;

import com.nexmon.api.model.Selo;

import java.time.LocalDateTime;

public record SeloResponse(Long id, String nomeBadge, String descricao, LocalDateTime dataConcessao) {

    public static SeloResponse de(Selo s) {
        return new SeloResponse(s.getId(), s.getNomeBadge(), s.getDescricao(), s.getDataConcessao());
    }
}
