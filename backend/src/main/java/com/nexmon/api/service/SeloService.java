package com.nexmon.api.service;

import com.nexmon.api.dto.SeloResponse;
import com.nexmon.api.model.Selo;
import com.nexmon.api.model.Usuario;
import com.nexmon.api.repository.SeloRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/** Regras de concessão e consulta de selos (badges). */
@Service
public class SeloService {

    // Nomes dos selos num lugar só (para não errar a digitação em vários arquivos).
    public static final String PRIMEIRO_ANUNCIO = "Primeiro Anúncio";
    public static final String PRIMEIRA_RESERVA = "Primeira Reserva Recebida";
    public static final String PRIMEIRO_ORCAMENTO = "Primeiro Orçamento Recebido";

    private final SeloRepository repository;
    private final UsuarioService usuarioService;

    public SeloService(SeloRepository repository, UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    /** Dá o selo ao usuário, MAS só se ele ainda não tiver esse mesmo selo. */
    public void conceder(Usuario usuario, String nomeBadge, String descricao) {
        if (repository.existsByUsuarioIdAndNomeBadge(usuario.getId(), nomeBadge)) {
            return;   // já tem, não faz nada
        }
        Selo selo = new Selo();
        selo.setUsuario(usuario);
        selo.setNomeBadge(nomeBadge);
        selo.setDescricao(descricao);
        selo.setDataConcessao(LocalDateTime.now());
        repository.save(selo);
    }

    public List<SeloResponse> listarPorUsuario(Long usuarioId) {
        usuarioService.buscarEntidade(usuarioId);   // garante 404 se o usuário não existe
        return repository.findByUsuarioIdOrderByDataConcessaoDesc(usuarioId)
                .stream()
                .map(SeloResponse::de)   // converte cada Selo em SeloResponse
                .toList();
    }
}
