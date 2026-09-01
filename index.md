---
layout: page
title: 孜山의 서재
permalink: /
---

중국어 역사언어학과 고전 문헌을 공부하고 있는 孜山의 개인 연구 서재입니다.

고전 문헌, 역사언어학, 음운론, 번역과 독서 노트를 기록합니다.

<form action="{{ '/search/' | relative_url }}" method="get" style="margin: 1.2rem 0 1.5rem;">
  <input type="search" name="q" placeholder="블로그 검색 — 제목·본문·태그·카테고리" aria-label="블로그 검색" style="width: 100%; box-sizing: border-box; font: inherit; padding: .65rem .8rem; border: 1px solid #c8c8c8; border-radius: 6px;">
</form>

### Contact

블로그 내용에 관한 의견·질문·오류 제보는 [zasanblog@gmail.com](mailto:zasanblog@gmail.com)으로 보내실 수 있습니다.

## 약력

- 2019.3 성균관대학교 한문학과 입학
- 2025.2 성균관대학교 한문학과 학사
- 2025.3 고려대학교 대학원 중일어문학과 석사과정 입학

## 분야

- 중국어사 전반, 주요 관심 분야는 생성통사론, 역사음운론, 문헌학, 출토문헌.

## 기타 관심사

- 그리스어, 라틴어의 역사와 문법.
- 그리스, 로마 고전의 텍스트 비평으로부터 시작하는 서양의 문헌학 이론.
- 고전문학(운문).
- 고전음악(Classical Music).

### Project

- [*Early Chinese Texts* 번역글 모음]({{ "/projects/early-chinese-texts/" | relative_url }})

{% assign visible_posts = site.posts | where_exp: "post", "post.hidden != true" %}

{% assign categories = visible_posts | map: "category" | compact | uniq | sort %}

{% for category_name in categories %}
{% assign category_posts = visible_posts | where: "category", category_name %}

### {{ category_name }}

{% for post in category_posts limit: 5 %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }}){% if post.series %} <small>· {{ post.series }}</small>{% endif %}
{% endfor %}

{% if category_posts.size > 5 %}
[전체 {{ category_posts.size }}편 보기]({{ "/categories/" | relative_url }}#{{ category_name | replace: " ", "-" | replace: "·", "-" }})
{% endif %}

{% endfor %}

## 최근 글

{% assign recent_posts = site.posts | where_exp: "post", "post.hidden != true" %}

{% for post in recent_posts limit: 10 %}
- **{{ post.date | date: "%Y-%m-%d" }}** — [{{ post.title }}]({{ post.url | relative_url }}){% if post.series %} · *{{ post.series }}*{% endif %}
{% endfor %}

[모든 글 보기 →]({{ "/categories/" | relative_url }})
