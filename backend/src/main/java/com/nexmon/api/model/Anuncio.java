package com.nexmon.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Anúncio de venda, aluguel, empréstimo ou serviço.
 * Cada anúncio pertence a UM usuário (o dono).
 */
@Entity
@Table(name = "anuncio")
public class Anuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    // BigDecimal é o tipo certo para dinheiro (double erra nas casas decimais).
    // Em ALUGUEL, este valor é o preço POR DIA.
    @Column(precision = 10, scale = 2)
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Modalidade modalidade;

    private String categoria;

    // Localização do anúncio (UF + cidade escolhidas ao anunciar).
    @Column(nullable = false, length = 2)
    private String estado;

    @Column(nullable = false, length = 60)
    private String cidade;

    // Período mínimo e máximo de aluguel/empréstimo, em dias.
    @Column(nullable = false)
    private Integer minDias = 1;

    @Column(nullable = false)
    private Integer maxDias = 30;

    // Datas que o anunciante bloqueou no calendário. Set (e não List) porque o JPA
    // não consegue carregar duas listas EAGER ao mesmo tempo.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anuncio_data_bloqueada", joinColumns = @JoinColumn(name = "anuncio_id"))
    @Column(name = "data_bloqueada")
    private Set<LocalDate> datasBloqueadas = new LinkedHashSet<>();

    // RELACIONAMENTO: muitos anúncios -> um usuário.
    // O banco cria a coluna "usuario_id" com o id do dono.
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Anúncio desativado some da listagem (em vez de ser apagado).
    private Boolean ativo = true;

    // Lista de links das fotos. O JPA cria uma tabelinha "anuncio_foto"
    // (anuncio_id + url). EAGER = carrega as fotos junto com o anúncio.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anuncio_foto", joinColumns = @JoinColumn(name = "anuncio_id"))
    @Column(name = "url", length = 500)
    private List<String> fotos = new ArrayList<>();

    public Anuncio() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public Modalidade getModalidade() { return modalidade; }
    public void setModalidade(Modalidade modalidade) { this.modalidade = modalidade; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public Integer getMinDias() { return minDias; }
    public void setMinDias(Integer minDias) { this.minDias = minDias; }

    public Integer getMaxDias() { return maxDias; }
    public void setMaxDias(Integer maxDias) { this.maxDias = maxDias; }

    public Set<LocalDate> getDatasBloqueadas() { return datasBloqueadas; }
    public void setDatasBloqueadas(Set<LocalDate> datasBloqueadas) { this.datasBloqueadas = datasBloqueadas; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public List<String> getFotos() { return fotos; }
    public void setFotos(List<String> fotos) { this.fotos = fotos; }
}
