// CardPress – photo card maker. Offline: photos stay on this PC.
'use strict';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400000;
// ---------- storage ----------
let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => { const r = indexedDB.open('cardpress', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  return dbp;
}
async function dbGet(k) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
async function dbSet(k, v) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); }

// ---------- Pro (Microsoft Store add-on via Digital Goods API) + one-time trial ----------
const STORE_BILLING = 'https://store.microsoft.com/billing';
const PRO_SKU = 'cardpress_pro';
const PRO_IDS = [PRO_SKU];
let STORE_URL = 'https://apps.microsoft.com/detail/9NWPW90G6DV1';
let proAvailable = false, proSku = PRO_SKU, isPro = false;
proAvailable = true; // owner's rule: Pro is never free – free limits apply everywhere (website, Store, offline) until Pro is bought
// saved Pro flag: the website never trusts it (web visitors cannot buy there); the Store app trusts it for 30 days after the Store last confirmed the purchase
const HAS_STORE = typeof window !== 'undefined' && 'getDigitalGoodsService' in window, PRO_OK_DAYS = 30;
function cachedPro() {
  try {
    if (!HAS_STORE || localStorage.getItem('cardpress-pro') !== '1') return false;
    const ok = localStorage.getItem('cardpress-pro-ok'), now = Date.now();
    if (ok === null) { localStorage.setItem('cardpress-pro-ok', String(now)); return true; } // saved by an older version: counts as confirmed now, once
    const t = Number(ok);
    return t > 0 && t <= now + 86400000 && now - t < PRO_OK_DAYS * 86400000; // a date in the future or garbage is not trusted
  } catch (_) { return false; }
}
function storePro(owned) { // only when the Store really answered
  try { if (owned) { localStorage.setItem('cardpress-pro', '1'); localStorage.setItem('cardpress-pro-ok', String(Date.now())); } else { localStorage.removeItem('cardpress-pro'); localStorage.removeItem('cardpress-pro-ok'); } } catch (_) {}
}
isPro = cachedPro();
const TRIAL_DAYS = 7;
let trialStart = 0;
// a trial start in the future, NaN or garbage counts as an ended trial; of the two saved copies the earlier wins,
// so clearing or rewriting only one of them never restarts the trial
const trialVal = (v) => { if (v == null || v === '' || v === 0) return 0; const n = Number(v); return n > 0 && n <= Date.now() + DAY ? n : 1; };
const firstTrial = (a, b) => (a && b ? Math.min(a, b) : a || b);
try { trialStart = trialVal(localStorage.getItem('cardpress-trial')); } catch (_) {}
const trialLeft = () => (trialStart && trialStart < Date.now() + DAY ? Math.max(0, Math.min(TRIAL_DAYS, Math.ceil((trialStart + TRIAL_DAYS * DAY - Date.now()) / DAY))) : 0); // a start date in the future (clock changed) does not extend the trial
const trialActive = () => trialLeft() > 0;
const unlocked = () => isPro || !proAvailable || trialActive();
async function loadTrial() {
  const t = await dbGet('trial').catch(() => 0);
  trialStart = firstTrial(trialStart, trialVal(t));
  if (trialStart) { try { localStorage.setItem('cardpress-trial', String(trialStart)); } catch (_) {} dbSet('trial', trialStart).catch(() => {}); }
}
async function startTrial() {
  await loadTrial(); // the IndexedDB copy counts too
  if (trialStart) { openPro(''); return; }
  trialStart = Date.now();
  try { localStorage.setItem('cardpress-trial', String(trialStart)); } catch (_) {}
  await dbSet('trial', trialStart).catch(() => {});
  setPro(isPro); $('proDialog').close(); toast(`★ Every Pro feature is unlocked for ${TRIAL_DAYS} days. Happy card making!`);
}
function proLabel() { return isPro ? '★ Pro' : trialActive() ? `★ Pro trial · ${trialLeft()} day${trialLeft() === 1 ? '' : 's'} left` : '★ Get Pro'; }
async function billing() {
  if (!('getDigitalGoodsService' in window)) return null;
  try { return await window.getDigitalGoodsService(STORE_BILLING); } catch (_) { return null; }
}
function setPro(v) {
  isPro = v;
  const b = $('proBtn');
  b.textContent = proLabel();
  b.classList.toggle('is-pro', v || trialActive());
  b.hidden = !proAvailable && !v;
  if (booted) render();
}
async function checkProAfterBuy() {
  for (let i = 0; i < 6; i++) {
    if (await checkPro()) return true;
    await new Promise((r) => setTimeout(r, 1500));
  }
  proMessage('Thank you! If Pro is not unlocked within a minute, click “Restore purchase”.');
  return false;
}
async function checkPro() {
  const svc = await billing();
  if (!svc) return false;
  try {
    const details = await svc.getDetails(PRO_IDS).catch(() => []);
    if (details[0]) { proSku = details[0].itemId; if (!PRO_IDS.includes(proSku)) PRO_IDS.push(proSku); }
    const list = await svc.listPurchases();
    const owned = list.some((p) => PRO_IDS.includes(p.itemId));
    if (owned || details.length) { storePro(owned); setPro(owned); return owned; }
    setPro(isPro); // Store did not answer (offline): keep what we knew
    return isPro;
  } catch (_) { return isPro; }
}
function proMessage(text) { const m = $('proMsg'); m.hidden = !text; m.textContent = text || ''; }
async function openPro(reason) {
  if (!reason && !isPro && trialStart && !trialActive()) reason = 'Your free Pro trial has ended. Your cards stay yours – unlock Pro to keep using the Pro tools.';
  proMessage(reason || '');
  $('trialBtn').hidden = isPro || !!trialStart;
  $('trialInfo').hidden = !trialActive() || isPro; $('trialInfo').textContent = trialActive() ? `You are trying Pro: ${trialLeft()} day${trialLeft() === 1 ? '' : 's'} left.` : '';
  const svc = await billing();
  if (!svc) { $('buyBtn').textContent = 'Get CardPress on Microsoft Store'; $('restoreBtn').hidden = true; }
  else {
    $('restoreBtn').hidden = false;
    try {
      const [d] = await svc.getDetails([proSku]);
      if (!d) proMessage((reason ? reason + ' ' : '') + 'Pro is being added to the Microsoft Store and will be on sale very soon – please check again in a day or two.');
      const price = d && d.price ? new Intl.NumberFormat(undefined, { style: 'currency', currency: d.price.currency }).format(Number(d.price.value)) : '';
      $('buyBtn').textContent = price ? `Unlock Pro – ${price}` : 'Unlock Pro';
    } catch (_) { $('buyBtn').textContent = 'Unlock Pro'; }
  }
  if (!$('proDialog').open) $('proDialog').showModal();
}
async function buyPro() {
  const svc = await billing();
  if (!svc) { window.open(STORE_URL, '_blank'); return; }
  const methods = [{ supportedMethods: STORE_BILLING, data: { sku: proSku } }];
  try {
    let req;
    try { req = new PaymentRequest(methods); } catch (_) { req = new PaymentRequest(methods, { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } }); }
    const res = await req.show();
    await res.complete('success');
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    proMessage('Purchase could not be completed: ' + (e.message || e));
    return;
  }
  if (await checkProAfterBuy()) { proMessage('Thank you! Pro is unlocked. ★'); setTimeout(() => $('proDialog').close(), 1500); }
}
const needsPro = (why) => { if (unlocked()) return false; openPro(why); return true; };

// ---------- limits & formats ----------
const FREE_PROJECTS = 2;
const FREE_PEOPLE = 15;
const FORMATS = {
  f75: { name: 'Flat card 7 × 5 in (2 per sheet)', w: 504, h: 360 },
  f57: { name: 'Flat card 5 × 7 in, upright (2 per sheet)', w: 360, h: 504 },
  sq: { name: 'Square card 5 × 5 in (2 per sheet) ★', w: 360, h: 360, pro: true },
  post: { name: 'Postcard 6 × 4 in with address side ★', w: 432, h: 288, pro: true },
  fold: { name: 'Folded card – half a sheet, message inside ★', w: 396, h: 612, pro: true, fold: true },
};
const LAYOUTS = {
  full: { name: 'Big photo', n: 1 }, split: { name: 'Photo + words', n: 1 }, frame: { name: 'Framed photo', n: 1 }, text: { name: 'Words only', n: 0 },
  duo: { name: '2 photos', n: 2, pro: true }, trio: { name: '3 photos', n: 3, pro: true }, quad: { name: '4 photos', n: 4, pro: true }, six: { name: '6 photos', n: 6, pro: true },
};
const PAGES = { letter: { name: 'letter', w: 612, h: 792 }, a4: { name: 'A4', w: 595, h: 842 } };
const LABELS = {
  5160: { name: 'Avery 5160', page: 'letter', cols: 3, rows: 10, w: 189, h: 72, top: 36, left: 13.5, px: 198, py: 72 },
  5163: { name: 'Avery 5163', page: 'letter', cols: 2, rows: 5, w: 288, h: 144, top: 36, left: 11.25, px: 301.5, py: 144 },
  l7160: { name: 'Avery L7160', page: 'a4', cols: 3, rows: 7, w: 180, h: 108, top: 42.9, left: 20.4, px: 187.1, py: 108 },
};

// ---------- state ----------
let booted = false;
let st = { projects: [], cur: '', people: [], retAddr: '', labelSheet: '5160' };
let view = 'front', curFrame = 0, side = 'design', pSearch = '', editPerson = null;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function newCard(occ) {
  const o = OCCASIONS[occ || 'christmas'];
  return { id: uid(), title: o.name + ' card', occ: occ || 'christmas', theme: o.themes[0], format: 'f75', paper: 'letter', font: 'script', lay: 'split', greet: greetsOf(o)[0], greetOwn: '', msg: o.msg, sign: 'Love, The Nguyen Family', showYear: true, year: yearFor(occ || 'christmas'), photos: [], inGreet: '', inMsg: o.inside, backOn: false, backText: '', backPhoto: true, personal: false, copies: 2 };
}
const greetsOf = (o) => (typeof o.greets === 'function' ? o.greets() : o.greets);
const card = () => st.projects.find((p) => p.id === st.cur) || st.projects[0];
const occ = (c) => OCCASIONS[(c || card()).occ] || OCCASIONS.christmas;
const themeOf = (c) => { const o = occ(c); return THEMES[o.themes.includes(c.theme) ? c.theme : o.themes[0]]; };
const fontOf = (c) => FONTS[c.font] || FONTS.script;
const fmt = (c) => FORMATS[c.format] || FORMATS.f75;
const lay = (c) => LAYOUTS[c.lay] || LAYOUTS.split;
const themePro = (c) => occ(c).themes.indexOf(c.theme) > 0; // the first design of every occasion is free
function normalize(c) {
  const b = newCard(c && c.occ && OCCASIONS[c.occ] ? c.occ : 'christmas');
  const o = Object.assign(b, c || {});
  if (!OCCASIONS[o.occ]) o.occ = 'christmas';
  if (!occ(o).themes.includes(o.theme)) o.theme = occ(o).themes[0];
  if (!FORMATS[o.format]) o.format = 'f75';
  if (!LAYOUTS[o.lay]) o.lay = 'split';
  if (!FONTS[o.font]) o.font = 'script';
  if (!PAGES[o.paper]) o.paper = 'letter';
  ['title', 'greet', 'greetOwn', 'msg', 'sign', 'inGreet', 'inMsg', 'backText'].forEach((k) => { o[k] = String(o[k] == null ? '' : o[k]).slice(0, 1500); });
  o.year = Math.min(2200, Math.max(1900, parseInt(o.year, 10) || nextYear()));
  o.copies = Math.min(500, Math.max(1, parseInt(o.copies, 10) || 2));
  o.photos = (Array.isArray(o.photos) ? o.photos : []).slice(0, 6).map((p) => (p && typeof p.url === 'string' && /^data:image\//.test(p.url) ? { url: p.url, ar: Number(p.ar) || 1.5, x: clamp01(p.x, 0.5), y: clamp01(p.y, 0.5), z: Math.min(3, Math.max(1, Number(p.z) || 1)) } : null));
  return o;
}
const clamp01 = (v, d) => (v == null || !isFinite(v) ? d : Math.max(0, Math.min(1, Number(v))));
const yearFor = (k) => (k === 'newyear' || k === 'tet' ? nextYear() : new Date().getFullYear());
function normPerson(p) { return { id: String((p && p.id) || uid()), name: String((p && p.name) || '').slice(0, 60), addr: String((p && p.addr) || '').slice(0, 240), send: p ? p.send !== false : true, got: !!(p && p.got) }; }
let saveT = null;
function save() { clearTimeout(saveT); saveT = setTimeout(() => dbSet('state', st).catch(() => toast('Could not save – your disk may be full')), 250); }
window.addEventListener('pagehide', () => { if (saveT) { clearTimeout(saveT); dbSet('state', st).catch(() => {}); } });
function toast(t, ms) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), ms || 3500); }

// ---------- what needs Pro ----------
function proReasons(c, forPrint) {
  const r = [];
  if (themePro(c)) r.push(`the “${themeOf(c).name}” design (the free version includes the first design of each occasion)`);
  if (lay(c).pro) r.push(`the ${lay(c).name.toLowerCase()} collage`);
  if (fmt(c).pro) r.push(fmt(c).name.replace(' ★', '').toLowerCase());
  if (forPrint && c.backOn && !fmt(c).fold) r.push('the back side');
  if (forPrint && c.personal) r.push('personal “Dear …” cards');
  return r;
}
function proGate(c, forPrint, what) {
  if (unlocked()) return false;
  if (st.projects.indexOf(c) >= FREE_PROJECTS) { openPro(`You have ${st.projects.length} cards – the free version holds ${FREE_PROJECTS}. Your cards are kept safe; unlock Pro to ${what || 'print'} this one, or delete cards you don't need (your first ${FREE_PROJECTS} cards print for free).`); return true; }
  const r = proReasons(c, forPrint);
  if (!r.length) return false;
  openPro(`This card uses ${r.join(', ')} – part of CardPress Pro. Pick free options (marked without ★) to ${what || 'print'} for free.`);
  return true;
}

function freeSettings(p) { // free defaults for a card that uses Pro-only settings (words and photos are kept)
  p.theme = occ(p).themes[0];
  if (lay(p).pro) p.lay = 'full';
  if (fmt(p).pro) p.format = fmt(p).w > fmt(p).h ? 'f75' : 'f57';
  p.backOn = false; p.personal = false;
}

// ---------- drawing helpers ----------
const isDark = (hex) => { const n = parseInt(String(hex).slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 < 128; };
let mctx = null;
const textW = (text, fam, bold) => { if (!mctx) mctx = document.createElement('canvas').getContext('2d'); mctx.font = `${bold ? '700 ' : ''}100px ${fam}`; return mctx.measureText(String(text)).width / 100; };
// biggest font size (up to base) that fits maxW – measured with the real font when it is given, else estimated
const fitFont = (text, maxW, base, ratio, fam, bold) => Math.min(base, maxW / Math.max(0.01, fam ? textW(text, fam, bold) : String(text).length * ratio));
function wrap(text, maxW, fs, ratio, maxLines) {
  const out = [];
  String(text || '').split(/\n/).forEach((para) => {
    const words = para.split(/\s+/).filter(Boolean); let cur = '';
    if (!words.length) { out.push(''); return; }
    words.forEach((wd) => { if ((cur + ' ' + wd).trim().length * fs * ratio > maxW && cur) { out.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); });
    if (cur) out.push(cur);
  });
  while (out.length && out[out.length - 1] === '') out.pop();
  if (maxLines && out.length > maxLines) { const cut = out.slice(0, maxLines); cut[maxLines - 1] = cut[maxLines - 1].replace(/\s*\S*$/, '') + '…'; return cut; }
  return out;
}
const greetText = (c) => { const g = c.greet === '__own' ? (c.greetOwn || '') : c.greet; return fontOf(c).upper ? g.toUpperCase() : g; };
function photoBox(p, x, y, w, h) {
  const ar = p.ar || 1.5, z = p.z || 1; let dw, dh;
  if (ar > w / h) { dh = h; dw = h * ar; } else { dw = w; dh = w / ar; }
  dw *= z; dh *= z;
  return { x: x - (dw - w) * (p.x == null ? 0.5 : p.x), y: y - (dh - h) * (p.y == null ? 0.5 : p.y), w: dw, h: dh };
}
function gridFrames(n, x, y, w, h, g) {
  const land = w >= h;
  if (n === 2) return land ? [[x, y, (w - g) / 2, h], [x + (w + g) / 2, y, (w - g) / 2, h]] : [[x, y, w, (h - g) / 2], [x, y + (h + g) / 2, w, (h - g) / 2]];
  if (n === 3) { if (land) { const bw = (w - g) * 0.6, sw = w - g - bw, hh = (h - g) / 2; return [[x, y, bw, h], [x + bw + g, y, sw, hh], [x + bw + g, y + hh + g, sw, hh]]; } const bh = (h - g) * 0.6, sh = h - g - bh, hw = (w - g) / 2; return [[x, y, w, bh], [x, y + bh + g, hw, sh], [x + hw + g, y + bh + g, hw, sh]]; }
  if (n === 4) { const hw = (w - g) / 2, hh = (h - g) / 2; return [[x, y, hw, hh], [x + hw + g, y, hw, hh], [x, y + hh + g, hw, hh], [x + hw + g, y + hh + g, hw, hh]]; }
  if (n === 6) { const cols = land ? 3 : 2, rows = land ? 2 : 3, cw = (w - g * (cols - 1)) / cols, rh = (h - g * (rows - 1)) / rows, out = []; for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) out.push([x + k * (cw + g), y + r * (rh + g), cw, rh]); return out; }
  return [[x, y, w, h]];
}
function placeholder(T, x, y, w, h, j, screen) {
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.soft}" opacity=".18"/>`;
  if (screen) s += `<rect class="photoAdd" data-j="${j}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="transparent" stroke="${T.soft}" stroke-dasharray="6 5" style="cursor:pointer"/><text x="${f1(x + w / 2)}" y="${f1(y + h / 2 + 5)}" text-anchor="middle" font-size="${f1(Math.min(15, w / 9))}" fill="${isDark(T.bg) ? '#fff' : T.ink}" font-family="Segoe UI, sans-serif" pointer-events="none">+ Add a photo</text>`;
  return s;
}
function photosSvg(c, T, rects, screen, uidp, rounded) {
  let s = '';
  rects.forEach(([fx, fy, fw, fh], j) => {
    const p = c.photos[j];
    if (p) {
      const b = photoBox(p, fx, fy, fw, fh), id = `pc${uidp}_${j}`;
      s += `<clipPath id="${id}"><rect x="${f1(fx)}" y="${f1(fy)}" width="${f1(fw)}" height="${f1(fh)}"${rounded ? ` rx="${f1(rounded)}"` : ''}/></clipPath><image href="${esc(p.url)}" x="${f1(b.x)}" y="${f1(b.y)}" width="${f1(b.w)}" height="${f1(b.h)}" preserveAspectRatio="none" clip-path="url(#${id})"/>`;
      if (screen) s += `<rect class="photoHit" data-j="${j}" x="${f1(fx)}" y="${f1(fy)}" width="${f1(fw)}" height="${f1(fh)}" fill="transparent" style="cursor:move"/>`;
    } else s += placeholder(T, fx, fy, fw, fh, j, screen);
    if (screen && rects.length > 1 && j === curFrame) s += `<rect x="${f1(fx + 1.5)}" y="${f1(fy + 1.5)}" width="${f1(fw - 3)}" height="${f1(fh - 3)}" fill="none" stroke="#2563eb" stroke-width="3" pointer-events="none"/>`;
  });
  return s;
}
// greeting, line, message, signature and year centred in a box; "compact" for narrow bands under photos
function wordsSvg(c, T, F, x, y, w, h, opt) {
  opt = opt || {};
  const ink = opt.ink || T.ink, sc = Math.min(w, h * 1.6) / 300, cx = x + w / 2;
  const greet = greetText(c), parts = [];
  const gMax = (opt.compact ? 34 : 40) * Math.max(0.6, Math.min(1.6, h / 180));
  let gfs = fitFont(greet, w * 0.88, gMax, F.ratio, F.head, F.bold), glines = [greet];
  if (gfs < gMax * 0.62 && greet.split(' ').length > 1) { const wds = greet.split(' '), half = Math.ceil(wds.length / 2); glines = [wds.slice(0, half).join(' '), wds.slice(half).join(' ')]; gfs = Math.min(gMax, ...glines.map((g) => fitFont(g, w * 0.88, gMax, F.ratio, F.head, F.bold))); }
  if (opt.dear) parts.push({ t: opt.dear, fs: fitFont(opt.dear, w * 0.9, 12 * sc + 2, 0.5, F.body), fam: F.body, it: true });
  glines.forEach((g) => parts.push({ t: g, fs: gfs, fam: F.head, bold: F.bold, gap: 1.08 }));
  const body = Math.max(9, Math.min(14, 11.5 * sc + 1.5));
  if (!opt.compact || h > 150) {
    if (c.msg) { parts.push({ line: true }); wrap(c.msg, w * 0.82, body, 0.5, opt.compact ? 2 : 3).forEach((l) => parts.push({ t: l, fs: body, fam: F.body, it: F.italic !== false })); }
  }
  const sub = opt.compact ? [c.sign, c.showYear ? c.year : ''].filter(Boolean).join('  ·  ') : c.sign;
  if (sub) parts.push({ t: sub, fs: fitFont(sub, w * 0.86, (opt.compact ? 13 : 15) * Math.max(0.8, sc), 0.5, opt.compact ? F.body : F.head), fam: opt.compact ? F.body : F.head, gapBefore: 0.6 });
  if (!opt.compact && c.showYear) parts.push({ t: String(c.year), fs: 10 * Math.max(0.8, sc), fam: F.body, spacing: 2, soft: true });
  let lineH = 14 * sc;
  const hOf = (p) => (p.line ? lineH : p.fs * (p.gap || 1.32) + (p.gapBefore ? p.fs * p.gapBefore : 0));
  let total = parts.reduce((a, p) => a + hOf(p), 0);
  if (total > h - 8) { const k = (h - 8) / total; parts.forEach((p) => { if (p.fs) p.fs *= k; }); lineH *= k; total = h - 8; } // too much for the box: shrink it all a little
  let yy = y + Math.max(4, (h - total) / 2), s = '';
  parts.forEach((p) => {
    if (p.line) { s += `<line x1="${f1(cx - w * 0.16)}" y1="${f1(yy + lineH * 0.43)}" x2="${f1(cx + w * 0.16)}" y2="${f1(yy + lineH * 0.43)}" stroke="${T.soft}" stroke-width="${f1(1.2 * Math.max(0.8, sc))}"/>`; yy += hOf(p); return; }
    if (p.gapBefore) yy += p.fs * p.gapBefore;
    yy += p.fs * 0.95;
    s += `<text x="${f1(cx)}" y="${f1(yy)}" text-anchor="middle" font-size="${f1(p.fs)}" font-family="${esc(p.fam)}"${p.bold ? ' font-weight="700"' : ''}${p.it ? ' font-style="italic"' : ''}${p.spacing ? ` letter-spacing="${p.spacing}"` : ''} fill="${p.soft ? T.soft : ink}">${esc(p.t)}</text>`;
    yy += p.fs * ((p.gap || 1.32) - 0.95);
  });
  return s;
}
function clipDeco(T, x, y, w, h, sc, id) { return `<clipPath id="${id}"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/></clipPath><g clip-path="url(#${id})">${decorations(T, x, y, w, h, sc)}</g>`; }
// ---------- card faces ----------
function frontSvg(c, x, y, w, h, opt) {
  opt = opt || {};
  const T = themeOf(c), F = fontOf(c), L = lay(c), land = w > h * 1.05, sc = Math.min(w, h) / 360, u = opt.uid || 'f', g = 5 * sc;
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${T.bg}"/>`;
  const dear = opt.dear;
  if (c.lay === 'full' || L.n > 1) {
    const bandH = h * (land ? 0.32 : 0.27), ph = h - bandH;
    const rects = L.n > 1 ? gridFrames(L.n, x + g, y + g, w - 2 * g, ph - g * 1.5, g) : [[x, y, w, ph + bandH * 0.18]];
    s += photosSvg(c, T, rects, opt.screen, u);
    const by = y + ph;
    s += `<rect x="${f1(x)}" y="${f1(by)}" width="${f1(w)}" height="${f1(bandH)}" fill="${T.bg}"${L.n > 1 ? '' : ' opacity=".93"'}/>` + clipDeco(T, x, by, w, bandH, sc * 0.75, 'd' + u);
    s += wordsSvg(c, T, F, x + w * 0.06, by, w * 0.88, bandH, { compact: true, dear });
  } else if (c.lay === 'split') {
    if (land) { const pw = w * 0.56; s += photosSvg(c, T, [[x, y, pw, h]], opt.screen, u) + clipDeco(T, x + pw, y, w - pw, h, sc, 'd' + u) + wordsSvg(c, T, F, x + pw, y, w - pw, h, { dear }); }
    else { const ph = h * 0.58; s += photosSvg(c, T, [[x, y, w, ph]], opt.screen, u) + clipDeco(T, x, y + ph, w, h - ph, sc, 'd' + u) + wordsSvg(c, T, F, x, y + ph, w, h - ph, { dear }); }
  } else if (c.lay === 'frame') {
    s += decorations(T, x, y, w, h, sc);
    const m = 16 * sc, bw = 6 * sc;
    if (land) { const fw = w * 0.5, fh = h - 2 * m - 2 * bw; s += `<rect x="${f1(x + m)}" y="${f1(y + m)}" width="${f1(fw + 2 * bw)}" height="${f1(fh + 2 * bw)}" fill="#fff"/>` + photosSvg(c, T, [[x + m + bw, y + m + bw, fw, fh]], opt.screen, u) + wordsSvg(c, T, F, x + m * 2 + fw + 2 * bw, y, w - (m * 3 + fw + 2 * bw), h, { dear }); }
    else { const fw = w - 2 * m - 2 * bw, fh = h * 0.5; s += `<rect x="${f1(x + m)}" y="${f1(y + m)}" width="${f1(fw + 2 * bw)}" height="${f1(fh + 2 * bw)}" fill="#fff"/>` + photosSvg(c, T, [[x + m + bw, y + m + bw, fw, fh]], opt.screen, u) + wordsSvg(c, T, F, x + m, y + m + fh + 2 * bw, w - 2 * m, h - (m + fh + 2 * bw), { dear }); }
  } else { // words only
    s += decorations(T, x, y, w, h, sc * 1.2) + wordsSvg(c, T, F, x + w * 0.1, y + h * 0.12, w * 0.8, h * 0.76, { dear });
  }
  return s;
}
function backSvg(c, x, y, w, h, opt) { // flat cards: family news / letter, optional small photo
  opt = opt || {};
  const T = themeOf(c), F = fontOf(c), sc = Math.min(w, h) / 360, ink = isDark(T.bg) ? T.bg : T.ink, u = opt.uid || 'b';
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#fff"/><rect x="${f1(x + 7 * sc)}" y="${f1(y + 7 * sc)}" width="${f1(w - 14 * sc)}" height="${f1(h - 14 * sc)}" fill="none" stroke="${T.soft}" stroke-width="${f1(1.4 * sc)}"/>`;
  let tx = x + 26 * sc, tw = w - 52 * sc;
  const p = c.backPhoto && c.photos[0];
  if (p) { const pw = Math.min(w, h) * 0.42, ph = pw / Math.max(0.6, Math.min(1.8, p.ar || 1.4)); s += photosSvg(Object.assign({}, c, { photos: [p] }), T, [[x + w - 26 * sc - pw, y + 26 * sc, pw, ph]], false, u, 6 * sc); tw -= pw + 14 * sc; }
  const fs = Math.max(8.5, Math.min(12.5, 10.5 * sc)), lines = [];
  if (opt.dear) lines.push({ t: opt.dear, head: true });
  wrap(c.backText || c.msg, tw, fs, 0.5).forEach((l) => lines.push({ t: l }));
  let yy = y + 34 * sc + fs, out = '';
  const maxY = y + h - 44 * sc;
  for (const l of lines) { if (yy > maxY) break; out += `<text x="${f1(tx)}" y="${f1(yy)}" font-size="${f1(l.head ? fs * 1.35 : fs)}" font-family="${esc(l.head ? F.head : F.body)}" fill="${ink}">${esc(l.t)}</text>`; yy += l.head ? fs * 2 : fs * 1.45; }
  s += out;
  const sign = c.sign + (c.showYear ? '  ·  ' + c.year : '');
  s += `<text x="${f1(x + w - 26 * sc)}" y="${f1(y + h - 24 * sc)}" text-anchor="end" font-size="${f1(fitFont(sign, w - 52 * sc, fs * 1.25, 0.5, F.head))}" font-family="${esc(F.head)}" fill="${ink}">${esc(sign)}</text>`;
  return s;
}
function postBackSvg(c, x, y, w, h, opt) { // postcard: message left, stamp and address right
  opt = opt || {};
  const T = themeOf(c), F = fontOf(c), sc = Math.min(w, h) / 288, ink = isDark(T.bg) ? T.bg : T.ink, mid = x + w * 0.55;
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#fff"/><line x1="${f1(mid)}" y1="${f1(y + 20 * sc)}" x2="${f1(mid)}" y2="${f1(y + h - 20 * sc)}" stroke="#d6d3d1" stroke-width="1"/>`;
  s += `<rect x="${f1(x + w - 64 * sc)}" y="${f1(y + 16 * sc)}" width="${f1(46 * sc)}" height="${f1(54 * sc)}" fill="none" stroke="#a8a29e" stroke-dasharray="3 2"/><text x="${f1(x + w - 41 * sc)}" y="${f1(y + 47 * sc)}" text-anchor="middle" font-size="${f1(7 * sc)}" fill="#a8a29e" font-family="Segoe UI, sans-serif">STAMP</text>`;
  const fs = Math.max(8, 9.5 * sc); let yy = y + 30 * sc;
  if (opt.dear) { s += `<text x="${f1(x + 18 * sc)}" y="${f1(yy)}" font-size="${f1(fs * 1.4)}" font-family="${esc(F.head)}" fill="${ink}">${esc(opt.dear)}</text>`; yy += fs * 2; }
  wrap(c.backText || c.msg, w * 0.55 - 36 * sc, fs, 0.5, 11).forEach((l) => { s += `<text x="${f1(x + 18 * sc)}" y="${f1(yy)}" font-size="${f1(fs)}" font-family="${esc(F.body)}" fill="${ink}">${esc(l)}</text>`; yy += fs * 1.4; });
  s += `<text x="${f1(x + 18 * sc)}" y="${f1(y + h - 22 * sc)}" font-size="${f1(fitFont(c.sign, w * 0.55 - 36 * sc, fs * 1.2, 0.5, F.head))}" font-family="${esc(F.head)}" fill="${ink}">${esc(c.sign)}</text>`;
  const addr = String(opt.addr || '').split(/\n/).filter(Boolean).slice(0, 5);
  for (let k = 0; k < 4; k++) { const ly = y + h * 0.5 + k * 22 * sc; s += `<line x1="${f1(mid + 16 * sc)}" y1="${f1(ly)}" x2="${f1(x + w - 16 * sc)}" y2="${f1(ly)}" stroke="#d6d3d1" stroke-width=".8"/>`; if (addr[k]) s += `<text x="${f1(mid + 18 * sc)}" y="${f1(ly - 4 * sc)}" font-size="${f1(fitFont(addr[k], w * 0.45 - 34 * sc, fs * 1.05, 0.52, 'Segoe UI, Arial, sans-serif'))}" font-family="Segoe UI, Arial, sans-serif" fill="#1c1917">${esc(addr[k])}</text>`; }
  return s;
}
function insideRightSvg(c, x, y, w, h, opt) {
  opt = opt || {};
  const T = themeOf(c), F = fontOf(c), sc = Math.min(w, h) / 396, ink = isDark(T.bg) ? T.bg : T.ink;
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#fff"/>`;
  const T2 = Object.assign({}, T, { soft: T.soft });
  s += `<g opacity=".55">${decorations(T2, x, y, w, h * 0.22, sc * 0.8)}</g>`;
  const cx = x + w / 2; let yy = y + h * 0.3;
  if (opt.dear) { s += `<text x="${f1(cx)}" y="${f1(yy)}" text-anchor="middle" font-size="${f1(18 * sc)}" font-family="${esc(F.head)}" fill="${ink}">${esc(opt.dear)}</text>`; yy += 34 * sc; }
  if (c.inGreet) { const fs = fitFont(F.upper ? c.inGreet.toUpperCase() : c.inGreet, w * 0.8, 26 * sc, F.ratio, F.head, F.bold); s += `<text x="${f1(cx)}" y="${f1(yy)}" text-anchor="middle" font-size="${f1(fs)}" font-family="${esc(F.head)}"${F.bold ? ' font-weight="700"' : ''} fill="${ink}">${esc(F.upper ? c.inGreet.toUpperCase() : c.inGreet)}</text>`; yy += fs * 1.6; }
  const fs = 12.5 * sc;
  wrap(c.inMsg, w * 0.74, fs, 0.5, 16).forEach((l) => { s += `<text x="${f1(cx)}" y="${f1(yy)}" text-anchor="middle" font-size="${f1(fs)}" font-family="${esc(F.body)}" font-style="italic" fill="${ink}">${esc(l)}</text>`; yy += fs * 1.55; });
  s += `<text x="${f1(cx)}" y="${f1(Math.max(yy + 30 * sc, y + h * 0.78))}" text-anchor="middle" font-size="${f1(fitFont(c.sign, w * 0.8, 17 * sc, 0.5, F.head))}" font-family="${esc(F.head)}" fill="${ink}">${esc(c.sign)}</text>`;
  return s;
}
function foldBackSvg(c, x, y, w, h) { const T = themeOf(c), F = fontOf(c), sc = Math.min(w, h) / 396, ink = isDark(T.bg) ? T.bg : T.ink; return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#fff"/>${star(x + w / 2, y + h * 0.8, 7 * sc, T.soft, 0.9)}<text x="${f1(x + w / 2)}" y="${f1(y + h * 0.86)}" text-anchor="middle" font-size="${f1(10 * sc)}" font-family="${esc(F.body)}" fill="${ink}">${esc(c.sign)}${c.showYear ? ' · ' + c.year : ''}</text>`; }

// ---------- sheets ----------
const cutBox = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="#9ca3af" stroke-width=".6" stroke-dasharray="4 3"/>`;
const svgWrap = (W, H, body) => ({ w: W, h: H, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>` });
function recipients() { return st.people.filter((p) => p.send && p.name.trim()); }
const dearOf = (p) => (p ? `Dear ${p.name.trim()},` : '');
// one card per slot: [{ dear, addr }] – personal cards use the card list, otherwise copies of the same card
function slots(c) {
  if (c.personal) { const r = recipients(); return r.length ? r.map((p) => ({ dear: dearOf(p), addr: p.addr })) : [{ dear: '', addr: '' }]; }
  return Array.from({ length: c.copies }, () => ({ dear: '', addr: '' }));
}
function sheets(c, which) { // which: 'front' | 'back'
  const F = fmt(c), P = PAGES[c.paper] || PAGES.letter, list = slots(c), pages = [];
  if (F.fold) { // landscape sheet folded in half: [back | front] outside, [blank | message] inside
    const W = P.h, H = P.w, fw = W / 2;
    list.forEach((sl, i) => {
      let b = `<rect width="${W}" height="${H}" fill="#fff"/>`;
      if (which === 'front') b += foldBackSvg(c, 0, 0, fw, H) + frontSvg(c, fw, 0, fw, H, { uid: 'o' + i });
      else b += `<rect x="0" y="0" width="${fw}" height="${H}" fill="#fff"/>` + insideRightSvg(c, fw, 0, fw, H, { dear: c.personal ? sl.dear : '', uid: 'i' + i });
      b += `<line x1="${fw}" y1="0" x2="${fw}" y2="8" stroke="#bbb" stroke-width=".6"/><line x1="${fw}" y1="${H - 8}" x2="${fw}" y2="${H}" stroke="#bbb" stroke-width=".6"/>`;
      pages.push(svgWrap(W, H, b));
    });
    return pages;
  }
  const land = F.w > F.h;
  const W = land || F.w === F.h ? P.w : P.h, H = land || F.w === F.h ? P.h : P.w; // upright 5×7 cards sit side by side on a landscape sheet
  const vertical = land || F.w === F.h, gap = 18;
  for (let i = 0; i < list.length; i += 2) {
    let b = `<rect width="${W}" height="${H}" fill="#fff"/>`;
    const pair = list.slice(i, i + 2);
    pair.forEach((sl, k) => {
      const kk = which === 'back' && !vertical ? (pair.length === 2 ? 1 - k : 1) : k; // side-by-side cards swap places on the back
      const x = vertical ? (W - F.w) / 2 : (W - F.w * 2 - gap) / 2 + kk * (F.w + gap);
      const y = vertical ? (H - F.h * 2 - gap) / 2 + k * (F.h + gap) : (H - F.h) / 2;
      const o = { uid: `s${i + k}${which[0]}`, dear: c.personal && !c.backOn && c.format !== 'post' ? sl.dear : '', addr: sl.addr };
      if (which === 'front') b += frontSvg(c, x, y, F.w, F.h, o);
      else if (c.format === 'post') b += postBackSvg(c, x, y, F.w, F.h, { dear: c.personal ? sl.dear : '', addr: c.personal ? sl.addr : '' });
      else b += backSvg(c, x, y, F.w, F.h, { dear: c.personal ? sl.dear : '', uid: `s${i + k}b` });
      b += cutBox(x, y, F.w, F.h);
    });
    b += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="7" fill="#9ca3af" font-family="Segoe UI, sans-serif">Cut along the dotted lines · CardPress</text>`;
    pages.push(svgWrap(W, H, b));
  }
  return pages;
}
const hasBack = (c) => fmt(c).fold || c.format === 'post' || c.backOn;
function labelPages(entries, sheetKey) {
  const L = LABELS[sheetKey] || LABELS[5160], P = PAGES[L.page], per = L.cols * L.rows, pages = [];
  for (let i = 0; i < Math.max(1, entries.length); i += per) {
    let b = `<rect width="${P.w}" height="${P.h}" fill="#fff"/>`;
    entries.slice(i, i + per).forEach((txt, k) => {
      const col = k % L.cols, row = Math.floor(k / L.cols), x = L.left + col * L.px, y = L.top + row * L.py;
      const lines = String(txt).split(/\n/).map((l) => l.trim()).filter(Boolean).slice(0, L.h > 100 ? 7 : 5);
      const fs = Math.min(L.h > 100 ? 13 : 10.5, (L.h - 12) / Math.max(1, lines.length) / 1.25);
      const top = y + (L.h - lines.length * fs * 1.25) / 2 + fs;
      lines.forEach((l, j) => { b += `<text x="${f1(x + 10)}" y="${f1(top + j * fs * 1.25)}" font-size="${f1(fitFont(l, L.w - 16, fs, 0.52, 'Segoe UI, Arial, sans-serif'))}" font-family="Segoe UI, Arial, sans-serif" fill="#111">${esc(l)}</text>`; });
    });
    pages.push(svgWrap(P.w, P.h, b));
  }
  return pages;
}

// ---------- screen ----------
function renderPage() {
  const c = card(), F = fmt(c), pg = $('page');
  let svg;
  if (view === 'front') { svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F.w} ${F.h}" class="face">${frontSvg(c, 0, 0, F.w, F.h, { screen: true, uid: 'scr', dear: c.personal && !F.fold && !hasBack(c) && recipients()[0] ? dearOf(recipients()[0]) : '' })}</svg>`; }
  else if (view === 'back') { const r = c.personal ? recipients()[0] : null; svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F.w} ${F.h}" class="face">${c.format === 'post' ? postBackSvg(c, 0, 0, F.w, F.h, { dear: dearOf(r), addr: r ? r.addr : '' }) : backSvg(c, 0, 0, F.w, F.h, { dear: dearOf(r), uid: 'scrb' })}</svg>`; }
  else if (view === 'outside') svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F.w * 2} ${F.h}" class="face wide">${foldBackSvg(c, 0, 0, F.w, F.h)}${frontSvg(c, F.w, 0, F.w, F.h, { screen: true, uid: 'scr' })}<line x1="${F.w}" y1="0" x2="${F.w}" y2="${F.h}" stroke="#d6d3d1" stroke-dasharray="5 4"/></svg>`;
  else { const r = c.personal ? recipients()[0] : null; svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F.w * 2} ${F.h}" class="face wide"><rect width="${F.w}" height="${F.h}" fill="#fff"/>${insideRightSvg(c, F.w, 0, F.w, F.h, { dear: dearOf(r) })}<line x1="${F.w}" y1="0" x2="${F.w}" y2="${F.h}" stroke="#d6d3d1" stroke-dasharray="5 4"/></svg>`; }
  if (!unlocked() && proReasons(c, view !== 'front' || c.personal).length) svg = svg.replace(/<\/svg>$/, previewMark(view === 'outside' || view === 'inside' ? F.w * 2 : F.w, F.h) + '</svg>'); // free users see Pro options marked as a preview
  pg.innerHTML = svg;
  fitFace();
}
// on-screen only: a "PREVIEW" watermark over cards that use Pro options (never in print or saved files)
function previewMark(W, H) {
  const fs = Math.min(W, H) * 0.16, a = Math.atan2(H, W) * -180 / Math.PI;
  let s = `<g pointer-events="none" font-family="Segoe UI, Arial, sans-serif" font-weight="800" text-anchor="middle" transform="rotate(${f1(a)} ${f1(W / 2)} ${f1(H / 2)})">`;
  s += `<text x="${f1(W / 2)}" y="${f1(H / 2 + fs * 0.35)}" font-size="${f1(fs)}" letter-spacing="${f1(fs * 0.12)}" fill="#fff" fill-opacity=".55" stroke="#1f1a17" stroke-opacity=".45" stroke-width="${f1(fs * 0.02)}">PREVIEW</text>`;
  [-1, 1].forEach((k) => { s += `<text x="${f1(W / 2)}" y="${f1(H / 2 + k * fs * 1.25 + fs * 0.12)}" font-size="${f1(fs * 0.3)}" fill="#fff" fill-opacity=".6" stroke="#1f1a17" stroke-opacity=".35" stroke-width="${f1(fs * 0.008)}">★ CardPress Pro</text>`; });
  return s + '</g>';
}
// keep the on-screen card at its true shape, as big as the view allows
function fitFace() {
  const pg = $('page'), svg = pg && pg.querySelector('svg'); if (!svg) return;
  const vb = svg.viewBox.baseVal; svg.style.width = svg.style.height = '0';
  const cs = getComputedStyle(pg), aw = pg.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ah = pg.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const k = Math.max(0.05, Math.min(aw / vb.width, ah / vb.height));
  svg.style.width = Math.floor(vb.width * k) + 'px'; svg.style.height = Math.floor(vb.height * k) + 'px';
}
function renderViews() {
  const c = card(), F = fmt(c), tabs = F.fold ? [['outside', 'Outside'], ['inside', 'Inside']] : hasBack(c) ? [['front', 'Front'], ['back', 'Back']] : [['front', 'Front']];
  if (!tabs.some((t) => t[0] === view)) view = tabs[0][0];
  $('vtabs').innerHTML = tabs.map(([k, n]) => `<button data-v="${k}" class="${k === view ? 'on' : ''}">${n}</button>`).join('');
  $('sizeInfo').textContent = F.name.replace(' ★', '') + ' · ' + (c.paper === 'a4' ? 'A4' : 'Letter');
  const r = proReasons(c, true);
  $('printHint').textContent = !unlocked() && r.length ? `★ Uses Pro: ${r.join(', ')}. Pick options without ★ to print for free.` : c.personal ? `${recipients().length} personal card${recipients().length === 1 ? '' : 's'} – one for each person ticked “Send” on your card list.` : F.fold ? 'Prints 1 card on each sheet. Fold it in half.' : 'Prints 2 cards on each sheet. Cut along the dotted lines.';
}
function renderSide() {
  const c = card(), pro = unlocked();
  $('projPick').innerHTML = st.projects.map((p) => `<option value="${esc(p.id)}"${p.id === c.id ? ' selected' : ''}>${esc(p.title || 'Card')}</option>`).join('');
  $('occ').innerHTML = Object.entries(OCCASIONS).map(([k, o]) => `<option value="${k}"${k === c.occ ? ' selected' : ''}>${esc(o.name)}</option>`).join('');
  $('format').innerHTML = Object.entries(FORMATS).map(([k, f]) => `<option value="${k}"${k === c.format ? ' selected' : ''}>${esc(pro ? f.name.replace(' ★', '') : f.name)}</option>`).join('');
  $('paper').value = c.paper;
  $('font').innerHTML = Object.entries(FONTS).map(([k, f]) => `<option value="${k}"${k === c.font ? ' selected' : ''}>${esc(f.name)}</option>`).join('');
  $('lays').innerHTML = Object.entries(LAYOUTS).map(([k, l]) => `<button data-l="${k}" class="lay${k === c.lay ? ' on' : ''}" title="${esc(l.name)}">${layIcon(k)}<span>${esc(l.name)}${l.pro && !pro ? ' ★' : ''}</span></button>`).join('');
  const o = occ(c);
  $('themes').innerHTML = o.themes.map((k, i) => { const t = THEMES[k]; return `<button data-t="${k}" class="th${k === c.theme ? ' on' : ''}" title="${esc(t.name)}"><svg viewBox="0 0 120 80"><rect width="120" height="80" fill="${t.bg}"/>${decorations(t, 0, 0, 120, 80, 0.33)}<text x="60" y="47" text-anchor="middle" font-size="13" fill="${t.ink}" font-family="${esc(t.script ? FONTS.script.head : 'Georgia, serif')}">Aa</text></svg><span>${esc(t.name)}${i > 0 && !pro ? ' ★' : ''}</span></button>`; }).join('');
  const gs = greetsOf(o), own = c.greet === '__own' || !gs.includes(c.greet);
  $('greetSel').innerHTML = gs.map((g) => `<option${!own && g === c.greet ? ' selected' : ''}>${esc(g)}</option>`).join('') + `<option value="__own"${own ? ' selected' : ''}>✎ My own words…</option>`;
  $('greetOwnRow').hidden = !own;
  if (own && document.activeElement !== $('greetOwn')) $('greetOwn').value = c.greet === '__own' ? c.greetOwn : (c.greetOwn || c.greet);
  ['msg', 'sign', 'inGreet', 'inMsg', 'backText'].forEach((k) => { if (document.activeElement !== $(k)) $(k).value = c[k]; });
  $('showYear').checked = c.showYear; if (document.activeElement !== $('yearIn')) $('yearIn').value = c.year;
  $('backOn').checked = c.backOn; $('backPhoto').checked = c.backPhoto; $('personal').checked = c.personal;
  $('foldOnly').hidden = !fmt(c).fold; $('flatOnly').hidden = !!fmt(c).fold;
  const n = lay(c).n;
  $('frameList').innerHTML = n ? Array.from({ length: n }, (_, j) => `<button data-j="${j}" class="fr${j === curFrame ? ' on' : ''}">${c.photos[j] ? `<img src="${esc(c.photos[j].url)}" alt="">` : '<span>＋</span>'}<i>Photo ${j + 1}</i></button>`).join('') : '<p class="hint">This layout has no photos.</p>';
  if (curFrame >= n) curFrame = 0;
  $('zoom').value = (c.photos[curFrame] && c.photos[curFrame].z) || 1;
  $('photoBtn').disabled = !n; $('photoDel').disabled = !c.photos[curFrame];
  document.querySelectorAll('#stabs button').forEach((b) => b.classList.toggle('on', b.dataset.s === side));
  document.querySelectorAll('.sec').forEach((sct) => (sct.hidden = sct.dataset.s !== side));
  renderPeople();
  $('labelSheet').value = st.labelSheet; if (document.activeElement !== $('retAddr')) $('retAddr').value = st.retAddr;
}
function layIcon(k) {
  const r = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" opacity="${f ? 0.55 : 0.8}"/>`;
  const m = { full: r(2, 2, 36, 18, 1) + r(2, 21, 36, 7), split: r(2, 2, 20, 26, 1) + r(23, 2, 15, 26), frame: r(2, 2, 36, 26) + r(6, 6, 16, 18, 1), text: r(2, 2, 36, 26) + '<line x1="10" y1="12" x2="30" y2="12" stroke="currentColor"/><line x1="14" y1="18" x2="26" y2="18" stroke="currentColor"/>', duo: r(2, 2, 17, 18, 1) + r(21, 2, 17, 18, 1) + r(2, 21, 36, 7), trio: r(2, 2, 21, 18, 1) + r(25, 2, 13, 8, 1) + r(25, 12, 13, 8, 1) + r(2, 21, 36, 7), quad: r(2, 2, 17, 8, 1) + r(21, 2, 17, 8, 1) + r(2, 12, 17, 8, 1) + r(21, 12, 17, 8, 1) + r(2, 21, 36, 7), six: r(2, 2, 11, 8, 1) + r(14.5, 2, 11, 8, 1) + r(27, 2, 11, 8, 1) + r(2, 12, 11, 8, 1) + r(14.5, 12, 11, 8, 1) + r(27, 12, 11, 8, 1) + r(2, 21, 36, 7) };
  return `<svg viewBox="0 0 40 30" width="40" height="30">${m[k] || ''}</svg>`;
}
function renderPeople() {
  const q = pSearch.trim().toLowerCase(), list = st.people.filter((p) => !q || (p.name + ' ' + p.addr).toLowerCase().includes(q));
  $('peopleList').innerHTML = list.length ? list.map((p) => `<div class="person" data-id="${esc(p.id)}"><label title="Send a card"><input type="checkbox" data-send ${p.send ? 'checked' : ''}> ✉</label><label title="Got a card from them"><input type="checkbox" data-got ${p.got ? 'checked' : ''}> 📬</label><button class="pname" data-edit>${esc(p.name || '(no name)')}<small>${esc(p.addr.split('\n')[0] || 'no address')}</small></button></div>`).join('') : `<p class="hint">${st.people.length ? 'No one matches.' : 'Your card list is empty. Add the people you send cards to.'}</p>`;
  const send = st.people.filter((p) => p.send).length, got = st.people.filter((p) => p.got).length;
  $('peopleInfo').textContent = st.people.length ? `${st.people.length} people · ${send} to send · ${got} cards received${!unlocked() ? ` · free version: up to ${FREE_PEOPLE}` : ''}` : '';
}
function render() {
  if (!booted) return;
  const p = $('proBtn'); p.textContent = proLabel(); p.classList.toggle('is-pro', isPro || trialActive()); p.hidden = !proAvailable && !isPro;
  renderSide(); renderViews(); renderPage();
}
function change(fn) { const c = card(); fn(c); save(); render(); }

// ---------- photos ----------
function pickFile(accept, cb) { const i = $('fileIn'); i.accept = accept; i.value = ''; i.onchange = () => { if (i.files[0]) cb(i.files[0]); }; i.click(); }
function shrinkPhoto(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 2000 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      res({ url: cv.toDataURL('image/jpeg', 0.88), ar: img.width / img.height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('That file is not a picture'); rej(new Error('bad image')); };
    img.src = url;
  });
}
function addPhoto(j) {
  const c = card(); if (!lay(c).n) return;
  curFrame = j;
  pickFile('image/*', async (f) => { let r; try { r = await shrinkPhoto(f); } catch (_) { return; } c.photos[j] = { url: r.url, ar: r.ar, x: 0.5, y: 0.5, z: 1 }; save(); render(); });
}
function samplePhoto(seed) {
  const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 800;
  const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, ['#93c5fd', '#a5b4fc', '#fdba74'][seed % 3]); g.addColorStop(1, '#f8fafc');
  x.fillStyle = g; x.fillRect(0, 0, 1200, 800);
  x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(260 + seed * 120, 180, 70, 0, 7); x.fill();
  const hill = (col, y0, amp, ph) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, 800); for (let i = 0; i <= 1200; i += 20) x.lineTo(i, y0 + Math.sin(i / 190 + ph) * amp + Math.sin(i / 70 + ph * 2) * amp * 0.25); x.lineTo(1200, 800); x.fill(); };
  hill('#cbd5e1', 480, 70, seed); hill('#e2e8f0', 570, 50, seed * 2 + 1); hill('#f8fafc', 660, 36, seed * 3 + 2);
  for (let k = 0; k < 5; k++) { const tx = 180 + k * 210, ty = 640 + (k % 2) * 30, th = 150 + (k % 3) * 40; x.fillStyle = '#166534'; x.beginPath(); x.moveTo(tx, ty - th); x.lineTo(tx + th * 0.35, ty); x.lineTo(tx - th * 0.35, ty); x.fill(); }
  return cv.toDataURL('image/jpeg', 0.85);
}

// ---------- printing & saving ----------
function printPages(pages) {
  if (!pages.length) return;
  const land = pages[0].w > pages[0].h, P = pages[0].w === 595 || pages[0].h === 595 ? 'A4' : 'letter';
  $('pageRule').textContent = `@page { size: ${P} ${land ? 'landscape' : 'portrait'}; margin: 0; }`;
  $('printArea').innerHTML = pages.map((p) => p.svg.replace(/ width="[\d.]+" height="[\d.]+"/, ' preserveAspectRatio="xMidYMid meet"')).join('');
  setTimeout(() => window.print(), 60);
}
window.addEventListener('afterprint', () => { $('printArea').innerHTML = ''; });
function openPrint() {
  const c = card();
  if (proGate(c, true)) return;
  const F = fmt(c), n = slots(c).length, back = hasBack(c);
  $('copiesRow').hidden = c.personal;
  $('copies').value = c.copies;
  $('printWhat').textContent = c.personal ? `${n} personal card${n === 1 ? '' : 's'} – one for each person ticked “Send” on your card list.` : `${F.name.replace(' ★', '')}.`;
  const steps = F.fold ? ['Print the <b>outside</b> (front and back of the card).', 'Put the printed sheets back in the printer, turned over (flip on the short edge), and print the <b>inside</b>.', 'Fold each sheet in half.'] : back ? ['Print the <b>fronts</b>.', 'Put the printed sheets back in the printer, turned over, and print the <b>backs</b>.', 'Cut along the dotted lines.'] : ['Print, then cut along the dotted lines.'];
  $('printSteps').innerHTML = steps.map((t) => `<li>${t}</li>`).join('');
  $('printBtns').innerHTML = F.fold ? '<button class="primary" data-p="front">1 · Print outside</button><button class="primary" data-p="back">2 · Print inside</button>' : back ? '<button class="primary" data-p="front">1 · Print fronts</button><button class="primary" data-p="back">2 · Print backs</button>' : '<button class="primary" data-p="front">🖨 Print</button>';
  if (!$('printDlg').open) $('printDlg').showModal();
}
async function svgToCanvas(svg, W, H) {
  const img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H);
  URL.revokeObjectURL(url);
  return cv;
}
function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); }
const safeName = (s) => String(s || 'card').normalize('NFC').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'card';
async function saveImage(kind) {
  const c = card();
  $('menu').hidden = true;
  if (needsPro(kind === 'jpg' ? 'Saving cards for a photo shop is part of CardPress Pro. You can print them at home for free.' : 'Saving your card as a picture is part of CardPress Pro. You can print it at home for free.')) return;
  if (proGate(c, false, 'save')) return;
  const F = fmt(c), dpi = 300 / 72, W = Math.round(F.w * dpi), H = Math.round(F.h * dpi);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F.w} ${F.h}" width="${F.w}" height="${F.h}">${frontSvg(c, 0, 0, F.w, F.h, { uid: 'img' })}</svg>`;
  try {
    const cv = await svgToCanvas(svg, W, H);
    cv.toBlob((b) => { download(b, `${safeName(c.title)}.${kind}`); toast(kind === 'jpg' ? `Saved a ${W} × ${H} px photo (300 dpi). Upload it to Walmart, CVS, Walgreens or any photo shop and order prints of this size.` : `Saved ${safeName(c.title)}.png to your Downloads folder`, 7000); }, kind === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
  } catch (_) { toast('Could not make the picture – try a smaller photo'); }
}

// ---------- card list ----------
function openPerson(p) {
  editPerson = p ? p.id : null;
  if (!p && st.people.length >= FREE_PEOPLE && needsPro(`The free version holds ${FREE_PEOPLE} people on your card list. Unlock Pro for an unlimited list.`)) return;
  $('pDlgTitle').textContent = p ? 'Edit person' : 'Add a person';
  $('pName').value = p ? p.name : ''; $('pAddr').value = p ? p.addr : ''; $('pSend').checked = p ? p.send : true; $('pGot').checked = p ? p.got : false;
  $('pDel').hidden = !p;
  $('pDlg').showModal(); setTimeout(() => $('pName').focus(), 30);
}
function addPeople(list) {
  const room = unlocked() ? Infinity : FREE_PEOPLE - st.people.length;
  if (list.length > room) { openPro(`This list has ${list.length} people. The free version holds ${FREE_PEOPLE} people on your card list – unlock Pro for an unlimited list.`); return false; }
  const known = new Set(st.people.map((p) => p.name.trim().toLowerCase()));
  let added = 0;
  list.forEach((p) => { const n = normPerson(p); if (!n.name.trim() || known.has(n.name.trim().toLowerCase())) return; known.add(n.name.trim().toLowerCase()); st.people.push(n); added++; });
  save(); render(); toast(`Added ${added} ${added === 1 ? 'person' : 'people'} to your card list`);
  return true;
}
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
function csvToPeople(text) {
  const rows = parseCsv(text.replace(/^﻿/, ''));
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const find = (...names) => head.findIndex((h) => names.some((n) => h === n || h.includes(n)));
  let iName = head.findIndex((h) => /name|display/.test(h) && !/first|last|middle|given|family|sur|nick|company|mail|file as/.test(h)), iFirst = find('first', 'given'), iLast = find('last', 'surname', 'family name'), iCountry = find('country');
  let iAddr = head.findIndex((h) => /address|street/.test(h) && !/mail/.test(h)), iCity = find('city'), iState = find('state', 'region', 'province'), iZip = find('zip', 'postal'), iSend = head.indexOf('send'), iGot = head.findIndex((h) => h === 'got card' || h === 'got');
  const hasHead = [iName, iFirst, iAddr].some((i) => i >= 0);
  if (!hasHead) { iName = 0; iAddr = 1; }
  return rows.slice(hasHead ? 1 : 0).map((r) => {
    const g = (i) => (i >= 0 && r[i] ? r[i].trim() : '');
    const name = g(iName) || [g(iFirst), g(iLast)].filter(Boolean).join(' ');
    const cityLine = [g(iCity), [g(iState), g(iZip)].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const street = g(iAddr), rest = [street, cityLine, g(iCountry)].filter(Boolean);
    const no = (i) => /^(no|n|false|0)$/i.test(g(i));
    // a full address on several lines (like CardPress's own export) already has the name on top – don't add it twice
    return { name, addr: !rest.length ? '' : street.includes('\n') && !cityLine ? rest.join('\n') : [name].concat(rest).join('\n'), send: iSend < 0 || !no(iSend), got: iGot >= 0 && !no(iGot) && !!g(iGot) };
  }).filter((p) => p.name);
}
function peopleCsv() {
  const q = (v) => { let s = String(v || ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  return '﻿' + ['Name,Address,Send,Got card'].concat(st.people.map((p) => [q(p.name), q(p.addr), p.send ? 'yes' : 'no', p.got ? 'yes' : 'no'].join(','))).join('\r\n');
}

// ---------- projects, backup ----------
function newProject(copyOf) {
  $('menu').hidden = true;
  if (st.projects.length >= FREE_PROJECTS && needsPro(`The free version keeps ${FREE_PROJECTS} cards. Unlock Pro to make as many as you like – or delete a card you don't need.`)) return;
  const c = copyOf ? normalize(JSON.parse(JSON.stringify(copyOf))) : newCard(card() ? card().occ : 'christmas');
  c.id = uid(); if (copyOf) c.title = (copyOf.title || 'Card') + ' (copy)';
  st.projects.push(c); st.cur = c.id; curFrame = 0; view = 'front'; save(); render();
}
function loadSample() {
  $('menu').hidden = true;
  const c = card();
  if (c.photos.some(Boolean) && !confirm(`Replace “${c.title}” with the example card? Its photos and words will be replaced.`)) return;
  Object.assign(c, newCard('christmas'), { id: c.id, title: 'Christmas card (example)', lay: 'full', photos: [{ url: samplePhoto(1), ar: 1.5, x: 0.5, y: 0.5, z: 1 }] });
  const demo = [{ name: 'Grandma & Grandpa', addr: 'Mr. & Mrs. Tran\n45 Maple Ave\nAustin, TX 78701' }, { name: 'Uncle Minh', addr: 'Minh Nguyen\n9 Pine Rd\nPortland, OR 97201' }, { name: 'The Smiths', addr: 'The Smith Family\n120 Lake Dr\nDenver, CO 80202' }];
  const room = unlocked() ? 3 : Math.max(0, FREE_PEOPLE - st.people.length);
  const known = new Set(st.people.map((p) => p.name));
  demo.filter((p) => !known.has(p.name)).slice(0, room).forEach((p) => st.people.push(normPerson(p)));
  curFrame = 0; view = 'front'; save(); render(); toast('Here is an example – change the photo, the words and the design on the left');
}
async function backup() {
  $('menu').hidden = true;
  download(new Blob([JSON.stringify({ app: 'cardpress', v: 1, saved: new Date().toISOString(), state: st })], { type: 'application/json' }), `CardPress backup ${new Date().toISOString().slice(0, 10)}.json`);
  toast('💾 Backup saved to your Downloads folder');
}
async function restore(file) {
  let d; try { d = JSON.parse(await file.text()); } catch (_) { toast('That file is not a CardPress backup'); return; }
  if (!d || d.app !== 'cardpress' || !d.state || !Array.isArray(d.state.projects)) { toast('That file is not a CardPress backup'); return; }
  const projects = d.state.projects.filter((p) => p && typeof p === 'object').map(normalize), people = (Array.isArray(d.state.people) ? d.state.people : []).map(normPerson);
  if (!projects.length) { toast('That backup has no cards'); return; }
  if (!unlocked() && (projects.length > FREE_PROJECTS || people.length > FREE_PEOPLE)) { openPro(`This backup holds ${projects.length} cards and ${people.length} people. The free version holds ${FREE_PROJECTS} cards and ${FREE_PEOPLE} people – unlock Pro to open it. Your backup file is kept as it is.`); return; }
  if (!confirm('Replace your cards and card list with the ones in this backup?')) return;
  let reset = 0;
  if (!unlocked()) projects.forEach((p) => { if (proReasons(p, true).length) { reset++; freeSettings(p); } });
  const seen = new Set(); projects.forEach((p) => { if (seen.has(p.id)) p.id = uid(); seen.add(p.id); });
  st = { projects, cur: projects[0].id, people, retAddr: String(d.state.retAddr || '').slice(0, 200), labelSheet: LABELS[d.state.labelSheet] ? d.state.labelSheet : '5160' };
  curFrame = 0; view = 'front'; save(); render(); toast(reset ? `📂 Backup opened. ${reset} card${reset === 1 ? '' : 's'} used Pro designs or options – switched to free ones (unlock Pro to use them).` : '📂 Backup opened', reset ? 7000 : 0);
}

// ---------- events ----------
function wire() {
  $('moreBtn').onclick = (e) => { e.stopPropagation(); $('menu').hidden = !$('menu').hidden; };
  document.addEventListener('click', (e) => { if (!$('menu').hidden && !e.target.closest('#menu')) $('menu').hidden = true; });
  $('proBtn').onclick = () => { if (!isPro) openPro(); };
  $('buyBtn').onclick = buyPro; $('restoreBtn').onclick = async () => { proMessage((await checkPro()) ? 'Pro is unlocked. ★' : 'No Pro purchase was found on this Microsoft account.'); };
  $('closePro').onclick = () => $('proDialog').close(); $('trialBtn').onclick = startTrial;
  $('projPick').onchange = (e) => { st.cur = e.target.value; curFrame = 0; view = 'front'; save(); render(); };
  $('newProj').onclick = () => newProject(); $('dupProj').onclick = () => newProject(card());
  $('renameProj').onclick = () => { $('menu').hidden = true; const t = prompt('Name of this card', card().title); if (t && t.trim()) change((c) => { c.title = t.trim().slice(0, 60); }); };
  $('delProj').onclick = () => { $('menu').hidden = true; if (st.projects.length < 2) { toast('This is your only card – change it, or make a new one first'); return; } if (!confirm(`Delete “${card().title}”? This cannot be undone.`)) return; st.projects = st.projects.filter((p) => p.id !== st.cur); st.cur = st.projects[0].id; save(); render(); };
  $('sampleBtn').onclick = loadSample; $('backupBtn').onclick = backup;
  $('restoreBtn2').onclick = () => { $('menu').hidden = true; pickFile('.json,application/json', restore); };
  $('photoShopBtn').onclick = () => saveImage('jpg'); $('pngBtn').onclick = () => saveImage('png');
  $('printBtn').onclick = openPrint;
  window.addEventListener('resize', fitFace);
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); openPrint(); } });
  $('printClose').onclick = () => $('printDlg').close();
  $('copies').addEventListener('change', (e) => { const c = card(); c.copies = Math.min(500, Math.max(1, parseInt(e.target.value, 10) || 2)); e.target.value = c.copies; save(); });
  $('printBtns').onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const c = card(); if (proGate(c, true)) { $('printDlg').close(); return; } c.copies = Math.min(500, Math.max(1, parseInt($('copies').value, 10) || 2)); save(); printPages(sheets(c, b.dataset.p)); };
  $('stabs').onclick = (e) => { const b = e.target.closest('[data-s]'); if (b) { side = b.dataset.s; renderSide(); } };
  $('vtabs').onclick = (e) => { const b = e.target.closest('[data-v]'); if (b) { view = b.dataset.v; renderViews(); renderPage(); } };
  $('occ').onchange = (e) => change((c) => { const o = OCCASIONS[e.target.value]; c.occ = e.target.value; c.theme = o.themes[0]; c.greet = greetsOf(o)[0]; c.msg = o.msg; c.inMsg = o.inside; if (/ card$/.test(c.title) || !c.title) c.title = o.name + ' card'; });
  $('format').onchange = (e) => change((c) => { c.format = e.target.value; view = fmt(c).fold ? 'outside' : 'front'; });
  $('paper').onchange = (e) => change((c) => { c.paper = e.target.value; });
  $('font').onchange = (e) => change((c) => { c.font = e.target.value; });
  $('lays').onclick = (e) => { const b = e.target.closest('[data-l]'); if (b) change((c) => { c.lay = b.dataset.l; curFrame = 0; }); };
  $('themes').onclick = (e) => { const b = e.target.closest('[data-t]'); if (b) change((c) => { c.theme = b.dataset.t; }); };
  $('greetSel').onchange = (e) => change((c) => { c.greet = e.target.value; if (c.greet === '__own' && !c.greetOwn) c.greetOwn = ''; });
  $('greetOwn').addEventListener('input', (e) => { const c = card(); c.greet = '__own'; c.greetOwn = e.target.value; save(); renderPage(); });
  ['msg', 'sign', 'inGreet', 'inMsg', 'backText'].forEach((k) => $(k).addEventListener('input', (e) => { card()[k] = e.target.value; save(); renderPage(); }));
  $('showYear').onchange = (e) => change((c) => { c.showYear = e.target.checked; });
  $('yearIn').addEventListener('change', (e) => change((c) => { const y = parseInt(e.target.value, 10); if (y >= 1900 && y <= 2200) c.year = y; }));
  $('backOn').onchange = (e) => change((c) => { c.backOn = e.target.checked; if (c.backOn) view = 'back'; });
  $('backPhoto').onchange = (e) => change((c) => { c.backPhoto = e.target.checked; });
  $('personal').onchange = (e) => change((c) => { c.personal = e.target.checked; if (c.personal && !recipients().length) toast('Add people to your card list (👪 tab) and tick “Send”'); });
  $('frameList').onclick = (e) => { const b = e.target.closest('[data-j]'); if (!b) return; const j = Number(b.dataset.j); if (card().photos[j]) { curFrame = j; render(); } else addPhoto(j); };
  $('photoBtn').onclick = () => addPhoto(curFrame);
  $('photoDel').onclick = () => change((c) => { c.photos[curFrame] = null; });
  $('zoom').addEventListener('input', (e) => { const p = card().photos[curFrame]; if (!p) return; p.z = Number(e.target.value); save(); renderPage(); });
  // photos on the card: click to add, drag to move, wheel to zoom
  let drag = null;
  $('page').addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains('photoAdd')) { addPhoto(Number(t.dataset.j) || 0); return; }
    if (!t.classList || !t.classList.contains('photoHit')) return;
    const j = Number(t.dataset.j) || 0, p = card().photos[j]; if (!p) return;
    const svg = $('page').querySelector('svg'), b = photoBox(p, +t.getAttribute('x'), +t.getAttribute('y'), +t.getAttribute('width'), +t.getAttribute('height'));
    drag = { j, sc: svg.getScreenCTM().a, sx: e.clientX, sy: e.clientY, ox: b.w - +t.getAttribute('width'), oy: b.h - +t.getAttribute('height'), px: p.x, py: p.y, moved: false };
    if (curFrame !== j) { curFrame = j; renderSide(); }
    try { t.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });
  $('page').addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / drag.sc, dy = (e.clientY - drag.sy) / drag.sc, cl = (v) => Math.max(0, Math.min(1, v));
    if (!drag.moved && Math.hypot(dx, dy) < 2) return;
    drag.moved = true;
    const p = card().photos[drag.j]; p.x = drag.ox > 0.5 ? cl(drag.px - dx / drag.ox) : 0.5; p.y = drag.oy > 0.5 ? cl(drag.py - dy / drag.oy) : 0.5;
    const keep = drag; renderPage(); drag = keep;
    const hit = $('page').querySelector(`.photoHit[data-j="${drag.j}"]`); if (hit) try { hit.setPointerCapture(e.pointerId); } catch (_) {}
  });
  const endDrag = () => { if (!drag) return; const d = drag; drag = null; if (d.moved) save(); else render(); };
  $('page').addEventListener('pointerup', endDrag); $('page').addEventListener('pointercancel', endDrag);
  $('page').addEventListener('wheel', (e) => {
    const t = e.target; if (!t.classList || !t.classList.contains('photoHit')) return;
    e.preventDefault();
    const j = Number(t.dataset.j) || 0, p = card().photos[j]; if (!p) return;
    p.z = Math.max(1, Math.min(3, (p.z || 1) * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); curFrame = j; $('zoom').value = p.z; save(); renderPage();
  }, { passive: false });
  // card list
  $('pSearch').addEventListener('input', (e) => { pSearch = e.target.value; renderPeople(); });
  $('pAdd').onclick = () => openPerson(null);
  $('peopleList').addEventListener('click', (e) => { const row = e.target.closest('.person'); if (!row) return; const p = st.people.find((x) => x.id === row.dataset.id); if (!p) return; if (e.target.closest('[data-edit]')) openPerson(p); });
  $('peopleList').addEventListener('change', (e) => { const row = e.target.closest('.person'); if (!row) return; const p = st.people.find((x) => x.id === row.dataset.id); if (!p) return; if (e.target.matches('[data-send]')) p.send = e.target.checked; if (e.target.matches('[data-got]')) p.got = e.target.checked; save(); renderPeople(); renderViews(); renderPage(); });
  $('pSave').onclick = () => {
    const name = $('pName').value.trim(); if (!name) { $('pName').focus(); return; }
    if (editPerson) { const p = st.people.find((x) => x.id === editPerson); if (p) Object.assign(p, { name: name.slice(0, 60), addr: $('pAddr').value.trim().slice(0, 240), send: $('pSend').checked, got: $('pGot').checked }); }
    else { if (st.people.length >= FREE_PEOPLE && needsPro(`The free version holds ${FREE_PEOPLE} people on your card list.`)) return; st.people.push(normPerson({ name, addr: $('pAddr').value.trim(), send: $('pSend').checked, got: $('pGot').checked })); }
    $('pDlg').close(); save(); render();
  };
  $('pDel').onclick = () => { if (!confirm('Remove this person from your card list?')) return; st.people = st.people.filter((x) => x.id !== editPerson); $('pDlg').close(); save(); render(); };
  $('pCancel').onclick = () => $('pDlg').close();
  $('pPaste').onclick = () => { if (needsPro('Pasting a whole list is part of CardPress Pro. You can add people one by one for free.')) return; $('pasteIn').value = ''; $('pasteDlg').showModal(); };
  $('pasteCancel').onclick = () => $('pasteDlg').close();
  $('pasteGo').onclick = () => {
    if (needsPro('Pasting a whole list is part of CardPress Pro.')) return;
    const list = $('pasteIn').value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => { const [n, a] = l.split(/\t|\|/); return { name: n.trim(), addr: a ? [n.trim()].concat(a.split(';').map((x) => x.trim()).filter(Boolean)).join('\n') : '' }; });
    if (addPeople(list)) $('pasteDlg').close();
  };
  $('pCsv').onclick = () => { if (needsPro('Importing a contact list (CSV from Outlook, Gmail or Excel) is part of CardPress Pro.')) return; pickFile('.csv,text/csv,text/plain', async (f) => { const list = csvToPeople(await f.text()); if (!list.length) { toast('No names found in that file'); return; } addPeople(list); }); };
  $('pExport').onclick = () => { if (!st.people.length) { toast('Your card list is empty'); return; } download(new Blob([peopleCsv()], { type: 'text/csv;charset=utf-8' }), 'CardPress card list.csv'); toast('Saved your card list to the Downloads folder'); };
  $('labelSheet').onchange = (e) => { st.labelSheet = e.target.value; save(); };
  $('retAddr').addEventListener('input', (e) => { st.retAddr = e.target.value.slice(0, 200); save(); });
  $('labelsBtn').onclick = () => {
    if (needsPro('Address labels are part of CardPress Pro.')) return;
    if (proGate(card(), false, 'print')) return;
    const list = recipients().filter((p) => p.addr.trim()).map((p) => p.addr);
    if (!list.length) { toast('Add addresses to the people you send cards to (✉ ticked)'); return; }
    printPages(labelPages(list, st.labelSheet));
  };
  $('retBtn').onclick = () => {
    if (needsPro('Return-address labels are part of CardPress Pro.')) return;
    if (!st.retAddr.trim()) { $('retAddr').focus(); toast('Type your return address first'); return; }
    const L = LABELS[st.labelSheet] || LABELS[5160]; printPages(labelPages(Array(L.cols * L.rows).fill(st.retAddr), st.labelSheet));
  };
}

// ---------- boot ----------
(async function boot() {
  wire();
  await loadTrial();
  try { const s = await dbGet('state'); if (s && Array.isArray(s.projects) && s.projects.length) { st = Object.assign(st, s); st.projects = s.projects.map(normalize); st.people = (s.people || []).map(normPerson); } } catch (_) {}
  if (!st.projects.length) { const c = newCard('christmas'); st.projects = [c]; }
  if (!st.projects.some((p) => p.id === st.cur)) st.cur = st.projects[0].id;
  if (!LABELS[st.labelSheet]) st.labelSheet = '5160';
  booted = true;
  setPro(isPro);
  checkPro();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
