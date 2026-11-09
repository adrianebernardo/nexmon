package com.nexmon.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Reserva de um anúncio (aluguel/empréstimo) em um período de datas.
 * Liga DOIS lados: o anúncio (que tem o dono/locador) e o usuário que reservou (locatário).
 */
@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "anuncio_id", nullable = false)
    private Anuncio anuncio;

    // Quem está pegando emprestado/alugando (o "renter").
    @ManyToOne
    @JoinColumn(name = "usuario_renter_id", nullable = false)
    private Usuario usuarioRenter;

    @Column(nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false)
    private LocalDate dataFim;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusReserva status = StatusReserva.PENDENTE;

    public Reserva() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Anuncio getAnuncio() { return anuncio; }
    public void setAnuncio(Anuncio anuncio) { this.anuncio = anuncio; }

    public Usuario getUsuarioRenter() { return usuarioRenter; }
    public void setUsuarioRenter(Usuario usuarioRenter) { this.usuarioRenter = usuarioRenter; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public StatusReserva getStatus() { return status; }
    public void setStatus(StatusReserva status) { this.status = status; }
}
