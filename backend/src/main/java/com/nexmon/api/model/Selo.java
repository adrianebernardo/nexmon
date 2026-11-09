package com.nexmon.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Selo (badge) conquistado por um usuário. Ex.: "Primeiro Anúncio". */
@Entity
@Table(name = "selo")
public class Selo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeBadge;

    private String descricao;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // LocalDateTime = data + hora. O SeloService preenche na hora da concessão.
    private LocalDateTime dataConcessao;

    public Selo() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeBadge() { return nomeBadge; }
    public void setNomeBadge(String nomeBadge) { this.nomeBadge = nomeBadge; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDateTime getDataConcessao() { return dataConcessao; }
    public void setDataConcessao(LocalDateTime dataConcessao) { this.dataConcessao = dataConcessao; }
}
