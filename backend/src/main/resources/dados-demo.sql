-- ============================================================
-- DADOS DE DEMONSTRAÇÃO (só no perfil "h2").
-- Senha de todos os usuários: 12345678  (guardada como hash BCrypt)
-- ============================================================

-- USUÁRIOS (ids 1 a 4)
INSERT INTO usuario (nome, email, senha, cidade, tipo_usuario) VALUES
('Ana Souza',   'ana@email.com',   '$2a$10$/kANTALP6Ch9gRJbPvKGqOfOBDDp0KXqm6pkiNUj0VL5iimFbVl2W', 'Canoas',        'COSMAKER'),
('Bruno Lima',  'bruno@email.com', '$2a$10$/kANTALP6Ch9gRJbPvKGqOfOBDDp0KXqm6pkiNUj0VL5iimFbVl2W', 'Porto Alegre',  'ILUSTRADOR'),
('Carla Dias',  'carla@email.com', '$2a$10$/kANTALP6Ch9gRJbPvKGqOfOBDDp0KXqm6pkiNUj0VL5iimFbVl2W', 'Canoas',        'COLECIONADOR'),
('Diego Alves', 'diego@email.com', '$2a$10$/kANTALP6Ch9gRJbPvKGqOfOBDDp0KXqm6pkiNUj0VL5iimFbVl2W', 'Novo Hamburgo', 'COMPRADOR');

-- ANÚNCIOS (ids 1 a 4)
-- 1 = aluguel da Ana | 2 = serviço do Bruno | 3 = venda da Carla | 4 = empréstimo da Ana
INSERT INTO anuncio (titulo, descricao, preco, modalidade, categoria, estado, cidade, min_dias, max_dias, ativo, usuario_id) VALUES
('Armadura completa do Link (Zelda)', 'Armadura, peruca e acessórios. Tamanho M.', 80.00, 'ALUGUEL', 'PROPS_ARMADURAS', 'RS', 'Canoas', 1, 7, TRUE, 1),
('Ilustração personalizada de personagem', 'Arte digital do seu personagem original ou OC.', 150.00, 'SERVICO', 'ILUSTRACAO', 'RS', 'Porto Alegre', 1, 30, TRUE, 2),
('Action figure colecionável Goku', 'Edição limitada, na caixa, sem uso.', 350.00, 'VENDA', 'ACTION_FIGURES', 'RS', 'Canoas', 1, 30, TRUE, 3),
('Peruca azul para cosplay', 'Empréstimo para eventos, devolver limpa.', 0.00, 'EMPRESTIMO', 'PROPS_ARMADURAS', 'RS', 'Canoas', 1, 5, TRUE, 1);

-- DATAS BLOQUEADAS pelo dono (anúncio 1: amanhã+10 e +11)
INSERT INTO anuncio_data_bloqueada (anuncio_id, data_bloqueada) VALUES
(1, DATEADD('DAY', 10, CURRENT_DATE)),
(1, DATEADD('DAY', 11, CURRENT_DATE));

-- RESERVA de exemplo: Diego aluga o anúncio 1 de amanhã até +3 dias (4 dias x 80 = 320), já aprovada.
-- Serve para testar o erro de datas ocupadas.
INSERT INTO reserva (anuncio_id, usuario_renter_id, data_inicio, data_fim, valor_total, status) VALUES
(1, 4, DATEADD('DAY', 1, CURRENT_DATE), DATEADD('DAY', 4, CURRENT_DATE), 320.00, 'APROVADO');

-- ORÇAMENTO de exemplo: Diego pediu orçamento ao serviço do Bruno
INSERT INTO orcamento (anuncio_servico_id, cliente_id, descricao_projeto, prazo_dias, valor_estimado, status) VALUES
(2, 4, 'Ilustração de personagem original para capa de livro.', 10, NULL, 'SOLICITADO');

-- SELOS de exemplo
INSERT INTO selo (nome_badge, descricao, usuario_id, data_concessao) VALUES
('Primeiro Anúncio', 'Publicou o primeiro anúncio na Nexmon', 1, CURRENT_TIMESTAMP),
('Primeiro Anúncio', 'Publicou o primeiro anúncio na Nexmon', 2, CURRENT_TIMESTAMP),
('Primeiro Anúncio', 'Publicou o primeiro anúncio na Nexmon', 3, CURRENT_TIMESTAMP),
('Primeira Reserva Recebida', 'Recebeu a primeira reserva na Nexmon', 1, CURRENT_TIMESTAMP),
('Primeiro Orçamento Recebido', 'Recebeu o primeiro pedido de orçamento na Nexmon', 2, CURRENT_TIMESTAMP);
