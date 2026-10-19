/**
 * VIRGIL - MAIN CLIENT LOGIC & GAME LAYER
 */

(() => {
  const V = window.Virgil || {};
  const CONFIG = V.CONFIG;
  const THEMES = V.THEMES;
  const LINE = V.LINE;
  const LOAD = V.LOAD;
  const RAR = V.RAR;
  const ACH = V.ACH;
  const CseService = V.CseService;
  const sound = V.sound;

const $ = s => document.querySelector(s);
const el = {
  app: $("#app"),
  q: $("#q"),
  form: $("#form"),
  sbox: $("#sbox"),
  sboxList: $("#sboxList"),
  res: $("#res"),
  meta: $("#meta"),
  state: $("#state"),
  more: $("#more"),
  srcs: $("#srcs"),
  sugs: $("#sugs"),
  idhint: $("#idhint"),
  toast: $("#toast"),
  homeHub: $("#homeHub"),
  recentSec: $("#recentSec"),
  recentTags: $("#recentTags"),
  trendingSec: $("#trendingSec"),
  trendGrid: $("#trendGrid"),
  clearRecents: $("#clearRecents"),
  sscrim: $("#sscrim"),
  setBtn: $("#setBtn"),
  sclose: $("#sclose"),
  setSparks: $("#setSparks"),
  setSfx: $("#setSfx"),
  setCursor: $("#setCursor"),
  setMotion: $("#setMotion"),
  exitScrim: $("#exitScrim"),
  exitDomain: $("#exitDomain"),
  exitUrlText: $("#exitUrlText"),
  exitCopyBtn: $("#exitCopyBtn"),
  exitCancel: $("#exitCancel"),
  exitProceed: $("#exitProceed"),
  exitClose: $("#exitClose")
};

/* Preferences State */
const PREFS_KEY = "virgil:prefs";
let PREFS = {
  sfx: false,
  sparks: false, // Default off to prevent annoying click explosion spam
  cursor: true,
  motion: true
};
try {
  const savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
  PREFS = { ...PREFS, ...savedPrefs };
} catch (e) {}

const persistPrefs = () => {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(PREFS));
  } catch (e) {}
};

/* Recents State */
const RECENTS_KEY = "virgil:recents";
let RECENTS = [];
try {
  const r = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
  RECENTS = Array.isArray(r) ? r : [];
} catch (e) {
  RECENTS = [];
}

let cat = "games";
let active = new Set();
let start = 1;
let lastQ = "";
let busy = false;
let scoreNext = false;
const demo = false;

const FX = !!(window.gsap && window.Flip);
const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
if (FX) {
  gsap.registerPlugin(Flip);
  if (RM) gsap.globalTimeline.timeScale(100);
}

const ind = $("#ind");
$("#h1").innerHTML = [..."Bonfire"].map(c => `<span class="ch" aria-hidden="true"><i>${c}</i></span>`).join("");

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; } catch { return null; } };

function makeFallbackTile(letter, rc = "") {
  const tile = document.createElement("div");
  tile.className = ("fav " + rc).trim();
  tile.setAttribute("aria-hidden", "true");
  tile.textContent = (letter || "?").trim() || "?";
  return tile;
}

document.addEventListener("error", e => {
  const i = e.target;
  if (i.tagName === "IMG" && i.hasAttribute("data-fallback")) {
    i.parentElement.replaceChildren(makeFallbackTile(i.alt, i.dataset.rc || ""));
  }
}, true);

const ico = n => `<i data-lucide="${n}"></i>`;
const icons = () => {
  try {
    if (window.lucide) lucide.createIcons();
  } catch (e) {}
};

/* ---------- Theme Engine ---------- */
let curTheme = "midnight";
try {
  curTheme = localStorage.getItem("virgil:theme") || "midnight";
} catch (e) {}
if (!THEMES[curTheme]) curTheme = "midnight";

function applyTheme(id, anim = true) {
  const t = THEMES[id];
  if (!t) return;
  const r = document.documentElement;
  if (anim && !RM) {
    r.classList.add("tt");
    clearTimeout(applyTheme.t);
    applyTheme.t = setTimeout(() => r.classList.remove("tt"), 500);
  }
  for (const k in t.v) r.style.setProperty("--" + k, t.v[k]);
  r.style.setProperty("--vig", t.light ? "transparent" : "rgba(0,0,0,.5)");
  r.style.setProperty("--scan", t.light ? "transparent" : "rgba(255,255,255,.02)");
  r.style.setProperty("--shadow", t.light ? "rgba(40,30,15,.16)" : "rgba(0,0,0,.55)");
  r.style.setProperty("--rim-hl", t.light ? "rgba(0,0,0,.10)"       : "rgba(255,255,255,.14)");
  r.style.setProperty("--rim-in", t.light ? "rgba(255,255,255,.90)" : "rgba(255,255,255,.12)");
  r.style.colorScheme = t.light ? "light" : "dark";
  const tcolor = $("#tcolor");
  if (tcolor) tcolor.content = t.v.bg;
}
applyTheme(curTheme, false);

function toast(t) {
  el.toast.textContent = t;
  if (!FX) {
    el.toast.style.opacity = 1;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.toast.style.opacity = 0, 1600);
    return;
  }
  gsap.killTweensOf(el.toast);
  gsap.fromTo(el.toast, { xPercent: -50, y: 26, opacity: 0, scale: 0.9 }, { xPercent: -50, y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" });
  gsap.to(el.toast, { y: 14, opacity: 0, scale: 0.96, duration: 0.4, ease: "power2.in", delay: 1.7 });
}

/* ---------- Motion Helpers ---------- */
function moveInd(anim = true) {
  const t = document.querySelector(".tab[aria-selected=true]");
  if (!t || !ind) return;
  if (FX && anim) gsap.to(ind, { x: t.offsetLeft, width: t.offsetWidth, duration: 0.8, ease: "expo.out" });
  else if (FX) gsap.set(ind, { x: t.offsetLeft, width: t.offsetWidth });
  else {
    ind.style.transform = `translateX(${t.offsetLeft}px)`;
    ind.style.width = t.offsetWidth + "px";
  }
}

const HERO_FLOW = ".hero .tabs,.hero .search,.hero .idhint,.hero .tools,#homeHub,main";
function setSearching(on) {
  if (el.app.classList.contains("searching") === on) return;
  if (!FX || RM) {
    el.app.classList.toggle("searching", on);
    moveInd(false);
    return;
  }
  if (on) {
    gsap.to("#h1 .ch i,.lede", {
      yPercent: (i, t) => t.classList.contains("lede") ? 0 : -110,
      y: (i, t) => t.classList.contains("lede") ? -14 : 0,
      opacity: (i, t) => t.classList.contains("lede") ? 0 : 1,
      filter: (i, t) => t.classList.contains("lede") ? "blur(6px)" : "none",
      duration: 0.4,
      ease: "power3.in",
      stagger: 0.035,
      onComplete() {
        const st = Flip.getState(HERO_FLOW);
        el.app.classList.add("searching");
        Flip.from(st, { duration: 1, ease: "expo.inOut", nested: true, onUpdate: () => moveInd(false) });
      }
    });
  } else {
    const st = Flip.getState(HERO_FLOW);
    el.app.classList.remove("searching");
    gsap.set("#h1 .ch i,.lede", { clearProps: "all" });
    Flip.from(st, { duration: 1, ease: "expo.inOut", nested: true, onUpdate: () => moveInd(false) });
    gsap.from("#h1 .ch i", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.35, clearProps: "transform" });
    gsap.from(".lede", { y: 14, opacity: 0, filter: "blur(6px)", duration: 1, ease: "expo.out", delay: 0.5, clearProps: "all" });
  }
}

function intro() {
  moveInd(false);
  if (!FX) {
    const tw = $("#tw");
    if (tw) tw.textContent = LINE;
    return;
  }
  gsap.timeline({ defaults: { ease: "expo.out", clearProps: "transform,filter,opacity" } })
    .from("#h1 .ch i", { yPercent: 115, duration: 1.4, stagger: 0.07 })
    .from(".lede", { y: 16, opacity: 0, filter: "blur(8px)", duration: 1.1 }, "-=1")
    .from(".tab", { y: 12, opacity: 0, duration: 0.9, stagger: 0.06 }, "-=.9")
    .from(".search", { y: 24, opacity: 0, scale: 0.95, filter: "blur(10px)", duration: 1.2 }, "-=.8")
    .from(".tools .chip,.tools span#srcLabel", { y: 10, opacity: 0, duration: 0.8, stagger: 0.04 }, "-=.8")
    .from("nav .links>*", { opacity: 0, y: -8, duration: 0.9, stagger: 0.07 }, 0.2)
    .add(() => type($("#tw"), LINE), 1.1);
}

/* ---------- Category, Sources, Suggestions ---------- */
function renderCat() {
  const c = CONFIG.categories[cat];
  el.q.placeholder = c.placeholder;
  active = new Set(c.sites.map(s => s.domain));
  el.srcs.innerHTML = c.sites.map(s => `<button class="chip" aria-pressed="true" data-d="${esc(s.domain)}">${esc(s.name)}</button>`).join("");
  el.sugs.innerHTML = c.suggest.map(s => `<button class="chip ghost" data-s="${esc(s)}">${/^\d{3,8}$/.test(s) ? s + " (Steam ID)" : esc(s)}</button>`).join("");
  if (FX && renderCat.ran) gsap.from("#srcs .chip,#sugs .chip", { y: 8, opacity: 0, scale: 0.92, duration: 0.7, ease: "expo.out", stagger: 0.04, clearProps: "transform,opacity" });
  renderCat.ran = true;
}

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === t));
  cat = t.dataset.cat;
  closeSbox();
  moveInd();
  renderCat();
  sound.click();
  unlock("class");
  if (lastQ) run(lastQ, true);
}));

el.srcs.addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  const d = b.dataset.d, on = b.getAttribute("aria-pressed") === "true";
  if (on && active.size === 1) {
    toast("Keep at least one source on");
    return;
  }
  on ? active.delete(d) : active.add(d);
  b.setAttribute("aria-pressed", !on);
  if (lastQ) run(lastQ, true);
});

el.sugs.addEventListener("click", e => {
  const b = e.target.closest("[data-s]");
  if (!b) return;
  el.q.value = b.dataset.s;
  scoreNext = true;
  run(b.dataset.s, true);
});

/* ---------- Realtime Search Autocomplete (Sbox) ---------- */
let sboxItems = [];
let sboxIdx = -1;
let sboxDebounce = null;

function closeSbox() {
  if (!el.sbox) return;
  el.sbox.hidden = true;
  if (el.sboxList) el.sboxList.innerHTML = "";
  sboxItems = [];
  sboxIdx = -1;
  el.q.setAttribute("aria-expanded", "false");
  el.q.removeAttribute("aria-activedescendant");
}

function highlightMatch(text, query) {
  if (!query) return esc(text);
  const qClean = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp(`(${qClean})`, "gi");
  return esc(text).replace(rx, "<mark>$1</mark>");
}

function renderSbox(items, query) {
  sboxItems = items || [];
  sboxIdx = -1;
  if (!sboxItems.length) {
    closeSbox();
    return;
  }
  el.q.setAttribute("aria-expanded", "true");
  el.sboxList.innerHTML = sboxItems.map((item, idx) => `
    <li class="sbox-item" role="option" id="sb-${idx}" data-idx="${idx}" data-val="${esc(item)}" data-cur="SELECT">
      <span class="sbox-ic">${ico("search")}</span>
      <span class="sbox-text">${highlightMatch(item, query)}</span>
      <span class="sbox-arrow">${ico("arrow-up-right")}</span>
    </li>
  `).join("");
  icons();
  el.sbox.hidden = false;
  if (FX) {
    gsap.fromTo(el.sbox, 
      { opacity: 0, y: -6, scale: 0.99 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out", overwrite: "auto" }
    );
  }
}

function updateSboxActive() {
  const children = el.sboxList ? el.sboxList.children : [];
  for (let i = 0; i < children.length; i++) {
    const isAct = i === sboxIdx;
    children[i].classList.toggle("active", isAct);
    if (isAct) {
      children[i].scrollIntoView({ block: "nearest" });
      el.q.value = sboxItems[i];
    }
  }
  const actItem = children[sboxIdx];
  if (actItem) {
    el.q.setAttribute("aria-activedescendant", actItem.id);
  } else {
    el.q.removeAttribute("aria-activedescendant");
  }
}

el.q.addEventListener("input", () => {
  const v = el.q.value.trim(), id = /^\d{3,8}$/.test(v);
  el.idhint.classList.toggle("on", id);
  if (id) el.idhint.textContent = `Searching by Steam ID ${v}`;

  clearTimeout(sboxDebounce);
  if (v.length < 2 || id) {
    closeSbox();
    return;
  }
  sboxDebounce = setTimeout(async () => {
    try {
      const sugs = await CseService.getSuggestions(v);
      if (el.q.value.trim() === v) {
        renderSbox(sugs, v);
      }
    } catch (e) {
      closeSbox();
    }
  }, 160);
});

el.q.addEventListener("keydown", e => {
  if (!el.sbox || el.sbox.hidden || !sboxItems.length) {
    if (e.key === "Escape") closeSbox();
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    sboxIdx = (sboxIdx + 1) % sboxItems.length;
    updateSboxActive();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    sboxIdx = (sboxIdx - 1 + sboxItems.length) % sboxItems.length;
    updateSboxActive();
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeSbox();
  } else if (e.key === "Enter") {
    if (sboxIdx >= 0 && sboxItems[sboxIdx]) {
      e.preventDefault();
      const val = sboxItems[sboxIdx];
      el.q.value = val;
      closeSbox();
      scoreNext = true;
      run(val, true);
    }
  }
});

el.sboxList.addEventListener("click", e => {
  const item = e.target.closest(".sbox-item");
  if (!item) return;
  const val = item.dataset.val;
  if (val) {
    el.q.value = val;
    closeSbox();
    scoreNext = true;
    run(val, true);
  }
});

document.addEventListener("click", e => {
  if (el.form && !el.form.contains(e.target)) {
    closeSbox();
  }
});

/* ---------- Discovery Home Hub Logic ---------- */
function addRecent(q) {
  const term = (q || "").trim();
  if (!term || /^\d{3,8}$/.test(term)) return;
  RECENTS = [term, ...RECENTS.filter(item => item.toLowerCase() !== term.toLowerCase())].slice(0, 8);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(RECENTS));
  } catch (e) {}
  renderRecentTags();
}

function removeRecent(term) {
  RECENTS = RECENTS.filter(item => item !== term);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(RECENTS));
  } catch (e) {}
  renderRecentTags();
}

function clearRecents() {
  RECENTS = [];
  try {
    localStorage.removeItem(RECENTS_KEY);
  } catch (e) {}
  renderRecentTags();
}

function renderRecentTags() {
  if (!el.recentSec || !el.recentTags) return;
  if (!RECENTS.length) {
    el.recentSec.hidden = true;
    el.recentTags.innerHTML = "";
    return;
  }
  el.recentSec.hidden = false;
  el.recentTags.innerHTML = RECENTS.map(item => `
    <div class="hub-tag" data-val="${esc(item)}">
      <button type="button" class="hub-label" data-val="${esc(item)}">
        <i data-lucide="history"></i>
        <span>${esc(item)}</span>
      </button>
      <button type="button" class="del-tag" data-del="${esc(item)}" title="Remove" aria-label="Remove query">×</button>
    </div>
  `).join("");
  icons();
}

function renderTrendingGrid() {
  if (!el.trendGrid) return;
  const items = V.TRENDING || [];
  el.trendGrid.innerHTML = items.map(t => `
    <div class="trend-card" data-val="${esc(t.title)}" data-cur="SEARCH">
      <div class="trend-cover-wrap">
        <img class="trend-cover" src="${esc(t.img)}" alt="${esc(t.title)}" loading="lazy">
      </div>
      <div class="trend-body">
        <div class="trend-top">
          <span class="trend-tag">${esc(t.tag)}</span>
          <span class="trend-id">ID ${esc(t.id)}</span>
        </div>
        <div class="trend-title">${esc(t.title)}</div>
        <div class="trend-sub">${esc(t.sub)}</div>
      </div>
    </div>
  `).join("");
  icons();
}

function renderHomeHub() {
  renderRecentTags();
  renderTrendingGrid();
}

el.homeHub?.addEventListener("click", e => {
  const del = e.target.closest("[data-del]");
  if (del) {
    e.stopPropagation();
    removeRecent(del.dataset.del);
    sound.click();
    return;
  }
  const label = e.target.closest(".hub-label") || e.target.closest(".hub-tag");
  if (label && label.dataset.val) {
    el.q.value = label.dataset.val;
    scoreNext = true;
    run(label.dataset.val, true);
    sound.click();
    return;
  }
  const card = e.target.closest(".trend-card");
  if (card && card.dataset.val) {
    el.q.value = card.dataset.val;
    scoreNext = true;
    run(card.dataset.val, true);
    sound.click();
    return;
  }
});

el.clearRecents?.addEventListener("click", () => {
  clearRecents();
  sound.click();
});

$("#home").addEventListener("click", e => {
  e.preventDefault();
  closeSbox();
  setSearching(false);
  el.res.innerHTML = "";
  el.state.innerHTML = "";
  el.meta.textContent = "";
  el.more.hidden = true;
  el.q.value = "";
  lastQ = "";
  el.idhint.classList.remove("on");
  focusedIdx = -1;
  const u = new URL(window.location);
  u.searchParams.delete("q");
  history.pushState({}, "", u.pathname + (u.searchParams.toString() ? "?" + u.searchParams.toString() : ""));
  updateSeoMetadata("");
  renderHomeHub();
});

el.form.addEventListener("submit", e => {
  e.preventDefault();
  closeSbox();
  const v = el.q.value.trim();
  if (v) {
    scoreNext = true;
    run(v, true);
  }
});

el.more.addEventListener("click", () => run(lastQ, false));

/* ---------- Result Rows & Search Execution ---------- */
let focusedIdx = -1;
let seenUrls = new Set();

function updateFocusedResult() {
  const items = el.res.children;
  if (!items.length) return;
  for (let i = 0; i < items.length; i++) {
    const isCur = i === focusedIdx;
    items[i].classList.toggle("focused", isCur);
    if (isCur) {
      items[i].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
}

function unwrapUrl(rawUrl) {
  if (!rawUrl) return "";
  let u = rawUrl;
  for (let i = 0; i < 3; i++) {
    try {
      const parsed = new URL(u);
      if ((parsed.hostname === "www.google.com" || parsed.hostname === "google.com") && parsed.pathname.startsWith("/url")) {
        const target = parsed.searchParams.get("q") || parsed.searchParams.get("url");
        if (target && /^https?:\/\//i.test(target)) {
          u = decodeURIComponent(target);
          continue;
        }
      }
    } catch (e) {
      break;
    }
    break;
  }
  return u;
}

function highlightQuery(text, query) {
  if (!text) return "";
  if (!query) return esc(text);
  const words = query.trim().split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(w => w.length > 1);
  if (!words.length) return esc(text);
  const rx = new RegExp(`(${words.join("|")})`, "gi");
  return esc(text).replace(rx, '<mark class="kw-match">$1</mark>');
}

const row = (r, i, q) => {
  const [rc, rt] = RAR(i);
  const realUrl = safeUrl(unwrapUrl(r.url));
  if (!realUrl) return "";
  let realDomain = r.domain || "";
  try {
    if (!realDomain || realDomain.includes("google.com")) {
      realDomain = new URL(realUrl).hostname.replace(/^www\./i, "");
    }
  } catch (e) {}
  const visual = r.image 
    ? `<button type="button" class="rthumb" data-url="${esc(realUrl)}" data-cur="VISIT" aria-label="View source"><img src="${esc(r.image)}" alt="${esc((realDomain||'?').replace(/^www\./,'')[0].toUpperCase())}" data-rc="${rc}" loading="lazy" data-fallback></button>`
    : `<div class="fav ${rc}" aria-hidden="true">${esc((realDomain||"?").replace(/^www\./,"")[0].toUpperCase())}</div>`;
  return `<li class="r" data-idx="${i}" data-url="${esc(realUrl)}" data-domain="${esc(realDomain)}">
  ${visual}
  <div>
    <h3><a href="${esc(realUrl)}" class="ext-link" data-cur="VISIT" target="_blank" rel="noopener noreferrer">${highlightQuery(r.title, q)}<span class="ext-sup" title="Leaves Bonfire">${ico("arrow-up-right")}</span></a></h3>
    <div class="dom">
      <span class="dom-badge" title="Destination domain"><i data-lucide="globe"></i> <b>${esc(realDomain)}</b></span>
      <span class="rar ${rc}">${rt}</span>
      <button type="button" class="leaving-tag" data-cur="SAFETY" title="External link: will verify safety before leaving"><i data-lucide="shield-alert"></i> Leaving Bonfire <i data-lucide="external-link" class="sub-ic"></i></button>
    </div>
    <p>${highlightQuery(r.snippet, q)}</p>
  </div>
  <div class="acts">
    <button class="ic" data-cur="COPY" data-copy="${esc(realUrl)}" aria-label="Copy link">${ico("copy")}</button>
    <a class="ic ext-link" data-cur="OPEN" href="${esc(realUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open link safely">${ico("external-link")}</a>
  </div></li>`;
};

function updateSeoMetadata(query = "") {
  const defaultTitle = "Bonfire - Search for Games, Software & Android Apps";
  const defaultDesc = "Find games, software, and Android apps from trusted sites. All in one search. No ads, no tracking, just results.";
  
  const title = query ? `${query} - Bonfire Search` : defaultTitle;
  const desc = query 
    ? `Results for "${query}" from trusted ${cat} sources on Bonfire. No ads, no tracking.` 
    : defaultDesc;
  
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = desc;
  
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = title;
  
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = desc;

  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.content = title;
  
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.content = desc;
}

async function run(q, fresh, pushHistory = true) {
  closeSbox();
  if (busy) return;
  busy = true;
  lastQ = q;
  updateSeoMetadata(q);
  setSearching(true);
  addRecent(q);

  if (pushHistory) {
    const u = new URL(window.location);
    u.searchParams.set("q", q);
    u.searchParams.set("cat", cat);
    history.pushState({ q, cat }, "", u.toString());
  }

  if (fresh) {
    start = 1;
    seenUrls = new Set();
    focusedIdx = -1;
    el.res.innerHTML = "";
    el.state.innerHTML = "";
    el.more.hidden = true;
    el.meta.textContent = LOAD[Math.floor(Math.random() * LOAD.length)] + "…";
    el.state.innerHTML = '<div class="sk"><i></i><div><b></b><b></b></div></div>'.repeat(4);
  } else {
    el.more.textContent = "Loading…";
  }

  try {
    const { items, total } = await CseService.fetchPage(q, start, cat, [...active]);
    el.state.innerHTML = "";

    // Deduplicate results by normalized URL and validate safeUrl
    const normUrl = u => unwrapUrl(u || "").replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
    const uniqueItems = [];
    for (const item of (items || [])) {
      const safe = safeUrl(unwrapUrl(item.url));
      if (!safe) continue;
      const norm = normUrl(safe);
      if (!norm || seenUrls.has(norm)) continue;
      seenUrls.add(norm);
      uniqueItems.push(item);
    }

    if (!uniqueItems.length && fresh) {
      died(q);
    } else {
      const before = el.res.children.length;
      el.res.insertAdjacentHTML("beforeend", uniqueItems.map((r, i) => row(r, before + i, q)).filter(Boolean).join(""));
      icons();
      if (FX) {
        gsap.from([...el.res.children].slice(before), {
          y: 26,
          opacity: 0,
          filter: "blur(8px)",
          duration: 1,
          ease: "expo.out",
          stagger: 0.07,
          clearProps: "transform,filter,opacity"
        });
      }
      start += items.length;
      const shown = el.res.children.length;
      el.meta.innerHTML = `${shown} results for “${esc(q)}”${demo ? '<span class="demo">demo mode</span>' : ""}`;
      el.more.hidden = !(items.length && shown < Math.min(total || 0, 100));
      if (fresh) onSearchDone(q);
    }
  } catch (err) {
    el.state.innerHTML = `<div class="state err"><strong>Search failed</strong>${esc(err.message)}. Check the engine settings or network connection.</div>`;
    el.meta.textContent = "";
  }
  el.more.textContent = "Load more results";
  busy = false;
}

el.res.addEventListener("click", e => {
  const b = e.target.closest("[data-copy]");
  if (b) {
    (navigator.clipboard ? navigator.clipboard.writeText(b.dataset.copy) : Promise.reject()).then(() => {
      toast("Link copied");
      SAVE.copies++;
      persist();
      if (SAVE.copies >= 3) unlock("hoarder");
      b.innerHTML = ico("check");
      icons();
      b.style.color = "var(--accent)";
      if (FX && b.firstChild) gsap.fromTo(b.firstChild, { scale: 0.3, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(3)" });
      setTimeout(() => {
        b.innerHTML = ico("copy");
        icons();
        b.style.color = "";
      }, 1500);
    }, () => toast("Copy failed"));
    return;
  }

  // Intercept any link or external jump to display the Leaving Virgil safety dialog
  const link = e.target.closest("h3 a, a.ext-link, .leaving-tag, .rthumb");
  if (link) {
    e.preventDefault();
    const rowEl = link.closest(".r");
    const targetUrl = link.getAttribute("href") || link.dataset.url || rowEl?.dataset.url;
    const targetDomain = rowEl?.dataset.domain || "";
    if (targetUrl && targetUrl !== "#") {
      openExitModal(targetUrl, targetDomain);
      unlock("looter");
    }
  }
});

/* ================= Game Layer & Achievements ================= */
const KEY = "virgil:save";
let SAVE = { ach: [], copies: 0, searches: 0, sfx: false };
try {
  const o = JSON.parse(localStorage.getItem(KEY) || "{}");
  SAVE = { ...SAVE, ach: o.ach || [], copies: o.copies || 0, searches: o.searches || 0, sfx: !!o.sfx };
} catch (e) {}
sound.setEnabled(SAVE.sfx);

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(SAVE));
  } catch (e) {}
};

const lastPt = { x: window.innerWidth / 2, y: 220 };
addEventListener("pointermove", e => {
  lastPt.x = e.clientX;
  lastPt.y = e.clientY;
}, { passive: true });

const sfxBtn = $("#sfx");
const paintSfx = () => {
  if (!sfxBtn) return;
  sfxBtn.setAttribute("aria-pressed", PREFS.sfx);
  sfxBtn.innerHTML = ico(PREFS.sfx ? "volume-2" : "volume-x");
  icons();
};
sfxBtn.addEventListener("click", () => {
  PREFS.sfx = !PREFS.sfx;
  SAVE.sfx = PREFS.sfx;
  sound.setEnabled(PREFS.sfx);
  persist();
  persistPrefs();
  paintSfx();
  if (el.setSfx) el.setSfx.checked = PREFS.sfx;
  sound.click();
});

function type(node, text, ms = 42) {
  if (!node) return;
  if (RM || !FX) {
    node.textContent = text;
    return;
  }
  let n = 0;
  node.textContent = "";
  const t = setInterval(() => {
    node.textContent = text.slice(0, ++n);
    if (n >= text.length) clearInterval(t);
  }, ms);
}

function burst(x = lastPt.x, y = lastPt.y, n = 8) {
  if (!FX || RM || !PREFS.sparks) return;
  const C = ["var(--accent)", "var(--text)", "var(--muted)", "var(--accent)"];
  for (let k = 0; k < n; k++) {
    const d = document.createElement("i");
    d.className = "px";
    d.style.cssText = `left:${x}px;top:${y}px;background:${C[k % 4]}`;
    document.body.append(d);
    const a = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * (n > 20 ? 170 : 60);
    gsap.to(d, {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r + (n > 20 ? 120 : 20),
      rotate: Math.random() * 360,
      opacity: 0,
      scale: 0.3,
      duration: 0.7 + Math.random() * 0.7,
      ease: "power3.out",
      onComplete: () => d.remove()
    });
  }
}

function showCard(k, title, desc, icon) {
  const c = document.createElement("div");
  c.className = "card";
  c.innerHTML = `<div class="em">${ico(icon)}</div><div><div class="k">${k}</div><b>${title}</b><span>${desc}</span></div>`;
  $("#ach").append(c);
  icons();
  if (!FX) {
    setTimeout(() => c.remove(), 3800);
    return;
  }
  gsap.fromTo(c, { x: 70, opacity: 0, scale: 0.9 }, { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.6)" });
  gsap.to(c, { x: 70, opacity: 0, duration: 0.5, ease: "power2.in", delay: 3.8, onComplete: () => c.remove() });
}

function renderAch() {
  $("#acount").textContent = SAVE.ach.length + "/" + Object.keys(ACH).length;
  $("#alist").innerHTML = Object.entries(ACH).map(([k, [ic, n, d]]) => {
    const on = SAVE.ach.includes(k);
    return `<li class="${on ? "on" : ""}"><span class="em">${ico(on ? ic : "lock")}</span><div><b>${on ? n : "???"}</b><small>${on ? d : "Locked"}</small></div></li>`;
  }).join("");
  icons();
}

function unlock(id) {
  if (SAVE.ach.includes(id)) return;
  SAVE.ach.push(id);
  persist();
  const [ic, n, d] = ACH[id];
  showCard("ACHIEVEMENT UNLOCKED", n, d, ic);
  sound.ach();
  renderAch();
  const r = $("#achBtn").getBoundingClientRect();
  burst(r.left + r.width / 2, r.bottom, 20);
}

function onSearchDone(q) {
  if (!scoreNext) return;
  scoreNext = false;
  SAVE.searches++;
  persist();
  sound.search();
  unlock("first");
  if (/^\d{3,8}$/.test(q)) unlock("id");
  if (SAVE.searches >= 10) unlock("grass");
}

function died(q) {
  el.meta.textContent = "";
  el.state.innerHTML = `<div class="died"><b>NOTHING FOUND</b><span>No loot for “${esc(q)}”. Try the exact title, a Steam ID, or turn on more sources.</span></div>`;
  if (FX && !RM) {
    gsap.fromTo(".died b", { opacity: 0, letterSpacing: ".02em" }, { opacity: 1, letterSpacing: ".12em", duration: 5, ease: "power1.out" });
    gsap.from(".died span", { opacity: 0, y: 8, duration: 1.2, delay: 1.2 });
  }
  sound.died();
  if (scoreNext) {
    scoreNext = false;
    setTimeout(() => unlock("skill"), 1800);
  }
}

/* Achievements Panel Toggle */
const achBtn = $("#achBtn");
const panel = $("#panel");
const togglePanel = open => {
  open = open ?? panel.hidden;
  panel.hidden = !open;
  achBtn.setAttribute("aria-expanded", open);
  if (open && FX) gsap.from(panel, { y: -10, opacity: 0, scale: 0.97, duration: 0.6, ease: "expo.out" });
};
achBtn.addEventListener("click", e => {
  e.stopPropagation();
  sound.click();
  togglePanel();
});
addEventListener("click", e => {
  if (!panel.hidden && !e.target.closest("#panel")) togglePanel(false);
});

/* ================= Theme Picker ================= */
const tscrim = $("#tscrim");
const tq = $("#tq");
const tlist = $("#tlist");
const tbox = $(".tm");
let vis = [];
let idx = 0;
let tOpen = false;

function buildList(f = "") {
  vis = Object.keys(THEMES).filter(id => THEMES[id].name.toLowerCase().includes(f.trim().toLowerCase()));
  tlist.innerHTML = vis.map(id => {
    const t = THEMES[id], v = t.v, on = id === curTheme;
    return `<li><button class="th" role="option" data-id="${id}" aria-selected="${on}" style="--rb:${v.surface};--ra:${v.accent};background:${v.surface};color:${v.text};border-color:${v.line}">${t.name}<span class="sw"><i style="background:${v.bg}"></i><i style="background:${v.accent}"></i><i style="background:${v.muted}"></i></span>${on ? ico("check") : ""}</button></li>`;
  }).join("") || `<li style="padding:18px;color:var(--faint);font-size:14px">No theme matches that.</li>`;
  icons();
  idx = Math.max(0, vis.indexOf(curTheme));
  markCur(false);
}

function markCur(preview = true) {
  [...tlist.querySelectorAll(".th")].forEach((b, i) => b.classList.toggle("cur", i === idx));
  const b = tlist.querySelectorAll(".th")[idx];
  if (b) {
    b.scrollIntoView({ block: "nearest" });
    if (preview) applyTheme(vis[idx]);
  }
}

function openThemes() {
  if (tOpen) return;
  tOpen = true;
  togglePanel(false);
  tq.value = "";
  buildList();
  tscrim.hidden = false;
  tq.focus({ preventScroll: true });
  if (FX) {
    gsap.fromTo(tscrim, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(tbox, { y: 18, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" });
    gsap.from(".th", { y: 10, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.025, delay: 0.1, clearProps: "transform,opacity" });
  }
}

function closeThemes(commit) {
  if (!tOpen) return;
  tOpen = false;
  if (commit && vis[idx] && vis[idx] !== curTheme) {
    curTheme = vis[idx];
    try {
      localStorage.setItem("virgil:theme", curTheme);
    } catch (e) {}
    toast("Theme: " + THEMES[curTheme].name);
    sound.ach();
    burst(window.innerWidth / 2, window.innerHeight / 3, 14);
    unlock("style");
  } else {
    applyTheme(curTheme);
  }
  const done = () => {
    tscrim.hidden = true;
    $("#themeBtn").focus({ preventScroll: true });
  };
  FX ? gsap.to(tscrim, { opacity: 0, duration: 0.25, onComplete: done }) : done();
}

$("#themeBtn").addEventListener("click", openThemes);
tscrim.addEventListener("pointerdown", e => {
  if (e.target === tscrim) closeThemes(false);
});
tq.addEventListener("input", () => {
  buildList(tq.value);
  if (vis[0]) applyTheme(vis[idx]);
});
tlist.addEventListener("pointerover", e => {
  const b = e.target.closest(".th");
  if (!b) return;
  const i = [...tlist.querySelectorAll(".th")].indexOf(b);
  if (i !== idx) {
    idx = i;
    markCur();
  }
});
tlist.addEventListener("click", e => {
  if (e.target.closest(".th")) closeThemes(true);
});
tscrim.addEventListener("keydown", e => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (vis.length) {
      idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + vis.length) % vis.length;
      markCur();
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    closeThemes(true);
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeThemes(false);
  } else if (e.key === "Tab") {
    e.preventDefault();
  }
});

/* ================= Settings & Preferences Modal ================= */
let sOpen = false;

function applyCursorPref() {
  if (PREFS.cursor && FX && !RM) {
    document.documentElement.classList.add("fx");
    setupCrosshair();
    const ret = $("#ret"), dot = $("#dot"), tag = $("#ctag");
    if (ret) ret.style.display = "";
    if (dot) dot.style.display = "";
    if (tag) tag.style.display = "";
  } else {
    document.documentElement.classList.remove("fx");
    const ret = $("#ret"), dot = $("#dot"), tag = $("#ctag");
    if (ret) ret.style.display = "none";
    if (dot) dot.style.display = "none";
    if (tag) tag.style.display = "none";
  }
}

function syncPrefsUI() {
  if (el.setSparks) el.setSparks.checked = !!PREFS.sparks;
  if (el.setSfx) el.setSfx.checked = !!PREFS.sfx;
  if (el.setCursor) el.setCursor.checked = !!PREFS.cursor;
  if (el.setMotion) el.setMotion.checked = !!PREFS.motion;
  sound.setEnabled(PREFS.sfx);
  paintSfx();
  applyCursorPref();
}

function openSettings() {
  if (!el.sscrim || sOpen) return;
  sOpen = true;
  togglePanel(false);
  syncPrefsUI();
  el.sscrim.hidden = false;
  const sm = el.sscrim.querySelector(".sm");
  if (FX && sm) {
    gsap.fromTo(el.sscrim, { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: "opacity" });
    gsap.fromTo(sm, { y: 20, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out", clearProps: "transform,opacity" });
  }
}

function closeSettings() {
  if (!el.sscrim || !sOpen) return;
  sOpen = false;
  const sm = el.sscrim.querySelector(".sm");
  const done = () => { 
    el.sscrim.hidden = true; 
    el.setBtn?.focus({ preventScroll: true });
  };
  if (FX && sm) {
    gsap.to(el.sscrim, { opacity: 0, duration: 0.22, onComplete: done });
    gsap.to(sm, { y: 14, opacity: 0, scale: 0.97, duration: 0.22, ease: "power2.in" });
  } else {
    done();
  }
}

el.setBtn?.addEventListener("click", openSettings);
el.sclose?.addEventListener("click", closeSettings);
el.sscrim?.addEventListener("pointerdown", e => {
  if (e.target === el.sscrim) closeSettings();
});

el.setSparks?.addEventListener("change", e => {
  PREFS.sparks = e.target.checked;
  persistPrefs();
  sound.tick();
});

el.setSfx?.addEventListener("change", e => {
  PREFS.sfx = e.target.checked;
  SAVE.sfx = PREFS.sfx;
  persist();
  persistPrefs();
  sound.setEnabled(PREFS.sfx);
  paintSfx();
  sound.click();
});

el.setCursor?.addEventListener("change", e => {
  PREFS.cursor = e.target.checked;
  persistPrefs();
  applyCursorPref();
  sound.tick();
});

el.setMotion?.addEventListener("change", e => {
  PREFS.motion = e.target.checked;
  persistPrefs();
  sound.tick();
  if (FX) {
    gsap.globalTimeline.timeScale(PREFS.motion ? 1 : 100);
  }
});

/* ================= Leaving Virgil Safety Modal ================= */
let exitOpen = false;
let exitUrl = "";

function openExitModal(url, domain) {
  if (!el.exitScrim || !url) return;
  const realUrl = unwrapUrl(url);
  const safe = safeUrl(realUrl);
  if (!safe) { toast("Blocked an unsafe link"); return; }
  exitOpen = true;
  exitUrl = safe;

  let parsedDom = domain;
  if (!parsedDom || parsedDom.includes("google.com")) {
    try {
      parsedDom = new URL(safe).hostname.replace(/^www\./i, "");
    } catch (e) {
      parsedDom = "external-site";
    }
  }

  if (el.exitDomain) {
    el.exitDomain.innerHTML = `<i data-lucide="globe"></i> <b>${esc(parsedDom)}</b>`;
  }
  if (el.exitUrlText) {
    el.exitUrlText.textContent = safe;
  }
  if (el.exitProceed) {
    el.exitProceed.href = safe;
  }

  el.exitScrim.hidden = false;
  icons();

  const modal = el.exitScrim.querySelector(".exit-modal");
  if (FX && modal) {
    gsap.fromTo(el.exitScrim, { opacity: 0 }, { opacity: 1, duration: 0.28, clearProps: "opacity" });
    gsap.fromTo(modal, 
      { y: 22, opacity: 0, scale: 0.95 }, 
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "expo.out", clearProps: "transform,opacity" }
    );
  }
  el.exitProceed?.focus({ preventScroll: true });
}

function closeExitModal() {
  if (!el.exitScrim || !exitOpen) return;
  exitOpen = false;
  const modal = el.exitScrim.querySelector(".exit-modal");
  const done = () => {
    el.exitScrim.hidden = true;
  };
  if (FX && modal) {
    gsap.to(el.exitScrim, { opacity: 0, duration: 0.2, onComplete: done });
    gsap.to(modal, { y: 14, opacity: 0, scale: 0.96, duration: 0.2, ease: "power2.in" });
  } else {
    done();
  }
}

el.exitClose?.addEventListener("click", closeExitModal);
el.exitCancel?.addEventListener("click", closeExitModal);
el.exitProceed?.addEventListener("click", () => {
  setTimeout(closeExitModal, 300);
});
el.exitScrim?.addEventListener("pointerdown", e => {
  if (e.target === el.exitScrim) closeExitModal();
});
el.exitCopyBtn?.addEventListener("click", () => {
  if (!exitUrl) return;
  (navigator.clipboard ? navigator.clipboard.writeText(exitUrl) : Promise.reject()).then(() => {
    toast("Full destination URL copied");
    SAVE.copies++;
    persist();
    el.exitCopyBtn.innerHTML = ico("check");
    icons();
    el.exitCopyBtn.style.color = "var(--accent)";
    setTimeout(() => {
      el.exitCopyBtn.innerHTML = ico("copy");
      icons();
      el.exitCopyBtn.style.color = "";
    }, 1500);
  }, () => toast("Copy failed"));
});

/* Global Shortcuts & Results Navigation (j/k/Enter/c) */
addEventListener("keydown", e => {
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
  if (typing || tOpen || sOpen || exitOpen) {
    if (e.key === "Escape") {
      if (exitOpen) closeExitModal();
      if (sOpen) closeSettings();
      if (tOpen) closeThemes(false);
    } else if (e.key === "Enter" && exitOpen) {
      e.preventDefault();
      el.exitProceed?.click();
    }
    return;
  }

  if (e.key === "/" && !typing) {
    e.preventDefault();
    el.q.focus();
  } else if (e.key === "Escape") {
    togglePanel(false);
    closeSettings();
    closeExitModal();
    if (!tOpen) el.q.blur();
  } else if ((e.key === "t" || e.key === "T") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    openThemes();
  } else if ((e.key === "s" || e.key === "S") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    openSettings();
  } else if (e.key === "j" || e.key === "J") {
    if (el.res.children.length) {
      e.preventDefault();
      focusedIdx = Math.min(focusedIdx + 1, el.res.children.length - 1);
      updateFocusedResult();
      sound.tick();
    }
  } else if (e.key === "k" || e.key === "K") {
    if (el.res.children.length) {
      e.preventDefault();
      focusedIdx = Math.max(focusedIdx - 1, 0);
      updateFocusedResult();
      sound.tick();
    }
  } else if (e.key === "Enter" && focusedIdx >= 0) {
    const cur = el.res.children[focusedIdx];
    if (cur) {
      const a = cur.querySelector("h3 a");
      if (a) {
        e.preventDefault();
        openExitModal(a.href, cur.dataset.domain || "");
        unlock("looter");
      }
    }
  } else if ((e.key === "c" || e.key === "C") && focusedIdx >= 0) {
    const cur = el.res.children[focusedIdx];
    if (cur && cur.dataset.url) {
      e.preventDefault();
      (navigator.clipboard ? navigator.clipboard.writeText(cur.dataset.url) : Promise.reject()).then(() => {
        toast("Link copied");
        SAVE.copies++;
        persist();
        if (SAVE.copies >= 3) unlock("hoarder");
      }, () => toast("Copy failed"));
    }
  }
});

/* Konami Cheat Code */
const KON = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
let kp = [];
addEventListener("keydown", e => {
  kp.push(e.key.toLowerCase());
  kp = kp.slice(-10);
  if (kp.join() === KON.join()) {
    unlock("cheat");
    burst(window.innerWidth / 2, window.innerHeight / 2, 70);
    sound.ach();
    if (FX) gsap.fromTo(document.documentElement, { filter: "hue-rotate(0deg)" }, { filter: "hue-rotate(360deg)", duration: 2.6, ease: "power1.inOut", clearProps: "filter" });
  }
});

/* Click Sparks */
addEventListener("pointerdown", e => {
  if (e.target.closest("input")) return;
  burst(e.clientX, e.clientY, 6);
  sound.click();
}, { passive: true });

/* Custom Kinetic Reticle Cursor */
let hov = null;
addEventListener("pointerover", e => {
  const t = e.target.closest(".chip,.tab,.go,.ic,.more,.ib,.th");
  if (t && t !== hov) sound.tick();
  hov = t;
});

let cursorReady = false;
function setupCrosshair() {
  if (cursorReady || !FX || RM) return;
  cursorReady = true;
  document.documentElement.classList.add("fx");
  const ret = $("#ret");
  const dot = $("#dot");
  const tag = $("#ctag");
  if (!ret || !dot || !tag) return;

  gsap.set([ret, dot], { xPercent: -50, yPercent: -50 });
  const rx = gsap.quickTo(ret, "x", { duration: 0.3, ease: "power3" });
  const ry = gsap.quickTo(ret, "y", { duration: 0.3, ease: "power3" });
  const dx = gsap.quickTo(dot, "x", { duration: 0.05 });
  const dy = gsap.quickTo(dot, "y", { duration: 0.05 });
  const tx = gsap.quickTo(tag, "x", { duration: 0.25, ease: "power3" });
  const ty = gsap.quickTo(tag, "y", { duration: 0.25, ease: "power3" });
  let shown = false;
  let locked = false;

  addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    if (!shown) {
      shown = true;
      gsap.set([ret, dot], { x: e.clientX, y: e.clientY });
      gsap.to([ret, dot], { opacity: 1, duration: 0.4 });
    }
    rx(e.clientX);
    ry(e.clientY);
    dx(e.clientX);
    dy(e.clientY);
    tx(e.clientX + 26);
    ty(e.clientY + 22);
  }, { passive: true });

  addEventListener("pointerover", e => {
    if (e.pointerType === "touch") return;
    const t = e.target.closest("a,button,input,[data-cur]");
    const name = t && t.dataset.cur;
    locked = !!t;
    gsap.to(ret, { scale: t ? 0.6 : 1, rotate: t ? 45 : 0, duration: 0.6, ease: "expo.out" });
    gsap.to(dot, { scale: t ? 1.8 : 1, duration: 0.4, ease: "expo.out" });
    if (name) {
      tag.textContent = name;
      gsap.to(tag, { opacity: 1, duration: 0.2 });
    } else {
      gsap.to(tag, { opacity: 0, duration: 0.15 });
    }
  });

  addEventListener("pointerdown", e => {
    if (e.pointerType === "touch") return;
    gsap.to(ret, { scale: locked ? 0.4 : 0.72, duration: 0.12, ease: "power2.out" });
  });
  addEventListener("pointerup", e => {
    if (e.pointerType === "touch") return;
    gsap.to(ret, { scale: locked ? 0.6 : 1, duration: 0.7, ease: "elastic.out(1,.4)" });
  });
  document.documentElement.addEventListener("mouseleave", () => gsap.to([ret, dot, tag], { opacity: 0, duration: 0.25 }));
  document.documentElement.addEventListener("mouseenter", () => gsap.to([ret, dot], { opacity: 1, duration: 0.25 }));
}

if (FX && !RM && PREFS.cursor) {
  if (matchMedia("(hover:hover) and (pointer:fine)").matches || matchMedia("(pointer:fine)").matches) {
    setupCrosshair();
  } else {
    addEventListener("pointermove", function onMove(e) {
      if (e.pointerType !== "touch" && PREFS.cursor) {
        removeEventListener("pointermove", onMove);
        setupCrosshair();
      }
    }, { once: true, passive: true });
  }
}

/* Micro-Interactions */
if (FX) {
  const PRESS = ".go,.chip,.more,.ic,.tab,.ib,.trend-card,.hub-tag";
  let down = null;
  addEventListener("pointerdown", e => {
    const b = e.target.closest(PRESS);
    if (!b) return;
    down = b;
    gsap.to(b, { scale: 0.94, duration: 0.18, ease: "power2.out", overwrite: "auto" });
  });

  const up = () => {
    if (!down) return;
    gsap.to(down, { scale: 1, duration: 0.9, ease: "elastic.out(1,.4)", overwrite: "auto" });
    down = null;
  };

  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);

  el.form.addEventListener("focusin", () => gsap.to(el.form, { scale: 1.018, duration: 0.8, ease: "expo.out" }));
  el.form.addEventListener("focusout", () => gsap.to(el.form, { scale: 1, duration: 0.8, ease: "expo.out" }));

  const go = $(".go");
  if (matchMedia("(hover:hover)").matches && go) {
    go.addEventListener("pointermove", e => {
      const r = go.getBoundingClientRect();
      gsap.to(go, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.5, ease: "power3.out" });
    });
    go.addEventListener("pointerleave", () => gsap.to(go, { x: 0, y: 0, duration: 1, ease: "elastic.out(1,.35)" }));
  }
}

const nav = $("#nav");
let isNavScrolled = false;
function onNavScroll() {
  const scrolled = window.scrollY > 12;
  if (scrolled === isNavScrolled) return;
  isNavScrolled = scrolled;
  const mark = nav ? nav.querySelector(".mark") : null;

  if (FX) {
    if (scrolled) {
      nav.classList.add("scrolled");
      gsap.fromTo(nav, 
        { y: -6, scale: 0.98 }, 
        { y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)", overwrite: "auto" }
      );
      if (mark) {
        gsap.fromTo(mark,
          { y: 10, opacity: 0, filter: "blur(6px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out", overwrite: "auto" }
        );
      }
    } else {
      if (mark && !el.app.classList.contains("searching")) {
        gsap.to(mark, {
          y: 8,
          opacity: 0,
          filter: "blur(4px)",
          duration: 0.35,
          ease: "power2.in",
          overwrite: "auto"
        });
      }
      gsap.to(nav, { 
        y: 0, 
        scale: 1, 
        duration: 0.4, 
        ease: "power3.out", 
        overwrite: "auto",
        onComplete: () => nav.classList.remove("scrolled")
      });
    }
  } else {
    nav.classList.toggle("scrolled", scrolled);
  }
}
addEventListener("scroll", onNavScroll, { passive: true });
onNavScroll();
addEventListener("resize", () => moveInd(false));

/* Browser History & Back/Forward Navigation */
window.addEventListener("popstate", () => {
  const p = new URLSearchParams(window.location.search);
  const qP = p.get("q");
  const catP = p.get("cat") || p.get("engine");

  if (catP && CONFIG.categories[catP] && catP !== cat) {
    cat = catP;
    document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.cat === cat));
    moveInd(false);
    renderCat();
  }

  if (qP) {
    el.q.value = qP;
    scoreNext = true;
    run(qP, true, false);
  } else {
    closeSbox();
    setSearching(false);
    el.res.innerHTML = "";
    el.state.innerHTML = "";
    el.meta.textContent = "";
    el.more.hidden = true;
    el.q.value = "";
    lastQ = "";
    el.idhint.classList.remove("on");
    focusedIdx = -1;
    updateSeoMetadata("");
    renderHomeHub();
  }
});

/* App Initialization */
const FOOTER_QUOTES = [
  "Parth was here. The map is yours.",
  "You’re welcome, traveler."
];
const quoteEl = $("#footerQuote");
if (quoteEl && !quoteEl.dataset.set) {
  let lastIdx = -1;
  try {
    lastIdx = parseInt(sessionStorage.getItem("bonfire:last_quote") ?? "-1", 10);
  } catch (e) {}
  const nextIdx = (lastIdx === 0) ? 1 : (lastIdx === 1) ? 0 : (Math.random() < 0.5 ? 0 : 1);
  try {
    sessionStorage.setItem("bonfire:last_quote", String(nextIdx));
  } catch (e) {}
  quoteEl.innerHTML = `<em>“${esc(FOOTER_QUOTES[nextIdx])}”</em>`;
  quoteEl.dataset.set = "true";
}

renderCat();
renderAch();
renderHomeHub();
syncPrefsUI();
icons();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => moveInd(false));
}
intro();

// Check for URL query params on load
const urlParams = new URLSearchParams(window.location.search);
const engineParam = urlParams.get('cat') || urlParams.get('engine');
const queryParam = urlParams.get('q');

if (engineParam && CONFIG.categories[engineParam]) {
  const targetTab = document.querySelector(`.tab[data-cat="${engineParam}"]`);
  if (targetTab) targetTab.click();
}

if (queryParam) {
  el.q.value = queryParam;
  scoreNext = true;
  run(queryParam, true, false);
}
})();
