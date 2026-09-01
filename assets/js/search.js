(() => {
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  const count = document.getElementById('site-search-count');
  if (!input || !results) return;

  let index = [];
  let ready = false;

  const normalize = (value) => (value || '').toString().toLocaleLowerCase().normalize('NFKC');
  const escapeHtml = (value) => value.replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function excerpt(text, terms) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const lower = normalize(clean);
    let pos = -1;
    for (const term of terms) {
      const found = lower.indexOf(term);
      if (found !== -1 && (pos === -1 || found < pos)) pos = found;
    }
    if (pos === -1) pos = 0;
    const start = Math.max(0, pos - 70);
    const end = Math.min(clean.length, start + 220);
    return `${start > 0 ? '…' : ''}${clean.slice(start, end)}${end < clean.length ? '…' : ''}`;
  }

  function score(post, terms) {
    const title = normalize(post.title);
    const category = normalize([post.category, ...(post.categories || [])].join(' '));
    const tags = normalize((post.tags || []).join(' '));
    const series = normalize(post.series);
    const content = normalize(post.content);
    let total = 0;
    for (const term of terms) {
      if (!term) continue;
      if (title.includes(term)) total += 20;
      if (title.startsWith(term)) total += 10;
      if (category.includes(term)) total += 8;
      if (tags.includes(term)) total += 8;
      if (series.includes(term)) total += 5;
      if (content.includes(term)) total += 2;
      if (![title, category, tags, series, content].some(field => field.includes(term))) return 0;
    }
    return total;
  }

  function render(query) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      results.innerHTML = '';
      if (count) count.textContent = '';
      return;
    }
    if (!ready) {
      results.innerHTML = '<p>검색 색인을 불러오는 중입니다…</p>';
      return;
    }

    const matches = index
      .map(post => ({ post, score: score(post, terms) }))
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
      return `<article class="search-result-item">
        <h3><a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a></h3>
        <div class="search-result-meta">${escapeHtml(meta)}</div>
        <p>${escapeHtml(excerpt(post.content, terms))}</p>
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

  input.addEventListener('input', event => render(event.target.value));
})();
