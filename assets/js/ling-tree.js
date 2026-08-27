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
        fitTreeToContainer(rendered, ast);
        drawBranches(rendered);
        drawMoves(rendered, moves);
      });

      window.addEventListener("resize", debounce(() => {
        fitTreeToContainer(rendered, ast);
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

function getTreeMetrics(root) {
  const metrics = {
    nodes: 0,
    terminals: 0,
    depth: 0,
    maxChildren: 0
  };

  function walk(node, depth) {
    metrics.depth = Math.max(metrics.depth, depth);

    if (node.type === "terminal") {
      metrics.terminals++;
      return;
    }

    metrics.nodes++;
    metrics.maxChildren = Math.max(metrics.maxChildren, node.children.length);

    node.children.forEach((child) => walk(child, depth + 1));
  }

  walk(root, 1);
  return metrics;
}

function fitTreeToContainer(rendered, ast) {
  const base = {
    childGap: 2.1,
    levelGap: 2.2,
    fontSize: 1.05,
    sidePadding: 1.5
  };

  const minimum = {
    childGap: 0.45,
    levelGap: 1.55,
    fontSize: 0.82,
    sidePadding: 0.55
  };

  const metrics = getTreeMetrics(ast);
  const container = rendered.closest(".tree-example") || rendered.parentElement;

  resetTreeSizing(rendered);

  // DOM에 실제로 배치된 뒤의 자연폭과, 현재 브라우저에서 쓸 수 있는 본문 폭을 잰다.
  const naturalWidth = rendered.getBoundingClientRect().width;
  const availableWidth = getAvailableWidth(container);
  const initialRatio = naturalWidth > 0
    ? Math.min(1, availableWidth / naturalWidth)
    : 1;

  let childGap = Math.max(minimum.childGap, base.childGap * initialRatio);
  let levelGap = Math.max(minimum.levelGap, base.levelGap * initialRatio);
  let fontSize = Math.max(minimum.fontSize, base.fontSize * initialRatio);
  let sidePadding = Math.max(minimum.sidePadding, base.sidePadding * initialRatio);

  applyTreeSizing(rendered, { childGap, levelGap, fontSize, sidePadding });

  // em 단위와 실제 글자 폭 때문에 단순 비례만으로는 약간의 오차가 생길 수 있다.
  // 최대 3번 실제 폭을 다시 재서 남은 오차를 연속적으로 보정한다.
  for (let i = 0; i < 3; i++) {
    const currentWidth = rendered.getBoundingClientRect().width;
    if (!currentWidth || currentWidth <= availableWidth + 1) break;

    const correction = availableWidth / currentWidth;

    const nextChildGap = Math.max(minimum.childGap, childGap * correction);
    const nextLevelGap = Math.max(minimum.levelGap, levelGap * correction);
    const nextFontSize = Math.max(minimum.fontSize, fontSize * correction);
    const nextSidePadding = Math.max(minimum.sidePadding, sidePadding * correction);

    const unchanged =
      nextChildGap === childGap &&
      nextLevelGap === levelGap &&
      nextFontSize === fontSize &&
      nextSidePadding === sidePadding;

    childGap = nextChildGap;
    levelGap = nextLevelGap;
    fontSize = nextFontSize;
    sidePadding = nextSidePadding;

    applyTreeSizing(rendered, { childGap, levelGap, fontSize, sidePadding });

    if (unchanged) break;
  }

  const finalWidth = rendered.getBoundingClientRect().width;
  const finalScale = naturalWidth > 0 ? finalWidth / naturalWidth : 1;

  rendered.dataset.treeNodes = String(metrics.nodes);
  rendered.dataset.treeTerminals = String(metrics.terminals);
  rendered.dataset.treeDepth = String(metrics.depth);
  rendered.dataset.treeMaxChildren = String(metrics.maxChildren);
  rendered.dataset.treeNaturalWidth = naturalWidth.toFixed(1);
  rendered.dataset.treeAvailableWidth = availableWidth.toFixed(1);
  rendered.dataset.treeFinalWidth = finalWidth.toFixed(1);
  rendered.dataset.treeScale = finalScale.toFixed(3);
}

function getAvailableWidth(container) {
  if (!container) return window.innerWidth;

  const style = getComputedStyle(container);
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;

  return Math.max(0, container.clientWidth - paddingLeft - paddingRight);
}

function resetTreeSizing(rendered) {
  rendered.style.paddingLeft = "";
  rendered.style.paddingRight = "";

  rendered.querySelectorAll(".tree-children").forEach((children) => {
    children.style.gap = "";
    children.style.marginTop = "";
  });

  rendered.querySelectorAll(".tree-label, .tree-terminal").forEach((item) => {
    item.style.fontSize = "";
  });
}

function applyTreeSizing(rendered, sizing) {
  rendered.style.paddingLeft = `${sizing.sidePadding}em`;
  rendered.style.paddingRight = `${sizing.sidePadding}em`;

  rendered.querySelectorAll(".tree-children").forEach((children) => {
    children.style.gap = `${sizing.childGap}em`;
    children.style.marginTop = `${sizing.levelGap}em`;
  });

  rendered.querySelectorAll(".tree-label, .tree-terminal").forEach((item) => {
    item.style.fontSize = `${sizing.fontSize}em`;
  });
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

    const fromItem = getMoveAnchorItem(fromUnit);
    const toItem = getMoveAnchorItem(toUnit);

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

function getMoveAnchorItem(unit) {
  // 1순위: 해당 단위 아래의 최하단 단말(leaf terminal)
  const terminal = getLowestTerminal(unit);
  if (terminal) return terminal;

  // 2순위: 최하단 단말이 없으면 자기 자신의 라벨 사용
  return unit.querySelector(":scope > .tree-item");
}

function getLowestTerminal(unit) {
  const children = unit.querySelectorAll(".tree-terminal");

  if (!children.length) return null;

  let best = null;
  let bestTop = -Infinity;

  children.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top > bestTop) {
      bestTop = rect.top;
      best = el;
    }
  });

  return best;
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
