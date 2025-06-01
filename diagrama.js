var editor;
var id;
var ativarMenuAcoesPaleta = true; // Defina como false para desativar esta funcionalidade
var position;

window.informarRota = function (dados) {
  setTimeout(() => {
    console.log(dados);
    let id = dados.id;
    delete dados.id;
    var divElemento = $(".camposElemento" + id);
    // editor.updateNodeDataFromIdNotRemove(id,dados);
    // Insere os valores nos inputs dentro da div selecionada
  }, 1000);
};
var menuAcoesPaletaAtual = null;
var itemPaletaSegurado = null;
var timerSegurarPaleta = null;
var TEMPO_PARA_SEGURAR = 500; // 500ms para "segurar"

function fecharMenuAcoesPaleta() {
  if (menuAcoesPaletaElement) {
    menuAcoesPaletaElement.style.display = "none";
  }
  itemPaletaSegurado = null; // Limpa a referência
  // Remove o listener de clique global APENAS se ele foi adicionado
  document.removeEventListener("click", handleClickGlobalParaFecharMenu);
}
function handleClickGlobalParaFecharMenu(event) {
  // Se o menu está visível e o clique NÃO foi dentro do menu
  if (
    menuAcoesPaletaElement &&
    menuAcoesPaletaElement.style.display !== "none" &&
    !menuAcoesPaletaElement.contains(event.target)
  ) {
    // E também não foi no item da paleta que o abriu
    if (itemPaletaSegurado && !itemPaletaSegurado.contains(event.target)) {
      fecharMenuAcoesPaleta();
    } else if (!itemPaletaSegurado) {
      // Segurança se itemPaletaSegurado for null
      fecharMenuAcoesPaleta();
    }
  }
}

function mostrarMenuAcoes(elementoItemPaleta) {
  if (!ativarMenuAcoesPaleta || !menuAcoesPaletaElement) return;

  fecharMenuAcoesPaleta(); // Fecha qualquer menu aberto e limpa listeners antigos

  itemPaletaSegurado = elementoItemPaleta;

  const rect = elementoItemPaleta.getBoundingClientRect();
  menuAcoesPaletaElement.style.top = `${rect.bottom + window.scrollY}px`;
  menuAcoesPaletaElement.style.left = `${rect.left + window.scrollX}px`;
  menuAcoesPaletaElement.style.display = "block";

  // Opcional: Atualizar dinamicamente o conteúdo/título do menu se necessário
  // Ex: menuAcoesPaletaElement.querySelector('.menu-paleta-titulo').textContent = `Ações para ${elementoItemPaleta.getAttribute('data-node')}`;

  // Adiciona listener para fechar ao clicar fora (após um pequeno delay para não fechar com o mesmo clique/toque que abriu)
  setTimeout(() => {
    document.addEventListener("click", handleClickGlobalParaFecharMenu);
  }, 0);
}

window.atualizarDiagramaWorkflow = function (dados) {
  if (dados.json) {
    workflowSalvo = JSON.parse(dados.json);

    editor.import(workflowSalvo, true);
  }
};
$(document).on("click", ".btn-estrutura", function () {
  let salvar = $(".salvarEstrutura");

  // Verifica se os dados são válidos antes de prosseguir
  salvar.trigger("click");
});
$(document).ready(function (e) {
  id = document.getElementById("drawflow");
  let workflowSalvo = $(".workflowSalvo").val();
  //$(".divEditor").attr("data-ativo", "false");

  if (workflowSalvo) {
    workflowSalvo = JSON.parse(workflowSalvo);

    editor = new Drawflow(id);
    editor.reroute = true;
    editor.start();
    editor.import(workflowSalvo, true);
  } else {
    console.log("ZERADO");

    editor = new Drawflow(id);

    editor.start();
  }

  editor.on("import", () => {
    setTimeout(() => {
      numerarNodesOrdenados(editor);
    }, 500);
  });
  // Ensure this code runs after jQuery is loaded and the DOM is ready
  // --- Expand/Collapse Functionality ---
  $(document).on("click", ".tech-node .toggle-button", function () {
    const $button = $(this); // The clicked button
    const targetId = $button.attr("aria-controls");
    const $collapsibleSection = $("#" + targetId);
    const isExpanded = $button.attr("aria-expanded") === "true";
    const $iconElement = $button.find(".toggle-icon");
    const $textElement = $button.find(".toggle-text");

    if ($collapsibleSection.length) {
      // Check if the element exists
      if (isExpanded) {
        $button.attr("aria-expanded", "false");
        $collapsibleSection.removeClass("expanded");
        if ($iconElement.length) $iconElement.text("▼");
        if ($textElement.length) $textElement.text("More Info");
      } else {
        $button.attr("aria-expanded", "true");
        $collapsibleSection.addClass("expanded");
        if ($iconElement.length) $iconElement.text("▲");
        if ($textElement.length) $textElement.text("Less Info");
      }
    } else {
      console.warn("Collapsible section not found for ID:", targetId);
    }
  });

  // --- Inline Description Editing Functionality ---

  // Event: Click on description text to start editing
  $(document).on(
    "click",
    ".node-description-wrapper .node-description-text",
    function () {
      const $textDisplay = $(this);
      const $wrapper = $textDisplay.closest(".node-description-wrapper");
      const $editInput = $wrapper.find(".node-description-edit");
      // const nodeId = $wrapper.data('node-id'); // nodeId is available if needed for save

      if (!$editInput.length) {
        console.warn("Description input not found for node wrapper:", $wrapper);
        return;
      }

      let currentText = "";
      const $noDescSpan = $textDisplay.find(".no-description");

      if ($noDescSpan.length) {
        currentText = "";
      } else {
        currentText = $textDisplay.text().trim();
      }

      $editInput.val(currentText);
      $textDisplay.hide();
      $editInput.show();

      const displayHeight = $textDisplay.outerHeight();
      $editInput.css("min-height", Math.max(displayHeight, 70) + "px");

      $editInput.focus().select();
    }
  );

  // Function to save description changes (can be called by blur and keydown)
  function saveDescriptionChanges($editInput) {
    const $wrapper = $editInput.closest(".node-description-wrapper");
    const $textDisplay = $wrapper.find(".node-description-text");
    const nodeId = $wrapper.data("node-id"); // Get nodeId for saving
    const newText = $editInput.val().trim();

    if (newText) {
      $textDisplay.text(newText); // jQuery's .text() handles special characters appropriately
      const $noDescSpan = $textDisplay.find(".no-description");
      // If the noDescSpan was the only thing, .text() above would have replaced it.
      // If newText exists, ensure noDescSpan is gone (it should be by .text())
      // This logic might need refinement if .no-description span needs to be explicitly removed
      // if it was part of a larger text, but usually .text() just replaces all content.
      if (
        $noDescSpan.length &&
        $textDisplay.html().includes('<span class="no-description">')
      ) {
        $textDisplay.html(newText); // Force replace if span somehow survived
      }
    } else {
      $textDisplay.html(
        '<span class="no-description">- No description provided -</span>'
      );
    }

    $editInput.hide();
    $textDisplay.show();

    console.log(`Save description for node ${nodeId}: "${newText}"`);
    // AJAX call placeholder (same as your original)
    /*
    $.ajax({
        url: '/api/update-description',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id: nodeId, description: newText }),
        // headers: { 'X-CSRF-TOKEN': 'your_csrf_token_here' }, // If using CSRF
        success: function(data) {
            if (data.success) {
                console.log('Description saved successfully on server!');
            } else {
                console.error('Server failed to save description:', data.message);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error saving description via AJAX:', textStatus, errorThrown);
        }
    });
    */
  }

  // Event: Blur on description edit input
  $(document).on(
    "blur",
    ".node-description-wrapper .node-description-edit",
    function () {
      saveDescriptionChanges($(this));
    }
  );

  // Event: Keydown on description edit input (Enter for save, Escape to cancel)
  $(document).on(
    "keydown",
    ".node-description-wrapper .node-description-edit",
    function (event) {
      const $editInput = $(this);
      const $wrapper = $editInput.closest(".node-description-wrapper");
      const $textDisplay = $wrapper.find(".node-description-text");

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        saveDescriptionChanges($editInput);
        $editInput.blur();
      } else if (event.key === "Escape") {
        $editInput.hide();
        $textDisplay.show();
        // To truly revert, you'd store original text on focus and restore it here.
        // For now, it just hides the input, showing the last saved/original state of textDisplay.
      }
    }
  );
  editor.on("nodeMoved", () => {
    numerarNodesOrdenados(editor);
  });
  editor.on("nodeCreated", () => numerarNodesOrdenados(editor));
  editor.on("nodeRemoved", () => numerarNodesOrdenados(editor));
  editor.on("connectionCreated", () => numerarNodesOrdenados(editor));
  editor.on("connectionRemoved", () => numerarNodesOrdenados(editor));
  editor.on("nodeSelected", function (id) {
    console.log("(on.nodeSelected) - Evento disparado para ID: " + id);
    resetOutputFocus();
    resetInputFocus();

    // Adicionado setTimeout para dar tempo ao DOM e aos dados do editor para estabilizar
    setTimeout(() => {
      if (!editor.node_selected || editor.node_selected.id !== "node-" + id) {
        console.log(
          "(on.nodeSelected - setTimeout) - Nó não corresponde mais ou não está selecionado."
        );
        return;
      }

      const selectedNodeElement = editor.node_selected;
      const currentSelectedId = selectedNodeElement.id.replace("node-", ""); // Usa o ID do nó realmente selecionado
      console.log(
        "(on.nodeSelected - setTimeout) - Elemento selecionado:",
        selectedNodeElement.id
      );

      const outputs = Array.from(
        selectedNodeElement.querySelectorAll(".outputs .output")
      );
      console.log(
        "(on.nodeSelected - setTimeout) - Outputs encontrados no DOM:",
        outputs.length
      );

      if (outputs.length > 0) {
        let outputToFocus = null;
        let indexOfOutputToFocus = -1;
        const nodeData = editor.getNodeFromId(currentSelectedId);

        if (nodeData && nodeData.outputs) {
          // Prioridade 1: Tenta encontrar o primeiro output COM conexões
          for (let i = 0; i < outputs.length; i++) {
            const outputElement = outputs[i];
            let outputClass = null;
            // Pega a classe do output (ex: output_1) de forma mais robusta
            for (let cls of outputElement.classList) {
              if (cls.startsWith("output_") && cls !== "output-focused") {
                outputClass = cls;
                break;
              }
            }

            if (
              outputClass &&
              nodeData.outputs[outputClass] &&
              nodeData.outputs[outputClass].connections &&
              nodeData.outputs[outputClass].connections.length > 0
            ) {
              outputToFocus = outputElement;
              indexOfOutputToFocus = i;
              console.log(
                "(on.nodeSelected - setTimeout) - Prioridade 1: Focando output COM conexão:",
                outputClass
              );
              break; // Encontrou o primeiro com conexão, para aqui
            }
          }
        } else {
          console.warn(
            "(on.nodeSelected - setTimeout) - Dados do nó ou outputs não encontrados para o nó selecionado:",
            currentSelectedId
          );
        }

        // Prioridade 2: Se nenhum output com conexão foi encontrado (ou erro nos dados), foca o primeiro output da lista
        if (!outputToFocus && outputs.length > 0) {
          outputToFocus = outputs[0];
          indexOfOutputToFocus = 0;
          console.log(
            "(on.nodeSelected - setTimeout) - Prioridade 2: Nenhum output com conexão (ou erro nos dados), focando o primeiro output da lista."
          );
        }

        // Aplica o foco se um output foi determinado
        if (outputToFocus) {
          currentFocusedOutputIndex = indexOfOutputToFocus;
          highlightOutput(outputToFocus, outputs); // Foca o output determinado
          console.log(
            "(on.nodeSelected - setTimeout) - Output focado automaticamente:",
            outputToFocus.classList
          );
        } else {
          console.log(
            "(on.nodeSelected - setTimeout) - Nenhum output para focar (lista de outputs vazia após verificações)."
          );
        }
      } else {
        console.log(
          "(on.nodeSelected - setTimeout) - Nó selecionado não possui outputs para foco automático."
        );
      }
    }, 200); // Delay de 10ms, pode ser 0 ou ajustado se necessário
  });

  editor.on("moduleCreated", function (name) {
    //console.log("Module Created " + name);
  });

  editor.on("moduleChanged", function (name) {
    //console.log("Module Changed " + name);
  });

  let lastPosition = null;

  editor.on("mouseUp", () => {
    lastPosition = null; // Reseta
  });

  editor.on("mouseMove", function (position) {
    //console.log('Position mouse x:' + position.x + ' y:' + position.y);
  });

  editor.on("zoom", function (zoom) {
    // console.log('Zoom level ' + zoom);
  });

  editor.on("translate", function (position) {});

  editor.on("addReroute", function (id) {
    console.log("Reroute added " + id);
  });

  editor.on("removeReroute", function (id) {
    console.log("Reroute removed " + id);
  });
  editor.on("export", function (json) {
    console.log({
      json: json,
    });
    let salvar = $(".salvarWorkFlow");
    $(".jsonGalaxia").val(JSON.stringify(json));
    setTimeout(() => {}, 200);
    // Verifica se os dados são válidos antes de prosseguir
    salvar.trigger("click");
    // Criação do objeto de dados
  });
  /* DRAG EVENT */

  /* Mouse and Touch Actions */

  menuAcoesPaletaElement = document.getElementById("menuAcoesPaletaContainer");

  if (!menuAcoesPaletaElement) {
    console.error(
      "Elemento #menuAcoesPaletaContainer não encontrado no DOM! A funcionalidade de menu de ações da paleta será desativada."
    );
    ativarMenuAcoesPaleta = false;
  } else {
    // Adiciona listeners aos botões do menu UMA VEZ
    menuAcoesPaletaElement
      .querySelectorAll(".acao-paleta-btn")
      .forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation(); // Impede que o clique no botão feche o menu via handleClickGlobalParaFecharMenu

          if (!itemPaletaSegurado) return; // Segurança

          const acao = event.target.getAttribute("data-acao");
          const nodeType = itemPaletaSegurado.getAttribute("data-node");

          // IMPLEMENTE A LÓGICA DAS SUAS AÇÕES AQUI
          console.log(`Ação do menu: '${acao}', para o nó tipo: '${nodeType}'`);
          alert(`Ação: ${acao}\nNó: ${nodeType}`);

          fecharMenuAcoesPaleta();
        });
      });
  }
  var elements = document.getElementsByClassName("drag-drawflow");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("touchend", drop, false);
    elements[i].addEventListener("touchmove", positionMobile, false);
    //elements[i].addEventListener("touchstart", drag, false);
    let item = elements[i];
    // --- Desktop Mouse Events ---
    let isPressAndHold = false;
    let wasMenuOpenedByHold_Desktop = false;
    let touchDidMoveSignificantly = false;
    let initialTouchX = 0,
      initialTouchY = 0;

    // --- Desktop Mouse Events ---
    item.addEventListener("mousedown", function (e) {
      if (
        !ativarMenuAcoesPaleta ||
        e.button === 2 ||
        e.target.classList.contains("injected-favorite-toggle")
      ) {
        return;
      }
      wasMenuOpenedByHold_Desktop = false;
      clearTimeout(timerSegurarPaleta);

      timerSegurarPaleta = setTimeout(() => {
        wasMenuOpenedByHold_Desktop = true;
        mostrarMenuAcoes(item);
      }, TEMPO_PARA_SEGURAR);
    });

    item.addEventListener("mouseup", function (e) {
      if (!ativarMenuAcoesPaleta) return;
      clearTimeout(timerSegurarPaleta);
    });

    item.addEventListener("mouseleave", function (e) {
      if (!ativarMenuAcoesPaleta) return;
      clearTimeout(timerSegurarPaleta);
    });

    // Define ondragstart programaticamente para desktop
    item.ondragstart = function (event) {
      if (!ativarMenuAcoesPaleta) {
        // Funcionalidade desativada: chama a função 'drag' global original para comportamento padrão desktop
        if (typeof drag === "function") {
          drag(event); // Asume que 'drag' é a função global que lida com dataTransfer
        } else {
          // Fallback
          event.dataTransfer.setData(
            "node",
            event.target.closest(".drag-drawflow").getAttribute("data-node")
          );
        }
        return;
      }

      // Funcionalidade ATIVA:
      if (
        wasMenuOpenedByHold_Desktop ||
        (menuAcoesPaletaElement &&
          menuAcoesPaletaElement.style.display !== "none" &&
          itemPaletaSegurado === item)
      ) {
        event.preventDefault(); // Impede o drag se o menu foi aberto por "segurar" ou ainda está visível para este item
        return false;
      }
      // Comportamento de drag padrão para desktop (se não foi "segurar")
      event.dataTransfer.setData(
        "node",
        event.target.closest(".drag-drawflow").getAttribute("data-node")
      );
    };

    // --- Mobile Touch Events ---
    item.addEventListener(
      "touchstart",
      function (e) {
        if (
          !ativarMenuAcoesPaleta ||
          e.target.classList.contains("injected-favorite-toggle")
        ) {
          return;
        }

        isPressAndHold = false;
        touchDidMoveSignificantly = false;
        clearTimeout(timerSegurarPaleta);
        const currentItem = e.currentTarget;
        initialTouchX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;

        // Otimisticamente, define mobile_item_selec. Será limpo se for "segurar" sem movimento.
        // Esta linha replica o que a função `drag(ev)` original faria para `ev.type === "touchstart"`.
        mobile_item_selec = currentItem.getAttribute("data-node");

        timerSegurarPaleta = setTimeout(() => {
          if (touchDidMoveSignificantly) return;

          isPressAndHold = true;
          mobile_item_selec = ""; // Essencial: Invalida o drag/drop para a função 'drop' global
          mostrarMenuAcoes(currentItem);
          e.preventDefault(); // Previne scroll/outras ações padrão do toque LONGO
        }, TEMPO_PARA_SEGURAR);
      },
      { passive: false }
    );

    // Listener de touchmove no item (diferente do listener temporário)
    // Este é para chamar positionMobile, conforme o comportamento original.
    // Se você já tem item.addEventListener("touchmove", positionMobile, false); em outro loop,
    // esta duplicata não é necessária. Certifique-se que ele exista.
    // Se não, adicione:
    // item.addEventListener('touchmove', function(e) {
    //     if (touchDidMoveSignificantly) { // Se já detectamos movimento significativo antes
    //        clearTimeout(timerSegurarPaleta);
    //     }
    //     positionMobile(e); // Chama a função global para rastro do drag
    // });

    // Listener de touchend no item (diferente do listener temporário)
    // Este é para chamar a função drop global, conforme o comportamento original.
    // Se você já tem item.addEventListener("touchend", drop, false); em outro loop,
    // esta duplicata não é necessária. Certifique-se que ele exista.
    // Se não, adicione:
    // item.addEventListener("touchend", drop, false);

    // Adição de listeners temporários para cancelar o "segurar" se houver movimento
    // Estes são adicionados *dentro* do 'touchstart' e removidos após o toque.
    const addTemporaryTouchHandlers = (event) => {
      const onTempTouchMove = (moveEvent) => {
        const deltaX = Math.abs(moveEvent.touches[0].clientX - initialTouchX);
        const deltaY = Math.abs(moveEvent.touches[0].clientY - initialTouchY);
        const moveThreshold = 15;

        if (deltaX > moveThreshold || deltaY > moveThreshold) {
          touchDidMoveSignificantly = true;
          clearTimeout(timerSegurarPaleta);
          removeTemporaryTouchHandlers();
        }
        // A função global positionMobile DEVE ser chamada pelo listener persistente no item.
      };

      const onTempTouchEnd = () => {
        clearTimeout(timerSegurarPaleta);
        removeTemporaryTouchHandlers();
        // A função global drop DEVE ser chamada pelo listener persistente no item.
      };

      const removeTemporaryTouchHandlers = () => {
        item.removeEventListener("touchmove", onTempTouchMove);
        item.removeEventListener("touchend", onTempTouchEnd);
        item.removeEventListener("touchcancel", onTempTouchEnd);
      };

      // Adiciona os handlers temporários ao item, não ao document
      item.addEventListener("touchmove", onTempTouchMove);
      item.addEventListener("touchend", onTempTouchEnd);
      item.addEventListener("touchcancel", onTempTouchEnd);
    };
    // Chama a função para adicionar os handlers temporários no final do listener de touchstart do item.
    // Isso precisa ser feito após a definição de initialTouchX/Y.
    // O listener de touchstart já foi definido acima. A chamada seria assim:
    // No final do listener 'item.addEventListener('touchstart', function(e) { ... });':
    // addTemporaryTouchHandlers(e); // Passa o evento 'e' se necessário, mas não parece ser usado.
    // No entanto, é mais limpo colocar a definição e adição desses handlers *dentro* do listener de touchstart principal.

    // Refatorando: Colocando os handlers temporários DENTRO do listener de touchstart principal:
    // A lógica já está no `item.addEventListener('touchstart', function(e) { ... });` acima,
    // com a definição de `tempOnTouchMove` e `tempOnTouchEnd` e sua adição/remoção.
  }

  document
    .getElementById("drawflow")
    .addEventListener("dblclick", function (event) {
      let node = event.target.closest(".drawflow-node");
      if (node && node.id.startsWith("node-")) {
        let nodeId = node.id.replace("node-", "");
        openDrawer(nodeId);
      }
    });
  setupSelectionAndClipboard(editor);

  const FAVORITES_KEY = "drawflowNodePaletteFavorites";
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  const $sidebarContainer = $(
    'div[style*="width:12vw"][style*="background-color: #051c32"]'
  );
  const $scrollContainer = $sidebarContainer.find(".scroll-container");
  let $searchInput = $("#palette-search-input-injected"); // Inicializa

  // 1. Injetar o Campo de Pesquisa
  if (
    $sidebarContainer.length &&
    !$sidebarContainer.find("#palette-search-input-injected").length
  ) {
    $searchInput = $(
      '<input type="text" id="palette-search-input-injected" placeholder="Buscar nós (Ctrl+G)...">'
    );
    $sidebarContainer.prepend($searchInput);
  }

  function reorderPaletteItems() {
    // ... (função reorderPaletteItems como na resposta anterior)
    if (!$scrollContainer || $scrollContainer.length === 0) return;
    const $items = $scrollContainer.find(".drag-drawflow").get();
    $items.sort(function (a, b) {
      const isAFavorite = $(a).hasClass("is-favorite");
      const isBFavorite = $(b).hasClass("is-favorite");
      if (isAFavorite && !isBFavorite) return -1;
      if (!isAFavorite && isBFavorite) return 1;
      return 0;
    });
    $.each($items, function (idx, itm) {
      $scrollContainer.append(itm);
    });
  }

  function updateFavoriteStatus($item, nodeId) {
    // ... (função updateFavoriteStatus como na resposta anterior)
    const $toggleIcon = $item.find(".injected-favorite-toggle");
    if (favorites.includes(String(nodeId))) {
      $item.addClass("is-favorite");
      if ($toggleIcon.length) $toggleIcon.text("★");
    } else {
      $item.removeClass("is-favorite");
      if ($toggleIcon.length) $toggleIcon.text("☆");
    }
  }

  $scrollContainer.find(".drag-drawflow").each(function () {
    // ... (injeção do ícone de favorito e update inicial como na resposta anterior)
    const $item = $(this);
    const nodeId = $item.data("node");
    if ($item.find(".injected-favorite-toggle").length === 0) {
      const $favoriteToggle = $(
        '<span class="injected-favorite-toggle" title="Marcar como favorito">☆</span>'
      );
      $item.append($favoriteToggle);
    }
    updateFavoriteStatus($item, nodeId);
  });
  reorderPaletteItems();

  $scrollContainer.on("click", ".injected-favorite-toggle", function (e) {
    // ... (lógica de clique no favorito e reorder como na resposta anterior)
    e.preventDefault();
    e.stopPropagation();
    const $item = $(this).closest(".drag-drawflow");
    const nodeId = String($item.data("node"));
    const index = favorites.indexOf(nodeId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(nodeId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoriteStatus($item, nodeId);
    reorderPaletteItems();
  });

  $sidebarContainer.on("input", "#palette-search-input-injected", function () {
    // ... (lógica de pesquisa como na resposta anterior)
    const searchTerm = $(this).val().toLowerCase().trim();
    let visibleCount = 0;
    $scrollContainer.find(".drag-drawflow").each(function () {
      const $item = $(this);
      let itemText = "";
      const $renderedNodeContent = $item
        .children()
        .not("textarea, .injected-favorite-toggle");
      const $techNodeInPalette = $renderedNodeContent.find(".tech-node");
      if ($techNodeInPalette.length) {
        itemText = (
          $techNodeInPalette.find(".node-name").text() +
          " " +
          $techNodeInPalette.find(".node-id").text() +
          " " +
          $item.data("node")
        )
          .toLowerCase()
          .trim();
      } else {
        itemText = ($renderedNodeContent.text() + " " + $item.data("node"))
          .toLowerCase()
          .trim();
      }
      if (itemText.includes(searchTerm)) {
        $item.removeClass("hidden-by-search");
        visibleCount++;
      } else {
        $item.addClass("hidden-by-search");
      }
    });
    $searchInput.data("visible-items-count", visibleCount);
  });

  $scrollContainer.on("dragstart", ".drag-drawflow", function () {
    $(this).addClass("is-dragging-palette-item");
  });
  $scrollContainer.on("dragend", ".drag-drawflow", function () {
    $(this).removeClass("is-dragging-palette-item");
  });

  $(document).on("keydown", function (e) {
    // ... (atalho Ctrl+G como na resposta anterior)
    if (e.ctrlKey && (e.key === "g" || e.key === "G")) {
      e.preventDefault();
      if ($searchInput.length) $searchInput.focus();
    }
  });

  // --- LÓGICA DO "ENTER" ATUALIZADA ---$sidebarContainer.on(
  $sidebarContainer.on(
    "keydown",
    "#palette-search-input-injected",
    function (e) {
      if (e.key === "Enter") {
        const visibleItemsCount = $searchInput.data("visible-items-count");

        if (visibleItemsCount === 1) {
          e.preventDefault();
          const $itemToAdd = $scrollContainer
            .find(".drag-drawflow:not(.hidden-by-search)")
            .first();

          if ($itemToAdd.length) {
            const nodeCodigo = $itemToAdd.data("node");
            const $textarea = $itemToAdd.find(
              "textarea.node-elem-" + nodeCodigo
            );

            if ($textarea.length) {
              const nodeInternalData = JSON.parse(
                JSON.stringify($textarea.data("dados") || {})
              );
              const nodeInputsDataRaw = $textarea.data("entrada");
              const nodeOutputsDataRaw = $textarea.data("saida");
              const nodeHtmlContent = $textarea.val();

              // Função robusta para parsear/gerar arrays de input/output (mantenha ou insira se não existir)
              function parseOrGenerateIOArray(rawData, type = "input") {
                let parsedData = [];
                if (Array.isArray(rawData)) {
                  parsedData = rawData;
                } else if (
                  typeof rawData === "string" &&
                  rawData.trim() !== ""
                ) {
                  try {
                    const tempParsed = JSON.parse(rawData);
                    if (Array.isArray(tempParsed)) {
                      parsedData = tempParsed;
                    } else {
                      console.warn(
                        `Dados de ${type} parseados de string não são um array:`,
                        tempParsed,
                        `String original: ${rawData}`
                      );
                    }
                  } catch (err) {
                    console.warn(
                      `Erro ao parsear string de ${type}:`,
                      err,
                      `String original: ${rawData}`
                    );
                  }
                } else if (typeof rawData === "number" && rawData > 0) {
                  console.log(
                    `Dados de ${type} é um número (${rawData}). Gerando array padrão.`
                  );
                  for (let i = 0; i < rawData; i++) {
                    if (type === "output") {
                      parsedData.push({
                        codigo: `Saída ${i + 1}`,
                        nome: `Saída ${i + 1}`,
                        personalizado: 0,
                      });
                    } else {
                      parsedData.push({ nome: `Entrada ${i + 1}` });
                    }
                  }
                }

                if (type === "output") {
                  parsedData = parsedData.map((item, index) => {
                    if (typeof item !== "object" || item === null)
                      return {
                        codigo: `Saída ${index + 1}_obj_err`,
                        nome: `Saída ${index + 1}_obj_err`,
                        personalizado: 0,
                      };
                    if (typeof item.codigo === "undefined")
                      item.codigo = `Saída ${index + 1}_cod_err`;
                    if (typeof item.nome === "undefined")
                      item.nome = item.codigo;
                    if (typeof item.personalizado === "undefined")
                      item.personalizado = 0;
                    return item;
                  });
                } else {
                  parsedData = parsedData.map((item, index) => {
                    if (typeof item !== "object" || item === null)
                      return { nome: `Entrada ${index + 1}_obj_err` };
                    if (typeof item.nome === "undefined")
                      item.nome = `Entrada ${index + 1}`;
                    return item;
                  });
                }
                return parsedData;
              }

              const nodeInputsArray = parseOrGenerateIOArray(
                nodeInputsDataRaw,
                "input"
              );
              const nodeOutputsArray = parseOrGenerateIOArray(
                nodeOutputsDataRaw,
                "output"
              );

              console.log(
                "[DEBUG Palette Enter] Inputs para editor.addNode:",
                JSON.parse(JSON.stringify(nodeInputsArray))
              );
              console.log(
                "[DEBUG Palette Enter] Outputs para editor.addNode:",
                JSON.parse(JSON.stringify(nodeOutputsArray))
              );

              // Posição inicial simples, o alinhamento (se chamado) cuidará do posicionamento mais refinado
              let initialPosX = 100,
                initialPosY = 100;
              if (focusedOutputElement && editor.node_selected) {
                // Posiciona à direita do nó pai, alinhado verticalmente com o output focado
                const parentNode = editor.node_selected;
                const parentCanvasX = parentNode.offsetLeft;
                const parentCanvasY = parentNode.offsetTop;
                const parentNodeWidth = parentNode.offsetWidth;

                initialPosX = parentCanvasX + parentNodeWidth + 150; // 150px de espaçamento

                const outputTopInParent = focusedOutputElement.offsetTop;
                const outputsDivTopInParent =
                  focusedOutputElement.offsetParent.offsetTop;
                const outputCenterYInParent =
                  parentCanvasY +
                  outputsDivTopInParent +
                  outputTopInParent +
                  focusedOutputElement.offsetHeight / 2;
                const APPROX_NEW_NODE_HEIGHT = 80;
                initialPosY =
                  outputCenterYInParent - APPROX_NEW_NODE_HEIGHT / 2;
              } else {
                const currentViewCenterX =
                  (-editor.canvas_x + editor.container.clientWidth / 2) /
                  editor.zoom;
                const currentViewCenterY =
                  (-editor.canvas_y + editor.container.clientHeight / 2) /
                  editor.zoom;
                initialPosX = currentViewCenterX - 80; // Metade da largura do nó padrão
                initialPosY = currentViewCenterY - 40; // Metade da altura do nó padrão
              }

              if (
                typeof editor !== "undefined" &&
                typeof editor.addNode === "function"
              ) {
                const newNodeId = editor.addNode(
                  nodeCodigo,
                  nodeInputsArray,
                  nodeOutputsArray,
                  initialPosX,
                  initialPosY,
                  nodeCodigo,
                  nodeInternalData,
                  nodeHtmlContent,
                  false
                );

                if (newNodeId) {
                  console.log(
                    `[Enter Key] Nó '${nodeCodigo}' adicionado com ID: ${newNodeId}.`
                  );
                  let connectionMade = false;
                  if (focusedOutputElement && editor.node_selected) {
                    const sourceNodeId = editor.node_selected.id.replace(
                      "node-",
                      ""
                    );
                    let outputClassForConnection = null;

                    for (let cls of focusedOutputElement.classList) {
                      if (
                        cls.startsWith("output_") &&
                        cls !== "output-focused"
                      ) {
                        outputClassForConnection = cls;
                        break;
                      }
                    }

                    if (outputClassForConnection) {
                      const newNodeDataFromEditor = editor.getNodeFromId(
                        String(newNodeId)
                      );
                      if (
                        newNodeDataFromEditor &&
                        newNodeDataFromEditor.inputs &&
                        Object.keys(newNodeDataFromEditor.inputs).length > 0
                      ) {
                        const firstInputClass = Object.keys(
                          newNodeDataFromEditor.inputs
                        )[0];
                        editor.addConnection(
                          sourceNodeId,
                          String(newNodeId),
                          outputClassForConnection,
                          firstInputClass
                        );
                        console.log(
                          `Conectado: ${sourceNodeId}.${outputClassForConnection} -> ${newNodeId}.${firstInputClass}`
                        );
                        connectionMade = true;
                      } else {
                        console.warn(
                          `Novo nó ${newNodeId} não possui inputs ou não foi encontrado para conexão.`
                        );
                      }
                    } else {
                      console.warn(
                        "Não foi possível determinar a outputClass do elemento focado para conexão."
                      );
                    }
                    // O resetOutputFocus será tratado pelo evento 'nodeSelected'
                  }

                  if (typeof alinharDrawflowHierarquicamente === "function") {
                    alinharDrawflowHierarquicamente(editor);
                    console.log("alinharDrawflowHierarquicamente chamado.");
                  }

                  setTimeout(() => {
                    const newNodeElement = document.getElementById(
                      "node-" + String(newNodeId)
                    );
                    if (newNodeElement) {
                      if (editor.node_selected) {
                        editor.node_selected.classList.remove("selected");
                      }
                      newNodeElement.classList.add("selected");
                      editor.node_selected = newNodeElement;
                      editor.dispatch("nodeSelected", String(newNodeId));
                      console.log(`Nó ${newNodeId} selecionado.`);

                      focusViewOnNode(newNodeElement, editor); // Ou newNodeElement_dd para addNodeToDrawFlow
                    } else {
                      console.warn(
                        `Elemento do nó ${newNodeId} não encontrado após alinhamento para focar visão.`
                      );
                    }
                  }, 300);

                  $searchInput.val("").trigger("input");
                } else {
                  console.error(
                    "[Enter Key] editor.addNode não retornou um ID válido."
                  );
                }
              } else {
                console.error(
                  "[Enter Key] A variável 'editor' ou a função 'editor.addNode' não está definida."
                );
                alert("Erro ao tentar adicionar o nó. Verifique o console.");
              }
            } else {
              console.warn(
                `[Enter Key] Textarea com dados para ${nodeCodigo} não encontrada.`
              );
            }
          }
        }
      }
    }
  );

  // Modificar a função global 'drop' para respeitar o "segurar" (via mobile_item_selec)
  const originalGlobalDropFunction = window.drop;

  window.drop = function (ev) {
    // Sobrescreve a função global 'drop'
    if (ev.type === "touchend") {
      if (!mobile_item_selec) {
        // Se mobile_item_selec está vazio, provavelmente foi um "segurar"
        // fecharMenuAcoesPaleta(); // Opcional: fechar o menu aqui também.
        return; // Previne o drop
      }
    }

    let result;
    if (typeof originalGlobalDropFunction === "function") {
      result = originalGlobalDropFunction(ev); // Chama a lógica de drop original
    } else {
      console.warn(
        "Função drop original (window.drop) não encontrada. O drop pode não funcionar como esperado."
      );
    }

    // Após uma tentativa de drop (bem-sucedida ou não, que não foi um "segurar"),
    // se um menu estiver visível e não foi uma interação com o menu em si, ele deve fechar.
    // A função handleClickGlobalParaFecharMenu já trata cliques fora.
    // Se o drop ocorreu, o menu de "segurar" provavelmente não é mais o foco.
    // Esta verificação pode ser útil se o evento de 'click' para fechar não for suficiente.
    if (
      menuAcoesPaletaElement &&
      menuAcoesPaletaElement.style.display !== "none" &&
      itemPaletaSegurado &&
      !itemPaletaSegurado.contains(ev.target) &&
      !menuAcoesPaletaElement.contains(ev.target)
    ) {
      // fecharMenuAcoesPaleta(); // Descomente se necessário, mas pode ser redundante.
    }
    return result;
  };

  // ... (seu código existente do document.ready) ...

  // Eventos para resetar o foco do output
  editor.on("nodeSelected", function (id) {
    // console.log("Node selected " + id);
    resetOutputFocus(); // Reseta o foco ao selecionar um novo nó
    resetInputFocus(); // <--- GARANTA QUE ESTA LINHA ESTEJA AQUI
  });

  editor.on("nodeUnselected", function () {
    console.log("Node unselected");
    resetOutputFocus();
    resetInputFocus();
  });
  document
    .getElementById("drawflow")
    .addEventListener("click", function (event) {
      const target = event.target;
      // Se o clique foi diretamente no canvas de fundo ou num elemento que não seja nó/conexão
      if (
        target.id === "drawflow" ||
        target.classList.contains("parent-drawflow") ||
        target.classList.contains("drawflow")
      ) {
        if (
          !target.closest(".drawflow-node") &&
          !target.closest(".connection") &&
          !target.closest(".point")
        ) {
          resetOutputFocus();
        }
      }
    });

  editor.on("moduleChanged", function (name) {
    resetOutputFocus();
  });

  // --- LÓGICA DO "ENTER" ATUALIZADA para conectar nós ---
  $sidebarContainer.on(
    "keydown",
    "#palette-search-input-injected",
    function (e) {
      if (e.key === "Enter") {
        const visibleItemsCount = $searchInput.data("visible-items-count");

        if (visibleItemsCount === 1) {
          e.preventDefault();
          const $itemToAdd = $scrollContainer
            .find(".drag-drawflow:not(.hidden-by-search)")
            .first();

          if ($itemToAdd.length) {
            const nodeCodigo = $itemToAdd.data("node");
            const $textarea = $itemToAdd.find(
              "textarea.node-elem-" + nodeCodigo
            );

            if ($textarea.length) {
              function safeJsonParse(dataString, defaultValue = []) {
                // Default para array
                if (typeof dataString === "object" && dataString !== null) {
                  return Array.isArray(dataString) ? dataString : defaultValue;
                }
                if (
                  typeof dataString === "string" &&
                  dataString.trim() !== ""
                ) {
                  try {
                    const parsed = JSON.parse(dataString);
                    return Array.isArray(parsed) ? parsed : defaultValue;
                  } catch (err) {
                    console.warn(
                      `Erro ao parsear JSON: "${dataString}". Usando valor padrão.`,
                      err
                    );
                    return defaultValue;
                  }
                }
                return defaultValue;
              }

              const nodeInternalData = JSON.parse(
                JSON.stringify($textarea.data("dados") || {})
              );
              const nodeInputsDataRaw = $textarea.data("entrada");
              const nodeOutputsDataRaw = $textarea.data("saida");
              const nodeHtmlContent = $textarea.val();

              const nodeInputsArray = safeJsonParse(nodeInputsDataRaw);
              const nodeOutputsArray = safeJsonParse(nodeOutputsDataRaw);

              let posX = 150,
                posY = 150;
              if (focusedOutputElement && editor.node_selected) {
                const sourceNodeRect =
                  editor.node_selected.getBoundingClientRect();
                const drawflowRect = editor.container.getBoundingClientRect();
                // Posiciona o novo nó à direita do nó focado
                posX =
                  editor.node_selected.offsetLeft / editor.zoom +
                  sourceNodeRect.width / editor.zoom +
                  100; // Adiciona um espaçamento
                posY = editor.node_selected.offsetTop / editor.zoom;
              } else if (
                typeof editor !== "undefined" &&
                editor &&
                editor.canvas_x !== undefined
              ) {
                posX =
                  (-editor.canvas_x + editor.container.clientWidth / 2) /
                    editor.zoom -
                  80; // 80 é metade da largura do nó padrão
                posY =
                  (-editor.canvas_y + editor.container.clientHeight / 2) /
                    editor.zoom -
                  20; // 20 é metade da altura
              }

              console.groupCollapsed(
                `[Enter Key] Preparando para adicionar nó: ${nodeCodigo}`
              );
              console.log("Dados extraídos:", {
                codigo: nodeCodigo,
                htmlContent: nodeHtmlContent,
                internalData: nodeInternalData,
                inputsStructure: nodeInputsArray,
                outputsStructure: nodeOutputsArray,
                posX: posX,
                posY: posY,
              });
              console.groupEnd();

              if (
                typeof editor !== "undefined" &&
                typeof editor.addNode === "function"
              ) {
                const newNodeId = editor.addNode(
                  nodeCodigo,
                  nodeInputsArray,
                  nodeOutputsArray,
                  posX,
                  posY,
                  nodeCodigo,
                  nodeInternalData,
                  nodeHtmlContent,
                  false
                );
                console.log(
                  `[Enter Key] Nó '${nodeCodigo}' adicionado com ID: ${newNodeId}.`
                );

                if (newNodeId && focusedOutputElement && editor.node_selected) {
                  const sourceNodeId = editor.node_selected.id.replace(
                    "node-",
                    ""
                  );
                  let outputClassForConnection = null;

                  for (let cls of focusedOutputElement.classList) {
                    if (cls.startsWith("output_") && cls !== "output-focused") {
                      outputClassForConnection = cls;
                      break;
                    }
                  }

                  if (outputClassForConnection) {
                    const newNodeData = editor.getNodeFromId(String(newNodeId));
                    if (
                      newNodeData &&
                      newNodeData.inputs &&
                      Object.keys(newNodeData.inputs).length > 0
                    ) {
                      const firstInputClass = Object.keys(
                        newNodeData.inputs
                      )[0];
                      editor.addConnection(
                        sourceNodeId,
                        String(newNodeId),
                        outputClassForConnection,
                        firstInputClass
                      );
                      console.log(
                        `Conectado: ${sourceNodeId}.${outputClassForConnection} -> ${newNodeId}.${firstInputClass}`
                      );

                      setTimeout(() => {
                        alinharDrawflowHierarquicamente(editor);
                      }, 250);
                    } else {
                      console.warn(
                        `Novo nó ${newNodeId} não possui inputs ou não foi encontrado.`
                      );
                    }
                  } else {
                    console.warn(
                      "Não foi possível determinar a outputClass do elemento focado para conexão."
                    );
                  }
                  resetOutputFocus(); // Limpa o foco do output após a tentativa de conexão
                }
                $searchInput.val("").trigger("input");
              } else {
                console.error(
                  "[Enter Key] A variável 'editor' ou a função 'editor.addNode' não está definida."
                );
                alert("Erro ao tentar adicionar o nó. Verifique o console.");
              }
            } else {
              console.warn(
                `[Enter Key] Textarea com dados para ${nodeCodigo} não encontrada.`
              );
            }
          }
        }
      }
    }
  );
  document.addEventListener("keydown", function (event) {
    const activeElement = document.activeElement;
    const INPUT_LIKE_TAGS = ["input", "textarea", "select"];
    const drawflowContainer = document.getElementById("drawflow");

    // 1. Se o foco está em um campo de texto, geralmente não queremos que as setas do Drawflow atuem.
    if (
      activeElement &&
      (INPUT_LIKE_TAGS.includes(activeElement.tagName.toLowerCase()) ||
        activeElement.hasAttribute("contenteditable"))
    ) {
      // Permite combinações de edição padrão
      if (
        event.ctrlKey &&
        ["c", "v", "x", "z", "a"].includes(event.key.toLowerCase())
      ) {
        console.log({
          naoEncontradoKey: "ccccc",
        });
        return;
      }
      // Permite Shift+Setas para seleção de texto
      if (
        !event.ctrlKey &&
        event.shiftKey &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        console.log({
          naoEncontradoKey: "ArrowRightArrowRightArrowRightArrowRight",
        });
        return;
      }
      // Se for uma tecla de seta sozinha (sem Ctrl/Shift/Alt/Meta) E o foco não for o input da paleta,
      // permite a navegação DENTRO do input.
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.key
        ) &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        if (activeElement.id !== "palette-search-input-injected") {
          console.log({ naoEncontradoKey: "palette-search-input-injected" });

          // Paleta tem seu próprio handler de Enter
          return;
        }
      }
      // Se for qualquer outra tecla (não Ctrl, não Meta, não Alt, não setas, etc.)
      // e não for Enter na paleta, assume-se digitação.
      if (
        !(
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Escape",
            "Shift",
            "Control",
            "Alt",
            "Meta",
          ].includes(event.key) ||
          event.key.startsWith("F") ||
          (activeElement.id === "palette-search-input-injected" &&
            event.key === "Enter")
        )
      ) {
        return;
      }
    }

    // Se nenhum nó estiver selecionado, a maioria das navegações abaixo não se aplica.
    // No entanto, algumas lógicas de Ctrl+C/V/Delete podem funcionar sem um nó selecionado (ex: colar).
    // As verificações específicas `if (!editor.node_selected)` estão dentro de cada bloco de navegação.

    let eventHandled = false; // Flag para indicar se o evento foi tratado por uma das lógicas Drawflow

    // --- LÓGICA DE NAVEGAÇÃO DRAWFLOW ---

    // A. Navegação Interna de Conectores (Ctrl + Seta Cima/Baixo)
    if (
      event.ctrlKey &&
      !event.shiftKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      if (editor.node_selected) {
        event.preventDefault();
        eventHandled = true;
        const selectedNodeElement = editor.node_selected;
        let navigated = false;

        if (
          focusedOutputElement &&
          selectedNodeElement.contains(focusedOutputElement)
        ) {
          const outputs = Array.from(
            selectedNodeElement.querySelectorAll(".outputs .output")
          );
          if (outputs.length > 0) {
            currentFocusedOutputIndex =
              (event.key === "ArrowUp"
                ? currentFocusedOutputIndex - 1 + outputs.length
                : currentFocusedOutputIndex + 1) % outputs.length;
            highlightOutput(outputs[currentFocusedOutputIndex], outputs);
            console.log(
              "Output focado (Ctrl+Seta):",
              outputs[currentFocusedOutputIndex]?.classList
            );
            navigated = true;
          }
        } else if (
          focusedInputElement &&
          selectedNodeElement.contains(focusedInputElement)
        ) {
          const inputs = Array.from(
            selectedNodeElement.querySelectorAll(".inputs .input")
          );
          if (inputs.length > 0) {
            currentFocusedInputIndex =
              (event.key === "ArrowUp"
                ? currentFocusedInputIndex - 1 + inputs.length
                : currentFocusedInputIndex + 1) % inputs.length;
            highlightInput(inputs[currentFocusedInputIndex], inputs);
            console.log(
              "Input focado (Ctrl+Seta):",
              inputs[currentFocusedInputIndex]?.classList
            );
            navigated = true;
          }
        }

        if (!navigated) {
          // Se nada estava focado, tenta focar o primeiro output
          const outputs = Array.from(
            selectedNodeElement.querySelectorAll(".outputs .output")
          );
          if (outputs.length > 0) {
            if (focusedInputElement) resetInputFocus();
            currentFocusedOutputIndex = 0;
            highlightOutput(outputs[currentFocusedOutputIndex], outputs);
            console.log(
              "Output inicial focado (Ctrl+Seta):",
              outputs[currentFocusedOutputIndex]?.classList
            );
          } else {
            const inputs = Array.from(
              selectedNodeElement.querySelectorAll(".inputs .input")
            );
            if (inputs.length > 0) {
              if (focusedOutputElement) resetOutputFocus();
              currentFocusedInputIndex = 0;
              highlightInput(inputs[currentFocusedInputIndex], inputs);
              console.log(
                "Input inicial focado (Ctrl+Seta, sem outputs):",
                inputs[currentFocusedInputIndex]?.classList
              );
            }
          }
        }
      } else {
        if (focusedOutputElement) resetOutputFocus();
        if (focusedInputElement) resetInputFocus();
      }
    }
    // B. Troca entre Inputs/Outputs e Navegação entre Nós Conectados (Ctrl + Shift + Setas Laterais)
    else if (
      event.ctrlKey &&
      event.shiftKey &&
      (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      console.log({ arrowleft: "00000" });

      if (editor.node_selected) {
        event.preventDefault();
        eventHandled = true;
        const selectedNodeElement = editor.node_selected;
        const currentNodeId = selectedNodeElement.id.replace("node-", "");
        const currentNodeData = editor.getNodeFromId(currentNodeId);
        const inputs = Array.from(
          selectedNodeElement.querySelectorAll(".inputs .input")
        );
        const outputs = Array.from(
          selectedNodeElement.querySelectorAll(".outputs .output")
        );

        if (event.key === "ArrowLeft") {
          if (
            focusedOutputElement &&
            selectedNodeElement.contains(focusedOutputElement) &&
            inputs.length > 0
          ) {
            resetOutputFocus();
            currentFocusedInputIndex = inputs.length - 1;
            highlightInput(inputs[currentFocusedInputIndex], inputs);
            console.log(
              "Movido para último Input (Ctrl+Shift+Left):",
              inputs[currentFocusedInputIndex]?.classList
            );
          } else if (
            focusedInputElement &&
            selectedNodeElement.contains(focusedInputElement)
          ) {
            let inputClassNav = null;
            for (let cls of focusedInputElement.classList) {
              if (cls.startsWith("input_") && cls !== "input-focused") {
                inputClassNav = cls;
                break;
              }
            }
            if (
              inputClassNav &&
              currentNodeData.inputs[inputClassNav]?.connections.length > 0
            ) {
              const conn = currentNodeData.inputs[inputClassNav].connections[0];
              const parentId = conn.node;
              const parentOutputClass = conn.input;
              const parentNodeEl = document.getElementById("node-" + parentId);
              if (parentNodeEl) {
                selectedNodeElement.classList.remove("selected");
                parentNodeEl.classList.add("selected");
                editor.node_selected = parentNodeEl;
                editor.dispatch("nodeSelected", parentId);
                const parentOutputs = Array.from(
                  parentNodeEl.querySelectorAll(".outputs .output")
                );
                let outputToFocus = null;
                let outputIdx = -1;
                for (let i = 0; i < parentOutputs.length; i++) {
                  if (parentOutputs[i].classList.contains(parentOutputClass)) {
                    outputToFocus = parentOutputs[i];
                    outputIdx = i;
                    break;
                  }
                }
                if (outputToFocus) {
                  currentFocusedOutputIndex = outputIdx;
                  highlightOutput(outputToFocus, parentOutputs);
                  console.log(
                    `Movido para Pai ${parentId}, Output ${parentOutputClass} focado (Ctrl+Shift+Left)`
                  );
                } else {
                  console.warn(
                    `Ctrl+Shift+Left: Output ${parentOutputClass} não encontrado no pai ${parentId}.`
                  );
                }
                setTimeout(() => {
                  if (editor.node_selected === parentNodeEl)
                    focusViewOnNode(parentNodeEl, editor);
                }, 50);
              }
            }
          }
        } else if (event.key === "ArrowRight") {
          if (
            focusedInputElement &&
            selectedNodeElement.contains(focusedInputElement) &&
            outputs.length > 0
          ) {
            resetInputFocus();
            currentFocusedOutputIndex = 0;
            highlightOutput(outputs[currentFocusedOutputIndex], outputs);
            console.log(
              "Movido para primeiro Output (Ctrl+Shift+Right):",
              outputs[currentFocusedOutputIndex]?.classList
            );
          } else if (
            focusedOutputElement &&
            selectedNodeElement.contains(focusedOutputElement)
          ) {
            let outputClassNav = null;
            for (let cls of focusedOutputElement.classList) {
              if (cls.startsWith("output_") && cls !== "output-focused") {
                outputClassNav = cls;
                break;
              }
            }
            if (
              outputClassNav &&
              currentNodeData.outputs[outputClassNav]?.connections.length > 0
            ) {
              const conn =
                currentNodeData.outputs[outputClassNav].connections[0];
              const childId = conn.node;
              const childInputClass = conn.output;
              const childNodeEl = document.getElementById("node-" + childId);
              if (childNodeEl) {
                selectedNodeElement.classList.remove("selected");
                childNodeEl.classList.add("selected");
                editor.node_selected = childNodeEl;
                editor.dispatch("nodeSelected", childId);
                const childInputs = Array.from(
                  childNodeEl.querySelectorAll(".inputs .input")
                );
                let inputToFocus = null;
                let inputIdx = -1;
                for (let i = 0; i < childInputs.length; i++) {
                  if (childInputs[i].classList.contains(childInputClass)) {
                    inputToFocus = childInputs[i];
                    inputIdx = i;
                    break;
                  }
                }
                if (inputToFocus) {
                  currentFocusedInputIndex = inputIdx;
                  highlightInput(inputToFocus, childInputs);
                  console.log(
                    `Movido para Filho ${childId}, Input ${childInputClass} focado (Ctrl+Shift+Right)`
                  );
                } else {
                  console.warn(
                    `Ctrl+Shift+Right: Input ${childInputClass} não encontrado no filho ${childId}.`
                  );
                }
                setTimeout(() => {
                  if (editor.node_selected === childNodeEl)
                    focusViewOnNode(childNodeEl, editor);
                }, 50);
              }
            }
          }
        }
      }
    }
    // C. Navegação Livre entre Nós Conectados (Setas Laterais Sozinhas)
    else if (
      (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      console.log({ arrowleft: "111111" });

      if (editor.node_selected) {
        event.preventDefault();
        eventHandled = true;
        const selectedNodeElement = editor.node_selected;
        const currentNodeId = selectedNodeElement.id.replace("node-", "");
        const currentNodeData = editor.getNodeFromId(currentNodeId);
        let targetNodeElement = null;
        let targetNodeId = null;

        if (event.key === "ArrowRight") {
          console.log("Seta Direita (livre) pressionada.");
          if (
            focusedOutputElement &&
            selectedNodeElement.contains(focusedOutputElement)
          ) {
            let outputClassNav = null;
            for (let cls of focusedOutputElement.classList) {
              if (cls.startsWith("output_") && cls !== "output-focused") {
                outputClassNav = cls;
                break;
              }
            }
            if (
              outputClassNav &&
              currentNodeData.outputs[outputClassNav]?.connections.length > 0
            ) {
              const conn =
                currentNodeData.outputs[outputClassNav].connections[0];
              targetNodeId = conn.node;
              targetNodeElement = document.getElementById(
                "node-" + targetNodeId
              );
              console.log("Seguindo ramo para filho:", targetNodeId);
            } else {
              console.log("Seta Direita (livre): Output focado sem conexão.");
            }
          } else {
            console.log(
              "Seta Direita (livre): Nenhum output focado para seguir ramo. Implementar busca por nó próximo à direita se necessário."
            );
          }
        } else if (event.key === "ArrowLeft") {
          console.log("Seta Esquerda (livre) pressionada.");
          if (
            focusedInputElement &&
            selectedNodeElement.contains(focusedInputElement)
          ) {
            let inputClassNav = null;
            for (let cls of focusedInputElement.classList) {
              if (cls.startsWith("input_") && cls !== "input-focused") {
                inputClassNav = cls;
                break;
              }
            }
            if (
              inputClassNav &&
              currentNodeData.inputs[inputClassNav]?.connections.length > 0
            ) {
              const conn = currentNodeData.inputs[inputClassNav].connections[0];
              targetNodeId = conn.node;
              const parentOutputClass = conn.input;
              targetNodeElement = document.getElementById(
                "node-" + targetNodeId
              );
              console.log("Seguindo ramo para pai:", targetNodeId);
              if (targetNodeElement) {
                selectedNodeElement.classList.remove("selected");
                targetNodeElement.classList.add("selected");
                editor.node_selected = targetNodeElement;
                editor.dispatch("nodeSelected", targetNodeId);
                const parentOutputs = Array.from(
                  targetNodeElement.querySelectorAll(".outputs .output")
                );
                let outputToFocus = null;
                let outputIdx = -1;
                for (let i = 0; i < parentOutputs.length; i++) {
                  if (parentOutputs[i].classList.contains(parentOutputClass)) {
                    outputToFocus = parentOutputs[i];
                    outputIdx = i;
                    break;
                  }
                }
                if (outputToFocus) {
                  currentFocusedOutputIndex = outputIdx;
                  highlightOutput(outputToFocus, parentOutputs);
                  console.log(
                    `Seta Esquerda (livre): Output ${parentOutputClass} focado no pai ${targetNodeId}`
                  );
                }
                setTimeout(() => {
                  if (editor.node_selected === targetNodeElement)
                    focusViewOnNode(targetNodeElement, editor);
                }, 50);
                return; // Evento tratado
              }
            } else {
              console.log("Seta Esquerda (livre): Input focado sem conexão.");
            }
          } else {
            console.log(
              "Seta Esquerda (livre): Nenhum input focado para seguir ramo. Implementar busca por nó próximo à esquerda se necessário."
            );
          }
        }

        if (targetNodeElement) {
          // Aplicável para Seta Direita (livre) se não retornou antes
          selectedNodeElement.classList.remove("selected");
          targetNodeElement.classList.add("selected");
          editor.node_selected = targetNodeElement;
          editor.dispatch("nodeSelected", targetNodeId);
          setTimeout(() => {
            if (editor.node_selected === targetNodeElement)
              focusViewOnNode(targetNodeElement, editor);
          }, 50);
        }
      }
    }
    // D. Navegação Livre entre Nós (Setas Verticais Sozinhas)
    else if (
      (event.key === "ArrowUp" || event.key === "ArrowDown") &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      if (editor.node_selected) {
        event.preventDefault();
        eventHandled = true;
        console.log(`Seta Vertical (livre) ${event.key} pressionada.`);
        const selectedNodeElement = editor.node_selected;
        const currentNodeId = selectedNodeElement.id.replace("node-", "");
        const currentRect = {
          id: currentNodeId,
          x: selectedNodeElement.offsetLeft,
          y: selectedNodeElement.offsetTop,
          width: selectedNodeElement.offsetWidth,
          height: selectedNodeElement.offsetHeight,
          cx:
            selectedNodeElement.offsetLeft +
            selectedNodeElement.offsetWidth / 2,
          cy:
            selectedNodeElement.offsetTop +
            selectedNodeElement.offsetHeight / 2,
        };
        const candidatos = [];
        const moduleName = editor.module;
        const allNodesData = editor.drawflow.drawflow[moduleName].data;

        for (const nodeId_iter in allNodesData) {
          if (nodeId_iter === currentNodeId) continue;
          const nodeEl = document.getElementById("node-" + nodeId_iter);
          if (!nodeEl) continue;
          const r = {
            id: nodeId_iter,
            x: nodeEl.offsetLeft,
            y: nodeEl.offsetTop,
            width: nodeEl.offsetWidth,
            height: nodeEl.offsetHeight,
            cx: nodeEl.offsetLeft + nodeEl.offsetWidth / 2,
            cy: nodeEl.offsetTop + nodeEl.offsetHeight / 2,
          };
          const horizontalMatch =
            currentRect.x < r.x + r.width &&
            currentRect.x + currentRect.width > r.x;
          if (horizontalMatch) {
            if (event.key === "ArrowUp" && r.y + r.height <= currentRect.y) {
              candidatos.push({
                nodeEl: nodeEl,
                rect: r,
                verticalDistance: currentRect.y - (r.y + r.height),
              });
            } else if (
              event.key === "ArrowDown" &&
              r.y >= currentRect.y + currentRect.height
            ) {
              candidatos.push({
                nodeEl: nodeEl,
                rect: r,
                verticalDistance: r.y - (currentRect.y + currentRect.height),
              });
            }
          }
        }
        if (candidatos.length > 0) {
          candidatos.sort((a, b) => {
            if (a.verticalDistance !== b.verticalDistance)
              return a.verticalDistance - b.verticalDistance;
            return (
              Math.abs(currentRect.cx - a.rect.cx) -
              Math.abs(currentRect.cx - b.rect.cx)
            );
          });
          const targetNodeElement = candidatos[0].nodeEl;
          const targetNodeId = candidatos[0].rect.id;
          selectedNodeElement.classList.remove("selected");
          targetNodeElement.classList.add("selected");
          editor.node_selected = targetNodeElement;
          editor.dispatch("nodeSelected", targetNodeId);
          console.log(`Navegou (seta vertical) para nó: ${targetNodeId}`);
          setTimeout(() => {
            if (editor.node_selected === targetNodeElement)
              focusViewOnNode(targetNodeElement, editor);
          }, 50);
        } else {
          console.log(
            `Nenhum nó encontrado na direção ${event.key} com alinhamento horizontal.`
          );
        }
      }
    } else if (
      event.ctrlKey &&
      event.shiftKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      if (editor.node_selected) {
        // Verifica se um nó está selecionado no editor Drawflow
        event.preventDefault();
        eventHandled = true; // Marca que o evento foi tratado pela lógica Drawflow

        const selectedNodeIdOnly = editor.node_selected.id.slice(5); // Ex: "1"
        const moduleName = editor.module; // Pega o módulo atual do editor
        const moduleData = editor.drawflow.drawflow[moduleName].data;
        const selectedNodeData = moduleData[selectedNodeIdOnly];

        if (!selectedNodeData || !selectedNodeData.inputs) {
          console.log(
            "Navegação entre irmãos: Nó selecionado não tem dados de input."
          );
          return;
        }

        let parentNodeId = null;
        let parentOutputClass = null;

        // Encontra o pai e a porta de saída do pai
        for (const inputClass in selectedNodeData.inputs) {
          const inputConnections =
            selectedNodeData.inputs[inputClass].connections;
          if (inputConnections && inputConnections.length > 0) {
            parentNodeId = String(inputConnections[0].node);
            parentOutputClass = inputConnections[0].input; // 'input' na conexão do filho é o 'output_class' do pai
            break;
          }
        }

        if (parentNodeId && parentOutputClass) {
          const parentNodeData = moduleData[parentNodeId];
          if (
            parentNodeData &&
            parentNodeData.outputs &&
            parentNodeData.outputs[parentOutputClass]
          ) {
            const siblingConnections =
              parentNodeData.outputs[parentOutputClass].connections;
            let siblingNodeIds = siblingConnections.map((conn) =>
              String(conn.node)
            );

            if (siblingNodeIds.length <= 1) {
              console.log(
                "Navegação entre irmãos: Não há outros irmãos para este output."
              );
              return;
            }

            // Ordena os irmãos visualmente (de cima para baixo, depois esquerda para direita)
            siblingNodeIds.sort((idA, idB) => {
              const nodeA_element = editor.container.querySelector(
                `#node-${idA}`
              ); // Usa editor.container
              const nodeB_element = editor.container.querySelector(
                `#node-${idB}`
              );

              if (!nodeA_element || !nodeB_element) return 0;

              const topA = parseFloat(nodeA_element.style.top || 0);
              const topB = parseFloat(nodeB_element.style.top || 0);

              if (Math.abs(topA - topB) > 0.1) {
                // Tolerância para floats
                return topA - topB;
              }

              const leftA = parseFloat(nodeA_element.style.left || 0);
              const leftB = parseFloat(nodeB_element.style.left || 0);
              return leftA - leftB;
            });

            const currentIndex = siblingNodeIds.indexOf(selectedNodeIdOnly);

            if (currentIndex !== -1) {
              let nextIndex;
              if (event.key === "ArrowDown") {
                nextIndex = (currentIndex + 1) % siblingNodeIds.length;
              } else {
                // ArrowUp
                nextIndex =
                  (currentIndex - 1 + siblingNodeIds.length) %
                  siblingNodeIds.length;
              }

              const nextNodeIdToSelect = siblingNodeIds[nextIndex];
              const nextNodeElementToSelect = editor.container.querySelector(
                `#node-${nextNodeIdToSelect}`
              );

              if (
                nextNodeElementToSelect &&
                nextNodeElementToSelect !== editor.node_selected
              ) {
                const oldSelectedNodeElement = editor.node_selected;

                // Deselecionar nó antigo
                if (oldSelectedNodeElement) {
                  oldSelectedNodeElement.classList.remove("selected");
                  editor.dispatch(
                    "nodeUnselected",
                    oldSelectedNodeElement.id.slice(5)
                  );
                }

                // Deselecionar conexão antiga, se houver
                if (editor.connection_selected != null) {
                  editor.connection_selected.classList.remove("selected");
                  editor.removeReouteConnectionSelected(); // Função existente
                  editor.connection_selected = null;
                  editor.dispatch("connectionUnselected", true);
                }

                // Selecionar novo nó
                editor.node_selected = nextNodeElementToSelect;
                editor.node_selected.classList.add("selected");
                editor.dispatch("nodeSelected", nextNodeIdToSelect);

                console.log(
                  `Navegação entre irmãos: Selecionado nó ${nextNodeIdToSelect}`
                );

                // Foco visual no nó (se implementado e desejado)
                if (typeof focusViewOnNode === "function") {
                  // Verifica se a função focusViewOnNode existe
                  setTimeout(() => {
                    if (editor.node_selected === nextNodeElementToSelect)
                      focusViewOnNode(nextNodeElementToSelect, editor);
                  }, 50);
                } else {
                  // Fallback simples para scrollIntoView se focusViewOnNode não existir
                  // nextNodeElementToSelect.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
              }
            }
          } else {
            console.log(
              "Navegação entre irmãos: Output do pai não encontrado ou sem conexões."
            );
          }
        } else {
          console.log(
            "Navegação entre irmãos: Não foi possível determinar o nó pai/output para o nó selecionado."
          );
        }
      } else {
        console.log(
          "Navegação entre irmãos: Nenhum nó selecionado no Drawflow."
        );
        // Se nenhum nó estiver selecionado, pode-se tentar focar o primeiro nó "focável"
        // ou o último selecionado, mas isso adicionaria complexidade.
      }
    }
    // --- FIM DA LÓGICA DE NAVEGAÇÃO DO DRAWFLOW ---

    // Adicione aqui seus outros handlers de teclado (Ctrl+C, V, Delete etc.),
    // cada um como um 'else if (condiçãoDaTecla) { eventHandled = true; ... }'
    // Exemplo:
    // else if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
    //    if (editor.node_selected || selectedNodes.size > 0) {
    //       event.preventDefault(); eventHandled = true;
    //       copySelectedNodes();
    //    }
    // }

    // if (eventHandled) {
    //    event.stopPropagation(); // Opcional: para previnir outros listeners se o Drawflow tratou
    // }
  });
  // Modifique a função addNodeToDrawFlow para que ela use os arrays de entrada/saída corretamente
  // e retorne o ID do nó criado se possível (ou adapte a lógica de conexão).
  // A função `editor.addNode` já retorna o ID.
});
// Adicione estas variáveis no escopo global do seu diagrama.js
var focusedOutputElement = null;
var currentFocusedOutputIndex = -1; // -1 indica nenhum output focado
// Adicione estas duas variáveis globais
var focusedInputElement = null;
var currentFocusedInputIndex = -1;

function resetInputFocus() {
  if (focusedInputElement) {
    focusedInputElement.classList.remove("input-focused");
  }
  focusedInputElement = null;
  currentFocusedInputIndex = -1;
  if (editor.node_selected) {
    const inputs = Array.from(
      editor.node_selected.querySelectorAll(".inputs .input")
    );
    inputs.forEach((inp) => inp.classList.remove("input-focused"));
  }
}

function highlightInput(inputElement, nodeInputs) {
  if (nodeInputs && nodeInputs.length > 0) {
    nodeInputs.forEach((inp) => inp.classList.remove("input-focused"));
  } else if (focusedInputElement) {
    focusedInputElement.classList.remove("input-focused");
  }

  if (
    focusedInputElement &&
    (!nodeInputs || !nodeInputs.includes(focusedInputElement))
  ) {
    focusedInputElement.classList.remove("input-focused");
  }

  if (inputElement) {
    inputElement.classList.add("input-focused");
    focusedInputElement = inputElement;
  } else {
    focusedInputElement = null;
  }
}
// Função para resetar o foco do output
function resetOutputFocus() {
  if (focusedOutputElement) {
    focusedOutputElement.classList.remove("output-focused");
  }
  focusedOutputElement = null;
  currentFocusedOutputIndex = -1;

  if (editor.node_selected) {
    // Garante que nenhum output do nó ainda selecionado mantenha o estilo
    const outputs = Array.from(
      editor.node_selected.querySelectorAll(".outputs .output")
    );
    outputs.forEach((out) => out.classList.remove("output-focused"));
  }
}

// Função para destacar um output específico
function highlightOutput(outputElement, nodeOutputs) {
  // Remove destaque anterior de todos os outputs do nó atual
  if (nodeOutputs && nodeOutputs.length > 0) {
    nodeOutputs.forEach((out) => out.classList.remove("output-focused"));
  } else if (focusedOutputElement) {
    // Se não tem nodeOutputs, limpa o foco global se existir
    focusedOutputElement.classList.remove("output-focused");
  }

  if (outputElement) {
    outputElement.classList.add("output-focused");
    focusedOutputElement = outputElement;
    // currentFocusedOutputIndex é atualizado pelo chamador (keydown handler)
  } else {
    // Se outputElement é null, significa que queremos limpar o foco.
    focusedOutputElement = null;
    // O chamador deve resetar currentFocusedOutputIndex
  }
}

function openDrawer(nodeId) {
  if (!nodeId) return;

  // Busca pelo ID no formato "node-2"
  let nodeElement = document.getElementById(`node-${nodeId}`);
  if (!nodeElement) {
    console.error(`Não foi possível encontrar o nó com ID node-${nodeId}`);
    return;
  }

  // Abrir o drawer
  let offcanvas = new bootstrap.Offcanvas(
    document.getElementById("nodeConfigDrawer")
  );
  offcanvas.show();

  // Buscar os dados
  let titleElement = nodeElement.querySelector(".node-title");
  let campoDoNode = nodeElement.querySelector(".camposDoNode");

  $(".conteudoCamposNo").html(campoDoNode ? campoDoNode.innerHTML : "");
  setTimeout(() => {
    const camposDrawer = $(".conteudoCamposNo");

    const moduleName = editor.getModuleFromNodeId(nodeId);
    const nodeData = editor.drawflow.drawflow[moduleName].data[nodeId];
    console.log({ dataaa: nodeData.data });
    // Preenche valores dos campos com base nos atributos df-[key]
    const dataFields = nodeData.data || {};

    document.getElementById("nodeTitle").value = dataFields
      ? dataFields.descricao
      : "";
    Object.entries(dataFields).forEach(([key, value]) => {
      const $inputs = camposDrawer.find(`[df-${key}]`);

      $inputs.each(function () {
        const $input = $(this);
        const type = $input.attr("type");

        if (type === "checkbox") {
          $input.prop(
            "checked",
            value === true || value === "on" || value === "1"
          );
        } else if (type === "radio") {
          if ($input.val() === value) {
            $input.prop("checked", true);
          }
        } else {
          $input.val(value);
        }

        if ($input.prop("isContentEditable")) {
          $input.text(value);
        }
      });
    });

    setTimeout(() => {
      ativarEditorCodigo();
      ativarEditorTexto();
    }, 700);
  }, 500);

  // Guardar o ID
  document.getElementById("nodeConfigDrawer").dataset.nodeId = nodeId;
}

document
  .getElementById("nodeConfigDrawer")
  .addEventListener("hidden.bs.offcanvas", function () {
    setTimeout(() => {
      let drawer = document.getElementById("nodeConfigDrawer");
      let nodeId = drawer.dataset.nodeId; // ID do nó
      const moduleName = editor.getModuleFromNodeId(nodeId);
      const nodeData = editor.drawflow.drawflow[moduleName].data[nodeId];
      let data = nodeData.data;

      // Percorre todos os inputs, selects, textareas que tenham "df-..."
      drawer.querySelectorAll("input, select, textarea").forEach((el) => {
        el.getAttributeNames().forEach((attr) => {
          if (attr.startsWith("df-")) {
            const fieldName = attr.replace("df-", "");
            if (
              el.tagName === "TEXTAREA" &&
              el.classList.contains("valorEditor")
            ) {
              // Extrai o editorId da classe (ex: editor123)
              const editorId = Array.from(el.classList).find((cls) =>
                cls.startsWith("editor")
              );

              if (editorId && editor[editorId]) {
                data[fieldName] = editor[editorId].getValue();
              } else {
                data[fieldName] = el.value; // fallback caso o editor não esteja disponível
              }
            } else if (
              el.tagName === "TEXTAREA" &&
              el.classList.contains("valorTextoEditor")
            ) {
              // Extrai o editorId da classe (ex: editor123)
              const editorId = Array.from(el.classList).find((cls) =>
                cls.startsWith("editor")
              );

              if (editorId && editor[editorId]) {
                data[fieldName] = editor[editorId].root.innerHTML;
              } else {
                data[fieldName] = el.value; // fallback caso o editor não esteja disponível
              }
            } else {
              data[fieldName] = el.value;
            }
          }
        });
      });

      const newTitle = document.getElementById("nodeTitle").value;
      data["descricao"] = newTitle;
      if (nodeId && newTitle) {
        document.querySelector(`#node-${nodeId} .tituloNode`).innerHTML =
          newTitle;
      }
      desativarEditorTexto();
      desativarEditorCodigo();

      // 2. Atualiza o HTML da .camposDoNode no nó
      let nodeEl = document.querySelector(`#node-${nodeId} .camposDoNode`);
      let camposDrawer = drawer.querySelector(".conteudoCamposNo");

      if (nodeEl && camposDrawer) {
        nodeEl.innerHTML = camposDrawer.innerHTML;
      }
      // Atualiza o nó no Drawflow
      if (nodeId) {
        editor.updateNodeDataFromId(nodeId, data);
      }
    }, 500);
  });
var mobile_item_selec = "";
var mobile_last_move = null;
function positionMobile(ev) {
  mobile_last_move = ev;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  if (ev.type === "touchstart") {
    mobile_item_selec = ev.target
      .closest(".drag-drawflow")
      .getAttribute("data-node");
  } else {
    ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
  }
}

function drop(ev) {
  if (ev.type === "touchend") {
    var parentdrawflow = document
      .elementFromPoint(
        mobile_last_move.touches[0].clientX,
        mobile_last_move.touches[0].clientY
      )
      .closest("#drawflow");
    if (parentdrawflow != null) {
      addNodeToDrawFlow(
        mobile_item_selec,
        mobile_last_move.touches[0].clientX,
        mobile_last_move.touches[0].clientY
      );
    }
    mobile_item_selec = "";
  } else {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("node");
    addNodeToDrawFlow(data, ev.clientX, ev.clientY);
  }
}
function addNodeToDrawFlow(
  name,
  pos_x_client,
  pos_y_client,
  data_param = null
) {
  if (editor.editor_mode === "fixed") {
    return false;
  }
  // Conversão de coordenadas do cliente para o canvas
  let pos_x_canvas =
    pos_x_client *
      (editor.precanvas.clientWidth /
        (editor.precanvas.clientWidth * editor.zoom)) -
    editor.precanvas.getBoundingClientRect().x *
      (editor.precanvas.clientWidth /
        (editor.precanvas.clientWidth * editor.zoom));
  let pos_y_canvas =
    pos_y_client *
      (editor.precanvas.clientHeight /
        (editor.precanvas.clientHeight * editor.zoom)) -
    editor.precanvas.getBoundingClientRect().y *
      (editor.precanvas.clientHeight /
        (editor.precanvas.clientHeight * editor.zoom));

  let existe = $(".node-elem-" + name);
  if (existe.length > 0) {
    let valor_html = existe.val(); // HTML do nó
    let dadosEntradaRaw = existe.data("entrada");
    let dadosSaidaRaw = existe.data("saida");
    let dadosParseados;

    if (data_param) {
      dadosParseados = data_param;
    } else {
      dadosParseados = existe.data("dados");
      if (typeof dadosParseados === "string" && dadosParseados.trim() !== "") {
        try {
          dadosParseados = JSON.parse(dadosParseados);
        } catch (e) {
          console.warn("Erro ao parsear dados do nó:", e);
          dadosParseados = {};
        }
      } else if (
        typeof dadosParseados !== "object" ||
        dadosParseados === null
      ) {
        dadosParseados = {};
      }
    }

    // Sua função parseInputOutputData (mantida como você a definiu)
    // Apenas garanta que ela retorne arrays. Se ela já faz isso, ótimo.
    // Para o exemplo, vou assumir que ela está correta e retorna arrays.
    function parseInputOutputData(rawData, type) {
      // Adicionado 'type' para default handling
      if (Array.isArray(rawData)) return rawData;
      let defaultValue = [];
      if (type === "output") {
        // Garantir que saídas tenham um formato default se rawData não for array
        defaultValue = [
          {
            dados: {
              codigo: "default_" + Math.random().toString(36).substring(2, 7),
              personalizado: 0,
            },
          },
        ];
      }

      if (typeof rawData === "string" && rawData.trim() !== "") {
        try {
          const parsed = JSON.parse(rawData);
          return Array.isArray(parsed) ? parsed : defaultValue;
        } catch (e) {
          console.warn(
            "Erro ao parsear dados de entrada/saida string:",
            e,
            rawData
          );
          return defaultValue;
        }
      }
      if (typeof rawData === "number") {
        if (rawData > 0) {
          let itemTemplate =
            type === "output"
              ? { dados: { codigo: "default", personalizado: 0 } }
              : {};
          // Criar cópias distintas para cada item do array
          return Array.from({ length: rawData }, (_, i) =>
            JSON.parse(
              JSON.stringify({
                ...itemTemplate,
                dados: {
                  ...itemTemplate.dados,
                  codigo:
                    (itemTemplate.dados.codigo || "default") + "_" + (i + 1),
                },
              })
            )
          );
        }
        return defaultValue;
      }
      return defaultValue;
    }

    let dadosEntradaArray = parseInputOutputData(dadosEntradaRaw, "input");
    let dadosSaidaArray = parseInputOutputData(dadosSaidaRaw, "output");

    // Preservar o nó fonte e a classe do output se um output estava focado ANTES de adicionar o novo nó
    let sourceNodeForConnection = null;
    let outputClassForAutoConnection = null;
    // Verifique a disponibilidade de focusedOutputElement no escopo correto
    if (
      typeof focusedOutputElement !== "undefined" &&
      focusedOutputElement &&
      editor.node_selected
    ) {
      sourceNodeForConnection = editor.node_selected; // Nó fonte
      for (let cls of focusedOutputElement.classList) {
        if (cls.startsWith("output_") && cls !== "output-focused") {
          outputClassForAutoConnection = cls;
          break;
        }
      }
    }

    // Adicionar o novo nó
    const newNodeId = editor.addNode(
      name,
      dadosEntradaArray,
      dadosSaidaArray,
      pos_x_canvas, // Usar coordenadas do canvas
      pos_y_canvas, // Usar coordenadas do canvas
      name, // classoverride
      dadosParseados, // data
      valor_html, // html
      false // typenode (Drawflow.js default)
    );

    if (newNodeId) {
      // Tentar a conexão automática se aplicável
      if (sourceNodeForConnection && outputClassForAutoConnection) {
        const sourceNodeIdString = sourceNodeForConnection.id.replace(
          "node-",
          ""
        );
        const newNodeData = editor.getNodeFromId(String(newNodeId));
        if (
          newNodeData &&
          newNodeData.inputs &&
          Object.keys(newNodeData.inputs).length > 0
        ) {
          const firstInputClassOfNewNode = Object.keys(newNodeData.inputs)[0];
          editor.addConnection(
            sourceNodeIdString,
            String(newNodeId),
            outputClassForAutoConnection,
            firstInputClassOfNewNode
          );
        }
        // Chame resetOutputFocus se estiver definido e for necessário
        if (typeof resetOutputFocus === "function") {
          resetOutputFocus();
        }
      }

      // LÓGICA DE SELEÇÃO DO NOVO NÓ (SEMPRE EXECUTADA APÓS CRIAÇÃO BEM-SUCEDIDA)
      const newNodeElement = document.getElementById(
        "node-" + String(newNodeId)
      );
      if (newNodeElement) {
        // Deselecionar nó anterior se houver e for diferente
        if (
          editor.node_selected != null &&
          editor.node_selected !== newNodeElement
        ) {
          editor.node_selected.classList.remove("selected");
          editor.dispatch("nodeUnselected", true);
        }
        // Deselecionar conexão anterior se houver
        if (editor.connection_selected != null) {
          editor.connection_selected.classList.remove("selected");
          editor.removeReouteConnectionSelected(); // Função de drawflow.js
          editor.connection_selected = null;
        }

        // Selecionar o novo nó
        editor.ele_selected = newNodeElement; // Essencial para o estado interno do Drawflow
        editor.node_selected = newNodeElement;
        newNodeElement.classList.add("selected");
        editor.dispatch("nodeSelected", String(newNodeId)); // Dispara o evento padrão do Drawflow

        editor.container.focus(); // Focar o container para eventos de teclado
      }
    }
    return; // Fim da lógica para nó existente na paleta
  } // Fim do if (existe.length > 0)

  // Seu switch case original como fallback
  // alert("Elemento de template para " + name + " não encontrado. Usando fallback.");
  // switch (name) { ... } // Se este switch ainda for relevante e adicionar nós,
  // a mesma lógica de seleção acima deve ser replicada para o newNodeId gerado por ele.
}
var transform = "";

function showpopup(e) {
  e.target.closest(".drawflow-node").style.zIndex = "9999";
  e.target.children[0].style.display = "block";
  //document.getElementById("modalfix").style.display = "block";

  //e.target.children[0].style.transform = 'translate('+translate.x+'px, '+translate.y+'px)';
  transform = editor.precanvas.style.transform;
  editor.precanvas.style.transform = "";
  editor.precanvas.style.left = editor.canvas_x + "px";
  editor.precanvas.style.top = editor.canvas_y + "px";
  console.log(transform);

  //e.target.children[0].style.top = -editor.canvas_y - editor.container.offsetTop +'px';
  //e.target.children[0].style.left = -editor.canvas_x - editor.container.offsetLeft +'px';
  editor.editor_mode = "fixed";
}

function closemodal(e) {
  e.target.closest(".drawflow-node").style.zIndex = "2";
  e.target.parentElement.parentElement.style.display = "none";
  //document.getElementById("modalfix").style.display = "none";
  editor.precanvas.style.transform = transform;
  editor.precanvas.style.left = "0px";
  editor.precanvas.style.top = "0px";
  editor.editor_mode = "edit";
}

function changeModule(event) {
  var all = document.querySelectorAll(".menu ul li");
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove("selected");
  }
  event.target.classList.add("selected");
}

function changeMode(option) {
  //console.log(lock.id);
  if (option == "lock") {
    lock.style.display = "none";
    unlock.style.display = "block";
  } else {
    lock.style.display = "block";
    unlock.style.display = "none";
  }
}
function numerarNodesSimples(editor) {
  const data = editor.drawflow.drawflow.Home.data;
  const visitados = new Set();

  function criarMarcadorNumero(nodeId, numero) {
    const nodeEl = document.querySelector(`#node-${nodeId}`);
    if (!nodeEl) return;

    // Remove marcador anterior se existir
    const antigo = nodeEl.querySelector(".node-badge");
    if (antigo) antigo.remove();

    // Cria o badge
    const badge = document.createElement("div");
    badge.className = "node-badge";
    badge.textContent = numero;

    nodeEl.appendChild(badge);
  }

  function percorrer(nodeId) {
    if (visitados.has(nodeId)) return;
    visitados.add(nodeId);

    const node = data[nodeId];
    const outputs = node.outputs;

    let contadorSaida = 1;

    for (let key in outputs) {
      const conexoes = outputs[key]?.connections || [];

      for (let conn of conexoes) {
        const filhoId = conn.node;
        criarMarcadorNumero(filhoId, contadorSaida);
        percorrer(filhoId);
        contadorSaida++;
      }
    }
  }

  // Encontra os nós raiz (sem inputs)
  const roots = Object.entries(data)
    .filter(([_, node]) =>
      Object.values(node.inputs).every((i) => i.connections.length === 0)
    )
    .map(([id]) => id);

  roots.forEach((rootId) => {
    percorrer(rootId);
  });
}
function numerarNodesOrdenados(editor) {
  const data = editor.drawflow.drawflow.Home.data;
  const visitados = new Set();

  function criarMarcadorNumero(nodeId, numero) {
    const nodeEl = document.querySelector(`#node-${nodeId}`);
    if (!nodeEl) return;
    const nodeData = editor.drawflow.drawflow.Home.data[nodeId];
    const dataFields = nodeData.data || {};
    dataFields["sequencial"] = numero;
    editor.updateNodeDataFromId(nodeId, dataFields);
    // evita duplicar badges
    const antigo = nodeEl.querySelector(".node-badge");
    if (antigo) antigo.remove();

    const badge = document.createElement("div");
    badge.className = "node-badge";
    badge.textContent = numero;
    nodeEl.appendChild(badge);
  }

  function ordenarPorTop(nodeIds) {
    return nodeIds
      .filter((id) => document.querySelector(`#node-${id}`)) // filtra os que já existem no DOM
      .sort((a, b) => {
        const elA = document.querySelector(`#node-${a}`);
        const elB = document.querySelector(`#node-${b}`);
        return (
          elA.getBoundingClientRect().top - elB.getBoundingClientRect().top
        );
      });
  }

  function percorrer(nodeId) {
    if (visitados.has(nodeId)) return;
    visitados.add(nodeId);

    const node = data[nodeId];
    if (!node || !node.outputs) return;

    for (let key in node.outputs) {
      const conexoes = node.outputs[key]?.connections || [];
      const filhosOrdenados = ordenarPorTop(conexoes.map((c) => c.node));

      filhosOrdenados.forEach((filhoId, index) => {
        criarMarcadorNumero(filhoId, index + 1);
        percorrer(filhoId);
      });
    }
  }

  // roots = nós sem nenhuma conexão de entrada
  const roots = Object.entries(data)
    .filter(([_, node]) =>
      Object.values(node.inputs).every(
        (input) => input.connections.length === 0
      )
    )
    .map(([id]) => id);

  const rootsOrdenados = ordenarPorTop(roots);

  rootsOrdenados.forEach((rootId, index) => {
    criarMarcadorNumero(rootId, index + 1);
    percorrer(rootId);
  });
}
function alinharDrawflowHierarquicamente(editor) {
  const HOMEMODULE = editor.module;
  if (
    !editor.drawflow.drawflow[HOMEMODULE] ||
    !editor.drawflow.drawflow[HOMEMODULE].data
  ) {
    console.error(
      "Módulo ou dados do módulo não encontrados para alinhamento:",
      HOMEMODULE
    );
    return;
  }
  const data = editor.drawflow.drawflow[HOMEMODULE].data;

  const visitados = new Set();
  const posicoesCalculadas = {};

  const horizontalSpacing = 520; // <--- MODIFICADO
  const verticalSpacing = 80;
  const nodeHeightEstimate = 80;
  const initialXOffset = 100; // <--- MODIFICADO
  const initialYOffset = 50;

  console.log(
    "[Alinhar] Iniciando alinhamento. HSpacing:",
    horizontalSpacing,
    "VSpacing:",
    verticalSpacing
  );

  function calcularPosicoesRecursivo(nodeId, nivel, suggestedY) {
    if (visitados.has(nodeId) && posicoesCalculadas[nodeId]) {
      const elCheck = document.getElementById(`node-${nodeId}`);
      const hCheck = elCheck ? elCheck.offsetHeight : nodeHeightEstimate;
      // console.log(`[Alinhar] Nó ${nodeId} já visitado e posicionado. Retornando Y-borda: ${posicoesCalculadas[nodeId].y + hCheck}`);
      return posicoesCalculadas[nodeId].y + hCheck;
    }
    visitados.add(nodeId);

    const node = data[nodeId];
    if (!node) {
      // console.log(`[Alinhar] Nó ${nodeId} não encontrado nos dados.`);
      return suggestedY;
    }

    const nodeEl = document.getElementById(`node-${nodeId}`);
    const nodeHeight = nodeEl
      ? nodeEl.offsetHeight > 0
        ? nodeEl.offsetHeight
        : nodeHeightEstimate
      : nodeHeightEstimate;

    const posX = initialXOffset + nivel * horizontalSpacing;
    posicoesCalculadas[nodeId] = { x: posX, y: suggestedY };
    console.log(
      `[Alinhar] Posicionando ${nodeId} (Nível ${nivel}): { x: ${posX}, y: ${suggestedY} }, Altura: ${nodeHeight}`
    );

    let currentYForNextSibling = suggestedY;
    let maxBottomYForThisSubtree = suggestedY + nodeHeight;

    const filhos = [];
    if (node.outputs) {
      const filhoSet = new Set();
      Object.values(node.outputs).forEach((output) => {
        (output.connections || []).forEach((conn) => {
          if (data[conn.node]) {
            filhoSet.add(conn.node);
          }
        });
      });
      filhoSet.forEach((fId) => filhos.push(fId));
    }

    console.log(`[Alinhar] Nó ${nodeId} tem ${filhos.length} filhos:`, filhos);

    if (filhos.length > 0) {
      let yParaPrimeiroFilho = suggestedY;

      for (let i = 0; i < filhos.length; i++) {
        const filhoId = filhos[i];
        let yParaEsteFilho;

        if (i === 0) {
          yParaEsteFilho = yParaPrimeiroFilho;
        } else {
          yParaEsteFilho = maxBottomYForThisSubtree + verticalSpacing;
        }

        console.log(
          `  [Alinhar] Chamando para filho ${filhoId} de ${nodeId} com suggestedY: ${yParaEsteFilho}`
        );
        const bottomYDoFilho = calcularPosicoesRecursivo(
          filhoId,
          nivel + 1,
          yParaEsteFilho
        );
        maxBottomYForThisSubtree = Math.max(
          maxBottomYForThisSubtree,
          bottomYDoFilho
        );
      }
    }

    console.log(
      `[Alinhar] Nó ${nodeId} concluído. Retornando maxBottomY: ${maxBottomYForThisSubtree}`
    );
    return maxBottomYForThisSubtree;
  }

  visitados.clear();

  const roots = Object.entries(data)
    .filter(
      ([, nodeDef]) =>
        nodeDef &&
        nodeDef.inputs &&
        Object.values(nodeDef.inputs).every((i) => i.connections.length === 0)
    )
    .map(([id]) => id);

  const rootsOrdenados = roots.sort((a, b) => {
    const elA = document.getElementById(`node-${a}`);
    const elB = document.getElementById(`node-${b}`);
    if (!elA || !elB) return 0;
    return (elA.offsetTop || 0) - (elB.offsetTop || 0);
  });
  console.log("[Alinhar] Nós Raiz Ordenados:", rootsOrdenados);

  let yGlobalAtual = initialYOffset;
  rootsOrdenados.forEach((rootId) => {
    console.log(
      `[Alinhar] Processando árvore raiz ${rootId} com yGlobalAtual: ${yGlobalAtual}`
    );
    const bottomYDaArvore = calcularPosicoesRecursivo(rootId, 0, yGlobalAtual);
    yGlobalAtual = bottomYDaArvore + verticalSpacing * 2;
  });

  console.log(
    "[Alinhar] Posições Calculadas Finais:",
    JSON.parse(JSON.stringify(posicoesCalculadas))
  );
  for (let nodeId in posicoesCalculadas) {
    if (data[nodeId]) {
      const { x, y } = posicoesCalculadas[nodeId];
      const nodeElemento = document.getElementById(`node-${nodeId}`);
      if (nodeElemento) {
        nodeElemento.style.left = `${x}px`;
        nodeElemento.style.top = `${y}px`;
      }
      editor.drawflow.drawflow[HOMEMODULE].data[nodeId].pos_x = x;
      editor.drawflow.drawflow[HOMEMODULE].data[nodeId].pos_y = y;
    }
  }

  Object.keys(data).forEach((nodeId) => {
    if (data[nodeId]) {
      editor.updateConnectionNodes("node-" + nodeId);
    }
  });
  console.log(
    "[Alinhar] Alinhamento hierárquico concluído e conexões atualizadas."
  );
}
function focusViewOnNode(nodeElementToFocus, editorInstance) {
  if (
    !nodeElementToFocus ||
    !editorInstance ||
    !editorInstance.container ||
    !editorInstance.precanvas
  ) {
    console.warn(
      "focusViewOnNode: Elemento do nó ou instância do editor/container/precanvas inválido.",
      nodeElementToFocus,
      editorInstance
    );
    return;
  }

  const nodeCanvasX = nodeElementToFocus.offsetLeft;
  const nodeCanvasY = nodeElementToFocus.offsetTop;
  // Usa uma estimativa se offsetWidth/Height não estiverem disponíveis imediatamente
  const nodeWidth =
    nodeElementToFocus.offsetWidth > 0 ? nodeElementToFocus.offsetWidth : 160;
  const nodeHeight =
    nodeElementToFocus.offsetHeight > 0 ? nodeElementToFocus.offsetHeight : 80;
  const nodeWidthZoomed = nodeWidth * editorInstance.zoom;
  const nodeHeightZoomed = nodeHeight * editorInstance.zoom;
  const containerWidth = editorInstance.container.clientWidth;
  const containerHeight = editorInstance.container.clientHeight;
  const targetViewportX = containerWidth * 0.25; // Nó ficará a 25% da borda esquerda
  const targetViewportY = containerHeight / 2; // Nó ficará centralizado verticalmente

  let new_canvas_x = targetViewportX - nodeCanvasX * editorInstance.zoom;
  let new_canvas_y =
    targetViewportY - nodeCanvasY * editorInstance.zoom - nodeHeightZoomed / 2;

  editorInstance.canvas_x = new_canvas_x;
  editorInstance.canvas_y = new_canvas_y;

  editorInstance.precanvas.style.transform = `translate(${editorInstance.canvas_x}px, ${editorInstance.canvas_y}px) scale(${editorInstance.zoom})`;
  editorInstance.dispatch("translate", {
    x: editorInstance.canvas_x,
    y: editorInstance.canvas_y,
  });
  console.log(`Visão focada no nó ${nodeElementToFocus.id}.`);
}
let undoStack = [];

function saveCurrentState() {
  let currentData = editor.exportJson();

  undoStack.push(currentData);
  if (undoStack.length > 7) undoStack.shift(); // Limita a 7
}

function undoLastAction() {
  if (undoStack.length === 0) return;
  let lastState = undoStack.pop();
  console.log({ lastState: lastState });
  editor.clear();
  editor.import(lastState, true);
}
function setupSelectionAndClipboard(editor) {
  let selectedNodes = new Set();
  let copiedNodes = [];
  let copiedLinks = [];

  function toggleNodeSelection(nodeId) {
    const nodeElement = document.getElementById(`node-${nodeId}`);

    if (selectedNodes.has(nodeId)) {
      selectedNodes.delete(nodeId);
      nodeElement.classList.remove("selected-node");
    } else {
      selectedNodes.add(nodeId);
      nodeElement.classList.add("selected-node");
    }
  }

  function clearSelection() {
    selectedNodes.forEach((nodeId) => {
      const nodeElement = document.getElementById(`node-${nodeId}`);
      if (nodeElement) nodeElement.classList.remove("selected-node");
    });
    selectedNodes.clear();
    let copiedNodes = [];
    let copiedLinks = [];
  }

  function copySelectedNodes() {
    if (selectedNodes.size === 0) return;

    copiedNodes = [];
    copiedLinks = [];

    const nodeIds = [...selectedNodes];

    nodeIds.forEach((nodeId) => {
      const nodeData = editor.getNodeFromId(nodeId);
      copiedNodes.push({
        id: nodeId,
        name: nodeData.name,
        class: nodeData.class,
        data: nodeData.data,
        inputs: nodeData.inputs || [],
        outputs: nodeData.outputs || [],
        pos_x: nodeData.pos_x,
        pos_y: nodeData.pos_y,
      });
    });

    // Copia conexões apenas entre nodes selecionados
    nodeIds.forEach((nodeId) => {
      const node = editor.getNodeFromId(nodeId);
      if (!node.outputs) return;

      Object.entries(node.outputs).forEach(([outputKey, output]) => {
        output.connections.forEach((conn) => {
          if (selectedNodes.has(String(conn.node))) {
            console.log({ connconnconnconn: conn.node, conn: conn });

            copiedLinks.push({
              source: nodeId,
              output: outputKey,
              target: conn.node,
              input: conn.output,
            });
          }
        });
      });
    });

    console.log("Copiados:", copiedNodes, "Conexões:", copiedLinks);
  }

  let pasteMousePosition = { x: 100, y: 100 };

  document.querySelector("#drawflow").addEventListener("click", function (e) {
    const clickedFooter = e.target.closest(".node-footer");

    if (clickedFooter && this.contains(clickedFooter)) {
      return; // Exit the event handler early
    }

    pasteMousePosition.x = e.layerX;
    pasteMousePosition.y = e.layerY;
  });

  function pasteNodes(x, y) {
    if (copiedNodes.length === 0) return;
    saveCurrentState();
    let newIdsMap = {};
    let minX = Math.min(...copiedNodes.map((n) => n.pos_x));
    let minY = Math.min(...copiedNodes.map((n) => n.pos_y));

    copiedNodes.forEach((node) => {
      let offsetX = node.pos_x - minX;
      let offsetY = node.pos_y - minY;

      // Cria dinamicamente o input com os dados
      let tempElem = $(
        `<input type="hidden" class="node-elem-${node.name}" />`
      );
      tempElem.data("entrada", (node.inputs || []).length);
      tempElem.data("saida", (node.outputs || []).length);
      tempElem.data("dados", node.data || {});
      tempElem.val(""); // ou node.name etc.

      $("body").append(tempElem);
      console.log({ name: node.name });
      node.data = { ...node.data, idfixodatabase: "" };

      // Adiciona com offset relativo à posição do clique
      addNodeToDrawFlow(
        node.name,
        pasteMousePosition.x + offsetX,
        pasteMousePosition.y + offsetY,
        node.data
      );

      // Recupera o último ID adicionado
      const currentModule = editor.module || "Home";

      const lastId = Math.max(
        ...Object.keys(editor.drawflow.drawflow[currentModule].data || {}).map(
          Number
        )
      );

      newIdsMap[node.id] = lastId;

      tempElem.remove();
    });

    // Reconectar os nodes colados entre si
    copiedLinks.forEach((link) => {
      const sourceId = newIdsMap[link.source];
      const targetId = newIdsMap[link.target];

      if (sourceId && targetId) {
        console.log({
          origem: sourceId,
          output: targetId,
          destino: link.output,
          input: link.input,
        });
        editor.addConnection(sourceId, targetId, link.output, link.input);
      }
    });

    copiedNodes = [];
    copiedLinks = [];
    clearSelection();
  }

  function deleteSelectedNodes() {
    saveCurrentState();
    selectedNodes.forEach((nodeId) => {
      console.log({ nodeId: nodeId });

      editor.removeNodeId("node-" + nodeId);
    });
    clearSelection();
  }

  // 🎯 Evento para selecionar nodes com Shift + Clique
  editor.on("click", (event) => {
    if (!event.shiftKey) return;

    let node = event.target.closest(".drawflow-node");
    if (node && node.id.startsWith("node-")) {
      let nodeId = node.id.replace("node-", "");
      toggleNodeSelection(nodeId);
    }
  });

  // 🎯 Evento para limpar seleção com duplo clique no fundo
  document.querySelector("#drawflow").addEventListener("dblclick", (event) => {
    if (event.shiftKey) return; // Evita limpar ao segurar Shift
    clearSelection();
  });

  // 🎯 Eventos de teclado para copiar, colar e deletar
  document.addEventListener("keydown", (event) => {
    const drawflow = document.getElementById("drawflow");

    // Verifica se o foco está dentro do #drawflow
    if (!drawflow.contains(document.activeElement)) return;

    if (event.ctrlKey && event.key === "c") {
      event.preventDefault();
      copySelectedNodes();
    }
    if (event.ctrlKey && event.key === "v") {
      event.preventDefault();
      pasteNodes();
    }

    if (event.ctrlKey && event.key === "z") {
      event.preventDefault();
      undoLastAction();
    }

    if (event.key === "Delete") {
      event.preventDefault();
      deleteSelectedNodes();
    }
  });
}
/*
let selectionBox = null;
let startX = 0;
let startY = 0;
let isDragging = false;

const canvas = document.querySelector("#drawflow");
canvas.addEventListener("mousedown", function (e) {
  // Só ativa se Shift estiver pressionado e não clicou em um node
  if (!e.shiftKey || e.target.closest(".drawflow-node")) return;

  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;

  selectionBox = document.createElement("div");
  selectionBox.classList.add("selection-box");
  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  canvas.appendChild(selectionBox);
});


canvas.addEventListener("mousemove", function (e) {
  if (!isDragging || !selectionBox) return;

  const x = e.offsetX;
  const y = e.offsetY;

  const rectX = Math.min(x, startX);
  const rectY = Math.min(y, startY);
  const width = Math.abs(x - startX);
  const height = Math.abs(y - startY);

  Object.assign(selectionBox.style, {
    left: `${rectX}px`,
    top: `${rectY}px`,
    width: `${width}px`,
    height: `${height}px`
  });
});

canvas.addEventListener("mouseup", function (e) {
  if (!isDragging) return;

  isDragging = false;

  const box = selectionBox.getBoundingClientRect();
  document.querySelectorAll(".drawflow-node").forEach(node => {
    const nodeRect = node.getBoundingClientRect();
    const nodeId = node.id.replace("node-", "");

    const inBox = (
      nodeRect.left >= box.left &&
      nodeRect.right <= box.right &&
      nodeRect.top >= box.top &&
      nodeRect.bottom <= box.bottom
    );

    if (inBox) {
      toggleNodeSelection(nodeId);
    }
  });

  if (selectionBox) {
    selectionBox.remove();
    selectionBox = null;
  }
  editor.editor_mode = 'edit';

});

*/
