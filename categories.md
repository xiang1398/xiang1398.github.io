---
layout: page
title: 카테고리
permalink: /categories/
---

{% for category in site.categories %}
## {{ category[0] }}

{% assign posts = category[1] %}
{% assign series_names = posts | map: "series" | compact | uniq | sort %}

{% for series_name in series_names %}
### {{ series_name }}

{% assign series_posts = posts | where: "series", series_name %}

{% for post in series_posts %}
{% unless post.hidden %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endunless %}
{% endfor %}
{% endfor %}

{% assign ungrouped_posts = posts | where_exp: "post", "post.series == nil" %}

{% if ungrouped_posts.size > 0 %}
### 기타

{% for post in ungrouped_posts %}
{% unless post.hidden %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endunless %}
{% endfor %}
{% endif %}

{% endfor %}
