/* ============================================================
   NEXMON — utils.js
   ============================================================ */

(function () {
  "use strict";

  const Nexmon = (window.Nexmon = window.Nexmon || {});

  const MODALIDADES = Object.freeze({ aluguel: "Aluguel", venda: "Venda", emprestimo: "Empréstimo", servico: "Serviço" });
  const CATEGORIAS = Object.freeze({ PROPS_ARMADURAS: "Props / Armaduras", MANGAS_HQS: "Mangás / HQs", ACTION_FIGURES: "Action Figures", IMPRESSAO_3D: "Impressão 3D", ILUSTRACAO: "Ilustração" });

  const temChave = (objeto, chave) => Object.prototype.hasOwnProperty.call(objeto, chave);
  const modalidadeUsaDatas = (modalidade) => modalidade === "aluguel" || modalidade === "emprestimo";

  const naRaiz = !window.location.pathname.includes("/pages/");
  const rotas = Object.freeze({
    inicio: naRaiz ? "index.html" : "../index.html",
    pagina: (nome) => (naRaiz ? "pages/" : "") + nome + ".html"
  });

  function irPara(url, atrasoMs = 0) { setTimeout(() => { window.location.href = url; }, atrasoMs); }

  function criarElemento(tag, { classe, texto, atributos, dados } = {}, filhos = []) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    if (atributos) Object.entries(atributos).forEach(([k, v]) => el.setAttribute(k, v));
    if (dados) Object.assign(el.dataset, dados);
    filhos.forEach((filho) => el.append(filho));
    return el;
  }

  const TIPOS_TOAST = ["info", "success", "error"];
  function mostrarToast(mensagem, tipo = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const tipoSeguro = TIPOS_TOAST.includes(tipo) ? tipo : "info";
    const toast = criarElemento("div", { classe: `toast toast--${tipoSeguro}`, texto: String(mensagem), atributos: { role: tipoSeguro === "error" ? "alert" : "status" } });
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  const formatarMoeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const doisDigitos = (n) => String(n).padStart(2, "0");
  function hojeISO() { const d = new Date(); return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`; }
  function lerDataISO(texto) {
    if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
    const [ano, mes, dia] = texto.split("-").map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    const valida = data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
    return valida ? data : null;
  }
  function formatarData(texto) { return lerDataISO(texto) ? texto.split("-").reverse().join("/") : "—"; }
  function calcularDias(inicio, fim) {
    const i = lerDataISO(inicio); const f = lerDataISO(fim);
    if (!i || !f || f < i) return 0;
    return Math.round((f - i) / 86400000) + 1;
  }
  const calcularTotal = (anuncio, dias) => Math.round(anuncio.preco * (modalidadeUsaDatas(anuncio.modalidade) ? dias : 1) * 100) / 100;

  function criarArmazenamento(obterStorage) {
    return {
      ler(chave, padrao) { try { const bruto = obterStorage().getItem(chave); return bruto === null ? padrao : JSON.parse(bruto); } catch (_) { return padrao; } },
      gravar(chave, valor) { try { obterStorage().setItem(chave, JSON.stringify(valor)); return true; } catch (_) { return false; } },
      remover(chave) { try { obterStorage().removeItem(chave); } catch (_) { } }
    };
  }

  // --- NOVA FUNÇÃO: Carregar JSON ---
  async function carregarEstadosCidades() {
    try {
      const url = naRaiz ? 'assets/data/estados-cidades.json' : '../assets/data/estados-cidades.json';
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Falha ao carregar dados do IBGE");
      return await resposta.json();
    } catch (erro) {
      console.error("Erro ao carregar localidades:", erro);
      return [];
    }
  }

  Nexmon.constantes = { MODALIDADES, CATEGORIAS };
  Nexmon.utils = {
    temChave, modalidadeUsaDatas, rotas, irPara, criarElemento, mostrarToast,
    formatarMoeda, formatarData, hojeISO, lerDataISO, calcularDias, calcularTotal,
    carregarEstadosCidades,
    rotuloModalidade: (m) => (temChave(MODALIDADES, String(m).toLowerCase()) ? MODALIDADES[String(m).toLowerCase()] : "")
  };
  Nexmon.armazenamento = { local: criarArmazenamento(() => window.localStorage), sessao: criarArmazenamento(() => window.sessionStorage) };
})();