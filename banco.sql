-- ==========================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS NEXMON (MySQL)
-- ==========================================

-- Cria o banco de dados (se não existir) e seleciona ele
CREATE DATABASE IF NOT EXISTS nexmon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexmon_db;

-- 1. TABELA DE USUÁRIOS
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    url_avatar VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE ANÚNCIOS
CREATE TABLE anuncios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_proprietario INT NOT NULL,
    titulo VARCHAR(80) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    modalidade VARCHAR(20) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(60) NOT NULL,
    min_dias INT DEFAULT 1,
    max_dias INT DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario_proprietario) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_preco CHECK (preco >= 0),
    CONSTRAINT chk_dias CHECK (max_dias >= min_dias)
);

-- 3. TABELA DE FOTOS DOS ANÚNCIOS
CREATE TABLE anuncio_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_anuncio INT NOT NULL,
    url_imagem VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 1,
    
    FOREIGN KEY (id_anuncio) REFERENCES anuncios(id) ON DELETE CASCADE
);

-- 4. TABELA DE DATAS BLOQUEADAS
CREATE TABLE datas_bloqueadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_anuncio INT NOT NULL,
    data_bloqueada DATE NOT NULL,
    
    FOREIGN KEY (id_anuncio) REFERENCES anuncios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_data_por_anuncio (id_anuncio, data_bloqueada)
);

-- 5. TABELA DE RESERVAS (SOLICITAÇÕES)
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_anuncio INT NOT NULL,
    id_usuario_locatario INT NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    valor_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_anuncio) REFERENCES anuncios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_locatario) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO'))
);

-- 6. TABELA DE SELOS (INSÍGNIAS)
CREATE TABLE selos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(150),
    url_icone VARCHAR(255)
);

-- 7. TABELA DE SELOS CONQUISTADOS
CREATE TABLE usuarios_selos (
    id_usuario INT NOT NULL,
    id_selo INT NOT NULL,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_usuario, id_selo),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_selo) REFERENCES selos(id) ON DELETE CASCADE
);

-- ==========================================
-- INSERTS INICIAIS (CATÁLOGO DE SELOS)
-- ==========================================
INSERT INTO selos (nome, descricao, url_icone) VALUES 
('Iniciante', 'Realizou a primeira venda ou aluguel.', 'assets/img/selos/iniciante.svg'),
('Mestre das Vendas', 'Concluiu 10 transações com sucesso.', 'assets/img/selos/mestre.svg'),
('Feedback 5 Estrelas', 'Recebeu 5 avaliações positivas seguidas.', 'assets/img/selos/estrela.svg'),
('Guilda Assídua', 'Acessou a plataforma por 30 dias seguidos.', 'assets/img/selos/assiduidade.svg');