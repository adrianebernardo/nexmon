# Nexmon — Backend (Java Spring Boot + MySQL)

API REST da Nexmon. Guarda tudo no **MySQL** (`nexmon_db`) e também serve o site da pasta `frontend/`.

## Como rodar

1. Tenha **Java 21**, **Maven** e o **MySQL** ligado.
2. Copie `.env.example` para `.env` (ao lado do `pom.xml`) e coloque seu usuário/senha do MySQL.
3. Dentro de `backend/`, rode:

```bash
mvn spring-boot:run
```

   (ou rode a classe `ApiApplication` no VS Code, com a pasta `backend` aberta).
4. Abra **http://localhost:8080**: o site e a API ficam no mesmo endereço.

O banco `nexmon_db` e as tabelas são criados sozinhos na primeira vez. Se preferir criar na mão, use `../database/schema-mysql.sql`.

### Sem MySQL (demonstração)

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

Usa H2 em memória com dados de exemplo (`dados-demo.sql`). Usuários `ana@email.com`, `bruno@email.com`, `carla@email.com`, `diego@email.com`, senha `12345678`.

## Como o pedido anda

```text
Front -> Controller -> Service -> Repository -> Banco
         (porta)       (regras)    (acesso)
```

| Pasta | O que tem |
|---|---|
| `model` | Entidades (viram tabelas) e enums |
| `dto` | Formatos de entrada e saída do JSON (a senha nunca sai) |
| `repository` | Interfaces que falam com o banco |
| `service` | Regras de negócio |
| `controller` | Endpoints HTTP |
| `exception` | Transforma erros em 400, 401, 404 e 409 |
| `config` | CORS, BCrypt e hospedagem do `frontend/` |

## Endpoints

| Método | Endereço | O que faz |
|---|---|---|
| POST | /api/usuarios | Cadastra usuário (nome, email, senha) |
| POST | /api/auth/login | Login (401 se e-mail/senha errados) |
| GET | /api/usuarios/{id} | Perfil do usuário |
| POST | /api/anuncios | Cria anúncio |
| GET | /api/anuncios?cidade=&modalidade= | Lista anúncios (filtros opcionais) |
| GET | /api/anuncios/{id} | Detalhes (com datas indisponíveis) |
| POST | /api/reservas | Solicita reserva/compra/serviço |
| PATCH | /api/reservas/{id}/status | Dono aprova (APROVADO) ou recusa (RECUSADO) |
| GET | /api/reservas/usuario/{id} | Solicitações feitas e recebidas |
| POST | /api/orcamentos | Pede orçamento de serviço |
| GET | /api/selos/usuario/{id} | Selos do perfil |

## Regras de negócio

- E-mail não pode repetir (409). Senha de 8 a 72 caracteres, salva com BCrypt.
- Anúncio de VENDA ou ALUGUEL precisa de preço. Período mínimo/máximo em dias e datas bloqueadas pelo dono.
- Não pode reservar o próprio anúncio nem anúncio inativo.
- ALUGUEL/EMPRESTIMO: datas obrigatórias, início não pode ser no passado, respeitar mínimo/máximo de dias, datas bloqueadas e reservas PENDENTE/APROVADO (409). Valor = preço por dia x dias.
- VENDA/SERVICO: sem datas; valor = preço.
- Só o dono do anúncio responde a solicitação, e só uma vez (PENDENTE -> APROVADO ou RECUSADO).
- Orçamento só para anúncios de SERVICO, e não ao próprio serviço.
- Selos automáticos: Primeiro Anúncio, Primeira Reserva Recebida, Primeiro Orçamento Recebido.

## Testar

Instale a extensão **REST Client** e abra `requests/api.http`.

## Limitações conhecidas

- O login devolve o usuário, mas não há token: as chamadas mandam o `usuarioId` no corpo (qualquer cliente pode se passar por outro). Próximo passo: JWT / Spring Security.
- Fotos: o front mostra a prévia, mas ainda não envia arquivos (a API aceita só links em `fotos`).
- Responder orçamento (`valorEstimado`) ainda não tem endpoint.
