from pathlib import Path
import re

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')
    # 역자 주에서 역사서 내부의 편·지·전 등 부분명은 〈〉로 표기한다.
    text = re.sub(r'(역자 주:\s*)《([^》]+)》', r'\1〈\2〉', text)

    # 《史記》 열전의 역자 주는 인용된 인물·부분에 맞추어 간명하게 표기한다.
    shiji_liezhuan = {
        '商君傳': '商君列傳',
        '張丞相傳': '張丞相列傳',
        '老子韓非傳': '老子韓非列傳',
        '屈原賈生傳': '屈原列傳',
        '屈原賈生列傳': '屈原列傳',
    }
    for short, full in shiji_liezhuan.items():
        text = re.sub(rf'(《史記》[^\n]*?역자 주:\s*〈){re.escape(short)}(〉)', rf'\1{full}\2', text)

    # 사망 연대는 '사망 312'가 아니라 '312 사망'으로 통일한다.
    text = re.sub(r'\(사망\s+(기원전\s+)?([0-9]+)\)', lambda m: f'({m.group(1) or ""}{m.group(2)} 사망)', text)

    # 영문 논문명은 따옴표를 쓰지 않는다. 저널/논문집 제목의 이탤릭은 유지한다.
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*\*[^*\n]+\*)', r'\1', text)
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*in\s+\*[^*\n]+\*)', r'\1', text)

    # 《楚辭》: 일본어 서명은 음역하지 않고, 저자명은 저본의 로마자 표기를 따른다.
    if path.name == '2026-08-29-early-chinese-texts-Ch’u-tz’u.md':
        text = text.replace(
            '竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 *Soji sakuin* 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 *Soji kenkyū* 《楚辭研究》(東京, 1978)는',
            'Takeji Sadao 竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 《楚辭研究》(東京, 1978)는'
        )
        text = text.replace(
            '《史記》 卷84, 2484쪽(역자 주: 〈屈原賈生列傳〉)',
            '《史記》 卷84, 2484쪽(역자 주: 〈屈原列傳〉)'
        )
        text = text.replace(
            '〈哀郢〉을 제목으로 언급하고(卷84 2503쪽), 〈懷沙〉는 전문을 인용한다(卷84 2486쪽 이하).',
            '〈哀郢〉을 제목으로 언급하고(卷84, 2503쪽, 역자 주: 〈屈原列傳〉), 〈懷沙〉는 전문을 인용한다(卷84, 2486쪽 이하, 역자 주: 〈屈原列傳〉).'
        )
        text = text.replace('역자 주: 〈屈原賈生列傳〉', '역자 주: 〈屈原列傳〉')

    path.write_text(text, encoding='utf-8')
