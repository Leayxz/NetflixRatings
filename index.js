const API_KEY = "CHAVE_API"
let titulos_salvos = GM_getValue('titulos', {});

function main() {

      // VERIFICA SE A PAGINA ESTA EM PT
      const idioma_pagina = document.documentElement.lang;
      if (idioma_pagina != 'en') { alert('Reminder: Your Page Must Be In English For The Extension To Work'); return }

      escanear_modal();
}

main();

function escanear_modal() {
      // BUSCA PELOS MODAIS LOGADO E NÃO LOGADO
      const observador = new MutationObserver(async () => { const modal = document.querySelector("div.previewModal--container.has-smaller-buttons.detail-modal:not([data-processado])") || document.querySelector("div.default-ltr-iqcdef-cache-3q4ecs.egmghlc7:not([data-processado])")
            if (!modal) { return }

            modal.dataset.processado = "true";
            console.log("✅ Modal Detectado.");

            // ESCANEIA OS MODAIS
            const titulo = modal.querySelector("img.previewModal--boxart")?.alt || modal.querySelector("img.playerModel--player__storyArt.has-smaller-buttons.detail-modal")?.alt || modal.querySelector("img.default-ltr-iqcdef-cache-4xvo7r.egmghlc2")?.alt;
            if (!titulo) { console.log("❌ Título Não Encontrado"); return }

            const ano = modal.querySelector("div.year")?.textContent || modal.querySelectorAll("span.default-ltr-iqcdef-cache-wn0eok.eq5rlx81")[0]?.textContent;
            if (!ano) { console.log("❌ Ano Não Encontrado"); return }

            const elemento_tipo = modal.querySelector("span.duration") || modal.querySelector("ul.default-ltr-iqcdef-cache-h9ryza")
            let tipo = elemento_tipo?.textContent || elemento_tipo.querySelector("span.default-ltr-iqcdef-cache-wn0eok.eq5rlx81")[2]?.textContent;
            if (!tipo) { console.log("❌ Tipo Não Encontrado"); return }

            // VERIFICA SE É SERIE OU FILME, SE OS DADOS SAO VALIDOS, SALVA OS DADOS
            if (tipo.includes('Seasons') || tipo.includes('Episodes') || tipo.includes('Parts') || tipo.includes('Limited Series') || tipo.includes('Books')) { tipo = 'series' } else { tipo = 'movie' }
            if (!titulo || !ano || !tipo) { console.log("❌ Dados Incompletos Para Salvar."); return }

            // SALVA E BUSCA NOTA
            if (!titulos_salvos[titulo]) { titulos_salvos[titulo] = {ano: ano, tipo: tipo, nota: null}; await buscar_nota_omdb(titulo, ano, tipo) }

            console.log(`✅ Título: ${titulo} | Ano: ${ano} | Tipo: ${tipo} | Nota: ${titulos_salvos[titulo].nota}`);
            mostrar_nota(titulo, elemento_tipo)
            console.log("✅ Nota Inserida.")
      })

      observador.observe(document.body, { childList: true, subtree: true });
}


async function buscar_nota_omdb(titulo, ano, tipo) {

      // BUSCA NOTA OMDB
      let data_omdb = await (await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${titulo}&y=${ano}&type=${tipo}`)).json();
      if (data_omdb.Response == "False" || data_omdb.imdbRating == 'N/A') { data_omdb = await (await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${titulo}&type=${tipo}`)).json() }

      // INSERE NOTA
      if (data_omdb.Response == 'False') { titulos_salvos[titulo].nota = 'N/A' } else { titulos_salvos[titulo].nota = data_omdb.imdbRating }

      GM_setValue('titulos', titulos_salvos);
      console.log("✅ Nota Salva.")
}


function mostrar_nota(titulo, elemento) {

      // BUSCA NOTA
      const nota = titulos_salvos[titulo].nota;
      if (!nota) { console.log("❌ Nota Não Salva"); return }

      // EVITA DUPLICATA
      if (elemento.nextElementSibling?.classList.contains('nota-imdb')) { console.log("❌ Nota Já Inserida"); return }

      // CRIA E INSERE O SPAN COM NOTA
      const span = document.createElement('span');
      span.classList.add('nota-imdb');
      span.textContent = `⭐ ${nota}`
      span.style.color = 'rgb(255, 255, 255)';
      elemento.insertAdjacentElement('afterend', span)
}
