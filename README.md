
# NEXMON — Marketplace e Comunidade Geek

Marketplace e comunidade geek para aluguel, venda, empréstimo e contratação de serviços relacionados ao universo geek, com abrangência em todo o Brasil.

**Autores:** Adriane Bernardo e Matheus Eufrazio.

---

## 1. Visão geral

A Nexmon é uma plataforma que conecta pessoas interessadas em comprar, vender, alugar, emprestar e contratar serviços relacionados ao universo geek.

### Modalidades

- Aluguel;
- Venda;
- Empréstimo;
- Serviços.

A plataforma permite que anunciantes divulguem seus produtos e serviços e que interessados encontrem oportunidades em diferentes cidades e estados brasileiros.

---

## 2. Tecnologias utilizadas

### Frontend
- HTML5;
- CSS3;
- JavaScript puro;
- LocalStorage para funcionalidades de demonstração;
- Integração com API REST.

### Backend
- Java 21;
- Spring Boot;
- Spring Data JPA;
- Maven;
- API REST.

### Banco de dados
- MySQL;
- H2 para ambiente de demonstração e testes.

---

## 3. Estrutura do projeto

```text
nexmon/
├── frontend/
│   ├── index.html
│   ├── pages/
│   │   ├── login.html
│   │   ├── anuncio-detalhes.html
│   │   ├── novo-anuncio.html
│   │   ├── perfil.html
│   │   └── solicitacoes.html
│   └── assets/
│       ├── css/
│       ├── data/
│       ├── fonts/
│       ├── img/
│       └── js/
│           ├── api.js
│           ├── components.js
│           ├── session.js
│           ├── utils.js
│           └── pages/
│
├── backend/
│   ├── pom.xml
│   ├── README.md
│   ├── requests/
│   └── src/
│       └── main/
│           ├── java/
│           └── resources/
│
├── database/
│   └── schema-mysql.sql
│
├── docs/
│   └── continuidade-frontend.md
│
├── .gitignore
└── README.md
```

---

## 4. Como as partes se comunicam

```text
Frontend (HTML/CSS/JS)
        |
        | fetch /api
        v
Backend (Java + Spring Boot)
        |
        | Spring Data JPA
        v
Banco de dados (MySQL)
```

O arquivo `frontend/assets/js/api.js` centraliza as chamadas realizadas pelo frontend à API.

Quando o frontend é executado por um servidor separado, como o Live Server, ele utiliza o endereço:

```text
http://localhost:8080/api
```

Quando servido pelo próprio Spring Boot, frontend e API podem funcionar no mesmo endereço.

---

## 5. Como executar o projeto

### Pré-requisitos

- Java 21;
- Maven;
- MySQL (para utilização com o banco principal).

### Executar com MySQL

1. Configure as credenciais do banco no arquivo local `backend/.env`, conforme as orientações do `backend/README.md`.
2. Crie e configure o banco utilizando o script `database/schema-mysql.sql`, se necessário.
3. Acesse a pasta `backend/`.
4. Execute:

```bash
mvn spring-boot:run
```

5. Acesse:

```text
http://localhost:8080
```

### Executar com H2

Para testar sem utilizar o MySQL, execute na pasta `backend/`:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

O ambiente H2 utiliza dados de demonstração.

**Observação:** consulte `backend/README.md` para obter instruções detalhadas de configuração, execução e utilização da API.

---

## 6. Funcionalidades contempladas

- Cadastro e login de usuários;
- Perfil de usuário;
- Cadastro e gerenciamento de anúncios;
- Modalidades de aluguel, venda, empréstimo e serviços;
- Solicitações e reservas;
- Orçamentos;
- Aprovação de solicitações;
- Sistema de selos e reputação;
- Abrangência nacional;
- Interfaces responsivas.

---

## 7. Diretrizes de desenvolvimento

- Preservar a identidade visual e a estrutura do projeto.
- Manter a comunicação com a API centralizada em `api.js`.
- Não inserir produtos fictícios no catálogo.
- Não versionar credenciais, senhas ou arquivos `.env`.
- Não versionar arquivos de compilação ou dependências geradas.
- Manter a documentação atualizada conforme novas funcionalidades forem implementadas.

O LocalStorage pode ser utilizado em funcionalidades de demonstração, mas não deve ser tratado como substituto da persistência definitiva no banco de dados.

---

## 8. Pontos de atenção e próximos passos

- Implementar autenticação com token JWT.
- Implementar upload e armazenamento de imagens.
- Desenvolver e validar a resposta de orçamentos.
- Testar os fluxos completos de cadastro, login, anúncios e reservas.
- Validar a integração entre frontend, backend e MySQL antes da disponibilização do sistema.

A integração deve ser testada em ambiente local antes de qualquer implantação.

---

## 9. Documentação complementar

- `backend/README.md`: instruções técnicas do backend, configuração e endpoints.
- `database/schema-mysql.sql`: estrutura do banco de dados MySQL.
- `docs/continuidade-frontend.md`: documentação de continuidade do frontend.
- `backend/requests/api.http`: requisições para testes dos endpoints.
