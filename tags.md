---
layout: page
title: 태그
permalink: /tags/
---

태그는 개별 작품명·저자명보다 여러 글을 실제로 묶어 볼 수 있는 주제를 중심으로 정리했습니다. 현재는 **2편 이상에 공통으로 붙는 태그만** 표시합니다.

{% assign taxonomy = site.data.tag_taxonomy %}
{% assign visible_posts = site.posts | where_exp: "post", "post.hidden != true" %}

{% for tag_name in taxonomy.tags %}
  {% assign tag_count = 0 %}
  {% for post in visible_posts %}
    {% assign curated_tags = taxonomy.post_tags[post.path] %}
    {% if curated_tags contains tag_name %}
      {% assign tag_count = tag_count | plus: 1 %}
    {% endif %}
  {% endfor %}

  {% if tag_count > 1 %}
## {{ tag_name }} <small>({{ tag_count }})</small>

    {% for post in visible_posts %}
      {% assign curated_tags = taxonomy.post_tags[post.path] %}
      {% if curated_tags contains tag_name %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }}){% if post.category %} · {{ post.category }}{% endif %}{% if post.series %} · *{{ post.series }}*{% endif %}
      {% endif %}
    {% endfor %}
  {% endif %}
{% endfor %}
