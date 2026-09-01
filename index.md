---
layout: page
title: 孜山의 서재
permalink: /
---

중국어 역사언어학과 고전 문헌을 공부하고 있는 孜山의 개인 연구 서재입니다.

고전 문헌, 역사언어학, 음운론, 번역과 독서 노트를 기록합니다.

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

## 주요 연재 · 글 모음

- [*Early Chinese Texts* 번역 — 본편 001–065 및 부록]({{ "/projects/early-chinese-texts/" | relative_url }})
- [중국어 운율통사론]({{ "/tags/" | relative_url }}#운율통사론)
- [갑골문 · 갑골저록]({{ "/tags/" | relative_url }}#갑골문)
- [전국초간 · 출토문헌]({{ "/tags/" | relative_url }}#전국초간)
- [문헌학]({{ "/tags/" | relative_url }}#문헌학)

## 주요 글

- [중국어 운율통사론 소개]({% post_url 2026-08-27-Chinese-prosodic-syntax-introduction %})
- [《甲骨文合集》 이전의 갑골 저록과 《甲骨文合集》]({% post_url 2026-08-26-.pre-Heji-oracle-bone-catalogues-and-the-Jiaguwen-Heji %})
- [《甲骨文合集》 이후의 갑골 저록과 綴合 연구]({% post_url 2026-08-26-post-Heji-oracle-bone-catalogues-and-joining-research %})
- [전국초죽간 자료 목록]({% post_url 2026-08-28-warring-states-bamboo-manuscripts-catalogue %})
- [둔황 사본 컬렉션·목록·데이터베이스]({% post_url 2026-08-26-Dunhuang-Manuscript-Collections-Catalogues-and-Databases %})

글은 [카테고리별]({{ "/categories/" | relative_url }})·[태그별]({{ "/tags/" | relative_url }})로 찾아보거나 [전문 검색]({{ "/search/" | relative_url }})할 수 있습니다.

{% assign visible_posts = site.posts | where_exp: "post", "post.hidden != true" %}
{% assign categories = visible_posts | map: "category" | compact | uniq | sort %}

{% for category_name in categories %}
{% assign category_posts_all = visible_posts | where: "category", category_name %}
{% assign category_posts = category_posts_all | where_exp: "post", "post.series != 'Oracle Bone Script'" %}
{% if category_posts.size > 0 %}

### {{ category_name }}

{% for post in category_posts limit: 5 %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }}){% if post.series %} <small>· {{ post.series }}</small>{% endif %}
{% endfor %}

{% if category_posts.size > 5 %}
[전체 {{ category_posts.size }}편 보기]({{ "/categories/" | relative_url }}#{{ category_name | replace: " ", "-" | replace: "·", "-" }})
{% endif %}
{% endif %}
{% endfor %}

## 최근 글

{% assign recent_posts = site.posts | where_exp: "post", "post.hidden != true" %}

{% for post in recent_posts limit: 10 %}
- **{{ post.date | date: "%Y-%m-%d" }}** — [{{ post.title }}]({{ post.url | relative_url }}){% if post.series %} · *{{ post.series }}*{% endif %}
{% endfor %}

[모든 글 보기 →]({{ "/categories/" | relative_url }})
