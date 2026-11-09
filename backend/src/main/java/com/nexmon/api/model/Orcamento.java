package com.nexmon.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Pedido de orçamento para um anúncio do tipo SERVICO.
 * O cliente descreve o projeto; o prestador depois responde com valor e prazo.
 */
@Entity
@Table(name = "orcamento")
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O anúncio de serviço que está sendo orçado (o prestador é o dono dele).
    @ManyToOne
    @JoinColumn(name = "anuncio_servico_id", nullable = false)
    private Anuncio anuncioServico;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @Column(length = 2000, nullable = false)
    private String descricaoProjeto;

    private Integer prazoDias;

    // Fica vazio (null) até o prestador responder.
    @Column(precision = 10, scale = 2)
    private BigDecimal valorEstimado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOrcamento status = StatusOrcamento.SOLICITADO;

    public Orcamento() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Anuncio getAnuncioServico() { return anuncioServico; }
    public void setAnuncioServico(Anuncio anuncioServico) { this.anuncioServico = anuncioServico; }

    public Usuario getCliente() { return cliente; }
    public void setCliente(Usuario cliente) { this.cliente = cliente; }

    public String getDescricaoProjeto() { return descricaoProjeto; }
    public void setDescricaoProjeto(String descricaoProjeto) { this.descricaoProjeto = descricaoProjeto; }

    public Integer getPrazoDias() { return prazoDias; }
    public void setPrazoDias(Integer prazoDias) { this.prazoDias = prazoDias; }

    public BigDecimal getValorEstimado() { return valorEstimado; }
    public void setValorEstimado(BigDecimal valorEstimado) { this.valorEstimado = valorEstimado; }

    public StatusOrcamento getStatus() { return status; }
    public void setStatus(StatusOrcamento status) { this.status = status; }
}
