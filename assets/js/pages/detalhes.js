/* ============================================================
   NEXMON — pages/detalhes.js
   ============================================================ */

(function () {
  "use strict";

  const { api, sessao, constantes, utils } = Nexmon;
  const {
    mostrarToast, irPara, rotas, formatarMoeda, hojeISO, calcularDias, calcularTotal,
    modalidadeUsaDatas, rotuloModalidade
  } = utils;

  const TEXTOS_POR_MODALIDADE = {
    aluguel: { caixa: "Simulador de Reserva", botao: "Solicitar Reserva", preco: "Diária" },
    emprestimo: { caixa: "Simulador de Reserva", botao: "Solicitar Empréstimo", preco: "Diária" },
    venda: { caixa: "Compra", botao: "Solicitar Compra", preco: "Preço" },
    servico: { caixa: "Contratação", botao: "Solicitar Serviço", preco: "Preço" }
  };

  const $ = (id) => document.getElementById(id);

  function lerIdDaUrl() {
    const bruto = new URLSearchParams(window.location.search).get("id");
    return bruto && /^\d{1,9}$/.test(bruto) ? Number(bruto) : null;
  }

  function mostrarNaoEncontrado() {
    $("detalhes-conteudo").hidden = true;
    $("detalhes-vazio").hidden = false;
    document.title = "Anúncio não encontrado — Nexmon";
  }

  function preencherAnuncio(anuncio) {
    const textos = TEXTOS_POR_MODALIDADE[anuncio.modalidade];

    document.title = `${anuncio.titulo} — Nexmon`;
    $("breadcrumb-categoria").textContent = constantes.CATEGORIAS[anuncio.categoria];
    $("breadcrumb-titulo").textContent = anuncio.titulo;
    $("anuncio-modalidade").textContent = rotuloModalidade(anuncio.modalidade);
    $("anuncio-titulo").textContent = anuncio.titulo;
    // Aqui exibe a cidade e o estado juntos
    $("anuncio-cidade").textContent = `${anuncio.cidade} - ${anuncio.estado}`;
    $("vendedor-nome").textContent = anuncio.vendedor;
    $("anuncio-descricao").textContent = anuncio.descricao || "O anunciante não adicionou uma descrição.";
    $("booking-titulo").textContent = textos.caixa;
    $("preco-rotulo").textContent = textos.preco;
    $("preco-unitario").textContent = formatarMoeda(anuncio.preco);
    $("btn-reservar").textContent = textos.botao;
    $("gallery-inicial").textContent = anuncio.titulo.charAt(0);
  }

  function ligarReserva(anuncio) {
    const inicio = $("data-inicio");
    const fim = $("data-fim");
    const botao = $("btn-reservar");
    const usaDatas = modalidadeUsaDatas(anuncio.modalidade);

    $("booking-datas").hidden = !usaDatas;
    $("dias-wrapper").hidden = !usaDatas;
    inicio.min = fim.min = hojeISO();

    const datasBloqueadas = anuncio.datas_bloqueadas || [];
    
    function checarDisponibilidade(inicioStr, fimStr, dias) {
      if (!usaDatas || dias === 0) return true;
      
      if (dias < (anuncio.min_dias || 1)) {
        mostrarToast(`O período mínimo de locação é ${anuncio.min_dias || 1} dia(s).`, "error");
        return false;
      }
      if (dias > (anuncio.max_dias || 30)) {
        mostrarToast(`O período máximo de locação é ${anuncio.max_dias || 30} dias.`, "error");
        return false;
      }

      let atual = new Date(inicioStr);
      const final = new Date(fimStr);
      
      while (atual <= final) {
        const ano = atual.getFullYear();
        const mes = String(atual.getMonth() + 1).padStart(2, '0');
        const dia = String(atual.getDate()).padStart(2, '0');
        const dataISO = `${ano}-${mes}-${dia}`;
        
        if (datasBloqueadas.includes(dataISO)) {
          mostrarToast(`A data ${dia}/${mes}/${ano} já está reservada ou bloqueada.`, "error");
          return false;
        }
        atual.setDate(atual.getDate() + 1);
      }
      return true;
    }

    function atualizarTotal() {
      const dias = usaDatas ? calcularDias(inicio.value, fim.value) : 1;
      $("dias-total").textContent = String(dias);
      $("valor-total").textContent = formatarMoeda(dias > 0 ? calcularTotal(anuncio, dias) : 0);
      
      if (usaDatas && dias > 0) {
        const disponivel = checarDisponibilidade(inicio.value, fim.value, dias);
        botao.disabled = !disponivel;
        botao.textContent = disponivel ? TEXTOS_POR_MODALIDADE[anuncio.modalidade].botao : "Indisponível";
      }
    }

    inicio.addEventListener("change", () => {
      fim.min = inicio.value || hojeISO();
      if (fim.value && fim.value < inicio.value) fim.value = "";
      atualizarTotal();
    });
    fim.addEventListener("change", () => {
      if (inicio.value && fim.value < inicio.value) {
        mostrarToast("A data final não pode ser anterior à inicial.", "error");
        fim.value = "";
      }
      atualizarTotal();
    });

    botao.addEventListener("click", async () => {
      const usuario = sessao.exigirLogin("Faça login para continuar.");
      if (!usuario) return;

      if (usaDatas && !checarDisponibilidade(inicio.value, fim.value, calcularDias(inicio.value, fim.value))) {
        return; 
      }

      botao.disabled = true;
      try {
        await api.criarReserva({ id_anuncio: anuncio.id, data_inicio: inicio.value, data_fim: fim.value }, usuario);
        mostrarToast("Solicitação enviada! Aguarde a resposta do anunciante.", "success");
        irPara(`${rotas.pagina("solicitacoes")}#enviadas`, 1200);
      } catch (erro) {
        mostrarToast(erro instanceof api.ErroValidacao ? erro.message : "Não foi possível enviar agora.", "error");
        botao.disabled = false;
      }
    });

    atualizarTotal();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const id = lerIdDaUrl();
    let anuncio = null;
    try { anuncio = id ? await api.obterAnuncio(id) : null; } catch (_) { /* tratado abaixo */ }

    if (!anuncio) { mostrarNaoEncontrado(); return; }
    preencherAnuncio(anuncio);
    ligarReserva(anuncio);
  });
})();