/* ============================================================
   NEXMON — pages/solicitacoes.js
   Central de transações: solicitações recebidas e enviadas.
   ============================================================ */

(function () {
  "use strict";

  const { api, sessao, utils } = Nexmon;
  const { criarElemento, mostrarToast, formatarData, formatarMoeda } = utils;

  document.addEventListener("DOMContentLoaded", () => {
    const usuario = sessao.exigirLogin("Faça login para ver as solicitações.");
    if (!usuario) return;

    const abas = Array.from(document.querySelectorAll(".tabs__btn"));
    const paineis = { recebidas: document.getElementById("tab-recebidas"), enviadas: document.getElementById("tab-enviadas") };
    let abaAtual = window.location.hash === "#enviadas" ? "enviadas" : "recebidas";

    function periodo(reserva) {
      return reserva.data_inicio === reserva.data_fim
        ? formatarData(reserva.data_inicio)
        : `${formatarData(reserva.data_inicio)} a ${formatarData(reserva.data_fim)}`;
    }

    async function responder(reserva, status) {
      try {
        await api.atualizarStatusReserva(reserva.id, status, usuario);
        mostrarToast(status === "APROVADO" ? "Solicitação aprovada!" : "Solicitação recusada.", status === "APROVADO" ? "success" : "error");
        await renderizar();
      } catch (erro) {
        mostrarToast(erro instanceof api.ErroValidacao ? erro.message : "Não foi possível atualizar agora.", "error");
      }
    }

    function criarCartao(reserva, tipo, titulosPorId) {
      const recebida = tipo === "recebidas";
      const nomeOutraParte = recebida ? reserva.nome_locatario : reserva.nome_proprietario;
      const acoes = criarElemento("div", { classe: "tx-card__actions" });

      if (recebida && reserva.status === "PENDENTE") {
        const aprovar = criarElemento("button", { classe: "btn btn--approve btn--small", texto: "Aprovar", atributos: { type: "button" } });
        const recusar = criarElemento("button", { classe: "btn btn--secondary btn--reject btn--small", texto: "Recusar", atributos: { type: "button" } });
        aprovar.addEventListener("click", () => responder(reserva, "APROVADO"));
        recusar.addEventListener("click", () => responder(reserva, "RECUSADO"));
        acoes.append(aprovar, recusar);
      }

      return criarElemento("div", { classe: "tx-card" }, [
        criarElemento("div", { classe: "tx-card__info" }, [
          criarElemento("span", { classe: `badge badge--${reserva.status.toLowerCase()}`, texto: reserva.status }),
          criarElemento("span", { classe: "tx-card__title", texto: titulosPorId.get(reserva.id_anuncio) || "Item indisponível" }),
          criarElemento("span", { classe: "tx-card__dates", texto: `${periodo(reserva)} | ${formatarMoeda(reserva.valor_total)}` }),
          criarElemento("span", { classe: "muted tx-card__person", texto: `${recebida ? "Solicitante" : "Anunciante"}: ${nomeOutraParte}` })
        ]),
        acoes
      ]);
    }

    async function renderizar() {
      let reservas;
      let anuncios;
      try {
        [reservas, anuncios] = await Promise.all([api.listarReservas(usuario), api.listarAnuncios()]);
      } catch (_) {
        mostrarToast("Não foi possível carregar as solicitações.", "error");
        return;
      }

      const titulosPorId = new Map(anuncios.map((a) => [a.id, a.titulo]));
      const filtros = {
        recebidas: (r) => r.id_usuario_proprietario === usuario.id,
        enviadas: (r) => r.id_usuario_locatario === usuario.id
      };

      Object.keys(paineis).forEach((tipo) => {
        const painel = paineis[tipo];
        const lista = reservas.filter(filtros[tipo]);
        painel.hidden = tipo !== abaAtual;
        painel.replaceChildren();

        if (lista.length === 0) {
          painel.appendChild(criarElemento("p", { classe: "is-empty", texto: "Nenhuma solicitação encontrada." }));
          return;
        }
        lista.forEach((r) => painel.appendChild(criarCartao(r, tipo, titulosPorId)));
      });

      abas.forEach((aba) => {
        const ativa = aba.dataset.tab === abaAtual;
        aba.classList.toggle("is-active", ativa);
        aba.setAttribute("aria-selected", String(ativa));
      });
    }

    abas.forEach((aba) => {
      aba.addEventListener("click", () => {
        if (!Object.prototype.hasOwnProperty.call(paineis, aba.dataset.tab)) return;
        abaAtual = aba.dataset.tab;
        renderizar();
      });
    });

    renderizar();
  });
})();
