/* ============================================================
   NEXMON — components.js
   Componentes de interface reaproveitados em mais de uma tela.
   ============================================================ */

(function () {
  "use strict";

  const { utils } = Nexmon;
  const { criarElemento, rotas, formatarMoeda, rotuloModalidade } = utils;

  function criarCard(anuncio) {
    const href = `${rotas.pagina("anuncio-detalhes")}?id=${encodeURIComponent(anuncio.id)}`;

    return criarElemento("article", { classe: "card", atributos: { "aria-label": anuncio.titulo } }, [
      criarElemento("div", { classe: "card__media", texto: anuncio.titulo.charAt(0), atributos: { "aria-hidden": "true" } }),
      criarElemento("div", { classe: "card__body" }, [
        criarElemento("span", { classe: "badge", texto: rotuloModalidade(anuncio.modalidade) }),
        criarElemento("h3", { classe: "card__title", texto: anuncio.titulo, atributos: { title: anuncio.titulo } }),
        criarElemento("div", { classe: "card__meta" }, [
          criarElemento("span", { texto: anuncio.cidade }),
          criarElemento("span", { classe: "card__price", texto: formatarMoeda(anuncio.preco) })
        ]),
        criarElemento("a", { classe: "btn btn--secondary btn--block", texto: "Detalhes", atributos: { href } })
      ])
    ]);
  }

  Nexmon.componentes = { criarCard };
})();
