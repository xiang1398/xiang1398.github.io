---
layout: post
title: "수형도 테스트"
date: 2026-06-28 12:10:00 +0900
categories: blog
---

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(1)</span>
    <span class="ex-text">What did John buy?</span>
  </div>

  <pre class="ling-tree">
[CP
  [WhP#wh What]
  [C did]
  [TP
    [NP John]
    [vP
      [VP
        [V buy]
        [NP#gap ~~what~~]
      ]
    ]
  ]
]
@move gap -> wh "wh-movement"
  </pre>
</div>

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(2)</span>
    <span class="ex-text">John seems to be happy.</span>
  </div>

  <pre class="ling-tree">
[TP
  [NP John]
  [T'
    [T seems]
    [TP
      [NP ~~John~~]
      [T'
        [T to]
        [VP
          [V be]
          [AP happy]
        ]
      ]
    ]
  ]
]
  </pre>
</div>

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(3)</span>
    <span class="ex-text">我把書放在桌子上。</span>
  </div>

  <pre class="ling-tree">
[TP
  [NP 我]
  [vP
    [BA 把]
    [NP#obj 書]
    [VP
      [V 放]
      [PP
        [P 在]
        [NP 桌子 上]
      ]
      [NP#gap ~~書~~]
    ]
  ]
]
@move gap -> obj "object fronting"
  </pre>
</div>









