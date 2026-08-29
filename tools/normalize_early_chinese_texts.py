from pathlib import Path
import re

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')
    # 역자 주에서 역사서 내부의 편·지·전 등 부분명은 〈〉로 표기한다.
    text = re.sub(r'(역자 주:\s*)《([^》]+)》', r'\1〈\2〉', text)

    # 열전명 표기 원칙:
    # 《史記》는 원래의 〈某列傳〉을 유지하고,
    # 그 밖의 역사서는 역자 주에서 〈某傳〉으로 축약한다.
    # 기존 정규화 과정에서 이미 축약된 《史記》의 주요 열전명도 복원한다.
    shiji_liezhuan = {
        '商君傳': '商君列傳',
        '張丞相傳': '張丞相列傳',
        '老子韓非傳': '老子韓非列傳',
        '屈原賈生傳': '屈原賈生列傳',
    }
    for short, full in shiji_liezhuan.items():
        text = re.sub(
            rf'(《史記》[^\n]*?역자 주:\s*〈){re.escape(short)}(〉)',
            rf'\1{full}\2',
            text,
        )

    path.write_text(text, encoding='utf-8')
