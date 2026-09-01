(() => {
  const OPENCC_SRC = 'https://cdn.jsdelivr.net/npm/opencc-js@1.4.1/dist/umd/full.js';
  const STORAGE_KEY = 'zasan-chinese-script';
  const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'KBD', 'SAMP']);
  const originals = new Map();
  let converter = null;
  let loading = null;
  let currentMode = 'traditional';
  let observer = null;

  function loadOpenCC() {
    if (window.OpenCC && typeof window.OpenCC.Converter === 'function') {
      return Promise.resolve(window.OpenCC);
    }
    if (loading) return loading;

    loading = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${OPENCC_SRC}"]`);
      if (existing) {
        if (window.OpenCC) resolve(window.OpenCC);
        else {
          existing.addEventListener('load', () => resolve(window.OpenCC), { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }
      const script = document.createElement('script');
      script.src = OPENCC_SRC;
      script.async = true;
      script.onload = () => resolve(window.OpenCC);
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loading;
  }

  function shouldSkip(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (EXCLUDED_TAGS.has(parent.tagName)) return true;
    if (parent.closest('[data-no-hanzi-convert]')) return true;
    return !/[\u3400-\u9fff\uf900-\ufaff]/u.test(node.nodeValue || '');
  }

  function collectTextNodes(root = document.body) {
    if (!root) return [];
    const nodes = [];

    if (root.nodeType === Node.TEXT_NODE) {
      if (!shouldSkip(root)) nodes.push(root);
      return nodes;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!shouldSkip(node)) nodes.push(node);
    }
    return nodes;
  }

  function remember(node) {
    if (!originals.has(node)) originals.set(node, node.nodeValue);
  }

  function convertNode(node) {
    if (!converter || shouldSkip(node)) return;
    remember(node);
    node.nodeValue = converter(originals.get(node));
  }

  function convertRoot(root) {
    for (const node of collectTextNodes(root)) convertNode(node);
  }

  function restoreOriginals() {
    originals.forEach((text, node) => {
      if (node.isConnected) node.nodeValue = text;
    });
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(mutations => {
      if (currentMode !== 'simplified' || !converter) return;
      for (const mutation of mutations) {
        for (const added of mutation.addedNodes) {
          if (added.nodeType === Node.TEXT_NODE) convertNode(added);
          else if (added.nodeType === Node.ELEMENT_NODE) convertRoot(added);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  async function simplify() {
    const OpenCC = await loadOpenCC();
    if (!converter) converter = OpenCC.Converter({ from: 't', to: 'cn' });
    convertRoot(document.body);
    startObserver();
  }

  function updateButtons(mode) {
    document.querySelectorAll('.hanzi-script-toggle button').forEach(button => {
      const active = button.dataset.scriptMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  async function setMode(mode) {
    currentMode = mode;
    if (mode === 'simplified') {
      try {
        await simplify();
      } catch (error) {
        console.warn('Chinese script conversion unavailable:', error);
        currentMode = 'traditional';
        return;
      }
    } else {
      restoreOriginals();
    }
    localStorage.setItem(STORAGE_KEY, currentMode);
    updateButtons(currentMode);
  }

  function makeToggle() {
    const wrapper = document.createElement('span');
    wrapper.className = 'hanzi-script-toggle';
    wrapper.setAttribute('aria-label', '한자 표기 전환');
    wrapper.setAttribute('data-no-hanzi-convert', '');
    wrapper.innerHTML = '<button type="button" data-script-mode="traditional" aria-label="번체 원문으로 보기">繁</button><span aria-hidden="true">/</span><button type="button" data-script-mode="simplified" aria-label="간체로 보기">简</button>';

    wrapper.addEventListener('click', event => {
      const button = event.target.closest('button[data-script-mode]');
      if (!button) return;
      setMode(button.dataset.scriptMode);
    });
    return wrapper;
  }

  function mount() {
    const toggle = makeToggle();
    const header = document.querySelector('.site-header .wrapper');
    if (header) {
      header.appendChild(toggle);
    } else {
      document.body.insertAdjacentElement('afterbegin', toggle);
    }

    currentMode = localStorage.getItem(STORAGE_KEY) || 'traditional';
    updateButtons(currentMode);
    if (currentMode === 'simplified') setMode('simplified');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
