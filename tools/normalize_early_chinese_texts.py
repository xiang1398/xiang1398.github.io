from pathlib import Path
import re

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')
    # 역자 주에서 역사서 내부의 편·지·전 등 부분명은 〈〉로 표기한다.
    text = re.sub(r'(역자 주:\s*)《([^》]+)》', r'\1〈\2〉', text)

    # 《史記》의 열전은 〈某列傳〉, 그 밖의 정사는 〈某傳〉.
    shiji_liezhuan = {
        '商君傳': '商君列傳',
        '張丞相傳': '張丞相列傳',
        '老子韓非傳': '老子韓非列傳',
        '屈原賈生傳': '屈原賈生列傳',
    }
    for short, full in shiji_liezhuan.items():
        text = re.sub(rf'(《史記》[^\n]*?역자 주:\s*〈){re.escape(short)}(〉)', rf'\1{full}\2', text)

    # 사망 연대는 '사망 312'가 아니라 '312 사망'으로 통일한다.
    text = re.sub(r'\(사망\s+(기원전\s+)?([0-9]+)\)', lambda m: f'({m.group(1) or ""}{m.group(2)} 사망)', text)

    # 영문 논문명은 따옴표를 쓰지 않는다. 저널/논문집 제목의 이탤릭은 유지한다.
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*\*[^*\n]+\*)', r'\1', text)
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*in\s+\*[^*\n]+\*)', r'\1', text)

    # 008·009는 최초 커밋 때 작성 시각보다 앞서 Pages 빌드가 시작되어
    # Jekyll이 미래 글로 제외했다. 이미 지난 시각으로 고정한다.
    if path.name == '2026-08-29-early-chinese-texts-Ch’u-tz’u.md':
        text = text.replace('date: 2026-08-29 14:20:00 +0900', 'date: 2026-08-29 14:15:00 +0900')
    elif path.name == '2026-08-29-early-chinese-texts-Chuang-tzu.md':
        text = text.replace('date: 2026-08-29 14:21:00 +0900', 'date: 2026-08-29 14:16:00 +0900')

    path.write_text(text, encoding='utf-8')
