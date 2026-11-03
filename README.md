# NEXMON — Documentação e Continuidade do Projeto

**Versão:** 2.0  
**Data:** 03/11/2026  
**Tipo:** Marketplace geek  
**Escopo atual:** Frontend Concluído (Aguardando Backend)  
**Backend e banco de dados:** Integração futura

---

## 1. Visão geral

A **Nexmon** é uma plataforma de marketplace e comunidade geek, destinada a conectar pessoas interessadas em comprar, vender, alugar, emprestar e contratar serviços relacionados ao universo geek.

A plataforma atende usuários de **todo o Brasil**, permitindo que anunciantes divulguem seus produtos e serviços e que interessados encontrem oportunidades em diferentes cidades e estados.

### Modalidades

- Aluguel;
- Venda;
- Empréstimo;
- Serviços.

---

## 2. Escopo atual e regras de desenvolvimento

O trabalho no **frontend** foi concluído para as etapas planejadas. O objetivo foi construir as interfaces, organizar os fluxos de navegação e preparar a estrutura para receber posteriormente a integração com backend e banco de dados.

### Restrições mantidas

- Não modificar o backend (não existe ainda).
- Não modificar o banco de dados (não existe ainda).
- Não implementar persistência simulando que os dados estão salvos de forma definitiva (usamos `localStorage` apenas para o modo demonstração).
- Preparar as interfaces para futuras integrações (campos e contratos de dados já preparados).
- Preservar a estrutura, identidade visual e funcionalidades existentes.
- Não inserir produtos fictícios no catálogo.
- Abrangência nacional implementada.
- Interfaces responsivas.

---

## 3. Estrutura conhecida do projeto

A estrutura atual registrada no projeto é:

```text
nexmon/
├── index.html
├── pages/
│   ├── login.html
│   ├── anuncio-detalhes.html
│   ├── novo-anuncio.html
│   ├── perfil.html
│   └── solicitacoes.html
└── assets/
    ├── css/
    │   └── style.css
    ├── data/
    │   └── estados-cidades.json   <-- NOVO (Base IBGE)
    ├── fonts/
    ├── img/
    │   ├── NEXMONICON.svg
    │   └── favicon.svg
    └── js/
        ├── api.js
        ├── components.js
        ├── session.js
        ├── utils.js
        └── pages/
            ├── detalhes.js
            ├── home.js
            ├── login.js
            ├── novo-anuncio.js
            ├── perfil.js
            └── solicitacoes.js