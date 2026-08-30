from pathlib import Path
import re

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

notes_013_018 = {
    ('《漢書》', '30'): '〈藝文志〉', ('《漢書》', '87'): '〈揚雄傳〉',
    ('《史記》', '6'): '〈秦始皇本紀〉', ('《史記》', '45'): '〈韓世家〉',
    ('《史記》', '63'): '〈韓非列傳〉', ('《史記》', '121'): '〈儒林列傳〉',
    ('《後漢書》', '62'): '〈荀韓鍾陳列傳〉',
}

target_013_018 = {
    '2026-08-30-early-chinese-texts-Erh-ya.md', '2026-08-30-early-chinese-texts-Fa-yen.md',
    '2026-08-30-early-chinese-texts-Feng-su-tung-i.md', '2026-08-30-early-chinese-texts-Han-chi.md',
    '2026-08-30-early-chinese-texts-Han-fei-tzu.md', '2026-08-30-early-chinese-texts-Han-shih-wai-chuan.md',
}

for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    text = path.read_text(encoding='utf-8')
    numbered = bool(re.search(r'^title:\s*["\']?《?Early Chinese Texts》?\s+\d{3}[:.]', text, re.M))
    if path.name in series_times:
        day, clock = series_times[path.name]
        text = re.sub(r'^date:\s*2026-08-(?:29|30)(?:\s+\d{2}:\d{2}:\d{2}\s+\+0900)?$', f'date: {day} {clock} +0900', text, flags=re.M)

    title_map = {'2026-08-30-early-chinese-texts-Han-chi.md': '《Early Chinese Texts》 016: Han chi 漢紀', '2026-08-30-early-chinese-texts-Han-shih-wai-chuan.md': '《Early Chinese Texts》 018: Han shih wai chuan 韓詩外傳'}
    if path.name in title_map:
        text = re.sub(r'^title:.*$', f'title: "{title_map[path.name]}"', text, count=1, flags=re.M)
        text = re.sub(r'^categories:\s*\[Early Chinese Texts\]\s*$', 'categories:\n  - Translations\nseries: Early Chinese Texts', text, flags=re.M)

    for old, new in {'*Soji sakuin* 《楚辭索引》':'《楚辭索引》','*Soji kenkyū* 《楚辭研究》':'《楚辭研究》'}.items(): text=text.replace(old,new)
    text = re.sub(r'(역자 주:\s*)《([^》]+)》', r'\1〈\2〉', text)
    for short, full in {'商君傳':'商君列傳','張丞相傳':'張丞相列傳','屈原賈生傳':'屈原列傳','屈原賈生列傳':'屈原列傳'}.items():
        text = re.sub(rf'(《史記》[^\n]*?역자 주:\s*〈){re.escape(short)}(〉)', rf'\1{full}\2', text)

    if path.name in target_013_018:
        text = re.sub(r'(《(?:史記|漢書|後漢書|三國志|隋書|舊唐書|新唐書|宋史)》)\s*권(?=\d)', r'\1 卷', text)
        text = text.replace('역자 주: 〈老子韓非列傳〉','역자 주: 〈韓非列傳〉').replace('역자 주: 〈老子韓非傳〉','역자 주: 〈韓非列傳〉')

    if path.name == '2026-08-30-early-chinese-texts-Erh-ya.md':
        text = re.sub(r'《漢書》\s*卷30(?:\(역자 주: 〈藝文志〉\))?\s*1718쪽(?:\(역자 주: 〈藝文志〉\))?', '《漢書》 卷30 1718쪽(역자 주: 〈藝文志〉)', text)
        text = text.replace('《皇淸經解》 667갑, 1a–2a', '《皇淸經解》 667甲, 1a–2a')
        text = re.sub(r'(?<!Eiji )加賀榮治', 'Kaga Eiji 加賀榮治', text)
        text = re.sub(r'(?<!Naitō Torajirō )內藤虎次郎', 'Naitō Torajirō 內藤虎次郎', text)

    if path.name == '2026-08-30-early-chinese-texts-Fa-yen.md':
        text = re.sub(r'《漢書》\s*卷87(?:\(역자 주: 〈揚雄傳〉\))?하\s*(\d+쪽)(?:\(역자 주: 〈揚雄傳〉\))?', r'《漢書》 卷87下 \1(역자 주: 〈揚雄傳〉)', text)
        text = re.sub(r'《漢書》\s*卷30(?:\(역자 주: 〈藝文志〉\))?\s*(1727쪽)(?:\(역자 주: 〈藝文志〉\))?', r'《漢書》 卷30 \1(역자 주: 〈藝文志〉)', text)
        text = re.sub(r'《漢書》\s*卷99하\s*(4099쪽)(?!\(역자 주:)', r'《漢書》 卷99下 \1(역자 주: 〈王莽傳〉)', text)
        text = re.sub(r'《隋書》\s*卷34\s*(998쪽)(?!\(역자 주:)', r'《隋書》 卷34 \1(역자 주: 〈經籍志〉)', text)
        text = re.sub(r'《新唐書》\s*卷59\s*(1510쪽)(?!\(역자 주:)', r'《新唐書》 卷59 \1(역자 주: 〈藝文志〉)', text)
        text = re.sub(r'《舊唐書》\s*卷47\s*(2024쪽)(?!\(역자 주:)', r'《舊唐書》 卷47 \1(역자 주: 〈經籍志〉)', text)
        text = re.sub(r'(?<!Fujiwara Sukeyo )藤原佐世', 'Fujiwara Sukeyo 藤原佐世', text)
        text = re.sub(r'Fujiwara Sukeyo 藤原佐世의 목록(?!\(역자 주: 《日本國見在書目錄》\))', 'Fujiwara Sukeyo 藤原佐世의 목록(역자 주: 《日本國見在書目錄》)', text)
        text = re.sub(r'(?<!Naitō Torajirō )內藤虎次郎', 'Naitō Torajirō 內藤虎次郎', text)
        text = re.sub(r'(?<!Kaga Eiji )加賀榮治', 'Kaga Eiji 加賀榮治', text)

    if path.name == '2026-08-30-early-chinese-texts-Feng-su-tung-i.md':
        text = re.sub(r'《後漢書》\s*卷48\s*(1609–1615쪽)(?!\(역자 주:)', r'《後漢書》 卷48 \1(역자 주: 〈應奉列傳〉)', text)
        text = re.sub(r'《三國志》\s*卷1\(〈魏書〉\s*卷1\)\s*(11쪽 주1)(?!\(역자 주:)', r'《三國志》 卷1 \1(역자 주: 〈魏書·武帝紀〉)', text)
        text = re.sub(r'華嶠의 《後漢書》\s*卷1\s*(22a 및 534–535쪽)(?!\(역자 주:)', r'華嶠의 《後漢書》 卷1 \1(역자 주: 〈應劭傳〉 일문)', text)
        text = re.sub(r'范曄\(398–446\)의 《後漢書》\s*卷48\s*(1614쪽)(?!\(역자 주:)', r'范曄(398–446)의 《後漢書》 卷48 \1(역자 주: 〈應奉列傳〉)', text)
        text = re.sub(r'《隋書》\s*卷34\s*(1006쪽)(?!\(역자 주:)', r'《隋書》 卷34 \1(역자 주: 〈經籍志〉)', text)
        text = re.sub(r'《舊唐書》\s*卷47\s*(2033쪽)(?!\(역자 주:)', r'《舊唐書》 卷47 \1(역자 주: 〈經籍志〉)', text)
        text = re.sub(r'《新唐書》\s*卷59\s*(1534쪽)(?!\(역자 주:)', r'《新唐書》 卷59 \1(역자 주: 〈藝文志〉)', text)
        text = re.sub(r'《宋史》\s*卷454\s*(13345쪽)(?!\(역자 주:)', r'《宋史》 卷454 \1(역자 주: 〈丁黼傳〉)', text)
        text = re.sub(r'(?<!Fujiwara Sukeyo )藤原佐世', 'Fujiwara Sukeyo 藤原佐世', text)
        text = re.sub(r'Fujiwara Sukeyo 藤原佐世의 목록(?!\(역자 주: 《日本國見在書目錄》\))', 'Fujiwara Sukeyo 藤原佐世의 목록(역자 주: 《日本國見在書目錄》)', text)
        text = re.sub(r'(?<!Kaga Eiji )加賀榮治', 'Kaga Eiji 加賀榮治', text)
        text = re.sub(r'(?<!Naitō Torajirō )內藤虎次郎', 'Naitō Torajirō 內藤虎次郎', text)

    text = re.sub(r'\(사망\s+(기원전\s+)?([0-9]+)\)', lambda m:f'({m.group(1) or ""}{m.group(2)} 사망)', text)
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*\*[^*\n]+\*)', r'\1', text)
    text = re.sub(r'[“"]([^”"\n]+)[”"](?=,\s*in\s+\*[^*\n]+\*)', r'\1', text)
    for title, ko in foreign_titles.items():
        text = re.sub(rf'\*{re.escape(title)}\*(?!\s*\[)', f'*{title}* [{ko}]', text)
        text = re.sub(rf'(?<![\*\w]){re.escape(title)}(?![\w\*])(?!\s*\[)', f'*{title}* [{ko}]', text)
        text = text.replace(f'*{title} [{ko}]*', f'*{title}* [{ko}]')
    text=text.replace('[고대 중국의 논서 《九章算術》]','[고대 중국의 수학서 《九章算術》]').replace('[수학 과학사 논총]','[수학사 논총]')
    if path.name == '2026-08-29-early-chinese-texts-Ch’u-tz’u.md':
        text=text.replace('竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 *Soji sakuin* 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 *Soji kenkyū* 《楚辭研究》(東京, 1978)는','Takeji Sadao 竹治貞夫가 《四部叢刊》본 《楚辭補注》를 바탕으로 만든 색인 《楚辭索引》은 德島大學에서 1964년에 간행했다. 그의 《楚辭研究》(東京, 1978)는').replace('역자 주: 〈屈原賈生列傳〉','역자 주: 〈屈原列傳〉')
    if numbered:
        text=re.sub(r'^(—\s*[^\n*]+)$',r'*\1*',text,flags=re.M); text=re.sub(r'^\*—\s+', '*—', text, flags=re.M)
    path.write_text(text,encoding='utf-8')