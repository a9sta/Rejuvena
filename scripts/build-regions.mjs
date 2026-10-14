/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **다리 수**다. 거리를 재지 않고 이웃을 세어 건너간다.
 *   경계를 맞댄 칸을 '한 다리'로 보고 거기서 또 한 칸을 건너가며 층을 쌓는다.
 *     한 다리  : 경계를 맞댄 칸 수
 *     두 다리  : 한 칸을 더 건너 닿는 칸의 누적 수
 *     세 다리  : 거기서 또 한 칸
 *     편심     : 같은 시군구 안에서 가장 먼 칸까지 몇 다리인가
 *     지름     : 그 시군구 안 두 칸 사이의 최대 다리 수
 *     길목     : 이 칸을 빼면 시군구가 둘로 갈라지는가
 *
 *   관리사는 하늘에서 떨어지지 않고 옆 칸에서 넘어온다. 몇 다리 건너에 얼마나
 *   많은 칸이 붙어 있는지가 그 자리로 누가 올 수 있는지를 결정한다. 길목에 놓인
 *   칸은 그 칸을 지나지 않으면 건너갈 수 없어 길이 한 줄로 몰린다.
 *
 *   ★마루온은 '몇 곳과 맞닿았나'를 세어 썼다. 여기서는 그 맞닿음을 **발판으로
 *     삼아 몇 다리까지 건너가지는지**를 센다. 세는 값이 다르고 쓰는 문장도 다르다.
 *   앞선 열한 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·
 *   가로세로·둘레·뭉침 정도·안쪽 깊이·매듭점·시도 바깥선까지의 거리·이름 세기·
 *   해의 자리·테두리의 결을 썼다. 다리를 세어 건너는 축은 여기서 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 — 다리를 세려면 중심점과 넓이는 있어야 한다 ─────── */
const rad = (d) => (d * Math.PI) / 180;
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky };
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 1차: 전국 맞닿음 그래프 ────────────────────────────────
   ★다리를 세는 발판은 **전국 행정동 전부**여야 한다. 커버리지 안쪽만 이으면
     옆 시도로 넘어가는 다리가 끊겨 '두 다리 건너 몇 칸'이 거짓이 된다.
   ★꼭짓점을 하나만 공유한 쌍은 모서리만 스친 것이라 다리로 세지 않는다. */
const vertex = new Map();
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
const meta = new Map();            // code → {name, sggnm, sidonm}
for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  meta.set(code, { name, sggnm: p.sggnm, sidonm: p.sidonm });
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
}
const share = new Map();           // code → Map(code → 공유 꼭짓점 수)
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
      if (!share.has(a)) share.set(a, new Map());
      share.get(a).set(b, (share.get(a).get(b) || 0) + 1);
    }
  }
}
vertex.clear();
const adj = new Map();             // code → [code]
for (const [a, m] of share) adj.set(a, [...m].filter(([, n]) => n >= 2).map(([c]) => c));
share.clear();
const nbr = (c) => adj.get(c) || [];

/** 시작 칸에서 n 다리 안에 닿는 칸 수(자기 제외) */
function reach(code, depth) {
  const seen = new Set([code]);
  let front = [code];
  const out = [];
  for (let d = 1; d <= depth; d++) {
    const next = [];
    for (const c of front) for (const x of nbr(c)) if (!seen.has(x)) { seen.add(x); next.push(x); }
    front = next;
    out.push(seen.size - 1);
  }
  return out;                      // [1다리 누적, 2다리 누적, …]
}

/* ── 2차: 레코드 ───────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const code = String(p.adm_cd2);
  const name = meta.get(code).name;
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
  };
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/** 한 시군구 안쪽 그래프에서 다리 수 재기 */
function guGraph(codes) {
  const inside = new Set(codes);
  const sub = new Map();
  for (const c of codes) sub.set(c, nbr(c).filter((x) => inside.has(x)));
  const bfs = (s) => {
    const dist = new Map([[s, 0]]);
    const q = [s];
    for (let i = 0; i < q.length; i++) {
      for (const x of sub.get(q[i])) if (!dist.has(x)) { dist.set(x, dist.get(q[i]) + 1); q.push(x); }
    }
    return dist;
  };
  const ecc = new Map();
  let diameter = 0;
  for (const c of codes) {
    const d = bfs(c);
    let mx = 0;
    for (const v of d.values()) if (v > mx) mx = v;
    ecc.set(c, mx);
    if (mx > diameter) diameter = mx;
  }
  /* 길목 — 이 칸을 빼면 나머지가 한 덩어리로 남는가 */
  const comps = (skip) => {
    const seen = new Set(skip ? [skip] : []);
    let n = 0;
    for (const c of codes) {
      if (seen.has(c)) continue;
      n += 1; seen.add(c);
      const q = [c];
      for (let i = 0; i < q.length; i++) for (const x of sub.get(q[i])) if (!seen.has(x)) { seen.add(x); q.push(x); }
    }
    return n;
  };
  const base = comps(null);
  const cut = new Set();
  if (codes.length > 2) for (const c of codes) if (comps(c) > base) cut.add(c);
  return { ecc, diameter, cut, inDeg: new Map(codes.map((c) => [c, sub.get(c).length])) };
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const G = guGraph(list.map((d) => d.code));
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
    diameter: G.diameter,
    cutCount: G.cut.size,
    cutNames: [...G.cut].map((c) => meta.get(c).name).sort((a, b) => a.localeCompare(b, 'ko')),
    avgDeg: r1(list.reduce((s, d) => s + (G.inDeg.get(d.code) || 0), 0) / list.length),
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const [n1, n2, n3] = reach(d.code, 3);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        step1: n1, step2: n2, step3: n3,
        inDeg: G.inDeg.get(d.code) || 0,      // 같은 시군구 안 이웃
        outDeg: n1 - (G.inDeg.get(d.code) || 0), // 시군구 밖 이웃
        ecc: G.ecc.get(d.code) || 0,
        cut: G.cut.has(d.code) ? 1 : 0,
        /* 이웃 이름 — 길을 걸 때 쓴다 */
        nbrNames: nbr(d.code).map((c) => meta.get(c).name),
        nbrCodes: nbr(d.code),
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* ── 옆 시군구 ────────────────────────────────────────────── */
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
for (const g of guAll) {
  const set = new Set();
  for (const c of g.codes) for (const n of nbr(c)) {
    const o = codeGu.get(n);
    if (o && o !== g) set.add(o);
  }
  g.near = [...set].map((o) => ({ sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.nearCount = g.near.length;
}

/* ── 같은 시군구 안 이웃 링크 ─────────────────────────────── */
const codeSpot = new Map();
for (const g of guAll) for (const s of g.spots) codeSpot.set(s.code, { g, s });
for (const g of guAll) {
  for (const s of g.spots) {
    s.nbrIn = s.nbrCodes
      .map((c) => codeSpot.get(c))
      .filter((x) => x && x.g === g)
      .map((x) => ({ name: x.s.name, slug: x.s.slug }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete s.nbrCodes;
    s.nbrOutNames = [...new Set(s.nbrNames)].slice(0, 6);
    delete s.nbrNames;
  }
}

/* ── 차례 매기기 ──────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.step1 - a.step1).forEach((s, i) => { s.deg1Rank = i + 1; });
spotAll.slice().sort((a, b) => b.step2 - a.step2).forEach((s, i) => { s.deg2Rank = i + 1; });
spotAll.slice().sort((a, b) => b.step3 - a.step3).forEach((s, i) => { s.deg3Rank = i + 1; });
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byIn = g.spots.slice().sort((a, b) => b.inDeg - a.inDeg || a.name.localeCompare(b.name, 'ko'));
  g.hubSpot = byIn[0].name; g.hubSpotSlug = byIn[0].slug; g.hubDeg = byIn[0].inDeg;
  g.edgeSpot = byIn[byIn.length - 1].name; g.edgeSpotSlug = byIn[byIn.length - 1].slug; g.edgeDeg = byIn[byIn.length - 1].inDeg;
  const byWide = g.spots.slice().sort((a, b) => b.step2 - a.step2);
  g.wideSpot = byWide[0].name; g.wideSpotSlug = byWide[0].slug; g.wideN = byWide[0].step2;
  g.spots.slice().sort((a, b) => b.inDeg - a.inDeg).forEach((s, i) => { s.guDegRank = i + 1; });
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes;
  }
  const hub = allSpots.slice().sort((a, b) => b.step1 - a.step1)[0];
  const wide = allSpots.slice().sort((a, b) => b.step2 - a.step2)[0];
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    avgDeg: allSpots.length ? r1(allSpots.reduce((s, x) => s + x.step1, 0) / allSpots.length) : 0,
    cutSum: gus.reduce((s, g) => s + g.cutCount, 0),
    maxDiameter: Math.max(...gus.map((g) => g.diameter)),
    hubSpot: hub ? hub.name : '', hubDeg: hub ? hub.step1 : 0,
    wideSpot: wide ? wide.name : '', wideN: wide ? wide.step2 : 0,
    gu: gus,
  });
}

const d1 = spotAll.map((s) => s.step1).sort((a, b) => a - b);
const d2 = spotAll.map((s) => s.step2).sort((a, b) => a - b);
const out = {
  version: VERSION,
  source: 'admdongkor 행정동 경계(CC BY 4.0) · 원자료 국가공간정보포털 · 배포 github.com/vuski/admdongkor',
  built: new Date().toISOString().slice(0, 10),
  axis: '다리 수 — 한·두·세 다리 건너 닿는 칸, 시군구 지름, 길목',
  method: '전국 행정동 경계를 모두 읽어 꼭짓점을 둘 이상 공유한 쌍을 한 다리로 이었다. 꼭짓점 하나만 스친 쌍은 다리로 세지 않는다. 그 그래프를 한 칸씩 건너가며 층을 쌓고, 시군구 안쪽만 떼어 지름과 길목을 구했다.',
  coverageFrom: '서울·인천·경기·부산은 동 한 칸씩 쪽을 가지고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구에서 멈춘다. 읍과 면은 쪽 없이 시군구 쪽 목록에 이름으로만 오른다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    deg1Min: d1[0], deg1Mid: d1[d1.length >> 1], deg1Max: d1[d1.length - 1],
    deg2Mid: d2[d2.length >> 1], deg2Max: d2[d2.length - 1],
    hubName: spotAll.slice().sort((a, b) => b.step1 - a.step1)[0].name,
    wideName: spotAll.slice().sort((a, b) => b.step2 - a.step2)[0].name,
    cutSum: guAll.reduce((s, g) => s + g.cutCount, 0),
    maxDiameter: Math.max(...guAll.map((g) => g.diameter)),
    featAll: geo.features.length,
    edgeAll: [...adj.values()].reduce((s, a) => s + a.length, 0) / 2,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`전국 행정동 ${C.featAll}곳을 ${C.edgeAll}개 다리로 이었다`);
console.log(`한 다리 min ${C.deg1Min} · 중앙 ${C.deg1Mid} · max ${C.deg1Max}(${C.hubName}) · 두 다리 중앙 ${C.deg2Mid} · max ${C.deg2Max}(${C.wideName})`);
console.log(`길목 ${C.cutSum}칸 · 시군구 지름 최대 ${C.maxDiameter}다리`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 한 다리 평균 ${String(s.avgDeg).padStart(4)} · 길목 ${String(s.cutSum).padStart(3)} · 지름 ${s.maxDiameter}`);
