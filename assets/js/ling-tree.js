document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre.ling-tree").forEach((pre) => {
    const raw = pre.textContent.trim();
    const { treeText, moves } = splitTreeAndMoves(raw);
    const tokens = tokenize(treeText);
    const ast = parseTree(tokens);

    const wrapper = document.createElement("div");
    wrapper.className = "ling-tree-rendered";

    const treeDom = renderNode(ast);
    wrapper.appendChild(treeDom);

    pre.insertAdjacentElement("afterend", wrapper);

    requestAnimationFrame(() => {
      drawArrows(wrapper, moves);
    });
  });
});

function splitTreeAndMoves(raw) {
  const lines = raw.split(/\n/);
  const treeLines = [];
  const moves = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("@move")) {
      const match = trimmed.match(/^@move\s+([A-Za-z0-9_-]+)\s*->\s*([A-Za-z0-9_-]+)(?:\s+"([^"]+)")?/);
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

  function pushCurrent() {
    if (current.trim()) {
      tokens.push(current.trim());
    }
    current = "";
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === "[" || ch === "]") {
      pushCurrent();
      tokens.push(ch);
    } else if (/\s/.test(ch)) {
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
      throw new Error("Expected '[' at token " + pos);
    }

    pos++;

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
      throw new Error("Expected ']' at token " + pos);
    }

    pos++;

    return {
      type: "node",
      label,
      id,
      children
    };
  }

  return parseNode();
}

function parseLabel(raw) {
  const match = raw.match(/^([^#]+)(?:#([A-Za-z0-9_-]+))?$/);

  return {
    label: match ? match[1] : raw,
    id: match ? match[2] : null
  };
}

function renderNode(node) {
  if (node.type === "terminal") {
    const span = document.createElement("span");
    span.className = "tree-terminal";

    if (isDeleted(node.text)) {
      span.classList.add("tree-deleted");
      span.textContent = stripDeletion(node.text);
    } else {
      span.textContent = node.text;
    }

    return span;
  }

  const el = document.createElement("span");
  el.className = "tree-node";

  if (node.children.length > 0) {
    el.classList.add("has-children");
  }

  if (node.id) {
    el.dataset.treeId = node.id;
  }

  const label = document.createElement("span");
  label.className = "tree-label";

  if (isDeleted(node.label)) {
    label.classList.add("tree-deleted");
    label.textContent = stripDeletion(node.label);
  } else {
    label.textContent = node.label;
  }

  el.appendChild(label);

  if (node.children.length > 0) {
    const children = document.createElement("span");
    children.className = "tree-children";

    node.children.forEach((child) => {
      children.appendChild(renderNode(child));
    });

    el.appendChild(children);
  }

  return el;
}

function isDeleted(text) {
  return /^~~.*~~$/.test(text);
}

function stripDeletion(text) {
  return text.replace(/^~~/, "").replace(/~~$/, "");
}

function drawArrows(wrapper, moves) {
  if (!moves.length) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("tree-arrows");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");

  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "8");
  marker.setAttribute("markerHeight", "8");
  marker.setAttribute("refX", "7");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");

  const arrowHead = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowHead.setAttribute("d", "M0,0 L7,3 L0,6 Z");
  arrowHead.setAttribute("fill", "#555");

  marker.appendChild(arrowHead);
  defs.appendChild(marker);
  svg.appendChild(defs);

  wrapper.appendChild(svg);

  const wrapperBox = wrapper.getBoundingClientRect();

  moves.forEach((move) => {
    const fromEl = wrapper.querySelector(`[data-tree-id="${move.from}"]`);
    const toEl = wrapper.querySelector(`[data-tree-id="${move.to}"]`);

    if (!fromEl || !toEl) return;

    const fromBox = fromEl.getBoundingClientRect();
    const toBox = toEl.getBoundingClientRect();

    const x1 = fromBox.left + fromBox.width / 2 - wrapperBox.left;
    const y1 = fromBox.bottom - wrapperBox.top;

    const x2 = toBox.left + toBox.width / 2 - wrapperBox.left;
    const y2 = toBox.bottom - wrapperBox.top;

    const lift = Math.max(45, Math.abs(x2 - x1) * 0.25);
    const c1x = x1;
    const c1y = y1 + lift;
    const c2x = x2;
    const c2y = y2 + lift;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("tree-arrow-path");
    path.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`);
    svg.appendChild(path);

    if (move.label) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.classList.add("tree-arrow-label");
      text.setAttribute("x", (x1 + x2) / 2);
      text.setAttribute("y", Math.max(y1, y2) + lift * 0.65);
      text.setAttribute("text-anchor", "middle");
      text.textContent = move.label;
      svg.appendChild(text);
    }
  });
}
