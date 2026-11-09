/* ============================================================
   NEXMON — api.js
   Camada de acesso à API REST (backend Spring Boot + MySQL).
   Mantém as mesmas funções que as páginas já usavam; só troca
   o localStorage por chamadas HTTP.
   ============================================================ */

(function () {
  "use strict";

  const { utils, constantes } = Nexmon;
  const { MODALIDADES, CATEGORIAS } = constantes;
  const { temChave, modalidadeUsaDatas, hojeISO, lerDataISO, calcularDias } = utils;

  // Servido pelo Spring (http://localhost:8080) -> mesma origem. Aberto por Live Server/arquivo -> porta 8080.
  // Para apontar para outro servidor: defina window.NEXMON_API_URL antes de carregar este arquivo.
  const API_BASE = window.NEXMON_API_URL
    || (window.location.port === "8080" ? "/api" : "http://localhost:8080/api");

  const LIMITES = Object.freeze({ tituloMax: 80, descricaoMax: 1000, precoMax: 100000, diasMax: 365 });
  const STATUS_RESERVA = Object.freeze(["PENDENTE", "APROVADO", "RECUSADO", "CONCLUIDA", "CANCELADA"]);
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  class ErroValidacao extends Error {
    constructor(mensagens, status) {
      const lista = Array.isArray(mensagens) ? mensagens : [mensagens];
      super(lista[0]);
      this.name = "ErroValidacao";
      this.mensagens = lista;
      this.status = status;
    }
  }

  /* ---------- HTTP ---------- */

  async function requisitar(metodo, caminho, corpo) {
    const opcoes = { method: metodo };
    if (corpo !== undefined) {
      opcoes.headers = { "Content-Type": "application/json" };
      opcoes.body = JSON.stringify(corpo);
    }

    let resposta;
    try {
      resposta = await fetch(API_BASE + caminho, opcoes);
    } catch (_) {
      throw new Error("Não foi possível conectar ao servidor. Verifique se a API está rodando.");
    }

    let dados = null;
    try { dados = await resposta.json(); } catch (_) { /* resposta sem corpo */ }

    if (resposta.ok) return dados;

    if (resposta.status >= 400 && resposta.status < 500) {
      const detalhes = dados && Array.isArray(dados.detalhes) ? dados.detalhes : [];
      const mensagens = detalhes.length
        ? detalhes.map((d) => String(d).replace(/^[^:]+:\s*/, ""))
        : [(dados && dados.mensagem) || "Requisição inválida."];
      throw new ErroValidacao(mensagens, resposta.status);
    }
    throw new Error("Erro no servidor. Tente novamente em instantes.");
  }

  /* ---------- Utilidades ---------- */

  function limparTexto(valor, max, permitirQuebra = false) {
    if (typeof valor !== "string") return "";
    const semControle = permitirQuebra
      ? valor.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
      : valor.replace(/[\u0000-\u001F\u007F]/g, " ");
    return semControle.trim().slice(0, max);
  }

  const inteiroPositivo = (n) => Number.isSafeInteger(n) && n > 0;
  const arredondar = (n) => Math.round(n * 100) / 100;

  const validarLocalizacao = (estado, cidade) => {
    const uf = limparTexto(estado, 2).toUpperCase();
    const cid = limparTexto(cidade, 60);
    if (!/^[A-Z]{2}$/.test(uf)) return null;
    if (cid.length < 2) return null;
    return { estado: uf, cidade: cid };
  };

  /* ---------- Conversão API <-> front ---------- */

  function normalizarAnuncio(bruto) {
    if (!bruto || typeof bruto !== "object") return null;
    const modalidade = String(bruto.modalidade || "").toLowerCase();
    const preco = Number(bruto.preco);
    const titulo = limparTexto(bruto.titulo, LIMITES.tituloMax);
    const local = validarLocalizacao(bruto.estado, bruto.cidade);

    if (!inteiroPositivo(bruto.id) || !titulo || !local) return null;
    if (!temChave(MODALIDADES, modalidade) || !temChave(CATEGORIAS, String(bruto.categoria))) return null;
    if (!Number.isFinite(preco) || preco < 0 || preco > LIMITES.precoMax) return null;

    let datasBloqueadas = [];
    if (Array.isArray(bruto.datas_bloqueadas)) {
      datasBloqueadas = bruto.datas_bloqueadas.filter((d) => lerDataISO(d));
    }
    const minDias = Number.isSafeInteger(bruto.min_dias) && bruto.min_dias > 0 ? bruto.min_dias : 1;
    const maxDias = Number.isSafeInteger(bruto.max_dias) && bruto.max_dias >= minDias ? bruto.max_dias : 30;

    return {
      id: bruto.id,
      titulo,
      descricao: limparTexto(bruto.descricao, LIMITES.descricaoMax, true),
      preco: arredondar(preco),
      estado: local.estado,
      cidade: local.cidade,
      modalidade,
      categoria: bruto.categoria,
      vendedor: limparTexto(bruto.vendedor, 60) || "Anunciante",
      id_usuario_proprietario: inteiroPositivo(bruto.id_usuario_proprietario) ? bruto.id_usuario_proprietario : null,
      ativo: bruto.ativo !== false,
      datas_bloqueadas: datasBloqueadas,
      min_dias: minDias,
      max_dias: maxDias
    };
  }

  // JSON da API (camelCase) -> formato usado pelas páginas (snake_case)
  function deAnuncioApi(a) {
    return normalizarAnuncio({
      id: a.id,
      titulo: a.titulo,
      descricao: a.descricao,
      preco: a.preco == null ? 0 : a.preco,
      estado: a.estado,
      cidade: a.cidade,
      modalidade: a.modalidade,
      categoria: a.categoria,
      vendedor: a.donoNome,
      id_usuario_proprietario: a.donoId,
      ativo: a.ativo,
      datas_bloqueadas: a.datasBloqueadas,
      min_dias: a.minDias,
      max_dias: a.maxDias
    });
  }

  function normalizarReserva(bruto) {
    if (!bruto || typeof bruto !== "object") return null;
    if (!inteiroPositivo(bruto.id) || !inteiroPositivo(bruto.id_anuncio) || !inteiroPositivo(bruto.id_usuario_locatario)) return null;
    if (!STATUS_RESERVA.includes(bruto.status)) return null;
    if (!lerDataISO(bruto.data_inicio) || !lerDataISO(bruto.data_fim)) return null;
    const valor = Number(bruto.valor_total);
    if (!Number.isFinite(valor) || valor < 0) return null;

    return {
      id: bruto.id,
      id_anuncio: bruto.id_anuncio,
      id_usuario_locatario: bruto.id_usuario_locatario,
      id_usuario_proprietario: inteiroPositivo(bruto.id_usuario_proprietario) ? bruto.id_usuario_proprietario : null,
      nome_locatario: limparTexto(bruto.nome_locatario, 60) || "Usuário",
      nome_proprietario: limparTexto(bruto.nome_proprietario, 60) || "Anunciante",
      data_inicio: bruto.data_inicio,
      data_fim: bruto.data_fim,
      valor_total: arredondar(valor),
      status: bruto.status
    };
  }

  function deReservaApi(r) {
    return normalizarReserva({
      id: r.id,
      id_anuncio: r.anuncioId,
      id_usuario_locatario: r.locatarioId,
      id_usuario_proprietario: r.locadorId,
      nome_locatario: r.locatarioNome,
      nome_proprietario: r.locadorNome,
      data_inicio: r.dataInicio,
      data_fim: r.dataFim,
      valor_total: r.valorTotal,
      status: r.status
    });
  }

  function validarNovoAnuncio(dados) {
    const erros = [];
    const titulo = limparTexto(dados.titulo, LIMITES.tituloMax);
    const descricao = limparTexto(dados.descricao, LIMITES.descricaoMax, true);
    const modalidade = String(dados.modalidade || "").toLowerCase();
    const preco = Number(dados.preco);
    const local = validarLocalizacao(dados.estado, dados.cidade);

    if (titulo.length < 3) erros.push("Informe um título com pelo menos 3 caracteres.");
    if (descricao.length < 10) erros.push("Descreva o item com pelo menos 10 caracteres.");
    if (!temChave(CATEGORIAS, String(dados.categoria))) erros.push("Selecione uma categoria válida.");
    if (!temChave(MODALIDADES, modalidade)) erros.push("Selecione uma modalidade válida.");
    if (!local) erros.push("Selecione um estado e uma cidade válidos.");
    if (!Number.isFinite(preco) || preco < 0 || preco > LIMITES.precoMax) {
      erros.push(`O preço deve ficar entre 0 e ${LIMITES.precoMax}.`);
    }
    if (erros.length) throw new ErroValidacao(erros);

    let datasBloqueadas = [];
    if (Array.isArray(dados.datas_bloqueadas)) {
      datasBloqueadas = dados.datas_bloqueadas.filter((d) => lerDataISO(d));
    }
    const minDias = parseInt(dados.min_dias) || 1;
    const maxDias = parseInt(dados.max_dias) || 30;

    return {
      titulo, descricao, categoria: dados.categoria, modalidade,
      estado: local.estado, cidade: local.cidade, preco: arredondar(preco),
      datas_bloqueadas: datasBloqueadas, min_dias: Math.max(1, minDias), max_dias: Math.max(minDias, maxDias)
    };
  }

  /* ---------- Anúncios ---------- */

  async function listarAnuncios() {
    const lista = await requisitar("GET", "/anuncios");
    return lista.map(deAnuncioApi).filter(Boolean).filter((a) => a.ativo);
  }

  async function obterAnuncio(id) {
    try {
      const dados = await requisitar("GET", `/anuncios/${encodeURIComponent(id)}`);
      return deAnuncioApi(dados);
    } catch (erro) {
      if (erro instanceof ErroValidacao && erro.status === 404) return null;
      throw erro;
    }
  }

  async function criarAnuncio(dados, usuario) {
    const v = validarNovoAnuncio(dados);
    const criado = await requisitar("POST", "/anuncios", {
      titulo: v.titulo,
      descricao: v.descricao,
      preco: v.preco,
      modalidade: v.modalidade.toUpperCase(),
      categoria: v.categoria,
      estado: v.estado,
      cidade: v.cidade,
      usuarioId: usuario.id,
      minDias: v.min_dias,
      maxDias: v.max_dias,
      datasBloqueadas: v.datas_bloqueadas
    });
    return deAnuncioApi(criado);
  }

  /* ---------- Reservas / solicitações ---------- */

  async function listarReservas(usuario) {
    const atual = usuario || (Nexmon.sessao && Nexmon.sessao.obter());
    if (!atual) return [];
    const lista = await requisitar("GET", `/reservas/usuario/${encodeURIComponent(atual.id)}`);
    return lista.map(deReservaApi).filter(Boolean);
  }

  async function criarReserva({ id_anuncio, data_inicio, data_fim }, usuario) {
    const anuncio = await obterAnuncio(id_anuncio);
    if (!anuncio) throw new ErroValidacao("Anúncio não encontrado.");
    if (anuncio.id_usuario_proprietario === usuario.id) {
      throw new ErroValidacao("Você não pode reservar o seu próprio anúncio.");
    }

    const corpo = { anuncioId: anuncio.id, usuarioId: usuario.id };
    if (modalidadeUsaDatas(anuncio.modalidade)) {
      if (!lerDataISO(data_inicio) || !lerDataISO(data_fim)) throw new ErroValidacao("Selecione as datas.");
      if (data_inicio < hojeISO()) throw new ErroValidacao("A data de início não pode estar no passado.");
      if (data_fim < data_inicio) throw new ErroValidacao("A data final não pode ser anterior à inicial.");
      if (calcularDias(data_inicio, data_fim) > LIMITES.diasMax) throw new ErroValidacao(`O período máximo é de ${LIMITES.diasMax} dias.`);
      corpo.dataInicio = data_inicio;
      corpo.dataFim = data_fim;
    }

    return deReservaApi(await requisitar("POST", "/reservas", corpo));
  }

  async function atualizarStatusReserva(id, status, usuario) {
    if (status !== "APROVADO" && status !== "RECUSADO") throw new ErroValidacao("Status inválido.");
    const atualizada = await requisitar("PATCH", `/reservas/${encodeURIComponent(id)}/status`, {
      usuarioId: usuario.id,
      status
    });
    return deReservaApi(atualizada);
  }

  /* ---------- Conta ---------- */

  async function entrar(email, senha) {
    const emailLimpo = limparTexto(email, 254).toLowerCase();
    if (!REGEX_EMAIL.test(emailLimpo)) throw new ErroValidacao("Informe um e-mail válido.");
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72) {
      throw new ErroValidacao("A senha deve ter entre 8 e 72 caracteres.");
    }
    const u = await requisitar("POST", "/auth/login", { email: emailLimpo, senha });
    return { id: u.id, nome: u.nome, email: u.email };
  }

  async function cadastrar(nome, email, senha) {
    const nomeLimpo = limparTexto(nome, 60);
    const emailLimpo = limparTexto(email, 254).toLowerCase();

    if (nomeLimpo.length < 3) throw new ErroValidacao("O nome deve ter pelo menos 3 caracteres.");
    if (!REGEX_EMAIL.test(emailLimpo)) throw new ErroValidacao("Informe um e-mail válido.");
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72) {
      throw new ErroValidacao("A senha deve ter entre 8 e 72 caracteres.");
    }
    const u = await requisitar("POST", "/usuarios", { nome: nomeLimpo, email: emailLimpo, senha });
    return { id: u.id, nome: u.nome, email: u.email };
  }

  async function listarSelos(usuario) {
    if (!usuario) return [];
    const lista = await requisitar("GET", `/selos/usuario/${encodeURIComponent(usuario.id)}`);
    return lista.map((s) => ({ nome: s.nomeBadge, descricao: s.descricao || "", imagem: null }));
  }

  Nexmon.api = {
    ErroValidacao, LIMITES,
    listarAnuncios, obterAnuncio, criarAnuncio,
    listarReservas, criarReserva, atualizarStatusReserva,
    entrar, cadastrar, listarSelos
  };
})();
