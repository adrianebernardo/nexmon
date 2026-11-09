package com.nexmon.api.service;

import com.nexmon.api.dto.AnuncioRequest;
import com.nexmon.api.dto.AnuncioResponse;
import com.nexmon.api.exception.RecursoNaoEncontradoException;
import com.nexmon.api.exception.RegraNegocioException;
import com.nexmon.api.model.Anuncio;
import com.nexmon.api.model.Modalidade;
import com.nexmon.api.model.Reserva;
import com.nexmon.api.model.StatusReserva;
import com.nexmon.api.model.Usuario;
import com.nexmon.api.repository.AnuncioRepository;
import com.nexmon.api.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
public class AnuncioService {

    private final AnuncioRepository repository;
    private final ReservaRepository reservaRepository;
    private final UsuarioService usuarioService;
    private final SeloService seloService;

    public AnuncioService(AnuncioRepository repository, ReservaRepository reservaRepository,
                          UsuarioService usuarioService, SeloService seloService) {
        this.repository = repository;
        this.reservaRepository = reservaRepository;
        this.usuarioService = usuarioService;
        this.seloService = seloService;
    }

    // @Transactional = "tudo ou nada": se algo falhar no meio (ex.: ao dar o selo),
    // o anúncio também NÃO é salvo.
    @Transactional
    public AnuncioResponse criar(AnuncioRequest dados) {
        Usuario dono = usuarioService.buscarEntidade(dados.usuarioId());

        // REGRA: venda e aluguel precisam de preço. Empréstimo e serviço podem não ter.
        boolean exigePreco = dados.modalidade() == Modalidade.VENDA
                || dados.modalidade() == Modalidade.ALUGUEL;
        if (exigePreco && dados.preco() == null) {
            throw new RegraNegocioException("Anúncios de venda e aluguel precisam de preço");
        }

        int minDias = dados.minDias() != null ? dados.minDias() : 1;
        int maxDias = dados.maxDias() != null ? dados.maxDias() : 30;
        if (maxDias < minDias) {
            throw new RegraNegocioException("O período máximo não pode ser menor que o mínimo");
        }

        Anuncio anuncio = new Anuncio();
        anuncio.setTitulo(dados.titulo().trim());
        anuncio.setDescricao(dados.descricao());
        anuncio.setPreco(dados.preco());
        anuncio.setModalidade(dados.modalidade());
        anuncio.setCategoria(dados.categoria().trim());
        anuncio.setEstado(dados.estado().trim().toUpperCase());
        anuncio.setCidade(dados.cidade().trim());
        anuncio.setMinDias(minDias);
        anuncio.setMaxDias(maxDias);
        anuncio.setUsuario(dono);
        anuncio.setAtivo(true);
        if (dados.datasBloqueadas() != null) {
            anuncio.setDatasBloqueadas(new LinkedHashSet<>(dados.datasBloqueadas()));
        }
        if (dados.fotos() != null) {
            anuncio.setFotos(new ArrayList<>(dados.fotos()));
        }

        Anuncio salvo = repository.save(anuncio);

        // CONCESSÃO DE SELO: o primeiro anúncio do usuário rende um selo.
        seloService.conceder(dono, SeloService.PRIMEIRO_ANUNCIO,
                "Publicou o primeiro anúncio na Nexmon");

        return montarResposta(salvo);
    }

    /** Lista anúncios ativos (mais novos primeiro). Os dois filtros são OPCIONAIS (podem ser null). */
    @Transactional(readOnly = true)
    public List<AnuncioResponse> listar(String cidade, Modalidade modalidade) {
        boolean temCidade = cidade != null && !cidade.isBlank();

        List<Anuncio> anuncios;
        if (temCidade && modalidade != null) {
            anuncios = repository.findByAtivoTrueAndCidadeIgnoreCaseAndModalidadeOrderByIdDesc(cidade.trim(), modalidade);
        } else if (temCidade) {
            anuncios = repository.findByAtivoTrueAndCidadeIgnoreCaseOrderByIdDesc(cidade.trim());
        } else if (modalidade != null) {
            anuncios = repository.findByAtivoTrueAndModalidadeOrderByIdDesc(modalidade);
        } else {
            anuncios = repository.findByAtivoTrueOrderByIdDesc();
        }

        return anuncios.stream().map(this::montarResposta).toList();
    }

    /** Funcionalidade âncora: detalhes + fotos de UM anúncio (só se estiver ativo). */
    @Transactional(readOnly = true)
    public AnuncioResponse buscarPorId(Long id) {
        Anuncio anuncio = buscarEntidade(id);
        if (!Boolean.TRUE.equals(anuncio.getAtivo())) {
            throw new RecursoNaoEncontradoException("Anúncio não encontrado: id " + id);
        }
        return montarResposta(anuncio);
    }

    public Anuncio buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Anúncio não encontrado: id " + id));
    }

    /**
     * Monta o JSON do anúncio. Em aluguel/empréstimo, as datas indisponíveis são as bloqueadas
     * pelo dono MAIS os dias de reservas pendentes/aprovadas (para o calendário do front).
     */
    private AnuncioResponse montarResposta(Anuncio anuncio) {
        Set<LocalDate> indisponiveis = new TreeSet<>(anuncio.getDatasBloqueadas());

        boolean usaDatas = anuncio.getModalidade() == Modalidade.ALUGUEL
                || anuncio.getModalidade() == Modalidade.EMPRESTIMO;
        if (usaDatas) {
            List<Reserva> reservas = reservaRepository
                    .findByAnuncioIdAndStatusIn(anuncio.getId(), StatusReserva.BLOQUEIAM);
            for (Reserva r : reservas) {
                for (LocalDate d = r.getDataInicio(); !d.isAfter(r.getDataFim()); d = d.plusDays(1)) {
                    indisponiveis.add(d);
                }
            }
        }
        return AnuncioResponse.de(anuncio, indisponiveis);
    }
}
