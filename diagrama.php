<div class="card shadow-none border-0 rounded-0 bg-black galaxiaDiagramaMaster w-full">
  <style>
    .fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      /* ou qualquer cor de fundo que você preferir */
    }

    .node-badge {
      position: absolute;
      top: -8px;
      left: -8px;
      background-color: #4f46e5;
      /* cor roxa */
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      z-index: 10;
      pointer-events: none;
    }

    .selection-box {
      position: absolute;
      border: 1px dashed #3399ff;
      background: rgba(0, 153, 255, 0.1);
      pointer-events: none;
      z-index: 999;
    }

    .selected-node {
      border: 2px solid #00bfff !important;
      box-shadow: 0 0 10px #00bfff;
    }

    /* --- Tech Node Styling - GALAXY THEME - COMPACT VERSION --- */
    :root {
      /* ... Suas outras variáveis de cor ... */


      /* Cores para o fundo do #drawflow (Azul Escuro com Roxo Bem Dark) */
      --df-deep-space-tint: #02030A;
      /* Base bem escura, quase preta com leve tom azulado */
      --df-dark-nebula-purple: #180A22;
      /* Roxo nebulosa bem escuro */
      --df-midnight-indigo: #0C081A;
      /* Índigo escuro para transição suave entre azul e roxo */

      /* Cores para as estrelas (com variações de brilho/opacidade para profundidade) */
      --star-color-faint: rgba(180, 200, 230, 0.15);
      /* Estrelas muito distantes/fracas, quase transparentes */
      --star-color-dim: rgba(200, 215, 240, 0.3);
      /* Estrelas um pouco mais visíveis, brilho fraco */
      --star-color-medium: rgba(210, 225, 250, 0.5);
      /* Estrelas de brilho médio */
      --star-color-bright: rgba(225, 235, 255, 0.7);
      /* Estrelas mais brilhantes */
      --star-color-very-bright: rgba(240, 250, 255, 0.85);
      /* Estrelas mais próximas/super brilhantes */



      /* Fontes e cores base (mantidas do tema galáxia) */
      --node-font-family: 'Segoe UI',
        Tahoma,
        Geneva,
        Verdana,
        sans-serif;
      --node-description-color: #bac8ff;
      --node-id-color: #8c9abd;

      /* Variáveis do Tema Galáxia (mantidas) */
      --galaxy-deep-space-blue: #0b1021;
      --galaxy-nebula-purple: #3c1e59;
      --galaxy-star-glow: #f0f8ff;
      --galaxy-accent-cyan: #00ffff;
      --galaxy-accent-pink: #ff79c6;
      --galaxy-border-glow-soft: rgba(0, 255, 255, 0.4);
      /* Um pouco menos intenso para versão compacta */

      /* Mapeando para as variáveis estruturais (mantidas) */
      --node-bg-color: linear-gradient(145deg, var(--galaxy-deep-space-blue) 0%, var(--galaxy-nebula-purple) 70%, var(--galaxy-deep-space-blue) 100%);
      --node-text-color: var(--galaxy-star-glow);
      --node-border-color: var(--galaxy-deep-space-blue);
      --node-accent-color: var(--galaxy-accent-pink);
      --node-accent-hover-color: #ff55b8;

      --node-success-color: #3eff8a;
      --node-warning-color: #fce300;
      --node-error-color: #ff4c65;

      --node-collapsible-bg: rgba(11, 16, 33, 0.5);
      /* Um pouco menos opaco */
      --node-edit-bg-color: #1c2a45;
    }

    #drawflow {
      /* Gradiente de fundo base (Azul Escuro com Roxo Bem Dark) */
      --df-bg-gradient-deep-purple: linear-gradient(165deg,
          /* Ângulo do gradiente */
          var(--df-deep-space-tint) 0%,
          var(--df-midnight-indigo) 35%,
          var(--df-dark-nebula-purple) 65%,
          var(--df-midnight-indigo) 85%,
          var(--df-deep-space-tint) 100%);

      /* Múltiplas camadas de estrelas para profundidade e densidade */
      background-image:
        /* Camada 1: Poeira estelar muito fraca (mais densa) */
        radial-gradient(0.5px 0.5px at 15% 25%, var(--star-color-faint), transparent),
        radial-gradient(0.5px 0.5px at 85% 35%, var(--star-color-faint), transparent),
        radial-gradient(0.6px 0.6px at 50% 65%, var(--star-color-faint), transparent),
        radial-gradient(0.5px 0.5px at 30% 80%, var(--star-color-faint), transparent),
        radial-gradient(0.6px 0.6px at 70% 90%, var(--star-color-faint), transparent),

        /* Camada 2: Estrelas pequenas com brilho fraco */
        radial-gradient(0.8px 0.8px at 10% 10%, var(--star-color-dim), transparent),
        radial-gradient(1px 1px at 75% 20%, var(--star-color-dim), transparent),
        radial-gradient(0.8px 0.8px at 40% 50%, var(--star-color-dim), transparent),
        radial-gradient(1px 1px at 90% 70%, var(--star-color-dim), transparent),
        radial-gradient(0.9px 0.9px at 20% 95%, var(--star-color-dim), transparent),

        /* Camada 3: Estrelas de brilho médio */
        radial-gradient(1.2px 1.2px at 5% 55%, var(--star-color-medium), transparent),
        radial-gradient(1px 1px at 55% 5%, var(--star-color-medium), transparent),
        radial-gradient(1.3px 1.3px at 30% 35%, var(--star-color-medium), transparent),
        radial-gradient(1.1px 1.1px at 80% 50%, var(--star-color-medium), transparent),
        radial-gradient(1.2px 1.2px at 60% 80%, var(--star-color-medium), transparent),

        /* Camada 4: Estrelas brilhantes */
        radial-gradient(1.5px 1.5px at 20% 70%, var(--star-color-bright), transparent),
        radial-gradient(1.6px 1.6px at 95% 5%, var(--star-color-bright), transparent),
        /* Estrela mais isolada e brilhante */
        radial-gradient(1.4px 1.4px at 45% 20%, var(--star-color-bright), transparent),
        radial-gradient(1.5px 1.5px at 70% 60%, var(--star-color-bright), transparent),

        /* Camada 5: Estrelas muito brilhantes (mais raras) */
        radial-gradient(2px 2px at 10% 90%, var(--star-color-very-bright), transparent),
        radial-gradient(1.8px 1.8px at 85% 80%, var(--star-color-very-bright), transparent),
        radial-gradient(2.2px 2.2px at 50% 30%, var(--star-color-very-bright), transparent),
        /* Uma estrela bem destacada */

        /* Gradiente base aplicado por último */
        var(--df-bg-gradient-deep-purple) !important;

      /* Para garantir que todos os "tiles" de estrelas se repitam */
      background-repeat: repeat !important;

      /* Ajuste os tamanhos dos tiles para controlar a densidade e o padrão de repetição das estrelas */
      background-size:
        /* Camada 1 (poeira) - tiles menores para maior densidade aparente */
        30px 30px, 40px 40px, 35px 35px, 45px 45px, 50px 50px,
        /* Camada 2 - tiles um pouco maiores */
        90px 90px, 80px 80px, 100px 100px, 70px 70px, 85px 85px,
        /* Camada 3 */
        150px 150px, 130px 130px, 160px 160px, 120px 120px, 140px 140px,
        /* Camada 4 */
        250px 250px, 200px 200px, 220px 220px, 280px 280px,
        /* Camada 5 (estrelas brilhantes mais raras - tiles maiores) */
        350px 350px, 400px 400px, 300px 300px,
        /* Tamanho para o gradiente de fundo */
        auto !important;

      /* Outras propriedades existentes do #drawflow (mantenha as suas) */
      /* height: calc(100vh - 90px); */
      /* width: 85vw; */
      color: white !important;
      /* Para contraste de texto, se houver */
      /* Recomendado para o container */
    }

    .tech-node {
      font-family: var(--node-font-family);
      background: var(--node-bg-color);
      color: var(--node-text-color);
      border: 1px solid var(--node-border-color);
      border-radius: 8px;
      /* COMPACT: Raio da borda ligeiramente reduzido */
      box-shadow:
        0 0 8px rgba(0, 0, 0, 0.3),
        /* COMPACT: Sombra base um pouco menor */
        0 0 12px var(--galaxy-border-glow-soft),
        /* COMPACT: Brilho um pouco menor */
        inset 0 0 8px rgba(11, 16, 33, 0.4);
      /* COMPACT: Sombra interna menor */
      margin: 10px;
      /* COMPACT: Margem externa reduzida */
      padding: 12px;
      /* COMPACT: Preenchimento interno reduzido */
      max-width: 380px;
      /* COMPACT: Largura máxima opcionalmente reduzida */
      display: flex;
      flex-direction: column;
      gap: 8px;
      /* COMPACT: Espaço entre seções reduzido */
      transition: box-shadow 0.4s ease, transform 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .tech-node:hover {
      box-shadow:
        0 0 12px rgba(0, 0, 0, 0.4),
        0 0 20px var(--galaxy-border-glow-soft),
        inset 0 0 10px rgba(11, 16, 33, 0.5);
      transform: translateY(-2px) scale(1.01);
    }

    /* Ícone Flutuante de Galáxia/Estrela */
    .tech-node::before {
      content: '✧';
      font-size: 1.5em;
      /* COMPACT: Tamanho do ícone flutuante reduzido */
      font-weight: bold;
      color: var(--galaxy-accent-cyan);
      position: absolute;
      top: 8px;
      /* COMPACT: Posição ajustada */
      right: 10px;
      /* COMPACT: Posição ajustada */
      opacity: 0.6;
      text-shadow: 0 0 5px var(--galaxy-accent-cyan), 0 0 10px var(--galaxy-accent-cyan), 0 0 2px #fff;
      animation: celestialFloat 5s infinite ease-in-out;
      z-index: 0;
    }

    @keyframes celestialFloat {

      0%,
      100% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 0.6;
      }

      50% {
        transform: translateY(-3px) rotate(10deg) scale(1.05);
        /* Animação um pouco mais sutil */
        opacity: 0.8;
      }
    }

    /* Header */
    .node-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(0, 255, 255, 0.15);
      /* COMPACT: Divisória mais sutil */
      padding-bottom: 8px;
      /* COMPACT: Preenchimento inferior reduzido */
      position: relative;
      z-index: 1;
    }

    .node-title-area .node-name {
      margin: 0 0 3px 0;
      /* COMPACT: Margem inferior reduzida */
      font-size: 1.1em;
      /* COMPACT: Tamanho da fonte do nome reduzido */
      font-weight: 600;
      color: var(--node-text-color);
      text-shadow: 0 0 4px rgba(255, 255, 255, 0.25);
    }

    .node-title-area .node-id {
      font-size: 0.75em;
      /* COMPACT: Tamanho da fonte do ID reduzido */
      color: var(--node-id-color);
      display: block;
    }

    .node-status-icons {
      display: flex;
      gap: 5px;
      /* COMPACT: Espaço entre ícones de status reduzido */
      padding-top: 3px;
      /* COMPACT: Ajuste no padding superior */
      position: relative;
      z-index: 1;
    }

    .status-icon {
      width: 10px;
      /* COMPACT: Tamanho dos ícones de status reduzido */
      height: 10px;
      /* COMPACT: Tamanho dos ícones de status reduzido */
      border-radius: 50%;
      display: inline-block;
      cursor: default;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 5px currentColor;
    }

    .status-icon.s-icon-success {
      background-color: var(--node-success-color);
    }

    .status-icon.s-icon-warning {
      background-color: var(--node-warning-color);
    }

    .status-icon.s-icon-error {
      background-color: var(--node-error-color);
    }


    /* Body */
    .node-body .node-description-wrapper {
      margin-bottom: 10px;
      /* COMPACT: Margem inferior reduzida */
    }

    .node-body .node-description-text {
      font-size: 0.9em;
      /* COMPACT: Tamanho da fonte da descrição reduzido */
      line-height: 1.45;
      /* COMPACT: Altura da linha ajustada */
      color: var(--node-description-color);
      padding: 4px;
      /* COMPACT: Preenchimento reduzido */
      border-radius: 3px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      min-height: 1.45em;
    }

    .node-body .node-description-text:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }

    .node-body .no-description {
      font-style: italic;
      color: var(--node-id-color);
      opacity: 0.7;
      /* Um pouco mais sutil */
    }

    .node-description-edit {
      width: 100%;
      padding: 6px;
      /* COMPACT: Preenchimento reduzido */
      border: 1px solid var(--galaxy-accent-pink);
      border-radius: 4px;
      background-color: var(--node-edit-bg-color);
      color: var(--node-text-color);
      font-family: var(--node-font-family);
      font-size: 0.9em;
      /* COMPACT: Tamanho da fonte da descrição reduzido */
      line-height: 1.45;
      /* COMPACT: Altura da linha ajustada */
      box-sizing: border-box;
      resize: vertical;
      min-height: 60px;
      /* COMPACT: Altura mínima reduzida */
      margin-top: -1px;
    }

    .node-details-toggle {
      margin-bottom: 8px;
      /* COMPACT: Margem inferior reduzida */
    }

    .toggle-button {
      background-color: transparent;
      color: var(--galaxy-accent-pink);
      border: 1px solid var(--galaxy-accent-pink);
      border-radius: 18px;
      /* COMPACT: Raio da borda ajustado */
      padding: 6px 12px;
      /* COMPACT: Preenchimento reduzido */
      cursor: pointer;
      font-size: 0.8em;
      /* COMPACT: Tamanho da fonte reduzido */
      font-weight: 600;
      transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      /* COMPACT: Espaço interno do botão reduzido */
      text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
    }

    .toggle-button:hover {
      background-color: var(--node-accent-hover-color);
      border-color: var(--node-accent-hover-color);
      color: var(--node-text-color);
      box-shadow: 0 0 7px var(--node-accent-hover-color);
    }

    .toggle-button .toggle-icon {
      font-size: 0.75em;
      /* COMPACT: Tamanho do ícone de toggle reduzido */
      transition: transform 0.3s ease-out;
    }

    .toggle-button[aria-expanded="true"] .toggle-icon {
      transform: rotate(180deg);
    }

    .node-collapsible-section {
      background-color: var(--node-collapsible-bg);
      border-radius: 4px;
      padding: 0 12px;
      /* COMPACT: Preenchimento horizontal (quando expandido) reduzido */
      margin-top: 4px;
      /* COMPACT: Margem superior reduzida */
      border: 1px dashed rgba(0, 255, 255, 0.15);
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
        padding 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
        opacity 0.3s ease-out 0.1s,
        border-color 0.4s ease;
    }

    .node-collapsible-section.expanded {
      max-height: 550px;
      /* COMPACT: Altura máxima pode ser ajustada se necessário */
      opacity: 1;
      padding: 12px;
      /* COMPACT: Preenchimento (quando expandido) reduzido */
      border-color: rgba(0, 255, 255, 0.3);
    }

    .node-collapsible-section h4 {
      margin-top: 0;
      margin-bottom: 8px;
      /* COMPACT: Margem inferior reduzida */
      color: var(--galaxy-accent-cyan);
      font-size: 0.95em;
      /* COMPACT: Tamanho da fonte reduzido */
      text-shadow: 0 0 3px var(--galaxy-accent-cyan);
    }

    .node-collapsible-section ul {
      list-style: none;
      padding-left: 0;
      font-size: 0.85em;
      /* COMPACT: Tamanho da fonte reduzido */
      color: var(--node-description-color);
    }

    .node-collapsible-section ul li {
      margin-bottom: 5px;
      /* COMPACT: Margem inferior reduzida */
      padding-left: 16px;
      /* COMPACT: Preenchimento para marcador ajustado */
      position: relative;
    }

    .node-collapsible-section ul li::before {
      content: '★';
      color: var(--galaxy-accent-pink);
      font-size: 0.75em;
      /* COMPACT: Tamanho do marcador reduzido */
      position: absolute;
      left: 0;
      top: 1px;
      /* Ajuste vertical */
      text-shadow: 0 0 2px var(--galaxy-accent-pink);
    }

    /* Footer */
    .node-footer {
      border-top: 1px solid rgba(0, 255, 255, 0.15);
      padding-top: 8px;
      /* COMPACT: Preenchimento superior reduzido */
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .node-action-buttons {
      display: flex;
      gap: 8px;
      /* COMPACT: Espaço entre botões de ação reduzido */
    }

    .action-btn {
      background: transparent;
      border: none;
      color: var(--node-id-color);
      font-size: 1.2em;
      /* COMPACT: Tamanho do ícone de ação reduzido */
      padding: 4px;
      /* COMPACT: Preenchimento interno do botão ajustado */
      cursor: pointer;
      border-radius: 50%;
      width: 28px;
      /* COMPACT: Tamanho do botão de ação reduzido */
      height: 28px;
      /* COMPACT: Tamanho do botão de ação reduzido */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: color 0.2s ease, background-color 0.2s ease, text-shadow 0.2s ease;
    }

    .action-btn:hover {
      color: var(--galaxy-accent-cyan);
      background-color: rgba(0, 255, 255, 0.08);
      /* Fundo hover mais sutil */
      text-shadow: 0 0 4px var(--galaxy-accent-cyan);
    }

    /* Estilos para a Palette Sidebar (Barra Lateral Esquerda) */
    /* Selecionando o container da sidebar pelas classes e estilos inline que você forneceu */
    div[style*="width:12vw"][style*="background-color: #051c32"] {
      background: linear-gradient(180deg, #041220, #061c32 30%, #051c32 70%, #041220 100%) !important;
      /* Gradiente Tech, !important para sobrescrever inline se necessário */
      border-right: 1px solid rgba(0, 255, 255, 0.1);
      box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      text-align: left !important;
      /* Sobrescreve o text-center para o conteúdo da lista */
    }

    /* Estilo para o campo de pesquisa que será injetado */
    #palette-search-input-injected {
      width: calc(100% - 20px);
      /* Considera padding do container pai */
      margin: 10px;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #0a2f4d;
      background-color: #07233b;
      color: #e0e8ff;
      font-size: 0.9em;
      box-sizing: border-box;
      outline: none;
    }

    #palette-search-input-injected::placeholder {
      color: #7a8ba8;
    }

    #palette-search-input-injected:focus {
      border-color: var(--galaxy-accent-cyan, #00ffff);
      box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
    }

    /* Estilo do container de scroll */
    .scroll-container {
      padding: 0 8px 8px 8px;
      flex-grow: 1;
      /* Faz o container de scroll ocupar o espaço restante */
    }

    /* Estilo de cada item arrastável na paleta */
    .drag-drawflow {
      /* Usando a classe original do seu HTML */
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 6px;
      margin-bottom: 8px;
      padding: 8px 5px 5px 5px;
      /* Padding ajustado para ícone de favorito */
      cursor: grab;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      position: relative;
      /* Para posicionar o ícone de favorito injetado */
      width: 100% !important;
      /* Mantém o estilo inline, mas garante que CSS possa controlar */
      box-sizing: border-box;
    }

    .drag-drawflow:hover {
      background-color: rgba(255, 255, 255, 0.06);
      border-color: rgba(0, 255, 255, 0.2);
    }

    .drag-drawflow.is-dragging-palette-item {
      opacity: 0.5;
    }

    .drag-drawflow.hidden-by-search {
      display: none !important;
    }

    /* Estilo para o ícone de favorito injetado */
    .injected-favorite-toggle {
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 1.2em;
      /* Tamanho do ícone de estrela */
      color: #7a8ba8;
      /* Cor da estrela vazia */
      cursor: pointer;
      padding: 2px;
      line-height: 1;
      transition: color 0.2s ease, transform 0.2s ease;
      z-index: 10;
      /* Para ficar sobre o conteúdo do nó */
    }

    .injected-favorite-toggle:hover {
      color: var(--galaxy-accent-pink, #ff79c6);
      transform: scale(1.2);
    }

    .drag-drawflow.is-favorite .injected-favorite-toggle {
      color: var(--galaxy-accent-pink, #ff79c6);
      /* Cor da estrela cheia (★) */
    }


    /* Estilos para compactar o .tech-node DENTRO da paleta */
    /* Ajuste o seletor se <?= $elemento['node']; ?> renderizar algo diferente de .tech-node */
    .drag-drawflow .tech-node {
      padding: 6px !important;
      margin: 0 !important;
      margin-top: 5px;
      /* Espaço abaixo do ícone de favorito */
      border-width: 1px !important;
      border-radius: 4px !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 3px var(--galaxy-border-glow-soft, rgba(0, 255, 255, 0.3)) !important;
      transform: scale(0.9);
      /* Escala para compactar */
      transform-origin: top left;
      /* Origem da escala */
      width: auto !important;
      /* Ajusta a largura */
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .drag-drawflow .tech-node:hover {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 3px var(--galaxy-border-glow-soft, rgba(0, 255, 255, 0.3)) !important;
      transform: scale(0.9) !important;
      /* Mantém a escala no hover */
    }

    .drag-drawflow .tech-node .node-name {
      font-size: 0.8em !important;
      margin-bottom: 2px !important;
    }

    .drag-drawflow .tech-node .node-id {
      font-size: 0.65em !important;
    }

    /* Esconde seções desnecessárias do nó na paleta */
    .drag-drawflow .tech-node .node-description,
    .drag-drawflow .tech-node .node-details-toggle,
    .drag-drawflow .tech-node .node-collapsible-section,
    .drag-drawflow .tech-node .node-footer,
    .drag-drawflow .tech-node .node-body>*:not(.node-description-wrapper):not(.node-details-toggle) {
      display: none !important;
    }

    .drag-drawflow .tech-node .node-header {
      padding-bottom: 4px !important;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
    }

    .drag-drawflow .tech-node .node-status-icons {
      gap: 2px !important;
    }

    .drag-drawflow .tech-node .status-icon {
      width: 6px !important;
      height: 6px !important;
      border: none !important;
      box-shadow: 0 0 2px currentColor !important;
    }

    .drag-drawflow .tech-node::before {
      /* Ícone flutuante de galáxia no nó da paleta */
      font-size: 0.8em !important;
      top: 3px !important;
      right: 3px !important;
      opacity: 0.5 !important;
      animation: none !important;
      text-shadow: 0 0 3px currentColor !important;
    }

    /* Estilo do Scrollbar (WebKit e Firefox) */
    .scroll-container::-webkit-scrollbar {
      width: 8px;
    }

    .scroll-container::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    .scroll-container::-webkit-scrollbar-thumb {
      background-color: var(--galaxy-accent-cyan, #00ffff);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }

    .scroll-container::-webkit-scrollbar-thumb:hover {
      background-color: var(--galaxy-accent-pink, #ff79c6);
    }

    .scroll-container {
      scrollbar-width: thin;
      scrollbar-color: var(--galaxy-accent-cyan, #00ffff) rgba(0, 0, 0, 0.2);
    }

    .drawflow .drawflow-node .input.input-focused {
      border: 3px solid #00ccff;
      /* Ciano para destaque */
      box-shadow: 0 0 10px #00ccff;
      background-color: #d4f0f7;
      /* Fundo levemente azulado */
    }

    .drawflow .drawflow-node .output.output-focused {
      border: 3px solid #ffcc00;
      /* Amarelo para destaque */
      box-shadow: 0 0 10px #ffcc00;
      background-color: #fff3cd;
      /* Um fundo levemente amarelado */
    }

    .sidebar-footer-actions {
      padding: 8px 5px;
      text-align: center;
      border-top: 1px solid rgba(0, 255, 255, 0.15);
      background-color: #041220;
      /* Cor de fundo consistente com a sidebar */
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }

    .footer-action-btn {
      background: transparent;
      border: 1px solid var(--galaxy-accent-cyan, #00ffff);
      color: var(--galaxy-accent-cyan, #00ffff);
      font-size: 1.2em;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 5px;
      transition: background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .footer-action-btn:hover {
      background-color: var(--galaxy-accent-cyan, #00ffff);
      color: var(--galaxy-deep-space-blue, #0b1021);
      box-shadow: 0 0 7px var(--galaxy-accent-cyan, #00ffff);
    }

    .menu-acoes-paleta {
      /* Estilos do menu, position: absolute; z-index: 10010; display: none; etc. já no HTML ou JS */
      background-color: #3a3f44;
      border: 1px solid #50555a;
      border-radius: 5px;
      padding: 8px;
      display: flex;
      /* Adicionado para os botões, mas o display principal é controlado por JS */
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-width: 180px;
    }

    .menu-acoes-paleta .acao-paleta-btn {
      background-color: #4a4f54;
      color: #e0e0e0;
      border: 1px solid #5a5f64;
      padding: 8px 12px;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.9em;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .menu-acoes-paleta .acao-paleta-btn:hover {
      background-color: #5a5f64;
      border-color: #6a6f74;
      color: #ffffff;
    }

    /* [[drawflow.css]] ou <style> em diagrama.php */
    .abas-geral-container {
      display: flex;
      align-items: center;
      padding: 5px;
      background-color: #f0f0f0;
      /* Cor de fundo da barra de abas */
      user-select: none;
    }

    .tabs-list {
      display: flex;
      flex-grow: 1;
      overflow-x: auto;
      /* Scroll se muitas abas */
      overflow-y: hidden;
    }

    .abas-superiores-container {
      border-bottom: 1px solid #ccc;
    }

    .abas-inferiores-container {
      border-top: 1px solid #ccc;
    }

    .tab-item,
    .sub-tab-item {
      padding: 8px 12px;
      margin-right: 3px;
      border: 1px solid #ccc;
      background-color: #e9e9e9;
      cursor: pointer;
      border-radius: 4px 4px 0 0;
      white-space: nowrap;
      display: flex;
      align-items: center;
      font-size: 0.9em;
      position: relative;
      /* Para o botão de fechar */
    }

    .abas-inferiores-container .sub-tab-item {
      font-size: 0.85em;
      padding: 6px 10px;
    }

    .tab-item.active,
    .sub-tab-item.active {
      background-color: #ffffff;
      /* Cor da aba ativa, idealmente a cor do seu canvas */
      border-bottom-color: #ffffff;
      /* Para fundir com o conteúdo */
      font-weight: bold;
    }

    .abas-inferiores-container .tab-item.active,
    .abas-inferiores-container .sub-tab-item.active {
      border-top-color: #ccc;
      border-bottom-color: transparent;
      /* Se estiver acima do canvas */
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      background-color: #ffffff;
      border-top: 1px solid #ccc;
      /* Ajuste conforme necessário */
    }


    .tab-nome {
      margin-right: 5px;
      /* Espaço antes do botão de fechar */
    }

    .close-tab-btn {
      margin-left: 8px;
      font-size: 14px;
      line-height: 1;
      padding: 0px 4px;
      border-radius: 50%;
      opacity: 0.6;
    }

    .close-tab-btn:hover {
      background-color: #dcdcdc;
      opacity: 1;
    }

    .add-tab-btn {
      padding: 6px 10px;
      margin-left: 8px;
      border: 1px solid #ccc;
      background-color: #e0e0e0;
      cursor: pointer;
      border-radius: 4px;
    }

    .add-tab-btn:hover {
      background-color: #d0d0d0;
    }
  </style>
  <div class="abas-geral-container abas-superiores-container">
    <div id="lista-abas-superiores" class="tabs-list">
    </div>
    <button id="btn-add-aba-superior" class="add-tab-btn" title="Adicionar novo arquivo">+</button>
  </div>

  <div class="abas-geral-container abas-inferiores-container">
    <div id="lista-abas-inferiores" class="tabs-list sub-tabs-list">
    </div>
    <button id="btn-add-sub-aba" class="add-tab-btn" title="Adicionar nova página/sub-diagrama ao arquivo atual">+</button>
  </div>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="global-editor-fullscreen" style="z-index:9999; width:100vw;">
    <div class="offcanvas-header">
      <button id="close-fullscreen" style="position: absolute; top: 10px; right: 10px; z-index: 1001; background-color: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer;"></button>
    </div>
    <div class="offcanvas-body">
      <div id="global-editor-container" style="width: 100%; height: 100%;display:block;z-index:9998;"></div>
    </div>
  </div>
  <div class="fixed mx-auto w-[300px] flex justify-center items-center z-50 gap-2 left-[200px]">
    <span class="badge badge-danger">ID: <?= $idGalaxia; ?></span>


  </div>
  <div class="wrapper" style=" overflow:hidden">
    <div class="flex">
      <div class=" text-center text-white  gap-2" style="width:350px;background-color: #051c32; width:12vw;  height:calc(100vh - 90px);">
        <div style="height: 100%;  overflow:auto" class="scroll-container">
          <?php if (!empty($elementos)): ?>
            <?php foreach ($elementos as $elemento): ?>
              <div class="drag-drawflow" style="width:100%" draggable="true" ondragstart="drag(event)" data-node="<?= $elemento['codigo']; ?>">
                <?= $elemento['node']; ?>
                <textarea data-dados="<?= htmlspecialchars($elemento['dados']); ?>" data-entrada="<?= htmlspecialchars($elemento['entrada']); ?>" data-saida="<?= htmlspecialchars($elemento['saida']); ?>" class="hidden node-elem-<?= $elemento['codigo']; ?>"><?= htmlspecialchars($elemento['elemento']); ?></textarea>
              </div>

            <?php endforeach; ?>
          <?php endif; ?>
        </div>
        <div class="sidebar-footer-actions">
          <button type="button" <?= $galaxia->abrirModal('AdicionarNo', ['estrela' => 'Galaxia', 'startSinal' => 'Diagramas'])['html']; ?> title="Novos Nós (placeholder)" class="footer-action-btn">
            <i class="fas fa-plus-circle"></i>
          </button>
          <button type="button" title="Organizar Nós Automaticamente" class="footer-action-btn" onclick="if(typeof editor !== 'undefined' && typeof alinharDrawflowHierarquicamente === 'function') { alinharDrawflowHierarquicamente(editor); } else { console.error('Editor ou alinharDrawflowHierarquicamente não definido.'); }">
            <i class="fas fa-project-diagram"></i>
          </button>
        </div>

      </div>
      <div style="background:#f2f2f2; height:calc(100vh - 90px); width:90vw">

        <div id="drawflow" style="background-color: #f2f2f2; height:calc(100vh - 90px);width:90vw" ondrop="drop(event)" ondragover="allowDrop(event)">

          <div class="btn-export" onclick="editor.export()">Salvar</div>

          <div class="btn-clear" onclick="editor.clearModuleSelected()">Clear</div>
          <div class="btn-lock">
            <i id="lock" class="fas fa-lock" onclick="editor.editor_mode='fixed'; changeMode('lock');"></i>
            <i id="unlock" class="fas fa-lock-open" onclick="editor.editor_mode='edit'; changeMode('unlock');" style="display:none;"></i>
          </div>
          <div class="bar-zoom">
            <i onclick="alinharDrawflowHierarquicamente(editor)">Alinhar</i>
            <i class="fas fa-search-minus" onclick="editor.zoom_out()"></i>
            <i class="fas fa-search" onclick="editor.zoom_reset()"></i>
            <i class="fas fa-search-plus" onclick="editor.zoom_in()"></i>
          </div>
        </div>
      </div>
    </div>
  </div>

  <textarea class="workflowSalvo hidden"><?= $workflowSalvo; ?></textarea>
  <?= $formularioSalvar; ?>
</div>

<!-- Offcanvas (Drawer Bootstrap 5) -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="nodeConfigDrawer" style="z-index:9995;">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Configuração do Nó</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    <label for="nodeTitle" class="form-label">Título do Nó</label>
    <input type="text" id="nodeTitle" class="form-control" placeholder="Digite o título">
  </div>
  <div class="offcanvas-body conteudoCamposNo">

  </div>
</div>
<div id="menuAcoesPaletaContainer" class="menu-acoes-paleta" style="display: none; position: absolute; z-index: 10010;">
  <button class="acao-paleta-btn" <?= $galaxia->abrirModal('EditarNo')['html']; ?> data-acao="info">Editar Nó</button>
  <button class="acao-paleta-btn" data-acao="configurar_padroes">Configurar Padrões</button>
  <button class="acao-paleta-btn" data-acao="ver_docs">Ver Documentação</button>
</div>