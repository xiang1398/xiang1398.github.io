from pathlib import Path
import re
from collections import Counter
p=Path('_drafts/Heji-material-source-original-bone-rubbing-holdings-abbreviations.md')
s=p.read_text(encoding='utf-8')
m=re.search(r'^## \d+\. 211개 전체 목록\s*$',s,re.M)
if not m:
    print('ERROR no 211-list section'); raise SystemExit(1)
pre=s[:m.start()]; full=s[m.end():]
entries=re.findall(r'^(\*\*([^*]+)\*\*\..+)$',full,re.M)
labels_full=[x[1] for x in entries]
labels_pre=re.findall(r'^\*\*([^*]+)\*\*\.',pre,re.M)
missing=[x for x in labels_full if x not in set(labels_pre)]
print('FULL_COUNT',len(labels_full)); print('FULL_UNIQUE',len(set(labels_full)))
print('DUPS',{k:v for k,v in Counter(labels_full).items() if v>1})
print('DETAILED_UNIQUE',len(set(labels_pre)))
print('MISSING_COUNT',len(missing)); print('MISSING',' | '.join(missing))
print('MISSING_LINES')
for line,label in entries:
    if label in missing: print(line)
print('HEADINGS')
for h in re.findall(r'^(##+ .+)$',s,re.M): print(h)
for ch,name in [('·','MIDDOT'),('，','FW_COMMA'),('；','FW_SEMI'),('：','FW_COLON'),('（','FW_LP'),('）','FW_RP'),('「','CORNER_L'),('」','CORNER_R'),('\ufffd','REPLACEMENT')]: print(name,s.count(ch))
print('MIDDOT_LINES')
for i,line in enumerate(s.splitlines(),1):
    if '·' in line: print(i,line)
src=re.findall(r'^- \*\*\[([A-Z]+)\]\*\*',s,re.M)
print('SRC_COUNT',len(src),'SRC_UNIQUE',len(set(src)))
print('SRC_DUPS',{k:v for k,v in Counter(src).items() if v>1})
print('SRC_ORDER',' '.join(src))
used=set(re.findall(r'\[([A-Z]{1,3})\]',pre))
print('SRC_UNUSED',' '.join(x for x in src if x not in used))
print('SRC_UNDEFINED',' '.join(sorted(used-set(src))))
