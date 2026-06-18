---
layout: page
title: 카테고리
permalink: /categories/
---

# 카테고리

{% for category in site.categories %}
## {{ category[0] }}

{% for post in category[1] %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}

{% endfor %}
