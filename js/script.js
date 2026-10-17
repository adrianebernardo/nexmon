/* ============================================================
   NEXMON — script.js (Completo: Home, Detalhes, Novo Anúncio, Login, Solicitações, Perfil)
   ============================================================ */

(function () {
  "use strict";

  // ---------------------------------------------------------
  // 0. Mock de Anúncios
  // ---------------------------------------------------------
  const MOCK_ANUNCIOS = [
    { id: 1, titulo: "Armadura EVA — Cavaleiro Negro", preco: 65.0, cidade: "Canoas", modalidade: "aluguel", categoria: "PROPS_ARMADURAS", foto_url: "", id_usuario_proprietario: 2, ativo: true },
    { id: 2, titulo: "Capacete Black Panther 3D", preco: 120.0, cidade: "Porto Alegre", modalidade: "aluguel", categoria: "PROPS_ARMADURAS", foto_url: "", id_usuario_proprietario: 2, ativo: true },
    { id: 3, titulo: "Miniatura Dragão — Resina", preco: 45.0, cidade: "São Leopoldo", modalidade: "venda", categoria: "IMPRESSAO_3D", foto_url: "", id_usuario_proprietario: 2, ativo: true },
    { id: 4, titulo: "Máscara Red October", preco: 89.0, cidade: "Porto Alegre", modalidade: "venda", categoria: "PROPS_ARMADURAS", foto_url: "", id_usuario_proprietario: 2, ativo: true },
    { id: 5, titulo: "Kit Espadas — EVA", preco: 30.0, cidade: "Novo Hamburgo", modalidade: "emprestimo", categoria: "PROPS_ARMADURAS", foto_url: "", id_usuario_proprietario: 2, ativo: true },
    { id: 6, titulo: "Ilustração Personalizada A3", preco: 150.0, cidade: "Canoas", modalidade: "servico", categoria: "ILUSTRACAO", foto_url: "", id_usuario_proprietario: 2, ativo: true },
    { id: 7, titulo: "Mangá Hunter x Hunter Vol. 1", preco: 35.0, cidade: "Porto Alegre", modalidade: "venda", categoria: "MANGAS_HQS", foto_url: "", id_usuario_proprietario: 3, ativo: true },
    { id: 8, titulo: "Capa de Herói — Cosplay", preco: 50.0, cidade: "São Leopoldo", modalidade: "aluguel", categoria: "PROPS_ARMADURAS", foto_url: "", id_usuario_proprietario: 2, ativo: true }
  ];

  // Mock de Reservas (Simulando o banco tb_reserva)
  const MOCK_RESERVAS = [
    { id: 101, id_anuncio: 1, id_usuario_locatario: 3, id_usuario_proprietario: 2, data_inicio: "2026-11-01", data_fim: "2026-11-03", valor_total: 130.0, status: "PENDENTE" },
    { id: 102, id_anuncio: 2, id_usuario_locatario: 1, id_usuario_proprietario: 2, data_inicio: "2026-11-10", data_fim: "2026-11-12", valor_total: 240.0, status: "APROVADO" }
  ];

  // ---------------------------------------------------------
  // 1. Inicialização e Estado
  // ---------------------------------------------------------
  function obterAnuncios() {
    const salvos = localStorage.getItem("nexmon_anuncios");
    if (salvos) return JSON.parse(salvos);
    localStorage.setItem("nexmon_anuncios", JSON.stringify(MOCK_ANUNCIOS));
    return MOCK_ANUNCIOS;
  }

  const state = {
    anuncios: obterAnuncios(),
    filtroCidade: "",
    filtroModalidade: "",
    busca: "",
    paginaAtual: 1,
    itensPorPagina: 8
  };

  // ---------------------------------------------------------
  // 2. Funções Utilitárias
  // ---------------------------------------------------------
  function rotuloModalidade(mod) {
    const mapa = { aluguel: "Aluguel", venda: "Venda", emprestimo: "Empréstimo", servico: "Serviço", ALUGUEL: "Aluguel", VENDA: "Venda", EMPRESTIMO: "Empréstimo", SERVICO: "Serviço" };
    return mapa[mod] || mod;
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.style.background = "var(--card)";
    toast.style.color = "var(--text)";
    toast.style.padding = "16px";
    toast.style.border = "4px solid var(--pixel-border-dark)";
    toast.style.boxShadow = "4px 4px 0 rgba(0,0,0,0.5)";
    toast.style.fontFamily = "var(--font-retro)";
    toast.style.fontSize = "1.2rem";
    toast.style.marginBottom = "8px";
    
    if (type === "success") toast.style.borderColor = "#7BD88F";
    if (type === "error") toast.style.borderColor = "#F08A82";

    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function obterNomeUsuario(id) {
    const nomes = { 1: "Lucas (Cosmaker)", 2: "Luara (Forge Studio)", 3: "Adriane (Admin)" };
    return nomes[id] || "Usuário Desconhecido";
  }

  // ---------------------------------------------------------
  // 3. Lógica Global de Login
  // ---------------------------------------------------------
  function atualizarNavbar() {
    const btnLogin = document.getElementById("nav-login-btn");
    if (!btnLogin) return;

    const userId = localStorage.getItem("nexmon_user_id");
    const userName = localStorage.getItem("nexmon_user_name");

    if (userId && userName) {
      btnLogin.textContent = `Sair (${userName})`;
      btnLogin.href = "#";
      btnLogin.style.background = "var(--wine)";
      btnLogin.style.borderColor = "var(--lilac)";
      
      btnLogin.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem("nexmon_user_id");
        localStorage.removeItem("nexmon_user_name");
        showToast("Você saiu do sistema.", "success");
        setTimeout(() => window.location.reload(), 1000);
      };
    } else {
      btnLogin.textContent = "Entrar";
      btnLogin.href = "login.html";
    }
  }

  // ---------------------------------------------------------
  // 4. Lógica da Home
  // ---------------------------------------------------------
  function getFiltrados() {
    return state.anuncios.filter((a) => {
      const matchCidade = !state.filtroCidade || a.cidade === state.filtroCidade;
      const matchModalidade = !state.filtroModalidade || a.modalidade.toLowerCase() === state.filtroModalidade.toLowerCase();
      const matchBusca = !state.busca || a.titulo.toLowerCase().includes(state.busca.toLowerCase());
      return matchCidade && matchModalidade && matchBusca;
    });
  }

  function renderGrid() {
    const grid = document.getElementById("product-grid");
    const countEl = document.getElementById("results-count");
    if (!grid) return;

    const filtrados = getFiltrados();
    const total = filtrados.length;

    if (total === 0) {
      grid.innerHTML = `
        <div class="is-empty" style="grid-column: 1 / -1;">
          Nenhum item encontrado.<br>
          <span style="font-family: var(--font-retro); font-size: 1.2rem; color: var(--muted); margin-top: 8px; display: block;">Tente outro filtro.</span>
        </div>
      `;
      if (countEl) countEl.textContent = "0 resultados";
      renderPagination(0);
      return;
    }

    const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
    const fim = inicio + state.itensPorPagina;
    const pagina = filtrados.slice(inicio, fim);

    grid.innerHTML = "";
    pagina.forEach((a) => grid.appendChild(criarCard(a)));

    if (countEl) countEl.textContent = `${total} resultado${total > 1 ? "s" : ""}`;
    renderPagination(total);
  }

  function criarCard(anuncio) {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("aria-label", anuncio.titulo);
    
    card.innerHTML = `
      <div class="card__media" aria-hidden="true">${anuncio.titulo.charAt(0)}</div>
      <div class="card__body">
        <span class="badge">${rotuloModalidade(anuncio.modalidade)}</span>
        <h3 class="card__title" title="${anuncio.titulo}">${anuncio.titulo}</h3>
        <div class="card__meta">
          <span>${anuncio.cidade}</span>
          <span class="card__price">R$ ${anuncio.preco.toFixed(2)}</span>
        </div>
        <div class="card__actions">
          <button class="btn btn--secondary" style="flex:1; margin-top: 8px;" data-action="ver" data-id="${anuncio.id}">Detalhes</button>
        </div>
      </div>
    `;
    
    card.querySelector('[data-action="ver"]').addEventListener("click", () => {
      window.location.href = `anuncio-detalhes.html?id=${anuncio.id}`;
    });
    return card;
  }

  function renderPagination(totalItems) {
    const nav = document.getElementById("pagination");
    if (!nav) return;

    const totalPaginas = Math.ceil(totalItems / state.itensPorPagina);
    nav.innerHTML = "";
    if (totalPaginas <= 1) return;

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "Anterior";
    btnPrev.disabled = state.paginaAtual === 1;
    btnPrev.addEventListener("click", () => { state.paginaAtual--; renderGrid(); });
    nav.appendChild(btnPrev);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === state.paginaAtual) btn.classList.add("is-active");
      btn.addEventListener("click", () => { state.paginaAtual = i; renderGrid(); });
      nav.appendChild(btn);
    }

    const btnNext = document.createElement("button");
    btnNext.textContent = "Próximo";
    btnNext.disabled = state.paginaAtual === totalPaginas;
    btnNext.addEventListener("click", () => { state.paginaAtual++; renderGrid(); });
    nav.appendChild(btnNext);
  }

  function bindFilters() {
    const modBtns = document.querySelectorAll("#modality-filters .filter-chip");
    modBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        modBtns.forEach(b => b.classList.remove("is-active"));
        e.target.classList.add("is-active");
        state.filtroModalidade = e.target.dataset.modality;
        state.paginaAtual = 1;
        renderGrid();
      });
    });

    const citySelect = document.getElementById("city-filter");
    if (citySelect) {
      citySelect.addEventListener("change", (e) => {
        state.filtroCidade = e.target.value;
        state.paginaAtual = 1;
        renderGrid();
      });
    }

    const searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.busca = e.target.value;
        state.paginaAtual = 1;
        renderGrid();
      });
    }
  }

  // ---------------------------------------------------------
  // 5. Página de Detalhes
  // ---------------------------------------------------------
  function initDetalhes() {
    const inputInicio = document.getElementById("data-inicio");
    const inputFim = document.getElementById("data-fim");
    const spanDias = document.getElementById("dias-total");
    const spanTotal = document.getElementById("valor-total");
    const btnReservar = document.getElementById("btn-reservar");

    if (!inputInicio || !inputFim || !spanDias || !spanTotal) return; 

    const VALOR_DIARIA = 65.0; 

    function calcularTotal() {
      const inicio = inputInicio.value;
      const fim = inputFim.value;
      if (!inicio || !fim) { spanDias.textContent = "0"; spanTotal.textContent = `R$ 0,00`; return; }

      const dataInicio = new Date(inicio + "T00:00:00");
      const dataFim = new Date(fim + "T00:00:00");

      if (dataFim < dataInicio) {
        showToast("Data fim não pode ser anterior à de início.", "error");
        inputFim.value = ""; spanDias.textContent = "0"; spanTotal.textContent = `R$ 0,00`; return;
      }

      const diffTime = Math.abs(dataFim - dataInicio);
      let dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      dias = dias === 0 ? 1 : dias + 1; 
      const total = dias * VALOR_DIARIA;

      spanDias.textContent = dias;
      spanTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    inputInicio.addEventListener("change", () => {
      const hoje = new Date().toISOString().split("T")[0];
      inputInicio.min = hoje;
      inputFim.min = inputInicio.value; 
      calcularTotal();
    });

    inputFim.addEventListener("change", calcularTotal);

    if (btnReservar) {
      btnReservar.addEventListener("click", () => {
        if (!localStorage.getItem("nexmon_user_id")) {
           showToast("Faça login para reservar.", "error");
           setTimeout(() => window.location.href = "login.html", 1500); return;
        }
        if (!inputInicio.value || !inputFim.value) {
          showToast("Selecione as datas.", "error"); return;
        }
        
        btnReservar.textContent = "Enviando...";
        btnReservar.disabled = true;
        setTimeout(() => {
          showToast("Reserva solicitada! Aguarde aprovação.", "success");
          btnReservar.textContent = "Solicitar Reserva";
          btnReservar.disabled = false;
        }, 1500);
      });
    }
  }

  // ---------------------------------------------------------
  // 6. Novo Anúncio
  // ---------------------------------------------------------
  function initNovoAnuncio() {
    const form = document.getElementById("form-anuncio");
    if (!form) return; 

    form.addEventListener("submit", (e) => {
      e.preventDefault(); 
      const userId = localStorage.getItem("nexmon_user_id");
      if (!userId) { showToast("Faça login para publicar.", "error"); setTimeout(() => window.location.href = "login.html", 1500); return; }

      const btnSubmit = form.querySelector('button[type="submit"]');
      const textoOriginal = btnSubmit.textContent;
      btnSubmit.textContent = "Forjando..."; btnSubmit.disabled = true;

      const novoAnuncio = {
        id: Date.now(), 
        titulo: document.getElementById("titulo").value,
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        modalidade: document.getElementById("modalidade").value.toLowerCase(),
        cidade: document.getElementById("cidade").value,
        preco: parseFloat(document.getElementById("preco").value),
        foto_url: document.getElementById("fotoUrl").value,
        id_usuario_proprietario: parseInt(userId),
        ativo: true
      };

      setTimeout(() => {
        const listaAtual = obterAnuncios();
        listaAtual.unshift(novoAnuncio); 
        localStorage.setItem("nexmon_anuncios", JSON.stringify(listaAtual));
        showToast("Relíquia publicada!", "success");
        btnSubmit.textContent = textoOriginal; btnSubmit.disabled = false;
        form.reset();
        setTimeout(() => window.location.href = "index.html", 2000);
      }, 1500);
    });
  }

  // ---------------------------------------------------------
  // 7. Tela de Login
  // ---------------------------------------------------------
  function initLogin() {
    const form = document.getElementById("form-login");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = "Autenticando..."; btn.disabled = true;

      setTimeout(() => {
        if (email.includes("lucas")) { localStorage.setItem("nexmon_user_id", "1"); localStorage.setItem("nexmon_user_name", "Lucas"); }
        else if (email.includes("luara")) { localStorage.setItem("nexmon_user_id", "2"); localStorage.setItem("nexmon_user_name", "Luara"); }
        else { localStorage.setItem("nexmon_user_id", "3"); localStorage.setItem("nexmon_user_name", "Adriane"); }
        showToast("Acesso concedido!", "success");
        setTimeout(() => window.location.href = "index.html", 1000);
      }, 1000);
    });

    document.querySelectorAll(".quick-login").forEach(btn => {
      btn.addEventListener("click", () => {
        localStorage.setItem("nexmon_user_id", btn.getAttribute("data-id"));
        localStorage.setItem("nexmon_user_name", btn.getAttribute("data-nome"));
        showToast(`Acesso rápido: ${btn.getAttribute("data-nome")}`, "success");
        setTimeout(() => window.location.href = "index.html", 1000);
      });
    });
  }

  // ---------------------------------------------------------
  // 8. Tela de Solicitações (Abas)
  // ---------------------------------------------------------
  function initSolicitacoes() {
    const tabs = document.querySelectorAll(".tabs__btn");
    const tabRecebidas = document.getElementById("tab-recebidas");
    const tabEnviadas = document.getElementById("tab-enviadas");

    if (!tabs.length || !tabRecebidas || !tabEnviadas) return;

    const userId = parseInt(localStorage.getItem("nexmon_user_id"));
    if (!userId) {
      showToast("Faça login para ver as solicitações.", "error");
      setTimeout(() => window.location.href = "login.html", 1500); return;
    }

    const reservas = MOCK_RESERVAS; 

    function renderLista(tipo) {
      const container = tipo === "recebidas" ? tabRecebidas : tabEnviadas;
      container.innerHTML = "";

      const filtradas = reservas.filter(r => {
        if (tipo === "recebidas") return r.id_usuario_proprietario === userId;
        else return r.id_usuario_locatario === userId;
      });

      if (filtradas.length === 0) {
        container.innerHTML = `<p class="is-empty">Nenhuma solicitação encontrada.</p>`;
        return;
      }

      filtradas.forEach(r => {
        const anuncio = state.anuncios.find(a => a.id === r.id_anuncio) || { titulo: "Item Desconhecido" };
        const pessoa = tipo === "recebidas" ? obterNomeUsuario(r.id_usuario_locatario) : obterNomeUsuario(r.id_usuario_proprietario);
        
        const div = document.createElement("div");
        div.className = "tx-card";
        div.innerHTML = `
          <div class="tx-card__info">
            <span class="badge badge--${r.status.toLowerCase()}">${r.status}</span>
            <span class="tx-card__title">${anuncio.titulo}</span>
            <span class="tx-card__dates">${r.data_inicio} a ${r.data_fim} | R$ ${r.valor_total.toFixed(2)}</span>
            <span class="muted" style="font-size: 1rem;">Solicitante: ${pessoa}</span>
          </div>
          <div class="tx-card__actions">
            ${tipo === "recebidas" && r.status === "PENDENTE" ? `
              <button class="btn btn--primary btn-aprovar" data-id="${r.id}" style="font-size: 0.6rem; background: #7BD88F; color: #000;">Aprovar</button>
              <button class="btn btn--secondary btn-recusar" data-id="${r.id}" style="font-size: 0.6rem; color: #F08A82; border-color: #F08A82;">Recusar</button>
            ` : ''}
          </div>
        `;
        container.appendChild(div);
      });

      container.querySelectorAll(".btn-aprovar").forEach(btn => {
        btn.addEventListener("click", () => {
          showToast("Reserva Aprovada!", "success");
          btn.closest(".tx-card").querySelector(".badge").className = "badge badge--aprovado";
          btn.closest(".tx-card").querySelector(".badge").textContent = "APROVADO";
          btn.parentElement.innerHTML = ""; 
        });
      });

      container.querySelectorAll(".btn-recusar").forEach(btn => {
        btn.addEventListener("click", () => {
          showToast("Reserva Recusada.", "error");
          btn.closest(".tx-card").querySelector(".badge").className = "badge badge--recusado";
          btn.closest(".tx-card").querySelector(".badge").textContent = "RECUSADO";
          btn.parentElement.innerHTML = ""; 
        });
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        tabs.forEach(t => t.classList.remove("is-active"));
        e.target.classList.add("is-active");
        
        if (e.target.dataset.tab === "recebidas") {
          tabRecebidas.style.display = "block";
          tabEnviadas.style.display = "none";
          renderLista("recebidas");
        } else {
          tabRecebidas.style.display = "none";
          tabEnviadas.style.display = "block";
          renderLista("enviadas");
        }
      });
    });

    renderLista("recebidas");
  }

  // ---------------------------------------------------------
  // 9. Tela de Perfil
  // ---------------------------------------------------------
  function initPerfil() {
    const profileName = document.getElementById("profile-name");
    if (!profileName) return; 

    const userId = parseInt(localStorage.getItem("nexmon_user_id"));
    const userName = localStorage.getItem("nexmon_user_name");

    if (!userId) {
      showToast("Faça login para acessar o perfil.", "error");
      setTimeout(() => window.location.href = "login.html", 1500); return;
    }

    // 1. Preenche os dados básicos
    profileName.textContent = userName || "Desconhecido";
    document.getElementById("profile-role").textContent = userId === 1 ? "COSMAKER" : userId === 2 ? "PRESTADORA" : "ADMIN";

    // 2. Renderiza os Selos (Mockados baseados no banco de dados)
    const badgesContainer = document.getElementById("profile-badges");
    const selos = [];
    
    if (userId === 1) { // Lucas
      selos.push({ nome: "PONTUALIDADE", img: "pontualidade.png", desc: "Sempre entrega no prazo." });
      selos.push({ nome: "COMMUNITY_MAKER", img: "", desc: "Contribui ativamente com a guilda." });
    } else if (userId === 2) { // Luara
      selos.push({ nome: "MEMBER_VERIFIED", img: "", desc: "Identidade verificada." });
    } else {
      selos.push({ nome: "MEMBER_VERIFIED", img: "", desc: "Conta de administrador." });
    }

    badgesContainer.innerHTML = selos.map(s => `
      <div class="badge-item">
        <div class="badge-item__icon">
          ${s.img ? `<img src="${s.img}" alt="${s.nome}">` : "⏳"}
        </div>
        <div class="badge-item__name">${s.nome}</div>
        <div class="badge-item__desc">${s.desc}</div>
      </div>
    `).join('');

    // 3. Renderiza os Anúncios do próprio usuário
    const grid = document.getElementById("my-products-grid");
    const meusAnuncios = state.anuncios.filter(a => a.id_usuario_proprietario === userId);

    if (meusAnuncios.length === 0) {
      grid.innerHTML = `<p class="muted" style="grid-column: 1 / -1; font-family: var(--font-retro); font-size: 1.2rem;">Você ainda não forjou nenhuma relíquia.</p>`;
    } else {
      meusAnuncios.forEach(a => grid.appendChild(criarCard(a)));
    }
  }

  // ---------------------------------------------------------
  // 10. Inicialização Geral
  // ---------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    state.anuncios = obterAnuncios();
    
    atualizarNavbar();
    bindFilters();
    renderGrid();      
    initDetalhes();    
    initNovoAnuncio(); 
    initLogin();       
    initSolicitacoes(); 
    initPerfil();       
  });

})();