---
layout: home
title: 孜山의 블로그
---

# 孜山의 서재

고전 문헌, 역사언어학, 음운론, 번역 노트를 모으는 공간입니다.

## 글 목록

{% for post in site.posts %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
