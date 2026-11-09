# NEXMON

Marketplace e comunidade geek: aluguel, venda, empréstimo e serviços, para todo o Brasil.

## Estrutura

```text
nexmon/
├── frontend/    # HTML, CSS e JS puro
├── backend/     # API REST em Java Spring Boot (MySQL)
├── database/    # Script MySQL opcional (schema-mysql.sql)
└── docs/        # Documentação e histórico do projeto
```

## Como rodar

1. Ligue o **MySQL** e copie `backend/.env.example` para `backend/.env` com seu usuário e senha.
2. Em `backend/`, rode `mvn spring-boot:run` (precisa de Java 21 e Maven).
3. Abra **http://localhost:8080**: o Spring serve o `frontend/` e a API (`/api`) no mesmo endereço.

Sem MySQL, para testar: `mvn spring-boot:run -Dspring-boot.run.profiles=h2` (dados de exemplo; senha `12345678`).
Detalhes, endpoints e regras em `backend/README.md`.

## Como as partes se ligam

```text
frontend (HTML/JS)  --fetch /api-->  backend (Spring Boot)  --JPA-->  MySQL (nexmon_db)
```

O `frontend/assets/js/api.js` é a única camada que fala com a API. Se abrir o front por Live Server (porta diferente), ele chama `http://localhost:8080/api`.

## Status

- Frontend, API e banco ligados: cadastro/login, anúncios, reservas/compras/serviços, aprovação, selos.
- Próximos passos: token de login (JWT), upload de fotos, resposta de orçamento.

## Pontos de atenção

- Sem token: as chamadas mandam o `usuarioId` (veja `backend/README.md`).
- A integração foi escrita e conferida só por leitura/testes do JS: rode `mvn spring-boot:run` e teste os fluxos antes de entregar.
- `frontend/assets/img/banner-nexmon.webp` não é usado em nenhuma página.

## Autores

Adriane Bernardo e Matheus Eufrazio.
