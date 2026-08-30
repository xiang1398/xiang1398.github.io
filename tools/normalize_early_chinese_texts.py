from pathlib import Path
import re

TARGETS = {
    '2026-08-30-early-chinese-texts-Erh-ya.md',
    '2026-08-30-early-chinese-texts-Fa-yen.md',
    '2026-08-30-early-chinese-texts-Feng-su-tung-i.md',
    '2026-08-30-early-chinese-texts-Han-chi.md',
    '2026-08-30-early-chinese-texts-Han-fei-tzu.md',
    '2026-08-30-early-chinese-texts-Han-shih-wai-chuan.md',
}

CITATION_NOTICE = '''<p class="citation-notice">
  이 글을 인용하거나 재사용할 때에는 출처를 밝혀 주시기 바랍니다.
  인용 정보:
  「{{ page.title }}」,
  『{{ site.title }}』,
  {{ page.date | date: "%Y-%m-%d" }},
  <a href="{{ page.url | absolute_url }}">{{ page.url | absolute_url }}</a>
</p>'''

JAPANESE_NAMES = {
    '加賀榮治': 'Kaga Eiji 加賀榮治',
    '內藤虎次郎': 'Naitō Torajirō 內藤虎次郎',
    '藤原佐世': 'Fujiwara Sukeyo 藤原佐世',
    '服部宇之吉': 'Hattori Unokichi 服部宇之吉',
    '太田全齋': 'Ōta Zensai 太田全齋',
    '松平康國': 'Matsudaira Yasukuni 松平康國',
    '宇野哲人': 'Uno Tetsuto 宇野哲人',
    '小柳司氣太': 'Koyanagi Shikita 小柳司氣太',
    '竹內照夫': 'Takeuchi Teruo 竹內照夫',
    '西野廣祥': 'Nishino Hiroyoshi 西野廣祥',
    '市川宏': 'Ichikawa Hiroshi 市川宏',
    '柿村峻': 'Kakimura Takashi 柿村峻',
    '小野澤精一': 'Onozawa Seiichi 小野澤精一',
    '津田梧岡': 'Tsuda Gokō 津田梧岡',
    '常石茂': 'Tsuneishi Shigeru 常石茂',
    '本田濟': 'Honda Wataru 本田濟',
    '西村富美子': 'Nishimura Fumiko 西村富美子',
    '鳥山崧岳': 'Toriyama Shūgaku 鳥山崧岳',
    '豐島睦': 'Toyoshima Mutsu 豐島睦',
    '豊島睦': 'Toyoshima Mutsu 豊島睦',
}

NOTE_RULES = [
    (r'《漢書》\s*卷30,?\s*1718쪽(?:\(역자 주: 〈藝文志〉\))*', '《漢書》 卷30, 1718쪽(역자 주: 〈藝文志〉)'),
    (r'《漢書》\s*卷87(?:下|하)?[,]?\s*3580쪽(?:\(역자 주: 〈揚雄傳〉\))*', '《漢書》 卷87下, 3580쪽(역자 주: 〈揚雄傳〉)'),
    (r'《漢書》\s*卷87(?:下|하)?[,]?\s*3585쪽(?:\(역자 주: 〈揚雄傳〉\))*', '《漢書》 卷87下, 3585쪽(역자 주: 〈揚雄傳〉)'),
    (r'《漢書》\s*卷99(?:下|하)?[,]?\s*4099쪽(?:\(역자 주: 〈王莽傳〉\))*', '《漢書》 卷99下, 4099쪽(역자 주: 〈王莽傳〉)'),
    (r'《漢書》\s*卷30[,]?\s*1727쪽(?:\(역자 주: 〈藝文志〉\))*', '《漢書》 卷30, 1727쪽(역자 주: 〈藝文志〉)'),
    (r'《隋書》\s*卷34[,]?\s*998쪽(?:\(역자 주: 〈經籍志〉\))*', '《隋書》 卷34, 998쪽(역자 주: 〈經籍志〉)'),
    (r'《新唐書》\s*卷59[,]?\s*1510쪽(?:\(역자 주: 〈藝文志〉\))*', '《新唐書》 卷59, 1510쪽(역자 주: 〈藝文志〉)'),
    (r'《舊唐書》\s*卷47[,]?\s*2024쪽(?:\(역자 주: 〈經籍志〉\))*', '《舊唐書》 卷47, 2024쪽(역자 주: 〈經籍志〉)'),
    (r'《宋史》\s*卷205[,]?\s*5173쪽(?:\(역자 주: 〈藝文志〉\))*', '《宋史》 卷205, 5173쪽(역자 주: 〈藝文志〉)'),
    (r'《後漢書》\s*卷48[,]?\s*1609–1615쪽(?:\(역자 주: 〈應奉列傳〉\))*', '《後漢書》 卷48, 1609–1615쪽(역자 주: 〈應奉列傳〉)'),
    (r'《三國志》\s*卷1(?:\(〈魏書〉\s*卷1\))?[,]?\s*11쪽 주1(?:\(역자 주: 〈(?:魏書·)?武帝紀〉\))*', '《三國志》 卷1, 11쪽 주1(역자 주: 〈武帝紀〉)'),
    (r'華嶠의 《後漢書》\s*卷1[,]?\s*22a 및 534–535쪽(?:\(역자 주: 〈應劭傳〉 일문\))*', '華嶠의 《後漢書》 卷1, 22a 및 534–535쪽(역자 주: 〈應劭傳〉 일문)'),
    (r'范曄\(398–446\)의 《後漢書》\s*卷48[,]?\s*1614쪽(?:\(역자 주: 〈應奉列傳〉\))*', '范曄(398–446)의 《後漢書》 卷48, 1614쪽(역자 주: 〈應奉列傳〉)'),
    (r'《隋書》\s*卷34[,]?\s*1006쪽(?:\(역자 주: 〈經籍志〉\))*', '《隋書》 卷34, 1006쪽(역자 주: 〈經籍志〉)'),
    (r'《舊唐書》\s*卷47[,]?\s*2033쪽(?:\(역자 주: 〈經籍志〉\))*', '《舊唐書》 卷47, 2033쪽(역자 주: 〈經籍志〉)'),
    (r'《新唐書》\s*卷59[,]?\s*1534쪽(?:\(역자 주: 〈藝文志〉\))*', '《新唐書》 卷59, 1534쪽(역자 주: 〈藝文志〉)'),
    (r'《宋史》\s*卷206[,]?\s*5208쪽(?:\(역자 주: 〈藝文志〉\))*', '《宋史》 卷206, 5208쪽(역자 주: 〈藝文志〉)'),
    (r'《宋史》\s*卷454[,]?\s*13345쪽(?:\(역자 주: 〈丁黼傳〉\))*', '《宋史》 卷454, 13345쪽(역자 주: 〈丁黼傳〉)'),
    (r'《後漢書》\s*卷62(?:\(역자 주: 〈荀韓鍾陳列傳〉\))?[,]?\s*2062쪽(?:\(역자 주: 〈荀韓鍾陳列傳〉\))*', '《後漢書》 卷62, 2062쪽(역자 주: 〈荀悅傳〉)'),
    (r'《史記》\s*卷6(?:\(역자 주: 〈秦始皇本紀〉\))?[,]?\s*230쪽(?:\(역자 주: 〈秦始皇本紀〉\))*', '《史記》 卷6, 230쪽(역자 주: 〈秦始皇本紀〉)'),
    (r'(?:卷|權|권)63[,]?\s*2157쪽', '卷63, 2157쪽(역자 주: 〈韓非列傳〉)'),
    (r'(?:卷|權|권)45[,]?\s*1878쪽', '卷45, 1878쪽(역자 주: 〈韓世家〉)'),
    (r'《史記》\s*卷6(?:\(역자 주: 〈秦始皇本紀〉\))?3[,]?\s*2147쪽', '《史記》 卷63, 2147쪽(역자 주: 〈韓非列傳〉)'),
    (r'《漢書》\s*卷30(?:\(역자 주: 〈藝文志〉\))?[,]?\s*1735쪽(?:\(역자 주: 〈藝文志〉\))*', '《漢書》 卷30, 1735쪽(역자 주: 〈藝文志〉)'),
    (r'《隋書》\s*卷34[,]?\s*1003쪽', '《隋書》 卷34, 1003쪽(역자 주: 〈經籍志〉)'),
    (r'《宋史》\s*卷205[,]?\s*5202쪽', '《宋史》 卷205, 5202쪽(역자 주: 〈藝文志〉)'),
    (r'《漢書》\s*卷30(?:\(역자 주: 〈藝文志〉\))?[,]?\s*1708쪽(?:\(역자 주: 〈藝文志〉\))*', '《漢書》 卷30, 1708쪽(역자 주: 〈藝文志〉)'),
    (r'《史記》\s*卷121(?:\(역자 주: 〈儒林列傳〉\))?[,]?\s*3124쪽(?:\(역자 주: 〈儒林列傳〉\))*', '《史記》 卷121, 3124쪽(역자 주: 〈儒林列傳〉)'),
    (r'《漢書》\s*卷88(?:\(역자 주: 〈儒林傳〉\))?[,]?\s*3613쪽(?:\(역자 주: 〈儒林傳〉\))*', '《漢書》 卷88, 3613쪽(역자 주: 〈儒林傳〉)'),
]

JAPANESE_TITLE_REPLACEMENTS = {
    'A. Kambun taikei 《漢文大系》': 'A. 《漢文大系》',
    'B. Kanseki kokujikai zensho 《漢籍國字解全書》': 'B. 《漢籍國字解全書》',
    'D. Kokuyaku kambun taisei 《國譯漢文大成》': 'D. 《國譯漢文大成》',
    'E. Kambun sōsho 《漢文叢書》': 'E. 《漢文叢書》',
    'F. Keisho taikō 《經書大講》': 'F. 《經書大講》',
    'H. Shinshaku kambun taikei 《新釋漢文大系》': 'H. 《新釋漢文大系》',
    'J. Chūgoku no shisō 《中國の思想》': 'J. 《中國の思想》',
    'K. Chūgoku koten bungaku taikei 《中國古典文學大系》': 'K. 《中國古典文學大系》',
    'L. Chūgoku koten shinsho 《中國古典新書》': 'L. 《中國古典新書》',
    'Kampishi kaiko 《韓非子解詁》': '《韓非子解詁》',
    'Kampishi kōgi 《韓非子講義》': '《韓非子講義》',
    'Kampishi 《韓非子》': '《韓非子》',
    '“Kanshi gaiden no ichi kōsatsu 韓詩外傳の一考察,”': '〈韓詩外傳の一考察〉,',
    '“Kanshi gaiden no ichi kōsatsu 韓詩外傳の一考察”': '〈韓詩外傳の一考察〉',
    '*Chūgoku bungaku hō* 《中國文學報》': '《中國文學報》',
    '*Kanshi gaiden sakuin* 《韓詩外傳索引》': '《韓詩外傳索引》',
}


def add_notice_and_heading(text: str, filename: str) -> str:
    if filename == '2026-08-30-early-chinese-texts-Han-chi.md':
        text = text.replace('\n# 《漢紀》\n\n이 번역문은 GPT-5.6 모델로 기계번역한 뒤 편집·교정한 것입니다.\n', '\n' + CITATION_NOTICE + '\n\n## Han chi 《漢紀》\n\n*이 번역문은 GPT-5.6 모델로 기계번역한 뒤 편집·교정한 것입니다*\n')
    if filename == '2026-08-30-early-chinese-texts-Han-shih-wai-chuan.md':
        text = text.replace('\n# 《韓詩外傳》\n\n이 번역문은 GPT-5.6 모델로 기계번역한 뒤 편집·교정한 것입니다.\n', '\n' + CITATION_NOTICE + '\n\n## Han shih wai chuan 《韓詩外傳》\n\n*이 번역문은 GPT-5.6 모델로 기계번역한 뒤 편집·교정한 것입니다*\n')
    return text


def normalize(text: str, filename: str) -> str:
    text = add_notice_and_heading(text, filename)
    text = re.sub(r'(《[^》]+》)\s*권(?=\d)', r'\1 卷', text)
    text = re.sub(r'(《[^》]+》)\s*權(?=\d)', r'\1 卷', text)
    text = text.replace('(역자 주: 《日本國見在書目錄》)(역자 주: 〈日本國見在書目錄〉)', '(역자 주: 《日本國見在書目錄》)')
    text = text.replace('(역자 주: 〈日本國見在書目錄〉)(역자 주: 《日本國見在書目錄》)', '(역자 주: 《日本國見在書目錄》)')
    for pattern, repl in NOTE_RULES:
        text = re.sub(pattern, repl, text)
    text = re.sub(r'(?:Fujiwara Sukeyo )?藤原佐世의 목록(?:\(역자 주: [《〈]日本國見在書目錄[》〉]\))*', 'Fujiwara Sukeyo 藤原佐世의 목록(역자 주: 《日本國見在書目錄》)', text)
    text = re.sub(r'\((《(?:史記|漢書|後漢書|三國志|隋書|舊唐書|新唐書|宋史)》[^()]*?\(역자 주: 〈[^〉]+〉\))\)', r'\1', text)
    for hanzi, full in JAPANESE_NAMES.items():
        if full not in text:
            text = text.replace(hanzi, full)
    for old, new in JAPANESE_TITLE_REPLACEMENTS.items():
        text = text.replace(old, new)
    text = text.replace('《皇淸經解》 667갑, 1a–2a', '《皇淸經解》 667甲, 1a–2a')
    text = text.replace('Nishimura Fumiko Nishimura Fumiko 西村富美子', 'Nishimura Fumiko 西村富美子')
    text = text.replace('Toriyama Shūgaku Toriyama Shūgaku 鳥山崧岳', 'Toriyama Shūgaku 鳥山崧岳')
    text = text.replace('Toyoshima Mutsu Toyoshima Mutsu 豐島睦', 'Toyoshima Mutsu 豐島睦')
    return text


for path in Path('_posts').glob('*early-chinese-texts-*.md'):
    if path.name not in TARGETS:
        continue
    old = path.read_text(encoding='utf-8')
    new = normalize(old, path.name)
    if new != old:
        path.write_text(new, encoding='utf-8')
