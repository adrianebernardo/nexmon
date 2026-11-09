-- ==========================================================
-- NEXMON — esquema MySQL (espelho das entidades JPA do backend)
--
-- OPCIONAL: com o MySQL ligado, o backend cria/atualiza estas tabelas sozinho
-- (spring.jpa.hibernate.ddl-auto=update). Use este script se preferir criar o
-- banco na mão, ou para conferir a estrutura.
-- ==========================================================

CREATE DATABASE IF NOT EXISTS nexmon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexmon_db;

CREATE TABLE IF NOT EXISTS usuario (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    senha         VARCHAR(255) NOT NULL,              -- hash BCrypt
    cidade        VARCHAR(255),
    tipo_usuario  VARCHAR(20)  NOT NULL               -- COSMAKER, ILUSTRADOR, COLECIONADOR, COMPRADOR
);

CREATE TABLE IF NOT EXISTS anuncio (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo      VARCHAR(255)  NOT NULL,
    descricao   VARCHAR(2000),
    preco       DECIMAL(10,2),
    modalidade  VARCHAR(20)   NOT NULL,               -- VENDA, ALUGUEL, EMPRESTIMO, SERVICO
    categoria   VARCHAR(255),
    estado      VARCHAR(2)    NOT NULL,
    cidade      VARCHAR(60)   NOT NULL,
    min_dias    INT           NOT NULL DEFAULT 1,
    max_dias    INT           NOT NULL DEFAULT 30,
    ativo       BOOLEAN,
    usuario_id  BIGINT        NOT NULL,
    CONSTRAINT fk_anuncio_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS anuncio_foto (
    anuncio_id  BIGINT NOT NULL,
    url         VARCHAR(500),
    CONSTRAINT fk_foto_anuncio FOREIGN KEY (anuncio_id) REFERENCES anuncio(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anuncio_data_bloqueada (
    anuncio_id      BIGINT NOT NULL,
    data_bloqueada  DATE   NOT NULL,
    PRIMARY KEY (anuncio_id, data_bloqueada),
    CONSTRAINT fk_bloqueio_anuncio FOREIGN KEY (anuncio_id) REFERENCES anuncio(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reserva (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    anuncio_id         BIGINT        NOT NULL,
    usuario_renter_id  BIGINT        NOT NULL,        -- quem pediu a reserva
    data_inicio        DATE          NOT NULL,
    data_fim           DATE          NOT NULL,
    valor_total        DECIMAL(10,2),
    status             VARCHAR(20)   NOT NULL,        -- PENDENTE, APROVADO, RECUSADO, CONCLUIDA, CANCELADA
    CONSTRAINT fk_reserva_anuncio FOREIGN KEY (anuncio_id) REFERENCES anuncio(id),
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_renter_id) REFERENCES usuario(id),
    CONSTRAINT chk_reserva_datas CHECK (data_fim >= data_inicio)
);

CREATE TABLE IF NOT EXISTS orcamento (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    anuncio_servico_id  BIGINT        NOT NULL,
    cliente_id          BIGINT        NOT NULL,
    descricao_projeto   VARCHAR(2000) NOT NULL,
    prazo_dias          INT,
    valor_estimado      DECIMAL(10,2),
    status              VARCHAR(20)   NOT NULL,       -- SOLICITADO, RESPONDIDO, ACEITO, REJEITADO
    CONSTRAINT fk_orcamento_anuncio FOREIGN KEY (anuncio_servico_id) REFERENCES anuncio(id),
    CONSTRAINT fk_orcamento_cliente FOREIGN KEY (cliente_id) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS selo (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome_badge      VARCHAR(255) NOT NULL,
    descricao       VARCHAR(255),
    usuario_id      BIGINT       NOT NULL,
    data_concessao  DATETIME(6),
    CONSTRAINT fk_selo_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
