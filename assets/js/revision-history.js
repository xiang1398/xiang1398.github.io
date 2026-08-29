document.addEventListener('DOMContentLoaded', () => {
  const commonBibliographyRevision = '2026-08-29: 독일어·프랑스어·러시아어 등 비영어권 외국어 문헌에 한국어 번역 제목을 대괄호로 추가하고, 원제와 번역문의 서식을 정비. 글 말미의 원저자 서명을 이탤릭으로 통일.';
  const histories = [
    { match: ['early-chinese-texts-preface', 'Early Chinese Texts》 서문'], entries: ['2026-08-29: 번역 용어와 문헌학적 표현을 시리즈 공통 기준에 맞추어 교정.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-appendix-i-bibliography-abbreviations', 'Appendix I'], entries: ['2026-08-29: 번역 용어, 서지 약호 및 서지 인용 형식을 시리즈 공통 기준에 맞추어 교정.'] },
    { match: ["early-chinese-texts-Chan-kuo-ts'e", "Chan-kuo ts'e", '戰國策'], entries: ['2026-08-29: 번역 용어와 표기를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-Ch’ien-fu-lun', 'early-chinese-texts-Ch-ien-fu-lun', 'Ch’ien-fu lun', '潛夫論'], entries: ['2026-08-29: 번역 용어와 표기를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-Chiu-chang-suan-shu', 'Chiu chang suan shu', '九章算術'], entries: ['2026-08-29: 번역 용어와 오탈자를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-Chou-li', 'Chou li', '周禮'], entries: ['2026-08-29: 번역 용어와 오탈자를 교정하고, 1차 문헌·현대 연구서·논문·색인의 서지 인용 형식을 시리즈 전체 기준에 맞추어 통일.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-Chou-pi-suan-ching', 'Chou pi suan ching', '周髀算經'], entries: ['2026-08-29: 원문 대조를 거쳐 번역 누락을 점검하고, 번역 용어·정사 인용·현대 서지 형식을 시리즈 공통 기준에 맞추어 통일.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-Chu-shu-chi-nien', 'Chu shu chi nien', '竹書紀年'], entries: ['2026-08-29: 원문 대조를 거쳐 번역 누락을 점검하고, 번역 용어·정사 인용·현대 서지 형식을 시리즈 공통 기준에 맞추어 통일.', commonBibliographyRevision] },
    { match: ['early-chinese-texts-Ch’u-tz’u', 'Ch’u tz’u', '楚辭'], entries: [commonBibliographyRevision] },
    { match: ['early-chinese-texts-Chuang-tzu', 'Chuang tzu', '莊子'], entries: [commonBibliographyRevision] },
    { match: ['early-chinese-texts-Ch’un-ch’iu', 'Ch’un ch’iu', '春秋·公羊傳·穀梁傳·左傳'], entries: [commonBibliographyRevision] },
    { match: ['early-chinese-texts-Ch’un-ch’iu-fan-lu', 'Ch’un ch’iu fan lu', '春秋繁露'], entries: [commonBibliographyRevision] },
    { match: ['early-chinese-texts-Chung-lun', 'Chung lun', '中論'], entries: [commonBibliographyRevision] }
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
