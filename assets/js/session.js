(function () {
  "use strict";

  const { utils, armazenamento } = Nexmon;
  const { rotas, criarElemento, mostrarToast, irPara } = utils;

  const CHAVE_SESSAO = "nexmon_sessao_v2";
  const DURACAO_MS = 2 * 60 * 60 * 1000; // 2 horas

  // ALTERAÇÃO: Adicionado 'nexmon_v2_anuncios' e 'nexmon_v2_reservas' para limpar os dados fictícios do navegador.
  const CHAVES_LEGADAS = ["nexmon_user_id", "nexmon_user_name", "nexmon_anuncios", "nexmon_v2_anuncios", "nexmon_v2_reservas"];

  function limparLegado() {
    CHAVES_LEGADAS.forEach((chave) => {
      armazenamento.local.remover(chave);
      armazenamento.sessao.remover(chave);
    });
  }

  function obter() {
    const s = armazenamento.sessao.ler(CHAVE_SESSAO, null);
    const valida = s && typeof s === "object"
      && Number.isSafeInteger(s.id) && s.id > 0
      && typeof s.nome === "string" && s.nome.length > 0 && s.nome.length <= 60
      && typeof s.expiraEm === "number" && s.expiraEm > Date.now();
    if (!valida) {
      if (s) armazenamento.sessao.remover(CHAVE_SESSAO);
      return null;
    }
    return { id: s.id, nome: s.nome, email: typeof s.email === "string" ? s.email : "" };
  }

  function iniciar(usuario) {
    armazenamento.sessao.gravar(CHAVE_SESSAO, {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      expiraEm: Date.now() + DURACAO_MS
    });
  }

  function encerrar() {
    armazenamento.sessao.remover(CHAVE_SESSAO);
  }

  // Para telas restritas: devolve o usuário ou redireciona para o login.
  function exigirLogin(mensagem) {
    const usuario = obter();
    if (!usuario) {
      mostrarToast(mensagem, "error");
      irPara(rotas.pagina("login"), 1500);
    }
    return usuario;
  }

  function atualizarNavbar() {
    const botao = document.getElementById("nav-login-btn");
    const links = document.getElementById("nav-links");
    if (!botao) return;

    const usuario = obter();
    if (!usuario) {
      botao.textContent = "Entrar";
      botao.href = rotas.pagina("login");
      return;
    }

    botao.textContent = "Sair";
    botao.title = `Sair (${usuario.nome})`;
    botao.href = rotas.inicio;
    botao.classList.add("btn--danger");
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      encerrar();
      mostrarToast("Você saiu do sistema.", "success");
      irPara(rotas.inicio, 800);
    });

    if (links) {
      [["Perfil", "perfil"], ["Solicitações", "solicitacoes"], ["Anunciar", "novo-anuncio"]].forEach(([texto, pagina]) => {
        links.appendChild(criarElemento("a", { classe: "navbar__link", texto, atributos: { href: rotas.pagina(pagina) } }));
      });
      links.hidden = false;
    }
  }

  Nexmon.sessao = { obter, iniciar, encerrar, exigirLogin };

  limparLegado();
  document.addEventListener("DOMContentLoaded", atualizarNavbar);
})();