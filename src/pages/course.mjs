import { layout, sect } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factTable, faqBlock, stepList, noticeBlock, longtail, shoutBand, courseGrid } from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않는다. 1,232 × 7 이면 팔천 쪽이 넘는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 쪽이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름을 씁니다. 마치고 씻을 수 있는 시각인지만 한번 보시고 고르십시오.',
  false: '기름이 없습니다. 옷 그대로 받고 끝나면 곧장 나가셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 하면서 맞춥니다. 십 분이면 어느 선이 맞는지 양쪽이 압니다.',
  '표의 등급은 시작점일 뿐입니다. 아프면 참지 말고 바로 짚어 주십시오.',
  '같은 힘도 사람마다 달리 받아들입니다. 적힌 글자보다 그날 몸이 먼저입니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 고르시는 분은 대개 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 맞춰 둔 코스입니다. 사정이 다르면 통화 중에 갈아 드립니다.`,
  (c) => `${c.for} 이쪽이 맞습니다. 정하고서 바꾸셔도 되고 셈은 끝에 받은 코스 기준입니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="open2">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = sect('fact', 'course', `${esc(c.ko)} 한 장으로`,
    factTable([
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — 지역을 가리지 않음`],
      ['세기', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['준비물', c.oil ? '수건 두 장에 누울 자리' : '누울 자리 하나 — 수건은 한 장이면 됩니다'],
      ['여는 시각', `${esc(cfg.hours)} / 셈 ${esc(cfg.pay)} / 닿기까지 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = sect('cmp', 'compare', '나머지와 같이 놓고 보면',
    `<table class="grid2"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="on"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '길게 받는 것과 세게 받는 것은 다릅니다. 두 칸을 따로 보십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '04');

  const pool = [];
  for (const r of regions) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  for (const r of regions) {
    if (!r.main) continue;
    for (const g of r.gu) pool.push({ label: `${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    open,
    facts,
    shoutBand(cfg, c.ko, seed),
    compare,
    stepList(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    longtail(pool, seed, 22, 'regions', `${c.ko}${josa(c.ko, '을/를')} 지역에서 찾기`, '시도를 짚으면 그쪽 화면이 열립니다.', '06'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="big-s">${c.min}분 ${won(c.price)}원 · 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const openLines = [
    `${c.ko} 값은 ${sd.name} 어디서나 하나입니다 — ${c.min}분 ${won(c.price)}원. 가깝다고 깎거나 멀다고 올리지 않습니다.`,
    `${sd.name}의 어느 칸에서 부르셔도 ${c.ko}에 들어가는 내용이 같습니다. 바뀌는 것은 건너오는 시간뿐입니다.`,
    `${sd.name}에서 들어오는 ${c.ko} 문의도 한 번호로 받습니다. ${c.min}분 ${won(c.price)}원입니다.`,
  ];
  const second = sd.main
    ? `${sd.name}에는 동 ${sd.spotCount}칸이 각자 쪽을 가집니다. 사시는 칸을 누르면 거기서 몇 다리 건너 몇 칸이 붙는지가 나오는데, 누가 올 수 있는 자리인지를 가늠하실 때 쓰시면 됩니다.`
    : `${sd.name}${josa(sd.name, '은/는')} 시군구 ${sd.gu.length}곳에서 층을 멈췄습니다. 동 이름은 그 목록에 있으니 전화로 그대로 주시면 됩니다.`;

  const open = `<div class="open2">
  <p>${esc(at(h, openLines, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = sect('fact', 'course', `${esc(sd.name)} ${esc(c.ko)} 한 장으로`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['쪽을 둔 층', sd.main ? `시군구 ${sd.gu.length}곳 아래 동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`],
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — ${esc(sd.name)} 전역 하나`],
      ['세기와 결', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['길목 합', sd.cutSum ? `${sd.cutSum}칸 — 길이 한 줄로 몰리는 자리입니다` : '없음 — 어디로든 돌아갈 길이 있습니다'],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '03');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 쪽을 함께 걸어 얇은 쪽이 생기지 않게 한다. */
  const pool = [];
  for (const g of sd.gu) pool.push({ label: `${g.name} ${c.ko}`, href: `/${sd.slug}/${g.slug}/` });
  for (const x of courses) {
    if (x.slug === c.slug) continue;
    pool.push({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` });
  }
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  }

  const body = [
    open,
    facts,
    shoutBand(cfg, `${sd.name} ${c.ko}`, seed),
    courseGrid(courses, seed, sd.name, '02'),
    faqHtml,
    stepList(seed, '04'),
    longtail(pool, seed, 20, 'nearby', `${sd.name} 안에서 더 보기`, null, '05'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="big-s">출장마사지 홈타이 · ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '건너가는 칸', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}
