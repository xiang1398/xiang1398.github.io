---
layout: post
title: "GitHub Pages 배포 테스트"
date: 2026-08-25 20:15:00 +0900
categories: Blog
tags: [jekyll, github-pages, gloss]
---

배포 워크플로우 통합 후 테스트용 포스트입니다.

## 일반 마크다운

- 목록
- **굵게**
- *기울임*
- 漢字와 한글
- 産 chǎn *sreanX* /*s-ŋrarʔ/

## Gloss 테스트

{% gloss %}
我|你|看見|了
1SG|2SG|see|PFV
{% endgloss %}

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(1)</span>
    <span class="ex-text">你吃飯了嗎。</span>
  </div>

  <pre class="ling-tree">
[CP
  [TP
    [DP#subj 你]
    [T'
      [vP
        [DP#subjtrace ~~你~~]
        [v'
          [v#vhead 吃]
          [VP
            [V#vtrace ~~吃~~]
            [NP 飯]
          ]
        ]
      ]
      [T 了]
    ]
  ]
  [C 嗎]
]
@move subjtrace -> subj "subject raising"
@move vtrace -> vhead "V-to-v"
  </pre>
</div>

배포와 `gloss.rb` 플러그인이 모두 정상 작동하면 성공입니다.
