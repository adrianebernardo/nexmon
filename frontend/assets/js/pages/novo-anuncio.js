/* ============================================================
   NEXMON — pages/novo-anuncio.js
   ============================================================ */

(function () {
  "use strict";

  const { api, sessao, utils } = Nexmon;
  const { mostrarToast, irPara, rotas, carregarEstadosCidades } = utils;

  document.addEventListener("DOMContentLoaded", async () => {
    const usuario = sessao.exigirLogin("Faça login para publicar.");
    const form = document.getElementById("form-anuncio");
    if (!usuario) { form.querySelector('button[type="submit"]').disabled = true; return; }

    const ufSelect = document.getElementById("estado");
    const cidadeSelect = document.getElementById("cidade");
    const modalidadeSelect = document.getElementById("modalidade");
    const blocoCalendario = document.getElementById("bloco-calendario");
    const inputDataBloqueio = document.getElementById("data-bloqueio");
    const btnBloquear = document.getElementById("btn-bloquear-data");
    const listaDatas = document.getElementById("lista-datas-bloqueadas");
    let datasBloqueadasArray = [];

    // 1. Carregar Estados e Cidades (Etapa 2)
    try {
      const estados = await carregarEstadosCidades();
      estados.forEach(est => {
        const opt = document.createElement("option");
        opt.value = est.uf;
        opt.textContent = est.nome;
        ufSelect.appendChild(opt);
      });

      ufSelect.addEventListener("change", (e) => {
        const uf = e.target.value;
        cidadeSelect.innerHTML = '<option value="">Selecione...</option>';
        
        if (!uf) {
          cidadeSelect.disabled = true;
        } else {
          const estadoObj = estados.find(est => est.uf === uf);
          if (estadoObj) {
            estadoObj.cidades.forEach(cid => {
              const optCid = document.createElement("option");
              optCid.value = cid;
              optCid.textContent = cid;
              cidadeSelect.appendChild(optCid);
            });
          }
          cidadeSelect.disabled = false;
        }
      });
    } catch (_) { /* erro tratado no utils */ }

    // 2. Controle do Calendário (Etapa 4)
    modalidadeSelect.addEventListener("change", (e) => {
      const mod = e.target.value;
      blocoCalendario.hidden = !(mod === "aluguel" || mod === "emprestimo");
    });

    function atualizarListaDatas() {
      listaDatas.replaceChildren();
      datasBloqueadasArray.forEach(dataStr => {
        const tag = document.createElement("div");
        tag.className = "badge";
        tag.style.display = "inline-flex";
        tag.style.alignItems = "center";
        tag.style.gap = "8px";
        tag.style.margin = "4px";
        
        const [ano, mes, dia] = dataStr.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;
        
        tag.innerHTML = `${dataFormatada} <button type="button" style="color: var(--lilac); font-weight: bold;" data-data="${dataStr}">×</button>`;
        listaDatas.appendChild(tag);
      });

      listaDatas.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const dataParaRemover = e.target.dataset.data;
          datasBloqueadasArray = datasBloqueadasArray.filter(d => d !== dataParaRemover);
          atualizarListaDatas();
        });
      });
    }

    btnBloquear.addEventListener("click", () => {
      const data = inputDataBloqueio.value;
      if (!data) return mostrarToast("Selecione uma data válida.", "error");
      if (datasBloqueadasArray.includes(data)) return mostrarToast("Essa data já está bloqueada.", "error");
      
      datasBloqueadasArray.push(data);
      inputDataBloqueio.value = "";
      atualizarListaDatas();
    });

    // 3. Controle de Fotos
    const botao = form.querySelector('button[type="submit"]');
    const valor = (id) => document.getElementById(id).value;
    const campoFotos = document.getElementById("fotos");
    const previewFotos = document.getElementById("fotos-preview");
    const contadorFotos = document.getElementById("fotos-contador");
    const LIMITE_FOTOS = 5;
    const TAMANHO_MAXIMO = 5 * 1024 * 1024;
    const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
    let fotosSelecionadas = [];

    function atualizarPreviaFotos() {
      previewFotos.replaceChildren();
      contadorFotos.textContent = `${fotosSelecionadas.length}/${LIMITE_FOTOS} fotos`;

      fotosSelecionadas.forEach((arquivo, indice) => {
        const item = document.createElement("figure");
        item.className = "image-preview";

        const imagem = document.createElement("img");
        imagem.src = arquivo.url;
        imagem.alt = `Prévia da foto ${indice + 1}: ${arquivo.file.name}`;

        const legenda = document.createElement("figcaption");
        legenda.textContent = arquivo.file.name;
        legenda.title = arquivo.file.name;

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "image-preview__remove";
        remover.textContent = "×";
        remover.setAttribute("aria-label", `Remover ${arquivo.file.name}`);
        remover.addEventListener("click", () => {
          URL.revokeObjectURL(arquivo.url);
          fotosSelecionadas = fotosSelecionadas.filter((foto) => foto !== arquivo);
          atualizarPreviaFotos();
        });

        item.append(imagem, legenda, remover);
        previewFotos.appendChild(item);
      });

      campoFotos.disabled = fotosSelecionadas.length >= LIMITE_FOTOS;
    }

    campoFotos.addEventListener("change", () => {
      const arquivos = Array.from(campoFotos.files || []);
      let adicionadas = 0;

      for (const arquivo of arquivos) {
        if (fotosSelecionadas.length >= LIMITE_FOTOS) {
          mostrarToast(`Você pode adicionar no máximo ${LIMITE_FOTOS} fotos.`, "error");
          break;
        }
        if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
          mostrarToast("Formato inválido. Use JPG, PNG ou WEBP.", "error");
          continue;
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
          mostrarToast(`A foto ${arquivo.name} ultrapassa o limite de 5 MB.`, "error");
          continue;
        }
        const duplicada = fotosSelecionadas.some((foto) =>
          foto.file.name === arquivo.name && foto.file.size === arquivo.size && foto.file.lastModified === arquivo.lastModified
        );
        if (duplicada) continue;

        fotosSelecionadas.push({ file: arquivo, url: URL.createObjectURL(arquivo) });
        adicionadas++;
      }

      campoFotos.value = "";
      atualizarPreviaFotos();
      if (adicionadas > 0) mostrarToast(`${adicionadas} foto(s) adicionada(s) à prévia.`, "success");
    });

    window.addEventListener("beforeunload", () => {
      fotosSelecionadas.forEach((foto) => URL.revokeObjectURL(foto.url));
    });

    // 4. Envio do Formulário
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      botao.disabled = true;

      try {
        await api.criarAnuncio({
          titulo: valor("titulo"),
          descricao: valor("descricao"),
          categoria: valor("categoria"),
          modalidade: valor("modalidade"),
          estado: ufSelect.value,
          cidade: cidadeSelect.value,
          preco: valor("preco"),
          datas_bloqueadas: datasBloqueadasArray,
          min_dias: valor("min-dias"),
          max_dias: valor("max-dias")
        }, usuario, fotosSelecionadas); // Passa as fotos para a API

        mostrarToast("Anúncio publicado!", "success");
        form.reset();
        irPara(rotas.inicio, 1200);
      } catch (erro) {
        mostrarToast(erro instanceof api.ErroValidacao ? erro.message : "Não foi possível publicar agora.", "error");
        botao.disabled = false;
      }
    });
  });
})();