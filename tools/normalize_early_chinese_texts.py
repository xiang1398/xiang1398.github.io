from pathlib import Path
import re

# 같은 날의 연속 항목은 번호가 큰 글이 먼저 보이도록 분 단위로 정렬한다.
series_times = {
    '2026-08-29-early-chinese-texts-Chou-pi-suan-ching.md': ('2026-08-29', '14:10:00'),
    '2026-08-29-early-chinese-texts-Chu-shu-chi-nien.md': ('2026-08-29', '14:11:00'),
    '2026-08-29-early-chinese-texts-Ch’u-tz’u.md': ('2026-08-29', '14:12:00'),
    '2026-08-29-early-chinese-texts-Chuang-tzu.md': ('2026-08-29', '14:13:00'),
    '2026-08-29-early-chinese-texts-Ch’un-ch’iu.md': ('2026-08-29', '14:14:00'),
    '2026-08-29-early-chinese-texts-Ch’un-ch’iu-fan-lu.md': ('2026-08-29', '14:15:00'),
    '2026-08-29-early-chinese-texts-Chung-lun.md': ('2026-08-29', '14:16:00'),
    '2026-08-30-early-chinese-texts-Erh-ya.md': ('2026-08-30', '09:10:00'),
    '2026-08-30-early-chinese-texts-Fa-yen.md': ('2026-08-30', '09:11:00'),
    '2026-08-30-early-chinese-texts-Feng-su-tung-i.md': ('2026-08-30', '09:12:00'),
    '2026-08-30-early-chinese-texts-Han-chi.md': ('2026-08-30', '09:13:00'),
    '2026-08-30-early-chinese-texts-Han-fei-tzu.md': ('2026-08-30', '09:14:00'),
    '2026-08-30-early-chinese-texts-Han-shih-wai-chuan.md': ('2026-08-30', '09:15:00'),
}

# 중국어·일본어·영어 이외 언어의 문헌은 한국 독자를 위해 번역 제목을 덧붙인다.
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
    numbered = bool(re.search(r'^title:\s*["\']?《?Early Chinese Texts》?\s+\d{3}[:.]', text, re.M))

    if path.name in series_times:
        day, clock = series_times[path.name]
        text = re.sub(
            r'^date:\s*2026-08-(?:29|30)(?:\s+\d{2}:\d{2}:\d{2}\s+\+0900)?$',
            f'date: {day} {clock} +0900',
            text,
            flags=re.M,
        )

    # 013–018 제목/분류 형식을 앞선 연재와 통일한다.
    title_map = {
        '2026-08-30-early-chinese-texts-Han-chi.md': '《Early Chinese Texts》 016: Han chi 漢紀',
        '2026-08-30-early-chinese-texts-Han-shih-wai-chuan.md': '《Early Chinese Texts》 018: Han shih wai chuan 韓詩外傳',
    }
    if path.name in title_map:
        text = re.sub(r'^title:.*$', f'title: "{title_map[path.name]}"', text, count=1, flags=re.M)
        text = re.sub(r'^categories:\s*\[Early Chinese Texts\]\s*$', 'categories:\n  - Translations\nseries: Early Chinese Texts', text, flags=re.M)

    # 일본어 자료: 로마자 음역은 인명에만 둔다. 서명·논문명·총서명은 한자/일본어 원문 표기만 쓴다.
    # 기존에 확인된 일본어 서명 음역은 제거한다.
    japanese_title_romanizations = {
        '*Soji sakuin* 《楚辭索引》': '《楚辭索引》',
        '*Soji kenkyū* 《楚辭研究》': '《楚辭研究》',
    }
    for old, new in japanese_title_romanizations.items():
        text = text.replace(old, new)

    # 역자 주에서 역사서 내부의 편·지·전 등 부분명은 〈〉로 표기한다.
    text = re.sub(r'(역자 주:\s*)《([^》]+)》', r'\1〈\2〉', text)

    shiji_liezhuan = {
        '商君傳': '商君列傳',
        '張丞相傳': '張丞相列傳',
        '老子韓非傳': '老子韓非列傳',
        '屈原賈生傳': '屈原列傳',
        '屈原賈生列傳': '屈原列傳',
    }
    for short, full in shiji_liezhuan.items():
        text = re.sub(rf'(《史記》[^\n]*?역자 주:\s*〈){re.escape(short)}(〉)', rf'\1{full}\2', text)

    text = re.sub(r'\(사망\s+(기원전\s+)?([0-9]+)\)', lambda m: f'({m.group(1) or ""}{m.group(2)} 사망)', text)

    # 영문 논문명은 따옴표를 쓰지 않는다.
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*\*[^*\n]+\*)', r'\1', text)
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*in\s+\*[^*\n]+\*)', r'\1', text)

    for title, ko in foreign_titles.items():
        pat = rf'\*{re.escape(title)}\*(?!\s*\[)'
        text = re.sub(pat, f'*{title}* [{ko}]', text)
        pat_plain = rf'(?<![\*\w]){re.escape(title)}(?![\w\*])(?!\s*\[)'
        text = re.sub(pat_plain, f'*{title}* [{ko}]', text)
        text = text.replace(f'*{title} [{ko}]*', f'*{title}* [{ko}]')

    text = text.replace('[고대 중국의 논서 《九章算術》]', '[고대 중국의 수학서 《九章算術》]')
    text = text.replace('[수학 과학사 논총]', '[수학사 논총]')

    if path.name == '2026-08-29-early-chinese-texts-Ch’u-tz’u.md':
        text = text.replace(
            '竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 *Soji sakuin* 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 *Soji kenkyū* 《楚辭研究》(東京, 1978)는',
            'Takeji Sadao 竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 《楚辭研究》(東京, 1978)는'
        )
        text = text.replace('역자 주: 〈屈原賈生列傳〉', '역자 주: 〈屈原列傳〉')

    if numbered:
        text = re.sub(r'^(—\s*[^\n*]+)$', r'*\1*', text, flags=re.M)
        text = re.sub(r'^\*—\s+', '*—', text, flags=re.M)

    path.write_text(text, encoding='utf-8')
