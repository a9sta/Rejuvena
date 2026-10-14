import { layout, sect, ringBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, shoutBand, siteLinks,
} from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="front2" aria-label="첫 안내">
  <p class="front2-sl">${esc(cfg.brand.slogan)}</p>
  <p class="front2-p">찾아오실 가게가 없습니다. 걸어 주시면 관리사가 가까운 칸에서 건너옵니다. 수도권과 부산은 동마다 쪽을 두었고, 대전·대구·울산과 지정한 시·군은 시군구에서 층을 멈췄습니다.</p>
  ${ringBtn(cfg, { size: 'l' })}
  <dl class="front2-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>밤에도 한 번호</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>셈은 끝에 한 번</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>이 사이에 닿습니다</dd></div>
    <div><dt>동 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}곳 밑에</dd></div>
  </dl>
</section>`;

  const areaBlock = sect('area', 'where', '어느 칸에서 부르시나요',
    `<div class="halves">
      <div>
        <p class="halves-h">동 한 칸까지</p>
        <ul>${main.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>${r.gu.length}곳 · ${r.spotCount}칸</span></a></li>`).join('\n')}</ul>
      </div>
      <div>
        <p class="halves-h">시군구에서 멈춤</p>
        <ul>${sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length}</span></a></li>`).join('\n')}</ul>
      </div>
    </div>
    <p class="sect-x">층이 달라도 받는 번호와 값표는 하나입니다. <a href="/area/">건너가는 칸을 한 장에</a> 펼쳐 두었습니다.</p>`,
    '층이 둘인 것은 적어 둔 깊이가 다른 것입니다. 건너가는 지역을 줄인 것이 아닙니다.', '01');

  const whyBlock = sect('why', 'method', '왜 다리 수를 세어 두나요?',
    `<div class="open2">
      <p>동 쪽을 열면 그 자리가 <strong>몇 칸과 경계를 맞대고 있는지</strong>가 적혀 있습니다. 가장 많이 맞댄 칸은 ${esc(counts.hubName)}이고, 두 다리만 건너도 ${counts.deg2Max}칸이 품에 드는 칸은 ${esc(counts.wideName)}입니다. 쪽을 둔 ${counts.spot}칸의 한가운데 값은 ${counts.deg1Mid}개입니다.</p>
      <p>관리사는 하늘에서 떨어지지 않습니다. 접수가 들어오면 그 시각 <strong>가까운 칸에 누가 있는지</strong>를 보고 보냅니다. 그래서 몇 다리 안에 몇 칸이 붙어 있는지가 도착 시각을 가릅니다. 길목에 놓인 ${counts.cutSum}칸은 들어오는 길이 한 줄로 몰려 더 신경 써서 확인합니다.</p>
      <p>전국 행정동 ${counts.featAll}곳을 ${counts.edgeAll}개 다리로 이어 센 값이고, 같은 방식으로 다시 세면 같은 숫자가 나옵니다. 세는 방법은 <a href="/magazine/counting-bridges/">갈무리에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = sect('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="cards">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="sect-x"><a href="/magazine/">갈무리 전부 보기</a></p>`,
    '체험담이 아닙니다. 읽어 두시면 통화가 줄어드는 것만 모았습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 칸'), 6, '06');

  const pool = [];
  for (const r of regions) {
    if (r.main) for (const g of r.gu) for (const s of g.spots) pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
    else for (const g of r.gu) pool.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '부르시는 칸', '03'),
    stepList(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 30, 'popular', '연락이 잦은 칸', null, '08'),
    shoutBand(cfg, '지금 계신 칸', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="big-s">서울·인천·경기·부산 동 ${counts.spot}칸 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="open2">
  <p>쪽을 둔 칸을 한 화면에 모았습니다. 시군구 ${counts.gu}곳에 동 ${counts.spot}칸입니다. 읍·면 ${counts.rural}칸은 쪽만 없고 받는 것도 건너가는 것도 같습니다.</p>
  <p>수도권과 부산에서는 동을 하나씩 눌러 보실 수 있고, 그 밖은 시군구 쪽 안에 동 이름을 적어 두었습니다. 깊이를 가른 것은 문의가 몰리는 쪽만 더 잘게 나눈 것입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => sect(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}칸` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="board">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="w-n">${esc(g.name)}</span><span class="w-s">${g.plainCount ? `동 ${g.plainCount}${g.ruralCount ? `+${g.ruralCount}` : ''}` : `읍면 ${g.ruralCount}`}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}의 시군구를 누르면 그 아래 동이 펼쳐집니다. 이 지역은 칸마다 평균 ${r.avgDeg}개씩 맞대고 있습니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구가 마지막입니다. 행정동 ${r.dongCount}칸 이름은 각 시군구 쪽에 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 칸'), 4, '90');

  const body = [open, shoutBand(cfg, '사시는 칸', seed), blocks, faqHtml, stepList(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `건너가는 칸 <span class="big-s">시군구 ${counts.gu}곳과 동 ${counts.spot}칸을 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '건너가는 칸', url: `${siteUrl}/area/` }],
      jsonld: [
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/area/`, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="open2">
  <p>일곱 가지입니다. 정하실 것은 셋뿐입니다 — 세기, 길이, 기름. 남은 것은 통화에서 맞춥니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분이고 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 오래 받는 것이 세게 받는 것은 아니고, 비싼 것이 더 나은 것도 아닙니다.</p>
</div>`;

  const table = sect('all', 'table', '일곱 가지를 한자리에',
    `<table class="grid2"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '값이 낮은 것부터 세웠습니다. 어느 칸에서 부르셔도 같은 표를 씁니다.', '01');

  const pickBy = sect('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="cards">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '고른 뒤에 바꾸셔도 됩니다. 셈은 마지막 코스를 기준으로 합니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 칸'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [open, table, pickBy, shoutBand(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한자리에 모았습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="big-s">세기 · 길이 · 기름 여부로 갈라 보기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 값표 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="open2">
  <p>표 하나로 끝입니다. 여기 없는 돈은 어떤 이름으로도 청구하지 않습니다.</p>
  <p>바로 옆 블록이든 한 시간을 달리는 읍내든 같은 코스면 같은 값입니다. 먼 길을 건너는 부담은 저희가 집니다.</p>
</div>`;

  const table = sect('tbl', 'prices', '코스별 기본 길이와 값',
    `<table class="grid2"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">값</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 서로 견주시라고만 붙였습니다. 분으로 쪼개 받는 일이 없습니다.', '01');

  const noExtra = sect('nox', 'never', '붙지 않는 것',
    `<ul class="note2">
      <li>차비 — 몇 다리를 건너도 셈에 넣지 않습니다.</li>
      <li>심야 할증 — 깊은 밤에 부르셔도 표 그대로입니다.</li>
      <li>명절·휴일 할증 — 날짜를 보고 값을 올리는 일이 없습니다.</li>
      <li>먼저 보내는 돈 — 예약금도 보증금도 없습니다.</li>
      <li>취소 수수료 — 날짜를 바꾸거나 접어도 비용이 없습니다.</li>
      <li>주차비 — 저희가 냅니다.</li>
    </ul>`,
    '입금을 먼저 요구하면 저희 쪽이 아닙니다.', '02');

  const pay = sect('how', 'payment', '값은 어떻게 내나요?',
    factTable([
      ['내는 때', '마치고 그 자리에서'],
      ['수단', '현금과 카드 — 값이 같습니다'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받을 때', '접수 때 정하면 늘어난 만큼만 붙습니다'],
      ['두 분이 받을 때', '사람 수대로 셉니다. 묶어 깎지 않습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 칸'), 4, '04');

  const body = [open, table, noExtra, pay, shoutBand(cfg, '값 확인', seed), faqHtml, siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`값표 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 값입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 마친 뒤 현금이나 카드로 받습니다.`),
      h1: `값표 <span class="big-s">${won(sorted[0].price)}원부터 · 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '값표', url: `${siteUrl}/price/` }],
      jsonld: [S.faqPage(`${siteUrl}/price/`, qa)],
    }),
  };
}

/* ── 처음 보시면 ──────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="open2">
  <p>처음 부르시는 분을 두고 적었습니다. 전화 한 통에서 끝나는 일이니 길게 읽으실 것이 없습니다.</p>
</div>`;

  const what = sect('need', 'ready', '무엇을 두고 기다리면 되나요?',
    `<ul class="note2">
      <li>누울 자리 — 바닥도 침대도 됩니다.</li>
      <li>수건 두 장 — 쓰시던 것이면 되고 기름 없는 코스는 한 장입니다.</li>
      <li>문 닫히는 방 — 다른 식구가 있어도 괜찮습니다.</li>
    </ul>
    <p class="sect-x">깔개와 기름, 접이식 베드는 관리사가 가방에 넣어 옵니다. 장을 보실 것이 없습니다.</p>`,
    null, '01');

  const timing = sect('when', 'hours', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 시각을 가리지 않습니다`],
      ['도착', `보통 ${esc(cfg.arrive)}, 길목이 막히면 더 걸립니다`],
      ['시간 옮기기', '언제든 되고 돈이 붙지 않습니다'],
      ['취소', '관리사가 문 앞이면 그것만 알려 주십시오'],
      ['몰리는 때', '금요일과 토요일 밤'],
      ['빈 때', '주중 낮 — 거의 바로 건너갑니다'],
    ]), null, '02');

  const refuse = sect('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="note2">
      <li>성적인 말이 섞일 때 — 그 자리에서 통화를 끊습니다.</li>
      <li>열이 나거나 상처가 부었을 때 — 다른 날로 미뤄 드립니다.</li>
      <li>주소 끝자리를 주지 않으실 때 — 보낼 사람과 길을 정할 수 없습니다.</li>
      <li>관리사 개인 번호를 달라 하실 때.</li>
      <li>진료가 먼저로 보일 때 — 병원을 권합니다.</li>
      <li>만 열아홉 살이 안 되셨을 때.</li>
    </ul>`,
    '못 받는 경우에 돈이 들지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 칸'), 6, '05');

  const body = [open, what, timing, stepList(seed, '04'), refuse, shoutBand(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('처음 보시면 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 시각, 못 받는 경우, 값 내는 법을 차례로 적었습니다.'),
      h1: `처음 보시면 <span class="big-s">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '처음 보시면', url: `${siteUrl}/guide/` }],
      jsonld: [S.faqPage(`${siteUrl}/guide/`, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const open = `<div class="open2">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 없이 방문만 하는 곳입니다. 업소를 늘어놓고 연결해 주는 중개가 아니라 저희가 받고 저희가 건너갑니다.</p>
  <p>이름은 되살림(rejuvenate)에서 떼어 왔습니다. 몸을 원래 쓰던 상태로 돌려놓는 일만 한다는 뜻입니다.</p>
</div>`;

  const line = sect('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="note2">
      <li>합니다 — 손으로 뭉친 근육을 풀어내는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 꼴로도 두지 않습니다.</li>
      <li>안 합니다 — 진단과 치료. 의료기관이 할 일입니다.</li>
      <li>안 받습니다 — 만 열아홉 살이 되지 않은 분.</li>
      <li>안 싣습니다 — 후기와 별점. 꾸민 것을 걸러 낼 수 없습니다.</li>
      <li>안 올립니다 — 인물 사진. 사진과 실제가 다른 일이 흔합니다.</li>
      <li>안 받습니다 — 선입금. 먼저 받는 돈이 없습니다.</li>
    </ul>`, null, '01');

  const how = sect('data', 'sources', '이 다리 수는 어떻게 센 건가요?',
    `<div class="open2">
      <p>공개된 행정동 경계를 전국 ${counts.featAll}곳 모두 읽어, 경계 꼭짓점을 <strong>둘 이상 나눠 가진 쌍</strong>을 한 다리로 이었습니다. 꼭짓점 하나만 스친 쌍은 모서리만 닿은 것이라 다리로 세지 않았습니다. 그렇게 ${counts.edgeAll}개 다리가 생겼습니다.</p>
      <p>그 그래프를 한 칸씩 건너가며 층을 쌓습니다. 한 다리는 ${counts.deg1Min}개부터 ${counts.deg1Max}개까지 벌어지고 한가운데는 ${counts.deg1Mid}개입니다. 두 다리까지 넓히면 한가운데가 ${counts.deg2Mid}개가 되고, 가장 넓은 ${esc(counts.wideName)}${josa(counts.wideName, '은/는')} ${counts.deg2Max}칸에 닿습니다.</p>
      <p>시군구 안쪽만 떼어 내면 지름과 길목이 나옵니다. 지름은 그 구에서 가장 멀리 떨어진 두 칸 사이의 다리 수이고, 길목은 그 칸을 빼면 구가 둘로 갈라지는 자리입니다. 전국에 ${counts.cutSum}칸이 길목입니다.</p>
      <p>다리 수는 경계로 센 값이고 도로가 이어졌는지는 보지 않습니다. 강이나 철길로 막혀 실제로는 돌아가야 하는 쌍도 한 다리로 잡힙니다. 그 점을 알고 쓰셔야 합니다.</p>
    </div>
    ${factTable([
      ['자료를 가져온 곳', esc(data.source)],
      ['원자료 버전', esc(data.version)],
      ['세는 값', esc(data.axis)],
      ['세는 방법', esc(data.method)],
      ['쪽을 두는 기준', esc(data.coverageFrom)],
      ['쪽을 둔 단위', `시도 ${counts.sido} / 시군구 ${counts.gu} / 동 ${counts.spot}`],
      ['쪽이 없는 단위', `읍 ${counts.eup}칸 · 면 ${counts.myeon}칸 — 목록에 이름만 올림`],
      ['이웃을 가장 많이 맞댄 칸', `${esc(counts.hubName)} ${counts.deg1Max}개`],
      ['두 다리 품이 가장 넓은 칸', `${esc(counts.wideName)} ${counts.deg2Max}칸`],
      ['시군구 지름 최대', `${counts.maxDiameter}다리`],
    ])}`, null, '02');

  const body = [open, line, how, shoutBand(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽의 다리 수를 어떤 자료로 어떻게 세었는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="big-s">지키는 선과 세는 방법</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (무엇을 정하는가)', '이 약관은 리쥬베나(이하 "회사")가 제공하는 출장 방문 관리의 이용 조건과 절차, 회사와 이용자가 서로 지는 권리와 의무를 정합니다.'],
  ['제2조 (접수하는 입구)', '접수는 사이트에 적힌 번호로 걸어 주시는 통화로만 받습니다. 이 번호는 중계 번호이므로 이용자의 번호가 관리사에게 그대로 넘어가지 않습니다. 메신저와 게시판, 전자우편으로 들어오는 접수는 받지 않습니다.'],
  ['제3조 (제공하는 범위)', '회사는 이용자가 정한 장소로 관리사를 보내 손으로 근육의 긴장을 풀어내는 일을 합니다. 질병을 진단하거나 치료하지 않고 성적인 서비스도 하지 않습니다.'],
  ['제4조 (이용할 수 있는 나이)', '만 19세가 넘은 분만 이용하실 수 있습니다. 그에 못 미치는 분의 접수는 어떤 경우에도 받지 않습니다.'],
  ['제5조 (다리 수 정보의 성격)', '사이트에 적힌 한 다리·두 다리 칸 수, 시군구 지름, 길목은 공개된 행정동 경계를 이어 만든 그래프에서 센 값입니다. 도로가 실제로 이어졌는지는 보지 않으며 이동 시간을 보장하지 않습니다. 누가 건너올 수 있는 자리인지 가늠하는 참고 자료입니다.'],
  ['제6조 (값과 결제)', '값은 값표와 같고 지역에 따라 달라지지 않습니다. 셈은 관리가 끝난 현장에서 현금이나 카드로 합니다. 예약금과 보증금처럼 먼저 받는 돈은 어떤 이름으로도 두지 않습니다.'],
  ['제7조 (옮기기와 접기)', '방문 전에는 언제든 시간을 옮기거나 접으실 수 있고 위약금이 없습니다. 관리사가 이미 문 앞에 닿은 뒤라면 그 사실만 바로 알려 주시면 됩니다.'],
  ['제8조 (받지 않거나 멈추는 경우)', '다음 어느 하나에 해당하면 회사는 접수를 받지 않거나 하던 관리를 멈출 수 있습니다. 1. 성적인 서비스를 요구하는 때. 2. 관리사에게 폭언이나 물리력을 쓰거나 개인 연락처를 요구하는 때. 3. 방문할 주소를 끝까지 주지 않는 때. 4. 열이 있거나 열린 상처가 있어 관리가 알맞지 않은 때.'],
  ['제9조 (이용자가 갖춰 둘 것)', '이용자께서는 관리를 받을 자리와 수건을 갖춰 두시고, 진행에 영향을 줄 수 있는 몸 상태를 접수 통화에서 알려 주셔야 합니다.'],
  ['제10조 (후기와 별점을 두지 않음)', '회사는 후기와 별점을 모으지 않고 화면에 싣지도 않습니다. 이 사이트의 어느 문장도 특정 이용자의 경험을 옮겨 적은 것이 아닙니다.'],
  ['제11조 (멈춘 뒤의 값)', '이용자의 요청이나 몸 상태로 멈춘 때에는 지나간 시간만큼만 셉니다. 시작하고 10분이 안 되었으면 받지 않습니다. 제8조 제1호로 멈춘 때에는 멈춘 시점까지 셉니다.'],
  ['제12조 (손해를 누가 지는가)', '관리하는 동안 회사의 잘못으로 생긴 손해는 회사가 물어 드립니다. 미리 알려 주지 않은 몸 상태에서 비롯한 손해, 천재지변이나 통신 장애로 늦어진 일에는 책임을 지지 않습니다.'],
  ['제13조 (약관을 고칠 때)', '약관을 고치면 사이트에 먼저 올리고 올린 날부터 적용합니다. 고친 뒤에 접수하시면 바뀐 내용에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="open2"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 걸어 주신 시점에 이 내용에 동의하신 것으로 봅니다.</p></div>`,
    sect('terms', 'terms', '전문', `<div class="law">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    shoutBand(cfg, '약관 문의', 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 입구와 제공 범위, 값과 결제, 옮기기와 접기를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="big-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 적는 항목', '접수 통화에서 적는 것은 네 가지입니다 — 건너갈 주소, 연락 가능한 번호, 고르신 코스, 원하시는 시각. 성함과 생년월일, 주민등록번호를 받아 두지 않습니다.'],
  ['2. 쓰는 데', '적은 내용은 관리사를 정하고 출발과 도착을 알리는 데에만 씁니다. 그 뒤에 광고 문자를 보내거나 먼저 연락드리지 않습니다.'],
  ['3. 번호를 다루는 방식', '화면에 적힌 번호는 중계용입니다. 그래서 이용자 번호가 관리사에게 그대로 넘어가지 않습니다.'],
  ['4. 두는 기간', '방문이 탈 없이 끝나면 그날 지웁니다. 다툼이 생긴 건만 마무리될 때까지 따로 둡니다.'],
  ['5. 넘기거나 맡기는가', '바깥 사업자에게 넘기거나 맡기지 않습니다. 법령에 근거한 수사기관의 적법한 요청에만 예외를 둡니다.'],
  ['6. 자동으로 모으는 장치', '이 사이트는 미리 찍어 둔 파일만 내보냅니다. 로그인과 장바구니, 댓글이 없고 광고 추적이나 방문자 분석 스크립트를 넣지 않았습니다. 쿠키도 쓰지 않습니다.'],
  ['7. 이용자의 권리', '두고 있는 내용을 보여 달라거나 지워 달라고 하실 수 있습니다. 같은 번호로 걸어 주시면 그 통화에서 처리합니다.'],
  ['8. 개인정보 담당', '사업자 정보가 정해지면 이 항목과 화면 맨 아래에 함께 올립니다. 그때까지는 사이트에 적힌 번호가 창구 노릇을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="open2"><p>내용이 짧습니다. 적는 항목 자체가 네 가지뿐입니다.</p></div>`,
    sect('pp', 'privacy', '전문', `<div class="law">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    shoutBand(cfg, '개인정보 문의', 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 적는 항목과 쓰는 데, 두는 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="big-s">받아 두는 항목이 네 가지입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 갈무리 목록 ──────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="open2"><p>부르기 전에 알아 두면 통화가 짧아지는 것만 갈무리합니다. 소감이나 별점은 올리지 않습니다.</p></div>`,
    sect('list', 'notes', `갈무리한 글 ${list.length}편`,
      `<ul class="cards">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS 로도 나갑니다.', '01'),
    shoutBand(cfg, '접수', 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('다리 수 갈무리'),
      desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 갈무리했습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `다리 수 갈무리 <span class="big-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '갈무리', url: `${siteUrl}/magazine/` }],
      jsonld: [S.itemList(`${siteUrl}/magazine/#list`, '다리 수 갈무리', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="day"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 다리 수 갈무리</p>`,
    `<article class="read">${html}</article>`,
    shoutBand(cfg, '접수', p.slug),
    sect('more', 'next', '함께 읽을 글',
      `<ul class="cards">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '갈무리', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="open2"><p>그 주소에 쪽이 없습니다. 자리를 옮겼거나 아예 만들지 않은 주소입니다. 아래에서 다시 짚어 주십시오.</p></div>`,
    sect('back', 'back', '여기서 다시',
      `<ul class="links">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">건너가는 칸</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">값표</a></li>
        <li><a href="/guide/">처음 보시면</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    shoutBand(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 쪽이 없습니다. 아래에서 다시 짚어 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
