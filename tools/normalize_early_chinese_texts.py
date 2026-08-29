from pathlib import Path
import re

# 006–012는 같은 날의 연속 항목이므로 번호가 큰 글이 먼저 보이도록 시간을 정렬한다.
series_times = {
    '2026-08-29-early-chinese-texts-Chou-pi-suan-ching.md': '14:10:00',
    '2026-08-29-early-chinese-texts-Chu-shu-chi-nien.md': '14:11:00',
    '2026-08-29-early-chinese-texts-Ch’u-tz’u.md': '14:12:00',
    '2026-08-29-early-chinese-texts-Chuang-tzu.md': '14:13:00',
    '2026-08-29-early-chinese-texts-Ch’un-ch’iu.md': '14:14:00',
    '2026-08-29-early-chinese-texts-Ch’un-ch’iu-fan-lu.md': '14:15:00',
    '2026-08-29-early-chinese-texts-Chung-lun.md': '14:16:00',
}

# 중국어·일본어·영어 이외 언어의 문헌은 한국 독자를 위해 번역 제목을 덧붙인다.
# 원제만 이탤릭으로 하고, 대괄호 안의 한국어 번역은 정체로 둔다.
foreign_titles = {
    'Wang Fu: propos d’un ermite (Qianfu lun); introduction et traduction du chinois': '왕부: 은자의 말(《潛夫論》)—서론과 중국어 원문의 번역',
    'Index du Ts’ien Fou Louen': '《潛夫論》 색인',
    'Histoire des Mathématiques Chinoises': '중국 수학사',
    'Drevnekitajskij Traktat *Matematika v devjati Knigach*': '고대 중국의 수학서 《九章算術》',
    'Istoriko-matematiceskie issledovaniya': '수학사 연구',
    'Neun Bücher arithmetischer Technik': '산술 기법 아홉 편',
    'Abhandlungen zur Geschichte der Mathematische Wissenschaften': '수학사 논총',
    'Le Tcheou-li et le Shan-hai-king, leur origine et leur valeur historique': '《周禮》와 《山海經》—그 기원과 역사적 가치',
    'Das Priestertum im alten China': '고대 중국의 사제직',
    'Le Tcheou-li ou Rites des Tcheou': '《周禮》 또는 周의 예',
    'La composition et la date du Tso-chuan': '《左傳》의 성립과 연대',
    'Tch’ouen ts’ieou et Tso tschouan': '《春秋》와 《左傳》',
    'Studien zur Geschichte des konfuzianischen Dogmas und der chinesischen Staatsreligion': '유교 교의와 중국 국가종교의 역사 연구',
    'Tung Chung-shu Ch’un ch’iu fan lu: Übersetzung und Annotation der Kapitel eins bis sechs': '동중서 《春秋繁露》—제1~6편 번역과 주석',
    'Studien zur Geschichte des konfuzianischen Dogmas und der chinesischen Staatsreligion: das Problem des Tsch’un-t’siu und Tung Tschung-schu’s Tsch’un-tsiu fan lu': '유교 교의와 중국 국가종교의 역사 연구—《春秋》와 동중서의 《春秋繁露》 문제',
    'Les trois théories politiques du Tch’ouen Ts’ieu interprétées par Tong Tchong-chou': '동중서가 해석한 《春秋》의 세 가지 정치 이론',
}

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')

    # 부록은 별도 서지 문서이므로 001–012 본문에 적용하는 장식·순서 규칙에서 제외한다.
    numbered = bool(re.search(r'^title:\s*["\']?《Early Chinese Texts》\s+\d{3}:', text, re.M))

    if path.name in series_times:
        text = re.sub(
            r'^date:\s*2026-08-29\s+\d{2}:\d{2}:\d{2}\s+\+0900$',
            f'date: 2026-08-29 {series_times[path.name]} +0900',
            text,
            flags=re.M,
        )

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

    # 독일어·프랑스어·러시아어 등의 문헌에 한국어 번역을 덧붙인다.
    # 이미 번역이 있으면 중복하지 않고, 번역문은 이탤릭 바깥에 둔다.
    for title, ko in foreign_titles.items():
        pat = rf'\*{re.escape(title)}\*(?!\s*\[)'
        text = re.sub(pat, f'*{title}* [{ko}]', text)
        pat_plain = rf'(?<![\*\w]){re.escape(title)}(?![\w\*])(?!\s*\[)'
        text = re.sub(pat_plain, f'*{title}* [{ko}]', text)
        text = text.replace(f'*{title} [{ko}]*', f'*{title}* [{ko}]')

    # 앞선 번역안이 이미 적용된 경우 개선된 번역으로 갱신한다.
    text = text.replace('[고대 중국의 논서 《九章算術》]', '[고대 중국의 수학서 《九章算術》]')
    text = text.replace('[수학 과학사 논총]', '[수학사 논총]')

    # 《楚辭》: 일본어 서명은 음역하지 않고, 저자명은 저본의 로마자 표기를 따른다.
    if path.name == '2026-08-29-early-chinese-texts-Ch’u-tz’u.md':
        text = text.replace(
            '竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 *Soji sakuin* 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 *Soji kenkyū* 《楚辭研究》(東京, 1978)는',
            'Takeji Sadao 竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 《楚辭研究》(東京, 1978)는'
        )
        text = text.replace('역자 주: 〈屈原賈生列傳〉', '역자 주: 〈屈原列傳〉')

    # 각 항목 마지막의 원저자 서명은 장식적으로 이탤릭으로 통일한다.
    if numbered:
        text = re.sub(r'^(—\s*[^\n*]+)$', r'*\1*', text, flags=re.M)
        text = re.sub(r'^\*—\s+', '*—', text, flags=re.M)

    path.write_text(text, encoding='utf-8')
