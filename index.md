---
layout: home
title: 孜山의 블로그
---

# 孜山의 서재

저는 중국어 역사언어학을 전공하고 있는 孜山이라고 합니다. 

고전 문헌, 역사언어학, 음운론, 번역 노트를 모으는 공간입니다.

## 약력

2019.3 성균관대학교 한문학과 입학

2025.2 성균관대학교 한문학과 학사

2025.3 고려대학교 대학원 중일어문학과 석사과정 입학

## 카테고리

{% for category in site.categories %}
- [{{ category[0] }}](/categories/#{{ category[0] }}) — {{ category[1].size }}편
{% endfor %}

## 글 목록

{% for post in site.posts %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
