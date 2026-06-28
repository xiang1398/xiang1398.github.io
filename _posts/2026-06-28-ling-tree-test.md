---
layout: post
title: "수형도 테스트"
date: 2026-06-28 12:10:00 +0900
categories: blog
---

</div>

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(1)</span>
    <span class="ex-text">我把書放在桌子上。</span>
  </div>

 <pre class="ling-tree">
[TP
  [NP#subj 我]
  [T'
    [把P
      [NP#subjbase ~~我~~]
      [把'
        [把 把]
        [vP
          [NP#obj 書]
          [v'
            [v#vhead 放]
            [VP
              [V#vtrace ~~放~~]
              [XP
                [NP#objbase ~~書~~]
                [PP
                  [P 在]
                  [NP 桌子 上]
                ]
              ]
            ]
          ]
        ]
      ]
    ]
    [T ∅]
  ]
]
@move subjbase -> subj "subject raising"
@move objbase -> obj "object raising"
@move vtrace -> vhead "V-to-v"
  </pre>
</div>


