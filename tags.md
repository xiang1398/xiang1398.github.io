---
layout: page
title: 태그
permalink: /tags/
---

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

  {% if tag_count > 0 %}
## {{ tag_name }} <small>({{ tag_count }})</small>

    {% for post in visible_posts %}
      {% assign curated_tags = taxonomy.post_tags[post.path] %}
      {% if curated_tags contains tag_name %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }}){% if post.category %} · {{ post.category }}{% endif %}{% if post.series %} · *{{ post.series }}*{% endif %}
      {% endif %}
    {% endfor %}
  {% endif %}
{% endfor %}
