document.addEventListener('DOMContentLoaded', () => {
  const histories = [
    { match: ['early-chinese-texts-preface', 'Early Chinese Texts》 서문'], entries: ['2026-08-29: 번역 용어와 문헌학적 표현을 시리즈 공통 기준에 맞추어 교정.'] },
    { match: ['early-chinese-texts-appendix-i-bibliography-abbreviations', 'Appendix I'], entries: ['2026-08-29: 번역 용어, 서지 약호 및 서지 인용 형식을 시리즈 공통 기준에 맞추어 교정.'] },
    { match: ["early-chinese-texts-Chan-kuo-ts'e", "Chan-kuo ts'e", '戰國策'], entries: ['2026-08-29: 번역 용어와 표기를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'] },
    { match: ['early-chinese-texts-Ch’ien-fu-lun', 'early-chinese-texts-Ch-ien-fu-lun', 'Ch’ien-fu lun', '潛夫論'], entries: ['2026-08-29: 번역 용어와 표기를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'] },
    { match: ['early-chinese-texts-Chiu-chang-suan-shu', 'Chiu chang suan shu', '九章算術'], entries: ['2026-08-29: 번역 용어와 오탈자를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'] },
    { match: ['early-chinese-texts-Chou-li', 'Chou li', '周禮'], entries: ['2026-08-29: 번역 용어와 오탈자를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.'] }
  ];

  const decodedPath = decodeURIComponent(window.location.pathname);
  const title = document.querySelector('.post-title')?.textContent || document.title || '';
  const history = histories.find(({ match }) => match.some((needle) => decodedPath.includes(needle) || title.includes(needle)));
  if (!history) return;

  const postContent = document.querySelector('.post-content');
  if (!postContent || postContent.querySelector('.revision-history')) return;

  const section = document.createElement('section');
  section.className = 'revision-history';
  section.setAttribute('aria-label', '수정 이력');

  const heading = document.createElement('h2');
  heading.textContent = '수정 이력';
  section.appendChild(heading);

  const list = document.createElement('ul');
  history.entries.forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry;
    list.appendChild(item);
  });
  section.appendChild(list);
  postContent.appendChild(section);
});
