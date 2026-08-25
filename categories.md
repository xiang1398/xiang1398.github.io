---
layout: page
title: 카테고리
permalink: /categories/
---

{% for category in site.categories %}
## {{ category[0] }} ({{ category[1].size }})

{% for post in category[1] %}
{% unless post.hidden %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }}){% if post.series %} · *{{ post.series }}*{% endif %}
{% endunless %}
{% endfor %}

{% endfor %}
