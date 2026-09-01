---
layout: page
title: 태그
permalink: /tags/
---

{% assign sorted_tags = site.tags | sort %}

{% if sorted_tags.size == 0 %}
아직 태그가 지정된 글이 없습니다.
{% endif %}

{% for tag in sorted_tags %}
## {{ tag[0] }}

{% assign posts = tag[1] %}
{% for post in posts %}
{% unless post.hidden %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }}){% if post.category %} · {{ post.category }}{% endif %}{% if post.series %} · *{{ post.series }}*{% endif %}
{% endunless %}
{% endfor %}

{% endfor %}
