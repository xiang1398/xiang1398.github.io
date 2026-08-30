from pathlib import Path
import re

# In running prose, Japanese scholars are written in Han characters only.
# Bibliography/reference sections are deliberately left untouched.
# Names not independently represented in a bibliography are also left untouched.

mapping = {
    'Fujiwara Sukeyo 藤原佐世':'藤原佐世',
    'Fujiwara Chikanaga 藤原親長':'藤原親長',
    'Hattori Unokichi 服部宇之吉':'服部宇之吉',
    'Ōta Zensai 太田全齋':'太田全齋',
    'Ota Zensai 太田全齋':'太田全齋',
    'Matsudaira Yasukuni 松平康國':'松平康國',
    'Uno Tetsuto 宇野哲人':'宇野哲人',
    'Koyanagi Shikita 小柳司氣太':'小柳司氣太',
    'Takeuchi Teruo 竹內照夫':'竹內照夫',
    'Nishino Hiroyoshi 西野廣祥':'西野廣祥',
    'Ichikawa Hiroshi 市川宏':'市川宏',
    'Kakimura Takashi 柿村峻':'柿村峻',
    'Onozawa Seiichi 小野澤精一':'小野澤精一',
    'Tsuda Gokō 津田梧岡':'津田梧岡',
    'Tsuneishi Shigeru 常石茂':'常石茂',
    'Honda Wataru 本田濟':'本田濟',
    'Nishimura Fumiko 西村富美子':'西村富美子',
    'Toriyama Shūgaku 鳥山崧岳':'鳥山崧岳',
    'Toyoshima Mutsu 豐島睦':'豐島睦',
    'Toyoshima Mutsu 豊島睦':'豊島睦',
    'Iida Chūbee 飯田忠兵衛':'飯田忠兵衛',
    'Nagasawa Kikuya 長澤規矩也':'長澤規矩也',
    'Uchida Tomoo 內田智雄':'內田智雄',
    'Katō Shigeru 加藤繁':'加藤繁',
    'Suzuki Yoshijirō 鈴木由次郎':'鈴木由次郎',
    'Otake Takeo 小竹武夫':'小竹武夫',
    'Kurata Junnosuke 倉田淳之助':'倉田淳之助',
    'Kano Naoki 狩野直喜':'狩野直喜',
    'Sanae Yoshio 早苗良雄':'早苗良雄',
    'Hosokawa Kazutoshi 細川一敏':'細川一敏',
    'Ōgata Toru 大形徹':'大形徹',
    'Suzuki Yoshikazu 鈴木喜一':'鈴木喜一',
    'Momoi Hakuroku 桃井白鹿':'桃井白鹿',
    'Takeuchi Yoshio 武內義雄':'武內義雄',
    'Hayashi Hideichi 林秀一':'林秀一',
    'Shigeno Yasutsugu 重野安繹':'重野安繹',
    'Hoshino Tsune 星野恒':'星野恒',
    'Kumazawa Banzan 熊澤蕃山':'熊澤蕃山',
    'Katsuta Sukeyoshi 勝田主計':'勝田主計',
    'Yamaguchi Satsujō 山口察常':'山口察常',
    'Hayashi Taisuke 林泰輔':'林泰輔',
    'Kurihara Keisuke 栗原圭介':'栗原圭介',
    'Ikeda Shūzō 池田秀三':'池田秀三',
    'Hirotsune Jinsei 廣常人世':'廣常人世',
    'Yoshinami Takashi 好並隆司':'好並隆司',
    'Satō Akira 佐藤明':'佐藤明',
    'Uno Shigehiko 宇野茂彥':'宇野茂彥',
    'Miyazaki Ichisada 宮崎市定':'宮崎市定',
    'Kanaya Osamu 金谷治':'金谷治',
    'Kojima Kenkichirō 小島謙吉郞':'小島謙吉郞',
    'Kubo Chikusui 久保築水':'久保築水',
    'Asakawa Kanae 朝川鼎':'朝川鼎',
    'Katayama Keizan 片山兼山':'片山兼山',
    'Kaga Eiji 加賀榮治':'加賀榮治',
    'Naitō Torajirō 內藤虎次郎':'內藤虎次郎',
}

# Entries 001-020: preface + first twenty numbered ECT posts, excluding appendix posts.
posts=[]
for p in Path('_posts').glob('*early-chinese-texts-*.md'):
    text=p.read_text(encoding='utf-8')
    m=re.search(r'^ect_order:\s*(\d+)\s*$', text, re.M)
    if m and int(m.group(1)) <= 20:
        posts.append(p)
        continue
    if p.name == '2026-08-18-early-chinese-texts-preface.md':
        posts.append(p)

changed=[]
for p in sorted(set(posts)):
    text=p.read_text(encoding='utf-8')
    # detect bibliography/reference heading; if absent, conservatively do nothing
    head=re.search(r'(?m)^##\s+(?:\d+\.\s*)?(?:서지|참고문헌|Bibliograph[^\n]*|References?)\s*$', text, re.I)
    if not head:
        continue
    body=text[:head.start()]
    bib=text[head.start():]
    # Only remove a romanized+Hanzi form from prose when the same full form is
    # independently present in the bibliography/reference section.
    before=body
    for full, han in mapping.items():
        if full in bib:
            body=body.replace(full, han)
    if body != before:
        p.write_text(body+bib, encoding='utf-8')
        changed.append(str(p))

print('changed files:', len(changed))
for x in changed:
    print(x)
