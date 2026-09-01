document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector(".post-title");
  const post = document.querySelector(".post-content");
  if (!title || !post || !/^Early Chinese Texts\b/.test(title.textContent.trim())) return;

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
});
