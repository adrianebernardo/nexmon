package com.nexmon.api.service;

import com.nexmon.api.dto.OrcamentoRequest;
import com.nexmon.api.dto.OrcamentoResponse;
import com.nexmon.api.exception.RegraNegocioException;
import com.nexmon.api.model.Anuncio;
import com.nexmon.api.model.Modalidade;
import com.nexmon.api.model.Orcamento;
import com.nexmon.api.model.StatusOrcamento;
import com.nexmon.api.model.Usuario;
import com.nexmon.api.repository.OrcamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrcamentoService {

    private final OrcamentoRepository repository;
    private final AnuncioService anuncioService;
    private final UsuarioService usuarioService;
    private final SeloService seloService;

    public OrcamentoService(OrcamentoRepository repository, AnuncioService anuncioService,
                            UsuarioService usuarioService, SeloService seloService) {
        this.repository = repository;
        this.anuncioService = anuncioService;
        this.usuarioService = usuarioService;
        this.seloService = seloService;
    }

    @Transactional
    public OrcamentoResponse criar(OrcamentoRequest dados) {
        Anuncio anuncio = anuncioService.buscarEntidade(dados.anuncioId());
        Usuario cliente = usuarioService.buscarEntidade(dados.clienteId());

        // REGRAS
        if (anuncio.getModalidade() != Modalidade.SERVICO) {
            throw new RegraNegocioException("Só é possível pedir orçamento para anúncios de serviço");
        }
        if (anuncio.getUsuario().getId().equals(cliente.getId())) {
            throw new RegraNegocioException("Você não pode pedir orçamento ao seu próprio serviço");
        }

        Orcamento orcamento = new Orcamento();
        orcamento.setAnuncioServico(anuncio);
        orcamento.setCliente(cliente);
        orcamento.setDescricaoProjeto(dados.descricaoProjeto().trim());
        orcamento.setPrazoDias(dados.prazoDias());
        orcamento.setStatus(StatusOrcamento.SOLICITADO);
        // valorEstimado fica vazio: o prestador responde depois.

        Orcamento salvo = repository.save(orcamento);

        seloService.conceder(anuncio.getUsuario(), SeloService.PRIMEIRO_ORCAMENTO,
                "Recebeu o primeiro pedido de orçamento na Nexmon");

        return OrcamentoResponse.de(salvo);
    }
}
