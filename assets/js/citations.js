document.addEventListener("DOMContentLoaded", () => {
  const post = document.querySelector(".post-content");
  if (!post) return;

  const headings = Array.from(post.querySelectorAll("h2, h3"));
  const referencesHeading = headings.find((heading) =>
    /출처\s*및\s*참고자료/.test(heading.textContent.trim())
  );
  if (!referencesHeading) return;

  let referenceList = referencesHeading.nextElementSibling;
  while (referenceList && !/^(OL|UL)$/.test(referenceList.tagName)) {
    if (/^H[1-6]$/.test(referenceList.tagName)) return;
    referenceList = referenceList.nextElementSibling;
  }
  if (!referenceList) return;

  const referenceItems = Array.from(referenceList.children).filter(
    (element) => element.tagName === "LI"
  );
  if (!referenceItems.length) return;

  const referenceMap = new Map();
  referenceItems.forEach((item, index) => {
    const number = index + 1;
    item.id = `ref-${number}`;
    item.classList.add("citation-reference");
    referenceMap.set(number, item);
  });

  const occurrenceCount = new Map();
  const backlinks = new Map();

  const walker = document.createTreeWalker(
    post,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !/\[\d+\]/.test(node.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("a, code, pre, script, style")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (referencesHeading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    const regex = /\[(\d+)\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const number = Number(match[1]);
      const target = referenceMap.get(number);
      if (!target) continue;

      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

      const count = (occurrenceCount.get(number) || 0) + 1;
      occurrenceCount.set(number, count);

      const anchor = document.createElement("a");
      anchor.href = `#ref-${number}`;
      anchor.id = `cite-${number}-${count}`;
      anchor.className = "citation-link";
      anchor.setAttribute("aria-label", `참고자료 ${number}로 이동`);
      anchor.textContent = `[${number}]`;
      fragment.appendChild(anchor);

      if (!backlinks.has(number)) backlinks.set(number, []);
      backlinks.get(number).push(anchor.id);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex === 0) return;
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    node.parentNode.replaceChild(fragment, node);
  });

  backlinks.forEach((ids, number) => {
    const item = referenceMap.get(number);
    if (!item) return;

    const wrapper = document.createElement("span");
    wrapper.className = "citation-backlinks";
    wrapper.setAttribute("aria-label", "본문 인용 위치로 돌아가기");

    ids.forEach((id, index) => {
      const back = document.createElement("a");
      back.href = `#${id}`;
      back.className = "citation-backlink";
      back.setAttribute("aria-label", `참고자료 ${number}의 ${index + 1}번째 인용 위치로 돌아가기`);
      back.textContent = ids.length === 1 ? "↩" : `↩${index + 1}`;
      wrapper.appendChild(back);
    });

    item.appendChild(document.createTextNode(" "));
    item.appendChild(wrapper);
  });
});
