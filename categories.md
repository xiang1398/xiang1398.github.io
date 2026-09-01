---
layout: page
title: 카테고리
permalink: /categories/
---

{% assign oracle_posts = site.posts | where: "series", "Oracle Bone Script" %}
{% if oracle_posts.size > 0 %}
## 문자학

### 갑골문

{% for post in oracle_posts %}
{% unless post.hidden %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endunless %}
{% endfor %}
{% endif %}

{% for category in site.categories %}
## {{ category[0] }}

{% assign posts = category[1] %}
{% assign series_names = posts | map: "series" | compact | uniq | sort %}

{% for series_name in series_names %}
{% unless series_name == "Oracle Bone Script" %}
### {{ series_name }}

{% assign series_posts = posts | where: "series", series_name %}

{% for post in series_posts %}
{% unless post.hidden %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endunless %}
{% endfor %}
{% endunless %}
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
