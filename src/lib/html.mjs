import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { BRIDGEMARK } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **ringBtn() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 * ★칸을 덩어리로 감싸지 않는다. 굵은 밑줄과 가로 실선으로만 가른다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#4A7A1E">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/rejuv.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="bypass" href="#main">바로 본문 읽기</a>
${header(ctx, path)}
${crumbs.length > 1 ? stepsHtml(crumbs) : ''}
<main id="main">
<h1 class="big">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${bottomBar(cfg)}
<script src="/assets/rejuv.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 풀빛 네모지만 `<a href="tel:">` 이다. <button> 으로 두면 스크립트
   없이는 아무 일도 일어나지 않는다.
   size: s(머리) · m(본문) · l(대문·아래 줄) */
export function ringBtn(cfg, { size = 'm', bar = false } = {}) {
  return `<a class="ring ring-${size}${bar ? ' ring-b' : ''}" href="tel:${cfg.telRaw}">
  <span class="ring-i" aria-hidden="true"></span>
  <span class="ring-t"><span class="ring-k">${esc(cfg.telLabel)}</span><span class="ring-v">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리 — 흰 바탕에 굵은 풀빛 밑줄, 메뉴는 아래 밑줄로 현재 자리 표시 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '건너가는 칸'], ['/course/', '코스'], ['/price/', '값표'], ['/guide/', '처음 보시면'], ['/magazine/', '갈무리']];
  return `<header>
  <div class="top">
    <div class="top-in">
      <a class="name" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">
        ${BRIDGEMARK()}<span class="name-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
      </a>
      <div class="top-r">
        <p class="top-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
        ${ringBtn(cfg, { size: 's' })}
      </div>
    </div>
  </div>
  <nav class="menu" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
</header>`;
}

function stepsHtml(crumbs) {
  return `<nav class="steps2" aria-label="여기까지 온 길"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 담당 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="foot">
  <div class="foot-in">
    <section>
      <p class="ft-nm">${esc(cfg.brand.ko)}</p>
      <p class="ft-say">앉아 기다리는 가게가 없습니다. 연락이 오면 관리사가 옆 칸에서 넘어옵니다. 쪽을 가진 층은 시군구 ${counts.gu}곳과 동 ${counts.spot}칸, 들어오는 입구는 아래 번호 하나입니다.</p>
      ${ringBtn(cfg, { size: 'm' })}
      <p class="ft-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="ft-h">동 한 칸까지</p>
      <ul class="links">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="ft-h" style="margin-top:16px">시군구 선까지</p>
      <ul class="links">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="ft-sm"><a href="/area/">건너가는 칸 한 장에 펼치기</a> · 읍·면 ${counts.rural}칸은 이름만 올렸습니다</p>
    </nav>
    <div>
      <p class="ft-h">문서</p>
      <ul class="ft-ul">
        <li><a href="/guide/">처음 보시면</a></li>
        <li><a href="/price/">값표</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="ft-h" style="margin-top:18px">갈무리한 글</p>
      <ul class="ft-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="ft-h" style="margin-top:18px">긁어 가는 길</p>
      <ul class="links"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="ft-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="foot-end"><div>
    ${biz ? `<p class="ft-biz">${biz}</p>` : '<p class="ft-biz ft-pale">사업자 정보는 정해지는 대로 이 줄에 올립니다.</p>'}
    <p class="ft-ai">지역 쪽의 다리 수와 길목은 공개된 행정동 경계를 이어 만든 그래프에서 기계로 센 값이며, 문장은 <strong>AI 도구로 초벌을 쓰고</strong> 사람이 고쳐 올렸습니다. 후기·체험담·별점을 모으지도 싣지도 않고 인물 사진을 쓰지 않습니다. 밑자료: ${esc(data.source)}</p>
    <p class="ft-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 병을 고치는 의료 행위가 아니고 성적인 서비스를 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 줄 */
function bottomBar(cfg) {
  return `<div class="bottom">
  ${ringBtn(cfg, { size: 'l', bar: true })}
  <span class="bottom-s">닿기까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/**
 * 칸 틀 — 밑줄 그은 제목과 가로 실선. 감싸는 덩어리를 두지 않는다.
 */
export function sect(id, label, h2, inner, sub, n) {
  return `<section class="sect" id="${id}" aria-labelledby="${id}-h">
  <header class="sect-h">
    <span class="sect-no" aria-hidden="true">${esc(label)}${n ? ` ${n}` : ''}</span>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="sect-sb">${sub}</p>` : ''}
  </header>
  <div class="sect-b">${inner}</div>
</section>`;
}
