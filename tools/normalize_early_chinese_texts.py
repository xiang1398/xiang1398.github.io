from pathlib import Path
import re

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'(역자 주:\s*〈)([^〉]*?)列傳(〉)', r'\1\2傳\3', text)
    text = re.sub(r'(역자 주:\s*)〈([^〉]+)〉', r'\1《\2》', text)
    path.write_text(text, encoding='utf-8')
