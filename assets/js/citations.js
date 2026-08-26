document.addEventListener("DOMContentLoaded", () => {
  const post = document.querySelector(".post-content");
  if (!post) return;

  const headings = Array.from(post.querySelectorAll("h2, h3"));

  function findHeading(pattern) {
    return headings.find((heading) => pattern.test(heading.textContent.trim()));
  }

  function findFollowingList(heading) {
    if (!heading) return null;

    let element = heading.nextElementSibling;
    while (element && !/^(OL|UL)$/.test(element.tagName)) {
      if (/^H[1-6]$/.test(element.tagName)) return null;
      element = element.nextElementSibling;
    }
    return element;
  }

  function addBacklinks(referenceMap, backlinks, labelForKey) {
    backlinks.forEach((ids, key) => {
      const item = referenceMap.get(key);
      if (!item || !ids.length) return;

      const wrapper = document.createElement("span");
      wrapper.className = "citation-backlinks";
      wrapper.setAttribute("aria-label", "본문 인용 위치로 돌아가기");

      ids.forEach((id, index) => {
        const back = document.createElement("a");
        back.href = `#${id}`;
        back.className = "citation-backlink";
        back.setAttribute(
          "aria-label",
          `${labelForKey(key)}의 ${index + 1}번째 인용 위치로 돌아가기`
        );
        back.textContent = ids.length === 1 ? "↩" : `↩${index + 1}`;
        wrapper.appendChild(back);
      });

      item.appendChild(document.createTextNode(" "));
      item.appendChild(wrapper);
    });
  }

  function linkTextCitations({
    boundaryHeading,
    matchRegex,
    keyFromMatch,
    referenceMap,
    targetId,
    citationId,
    ariaLabel,
    linkClass = "citation-link",
  }) {
    if (!boundaryHeading || !referenceMap.size) return new Map();

    const occurrenceCount = new Map();
    const backlinks = new Map();

    const walker = document.createTreeWalker(post, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !matchRegex.test(node.nodeValue)) {
          matchRegex.lastIndex = 0;
          return NodeFilter.FILTER_REJECT;
        }
        matchRegex.lastIndex = 0;

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("a, code, pre, script, style")) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          boundaryHeading.compareDocumentPosition(node) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      const regex = new RegExp(matchRegex.source, matchRegex.flags);
      let match;

      while ((match = regex.exec(text)) !== null) {
        const key = keyFromMatch(match);
        if (!referenceMap.has(key)) continue;

        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index))
        );

        const count = (occurrenceCount.get(key) || 0) + 1;
        occurrenceCount.set(key, count);

        const anchor = document.createElement("a");
        anchor.href = `#${targetId(key)}`;
        anchor.id = citationId(key, count);
        anchor.className = linkClass;
        anchor.setAttribute("aria-label", ariaLabel(key));
        anchor.textContent = match[0];
        fragment.appendChild(anchor);

        if (!backlinks.has(key)) backlinks.set(key, []);
        backlinks.get(key).push(anchor.id);
        lastIndex = regex.lastIndex;
      }

      if (lastIndex === 0) return;
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(fragment, node);
    });

    return backlinks;
  }

  // 1. 숫자 주석: [1], [2] ... ↔ 「출처 및 참고자료」
  const referencesHeading = findHeading(/출처\s*및\s*참고자료/);
  const referenceList = findFollowingList(referencesHeading);

  if (referencesHeading && referenceList) {
    const referenceItems = Array.from(referenceList.children).filter(
      (element) => element.tagName === "LI"
    );

    const referenceMap = new Map();
    referenceItems.forEach((item, index) => {
      const number = index + 1;
      item.id = `ref-${number}`;
      item.classList.add("citation-reference");
      referenceMap.set(number, item);
    });

    const backlinks = linkTextCitations({
      boundaryHeading: referencesHeading,
      matchRegex: /\[(\d+)\]/g,
      keyFromMatch: (match) => Number(match[1]),
      referenceMap,
      targetId: (number) => `ref-${number}`,
      citationId: (number, count) => `cite-${number}-${count}`,
      ariaLabel: (number) => `참고자료 ${number}로 이동`,
    });

    addBacklinks(referenceMap, backlinks, (number) => `참고자료 ${number}`);
  }

  // 2. 알파벳 출처 주석: [T], [N], [G] ... ↔ 「자료 내원 조사에 사용한 주요 출처」
  const sourceHeading = findHeading(/자료\s*내원\s*조사에\s*사용한\s*주요\s*출처/);
  const sourceList = findFollowingList(sourceHeading);

  if (sourceHeading && sourceList) {
    const sourceItems = Array.from(sourceList.children).filter(
      (element) => element.tagName === "LI"
    );

    const sourceMap = new Map();
    sourceItems.forEach((item) => {
      const match = item.textContent.trim().match(/^\[([A-Z]+)\]/);
      if (!match) return;

      const key = match[1];
      item.id = `source-${key.toLowerCase()}`;
      item.classList.add("citation-reference", "citation-source-reference");
      sourceMap.set(key, item);
    });

    const backlinks = linkTextCitations({
      boundaryHeading: sourceHeading,
      matchRegex: /\[([A-Z]+)\]/g,
      keyFromMatch: (match) => match[1],
      referenceMap: sourceMap,
      targetId: (key) => `source-${key.toLowerCase()}`,
      citationId: (key, count) => `source-cite-${key.toLowerCase()}-${count}`,
      ariaLabel: (key) => `자료 내원 출처 ${key}로 이동`,
      linkClass: "citation-link citation-source-link",
    });

    addBacklinks(sourceMap, backlinks, (key) => `자료 내원 출처 ${key}`);
  }
});
