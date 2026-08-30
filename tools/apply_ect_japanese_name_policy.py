from pathlib import Path

changes = {
    '_posts/2026-08-30-early-chinese-texts-Hsiao-ching.md': [
        ('Hayashi Hideichi 林秀一는 1951년에', '林秀一는 1951년에'),
    ],
    '_posts/2026-08-30-early-chinese-texts-Huang-ti-nei-ching.md': [
        ('Akahori 赤堀', '赤堀'), ('Yamada 山田', '山田'), ('Sakurai 櫻井', '櫻井'),
        ('Okanishi 岡西', '岡西'), ('Miyashita 宮下', '宮下'), ('Kosoto 小曾戶', '小曾戶'),
        ('Maruyama Masao 丸山昌朗', '丸山昌朗'), ('Okuri Ei’ichi 小栗英一', '小栗英一'),
        ('Yabuuchi Kiyoshi 藪內清', '藪內清'), ('Fujiki Toshirō 藤木俊郎', '藤木俊郎'),
    ],
}

for filename, replacements in changes.items():
    path = Path(filename)
    text = path.read_text(encoding='utf-8')
    if '## 10. 참고문헌' in text:
        body, bibliography = text.split('## 10. 참고문헌', 1)
        suffix = '## 10. 참고문헌' + bibliography
    else:
        body, suffix = text, ''
    for old, new in replacements:
        body = body.replace(old, new)
    path.write_text(body + suffix, encoding='utf-8')
