// Move-label rendering override for ling-tree.js
// Keeps the existing movement path geometry, but places labels tightly
// under each movement arrow and wraps long explanations into tspans.

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
      appendMoveLabel(svg, move.label, (from.x + to.x) / 2, lower + 8);
    }
  });
}

function appendMoveLabel(svg, label, x, y) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.classList.add("tree-move-label");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "hanging");

  const lines = wrapMoveLabel(label, 26);

  lines.forEach((line, index) => {
    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.setAttribute("x", x);
    tspan.setAttribute("dy", index === 0 ? "0" : "1.15em");
    tspan.textContent = line;
    text.appendChild(tspan);
  });

  svg.appendChild(text);
}

function wrapMoveLabel(label, maxChars = 26) {
  const text = String(label).trim();
  if (!text) return [];
  if (text.length <= maxChars) return [text];

  const words = text.split(/\s+/);

  // Languages/text without spaces: fall back to character-count wrapping.
  if (words.length === 1) {
    const lines = [];
    for (let i = 0; i < text.length; i += maxChars) {
      lines.push(text.slice(i, i + maxChars));
    }
    return lines;
  }

  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines;
}
