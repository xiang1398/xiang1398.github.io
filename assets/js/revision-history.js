document.addEventListener('DOMContentLoaded', () => {
  const histories = {
    'early-chinese-texts-preface': [
      '2026-08-29: 번역 용어와 문헌학적 표현을 시리즈 공통 기준에 맞추어 교정.'
    ],
    'early-chinese-texts-appendix-i-bibliography-abbreviations': [
      '2026-08-29: 번역 용어, 서지 약호 및 서지 인용 형식을 시리즈 공통 기준에 맞추어 교정.'
    ],
    "early-chinese-texts-Chan-kuo-ts'e": [
      '2026-08-29: 번역 용어와 표기를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'
    ],
    'early-chinese-texts-Ch’ien-fu-lun': [
      '2026-08-29: 번역 용어와 표기를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'
    ],
    'early-chinese-texts-Chiu-chang-suan-shu': [
      '2026-08-29: 번역 용어와 오탈자를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'
    ],
    'early-chinese-texts-Chou-li': [
      '2026-08-29: 번역 용어와 오탈자를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'
    ]
  };

  const decodedPath = decodeURIComponent(window.location.pathname);
  const key = Object.keys(histories).find((candidate) => decodedPath.includes(candidate));
  if (!key) return;

  const postContent = document.querySelector('.post-content');
  if (!postContent || postContent.querySelector('.revision-history')) return;

  const section = document.createElement('section');
  section.className = 'revision-history';
  section.setAttribute('aria-label', '수정 이력');

  const heading = document.createElement('h2');
  heading.textContent = '수정 이력';
  section.appendChild(heading);

  const list = document.createElement('ul');
  histories[key].forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry;
    list.appendChild(item);
  });
  section.appendChild(list);
  postContent.appendChild(section);
});
