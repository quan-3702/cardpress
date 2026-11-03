// CardPress – occasions, designs and drawn decorations (all vector, so cards print sharp at any size).
'use strict';
const nextYear = () => { const d = new Date(); return d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear(); };
const OCCASIONS = {
  christmas: { name: 'Christmas & holidays', greets: ['Merry Christmas', 'Happy Holidays', "Season's Greetings", 'Merry Christmas & Happy New Year', 'Peace, Love & Joy', 'Merry & Bright', 'Happy Hanukkah', 'Joyeux Noël', 'Feliz Navidad', 'Frohe Weihnachten', 'Buon Natale', 'Chúc mừng Giáng sinh'], msg: 'Wishing you joy, peace and love this holiday season', inside: 'May your home be filled with warmth and laughter, and the new year bring you happiness and good health.', themes: ['holly', 'snow', 'evergreen', 'plaid', 'ornaments', 'pine', 'gold', 'kraft', 'night', 'hanukkah'] },
  newyear: { name: 'New Year', greets: () => [`Happy New Year ${nextYear()}`, 'Happy New Year', 'Cheers to the New Year', 'Hello ' + nextYear(), 'Bonne Année', 'Feliz Año Nuevo', 'Chúc mừng năm mới'], msg: 'Wishing you a year full of good health, love and happy moments', inside: 'Thank you for being part of our year. Here is to new adventures together!', themes: ['fireworks', 'goldny', 'midnight', 'confetti'] },
  tet: { name: 'Lunar New Year (Tết)', greets: ['Chúc Mừng Năm Mới', 'Happy Lunar New Year', 'An Khang Thịnh Vượng', 'Vạn Sự Như Ý', 'Xuân An Khang', '新年快乐', 'Gong Xi Fa Cai'], msg: 'Wishing you health, happiness and good fortune in the new year', inside: 'Chúc gia đình một năm mới an khang thịnh vượng, vạn sự như ý!', themes: ['tetred', 'mai', 'peach', 'tetgold'] },
  birthday: { name: 'Birthday', greets: ['Happy Birthday', 'Happy 1st Birthday', 'Happy Birthday, Mom', 'Happy Birthday, Dad', 'Happy Birthday, Grandma', 'Cheers to You', 'Feliz Cumpleaños', 'Joyeux Anniversaire', 'Chúc mừng sinh nhật'], msg: 'Wishing you a wonderful day and a year full of happy moments', inside: 'Have the most amazing birthday – you deserve all the cake!', themes: ['balloons', 'confetti', 'pastel', 'bnight'] },
  thanks: { name: 'Thank you', greets: ['Thank You', 'Thank You So Much', 'With Gratitude', 'Thanks a Bunch', 'Gracias', 'Merci', 'Cảm ơn'], msg: 'Thank you for your kindness – it meant so much to us', inside: 'Your thoughtfulness made our day. We are so grateful.', themes: ['greenery', 'kthanks', 'navy'] },
  wedding: { name: 'Wedding & anniversary', greets: ['Save the Date', 'Just Married', "We're Engaged!", 'Thank You', 'Happy Anniversary'], msg: 'Saturday, June 12 · Invitation to follow', inside: 'We can’t wait to celebrate with you.', themes: ['ivory', 'blush', 'eucalyptus', 'wgold'] },
  baby: { name: 'New baby', greets: ["It's a Boy!", "It's a Girl!", 'Welcome, Little One', 'Hello, World', 'Baby Shower', 'Thank You'], msg: 'Born March 3 · 7 lb 2 oz · 20 in', inside: 'Thank you for all your love and support as we welcome our little one.', themes: ['babyblue', 'babypink', 'sage'] },
  grad: { name: 'Graduation', greets: () => ['Congratulations, Graduate!', `Class of ${nextYear()}`, 'Congrats, Grad!', 'So Proud of You', 'Graduation Party'], msg: 'Join us to celebrate on Saturday, June 5 at 4 pm', inside: 'The future is yours – we are so proud of you!', themes: ['gnavy', 'gblack', 'gmaroon'] },
  valentine: { name: "Valentine's Day", greets: ["Happy Valentine's Day", 'Be Mine', 'Love You', 'XOXO', 'You & Me'], msg: 'You make every day brighter', inside: 'Every day with you is my favourite day.', themes: ['hearts', 'rose', 'lkraft'] },
  parents: { name: "Mother's & Father's Day", greets: ["Happy Mother's Day", "Happy Father's Day", 'Best Mom Ever', 'Best Dad Ever', 'Love You, Mom', 'Love You, Dad'], msg: 'Thank you for everything you do', inside: 'For all the love, the lessons and the laughter – thank you.', themes: ['floral', 'mclassic', 'mgold'] },
  easter: { name: 'Easter & spring', greets: ['Happy Easter', 'Hoppy Easter', 'He Is Risen', 'Happy Spring', 'Frohe Ostern'], msg: 'Wishing you a joyful spring', inside: 'May your Easter be filled with sunshine and sweet moments.', themes: ['eggs', 'spring'] },
  thanksgiving: { name: 'Thanksgiving & fall', greets: ['Happy Thanksgiving', 'Give Thanks', 'Grateful & Blessed', 'Happy Fall'], msg: 'Grateful for you this season', inside: 'Wishing you a table full of food and a home full of love.', themes: ['autumn', 'harvest'] },
  halloween: { name: 'Halloween', greets: ['Happy Halloween', 'Trick or Treat', 'Boo!', 'Spooky Season'], msg: 'Have a frightfully fun night', inside: 'Wishing you more treats than tricks!', themes: ['pumpkins', 'spooky'] },
  party: { name: 'Party invitation', greets: ["You're Invited!", 'Join the Party', "Let's Celebrate", 'Come Party With Us'], msg: 'Saturday, May 8 at 3 pm · 12 Oak Street · RSVP to Anna', inside: 'Please let us know by May 1 if you can come.', themes: ['confetti', 'balloons', 'bnight'] },
};
const THEMES = {
  holly: { name: 'Holly', bg: '#fbf7f0', ink: '#7f1d1d', soft: '#166534', deco: 'holly', script: true },
  snow: { name: 'Snowflakes', bg: '#eaf2fb', ink: '#1e3a8a', soft: '#3b82f6', deco: 'snow' },
  evergreen: { name: 'Evergreen', bg: '#14532d', ink: '#fef3c7', soft: '#facc15', deco: 'trees', script: true },
  plaid: { name: 'Buffalo plaid', bg: '#fffaf5', ink: '#991b1b', soft: '#b91c1c', deco: 'plaid', script: true },
  ornaments: { name: 'Ornaments', bg: '#f8fafc', ink: '#7f1d1d', soft: '#b91c1c', deco: 'ornaments', script: true },
  pine: { name: 'Pine & berries', bg: '#ffffff', ink: '#14532d', soft: '#166534', deco: 'pine', script: true },
  gold: { name: 'Gold & white', bg: '#fffdf7', ink: '#854d0e', soft: '#ca8a04', deco: 'stars', script: true },
  kraft: { name: 'Kraft paper', bg: '#d6b48a', ink: '#3f2a14', soft: '#7c2d12', deco: 'trees', script: true },
  night: { name: 'Silent night', bg: '#0f172a', ink: '#f8fafc', soft: '#fde68a', deco: 'stars' },
  hanukkah: { name: 'Blue & silver', bg: '#eff6ff', ink: '#1e3a8a', soft: '#94a3b8', deco: 'stars' },
  fireworks: { name: 'Fireworks', bg: '#0b1020', ink: '#fde68a', soft: '#f472b6', deco: 'fireworks' },
  goldny: { name: 'Golden cheers', bg: '#fffbeb', ink: '#78350f', soft: '#d97706', deco: 'confetti', script: true },
  midnight: { name: 'Midnight', bg: '#1e1b4b', ink: '#e0e7ff', soft: '#a5b4fc', deco: 'stars' },
  balloons: { name: 'Balloons', bg: '#fff7ed', ink: '#1e3a8a', soft: '#f97316', deco: 'balloons' },
  confetti: { name: 'Confetti', bg: '#ffffff', ink: '#7c3aed', soft: '#ec4899', deco: 'confetti' },
  pastel: { name: 'Pastel', bg: '#fdf4ff', ink: '#6b21a8', soft: '#e879f9', deco: 'dots', script: true },
  bnight: { name: 'Party night', bg: '#111827', ink: '#fde68a', soft: '#f472b6', deco: 'confetti' },
  greenery: { name: 'Greenery', bg: '#f7faf5', ink: '#14532d', soft: '#4d7c0f', deco: 'leaves', script: true },
  kthanks: { name: 'Kraft', bg: '#d6b48a', ink: '#3f2a14', soft: '#365314', deco: 'leaves', script: true },
  navy: { name: 'Navy & gold', bg: '#172554', ink: '#fef3c7', soft: '#fbbf24', deco: 'dots', script: true },
  ivory: { name: 'Ivory', bg: '#fffdf7', ink: '#57534e', soft: '#a8a29e', deco: 'leaves', script: true },
  blush: { name: 'Blush', bg: '#fdf2f2', ink: '#9f1239', soft: '#f9a8d4', deco: 'flowers', script: true },
  eucalyptus: { name: 'Eucalyptus', bg: '#f1f5f0', ink: '#365314', soft: '#84a98c', deco: 'leaves', script: true },
  wgold: { name: 'Black & gold', bg: '#1c1917', ink: '#fde68a', soft: '#d4a017', deco: 'stars', script: true },
  babyblue: { name: 'Baby blue', bg: '#eff6ff', ink: '#1e40af', soft: '#93c5fd', deco: 'dots' },
  babypink: { name: 'Baby pink', bg: '#fdf2f8', ink: '#be185d', soft: '#f9a8d4', deco: 'hearts' },
  sage: { name: 'Sage', bg: '#f0f5ee', ink: '#3f6212', soft: '#a3b18a', deco: 'stars', script: true },
  gnavy: { name: 'Navy', bg: '#1e3a8a', ink: '#ffffff', soft: '#fbbf24', deco: 'caps' },
  gblack: { name: 'Black & gold', bg: '#111827', ink: '#fde68a', soft: '#d4a017', deco: 'caps' },
  gmaroon: { name: 'Maroon', bg: '#7f1d1d', ink: '#ffffff', soft: '#fcd34d', deco: 'confetti' },
  tetred: { name: 'Red & gold', bg: '#b91c1c', ink: '#fde68a', soft: '#facc15', deco: 'lanterns' },
  mai: { name: 'Apricot blossom (hoa mai)', bg: '#fffbeb', ink: '#b91c1c', soft: '#eab308', deco: 'blossom', petal: '#facc15' },
  peach: { name: 'Peach blossom (hoa đào)', bg: '#fdf2f8', ink: '#9d174d', soft: '#ec4899', deco: 'blossom', petal: '#f9a8d4' },
  tetgold: { name: 'Lucky gold', bg: '#7f1d1d', ink: '#fef3c7', soft: '#fbbf24', deco: 'lanterns' },
  hearts: { name: 'Hearts', bg: '#fff1f2', ink: '#be123c', soft: '#fb7185', deco: 'hearts', script: true },
  rose: { name: 'Red rose', bg: '#881337', ink: '#fff1f2', soft: '#fda4af', deco: 'hearts', script: true },
  lkraft: { name: 'Kraft love', bg: '#d6b48a', ink: '#7f1d1d', soft: '#be123c', deco: 'hearts', script: true },
  floral: { name: 'Flowers', bg: '#fff7f5', ink: '#9d174d', soft: '#f472b6', deco: 'flowers', script: true },
  mclassic: { name: 'Classic blue', bg: '#f8fafc', ink: '#1e3a8a', soft: '#60a5fa', deco: 'leaves' },
  mgold: { name: 'Golden', bg: '#fffbeb', ink: '#92400e', soft: '#f59e0b', deco: 'flowers', script: true },
  eggs: { name: 'Easter eggs', bg: '#f0fdf4', ink: '#7c3aed', soft: '#f472b6', deco: 'eggs' },
  spring: { name: 'Spring blossom', bg: '#fdf2f8', ink: '#831843', soft: '#86efac', deco: 'blossom', petal: '#fbcfe8', script: true },
  autumn: { name: 'Autumn leaves', bg: '#fff7ed', ink: '#7c2d12', soft: '#ea580c', deco: 'autumn', script: true },
  harvest: { name: 'Harvest', bg: '#78350f', ink: '#fef3c7', soft: '#f59e0b', deco: 'autumn' },
  pumpkins: { name: 'Pumpkins', bg: '#fff7ed', ink: '#7c2d12', soft: '#f97316', deco: 'pumpkins' },
  spooky: { name: 'Spooky night', bg: '#1f1235', ink: '#fdba74', soft: '#f97316', deco: 'pumpkins' },
};
const FONTS = {
  classic: { name: 'Classic (Georgia)', head: "Georgia, 'Times New Roman', serif", body: "Georgia, 'Times New Roman', serif", ratio: 0.6, bold: true },
  script: { name: 'Script', head: "'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', cursive", body: "Georgia, serif", ratio: 0.52 },
  elegant: { name: 'Elegant (Gabriola)', head: "Gabriola, 'Palatino Linotype', Georgia, serif", body: "'Palatino Linotype', Georgia, serif", ratio: 0.42 },
  hand: { name: 'Handwritten', head: "'Ink Free', 'Segoe Print', 'Comic Sans MS', cursive", body: "'Segoe Print', 'Ink Free', cursive", ratio: 0.55 },
  modern: { name: 'Modern', head: "Bahnschrift, 'Segoe UI', Arial, sans-serif", body: "'Segoe UI', Arial, sans-serif", ratio: 0.58, bold: true, upper: true },
  palatino: { name: 'Book (Palatino)', head: "'Palatino Linotype', 'Book Antiqua', Georgia, serif", body: "'Palatino Linotype', Georgia, serif", ratio: 0.56, italic: true },
};
// ---------- drawn decorations ----------
const f1 = (v) => v.toFixed(1);
function snowflake(x, y, r, c, o) {
  let s = `<g transform="translate(${f1(x)},${f1(y)})" stroke="${c}" stroke-width="${f1(Math.max(1, r / 9))}" stroke-linecap="round" opacity="${o.toFixed(2)}">`;
  for (let k = 0; k < 6; k++) s += `<g transform="rotate(${k * 60})"><line x1="0" y1="0" x2="0" y2="${f1(-r)}"/><line x1="0" y1="${f1(-r * 0.55)}" x2="${f1(r * 0.25)}" y2="${f1(-r * 0.78)}"/><line x1="0" y1="${f1(-r * 0.55)}" x2="${f1(-r * 0.25)}" y2="${f1(-r * 0.78)}"/></g>`;
  return s + '</g>';
}
function holly(x, y, r, rot) {
  const leaf = (a) => `<path transform="rotate(${a})" d="M0,0 C${f1(r * 0.3)},${f1(-r * 0.25)} ${f1(r * 0.75)},${f1(-r * 0.3)} ${f1(r * 1.1)},0 C${f1(r * 0.75)},${f1(r * 0.3)} ${f1(r * 0.3)},${f1(r * 0.25)} 0,0Z" fill="#166534"/>`;
  return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot})">${leaf(-25)}${leaf(205)}<circle cx="${f1(-r * 0.08)}" cy="${f1(-r * 0.12)}" r="${f1(r * 0.17)}" fill="#b91c1c"/><circle cx="${f1(r * 0.16)}" cy="${f1(-r * 0.02)}" r="${f1(r * 0.17)}" fill="#dc2626"/><circle cx="${f1(-r * 0.02)}" cy="${f1(r * 0.18)}" r="${f1(r * 0.17)}" fill="#991b1b"/></g>`;
}
function star(x, y, r, c, o) {
  let d = '';
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.42 : r; d += (k ? 'L' : 'M') + f1(x + rr * Math.cos(a)) + ',' + f1(y + rr * Math.sin(a)); }
  return `<path d="${d}Z" fill="${c}" opacity="${o.toFixed(2)}"/>`;
}
function tree(x, y, h, c, o) {
  const w = h * 0.62;
  return `<g opacity="${o}" fill="${c}"><path d="M${f1(x)},${f1(y - h)} L${f1(x + w * 0.38)},${f1(y - h * 0.55)} L${f1(x - w * 0.38)},${f1(y - h * 0.55)}Z"/><path d="M${f1(x)},${f1(y - h * 0.75)} L${f1(x + w * 0.5)},${f1(y - h * 0.25)} L${f1(x - w * 0.5)},${f1(y - h * 0.25)}Z"/><path d="M${f1(x)},${f1(y - h * 0.5)} L${f1(x + w * 0.62)},${f1(y - h * 0.06)} L${f1(x - w * 0.62)},${f1(y - h * 0.06)}Z"/><rect x="${f1(x - h * 0.05)}" y="${f1(y - h * 0.07)}" width="${f1(h * 0.1)}" height="${f1(h * 0.12)}"/></g>`;
}
function heart(x, y, r, c, o) { return `<path transform="translate(${f1(x)},${f1(y)})" d="M0,${f1(r * 0.35)} C${f1(-r * 1.2)},${f1(-r * 0.4)} ${f1(-r * 0.5)},${f1(-r * 1.2)} 0,${f1(-r * 0.45)} C${f1(r * 0.5)},${f1(-r * 1.2)} ${f1(r * 1.2)},${f1(-r * 0.4)} 0,${f1(r * 0.35)}Z" fill="${c}" opacity="${o.toFixed(2)}"/>`; }
function balloon(x, y, r, c) { return `<path d="M${f1(x)},${f1(y + r * 1.25)} q${f1(-r * 0.4)},${f1(r * 0.8)} ${f1(r * 0.1)},${f1(r * 1.7)}" stroke="#94a3b8" stroke-width="${f1(r * 0.07)}" fill="none"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r)}" ry="${f1(r * 1.22)}" fill="${c}"/><path d="M${f1(x - r * 0.18)},${f1(y + r * 1.32)} L${f1(x + r * 0.18)},${f1(y + r * 1.32)} L${f1(x)},${f1(y + r * 1.15)}Z" fill="${c}"/><ellipse cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.45)}" rx="${f1(r * 0.2)}" ry="${f1(r * 0.32)}" fill="#fff" opacity=".45"/>`; }
function flower(x, y, r, c) { let s = `<g transform="translate(${f1(x)},${f1(y)})">`; for (let k = 0; k < 5; k++) { const a = k * 72 * Math.PI / 180; s += `<circle cx="${f1(Math.cos(a) * r * 0.55)}" cy="${f1(Math.sin(a) * r * 0.55)}" r="${f1(r * 0.45)}" fill="${c}" opacity=".8"/>`; } return s + `<circle r="${f1(r * 0.28)}" fill="#fde68a"/></g>`; }
function sprig(x, y, len, rot, c) { let s = `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot})"><path d="M0,0 Q${f1(len * 0.1)},${f1(len * 0.5)} 0,${f1(len)}" stroke="${c}" stroke-width="${f1(len * 0.025)}" fill="none"/>`; for (let k = 1; k <= 5; k++) { const yy = len * k / 6, side = k % 2 ? 1 : -1; s += `<ellipse cx="${f1(side * len * 0.12)}" cy="${f1(yy)}" rx="${f1(len * 0.11)}" ry="${f1(len * 0.05)}" transform="rotate(${side * 35} ${f1(side * len * 0.12)} ${f1(yy)})" fill="${c}" opacity=".8"/>`; } return s + '</g>'; }
function branch(x, y, len, petal, flip) { const dx = flip ? 1 : -1, dy = flip ? -1 : 1; let s = `<path d="M${f1(x)},${f1(y)} q${f1(dx * len * 0.5)},${f1(dy * len * 0.1)} ${f1(dx * len)},${f1(dy * len * 0.55)}" stroke="#78350f" stroke-width="${f1(len * 0.035)}" fill="none" stroke-linecap="round"/>`; for (let k = 1; k <= 4; k++) { const fr = k / 4.5; s += flower(x + dx * len * fr, y + dy * len * (0.05 + fr * fr * 0.5), len * (0.1 + (k % 2) * 0.04), petal); } return s; }
function lantern(x, y, r, c) { const top = y + r * 1.2; return `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(top)}" stroke="${c}" stroke-width="${f1(r * 0.08)}"/><rect x="${f1(x - r * 0.45)}" y="${f1(top)}" width="${f1(r * 0.9)}" height="${f1(r * 0.22)}" fill="${c}"/><ellipse cx="${f1(x)}" cy="${f1(top + r * 1.15)}" rx="${f1(r)}" ry="${f1(r * 0.95)}" fill="#dc2626" stroke="${c}" stroke-width="${f1(r * 0.08)}"/><path d="M${f1(x)},${f1(top + r * 0.22)} V${f1(top + r * 2.1)}" stroke="${c}" stroke-width="${f1(r * 0.05)}" opacity=".7"/><rect x="${f1(x - r * 0.45)}" y="${f1(top + r * 2.05)}" width="${f1(r * 0.9)}" height="${f1(r * 0.22)}" fill="${c}"/><path d="M${f1(x)},${f1(top + r * 2.27)} v${f1(r * 0.8)}" stroke="${c}" stroke-width="${f1(r * 0.18)}"/>`; }
function gradCap(x, y, r, c, rot) { return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot})"><path d="M${f1(-r)},0 L0,${f1(-r * 0.45)} L${f1(r)},0 L0,${f1(r * 0.45)}Z" fill="${c}"/><path d="M${f1(-r * 0.55)},${f1(r * 0.22)} v${f1(r * 0.45)} q${f1(r * 0.55)},${f1(r * 0.35)} ${f1(r * 1.1)},0 v${f1(-r * 0.45)}" fill="${c}" opacity=".85"/><path d="M0,0 L${f1(r * 0.85)},${f1(r * 0.15)} v${f1(r * 0.6)}" stroke="${c}" stroke-width="${f1(r * 0.07)}" fill="none"/><circle cx="${f1(r * 0.85)}" cy="${f1(r * 0.8)}" r="${f1(r * 0.09)}" fill="${c}"/></g>`; }
function ornament(x, y, len, r, c) { return `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y + len)}" stroke="#a8a29e" stroke-width="${f1(r * 0.06)}"/><rect x="${f1(x - r * 0.28)}" y="${f1(y + len - r * 0.1)}" width="${f1(r * 0.56)}" height="${f1(r * 0.3)}" rx="${f1(r * 0.06)}" fill="#ca8a04"/><circle cx="${f1(x)}" cy="${f1(y + len + r * 1.05)}" r="${f1(r)}" fill="${c}"/><path d="M${f1(x - r * 0.92)},${f1(y + len + r * 0.9)} q${f1(r * 0.92)},${f1(r * 0.4)} ${f1(r * 1.84)},0" stroke="#fde68a" stroke-width="${f1(r * 0.12)}" fill="none" opacity=".8"/><circle cx="${f1(x - r * 0.35)}" cy="${f1(y + len + r * 0.65)}" r="${f1(r * 0.22)}" fill="#fff" opacity=".45"/>`; }
function pineBranch(x, y, len, rot, c) { let s = `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot})"><path d="M0,0 L${f1(len)},0" stroke="#5b3a1d" stroke-width="${f1(len * 0.03)}"/>`; for (let k = 0; k < 14; k++) { const xx = len * (0.05 + k * 0.068), l = len * 0.16 * (1 - k / 22); s += `<path d="M${f1(xx)},0 l${f1(l * 0.5)},${f1(-l)} M${f1(xx)},0 l${f1(l * 0.5)},${f1(l)}" stroke="${c}" stroke-width="${f1(len * 0.018)}" stroke-linecap="round"/>`; } return s + `<circle cx="${f1(len * 0.62)}" cy="${f1(len * 0.06)}" r="${f1(len * 0.04)}" fill="#b91c1c"/><circle cx="${f1(len * 0.69)}" cy="${f1(len * 0.02)}" r="${f1(len * 0.04)}" fill="#dc2626"/></g>`; }
function burst(x, y, r, c) { let s = `<g transform="translate(${f1(x)},${f1(y)})" stroke="${c}" stroke-width="${f1(r * 0.06)}" stroke-linecap="round">`; for (let k = 0; k < 14; k++) { const a = k * Math.PI * 2 / 14; s += `<line x1="${f1(Math.cos(a) * r * 0.3)}" y1="${f1(Math.sin(a) * r * 0.3)}" x2="${f1(Math.cos(a) * r)}" y2="${f1(Math.sin(a) * r)}"/><circle cx="${f1(Math.cos(a) * r * 1.12)}" cy="${f1(Math.sin(a) * r * 1.12)}" r="${f1(r * 0.05)}" fill="${c}" stroke="none"/>`; } return s + '</g>'; }
function egg(x, y, r, c, rot) { return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot})"><path d="M0,${f1(-r * 1.3)} C${f1(r)},${f1(-r * 1.3)} ${f1(r)},${f1(r)} 0,${f1(r)} C${f1(-r)},${f1(r)} ${f1(-r)},${f1(-r * 1.3)} 0,${f1(-r * 1.3)}Z" fill="${c}"/><path d="M${f1(-r * 0.85)},${f1(-r * 0.1)} l${f1(r * 0.42)},${f1(-r * 0.25)} l${f1(r * 0.42)},${f1(r * 0.25)} l${f1(r * 0.42)},${f1(-r * 0.25)} l${f1(r * 0.42)},${f1(r * 0.25)}" stroke="#fff" stroke-width="${f1(r * 0.12)}" fill="none" opacity=".8"/></g>`; }
function mapleLeaf(x, y, r, c, rot) { let d = ''; const pts = [[0, -1], [0.25, -0.55], [0.6, -0.7], [0.48, -0.3], [0.95, -0.1], [0.5, 0.1], [0.62, 0.45], [0.1, 0.3], [0, 0.75], [-0.1, 0.3], [-0.62, 0.45], [-0.5, 0.1], [-0.95, -0.1], [-0.48, -0.3], [-0.6, -0.7], [-0.25, -0.55]]; pts.forEach(([px, py], i) => { d += (i ? 'L' : 'M') + f1(px * r) + ',' + f1(py * r); }); return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot})"><path d="${d}Z" fill="${c}"/><path d="M0,${f1(r * 0.75)} v${f1(r * 0.45)}" stroke="${c}" stroke-width="${f1(r * 0.08)}"/></g>`; }
function pumpkin(x, y, r, c) { return `<g transform="translate(${f1(x)},${f1(y)})"><rect x="${f1(-r * 0.1)}" y="${f1(-r * 1.15)}" width="${f1(r * 0.2)}" height="${f1(r * 0.4)}" fill="#4d7c0f"/><ellipse cx="${f1(-r * 0.45)}" cy="0" rx="${f1(r * 0.6)}" ry="${f1(r * 0.85)}" fill="${c}"/><ellipse cx="${f1(r * 0.45)}" cy="0" rx="${f1(r * 0.6)}" ry="${f1(r * 0.85)}" fill="${c}"/><ellipse cx="0" cy="0" rx="${f1(r * 0.55)}" ry="${f1(r * 0.9)}" fill="${c}" stroke="#9a3412" stroke-width="${f1(r * 0.05)}"/></g>`; }
// decorations scattered over an area, always in the same places (seeded); the middle stays free for the words
function decorations(t, x, y, w, h, scale) {
  let s = '', seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const ry = () => (rnd() < 0.55 ? y + rnd() * h * 0.2 : y + h * 0.8 + rnd() * h * 0.18);
  const edge = () => (rnd() < 0.6 ? [x + rnd() * w, y + rnd() * h * 0.17] : [rnd() < 0.5 ? x + rnd() * w * 0.09 : x + w * 0.91 + rnd() * w * 0.09, y + rnd() * h]);
  const d = t.deco;
  if (d === 'holly') s += holly(x + w - 26 * scale, y + 26 * scale, 26 * scale, 20) + holly(x + 24 * scale, y + h - 22 * scale, 20 * scale, 200);
  else if (d === 'snow') { for (let k = 0; k < 10; k++) s += snowflake(x + rnd() * w, ry(), (6 + rnd() * 10) * scale, t.soft, 0.18 + rnd() * 0.25); }
  else if (d === 'stars') { for (let k = 0; k < 11; k++) s += star(x + rnd() * w, ry(), (3 + rnd() * 6) * scale, t.soft, 0.35 + rnd() * 0.5); }
  else if (d === 'trees') { for (let k = 0; k < 4; k++) s += tree(x + w * (0.12 + k * 0.25), y + h - 6 * scale, (16 + (k % 2) * 8) * scale, t.soft, 0.55); }
  else if (d === 'hearts') { for (let k = 0; k < 9; k++) { const [hx, hy] = edge(); s += heart(hx, hy, (4 + rnd() * 6) * scale, k % 3 ? t.soft : t.ink, 0.3 + rnd() * 0.4); } }
  else if (d === 'confetti') { const cols = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', t.soft]; for (let k = 0; k < 22; k++) { const [cx, cy] = edge(), c = cols[k % cols.length], r = (2 + rnd() * 3) * scale; s += k % 2 ? `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${c}" opacity=".85"/>` : `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(r * 2.6)}" height="${f1(r * 1.1)}" fill="${c}" opacity=".85" transform="rotate(${Math.round(rnd() * 180)} ${f1(cx)} ${f1(cy)})"/>`; } }
  else if (d === 'balloons') { const cols = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981']; s += balloon(x + w - 30 * scale, y + 20 * scale, 11 * scale, cols[0]) + balloon(x + w - 50 * scale, y + 27 * scale, 9 * scale, cols[1]) + balloon(x + w - 13 * scale, y + 31 * scale, 8 * scale, cols[2]) + balloon(x + 18 * scale, y + h - 48 * scale, 9 * scale, cols[3]); }
  else if (d === 'dots') { for (let k = 0; k < 16; k++) { const [dx, dy] = edge(); s += `<circle cx="${f1(dx)}" cy="${f1(dy)}" r="${f1((2 + rnd() * 4) * scale)}" fill="${t.soft}" opacity="${(0.3 + rnd() * 0.4).toFixed(2)}"/>`; } }
  else if (d === 'flowers') s += flower(x + w - 26 * scale, y + 26 * scale, 14 * scale, t.soft) + flower(x + w - 50 * scale, y + 16 * scale, 8 * scale, t.soft) + flower(x + 24 * scale, y + h - 24 * scale, 11 * scale, t.soft);
  else if (d === 'leaves') s += sprig(x + w - 4 * scale, y + 4 * scale, 52 * scale, 45, t.soft) + sprig(x + w - 4 * scale, y + 4 * scale, 34 * scale, 75, t.soft) + sprig(x + 4 * scale, y + h - 4 * scale, 44 * scale, 225, t.soft);
  else if (d === 'blossom') s += branch(x + w, y, 70 * scale, t.petal || '#facc15') + branch(x, y + h, 50 * scale, t.petal || '#facc15', true);
  else if (d === 'lanterns') s += lantern(x + w - 22 * scale, y, 12 * scale, t.soft) + lantern(x + w - 48 * scale, y, 8 * scale, t.soft) + lantern(x + 18 * scale, y, 9 * scale, t.soft);
  else if (d === 'caps') { s += gradCap(x + w - 32 * scale, y + 26 * scale, 18 * scale, t.soft, -12) + gradCap(x + 26 * scale, y + h - 26 * scale, 13 * scale, t.soft, 14); for (let k = 0; k < 6; k++) { const [sx, sy] = edge(); s += star(sx, sy, (2 + rnd() * 3) * scale, t.soft, 0.5); } }
  else if (d === 'plaid') { const b = 9 * scale; s += `<g opacity=".9"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(b)}" fill="${t.soft}"/><rect x="${f1(x)}" y="${f1(y + h - b)}" width="${f1(w)}" height="${f1(b)}" fill="${t.soft}"/>`; for (let k = 0; k * b * 2 < w; k++) s += `<rect x="${f1(x + k * b * 2)}" y="${f1(y)}" width="${f1(b)}" height="${f1(b)}" fill="#1c1917"/><rect x="${f1(x + k * b * 2)}" y="${f1(y + h - b)}" width="${f1(b)}" height="${f1(b)}" fill="#1c1917"/>`; s += '</g>' + holly(x + w - 22 * scale, y + 24 * scale, 16 * scale, 15); }
  else if (d === 'ornaments') { const cols = [t.soft, '#ca8a04', '#166534', '#1d4ed8']; [0.08, 0.2, 0.8, 0.92].forEach((p, k) => { s += ornament(x + w * p, y, (10 + (k % 2) * 16) * scale, (7 + (k % 2) * 2) * scale, cols[k % 4]); }); }
  else if (d === 'pine') s += pineBranch(x - 4 * scale, y + 10 * scale, 90 * scale, 15, t.soft) + pineBranch(x + w + 4 * scale, y + 10 * scale, 90 * scale, 165, t.soft);
  else if (d === 'fireworks') { const cols = ['#f472b6', '#fde68a', '#60a5fa', '#34d399']; for (let k = 0; k < 4; k++) s += burst(x + w * (0.1 + 0.27 * k), y + (k % 2 ? 26 : 16) * scale, (10 + (k % 2) * 6) * scale, cols[k]); for (let k = 0; k < 8; k++) { const [sx, sy] = edge(); s += star(sx, sy, (1.5 + rnd() * 2.5) * scale, '#fde68a', 0.7); } }
  else if (d === 'eggs') { const cols = ['#f472b6', '#60a5fa', '#facc15', '#a78bfa', '#34d399']; for (let k = 0; k < 5; k++) s += egg(x + w * (0.1 + k * 0.2), y + h - 14 * scale, (7 + (k % 2) * 2) * scale, cols[k], (k - 2) * 12); }
  else if (d === 'autumn') { const cols = ['#ea580c', '#b45309', '#dc2626', '#ca8a04']; for (let k = 0; k < 9; k++) { const [lx, ly] = edge(); s += mapleLeaf(lx, ly, (6 + rnd() * 6) * scale, cols[k % 4], Math.round(rnd() * 360)); } }
  else if (d === 'pumpkins') { s += pumpkin(x + 22 * scale, y + h - 16 * scale, 12 * scale, '#f97316') + pumpkin(x + 44 * scale, y + h - 12 * scale, 8 * scale, '#fb923c') + pumpkin(x + w - 24 * scale, y + h - 15 * scale, 11 * scale, '#ea580c'); for (let k = 0; k < 6; k++) s += star(x + rnd() * w, y + rnd() * h * 0.18, (2 + rnd() * 2) * scale, t.soft, 0.55); }
  return s;
}
