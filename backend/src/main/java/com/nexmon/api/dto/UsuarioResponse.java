package com.nexmon.api.dto;

import com.nexmon.api.model.TipoUsuario;
import com.nexmon.api.model.Usuario;

/** DTO de SAÍDA: o que a API devolve. Repare: NÃO tem a senha. */
public record UsuarioResponse(Long id, String nome, String email, String cidade, TipoUsuario tipoUsuario) {

    // Converte a entidade (banco) neste DTO (JSON).
    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getCidade(), u.getTipoUsuario());
    }
}
