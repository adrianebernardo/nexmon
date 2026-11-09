package com.nexmon.api.dto;

import com.nexmon.api.model.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO de ENTRADA: só os campos que o front pode enviar ao cadastrar.
 * Cidade e tipo de usuário são opcionais (o tipo padrão é COMPRADOR).
 * As anotações (@NotBlank etc.) são as validações: se falharem, a API devolve 400.
 */
public record UsuarioRequest(
        @NotBlank(message = "Nome é obrigatório") @Size(min = 3, max = 60, message = "Nome deve ter entre 3 e 60 caracteres") String nome,
        @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "Senha é obrigatória") @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres") String senha,
        String cidade,
        TipoUsuario tipoUsuario) {
}
