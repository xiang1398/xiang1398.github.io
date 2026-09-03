(() => {
  const STORAGE_KEY = 'blog-theme';
  const VALID_THEMES = new Set(['light', 'dark', 'green', 'red']);

  const themeStylesheet = document.createElement('link');
  themeStylesheet.rel = 'stylesheet';
  themeStylesheet.href = '/assets/css/theme-modes.css';
  themeStylesheet.dataset.blogThemeStyles = 'true';
  document.head.appendChild(themeStylesheet);

  const slugify = (text) => text.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'section';

  const initTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (VALID_THEMES.has(saved)) {
      document.documentElement.dataset.theme = saved;
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      document.documentElement.dataset.theme = 'dark';
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  };

  initTheme();

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    const controls = document.createElement('div');
    controls.className = 'blog-utility-controls';
    controls.innerHTML = `
      <button class="theme-toggle" type="button" aria-label="다크 모드 전환" title="다크 모드 전환">◐</button>
      <a class="rss-link" href="${document.querySelector('link[type="application/atom+xml"]')?.getAttribute('href') || '/feed.xml'}" aria-label="RSS 피드" title="RSS 피드">RSS</a>
      <button class="back-to-top" type="button" aria-label="맨 위로" title="맨 위로">↑</button>
    `;
    body.appendChild(controls);

    const themeButton = controls.querySelector('.theme-toggle');
    let longPressTimer = null;
    let longPressTriggered = false;

    const currentTheme = () => document.documentElement.dataset.theme || 'light';
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(STORAGE_KEY, theme);
      syncThemeLabel();
    };

    const syncThemeLabel = () => {
      const theme = currentTheme();
      if (theme === 'dark') {
        themeButton.textContent = '☀';
        themeButton.setAttribute('aria-label', '라이트 모드로 전환');
        themeButton.title = '라이트 모드로 전환';
      } else if (theme === 'green') {
        themeButton.textContent = 'G';
        themeButton.setAttribute('aria-label', '그린 모드');
        themeButton.title = '그린 모드';
      } else if (theme === 'red') {
        themeButton.textContent = 'R';
        themeButton.setAttribute('aria-label', '레드 모드');
        themeButton.title = '레드 모드';
      } else {
        themeButton.textContent = '◐';
        themeButton.setAttribute('aria-label', '다크 모드로 전환');
        themeButton.title = '다크 모드로 전환';
      }
    };

    const cycleEasterTheme = () => {
      const theme = currentTheme();
      if (theme === 'green') applyTheme('red');
      else if (theme === 'red') applyTheme('light');
      else applyTheme('green');
    };

    syncThemeLabel();

    themeButton.addEventListener('click', (event) => {
      if (longPressTriggered) {
        longPressTriggered = false;
        event.preventDefault();
        return;
      }
      const theme = currentTheme();
      const next = theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });

    themeButton.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      longPressTriggered = false;
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        cycleEasterTheme();
        if (navigator.vibrate) navigator.vibrate(35);
      }, 750);
    });

    const cancelLongPress = () => {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    };
    themeButton.addEventListener('pointerup', cancelLongPress);
    themeButton.addEventListener('pointercancel', cancelLongPress);
    themeButton.addEventListener('pointerleave', cancelLongPress);
    themeButton.addEventListener('contextmenu', (event) => {
      if (longPressTriggered) event.preventDefault();
    });

    const topButton = controls.querySelector('.back-to-top');
    const syncTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    syncTopButton();
    window.addEventListener('scroll', syncTopButton, { passive: true });
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const toc = document.getElementById('post-toc');
    const content = document.querySelector('.post-content');
    if (toc && content) {
      const headings = [...content.querySelectorAll('h2, h3')].filter((heading) =>
        !heading.closest('.revision-history, .translator-notes, .footnotes')
      );
      if (headings.length >= 2) {
        const used = new Set();
        const list = toc.querySelector('.post-toc-list');
        headings.forEach((heading) => {
          if (!heading.id) {
            let id = slugify(heading.textContent);
            let candidate = id;
            let i = 2;
            while (used.has(candidate) || document.getElementById(candidate)) candidate = `${id}-${i++}`;
            heading.id = candidate;
          }
          used.add(heading.id);
          heading.classList.add('toc-target');

          const item = document.createElement('li');
          if (heading.tagName === 'H3') item.className = 'toc-level-3';
          const link = document.createElement('a');
          link.href = `#${heading.id}`;
          link.textContent = heading.textContent;
          item.appendChild(link);
          list.appendChild(item);
        });
        toc.hidden = false;

        const details = toc.querySelector('details');
        const mobile = window.matchMedia('(max-width: 700px)');
        const syncToc = () => { details.open = !mobile.matches; };
        syncToc();
        mobile.addEventListener?.('change', syncToc);
      }
    }

    const footnoteRefs = [...document.querySelectorAll('a[href^="#fn:"]')];
    if (footnoteRefs.length) {
      const popover = document.createElement('div');
      popover.className = 'footnote-popover';
      popover.setAttribute('role', 'dialog');
      popover.setAttribute('aria-live', 'polite');
      popover.hidden = true;
      body.appendChild(popover);

      const closePopover = () => {
        popover.hidden = true;
        popover.innerHTML = '';
      };

      const positionPopover = (ref) => {
        const rect = ref.getBoundingClientRect();
        const margin = 12;
        const maxLeft = Math.max(margin, window.innerWidth - popover.offsetWidth - margin);
        const left = Math.min(Math.max(margin, rect.left), maxLeft);
        let top = rect.bottom + 8;
        if (top + popover.offsetHeight > window.innerHeight - margin) {
          top = Math.max(margin, rect.top - popover.offsetHeight - 8);
        }
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
      };

      footnoteRefs.forEach((ref) => {
        ref.addEventListener('click', (event) => {
          const target = document.getElementById(decodeURIComponent(ref.hash.slice(1)));
          if (!target) return;
          event.preventDefault();
          const clone = target.cloneNode(true);
          clone.querySelectorAll('.reversefootnote').forEach((node) => node.remove());
          popover.innerHTML = `<button class="footnote-popover-close" type="button" aria-label="닫기">×</button><div class="footnote-popover-content">${clone.innerHTML}</div>`;
          popover.hidden = false;
          positionPopover(ref);
          popover.querySelector('.footnote-popover-close').addEventListener('click', closePopover);
        });
      });

      document.addEventListener('click', (event) => {
        if (!popover.hidden && !popover.contains(event.target) && !event.target.closest('a[href^="#fn:"]')) closePopover();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePopover();
      });
      window.addEventListener('resize', closePopover);
      window.addEventListener('scroll', closePopover, { passive: true });
    }
  });
})();
