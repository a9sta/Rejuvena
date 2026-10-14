import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { sect, ringBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function shoutBand(cfg, place, seedKey) {
  const h = hash(seedKey, 'sh');
  const lines = [
    `${place}이라고만 주셔도 됩니다. 남은 주소는 저희가 되읽으며 맞춥니다.`,
    `${place}까지 지금 건너갈 수 있는지 통화 중에 바로 봐 드립니다.`,
    `${place}에 가는 데 쓰는 것은 코스와 시각, 주소 셋입니다.`,
    `${place} 접수는 이 번호로만 들어옵니다. 다른 입구를 내지 않았습니다.`,
  ];
  return `<section class="shout" aria-label="${esc(place)} 예약 문의">
  <p class="shout-p">${esc(at(h, lines))}</p>
  ${ringBtn(cfg, { size: 'l' })}
  <p class="shout-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 설명을 전부 달면 어느 쪽이든 같은 문장이 깔린다. 둘만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 2));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="d-n">${esc(c.ko)}</span>
      <span class="d-w">${won(c.price)}원</span>
      <span class="d-s">${c.min}분 / 세기 ${esc(c.pressure)}${c.oil ? ' / 기름 씁니다' : ' / 기름 안 씁니다'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="d-t">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  return sect('course', 'courses', `${esc(place)}까지 들고 가는 일곱 가지`,
    `<ul class="dishes">\n${list}\n</ul>
     <p class="sect-x">${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return sect('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="walk">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="rows"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = sect('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="ask2">\n${qa.map((x, i) => `<div><span class="no" aria-hidden="true">물음 ${i + 1}</span><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return sect('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="note2">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return sect('longtail', label, heading, `<ul class="links">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 한 다리로 이어진 칸 ───────────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리순이 아니라
     **실제로 경계를 맞댄 칸**을 그대로 건다. 그 뒤를 이웃 수로 채운다. */
export function bridgeKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const pick = [];
  const seen = new Set();
  const add = (x, why) => { if (x && !seen.has(x.slug)) { seen.add(x.slug); pick.push({ x, why }); } };
  const bySlug = new Map(g.spots.map((x) => [x.slug, x]));
  for (const nb of (s.nbrIn || [])) {
    const x = bySlug.get(nb.slug);
    if (x) add(x, `한 다리 · 이웃 ${x.step1}`);
  }
  const byDeg = pool.slice().sort((a, b) => b.step1 - a.step1);
  add(byDeg[0], `이웃 ${byDeg[0].step1}칸`);
  add(byDeg[byDeg.length - 1], `이웃 ${byDeg[byDeg.length - 1].step1}칸`);
  for (const x of pool) add(x, `두 다리 ${x.step2}칸`);
  return sect('kin', 'bridges', `${esc(g.name)} 안에서 ${esc(s.name)}${josa(s.name, '과/와')} 이어진 칸`,
    `<ul class="board">\n${pick.slice(0, 8).map(({ x, why }) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="w-n">${esc(x.name)}</span><span class="w-s">${esc(why)}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'bk'), SEC.bridgeKinSub)), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="on"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="w-n">${esc(s.name)}</span><span class="w-s">이웃 ${s.step1}</span></a></li>`).join('\n');
  return sect('spotidx', 'places', `${esc(g.name)}에서 쪽을 둔 ${g.spotCount}칸`,
    `<ul class="board">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 쪽을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return sect('rural', 'rural', `${esc(g.name)} 안의 ${esc(label)}칸`,
    `<ul class="flatlist">\n${g.rural.map((m) => `<li>${esc(m.name)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return sect('dongidx', 'dong', `${esc(g.name)} 안의 동 ${g.dongNames.length}칸`,
    `<ul class="flatlist">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="on"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="w-n">${esc(g.name)}</span><span class="w-s">${g.plainCount ? `동 ${g.plainCount}${g.ruralCount ? `+${g.ruralCount}` : ''}` : `읍면 ${g.ruralCount}`}</span></a></li>`).join('\n');
  return sect('guidx', 'districts', `${esc(sd.name)} 아래 시군구 ${sd.gu.length}곳`,
    `<ul class="board">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 옆 시군구 (길을 거는 용도) ──────────────────────────────── */
export function nearList(sd, g, seedKey, num) {
  if (!g.nearCount) return '';
  const items = g.near.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="w-n">${esc(t.gu)}</span><span class="w-s">${t.same ? esc(sd.name) : '시도 밖'}</span></a></li>`).join('\n');
  return sect('near', 'next', `${esc(g.name)}${josa(g.name, '과/와')} 한 다리로 붙은 시군구 ${g.nearCount}곳`,
    `<ul class="board">\n${items}\n</ul>`,
    '구 경계에 바짝 붙은 주소면 옆 시군구에서 건너오는 편이 빠를 때가 있습니다.', num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return sect('also', 'more', '이어서 볼 곳',
    `<ul class="links">
      <li><a href="/area/">건너가는 칸 전부</a></li>
      <li><a href="/guide/">처음 보시면</a></li>
      <li><a href="/price/">값표</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">갈무리</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도에서 시군구로 내려가고 수도권과 부산에만 동이 한 겹 더 붙습니다. 읍·면과 그 밖 지역의 동은 이름만 목록에 있습니다.');
}
