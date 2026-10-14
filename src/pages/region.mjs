import { layout, sect } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  bridgeKin, spotIndex, ruralList, dongNameList, guIndex, nearList, shoutBand,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  degWord, widthWord, eccWord, cutWord, crossWord,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 맞닿음 그래프에서 센 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    step1: s.step1, step2: s.step2, step3: s.step3,
    inDeg: s.inDeg, outDeg: s.outDeg, ecc: s.ecc, cut: s.cut,
    deg1Rank: s.deg1Rank, deg2Rank: s.deg2Rank, deg3Rank: s.deg3Rank,
    guDegRank: s.guDegRank,
    nbrShow: (s.nbrOutNames || []).slice(0, 3).join(', ') || '없습니다',
    guDiameter: g.diameter, guCut: g.cutCount, guAvgDeg: g.avgDeg,
    hubSpot: g.hubSpot, hubDeg: g.hubDeg, edgeSpot: g.edgeSpot, edgeDeg: g.edgeDeg,
    wideSpot: g.wideSpot, wideN: g.wideN,
    allSpots: counts.spot, guSpotCount: g.spotCount,
    degNote: degWord(s.step1), widthNote: widthWord(s.step2),
    eccNote: eccWord(s.ecc), cutNote: cutWord(!!s.cut), crossNote: crossWord(s.area),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 쪽 — 메인 네 시도에서만 낸다 ──────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="open2">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = sect('fact', 'counted', `${esc(s.name)}에서 다리를 세면`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['한 다리', `${s.step1}칸 — ${esc(degWord(s.step1))}`],
      ['두 다리까지', `${s.step2}칸`],
      ['세 다리까지', `${s.step3}칸 — ${esc(widthWord(s.step2))}`],
      ['이웃이 어디에', `${g.name} 안 ${s.inDeg}칸 · 구 밖 ${s.outDeg}칸`],
      ['구에서 가장 먼 칸까지', `${s.ecc}다리`],
      ['길목인가', s.cut ? '그렇습니다 — 이 칸이 빠지면 구가 갈라집니다' : '아닙니다 — 돌아가는 길이 남습니다'],
      ['땅', `${km2(s.area)} — ${esc(crossWord(s.area))}`],
      ['여는 시각', `${esc(cfg.hours)} / 셈 ${esc(cfg.pay)} / 닿기까지 ${esc(cfg.arrive)}`],
    ]),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '07');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    open,
    facts,
    shoutBand(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '02'),
    bridgeKin(sd, g, s, seed, '03'),
    spotIndex(sd, g, seed, s.slug, '04'),
    stepList(seed, '05'),
    guIndex(sd, seed, g.slug, '06'),
    faqHtml,
    noticeBlock(seed, '08'),
    longtail(pool, seed, 24, 'elsewhere', esc(at(h, SEC.crossHead, 8)), null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="big-s">출장마사지 홈타이 · 맞댄 칸 ${s.step1}개 · 두 다리 안에 ${s.step2}칸</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '건너가는 칸', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 쪽에서 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다(강화·가평·양평·연천·기장).
     쪽을 낼 칸이 0이므로 리드·장부·목록을 따로 갈라야 한다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area), diameter: g.diameter, cutCount: g.cutCount, avgDeg: g.avgDeg,
    hubSpot: g.hubSpot || '', hubDeg: g.hubDeg || 0,
    edgeSpot: g.edgeSpot || '', edgeDeg: g.edgeDeg || 0,
    wideSpot: g.wideSpot || '', wideN: g.wideN || 0,
    nearCount: g.nearCount,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="open2">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}칸`],
    mode === 'spot' ? ['쪽을 둔 동', `${g.spotCount}칸`]
      : mode === 'rural' ? ['쪽을 둔 동', '없음 — 행정동이 다 읍·면입니다']
        : ['멈춘 층', '시군구 — 동 이름은 아래 목록에'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}칸 — 이름만 올림(읍 ${g.eupCount}·면 ${g.myeonCount})` : '없음'],
    ['칸끼리 맞댄 수', `평균 ${g.avgDeg}개`],
    ['한쪽 끝에서 반대쪽까지', `${g.diameter}다리`],
    ['길목', g.cutCount ? `${g.cutCount}칸${g.cutNames.length ? ` · ${esc(g.cutNames.slice(0, 4).join(' · '))}` : ''}` : '없음'],
    ['옆 시군구', `${g.nearCount}곳과 한 다리로 붙음`],
    ['땅', km2(g.area)],
    ['여는 시각', `${esc(cfg.hours)} / 셈 ${esc(cfg.pay)}`],
  ];
  if (mode === 'spot' && g.hubSpot) {
    rows.splice(7, 0,
      ['이웃이 가장 많은 칸', `<a href="/${sd.slug}/${g.slug}/${g.hubSpotSlug}/">${esc(g.hubSpot)}</a> ${g.hubDeg}개 · 가장 적은 칸 <a href="/${sd.slug}/${g.slug}/${g.edgeSpotSlug}/">${esc(g.edgeSpot)}</a> ${g.edgeDeg}개`],
      ['두 다리 품이 가장 넓은 칸', `<a href="/${sd.slug}/${g.slug}/${g.wideSpotSlug}/">${esc(g.wideSpot)}</a> ${g.wideN}칸`]);
  }
  const facts = sect('fact', 'counted', `${esc(g.name)} 다리 장부`, factTable(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    open,
    facts,
    shoutBand(cfg, `${sd.name} ${g.name}`, seed),
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    courseGrid(courses, seed, g.name, '04'),
    nearList(sd, g, seed, '05'),
    faqHtml,
    stepList(seed, '07'),
    noticeBlock(seed, '08'),
    guIndex(sd, seed, g.slug, '09'),
    longtail(pool, seed, 20, 'districts', '옆 시군구에서 받는 자리', null, '10'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="big-s">출장마사지 홈타이 · ${mode === 'spot' ? `동 ${g.spotCount}칸에 쪽을 두었습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}칸 모두 건너갑니다` : `행정동 ${g.dongCount}칸 모두 건너갑니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '건너가는 칸', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    avgDeg: sd.avgDeg,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="open2"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = sect('fact', 'counted', `${esc(sd.name)} 다리 장부`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 둔 층', sd.main ? '시군구 밑에 동까지' : '시군구에서 멈춤'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}칸`],
      sd.main ? ['쪽을 둔 동', `${sd.spotCount}칸`] : ['동 이름', '시군구 쪽 목록 안에'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}칸 — 시군구 쪽에 이름만` : '없음'],
      sd.main ? ['한 다리 평균', `${sd.avgDeg}칸`] : ['받는 땅', km2(sd.area)],
      ['길목 합', sd.cutSum ? `${sd.cutSum}칸` : '없음'],
      ['시군구 지름 최대', `${sd.maxDiameter}다리`],
      sd.main && sd.hubSpot ? ['이웃이 가장 많은 동', `${esc(sd.hubSpot)} ${sd.hubDeg}칸`] : ['여는 시각', `${esc(cfg.hours)} / 셈 ${esc(cfg.pay)}`],
      sd.main && sd.wideSpot ? ['두 다리 품이 가장 넓은 동', `${esc(sd.wideSpot)} ${sd.wideN}칸`] : ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '06');

  const csLinks = sect('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<ul class="links">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스에 따라 손이 길게 머무는 자리가 갈립니다. 값표는 ${esc(sd.name)} 전역이 하나입니다.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.step2 - a.s.step2 || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = sect('wide', 'reach', `${esc(sd.name)}에서 두 다리 품이 가장 넓은 동`,
      `<ul class="links">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${x.s.step2}칸</a></li>`).join('\n')}\n</ul>`,
      `두 다리 안에 많은 칸이 붙어 있는 자리입니다. 어느 방향에서든 관리사가 건너올 수 있습니다. 나머지 칸은 시군구를 거쳐 들어가십시오.`, '03');
  } else {
    pickBlock = sect('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="links">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}칸</a></li>`).join('\n')}\n</ul>`,
      '행정동이 많으면 같은 땅을 더 잘게 갈라 이름 붙인 것입니다.', '03');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    open,
    facts,
    shoutBand(cfg, sd.name, seed),
    guIndex(sd, seed, null, '02'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, '05'),
    faqHtml,
    stepList(seed, '07'),
    longtail(pool, seed, 20, 'provinces', '다른 시도에서 받는 자리', null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="big-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} · ${sd.cutSum ? `길목 ${sd.cutSum}칸` : '길목 없음'}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '건너가는 칸', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
