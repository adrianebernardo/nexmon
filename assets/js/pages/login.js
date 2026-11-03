/* ============================================================
   NEXMON — pages/login.js
   ============================================================ */

(function () {
  "use strict";

  const { api, sessao, utils } = Nexmon;
  const { mostrarToast, irPara, rotas } = utils;

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login");
    const abas = document.querySelectorAll(".tabs__btn");
    const camposLogin = document.getElementById("campos-login");
    const camposCadastro = document.getElementById("campos-cadastro");
    const btnSubmit = document.getElementById("btn-submit");
    const avisoModo = document.getElementById("aviso-modo");
    let modoAtual = "login";

    // Lógica das Abas
    abas.forEach(aba => {
      aba.addEventListener("click", () => {
        abas.forEach(a => { a.classList.remove("is-active"); a.setAttribute("aria-selected", "false"); });
        aba.classList.add("is-active");
        aba.setAttribute("aria-selected", "true");
        
        modoAtual = aba.dataset.tab;
        if (modoAtual === "login") {
          camposLogin.hidden = false;
          camposCadastro.hidden = true;
          btnSubmit.textContent = "Entrar no Sistema";
          avisoModo.hidden = false;
          document.querySelectorAll("#campos-cadastro input").forEach(i => i.required = false);
          document.querySelectorAll("#campos-login input").forEach(i => i.required = true);
        } else {
          camposLogin.hidden = true;
          camposCadastro.hidden = false;
          btnSubmit.textContent = "Criar Conta";
          avisoModo.hidden = true;
          document.querySelectorAll("#campos-login input").forEach(i => i.required = false);
          document.querySelectorAll("#campos-cadastro input").forEach(i => i.required = true);
        }
      });
    });

    // Submit do Formulário
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      btnSubmit.disabled = true;

      try {
        if (modoAtual === "login") {
          const usuario = await api.entrar(document.getElementById("email").value, document.getElementById("senha").value);
          sessao.iniciar(usuario);
          mostrarToast("Acesso concedido!", "success");
          irPara(rotas.inicio, 800);
        } else {
          const nome = document.getElementById("nome").value;
          const email = document.getElementById("email-cadastro").value;
          const senha = document.getElementById("senha-cadastro").value;
          const confirmacao = document.getElementById("senha-confirmacao").value;

          if (senha !== confirmacao) {
            throw new api.ErroValidacao("As senhas não coincidem.");
          }

          // Verifica se a função cadastrar existe na API
          if (typeof api.cadastrar !== "function") {
            throw new Error("A função de cadastro não foi encontrada no api.js. Verifique se o arquivo foi atualizado.");
          }

          const usuario = await api.cadastrar(nome, email, senha);
          sessao.iniciar(usuario);
          mostrarToast("Conta criada com sucesso! Bem-vindo à Guilda.", "success");
          irPara(rotas.inicio, 1000);
        }
      } catch (erro) {
        console.error("Erro no login/cadastro:", erro);
        mostrarToast(erro instanceof api.ErroValidacao ? erro.message : (erro.message || "Ocorreu um erro. Tente novamente."), "error");
        btnSubmit.disabled = false;
      }
    });
  });
})();