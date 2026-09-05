---
layout: page
title: "Early Medieval Chinese Texts 번역글 모음"
permalink: /projects/early-medieval-chinese-texts/
---

*Early Medieval Chinese Texts*의 번역글을 한곳에 모았다. 현재 본편 001–010을 수록하고 있으며, 교정이 끝나는 순서대로 이어서 추가한다.

## 본편 001–010

{% assign emct_posts = site.posts | where: "series", "Early Medieval Chinese Texts" | sort: "title" %}
{% for post in emct_posts %}
{% assign label = post.title | remove_first: "Early Medieval Chinese Texts " | replace_first: ": ", " " %}
- {{ label }}: [링크]({{ post.url | relative_url }})
{% endfor %}
