package com.nexmon.api.repository;

import com.nexmon.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * REPOSITORY = quem conversa com o banco. É uma INTERFACE (sem código):
 * o Spring escreve a implementação sozinho.
 * Ao estender JpaRepository<Usuario, Long> já ganhamos de graça:
 * save(), findById(), findAll(), deleteById(), existsById()...
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // O Spring entende pelo NOME do método: "existe usuário com este email?"
    boolean existsByEmail(String email);

    Optional<Usuario> findByEmail(String email);
}
