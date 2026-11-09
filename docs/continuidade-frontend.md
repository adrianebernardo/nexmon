# NEXMON — Continuidade do Frontend

> Documento histórico (03/11/2026). O frontend agora está ligado à API e ao MySQL; veja o `README.md` na raiz.

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

## 3. Estrutura do frontend

Tudo fica em `frontend/` (os caminhos relativos `../assets/...` continuam iguais):

```text
frontend/
├── index.html
├── pages/        (login, anuncio-detalhes, novo-anuncio, perfil, solicitacoes)
└── assets/       (css, data, fonts, img, js, js/pages)
```
