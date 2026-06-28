---
layout: post
title: "수형도 테스트"
date: 2026-06-28 12:10:00 +0900
categories: blog
---

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

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(2)</span>
    <span class="ex-text">王冕死了父親。</span>
  </div>

  <pre class="ling-tree">
[…TP
  [DP#subj 王冕]
  [T'
    [vP
      [DP#subjtrace ~~王冕~~]
      [v'
        [v#vhead 死了]
        [VP
          [V#vtrace ~~死了~~]
          [NP 父亲]
        ]
      ]
    ]
    [T Ø]
  ]
]
@move subjtrace -> subj "DP raising"
@move vtrace -> vhead "V-to-v"
  </pre>
</div>

<div class="tree-example">
  <div class="tree-sentence">
    <span class="ex-no">(3)</span>
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
