/* ============================================================
   NEXMON — pages/perfil.js
   ============================================================ */

(function () {
  "use strict";

  const { api, sessao, componentes, utils } = Nexmon;
  const { criarElemento, mostrarToast } = utils;

  function criarSelo(selo) {
    const icone = criarElemento("div", { classe: "badge-item__icon" });
    if (selo.imagem) {
      icone.appendChild(criarElemento("img", { atributos: { src: selo.imagem, alt: selo.nome, width: "96", height: "96" } }));
    } else {
      icone.textContent = "🏅";
    }
    return criarElemento("div", { classe: "badge-item" }, [
      icone,
      criarElemento("div", { classe: "badge-item__name", texto: selo.nome }),
      criarElemento("div", { classe: "badge-item__desc", texto: selo.descricao })
    ]);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const usuario = sessao.exigirLogin("Faça login para acessar o perfil.");
    if (!usuario) return;

    document.getElementById("profile-name").textContent = usuario.nome;
    document.getElementById("profile-role").textContent = "MEMBRO DA GUILDA";

    try {
      const [selos, anuncios] = await Promise.all([api.listarSelos(usuario), api.listarAnuncios()]);

      const areaSelos = document.getElementById("profile-badges");
      areaSelos.replaceChildren();
      if (selos.length === 0) {
        areaSelos.appendChild(criarElemento("p", { classe: "muted empty-note", texto: "Nenhuma insígnia conquistada ainda." }));
      } else {
        selos.forEach((s) => areaSelos.appendChild(criarSelo(s)));
      }

      const areaAnuncios = document.getElementById("my-products-grid");
      areaAnuncios.replaceChildren();
      const meus = anuncios.filter((a) => a.id_usuario_proprietario === usuario.id);
      if (meus.length === 0) {
        areaAnuncios.appendChild(criarElemento("p", { classe: "muted empty-note empty-note--wide", texto: "Você ainda não publicou nenhum anúncio." }));
      } else {
        meus.forEach((a) => areaAnuncios.appendChild(componentes.criarCard(a)));
      }
    } catch (_) {
      mostrarToast("Não foi possível carregar o perfil.", "error");
    }
  });
})();
