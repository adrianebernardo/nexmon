package com.nexmon.api.model;

import jakarta.persistence.*;

/**
 * ENTIDADE: cada objeto Usuario vira uma linha na tabela "usuario".
 */
@Entity                      // "esta classe é uma tabela"
@Table(name = "usuario")     // nome da tabela no banco
public class Usuario {

    @Id                                                  // chave primária
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // o banco gera 1, 2, 3...
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)             // não permite e-mail repetido
    private String email;

    // ATENÇÃO: por enquanto a senha é salva em texto puro (só para estudo).
    // Num site de verdade ela precisa ser criptografada (Spring Security + BCrypt).
    @Column(nullable = false)
    private String senha;

    private String cidade;

    @Enumerated(EnumType.STRING)  // grava o TEXTO "COSMAKER" e não um número
    @Column(nullable = false)
    private TipoUsuario tipoUsuario;

    // O JPA exige um construtor vazio.
    public Usuario() {
    }

    // Getters (pegar valor) e setters (colocar valor)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }
}
