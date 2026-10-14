import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **굵은 밑줄**이다. 카드를 쓰지 않는다. 흰 종이 위에 제목을 놓고 그
 *   글자 폭만큼 두꺼운 색 밑줄을 긋는다. 칸은 가로 실선 하나로만 가른다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *     솔레이스바디 비스듬히 잘린 귀퉁이 · 각진 타일 · 상아+청록
 *     레스토라럭스 가는 겹줄 액자 · 어두운 남보라 바탕 · 남보라+황동
 *   ★여기는 **덩어리가 없다**. 흰 바탕에 굵은 밑줄과 가로 실선만으로 가른다.
 *     벨벳럽도 흰 바탕이지만 그쪽은 '굵은 괘선 + 큰 순번'이고 강조가 진홍이다.
 *   ★강조색은 올리브(73도)와 숲 녹색(147도) 사이에 비어 있던 자리를 썼다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#FFFFFF', card: '#FFFFFF', soft: '#F1F5EC',
  ink: '#1F2419', dim: '#5E6654',
  acc: '#4A7A1E', accDk: '#365913', accSoft: '#E9F1DE',
  line: '#D9DFD0', clay: '#A8552B',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--clay:${t.clay};
  --w:980px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.88;font-size:16.5px;letter-spacing:-.007em;padding-bottom:84px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--accDk);font-weight:700}
.bypass{position:absolute;left:-9999px}
.bypass:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#fff;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.top{border-bottom:4px solid var(--acc)}
.top-in{max-width:var(--w);margin:0 auto;padding:20px 20px 14px;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}
.name{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.name:hover{text-decoration:none}
.bmk{width:30px;height:30px;flex:none}
.name-t b{display:block;font-size:20px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.name-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--clay)}
.top-r{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.top-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.top-run span{display:block}
.menu{max-width:var(--w);margin:0 auto;padding:10px 20px 0}
.menu ul{list-style:none;margin:0;padding:0;display:flex;gap:22px;overflow-x:auto}
.menu a{display:block;padding:2px 0 7px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap;border-bottom:3px solid transparent}
.menu a:hover{color:var(--accDk);text-decoration:none}
.menu a[aria-current]{color:var(--ink);border-bottom-color:var(--clay)}

/* ── 지나온 길 ─────────────────────────────────────── */
.steps2{max-width:var(--w);margin:0 auto;padding:14px 20px 0}
.steps2 ol{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.steps2 li+li::before{content:"/";margin-right:8px;color:var(--line)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:22px 20px 64px}
.big{font-size:27px;font-weight:800;letter-spacing:-.04em;line-height:1.26;margin:14px 0 0}
@media (min-width:720px){.big{font-size:36px}}
.big-s{display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.008em}
.big::after{content:"";display:block;width:84px;height:5px;background:var(--acc);margin:18px 0 22px}
.open2{margin:0 0 32px;max-width:51rem;font-size:17px}
.open2 p{margin:0 0 .95em}
.open2 p:last-child{margin-bottom:0}

/* ── 칸 = 밑줄 제목 + 가로 실선 ────────────────────── */
.sect{margin:0 0 34px;padding:0 0 4px}
.sect+.sect{border-top:1px solid var(--line);padding-top:30px}
.sect-h{margin:0 0 18px}
.sect-no{display:block;margin:0 0 6px;font-family:var(--mono);font-size:10px;letter-spacing:.24em;color:var(--clay);text-transform:uppercase}
.sect-no::before{content:attr(data-eyebrow)}
.sect h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.03em;line-height:1.36;display:inline-block;
  border-bottom:4px solid var(--accSoft);padding-bottom:3px}
@media (min-width:720px){.sect h2{font-size:23px}}
.sect-sb{margin:12px 0 0;font-size:14px;color:var(--dim)}
.sect-x{margin:18px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 장부 ──────────────────────────────────────────── */
.rows{width:100%;border-collapse:collapse;font-size:15px}
.rows th,.rows td{padding:11px 2px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.rows th{width:42%;font-weight:700;color:var(--clay);font-size:13px}
@media (min-width:600px){.rows th{width:27%}}

/* ── 코스 ──────────────────────────────────────────── */
.dishes{list-style:none;margin:0;padding:0}
.dishes>li{padding:15px 0;border-bottom:1px solid var(--line)}
.dishes>li:last-child{border-bottom:0}
.dishes a{display:flex;justify-content:space-between;align-items:baseline;gap:16px;color:var(--ink);flex-wrap:wrap}
.dishes a:hover{text-decoration:none;color:var(--accDk)}
.d-n{font-size:17px;font-weight:800;letter-spacing:-.025em;border-bottom:3px solid var(--accSoft)}
.d-w{font-family:var(--mono);font-size:15.5px;color:var(--accDk);font-weight:700;white-space:nowrap}
.d-s{display:block;width:100%;margin-top:6px;font-size:12.5px;color:var(--dim)}
.d-t{margin:9px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 차례 ──────────────────────────────────────────── */
.walk{list-style:none;margin:0;padding:0;counter-reset:wk}
.walk li{padding:15px 0 15px 44px;position:relative;border-bottom:1px solid var(--line)}
.walk li:last-child{border-bottom:0}
.walk li::before{content:counter(wk) "다리";counter-increment:wk;position:absolute;left:0;top:17px;
  font-family:var(--mono);font-size:11px;color:var(--clay);letter-spacing:.02em}
.walk h3{margin:0 0 5px;font-size:15.5px;font-weight:800}
.walk p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.ask2{margin:0}
.ask2>div{padding:17px 0;border-bottom:1px solid var(--line)}
.ask2>div:last-child{border-bottom:0}
.ask2 .no{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--clay);margin-bottom:6px}
.ask2 h3{margin:0 0 8px;font-size:16.5px;font-weight:800;letter-spacing:-.025em}
.ask2 p{margin:0;font-size:15px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.note2{list-style:none;margin:0;padding:0}
.note2 li{padding:12px 0 12px 26px;font-size:14.5px;color:var(--dim);border-bottom:1px solid var(--line);position:relative}
.note2 li:last-child{border-bottom:0}
.note2 li::before{content:"—";position:absolute;left:0;color:var(--acc)}

/* ── 목록·링크 ─────────────────────────────────────── */
.links{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px 18px}
.links a{font-size:14px;color:var(--ink);border-bottom:1px solid var(--line);padding-bottom:1px}
.links a:hover{border-bottom-color:var(--acc);color:var(--accDk);text-decoration:none}
.board{list-style:none;margin:0;padding:0;display:grid;gap:0}
@media (min-width:560px){.board{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.board{grid-template-columns:1fr 1fr 1fr}}
.board li{border-bottom:1px solid var(--line)}
.board a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;padding:10px 10px 10px 0;color:var(--ink)}
.board a:hover{text-decoration:none;color:var(--accDk)}
.board .on a,.board a[aria-current]{background:var(--accSoft);padding-left:10px;font-weight:700}
.w-n{font-weight:600;font-size:14.5px}
.w-s{font-family:var(--mono);font-size:11px;color:var(--dim);white-space:nowrap}
.flatlist{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 16px}
.flatlist li{font-size:13.5px;color:var(--dim)}

/* ── 견주기 ────────────────────────────────────────── */
.grid2{width:100%;border-collapse:collapse;font-size:14.5px}
.grid2 th,.grid2 td{padding:11px 8px 11px 0;text-align:left;border-bottom:1px solid var(--line)}
.grid2 thead th{font-size:12px;color:var(--clay);font-weight:700;border-bottom:3px solid var(--acc)}
.grid2 tbody th{font-weight:700}
.grid2 tbody tr.on th,.grid2 tbody tr.on td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.ring{display:inline-flex;align-items:center;gap:12px;background:var(--acc);color:#fff;
  padding:11px 22px;text-decoration:none;border-radius:2px}
.ring:hover{background:var(--accDk);text-decoration:none}
.ring-i{flex:none;display:block;width:12px;height:12px;border:2px solid #fff;border-radius:50%}
.ring-t{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.ring-k{font-size:10px;letter-spacing:.22em;opacity:.88;font-family:var(--mono)}
.ring-v{font-family:var(--mono);font-weight:700;white-space:nowrap}
.ring-s .ring-v{font-size:15px}
.ring-m .ring-v{font-size:18px}
.ring-l .ring-v{font-size:21.5px}
.ring-l{padding:13px 26px}
.ring-b{display:flex;width:100%;justify-content:center}
.shout{border-top:4px solid var(--acc);border-bottom:1px solid var(--line);padding:24px 0;margin:0 0 34px}
.shout-p{margin:0 0 16px;font-size:16px;max-width:47rem}
.shout-s{margin:14px 0 0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.front2{padding:8px 0 34px;border-bottom:1px solid var(--line);margin:0 0 34px}
.front2-sl{margin:0 0 16px;font-size:23px;font-weight:800;letter-spacing:-.04em;color:var(--ink);max-width:21em;line-height:1.38}
@media (min-width:720px){.front2-sl{font-size:30px}}
.front2-p{margin:0 0 24px;color:var(--dim);font-size:16px;max-width:45rem}
.front2-f{display:grid;gap:0;margin:26px 0 0}
@media (min-width:640px){.front2-f{grid-template-columns:1fr 1fr 1fr 1fr}}
.front2-f div{padding:14px 14px 14px 0;border-top:1px solid var(--line)}
.front2-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--accDk)}
.front2-f dd{margin:4px 0 0;font-size:12.5px;color:var(--dim)}
.halves{display:grid;gap:24px}
@media (min-width:760px){.halves{grid-template-columns:1fr 1fr}}
.halves-h{margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--clay);font-family:var(--mono)}
.halves ul{list-style:none;margin:0;padding:0}
.halves li{border-bottom:1px solid var(--line)}
.halves a{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:11px 0;color:var(--ink)}
.halves a:hover{color:var(--accDk);text-decoration:none}
.halves b{font-size:15.5px;font-weight:700}
.halves span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 다리 무리(지역 고르기) ────────────────────────
   ★두 칸짜리 이름 목록을 쓰지 않는다. 쪽을 둔 칸이 많을수록 글자가 커지는
     무리로 흩어 놓는다. 품이 넓은 지역이 한눈에 커 보인다. */
.swarm{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 20px}
.swarm a{display:inline-flex;align-items:baseline;gap:7px;color:var(--ink);padding:4px 0;
  border-bottom:3px solid transparent;line-height:1.5}
.swarm a:hover{text-decoration:none;border-bottom-color:var(--acc);color:var(--accDk)}
.swarm b{font-weight:800;letter-spacing:-.035em}
.swarm small{font-family:var(--mono);font-size:11px;color:var(--dim);font-weight:400}
.swarm .lv1 b{font-size:30px}
.swarm .lv2 b{font-size:25px}
.swarm .lv3 b{font-size:21px}
.swarm .lv4 b{font-size:18px}
.swarm .lv5 b{font-size:16px;color:var(--dim)}
.swarm .lv5 a:hover b{color:var(--accDk)}
.swarm li.thin a{border-bottom-color:transparent}
.swarm li.thin b{font-weight:600}
.swarm-key{margin:20px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:14px}

/* ── 주제 묶음 링크 ────────────────────────────────── */
.topics{display:grid;gap:24px}
@media (min-width:720px){.topics{grid-template-columns:1fr 1fr}}
.topic-h{margin:0 0 11px;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--clay)}
.topic-h::after{content:"";display:block;width:34px;height:3px;background:var(--accSoft);margin-top:6px}

/* ── 글 ────────────────────────────────────────────── */
.read{max-width:45rem;font-size:17px}
.read h2{margin:34px 0 14px;font-size:19px;font-weight:800;display:inline-block;border-bottom:4px solid var(--accSoft);padding-bottom:2px}
.read p{margin:0 0 1.05em}
.read ul{margin:0 0 1.05em;padding-left:1.1em;color:var(--dim)}
.cards{list-style:none;margin:0;padding:0}
.cards li{border-bottom:1px solid var(--line)}
.cards a{display:block;padding:17px 0;color:var(--ink)}
.cards a:hover{text-decoration:none}
.cards b{display:block;font-size:17px;font-weight:800;margin-bottom:6px;border-bottom:3px solid transparent}
.cards a:hover b{border-bottom-color:var(--acc)}
.cards p{margin:0;font-size:14px;color:var(--dim)}
.cards time{display:block;margin-top:8px;font-family:var(--mono);font-size:11px;color:var(--clay)}
.law h2{margin:28px 0 10px;font-size:17px;font-weight:800;display:inline-block;border-bottom:3px solid var(--accSoft)}
.law p,.law li{font-size:15px;color:var(--dim)}
.law ul,.law ol{padding-left:1.2em;margin:0 0 1em}
.day{margin:0 0 18px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.foot{border-top:4px solid var(--acc);margin-top:26px}
.foot-in{max-width:var(--w);margin:0 auto;padding:32px 20px 24px;display:grid;gap:28px}
@media (min-width:860px){.foot-in{grid-template-columns:1.3fr 1fr 1fr}}
.ft-h{margin:0 0 11px;font-family:var(--mono);font-size:10px;letter-spacing:.24em;color:var(--clay)}
.ft-nm{margin:0 0 9px;font-size:19px;font-weight:800;letter-spacing:-.025em}
.ft-say{margin:0 0 15px;font-size:14px;color:var(--dim)}
.ft-run{margin:13px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.ft-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:14px}
.ft-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.ft-sm{margin:11px 0 0;font-size:12px;color:var(--dim)}
.foot-end div{max-width:var(--w);margin:0 auto;padding:0 20px 26px;border-top:1px solid var(--line);padding-top:19px}
.ft-biz{margin:0 0 9px;font-size:12px;color:var(--dim)}
.ft-pale{opacity:.7}
.ft-ai{margin:0 0 9px;font-size:12px;color:var(--dim);line-height:1.72}
.ft-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.bottom{position:fixed;left:0;right:0;bottom:0;z-index:40;background:#fff;border-top:3px solid var(--acc);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;transition:transform .2s}
.bottom.gone{transform:translateY(130%)}
.bottom-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.bottom{display:none}}
@media print{.bottom,.menu,.shout{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.bottom'),ft=document.querySelector('.foot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('gone',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 세 점을 두 다리로 이은 그림 — 이 사이트가 세는 것 그대로 */
const BRIDGE = (a, b, w) => `<g stroke="${a}" stroke-width="${w}" fill="none"><path d="M7 23h8"/><path d="M17 23h8"/><path d="M12 10h8"/></g>
<g fill="${a}"><circle cx="6" cy="23" r="3"/><circle cx="26" cy="23" r="3"/></g>
<g fill="${b}"><circle cx="16" cy="9" r="3.4"/></g>
<g stroke="${b}" stroke-width="${w}" fill="none"><path d="M8 21l6-9"/><path d="M24 21l-6-9"/></g>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${t.accSoft}"/>${BRIDGE(t.acc, t.clay, 2.2)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 48"><rect width="250" height="48" fill="#fff"/><rect y="44" width="250" height="4" fill="${t.acc}"/><g transform="translate(8,8)">${BRIDGE(t.acc, t.clay, 2.2)}</g><text x="50" y="26" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">리쥬베나</text><text x="50" y="38" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.clay}">REJUVENA</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#FFFFFF"/>
<rect width="1200" height="16" fill="${t.acc}"/>
<g transform="translate(96,88) scale(3.2)">${BRIDGE(t.acc, t.clay, 2.2)}</g>
<text x="96" y="318" font-family="system-ui,sans-serif" font-size="52" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<rect x="96" y="334" width="300" height="8" fill="${t.accSoft}"/>
<text x="96" y="394" font-family="system-ui,sans-serif" font-size="27" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="96" y="440" font-family="ui-monospace,monospace" font-size="21" fill="${t.accDk}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="96" y="472" width="420" height="68" fill="${t.acc}"/>
<text x="128" y="500" font-family="ui-monospace,monospace" font-size="14" letter-spacing="5" fill="${t.accSoft}">${cfg.telLabel}</text>
<text x="128" y="530" font-family="ui-monospace,monospace" font-size="26" font-weight="700" fill="#FFFFFF">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'rejuv.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'rejuv.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const BRIDGEMARK = (t = THEME) => `<svg class="bmk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${BRIDGE(t.acc, t.clay, 2.2)}</svg>`;
