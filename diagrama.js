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

  // --- LÓGICA DO "ENTER" ATUALIZADA ---
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
            const nodeCodigo = $itemToAdd.data("node"); // Seu $elemento['codigo']
            const $textarea = $itemToAdd.find(
              "textarea.node-elem-" + nodeCodigo
            );

            if ($textarea.length) {
              // Função auxiliar para parsear JSON de forma segura
              function safeJsonParse(dataString, defaultValue = {}) {
                if (typeof dataString === "object" && dataString !== null) {
                  // jQuery .data() pode já ter parseado
                  return dataString;
                }
                if (
                  typeof dataString === "string" &&
                  dataString.trim() !== ""
                ) {
                  try {
                    return JSON.parse(dataString);
                  } catch (err) {
                    console.warn(
                      `Erro ao parsear JSON: "${dataString}". Usando valor padrão.`,
                      err
                    );
                    return defaultValue;
                  }
                }
                return defaultValue; // Retorna default para undefined, null, ou string vazia
              }

              const nodeInternalData = safeJsonParse($textarea.data("dados"));
              const nodeInputsData = safeJsonParse($textarea.data("entrada")); // Para definir conexões de entrada
              const nodeOutputsData = safeJsonParse($textarea.data("saida")); // Para definir conexões de saída
              const nodeHtmlContent = $textarea.val(); // Seu $elemento['elemento'] (HTML ou tipo do nó)

              let posX = 100,
                posY = 100; // Posições padrão
              // Tenta obter uma posição mais inteligente se o editor Drawflow estiver acessível
              if (
                typeof editor !== "undefined" &&
                editor &&
                typeof editor.getCanvas === "function"
              ) {
                // Verifica se editor e um método existem
                // Posição relativa ao centro da área visível do canvas
                const canvasCenter = editor.getCanvasCenter(); // Supondo que exista um método assim
                posX = Math.round(canvasCenter.x - 50); // Ajuste para centralizar o nó
                posY = Math.round(canvasCenter.y - 20);
              } else if (
                typeof editor !== "undefined" &&
                editor &&
                editor.canvas_x !== undefined
              ) {
                // Fallback para usar canvas_x/y se getCanvasCenter não existir
                posX = Math.round(
                  editor.canvas_x +
                    editor.container.clientWidth / 2 / editor.zoom -
                    50
                );
                posY = Math.round(
                  editor.canvas_y +
                    editor.container.clientHeight / 2 / editor.zoom -
                    20
                );
              }

              console.groupCollapsed(
                `[Enter Key] Preparando para adicionar nó: ${nodeCodigo}`
              );
              console.log("Dados extraídos da paleta para o nó:", {
                codigo: nodeCodigo,
                htmlContent: nodeHtmlContent,
                internalData: nodeInternalData,
                inputsStructure: nodeInputsData,
                outputsStructure: nodeOutputsData,
                posX: posX,
                posY: posY,
              });
              console.groupEnd();

              // **AÇÃO CRÍTICA: Adicionar o nó ao Drawflow**
              if (
                typeof editor !== "undefined" &&
                typeof editor.addNode === "function"
              ) {
                // **COMO OS DADOS SÃO USADOS EM editor.addNode:**
                // A forma exata de usar nodeInputsData e nodeOutputsData para definir
                // o número de inputs/outputs depende da sua implementação do Drawflow e da estrutura desses dados.
                // Exemplo comum: se forem objetos, Object.keys(obj).length; se forem arrays, array.length.
                // Se eles já contêm a estrutura de conexão detalhada, podem ser passados de outra forma.

                let numInputs = 0;
                if (nodeInputsData && typeof nodeInputsData === "object") {
                  numInputs = Object.keys(nodeInputsData).length; // Exemplo: {"in_1":{...}, "in_2":{...}} -> 2 inputs
                } else if (Array.isArray(nodeInputsData)) {
                  numInputs = nodeInputsData.length;
                }
                // Adicione lógica similar para numOutputs se necessário

                let numOutputs = 0;
                if (nodeOutputsData && typeof nodeOutputsData === "object") {
                  numOutputs = Object.keys(nodeOutputsData).length;
                } else if (Array.isArray(nodeOutputsData)) {
                  numOutputs = nodeOutputsData.length;
                }

                // Verifique a assinatura exata de editor.addNode na sua versão/implementação!
                // editor.addNode(name, inputs, outputs, posx, posy, classNode, data, html, typenode);
                editor.addNode(
                  nodeCodigo, // Geralmente o nome/tipo que o Drawflow reconhece
                  numInputs,
                  numOutputs,
                  posX,
                  posY,
                  nodeCodigo, // Classe CSS para o nó (pode ser o mesmo que o nome/código)
                  nodeInternalData, // Os dados internos parseados
                  nodeHtmlContent, // O HTML/conteúdo do nó (de $elemento['elemento'])
                  false // `typenode`, se necessário. Se nodeHtmlContent for um nome de componente, pode ser false.
                );
                console.log(
                  `[Enter Key] Nó '${nodeCodigo}' foi enviado para editor.addNode.`
                );
                $searchInput.val("").trigger("input"); // Limpa a busca e re-filtra
              } else {
                console.error(
                  "[Enter Key] A variável 'editor' ou a função 'editor.addNode' não está definida no escopo global. Não é possível adicionar o nó programaticamente."
                );
                alert(
                  "Erro ao tentar adicionar o nó: editor não configurado corretamente. Verifique o console."
                );
              }
            } else {
              console.warn(
                `[Enter Key] Textarea com dados para o nó ${nodeCodigo} não encontrada.`
              );
            }
          }
        }
      }
    }
  );
});
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
  if (existe) {
    let valor = existe.val();
    let entrada = existe.data("entrada");
    let saida = existe.data("saida");
    let dados;
    if (data) {
      dados = data;
    } else {
      dados = existe.data("dados");
      if (dados) {
        dados = JSON.parse(JSON.stringify(dados));
      } else {
        dados = {};
      }
    }

    editor.addNode(name, entrada, saida, pos_x, pos_y, "", dados, valor);
    return;
  }
  alert("ops");
  switch (name) {
    case "facebook":
      var facebook = `
  <div>
  <div class="title-box"><i class="fab fa-facebook"></i> Facebook Message</div>
  </div>
  `;
      editor.addNode("facebook", 0, 1, pos_x, pos_y, "facebook", {}, facebook);
      break;
    case "slack":
      var slackchat = `
  <div>
    <div class="title-box"><i class="fab fa-slack"></i> Slack chat message</div>
  </div>
  `;
      editor.addNode("slack", 1, 0, pos_x, pos_y, "slack", {}, slackchat);
      break;
    case "github":
      var githubtemplate = `
  <div>
    <div class="title-box"><i class="fab fa-github "></i> Github Stars</div>
    <div class="box">
      <p>Enter repository url</p>
      <input type="text" df-name>
    </div>
  </div>
  `;
      editor.addNode(
        "github",
        0,
        1,
        pos_x,
        pos_y,
        "github",
        {
          name: "",
        },
        githubtemplate
      );
      break;
    case "telegram":
      var telegrambot = `
  <div>
    <div class="title-box"><i class="fab fa-telegram-plane"></i> Telegram bot</div>
    <div class="box">
      <p>Send to telegram</p>
      <p>select channel</p>
      <select df-channel>
        <option value="channel_1">Channel 1</option>
        <option value="channel_2">Channel 2</option>
        <option value="channel_3">Channel 3</option>
        <option value="channel_4">Channel 4</option>
      </select>
    </div>
  </div>
  `;
      editor.addNode(
        "telegram",
        1,
        0,
        pos_x,
        pos_y,
        "telegram",
        {
          channel: "channel_3",
        },
        telegrambot
      );
      break;
    case "aws":
      var aws = `
  <div>
    <div class="title-box"><i class="fab fa-aws"></i> Aws Save </div>
    <div class="box">
      <p>Save in aws</p>
      <input type="text" df-db-dbname placeholder="DB name"><br><br>
      <input type="text" df-db-key placeholder="DB key">
      <p>Output Log</p>
    </div>
  </div>
  `;
      editor.addNode(
        "aws",
        1,
        1,
        pos_x,
        pos_y,
        "aws",
        {
          db: {
            dbname: "",
            key: "",
          },
        },
        aws
      );
      break;
    case "log":
      var log = `
  <div>
    <div class="title-box"><i class="fas fa-file-signature"></i> Save log file </div>
  </div>
  `;
      editor.addNode("log", 1, 0, pos_x, pos_y, "log", {}, log);
      break;
    case "google":
      var google = `
  <div>
    <div class="title-box"><i class="fab fa-google-drive"></i> Google Drive save </div>
  </div>
  `;
      editor.addNode("google", 1, 0, pos_x, pos_y, "google", {}, google);
      break;
    case "email":
      var email = `
  <div>
    <div class="title-box"><i class="fas fa-at"></i> Send Email </div>
  </div>
  `;
      editor.addNode("email", 1, 0, pos_x, pos_y, "email", {}, email);
      break;

    case "template":
      var template = `
  <div>
    <div class="title-box"><i class="fas fa-code"></i> Template</div>
    <div class="box">
      Ger Vars
      <textarea df-template></textarea>
      Output template with vars
    </div>
  </div>
  `;
      editor.addNode(
        "template",
        1,
        1,
        pos_x,
        pos_y,
        "template",
        {
          template: "Write your template",
        },
        template
      );
      break;
    case "multiple":
      var multiple = `
  <div>
    <div class="box">
      Multiple!
    </div>
  </div>
  `;
      editor.addNode("multiple", 3, 4, pos_x, pos_y, "multiple", {}, multiple);
      break;
    case "personalized":
      var personalized = `
  <div>
    Personalized
  </div>
  `;
      editor.addNode(
        "personalized",
        1,
        1,
        pos_x,
        pos_y,
        "personalized",
        {},
        personalized
      );
      break;
    case "dbclick":
      var dbclick = `
  <div>
    <div class="title-box"><i class="fas fa-mouse"></i> Db Click</div>
    <div class="box dbclickbox" ondblclick="showpopup(event)">
      Db Click here
      <div class="modal" style="display:none">
        <div class="modal-content">
          <span class="close" onclick="closemodal(event)">&times;</span>
          Change your variable {name} !
          <input type="text" df-name>
        </div>

      </div>
    </div>
  </div>
  `;
      editor.addNode(
        "dbclick",
        1,
        1,
        pos_x,
        pos_y,
        "dbclick",
        {
          name: "",
        },
        dbclick
      );
      break;

    default:
  }
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
  const data = editor.drawflow.drawflow.Home.data;
  const visitados = new Set();
  const posicoes = {};
  const conexoesSalvas = [];

  const horizontalSpacing = 300;
  const verticalSpacing = 100;

  // 1️⃣ 🔄 Salvar todas as conexões antes de remover
  for (let nodeId in data) {
    const node = data[nodeId];
    for (let key in node.outputs) {
      node.outputs[key].connections.forEach((conexao) => {
        conexoesSalvas.push({
          origem: nodeId,
          output: key,
          destino: conexao.node,
          input: conexao.input,
        });
      });
    }
  }

  function distribuirFilhos(nodeId, nivel, yInicial) {
    if (visitados.has(nodeId)) return yInicial;
    visitados.add(nodeId);
    const node = data[nodeId];
    if (!node) return yInicial;

    const filhos = [];

    for (let key in node.outputs) {
      const conexoes = node.outputs[key]?.connections || [];
      conexoes.forEach((c) => filhos.push(c.node));
    }

    const filhosOrdenados = filhos.sort((a, b) => {
      const elA = document.querySelector(`#node-${a}`);
      const elB = document.querySelector(`#node-${b}`);
      if (!elA || !elB) return 0;
      return elA.getBoundingClientRect().top - elB.getBoundingClientRect().top;
    });

    const x = nivel * horizontalSpacing;
    let yAtual = yInicial;

    posicoes[nodeId] = { x, y: yAtual };
    yAtual += verticalSpacing;

    filhosOrdenados.forEach((filhoId) => {
      yAtual = distribuirFilhos(filhoId, nivel + 1, yAtual);
    });

    return yAtual;
  }

  // Encontrar nodes raiz
  const roots = Object.entries(data)
    .filter(([_, node]) =>
      Object.values(node.inputs).every((i) => i.connections.length === 0)
    )
    .map(([id]) => id);

  const rootsOrdenados = roots.sort((a, b) => {
    const elA = document.querySelector(`#node-${a}`);
    const elB = document.querySelector(`#node-${b}`);
    if (!elA || !elB) return 0;
    return elA.getBoundingClientRect().top - elB.getBoundingClientRect().top;
  });

  let yInicial = 100;
  rootsOrdenados.forEach((rootId) => {
    yInicial = distribuirFilhos(rootId, 0, yInicial);
  });

  // 3️⃣ 📍 Atualizar posições dos nodes
  for (let nodeId in posicoes) {
    const { x, y } = posicoes[nodeId];
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (!nodeEl) continue;

    nodeEl.style.left = `${x}px`;
    nodeEl.style.top = `${y}px`;

    editor.drawflow.drawflow.Home.data[nodeId].pos_x = x;
    editor.drawflow.drawflow.Home.data[nodeId].pos_y = y;
  }

  // 4️⃣ 🔗 Restaurar todas as conexões
  setTimeout(() => {
    conexoesSalvas.forEach(({ origem, output, destino, input }) => {
      editor.addConnection(origem, destino, output, input);
    });
  }, 200); // Pequeno delay para evitar conflitos de renderização
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
