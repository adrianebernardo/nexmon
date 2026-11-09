package com.nexmon.api.service;

import com.nexmon.api.dto.ReservaRequest;
import com.nexmon.api.dto.ReservaResponse;
import com.nexmon.api.dto.ReservaStatusRequest;
import com.nexmon.api.exception.ConflitoException;
import com.nexmon.api.exception.RecursoNaoEncontradoException;
import com.nexmon.api.exception.RegraNegocioException;
import com.nexmon.api.model.Anuncio;
import com.nexmon.api.model.Modalidade;
import com.nexmon.api.model.Reserva;
import com.nexmon.api.model.StatusReserva;
import com.nexmon.api.model.Usuario;
import com.nexmon.api.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReservaService {

    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ReservaRepository repository;
    private final AnuncioService anuncioService;
    private final UsuarioService usuarioService;
    private final SeloService seloService;

    public ReservaService(ReservaRepository repository, AnuncioService anuncioService,
                          UsuarioService usuarioService, SeloService seloService) {
        this.repository = repository;
        this.anuncioService = anuncioService;
        this.usuarioService = usuarioService;
        this.seloService = seloService;
    }

    @Transactional
    public ReservaResponse criar(ReservaRequest dados) {
        Anuncio anuncio = anuncioService.buscarEntidade(dados.anuncioId());
        Usuario solicitante = usuarioService.buscarEntidade(dados.usuarioId());

        // ---------- REGRAS DE NEGÓCIO (cada if é uma regra) ----------

        if (!Boolean.TRUE.equals(anuncio.getAtivo())) {
            throw new RegraNegocioException("Este anúncio não está ativo");
        }
        if (anuncio.getUsuario().getId().equals(solicitante.getId())) {
            throw new RegraNegocioException("Você não pode reservar o seu próprio anúncio");
        }

        boolean usaDatas = anuncio.getModalidade() == Modalidade.ALUGUEL
                || anuncio.getModalidade() == Modalidade.EMPRESTIMO;

        LocalDate inicio;
        LocalDate fim;
        BigDecimal valorTotal;
        BigDecimal preco = anuncio.getPreco() != null ? anuncio.getPreco() : BigDecimal.ZERO;

        if (usaDatas) {
            if (dados.dataInicio() == null || dados.dataFim() == null) {
                throw new RegraNegocioException("Informe as datas de início e fim");
            }
            inicio = dados.dataInicio();
            fim = dados.dataFim();

            if (fim.isBefore(inicio)) {
                throw new RegraNegocioException("A data final não pode ser antes da data inicial");
            }
            if (inicio.isBefore(LocalDate.now())) {
                throw new RegraNegocioException("A data inicial não pode estar no passado");
            }

            // +1 porque o dia inicial e o final contam (de 10 a 12 = 3 dias).
            long dias = ChronoUnit.DAYS.between(inicio, fim) + 1;
            if (dias < anuncio.getMinDias()) {
                throw new RegraNegocioException("O período mínimo é de " + anuncio.getMinDias() + " dia(s)");
            }
            if (dias > anuncio.getMaxDias()) {
                throw new RegraNegocioException("O período máximo é de " + anuncio.getMaxDias() + " dias");
            }

            // Datas que o dono bloqueou no calendário.
            for (LocalDate d = inicio; !d.isAfter(fim); d = d.plusDays(1)) {
                if (anuncio.getDatasBloqueadas().contains(d)) {
                    throw new ConflitoException("A data " + d.format(DATA_BR) + " está bloqueada pelo anunciante");
                }
            }

            // VALIDAÇÃO DE DISPONIBILIDADE: já existe reserva batendo com essas datas?
            long conflitos = repository.contarConflitos(
                    anuncio.getId(), inicio, fim, StatusReserva.BLOQUEIAM);
            if (conflitos > 0) {
                throw new ConflitoException("Este anúncio já está reservado em parte desse período");
            }

            valorTotal = preco.multiply(BigDecimal.valueOf(dias));   // preço por dia x dias
        } else {
            // Venda e serviço não têm período: vale o dia do pedido e o preço fechado.
            inicio = LocalDate.now();
            fim = inicio;
            valorTotal = preco;
        }

        Reserva reserva = new Reserva();
        reserva.setAnuncio(anuncio);
        reserva.setUsuarioRenter(solicitante);
        reserva.setDataInicio(inicio);
        reserva.setDataFim(fim);
        reserva.setValorTotal(valorTotal);
        reserva.setStatus(StatusReserva.PENDENTE);

        Reserva salva = repository.save(reserva);

        // Selo para o DONO do anúncio ao receber a primeira reserva.
        seloService.conceder(anuncio.getUsuario(), SeloService.PRIMEIRA_RESERVA,
                "Recebeu a primeira reserva na Nexmon");

        return ReservaResponse.de(salva);
    }

    /** O dono do anúncio aprova ou recusa uma solicitação PENDENTE. */
    @Transactional
    public ReservaResponse atualizarStatus(Long id, ReservaStatusRequest dados) {
        Reserva reserva = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Solicitação não encontrada: id " + id));

        if (!reserva.getAnuncio().getUsuario().getId().equals(dados.usuarioId())) {
            throw new RegraNegocioException("Você não pode alterar esta solicitação");
        }
        if (dados.status() != StatusReserva.APROVADO && dados.status() != StatusReserva.RECUSADO) {
            throw new RegraNegocioException("Status inválido: use APROVADO ou RECUSADO");
        }
        if (reserva.getStatus() != StatusReserva.PENDENTE) {
            throw new RegraNegocioException("Esta solicitação já foi respondida");
        }

        reserva.setStatus(dados.status());
        return ReservaResponse.de(repository.save(reserva));
    }

    /** Reservas em que o usuário é locatário (pediu) OU locador (dono do anúncio). */
    @Transactional(readOnly = true)
    public List<ReservaResponse> listarPorUsuario(Long usuarioId) {
        usuarioService.buscarEntidade(usuarioId);   // 404 se o usuário não existir

        // Map por id para não repetir uma reserva que apareça nas duas listas.
        Map<Long, Reserva> unicas = new LinkedHashMap<>();
        for (Reserva r : repository.findByUsuarioRenterId(usuarioId)) {
            unicas.put(r.getId(), r);
        }
        for (Reserva r : repository.findByAnuncioUsuarioId(usuarioId)) {
            unicas.put(r.getId(), r);
        }

        return unicas.values().stream()
                .sorted(Comparator.comparing(Reserva::getId).reversed())   // mais novas primeiro
                .map(ReservaResponse::de)
                .toList();
    }
}
