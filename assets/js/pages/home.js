/* ============================================================
   NEXMON — pages/home.js
   ============================================================ */

(function () {
  "use strict";

  const { api, componentes, utils } = Nexmon;
  const { criarElemento, mostrarToast, carregarEstadosCidades } = utils;

  const state = {
    anuncios: [],
    filtroUf: "",
    filtroCidade: "",
    filtroModalidade: "",
    busca: "",
    paginaAtual: 1,
    itensPorPagina: 8
  };

  const grid = document.getElementById("product-grid");
  const contador = document.getElementById("results-count");
  const paginacao = document.getElementById("pagination");
  const selectUf = document.getElementById("uf-filter");
  const selectCidade = document.getElementById("city-filter");

  function filtrar() {
    const termo = state.busca.trim().toLowerCase();
    return state.anuncios.filter((a) =>
      (!state.filtroUf || a.estado === state.filtroUf) &&
      (!state.filtroCidade || a.cidade === state.filtroCidade) &&
      (!state.filtroModalidade || a.modalidade === state.filtroModalidade) &&
      (!termo || a.titulo.toLowerCase().includes(termo))
    );
  }

  function renderizar() {
    const filtrados = filtrar();
    const total = filtrados.length;
    grid.replaceChildren();

    if (total === 0) {
      grid.appendChild(criarElemento("div", { classe: "is-empty is-empty--wide" }, [
        "Nenhum item encontrado.",
        criarElemento("span", { classe: "is-empty__hint", texto: "Tente outro filtro." })
      ]));
      contador.textContent = "0 resultados";
      renderizarPaginacao(0);
      return;
    }

    const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
    filtrados.slice(inicio, inicio + state.itensPorPagina)
      .forEach((anuncio) => grid.appendChild(componentes.criarCard(anuncio)));

    contador.textContent = `${total} resultado${total > 1 ? "s" : ""}`;
    renderizarPaginacao(total);
  }

  function botaoPagina(texto, { ativo = false, desabilitado = false, aoClicar }) {
    const botao = criarElemento("button", { texto, atributos: { type: "button" } });
    if (ativo) { botao.classList.add("is-active"); botao.setAttribute("aria-current", "page"); }
    botao.disabled = desabilitado;
    botao.addEventListener("click", aoClicar);
    return botao;
  }

  function renderizarPaginacao(total) {
    const totalPaginas = Math.ceil(total / state.itensPorPagina);
    paginacao.replaceChildren();
    if (totalPaginas <= 1) return;
    const irPara = (pagina) => { state.paginaAtual = pagina; renderizar(); };
    paginacao.appendChild(botaoPagina("Anterior", { desabilitado: state.paginaAtual === 1, aoClicar: () => irPara(state.paginaAtual - 1) }));
    for (let i = 1; i <= totalPaginas; i++) {
      paginacao.appendChild(botaoPagina(String(i), { ativo: i === state.paginaAtual, aoClicar: () => irPara(i) }));
    }
    paginacao.appendChild(botaoPagina("Próximo", { desabilitado: state.paginaAtual === totalPaginas, aoClicar: () => irPara(state.paginaAtual + 1) }));
  }

  function aplicarFiltro(alteracao) {
    Object.assign(state, alteracao, { paginaAtual: 1 });
    renderizar();
  }

  async function carregarLocalidades() {
    try {
      const estados = await carregarEstadosCidades();
      estados.forEach(est => {
        const opt = document.createElement("option");
        opt.value = est.uf;
        opt.textContent = est.nome;
        selectUf.appendChild(opt);
      });

      selectUf.addEventListener("change", (e) => {
        const uf = e.target.value;
        selectCidade.innerHTML = '<option value="">Todas as cidades</option>';
        
        if (!uf) {
          selectCidade.disabled = true;
          aplicarFiltro({ filtroUf: "", filtroCidade: "" });
        } else {
          const estadoObj = estados.find(est => est.uf === uf);
          if (estadoObj) {
            estadoObj.cidades.forEach(cid => {
              const optCid = document.createElement("option");
              optCid.value = cid;
              optCid.textContent = cid;
              selectCidade.appendChild(optCid);
            });
          }
          selectCidade.disabled = false;
          aplicarFiltro({ filtroUf: uf, filtroCidade: "" });
        }
      });

      selectCidade.addEventListener("change", (e) => aplicarFiltro({ filtroCidade: e.target.value }));
    } catch (_) { /* erro tratado no utils */ }
  }

  function ligarFiltros() {
    const chips = document.querySelectorAll("#modality-filters .filter-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        aplicarFiltro({ filtroModalidade: chip.dataset.modality });
      });
    });

    const campoBusca = document.getElementById("search");
    campoBusca.addEventListener("input", (e) => aplicarFiltro({ busca: e.target.value }));
    campoBusca.form.addEventListener("submit", (e) => e.preventDefault());

    state.busca = (new URLSearchParams(window.location.search).get("q") || "").slice(0, 100);
    campoBusca.value = state.busca;
  }

  async function iniciar() {
    ligarFiltros();
    await carregarLocalidades();
    try {
      state.anuncios = await api.listarAnuncios();
      renderizar();
    } catch (_) {
      contador.textContent = "";
      mostrarToast("Não foi possível carregar o catálogo.", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();