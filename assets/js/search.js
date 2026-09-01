---
---
(() => {
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  const count = document.getElementById('site-search-count');
  if (!input || !results) return;

  let index = [];
  let ready = false;

  const normalize = (value) => (value || '').toString().toLocaleLowerCase().normalize('NFKC');
  const escapeHtml = (value) => value.replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let toTraditional = null;
  let toSimplified = null;
  if (window.OpenCC && typeof window.OpenCC.Converter === 'function') {
    toTraditional = window.OpenCC.Converter({ from: 'cn', to: 'tw' });
    toSimplified = window.OpenCC.Converter({ from: 't', to: 'cn' });
  }

  function variants(term) {
    const base = normalize(term);
    const values = new Set([base]);
    try {
      if (toTraditional) values.add(normalize(toTraditional(base)));
      if (toSimplified) values.add(normalize(toSimplified(base)));
    } catch (_) {
      // OpenCC failure should not break ordinary search.
    }
    return [...values].filter(Boolean);
  }

  function buildTermGroups(query) {
    return normalize(query)
      .split(/\s+/)
      .filter(Boolean)
      .map(term => variants(term));
  }

  function excerpt(text, termGroups) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const lower = normalize(clean);
    let pos = -1;
    for (const group of termGroups) {
      for (const term of group) {
        const found = lower.indexOf(term);
        if (found !== -1 && (pos === -1 || found < pos)) pos = found;
      }
    }
    if (pos === -1) pos = 0;
    const start = Math.max(0, pos - 70);
    const end = Math.min(clean.length, start + 220);
    return `${start > 0 ? '…' : ''}${clean.slice(start, end)}${end < clean.length ? '…' : ''}`;
  }

  function highlight(text, termGroups) {
    let html = escapeHtml(text || '');
    const uniqueTerms = [...new Set(termGroups.flat())].sort((a, b) => b.length - a.length);
    for (const term of uniqueTerms) {
      if (!term) continue;
      const re = new RegExp(`(${escapeRegExp(term)})`, 'giu');
      html = html.replace(re, '<mark>$1</mark>');
    }
    return html;
  }

  function bestFieldScore(field, group, weight, startsWithBonus = 0) {
    let score = 0;
    for (const term of group) {
      if (field.includes(term)) score = Math.max(score, weight);
      if (startsWithBonus && field.startsWith(term)) score = Math.max(score, weight + startsWithBonus);
    }
    return score;
  }

  function score(post, termGroups) {
    const title = normalize(post.title);
    const category = normalize([post.category, ...(post.categories || [])].join(' '));
    const tags = normalize((post.tags || []).join(' '));
    const series = normalize(post.series);
    const content = normalize(post.content);
    const fields = [title, category, tags, series, content];
    let total = 0;

    for (const group of termGroups) {
      if (!group.some(term => fields.some(field => field.includes(term)))) return 0;
      total += bestFieldScore(title, group, 20, 10);
      total += bestFieldScore(category, group, 8);
      total += bestFieldScore(tags, group, 8);
      total += bestFieldScore(series, group, 5);
      total += bestFieldScore(content, group, 2);
    }
    return total;
  }

  function render(query) {
    const termGroups = buildTermGroups(query);
    if (!termGroups.length) {
      results.innerHTML = '';
      if (count) count.textContent = '';
      return;
    }
    if (!ready) {
      results.innerHTML = '<p>검색 색인을 불러오는 중입니다…</p>';
      return;
    }

    const matches = index
      .map(post => ({ post, score: score(post, termGroups) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
      .slice(0, 100);

    if (count) count.textContent = `${matches.length}개 결과`;
    if (!matches.length) {
      results.innerHTML = '<p>일치하는 글이 없습니다.</p>';
      return;
    }

    results.innerHTML = matches.map(({ post }) => {
      const meta = [post.date, post.category || (post.categories || []).join(' · '), post.series].filter(Boolean).join(' · ');
      const snippet = excerpt(post.content, termGroups);
      return `<article class="search-result-item">
        <h3><a href="${escapeHtml(post.url)}">${highlight(post.title, termGroups)}</a></h3>
        <div class="search-result-meta">${escapeHtml(meta)}</div>
        <p>${highlight(snippet, termGroups)}</p>
      </article>`;
    }).join('');
  }

  fetch('{{ "/search.json" | relative_url }}')
    .then(response => {
      if (!response.ok) throw new Error('search index load failed');
      return response.json();
    })
    .then(data => {
      index = data;
      ready = true;
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      if (q) {
        input.value = q;
        render(q);
      }
    })
    .catch(() => {
      ready = true;
      results.innerHTML = '<p>검색 색인을 불러오지 못했습니다.</p>';
    });

  input.addEventListener('input', event => {
    const q = event.target.value;
    render(q);
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  });
})();
