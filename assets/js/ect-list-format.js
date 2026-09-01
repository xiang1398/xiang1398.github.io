document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".post-title");
  const post = document.querySelector(".post-content");
  if (!title || !post || !/Early Chinese Texts/.test(title.textContent.trim())) return;

  const parenthetical = /^\s*\([a-z]\)\s+/i;

  // 후기 ECT 일부에서 (a), (b)… 단락 전체가 blockquote로 들어간 경우를
  // 일반 본문 단락으로 되돌린다. 인용문 자체는 건드리지 않는다.
  Array.from(post.querySelectorAll("blockquote")).forEach((quote) => {
    const children = Array.from(quote.children);
    if (!children.length) return;
    const numbered = children.filter((el) => parenthetical.test(el.textContent || ""));
    if (!numbered.length || numbered.length !== children.length) return;

    const fragment = document.createDocumentFragment();
    children.forEach((el) => {
      el.classList.add("ect-parenthetical-entry");
      fragment.appendChild(el);
    });
    quote.replaceWith(fragment);
  });

  // (a), (b)…가 이미 번호 역할을 하는 서지·목록 항목에는 불릿을 중복 표시하지 않는다.
  Array.from(post.querySelectorAll("ul > li, ol > li")).forEach((item) => {
    if (!parenthetical.test(item.textContent || "")) return;
    item.classList.add("ect-parenthetical-entry");
    const list = item.parentElement;
    if (list) list.classList.add("ect-parenthetical-list");
  });

  // 《日本國見在書目錄》은 독립된 책이므로 ECT 전체에서 항상 서명호로 표시한다.
  // 이미 서명호가 있는 경우는 건드리지 않는다.
  const walker = document.createTreeWalker(post, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !/日本[國国][見現]在書目[錄録]/.test(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, code, pre")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replace(
      /(?<!《)(日本[國国][見現]在書目[錄録])(?!》)/g,
      "《$1》"
    );
  });
});
