from pathlib import Path
import re

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')
    # 역자 주에서 역사서 내부의 편·지·전 등 부분명은 작품명이 아니라
    # 역사서의 내부 편명으로 취급하여 〈〉로 표기한다.
    text = re.sub(r'(역자 주:\s*)《([^》]+)》', r'\1〈\2〉', text)
    path.write_text(text, encoding='utf-8')
