---
layout: page
title: 통계
permalink: /stats/
---

{% include blog-stats-styles.html %}

{% assign stats = site.data.blog_stats %}

<div class="blog-stats-summary" aria-label="블로그 전체 통계">
  <div class="blog-stats-card">
    <span class="blog-stats-card-label">총 글 수</span>
    <span class="blog-stats-card-value">{{ stats.post_count_formatted }}편</span>
  </div>
  <div class="blog-stats-card">
    <span class="blog-stats-card-label">총 글자 수</span>
    <span class="blog-stats-card-value">{{ stats.total_characters_formatted }}자</span>
  </div>
</div>

<p class="blog-stats-note">숨김 글(<code>hidden: true</code>)은 제외합니다. 글자 수는 각 포스트 본문을 HTML로 변환한 뒤 공백·줄바꿈·마크다운/HTML 표지를 제외한 실제 텍스트를 기준으로 계산하며, 새 글이 배포될 때마다 Jekyll 빌드 과정에서 자동 갱신됩니다.</p>

## 글별 글자 수 비중

전체 글자 수에서 각 글이 차지하는 비율입니다. 글자 수가 많은 순서로 정렬됩니다.

<div class="blog-stats-list">
{% for item in stats.posts %}
  <div class="blog-stats-row">
    <div class="blog-stats-row-head">
      <div class="blog-stats-row-title"><a href="{{ item.url | relative_url }}">{{ item.title }}</a></div>
      <div class="blog-stats-row-value">{{ item.character_count_formatted }}자 · {{ item.percentage }}%</div>
    </div>
    <div class="blog-stats-bar-track" role="img" aria-label="{{ item.title | escape }}: 전체 글자 수의 {{ item.percentage }}퍼센트">
      <span class="blog-stats-bar-fill" style="width: {{ item.percentage }}%;"></span>
    </div>
  </div>
{% endfor %}
</div>
