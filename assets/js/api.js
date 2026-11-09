/* ============================================================
   NEXMON — api.js
   ============================================================ */

(function () {
  "use strict";

  const { utils, armazenamento, constantes } = Nexmon;
  const { MODALIDADES, CATEGORIAS } = constantes;
  const { temChave, modalidadeUsaDatas, hojeISO, lerDataISO, calcularDias, calcularTotal } = utils;

  const CHAVE_ANUNCIOS = "nexmon_v2_anuncios";
  const CHAVE_RESERVAS = "nexmon_v2_reservas";

  const LIMITES = Object.freeze({ tituloMax: 80, descricaoMax: 1000, precoMax: 100000, diasMax: 365 });
  const STATUS_RESERVA = Object.freeze(["PENDENTE", "APROVADO", "RECUSADO"]);
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  class ErroValidacao extends Error {
    constructor(mensagens) {
      const lista = Array.isArray(mensagens) ? mensagens : [mensagens];
      super(lista[0]);
      this.name = "ErroValidacao";
      this.mensagens = lista;
    }
  }

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

  function normalizarAnuncio(bruto) {
    if (!bruto || typeof bruto !== "object") return null;
    const modalidade = String(bruto.modalidade || "").toLowerCase();
    const preco = Number(bruto.preco);
    const titulo = limparTexto(bruto.titulo, LIMITES.tituloMax);
    const local = validarLocalizacao(bruto.estado, bruto.cidade);

    if (!inteiroPositivo(bruto.id) || !titulo || !local) return null;
    if (!temChave(MODALIDADES, modalidade) || !temChave(CATEGORIAS, String(bruto.categoria))) return null;
    if (!Number.isFinite(preco) || preco < 0 || preco > LIMITES.precoMax) return null;

    // Normalização das regras de calendário
    let datasBloqueadas = [];
    if (Array.isArray(bruto.datas_bloqueadas)) {
      datasBloqueadas = bruto.datas_bloqueadas.filter(d => lerDataISO(d));
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

    // Sanitização do calendário
    let datasBloqueadas = [];
    if (Array.isArray(dados.datas_bloqueadas)) {
      datasBloqueadas = dados.datas_bloqueadas.filter(d => lerDataISO(d));
    }
    const minDias = parseInt(dados.min_dias) || 1;
    const maxDias = parseInt(dados.max_dias) || 30;

    return { 
      titulo, descricao, categoria: dados.categoria, modalidade, 
      estado: local.estado, cidade: local.cidade, preco: arredondar(preco),
      datas_bloqueadas: datasBloqueadas, min_dias: Math.max(1, minDias), max_dias: Math.max(minDias, maxDias)
    };
  }

  function lerAnuncios() {
    const salvos = armazenamento.local.ler(CHAVE_ANUNCIOS, null);
    if (!Array.isArray(salvos)) return [];
    return salvos.map(normalizarAnuncio).filter(Boolean);
  }

  function lerReservas() {
    const salvas = armazenamento.local.ler(CHAVE_RESERVAS, []);
    return Array.isArray(salvas) ? salvas.map(normalizarReserva).filter(Boolean) : [];
  }

  const proximoId = (lista) => lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;

  async function listarAnuncios() {
    return lerAnuncios().filter((a) => a.ativo);
  }

  async function obterAnuncio(id) {
    return lerAnuncios().find((a) => a.id === id && a.ativo) || null;
  }

  async function criarAnuncio(dados, usuario) {
    const valido = validarNovoAnuncio(dados);
    const lista = lerAnuncios();
    const novo = {
      ...valido,
      id: proximoId(lista),
      vendedor: usuario.nome,
      id_usuario_proprietario: usuario.id,
      ativo: true
    };
    armazenamento.local.gravar(CHAVE_ANUNCIOS, [novo, ...lista]);
    return novo;
  }

  async function listarReservas() { return lerReservas(); }

  async function criarReserva({ id_anuncio, data_inicio, data_fim }, usuario) {
    const anuncio = await obterAnuncio(id_anuncio);
    if (!anuncio) throw new ErroValidacao("Anúncio não encontrado.");
    if (anuncio.id_usuario_proprietario === usuario.id) {
      throw new ErroValidacao("Você não pode reservar o seu próprio anúncio.");
    }

    let inicio = hojeISO();
    let fim = inicio;
    if (modalidadeUsaDatas(anuncio.modalidade)) {
      inicio = data_inicio;
      fim = data_fim;
      if (!lerDataISO(inicio) || !lerDataISO(fim)) throw new ErroValidacao("Selecione as datas.");
      if (inicio < hojeISO()) throw new ErroValidacao("A data de início não pode estar no passado.");
      if (fim < inicio) throw new ErroValidacao("A data final não pode ser anterior à inicial.");
      if (calcularDias(inicio, fim) > LIMITES.diasMax) throw new ErroValidacao(`O período máximo é de ${LIMITES.diasMax} dias.`);
    }

    const reservas = lerReservas();
    const nova = {
      id: proximoId(reservas),
      id_anuncio: anuncio.id,
      id_usuario_locatario: usuario.id,
      id_usuario_proprietario: anuncio.id_usuario_proprietario,
      nome_locatario: usuario.nome,
      nome_proprietario: anuncio.vendedor,
      data_inicio: inicio,
      data_fim: fim,
      valor_total: calcularTotal(anuncio, calcularDias(inicio, fim)),
      status: "PENDENTE"
    };
    armazenamento.local.gravar(CHAVE_RESERVAS, [nova, ...reservas]);
    return nova;
  }

  async function atualizarStatusReserva(id, status, usuario) {
    if (status !== "APROVADO" && status !== "RECUSADO") throw new ErroValidacao("Status inválido.");
    const reservas = lerReservas();
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) throw new ErroValidacao("Solicitação não encontrada.");
    if (reserva.id_usuario_proprietario !== usuario.id) throw new ErroValidacao("Você não pode alterar esta solicitação.");
    if (reserva.status !== "PENDENTE") throw new ErroValidacao("Esta solicitação já foi respondida.");

    reserva.status = status;
    armazenamento.local.gravar(CHAVE_RESERVAS, reservas);
    return reserva;
  }

  async function entrar(email, senha) {
    const emailLimpo = limparTexto(email, 254).toLowerCase();
    if (!REGEX_EMAIL.test(emailLimpo)) throw new ErroValidacao("Informe um e-mail válido.");
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72) {
      throw new ErroValidacao("A senha deve ter entre 8 e 72 caracteres.");
    }

    const nome = emailLimpo.split("@")[0]
      .replace(/[^a-zà-ÿ]+/g, " ").trim().slice(0, 30)
      .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase()) || "Membro";

    let hash = 2166136261;
    for (const c of emailLimpo) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;

    return { id: (hash % 2147483000) + 1, nome, email: emailLimpo };
  }

  // Nova função de cadastro (Etapa 3)
  async function cadastrar(nome, email, senha) {
    const nomeLimpo = limparTexto(nome, 60);
    const emailLimpo = limparTexto(email, 254).toLowerCase();

    if (nomeLimpo.length < 3) throw new ErroValidacao("O nome deve ter pelo menos 3 caracteres.");
    if (!REGEX_EMAIL.test(emailLimpo)) throw new ErroValidacao("Informe um e-mail válido.");
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72) {
      throw new ErroValidacao("A senha deve ter entre 8 e 72 caracteres.");
    }

    let hash = 2166136261;
    for (const c of emailLimpo) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;

    return { id: (hash % 2147483000) + 1, nome: nomeLimpo, email: emailLimpo };
  }

  async function listarSelos() { return []; }

  Nexmon.api = {
    ErroValidacao, LIMITES,
    listarAnuncios, obterAnuncio, criarAnuncio,
    listarReservas, criarReserva, atualizarStatusReserva,
    entrar, cadastrar, listarSelos
  };
})();