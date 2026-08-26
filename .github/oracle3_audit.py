from pathlib import Path
import re
p=Path('_drafts/Heji-material-source-original-bone-rubbing-holdings-abbreviations.md')
s=p.read_text(encoding='utf-8')
# sections
m=re.search(r'^## 14\. 211개 전체 목록\s*$',s,re.M)
if not m:
    print('ERROR no section 14')
    raise SystemExit(1)
pre=s[:m.start()]
full=s[m.end():]
labels_full=re.findall(r'^\*\*([^*]+)\*\*\.',full,re.M)
labels_pre=re.findall(r'^\*\*([^*]+)\*\*\.',pre,re.M)
from collections import Counter
c=Counter(labels_full)
dups={k:v for k,v in c.items() if v>1}
missing=[x for x in labels_full if x not in set(labels_pre)]
print('FULL_COUNT',len(labels_full))
print('FULL_UNIQUE',len(set(labels_full)))
print('DUPS',dups)
print('DETAILED_UNIQUE',len(set(labels_pre)))
print('MISSING_COUNT',len(missing))
print('MISSING', ' | '.join(missing))
# headings
heads=re.findall(r'^(##+ .+)$',s,re.M)
print('HEADINGS')
for h in heads: print(h)
# punctuation
for ch,name in [('·','MIDDOT'),('，','FW_COMMA'),('；','FW_SEMI'),('：','FW_COLON'),('（','FW_LP'),('）','FW_RP'),('「','CORNER_L'),('」','CORNER_R'),('\ufffd','REPLACEMENT')]:
    print(name,s.count(ch))
# source definitions
src=re.findall(r'^- \*\*\[([A-Z]+)\]\*\*',s,re.M)
print('SRC_COUNT',len(src),'SRC_UNIQUE',len(set(src)))
print('SRC_DUPS',{k:v for k,v in Counter(src).items() if v>1})
print('SRC_ORDER',' '.join(src))
used=set(re.findall(r'\[([A-Z]{1,3})\]',pre))
print('SRC_UNUSED',' '.join(x for x in src if x not in used))
print('SRC_UNDEFINED',' '.join(sorted(used-set(src))))
