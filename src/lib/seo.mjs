/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 열한 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *     어반오아시스 `{동} 출장마사지 홈타이 / {구} {코스어} {행동어} · 어반오아시스`
 *     솔레이스바디 `{동} 출장마사지 홈타이 : {구} {코스어} {행동어} | 솔레이스바디`
 *     레스토라럭스 `{동} 출장마사지 | {구} 홈타이 {코스어} {행동어} · 레스토라럭스`
 *   ★**가운뎃점으로만 세 토막을 가르는** 모양은 여기서 처음 쓴다. 열한 곳 모두
 *     세로줄이나 줄표를 한 번은 쓴다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다. 가운데 토막은 그 자리에서만 나오는 계산값
 *   (한·두·세 다리 건너 칸 수, 편심, 길목)으로 채워 전부 달라지게 한다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '리쥬베나';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 일곱 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '경락', '림프', '건식'];
/** 제목 꼬리 행동어 */
const ACT = ['문 앞 안내', '시각 맞추기', '한밤 접수', '오늘 출발', '값 확인'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} · 서울 인천 경기 부산 동 방문 관리 · 24시 오늘 출발`,
  areaHub: (c) => `${KEY} 건너가는 칸 · 동 ${c.spot}칸 시군구 ${c.gu}곳 전체 · ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} · ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} 방문 · ${at(hash(sd.name, 'sdt'), ACT)} ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}칸` : g.main ? `읍면 ${g.ruralCount}칸` : `행정동 ${g.dongCount}칸`;
    return `${g.name} ${KEY} · ${sd.name} ${unit} · ${at(h, ACT, 0)} ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} · ${at(h, COURSE_WORD, 0)} · ${g.name} ${at(h, ACT, 1)} ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} · ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 · 세기 ${c.pressure} ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} · ${sd.name} 방문 · ${at(hash(sd.name, c.slug), ACT)} ${BRAND}`,
  page: (t) => `${t} · ${BRAND} ${KEY}`,
  post: (p) => `${p.title} · ${BRAND} 다리 수 갈무리`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 다리 수에서 나온 값으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => (s.step1 ? `경계를 맞댄 칸이 ${s.step1}개, 한 칸 더 건너면 ${s.step2}개입니다` : '경계를 맞댄 칸이 없는 섬 자리입니다'),
    () => (s.step1 ? `두 다리 안에 ${s.step2}칸, 세 다리 안에 ${s.step3}칸이 들어옵니다` : '배로 건너야 하는 자리라 시각을 넉넉히 봅니다'),
    () => (s.cut ? `이 칸을 지나지 않으면 건너갈 수 없는 길목입니다` : `${g.name} 안에서 가장 먼 칸까지 ${s.ecc}다리입니다`),
    () => `${g.name} 안 이웃이 ${s.inDeg}칸, 구 밖 이웃이 ${s.outDeg}칸입니다`,
    () => `한 다리 건너 칸 수로 ${g.name}에서 ${s.guDegRank}번째입니다`,
    () => `땅 ${km2(s.area)}에 맞댄 칸 ${s.step1}개, 두 다리 ${s.step2}개`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '값은 끝난 뒤에 치릅니다',
  '선입금을 받지 않습니다',
  '거리로 값표를 고치지 않습니다',
  '깊은 밤에도 같은 값입니다',
  '셈은 마치고 한 번만 합니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 옆 칸에서 몇 다리 건너오는지를 칸마다 세었습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이로 건너가는 동 ${c.spot}칸과 시군구 ${c.gu}곳. 칸마다 맞댄 이웃 수를 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}칸에 쪽이 있고 한 다리 평균이 ${sd.avgDeg}칸입니다.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}칸에 쪽이 있고 안쪽 이웃이 칸마다 평균 ${g.avgDeg}개`,
        `한쪽 끝에서 반대쪽까지 ${g.diameter}다리, 길목이 ${g.cutCount}칸`,
        `이웃이 가장 많은 칸은 ${g.hubSpot}, 가장 적은 칸은 ${g.edgeSpot}`,
        `두 다리 안에 가장 넓게 닿는 칸은 ${g.wideSpot}로 ${g.wideN}개`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}칸이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}칸과 면 ${g.myeonCount}칸을 이름으로 올렸습니다`,
          `땅 ${km2(g.area)}에 한쪽 끝에서 반대쪽까지 ${g.diameter}다리`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}칸이 들어 있고 지름은 ${g.diameter}다리`,
          `칸마다 안쪽 이웃이 평균 ${g.avgDeg}개인 ${km2(g.area)}`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}칸 모두 건너갑니다` : `동 ${g.dongNames.length}칸 어디나 한 번호로`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.focus}${josa(c.focus, '을/를')} 오래 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
