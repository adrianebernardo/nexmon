package com.nexmon.api.service;

import com.nexmon.api.dto.LoginRequest;
import com.nexmon.api.dto.UsuarioRequest;
import com.nexmon.api.dto.UsuarioResponse;
import com.nexmon.api.exception.ConflitoException;
import com.nexmon.api.exception.NaoAutorizadoException;
import com.nexmon.api.exception.RecursoNaoEncontradoException;
import com.nexmon.api.model.TipoUsuario;
import com.nexmon.api.model.Usuario;
import com.nexmon.api.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * SERVICE = onde ficam as REGRAS DE NEGÓCIO (o "cozinheiro").
 * O controller só recebe o pedido; quem decide se pode ou não é o service.
 */
@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    // Injeção de dependência: o Spring entrega o repository e o encoder prontos aqui.
    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse cadastrar(UsuarioRequest dados) {
        String email = dados.email().trim().toLowerCase();

        // REGRA: não pode haver dois usuários com o mesmo e-mail.
        if (repository.existsByEmail(email)) {
            throw new ConflitoException("Já existe um usuário com este e-mail");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dados.nome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(dados.senha()));   // grava só o hash BCrypt
        usuario.setCidade(dados.cidade() == null || dados.cidade().isBlank() ? null : dados.cidade().trim());
        usuario.setTipoUsuario(dados.tipoUsuario() != null ? dados.tipoUsuario() : TipoUsuario.COMPRADOR);

        Usuario salvo = repository.save(usuario);   // INSERT no banco
        return UsuarioResponse.de(salvo);
    }

    /** Confere e-mail e senha. A mensagem é a mesma nos dois erros (não revela qual falhou). */
    public UsuarioResponse autenticar(LoginRequest dados) {
        Usuario usuario = repository.findByEmail(dados.email().trim().toLowerCase())
                .orElseThrow(() -> new NaoAutorizadoException("E-mail ou senha inválidos"));
        if (!passwordEncoder.matches(dados.senha(), usuario.getSenha())) {
            throw new NaoAutorizadoException("E-mail ou senha inválidos");
        }
        return UsuarioResponse.de(usuario);
    }

    public UsuarioResponse buscarPorId(Long id) {
        return UsuarioResponse.de(buscarEntidade(id));
    }

    // Usado pelos OUTROS services quando precisam do objeto Usuario de verdade.
    public Usuario buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: id " + id));
    }
}
