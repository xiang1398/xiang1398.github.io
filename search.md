---
layout: page
title: 검색
permalink: /search/
---

<style>
.site-search-box {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-size: 1.05rem;
  padding: .7rem .85rem;
  border: 1px solid #c8c8c8;
  border-radius: 6px;
  margin: .25rem 0 .4rem;
}
.search-help, .search-result-meta {
  color: #666;
  font-size: .9rem;
}
#site-search-count {
  margin: 1rem 0 .2rem;
  font-size: .9rem;
  color: #666;
}
.search-result-item {
  padding: 1rem 0;
  border-bottom: 1px solid #e8e8e8;
}
.search-result-item h3 {
  margin: 0 0 .25rem;
  font-size: 1.1rem;
}
.search-result-item p {
  margin: .45rem 0 0;
}
.search-result-item mark {
  padding: 0 .08em;
  border-radius: 2px;
  background: #fff1a8;
  color: inherit;
}
</style>

<input id="site-search-input" class="site-search-box" type="search" placeholder="제목·본문·태그·카테고리 검색" autocomplete="off" autofocus>
<div class="search-help">여러 검색어를 띄어쓰면 모든 검색어가 들어 있는 글을 찾습니다. 한자는 번체·간체를 자동으로 함께 검색합니다.</div>
<div id="site-search-count" aria-live="polite"></div>
<div id="site-search-results"></div>

<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.4.1/dist/umd/full.js"></script>
<script src="{{ '/assets/js/search.js' | relative_url }}"></script>
