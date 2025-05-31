var editor;
var id;
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
    console.log("Node selected " + id);
    resetOutputFocus(); // Limpa foco de output anterior
    resetInputFocus(); // Limpa foco de input anterior

    if (!editor.node_selected) {
      // Se o nó foi deselecionado (id pode ser de um nó que não é mais o editor.node_selected)
      return;
    }

    const selectedNodeElement = editor.node_selected; // Garante que estamos usando o nó atualmente selecionado
    const currentId = selectedNodeElement.id.replace("node-", ""); // Pega o ID do nó realmente selecionado
    const outputs = Array.from(
      selectedNodeElement.querySelectorAll(".outputs .output")
    );

    if (outputs.length > 0) {
      let outputToFocus = null;
      let indexOfOutputToFocus = -1;
      const nodeData = editor.getNodeFromId(currentId);

      if (nodeData && nodeData.outputs) {
        // Verifica se nodeData e nodeData.outputs existem
        // Tenta encontrar um output com conexões existentes
        for (let i = 0; i < outputs.length; i++) {
          const outputElement = outputs[i];
          let outputClass = null;
          // Pega a classe do output (ex: output_1)
          for (let cls of outputElement.classList) {
            if (cls.startsWith("output_") && cls !== "output-focused") {
              // Garante que não pega a classe de foco
              outputClass = cls;
              break;
            }
          }
          if (
            outputClass &&
            nodeData.outputs[outputClass] &&
            nodeData.outputs[outputClass].connections.length > 0
          ) {
            outputToFocus = outputElement;
            indexOfOutputToFocus = i;
            console.log("Focando output com conexão existente:", outputClass);
            break;
          }
        }
      } else {
        console.warn(
          "Dados do nó ou outputs não encontrados para o nó selecionado:",
          currentId
        );
      }

      // Se nenhum output com conexão foi encontrado (ou dados do nó falharam), foca o primeiro output da lista
      if (!outputToFocus && outputs.length > 0) {
        // Adiciona verificação se outputs.length > 0 novamente
        outputToFocus = outputs[0];
        indexOfOutputToFocus = 0;
        console.log(
          "Nenhum output com conexão (ou erro nos dados), focando o primeiro output da lista."
        );
      }

      if (outputToFocus) {
        currentFocusedOutputIndex = indexOfOutputToFocus;
        highlightOutput(outputToFocus, outputs);
        console.log("Output focado automaticamente:", outputToFocus.classList);
      }
    }
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

  var elements = document.getElementsByClassName("drag-drawflow");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("touchend", drop, false);
    elements[i].addEventListener("touchmove", positionMobile, false);
    elements[i].addEventListener("touchstart", drag, false);
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

  // ... (seu código existente do document.ready) ...

  // Eventos para resetar o foco do output
  editor.on("nodeSelected", function (id) {
    // console.log("Node selected " + id);
    resetOutputFocus(); // Reseta o foco ao selecionar um novo nó
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

  // Manipulador de keydown para navegação de outputs
  document.addEventListener("keydown", function (event) {
    if (!editor.node_selected) {
      if (focusedOutputElement) {
        // Se um output estava focado e o nó foi deselecionado
        resetOutputFocus();
      }
      return;
    }

    const selectedNodeElement = editor.node_selected;
    const outputs = Array.from(
      selectedNodeElement.querySelectorAll(".outputs .output")
    );

    if (outputs.length === 0) {
      if (focusedOutputElement) {
        // Se estava focado e o nó não tem mais outputs (improvável, mas seguro)
        resetOutputFocus();
      }
      return;
    }

    if (
      event.ctrlKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();

      // Se o nó selecionado mudou desde que o foco foi definido, ou se nenhum output está focado ainda
      if (
        !focusedOutputElement ||
        !selectedNodeElement.contains(focusedOutputElement)
      ) {
        currentFocusedOutputIndex = -1; // Reseta para começar do zero no nó atual
        if (focusedOutputElement)
          focusedOutputElement.classList.remove("output-focused"); // Limpa visualmente o antigo
        focusedOutputElement = null;
      }

      if (event.key === "ArrowUp") {
        currentFocusedOutputIndex--;
        if (currentFocusedOutputIndex < 0) {
          currentFocusedOutputIndex = outputs.length - 1;
        }
      } else if (event.key === "ArrowDown") {
        currentFocusedOutputIndex++;
        if (currentFocusedOutputIndex >= outputs.length) {
          currentFocusedOutputIndex = 0;
        }
      }
      highlightOutput(outputs[currentFocusedOutputIndex], outputs);
    } else if (
      event.key === "ArrowRight" &&
      event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      if (editor.node_selected && focusedOutputElement) {
        // Só ativa se um nó estiver selecionado E um output dele estiver focado
        event.preventDefault();
        console.log("Seta para Direita pressionada com output focado.");

        const parentNodeId = editor.node_selected.id.replace("node-", "");
        let outputClassForNavigation = null;
        // Encontra a classe do output focado, ex: "output_1"
        for (let cls of focusedOutputElement.classList) {
          if (cls.startsWith("output_") && cls !== "output-focused") {
            outputClassForNavigation = cls;
            break;
          }
        }

        if (!outputClassForNavigation) {
          console.warn(
            "Não foi possível determinar a classe do output focado para navegação."
          );
          return; // Sai da função se não encontrar a classe do output
        }

        const parentNodeData = editor.getNodeFromId(parentNodeId);
        if (
          !parentNodeData ||
          !parentNodeData.outputs ||
          !parentNodeData.outputs[outputClassForNavigation]
        ) {
          console.warn(
            "Dados do nó pai ou output específico não encontrados para navegação:",
            parentNodeId,
            outputClassForNavigation
          );
          return; // Sai se não encontrar dados do output
        }

        const outputConnections =
          parentNodeData.outputs[outputClassForNavigation].connections;

        if (outputConnections && outputConnections.length > 0) {
          const firstConnection = outputConnections[0]; // Segue a primeira conexão encontrada
          const childNodeIdString = firstConnection.node; // ID do nó filho (já é string)

          const childNodeElement = document.getElementById(
            "node-" + childNodeIdString
          );

          if (childNodeElement) {
            // 1. Selecionar o nó filho.
            // O evento 'nodeSelected' (disparado abaixo) cuidará de chamar resetOutputFocus.
            if (editor.node_selected) {
              editor.node_selected.classList.remove("selected");
            }
            childNodeElement.classList.add("selected");
            editor.node_selected = childNodeElement; // Define o novo nó como selecionado
            editor.dispatch("nodeSelected", childNodeIdString); // Dispara o evento
            console.log(`Navegou para nó filho: ${childNodeIdString}`);

            // 2. Mover a visão para o nó filho recém-selecionado
            // O setTimeout ajuda a garantir que o DOM e a seleção estejam completamente atualizados.
            setTimeout(() => {
              focusViewOnNode(childNodeElement, editor);
            }, 50); // Pequeno delay, ajuste se necessário
          } else {
            console.warn(
              `Nó filho com ID 'node-${childNodeIdString}' não encontrado no DOM.`
            );
          }
        } else {
          console.log("Output focado não tem conexões para seguir.");
          // Opcional: algum feedback visual ou sonoro indicando que não há para onde ir.
        }
      }
    } // Dentro de document.addEventListener('keydown', function(event) { ... });
    // ... (lógica existente para Ctrl+Setas Output, Seta para Direita, etc.)

    // NOVO: Navegação entre INPUTS com Ctrl+Shift+Setas Cima/Baixo

    // NOVO: Navegação para o nó PAI com Seta para Esquerda
    else if (
      event.key === "ArrowLeft" &&
      event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      if (editor.node_selected && focusedInputElement) {
        // Só ativa se um nó estiver selecionado E um INPUT dele estiver focado
        event.preventDefault();
        console.log("Seta para Esquerda pressionada com input focado.");

        const currentNodeId = editor.node_selected.id.replace("node-", "");
        let inputClassForNavigation = null;
        for (let cls of focusedInputElement.classList) {
          if (cls.startsWith("input_") && cls !== "input-focused") {
            inputClassForNavigation = cls;
            break;
          }
        }

        if (!inputClassForNavigation) {
          console.warn(
            "Não foi possível determinar a classe do input focado para navegação para trás."
          );
          return;
        }

        const currentNodeData = editor.getNodeFromId(currentNodeId);
        if (
          !currentNodeData ||
          !currentNodeData.inputs ||
          !currentNodeData.inputs[inputClassForNavigation]
        ) {
          console.warn(
            "Dados do nó atual ou input específico não encontrados para navegação para trás:",
            currentNodeId,
            inputClassForNavigation
          );
          return;
        }

        const inputConnections =
          currentNodeData.inputs[inputClassForNavigation].connections;

        if (inputConnections && inputConnections.length > 0) {
          const firstConnection = inputConnections[0]; // Geralmente um input tem uma conexão de entrada
          const parentNodeIdString = firstConnection.node; // ID do nó pai
          // const parentOutputClass = firstConnection.input; // Classe do output no nó pai que se conecta a este input

          const parentNodeElement = document.getElementById(
            "node-" + parentNodeIdString
          );

          if (parentNodeElement) {
            // Selecionar o nó pai.
            // O evento 'nodeSelected' (disparado abaixo) cuidará de chamar resetInputFocus e resetOutputFocus,
            // e também tentará focar um output no parentNodeElement.
            if (editor.node_selected) {
              editor.node_selected.classList.remove("selected");
            }
            parentNodeElement.classList.add("selected");
            editor.node_selected = parentNodeElement;
            editor.dispatch("nodeSelected", parentNodeIdString);
            console.log(`Navegou para nó pai: ${parentNodeIdString}`);

            setTimeout(() => {
              focusViewOnNode(parentNodeElement, editor);
            }, 50);
          } else {
            console.warn(
              `Nó pai com ID 'node-${parentNodeIdString}' não encontrado no DOM.`
            );
          }
        } else {
          console.log(
            "Input focado não tem conexões de entrada para seguir para trás."
          );
        }
      }
    }
    // ... fim do document.addEventListener('keydown', function(event) { ... }); Ex: });
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
// Adicione esta função para limpar o foco do input
function resetInputFocus() {
  if (focusedInputElement) {
    focusedInputElement.classList.remove("input-focused");
  }
  focusedInputElement = null;
  currentFocusedInputIndex = -1;
  // Garante limpeza visual se um nó ainda estiver selecionado
  if (editor.node_selected) {
    const inputs = Array.from(
      editor.node_selected.querySelectorAll(".inputs .input")
    );
    inputs.forEach((inp) => inp.classList.remove("input-focused"));
  }
}
// Adicione esta função para destacar um input
function highlightInput(inputElement, nodeInputs) {
  // Limpa foco de todos os inputs do nó atual
  if (nodeInputs && nodeInputs.length > 0) {
    nodeInputs.forEach((inp) => inp.classList.remove("input-focused"));
  } else if (focusedInputElement) {
    // Fallback para limpar o foco global se nodeInputs não for fornecido
    focusedInputElement.classList.remove("input-focused");
  }

  // Limpa o antigo focusedInputElement se ele não estiver na lista atual de inputs do nó
  if (
    focusedInputElement &&
    (!nodeInputs || !nodeInputs.includes(focusedInputElement))
  ) {
    focusedInputElement.classList.remove("input-focused");
  }

  if (inputElement) {
    inputElement.classList.add("input-focused");
    focusedInputElement = inputElement;
    // currentFocusedInputIndex deve ser atualizado pelo chamador
  } else {
    focusedInputElement = null; // Se inputElement for null, limpa o foco
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

function addNodeToDrawFlow(name, pos_x, pos_y, data = null) {
  if (editor.editor_mode === "fixed") {
    return false;
  }
  pos_x =
    pos_x *
      (editor.precanvas.clientWidth /
        (editor.precanvas.clientWidth * editor.zoom)) -
    editor.precanvas.getBoundingClientRect().x *
      (editor.precanvas.clientWidth /
        (editor.precanvas.clientWidth * editor.zoom));
  pos_y =
    pos_y *
      (editor.precanvas.clientHeight /
        (editor.precanvas.clientHeight * editor.zoom)) -
    editor.precanvas.getBoundingClientRect().y *
      (editor.precanvas.clientHeight /
        (editor.precanvas.clientHeight * editor.zoom));

  let existe = $(".node-elem-" + name);
  if (existe.length > 0) {
    // Checa se o elemento existe
    let valor = existe.val(); // HTML do nó
    let dadosEntradaRaw = existe.data("entrada");
    let dadosSaidaRaw = existe.data("saida");
    let dadosParseados;

    if (data) {
      // Se dados são passados diretamente (ex: ao colar)
      dadosParseados = data;
    } else {
      // Pega do data-attribute
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

    function parseInputOutputData(rawData, defaultValue = []) {
      if (Array.isArray(rawData)) return rawData;
      if (typeof rawData === "string" && rawData.trim() !== "") {
        try {
          const parsed = JSON.parse(rawData);
          return Array.isArray(parsed) ? parsed : defaultValue;
        } catch (e) {
          console.warn("Erro ao parsear dados de entrada/saida:", e, rawData);
          return defaultValue;
        }
      }
      if (typeof rawData === "number") {
        // Se for um número, cria um array com essa quantidade de itens padrão
        if (rawData > 0) {
          // Para saídas, você pode querer um objeto padrão mais específico
          let defaultItem =
            arguments.length > 1 && arguments[0] === dadosSaidaRaw
              ? { dados: { codigo: "default", personalizado: 0 } }
              : {};
          return new Array(rawData).fill(defaultItem);
        }
        return defaultValue;
      }
      return defaultValue;
    }

    let dadosEntradaArray = parseInputOutputData(dadosEntradaRaw);
    let dadosSaidaArray = parseInputOutputData(dadosSaidaRaw);

    const newNodeId = editor.addNode(
      name,
      dadosEntradaArray,
      dadosSaidaArray,
      pos_x,
      pos_y,
      name,
      dadosParseados,
      valor
    );

    // Lógica de conexão se um output estava focado (similar à da paleta)
    if (newNodeId && focusedOutputElement && editor.node_selected) {
      const sourceNodeId = editor.node_selected.id.replace("node-", "");
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
          const firstInputClass = Object.keys(newNodeData.inputs)[0];
          editor.addConnection(
            sourceNodeId,
            String(newNodeId),
            outputClassForConnection,
            firstInputClass
          );
          // DENTRO do setTimeout na função addNodeToDrawFlow:
          const newNodeElement_dd = document.getElementById(
            "node-" + String(newNodeId)
          ); // Note a variável _dd
          if (newNodeElement_dd) {
            // a. Selecionar o novo nó
            if (editor.node_selected) {
              editor.node_selected.classList.remove("selected");
            }
            newNodeElement_dd.classList.add("selected");
            editor.node_selected = newNodeElement_dd;
            editor.dispatch("nodeSelected", String(newNodeId));
            console.log(`[DragDrop] Nó ${newNodeId} selecionado.`);

            // b. Mover a visão para o novo nó usando a função auxiliar
            focusViewOnNode(newNodeElement_dd, editor);
          } else {
            console.warn(
              `[DragDrop] Elemento do nó ${newNodeId} não encontrado após alinhamento para focar visão.`
            );
          }
        }
      }
      resetOutputFocus();
    }
    return; // Retorna após adicionar o nó
  }

  // O switch case abaixo é um fallback se ".node-elem-" + name não for encontrado.
  // Se sua paleta sempre cria os elementos ".node-elem-", este fallback pode não ser necessário.
  // alert("Elemento de template para " + name + " não encontrado. Usando fallback.");
  // switch (name) { ... seu switch case ... }
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

  const horizontalSpacing = 640; // <--- MODIFICADO
  const verticalSpacing = 100;
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
