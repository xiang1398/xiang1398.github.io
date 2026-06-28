document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre.ling-tree").forEach((pre) => {
    const raw = pre.textContent.trim();
    const { treeText, moves } = splitTreeAndMoves(raw);

    try {
      const tokens = tokenize(treeText);
      const ast = parseTree(tokens);

      const rendered = document.createElement("div");
      rendered.className = "ling-tree-rendered";

      const inner = document.createElement("div");
      inner.className = "ling-tree-inner";

      const treeDom = renderNode(ast);
      inner.appendChild(treeDom);
      rendered.appendChild(inner);

      const svg = createSvg();
      rendered.appendChild(svg);

      pre.insertAdjacentElement("afterend", rendered);

      requestAnimationFrame(() => {
        drawBranches(rendered);
        drawMoves(rendered, moves);
      });

      window.addEventListener("resize", debounce(() => {
        clearSvg(rendered);
        drawBranches(rendered);
        drawMoves(rendered, moves);
      }, 150));
    } catch (error) {
      console.error("ling-tree parse error:", error);
      pre.insertAdjacentHTML(
        "afterend",
        `<div class="ling-tree-error">수형도 파싱 오류: ${escapeHtml(error.message)}</div>`
      );
    }
  });
});

function splitTreeAndMoves(raw) {
  const lines = raw.split(/\n/);
  const treeLines = [];
  const moves = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("@move")) {
      const match = trimmed.match(
        /^@move\s+([A-Za-z0-9_-]+)\s*->\s*([A-Za-z0-9_-]+)(?:\s+"([^"]+)")?/
      );

      if (match) {
        moves.push({
          from: match[1],
          to: match[2],
          label: match[3] || ""
        });
      }
    } else {
      treeLines.push(line);
    }
  }

  return {
    treeText: treeLines.join("\n"),
    moves
  };
}

function tokenize(input) {
  const tokens = [];
  let current = "";
  let inDeletion = false;

  function pushCurrent() {
    if (current.trim()) {
      tokens.push(current.trim());
    }
    current = "";
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (input.slice(i, i + 2) === "~~") {
      current += "~~";
      i++;
      inDeletion = !inDeletion;
      continue;
    }

    if (!inDeletion && (ch === "[" || ch === "]")) {
      pushCurrent();
      tokens.push(ch);
    } else if (!inDeletion && /\s/.test(ch)) {
      pushCurrent();
    } else {
      current += ch;
    }
  }

  pushCurrent();
  return tokens;
}

function parseTree(tokens) {
  let pos = 0;

  function parseNode() {
    if (tokens[pos] !== "[") {
      throw new Error(`Expected '[' at token ${pos}: ${tokens[pos]}`);
    }

    pos++;

    if (!tokens[pos]) {
      throw new Error("Missing node label");
    }

    const rawLabel = tokens[pos++];
    const { label, id } = parseLabel(rawLabel);
    const children = [];

    while (pos < tokens.length && tokens[pos] !== "]") {
      if (tokens[pos] === "[") {
        children.push(parseNode());
      } else {
        children.push({
          type: "terminal",
          text: tokens[pos++]
        });
      }
    }

    if (tokens[pos] !== "]") {
      throw new Error(`Expected ']' near token ${pos}`);
    }

    pos++;

    return {
      type: "node",
      label,
      id,
      children
    };
  }

  const ast = parseNode();

  if (pos < tokens.length) {
    throw new Error(`Unexpected token after tree: ${tokens[pos]}`);
  }

  return ast;
}

function parseLabel(raw) {
  const match = raw.match(/^([^#]+)(?:#([A-Za-z0-9_-]+))?$/);

  return {
    label: match ? match[1] : raw,
    id: match ? match[2] : null
  };
}

function renderNode(node) {
  const wrap = document.createElement("div");
  wrap.className = "tree-unit";

  if (node.type === "terminal") {
    wrap.classList.add("tree-terminal-unit");

    const item = document.createElement("span");
    item.className = "tree-item tree-terminal";

    if (isDeleted(node.text)) {
      item.classList.add("tree-deleted");
      item.textContent = stripDeletion(node.text);
    } else {
      item.textContent = node.text;
    }

    wrap.appendChild(item);
    return wrap;
  }

  wrap.classList.add("tree-nonterminal-unit");

  if (node.id) {
    wrap.dataset.treeId = node.id;
  }

  const label = document.createElement("span");
  label.className = "tree-item tree-label";

  if (isDeleted(node.label)) {
    label.classList.add("tree-deleted");
    label.textContent = stripDeletion(node.label);
  } else {
    label.textContent = node.label;
  }

  wrap.appendChild(label);

  if (node.children.length > 0) {
    const children = document.createElement("div");
    children.className = "tree-children";

    node.children.forEach((child) => {
      children.appendChild(renderNode(child));
    });

    wrap.appendChild(children);
  }

  return wrap;
}

function createSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("tree-svg");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "tree-arrowhead");
  marker.setAttribute("markerWidth", "8");
  marker.setAttribute("markerHeight", "8");
  marker.setAttribute("refX", "7");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");
  marker.setAttribute("markerUnits", "strokeWidth");

  const head = document.createElementNS("http://www.w3.org/2000/svg", "path");
  head.setAttribute("d", "M0,0 L7,3 L0,6 Z");
  head.setAttribute("fill", "currentColor");

  marker.appendChild(head);
  defs.appendChild(marker);
  svg.appendChild(defs);

  return svg;
}

function clearSvg(rendered) {
  const svg = rendered.querySelector(".tree-svg");
  [...svg.querySelectorAll(".tree-branch, .tree-move, .tree-move-label")].forEach((el) => {
    el.remove();
  });
}

function drawBranches(rendered) {
  const svg = rendered.querySelector(".tree-svg");
  const root = rendered.querySelector(":scope > .ling-tree-inner > .tree-unit");
  if (!root) return;

  const box = rendered.getBoundingClientRect();

  rendered.querySelectorAll(".tree-nonterminal-unit").forEach((parent) => {
    const parentItem = parent.querySelector(":scope > .tree-item");
    const children = parent.querySelectorAll(":scope > .tree-children > .tree-unit");

    children.forEach((child) => {
      const childItem = child.querySelector(":scope > .tree-item");
      if (!parentItem || !childItem) return;

      const p = centerBottom(parentItem, box);
      const c = centerTop(childItem, box);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.classList.add("tree-branch");
      line.setAttribute("x1", p.x);
      line.setAttribute("y1", p.y + 4);
      line.setAttribute("x2", c.x);
      line.setAttribute("y2", c.y - 4);

      svg.appendChild(line);
    });
  });
}

function drawMoves(rendered, moves) {
  if (!moves.length) return;

  const svg = rendered.querySelector(".tree-svg");
  const box = rendered.getBoundingClientRect();

  moves.forEach((move, index) => {
    const fromUnit = rendered.querySelector(`[data-tree-id="${move.from}"]`);
    const toUnit = rendered.querySelector(`[data-tree-id="${move.to}"]`);

    if (!fromUnit || !toUnit) return;

    const fromItem = fromUnit.querySelector(":scope > .tree-item");
    const toItem = toUnit.querySelector(":scope > .tree-item");

    if (!fromItem || !toItem) return;

    const from = centerBottom(fromItem, box);
    const to = centerBottom(toItem, box);

    const lower = Math.max(from.y, to.y) + 48 + index * 22;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("tree-move");

    path.setAttribute(
      "d",
      [
        `M ${from.x} ${from.y + 8}`,
        `C ${from.x} ${lower}, ${to.x} ${lower}, ${to.x} ${to.y + 8}`
      ].join(" ")
    );

    svg.appendChild(path);

    if (move.label) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.classList.add("tree-move-label");
      text.setAttribute("x", (from.x + to.x) / 2);
      text.setAttribute("y", lower + 18);
      text.setAttribute("text-anchor", "middle");
      text.textContent = move.label;
      svg.appendChild(text);
    }
  });
}

function centerTop(el, containerBox) {
  const r = el.getBoundingClientRect();

  return {
    x: r.left + r.width / 2 - containerBox.left,
    y: r.top - containerBox.top
  };
}

function centerBottom(el, containerBox) {
  const r = el.getBoundingClientRect();

  return {
    x: r.left + r.width / 2 - containerBox.left,
    y: r.bottom - containerBox.top
  };
}

function isDeleted(text) {
  return /^~~.*~~$/.test(text);
}

function stripDeletion(text) {
  return text.replace(/^~~/, "").replace(/~~$/, "");
}

function debounce(fn, delay) {
  let timer = null;

  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
