// ═══════════════════════════════════════════════════════════════
//  script.js  —  UFC Ranking
//  Persistencia: localStorage
//  Imágenes: cargadas como base64 en memoria
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────
//  ESTADO
// ─────────────────────────────────────────
let fighters   = [];
let APB_EVENTS = [];
let openCard   = null;

// Mapa nombre_archivo → dataURL (base64)
const imageCache = {};

let modalPenalties = [];

const LS_FIGHTERS  = 'ufc_fighters_v2';
const LS_EVENTS    = 'ufc_events_v2';

// ─────────────────────────────────────────
//  DATOS POR DEFECTO
// ─────────────────────────────────────────
const DEFAULT_FIGHTERS = [
  { name: "JP Reus Álvarez",                   w:1, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Nun-Kal Gym",                        w:1, wko:1, wsplit:0, l:0, lko:0, lsplit:0, d:2 },
  { name: "German Joven",                       w:1, wko:1, wsplit:0, l:0, lko:0, lsplit:0, d:1 },
  { name: "JP 'Little Dick' Fajardo",           w:0, wko:0, wsplit:0, l:2, lko:1, lsplit:0, d:0 },
  { name: "El Futbolista PSOE",                 w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Juan Puvalgia Sánchez",              w:0, wko:0, wsplit:0, l:2, lko:1, lsplit:0, d:0 },
  { name: "Dana Michelo White",                 w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Pastranin",                          w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Mini JP",                            w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Batman Dortmund",                    w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Der Führer",                         w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:1 },
  { name: "Jeffrey Epstein",                    w:1, wko:1, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Der Kaiser",                         w:1, wko:1, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "GutiGamerPro777",                    w:0, wko:0, wsplit:0, l:2, lko:2, lsplit:0, d:0 },
  { name: "Kevin Roldan",                       w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "JAlvarez el 'Dueño del Sistema'",    w:2, wko:1, wsplit:0, l:1, lko:1, lsplit:0, d:0 },
  { name: "The Snuf Snuf Machine",              w:1, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
  { name: "Super Raul",                         w:0, wko:0, wsplit:0, l:1, lko:0, lsplit:0, d:0 },
];

const DEFAULT_EVENTS = [
  { id:1,  name:"UFC 1:",                date:"12 Sept 2025", arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"The Snuf Snuf Machine vs Super Raul",                           f1:"The Snuf Snuf Machine",          f2:"Super Raul",                       winner:"The Snuf Snuf Machine",           method:"Decision",            isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:2,  name:"UFC 2:",                date:"19 Sept 2025", arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"Nun-Kal Gym vs JAlvarez el 'Dueño del Sistema'",                f1:"Nun-Kal Gym",                    f2:"JAlvarez el 'Dueño del Sistema'",  winner:"Nun-Kal Gym",                     method:"KO",                  isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:3,  name:"UFC 3: The Fat Night",  date:"26 Sept 2025", arena:"Wembley Center",   penalties:[], fights:[{ subtitle:"GutiGamerPro777 vs Der Kaiser",                                 f1:"GutiGamerPro777",                f2:"Der Kaiser",                       winner:"Der Kaiser",                      method:"KO",                  isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:4,  name:"UFC 4:",                date:"31 Oct 2025",  arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"JP 'Little Dick' Fajardo vs German Joven",                      f1:"JP 'Little Dick' Fajardo",       f2:"German Joven",                     winner:"German Joven",                    method:"KO",                  isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:5,  name:"UFC 5:",                date:"7 Nov 2025",   arena:"South City Arena", penalties:[], fights:[{ subtitle:"Juan Puvalgia Sánchez vs JAlvarez el 'Dueño del Sistema'",      f1:"Juan Puvalgia Sánchez",          f2:"JAlvarez el 'Dueño del Sistema'",  winner:"JAlvarez el 'Dueño del Sistema'", method:"KO",                  isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:6,  name:"JP's UFC Fight Night:", date:"14 Nov 2025",  arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"JP 'Little Dick' Fajardo vs JP Reus Álvarez",                   f1:"JP 'Little Dick' Fajardo",       f2:"JP Reus Álvarez",                  winner:"JP Reus Álvarez",                 method:"Decision",            isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:7,  name:"UFC 6:",                date:"28 Nov 2025",  arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"GutiGamerPro777 vs Jeffrey Epstein",                            f1:"GutiGamerPro777",                f2:"Jeffrey Epstein",                  winner:"Jeffrey Epstein",                 method:"KO",                  isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:8,  name:"UFC 7:",                date:"6 Feb 2026",   arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"Juan Puvalgia Sánchez vs JAlvarez el 'Dueño del Sistema' 2",    f1:"Juan Puvalgia Sánchez",          f2:"JAlvarez el 'Dueño del Sistema'",  winner:"JAlvarez el 'Dueño del Sistema'", method:"Decision",            isDraw:false, isTitleBout:false, titleBoutName:"" }] },
  { id:9,  name:"UFC 8:",                date:"13 Feb 2026",  arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"Nun-Kal Gym vs Der Führer",                                      f1:"Nun-Kal Gym",                    f2:"Der Führer",                       winner:null,                              method:"No Fighter Defeated", isDraw:true,  isTitleBout:false, titleBoutName:"" }] },
  { id:10, name:"UFC 9:",                date:"20 Feb 2026",  arena:"Arena Panenka",    penalties:[], fights:[{ subtitle:"Nun-Kal Gym vs German Joven",                                    f1:"Nun-Kal Gym",                    f2:"German Joven",                     winner:null,                              method:"No Fighter Defeated", isDraw:true,  isTitleBout:false, titleBoutName:"" }] },
];

// ─────────────────────────────────────────
//  MIGRACIÓN
// ─────────────────────────────────────────
function migrateEvent(ev) {
  let base = ev;
  if (!ev.fights) {
    base = {
      id: ev.id, name: ev.name, date: ev.date, arena: ev.arena,
      fights: [{
        subtitle:      ev.subtitle      || '',
        f1:            ev.f1,
        f2:            ev.f2,
        winner:        ev.winner,
        method:        ev.method,
        isDraw:        ev.isDraw,
        isTitleBout:   ev.isTitleBout   || false,
        titleBoutName: ev.titleBoutName || '',
      }],
    };
  }
  if (!base.penalties) base.penalties = [];
  return base;
}
function migrateEvents(arr) { return arr.map(migrateEvent); }

// ─────────────────────────────────────────
//  CARGA DE ARCHIVOS (importación)
// ─────────────────────────────────────────
function loadFightersFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      fighters = JSON.parse(e.target.result);
      localStorage.setItem(LS_FIGHTERS, JSON.stringify(fighters));
      recalcAllRecords();
      buildRankingTab(); buildAPBTab(); buildTimelineTab();
      hideBannerIfDataLoaded();
      showToast('fighters.json cargado');
    } catch { showToast('Error al leer fighters.json'); }
  };
  reader.readAsText(file);
  input.value = '';
}

function loadEventsFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      APB_EVENTS = migrateEvents(JSON.parse(e.target.result));
      localStorage.setItem(LS_EVENTS, JSON.stringify(APB_EVENTS));
      recalcAllRecords();
      buildRankingTab(); buildAPBTab(); buildTimelineTab();
      hideBannerIfDataLoaded();
      showToast('events.json cargado');
    } catch { showToast('Error al leer events.json'); }
  };
  reader.readAsText(file);
  input.value = '';
}

function loadImagesFiles(input) {
  const files = [...input.files]; if (!files.length) return;
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      imageCache[file.name] = e.target.result;
      loaded++;
      if (loaded === files.length) {
        buildRankingTab(); buildAPBTab(); buildTimelineTab();
        hideBannerIfDataLoaded();
        showToast(`${loaded} imagen${loaded > 1 ? 'es' : ''} cargada${loaded > 1 ? 's' : ''}`);
      }
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function updateImportBanner() {
  const fBtn   = document.getElementById('import-btn-fighters');
  const eBtn   = document.getElementById('import-btn-events');
  const iBtn   = document.getElementById('import-btn-images');
  const status = document.getElementById('import-status');
  const banner = document.getElementById('importBanner');

  const hasFighters = fighters.length > 0;
  const hasEvents   = APB_EVENTS.length > 0;
  const hasImages   = Object.keys(imageCache).length > 0;

  if (fBtn) fBtn.classList.toggle('connected', !!hasFighters);
  if (eBtn) eBtn.classList.toggle('connected', !!hasEvents);
  if (iBtn) iBtn.classList.toggle('connected', hasImages);

  if (hasFighters && hasEvents) {
    const imgCount = Object.keys(imageCache).length;
    status.textContent = hasImages
      ? `Datos cargados — ${imgCount} imagen${imgCount > 1 ? 'es' : ''} en memoria`
      : 'Datos cargados — puedes cargar imágenes de luchadores';
    status.className = 'import-status-text ok';
    setTimeout(() => {
      banner.classList.add('connected');
      document.body.classList.add('import-hidden');
    }, 1200);
  } else {
    const missing = [];
    if (!hasFighters) missing.push('fighters.json');
    if (!hasEvents)   missing.push('events.json');
    status.textContent = missing.length === 2
      ? 'Importa tus archivos para cargar datos'
      : `Falta: ${missing.join(', ')}`;
    status.className = 'import-status-text';
    banner.classList.remove('connected');
    document.body.classList.remove('import-hidden');
  }
}

// ─────────────────────────────────────────
//  RESOLUCIÓN DE IMÁGENES
// ─────────────────────────────────────────
function resolveAvatar(imgFilename) {
  if (!imgFilename) return null;
  // Primero: cache en memoria (importadas)
  if (imageCache[imgFilename]) return imageCache[imgFilename];
  // Fallback: ruta relativa (si se sirve con servidor)
  return `img/${imgFilename}`;
}

// ─────────────────────────────────────────
//  PERSISTENCIA (solo localStorage)
// ─────────────────────────────────────────
async function saveAll() {
  try {
    localStorage.setItem(LS_FIGHTERS, JSON.stringify(fighters));
    localStorage.setItem(LS_EVENTS, JSON.stringify(APB_EVENTS));
  } catch (e) { console.warn('localStorage:', e); }
}

function loadInitialData() {
  try {
    const f = localStorage.getItem(LS_FIGHTERS);
    const e = localStorage.getItem(LS_EVENTS);
    if (f && e) { fighters = JSON.parse(f); APB_EVENTS = migrateEvents(JSON.parse(e)); return; }
  } catch { /* fallback */ }
  fighters   = JSON.parse(JSON.stringify(DEFAULT_FIGHTERS));
  APB_EVENTS = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
}

async function persistAndRefresh() {
  await saveAll();
  buildRankingTab(); buildAPBTab(); buildTimelineTab();
}

// ─────────────────────────────────────────
//  SCORING
// ─────────────────────────────────────────
function calcScore(f) {
  const ws = f.wsplit || 0, ls = f.lsplit || 0;
  return (f.w - f.wko - ws) * 5 + f.wko * 7 + ws * 3
       + (f.l - f.lko - ls) * -3 + f.lko * -5 + ls * -1
       + f.d * 2
       + (f.bonusPts   || 0)
       - (f.penaltyPts || 0);
}

function normName(n) { return n.trim().toLowerCase().replace(/\s+/g, ' ').replace(/['']/g, "'"); }

// ─────────────────────────────────────────
//  SISTEMA BRECHA + CONTUNDENCIA
// ─────────────────────────────────────────
function calcBonusForFight(ft, scoresBefore) {
  const zero = { bonus: 0, underdogName: null };
  if (ft.isDraw || !ft.winner) return zero;

  const n1 = normName(ft.f1), n2 = normName(ft.f2);
  if (!(n1 in scoresBefore) || !(n2 in scoresBefore)) return zero;

  const s1 = scoresBefore[n1], s2 = scoresBefore[n2];
  if (s1 === s2) return zero;

  const undNorm  = s1 > s2 ? n2 : n1;
  const undName  = s1 > s2 ? ft.f2 : ft.f1;
  const absDiff  = Math.abs(s1 - s2);

  if (normName(ft.winner) !== undNorm) return zero;

  if (absDiff < 4) return zero;
  let brechaBonus;
  if      (absDiff <=  7) brechaBonus = 1;
  else if (absDiff <= 12) brechaBonus = 2;
  else                    brechaBonus = 3;

  let contundenciaBonus;
  if      (ft.method === 'KO')             contundenciaBonus = 2;
  else if (ft.method === 'Split Decision') contundenciaBonus = 0;
  else                                     contundenciaBonus = 1;

  return { bonus: brechaBonus + contundenciaBonus, underdogName: undName };
}

function getTitleBoutStats(fighterName) {
  const norm = normName(fighterName);
  let total = 0, wins = 0, losses = 0, draws = 0;
  for (const ev of APB_EVENTS) {
    if (ev.isPending) continue;
    for (const ft of ev.fights) {
      if (!ft.isTitleBout) continue;
      if (normName(ft.f1) !== norm && normName(ft.f2) !== norm) continue;
      total++;
      if (ft.isDraw)                               draws++;
      else if (normName(ft.winner || '') === norm)  wins++;
      else                                          losses++;
    }
  }
  return { total, wins, losses, draws };
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
function countMatchups(n1, n2, excludeId = null) {
  let count = 0;
  const a = normName(n1), b = normName(n2);
  for (const ev of APB_EVENTS) {
    if (excludeId !== null && ev.id === excludeId) continue;
    for (const ft of ev.fights) {
      if ((normName(ft.f1)===a && normName(ft.f2)===b) || (normName(ft.f1)===b && normName(ft.f2)===a)) count++;
    }
  }
  return count;
}

function genSubtitle(f1, f2, excludeId = null) {
  if (!f1 || !f2 || f1 === f2) return '';
  const times = countMatchups(f1, f2, excludeId);
  return times === 0 ? `${f1} vs ${f2}` : `${f1} vs ${f2} ${times + 1}`;
}

function suggestEventName() {
  if (!APB_EVENTS.length) return '';
  const last  = APB_EVENTS[APB_EVENTS.length - 1].name;
  const match = last.match(/^(.*?)(\d+)(\D*)$/);
  return match ? `${match[1]}${parseInt(match[2]) + 1}${match[3]}` : '';
}

// ─────────────────────────────────────────
//  TAB: RANKING
// ─────────────────────────────────────────
function buildRankingTab() {
  const ranked   = fighters.filter(f => f.w + f.l + f.d > 0);
  const unranked = fighters.filter(f => f.w + f.l + f.d === 0);
  ranked.sort((a, b) => {
    const d = calcScore(b) - calcScore(a); if (d !== 0) return d;
    const tf = (b.w+b.l+b.d) - (a.w+a.l+a.d); if (tf !== 0) return tf;
    const tw = b.w - a.w; if (tw !== 0) return tw;
    const ko = b.wko - a.wko; if (ko !== 0) return ko;
    const wd = (b.w-b.wko-(b.wsplit||0)) - (a.w-a.wko-(a.wsplit||0)); if (wd !== 0) return wd;
    const ws = (b.wsplit||0) - (a.wsplit||0); if (ws !== 0) return ws;
    return a.l - b.l;
  });
  const list = document.getElementById('rankingList');
  list.innerHTML = ''; openCard = null;
  ranked.forEach((f, i) => list.appendChild(buildCard(f, i + 1, false, 0.05 * i + 0.3)));
  if (unranked.length) {
    const div = document.createElement('div'); div.className = 'unranked-divider'; div.innerHTML = '<span>Not ranked</span>'; list.appendChild(div);
    unranked.forEach((f, i) => list.appendChild(buildCard(f, null, true, 0.05 * (ranked.length + i) + 0.3)));
  }
  injectHistories();
}

function buildCard(f, rankNum, isUnranked, animDelay) {
  const card   = document.createElement('div');
  card.className = 'fighter-card' + (isUnranked ? ' unranked' : '');
  const cardId = 'fighter-' + f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  card.id = cardId;
  if (!isUnranked) { if (rankNum===1) card.classList.add('top-1'); else if (rankNum===2) card.classList.add('top-2'); else if (rankNum===3) card.classList.add('top-3'); }
  card.style.animationDelay = `${animDelay}s`;

  const champBadge  = (!isUnranked && rankNum === 1) ? `<span class="champ-badge">CHAMP</span>` : '';
  const pts         = calcScore(f);
  const ptsDisplay  = pts > 0 ? `+${pts}` : `${pts}`;
  const ws = f.wsplit||0, ls = f.lsplit||0;
  const wNormal = f.w - f.wko - ws, lNormal = f.l - f.lko - ls;

  const tb = getTitleBoutStats(f.name);
  const tbFights = [];
  for (const ev of APB_EVENTS) {
    if (ev.isPending) continue;
    for (const ft of ev.fights) {
      if (ft.isTitleBout && (normName(ft.f1)===normName(f.name)||normName(ft.f2)===normName(f.name))) tbFights.push({ev,ft});
    }
  }
  const tbRows = tbFights.map(({ev,ft}) => {
    const won = !ft.isDraw && normName(ft.winner||'')===normName(f.name);
    const cls = ft.isDraw?'dv-draw':(won?'dv-title-win':'dv-title-loss');
    return `<div class="detail-item tb-fight-row" style="grid-column:1/-1">
      <span class="detail-label tb-fight-label">${ft.titleBoutName||'Title Bout'}</span>
      <span class="detail-value tb-fight-result ${cls}">${ft.isDraw?'Draw':(won?'Win':'Loss')} <span class="tb-fight-event">${ev.name}</span></span>
    </div>`;
  }).join('');

  const tbBlock = tb.total > 0 ? `
    <div class="detail-sep"></div>
    <div class="detail-item title-bout-item"><span class="detail-label">Title Bouts</span><span class="detail-value dv-title">${tb.total}</span></div>
    <div class="detail-item title-bout-item"><span class="detail-label">Title Wins</span><span class="detail-value dv-title-win">${tb.wins}</span></div>
    <div class="detail-item title-bout-item"><span class="detail-label">Title Losses</span><span class="detail-value dv-title-loss">${tb.losses}</span></div>
    ${tb.draws?`<div class="detail-item title-bout-item"><span class="detail-label">Title Draws</span><span class="detail-value dv-draw">${tb.draws}</span></div>`:''}
    ${tbRows}` : '';

  // Resolución de imagen desde cache o ruta relativa
  const avatarSrc = f.img ? resolveAvatar(f.img) : null;
  const avatarHTML = avatarSrc
    ? `<div class="fighter-avatar">
         <img src="${avatarSrc}"
              onerror="this.parentElement.style.display='none'"
              alt="${f.name}" draggable="false">
       </div>`
    : '';

  card.innerHTML = `
    ${champBadge}
    <div class="card-main">
      <div class="rank">${isUnranked?'—':rankNum}</div>
      <div class="fighter-info">
        ${avatarHTML}
        <div class="fighter-text">
        <div class="fighter-name">${f.name}</div>
        <div class="fighter-record">
          <span class="rec-win">${f.w} W</span><span class="rec-sep">—</span>
          <span class="rec-loss">${f.l} L</span><span class="rec-sep">—</span>
          <span class="rec-draw">${f.d} D</span>
        </div>
        </div><!-- /fighter-text -->
      </div>
      <div class="record-badge">${f.w}–${f.l}–${f.d}</div>
      <div class="score-badge ${pts>=0?'score-pos':'score-neg'}">${ptsDisplay} pts</div>
      <div class="toggle-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1.5,3.5 6.5,9.5 11.5,3.5"/></svg></div>
    </div>
    <div class="card-detail">
      <div class="card-detail-inner">
        <div class="detail-item"><span class="detail-label">KO wins</span><span class="detail-value dv-ko-win">${f.wko}</span></div>
        <div class="detail-item"><span class="detail-label">Split wins</span><span class="detail-value dv-win">${ws}</span></div>
        <div class="detail-item"><span class="detail-label">Decision wins</span><span class="detail-value dv-win">${wNormal}</span></div>
        <div class="detail-item"><span class="detail-label">Total wins</span><span class="detail-value dv-win">${f.w}</span></div>
        <div class="detail-sep"></div>
        <div class="detail-item"><span class="detail-label">KO losses</span><span class="detail-value dv-ko-los">${f.lko}</span></div>
        <div class="detail-item"><span class="detail-label">Split losses</span><span class="detail-value dv-loss">${ls}</span></div>
        <div class="detail-item"><span class="detail-label">Decision losses</span><span class="detail-value dv-loss">${lNormal}</span></div>
        <div class="detail-item"><span class="detail-label">Total losses</span><span class="detail-value dv-loss">${f.l}</span></div>
        <div class="detail-sep"></div>
        <div class="detail-item"><span class="detail-label">Draws</span><span class="detail-value dv-draw">${f.d}</span></div>
        <div class="detail-sep"></div>
        <div class="detail-item"><span class="detail-label">Total Points</span><span class="detail-value ${pts>=0?'dv-win':'dv-loss'}">${ptsDisplay}</span></div>
        ${(f.bonusPts||0)!==0?`<div class="detail-item"><span class="detail-label">Upset Bonus</span><span class="detail-value dv-bonus">${(f.bonusPts||0)>0?'+':''}${f.bonusPts||0}</span></div>`:''}
        ${(f.penaltyPts||0)>0?`<div class="detail-item"><span class="detail-label">Penalty</span><span class="detail-value dv-penalty">−${f.penaltyPts}</span></div>`:''}
        ${tbBlock}
      </div>
    </div>`;

  card.addEventListener('click', (e) => {
    const detail = card.querySelector('.card-detail');
    if (openCard && openCard !== card) { openCard.querySelector('.card-detail').style.maxHeight='0'; openCard.classList.remove('is-open'); }
    if (card.classList.contains('is-open')) { detail.style.maxHeight='0'; card.classList.remove('is-open'); openCard=null; }
    else { detail.style.maxHeight=detail.scrollHeight+'px'; card.classList.add('is-open'); openCard=card; }
  });
  return card;
}

// ─────────────────────────────────────────
//  HISTORIAL DE PELEADORES
// ─────────────────────────────────────────
function getFighterHistory(fighterName) {
  const norm = normName(fighterName), rows = [];
  for (const ev of APB_EVENTS) {
    if (ev.isPending) continue;
    for (const ft of ev.fights) {
      if (normName(ft.f1)!==norm && normName(ft.f2)!==norm) continue;
      let result, resultClass;
      if (ft.isDraw)                              { result='Draw'; resultClass='empate';   }
      else if (normName(ft.winner||'')===norm)    { result='Win';  resultClass='victoria'; }
      else                                        { result='Loss'; resultClass='derrota';  }
      rows.push({ev, ft, result, resultClass});
    }
  }
  return rows;
}

function buildHistoryHTML(fighterName) {
  const history = getFighterHistory(fighterName);
  let html = `<div class="apb-history"><div class="apb-history-title">UFC Fight History</div>`;
  if (!history.length) { html += `<div class="apb-history-empty">No fights on record</div>`; }
  else for (const h of history) {
    const titleBadge = h.ft.isTitleBout ? `<div><span class="hist-title-badge">${h.ft.titleBoutName||'Title Bout'}</span></div>` : '';
    const fullEvName = h.ft.subtitle ? `${h.ev.name} ${h.ft.subtitle}` : h.ev.name;
    const fp = fightPoints(h.ft, fighterName);
    const ptsCls = fp.pts > 0 ? 'hist-pts-pos' : fp.pts < 0 ? 'hist-pts-neg' : 'hist-pts-draw';
    const bonusBadge = fp.bonus && fp.bonus !== 0
      ? `<span class="hist-bonus-badge bonus-pos">+${fp.bonus} BONUS</span>` : '';
    html += `<div class="apb-hist-row${h.ft.isTitleBout?' is-title-bout':''}">
      <div><div class="apb-hist-event">${fullEvName}</div>${titleBadge}${bonusBadge}<div class="apb-hist-date">${h.ev.date} · 7:00 PM</div></div>
      <div class="apb-hist-arena">${h.ev.arena}</div>
      <div>
        <div class="apb-hist-result ${h.resultClass}">${h.result}</div>
        <div class="apb-hist-method">${h.ft.method==='KO'?'KO':(h.ft.isDraw?'Draw':h.ft.method)}</div>
        <div class="apb-hist-pts ${ptsCls}">${fp.label} pts</div>
      </div>
    </div>`;
  }
  return html + '</div>';
}

function injectHistories() {
  document.querySelectorAll('.fighter-card').forEach(card => {
    const nameEl = card.querySelector('.fighter-name'), detail = card.querySelector('.card-detail');
    if (!nameEl || !detail) return;
    const div = document.createElement('div');
    div.innerHTML = buildHistoryHTML(nameEl.textContent.trim());
    detail.appendChild(div.firstElementChild);
  });
}

// ─────────────────────────────────────────
//  TAB: HISTORIC
// ─────────────────────────────────────────
function buildAPBTab() {
  const container = document.getElementById('apbEventsList');
  container.innerHTML = '';
  APB_EVENTS.forEach((ev, i) => {
    const card = document.createElement('div');
    card.className = 'apb-card apb-grid-card';
    card.style.animationDelay = `${0.04 * i + 0.1}s`;
    if (ev.fights.some(ft => ft.isTitleBout)) card.classList.add('is-title-bout');
    if (ev.isPending) card.classList.add('is-pending');

    const mainSub   = ev.fights[0]?.subtitle || '';
    const fullTitle = mainSub ? `${ev.name} ${mainSub}` : ev.name;

    const fightsHTML = ev.fights.map((ft, fi) => {
      const isKO    = ft.method === 'KO';
      const f1Class = ft.isDraw ? 'draw' : (normName(ft.f1)===normName(ft.winner||'')?'winner':'loser');
      const f2Class = ft.isDraw ? 'draw' : (normName(ft.f2)===normName(ft.winner||'')?'winner':'loser');
      const rText   = ft.isDraw ? 'Draw' : `Winner: ${ft.winner}`;
      const rColor  = ft.isDraw ? 'draw' : 'win';
      const mColor  = isKO ? 'ko' : (ft.isDraw ? 'draw' : 'win');
      const tBadge  = ft.isTitleBout ? `<div class="apb-title-row"><span class="apb-title-badge">${ft.titleBoutName||'Title Bout'}</span></div>` : '';
      const coSub   = ev.fights.length > 1 && fi > 0 && ft.subtitle
        ? `<div class="apb-grid-fight-sub">${ft.subtitle}</div>` : '';
      const label   = ev.fights.length > 1
        ? `<div class="apb-fight-label">${fi===0?'Main Event':'Co-Main Event'}</div>` : '';
      return `<div class="apb-grid-fight${fi>0?' apb-fight-sep':''}">
        ${label}${coSub}${tBadge}
        <div class="apb-grid-matchup">
          <span class="apb-grid-fighter ${f1Class}">${ft.f1}</span>
          <span class="apb-grid-vs">vs</span>
          <span class="apb-grid-fighter ${f2Class}">${ft.f2}</span>
        </div>
        ${ev.isPending
          ? `<div class="apb-pending-result">Result pending</div>`
          : `<div class="apb-grid-result">
              <span class="apb-result-val ${rColor}">${rText}</span>
              <span class="apb-result-sep">·</span>
              <span class="apb-result-val ${mColor}">${ft.method}</span>
              <span class="apb-result-sep">·</span>
              <span class="apb-grid-pts ${(() => { const p1=fightPoints(ft,ft.f1); return p1.pts>0?'pts-pos':p1.pts<0?'pts-neg':'pts-draw'; })()}">${fightPoints(ft,ft.f1).label}</span>
              <span class="apb-grid-pts-sep">/</span>
              <span class="apb-grid-pts ${(() => { const p2=fightPoints(ft,ft.f2); return p2.pts>0?'pts-pos':p2.pts<0?'pts-neg':'pts-draw'; })()}">${fightPoints(ft,ft.f2).label}</span>
            </div>`
        }
      </div>`;
    }).join('');

    const penHTML = (ev.penalties||[]).length > 0 ? `
      <div class="apb-grid-penalties">
        ${(ev.penalties||[]).map(p=>`<span class="apb-grid-penalty-tag">−${p.pts}pts ${p.fighter}</span>`).join('')}
      </div>` : '';

    card.innerHTML = `
      <div class="apb-grid-head">
        <div class="apb-grid-name">${fullTitle}${ev.isPending?'<span class="apb-pending-badge">Upcoming</span>':''}</div>
        <div class="apb-grid-meta">
          <span class="apb-grid-date">${ev.date}</span>
          <span class="apb-grid-arena">${ev.arena}</span>
        </div>
      </div>
      <div class="apb-grid-fights">${fightsHTML}</div>
      ${penHTML}`;
    container.appendChild(card);
  });
}

// ─────────────────────────────────────────
//  HELPERS DE CÁLCULO
// ─────────────────────────────────────────
function fightPoints(ft, fighterName) {
  const norm    = normName(fighterName);
  const bonus   = ft.bonus || 0;
  const undNorm = ft.underdogName ? normName(ft.underdogName) : null;

  if (ft.isDraw) return { pts: 2, label: '+2', bonus: 0 };
  const won = normName(ft.winner || '') === norm;

  let basePts;
  if (ft.method === 'KO')                  basePts = won ?  7 : -5;
  else if (ft.method === 'Split Decision') basePts = won ?  3 : -1;
  else                                     basePts = won ?  5 : -3;

  let bonusApplied = 0;
  if (bonus > 0 && undNorm && undNorm === norm && won) {
    bonusApplied = bonus;
  }

  const total = basePts + bonusApplied;
  return { pts: total, label: total >= 0 ? `+${total}` : `${total}`, bonus: bonusApplied };
}

function updateStat(name, stat, delta) {
  const f=fighters.find(x=>normName(x.name)===normName(name));
  if (f) f[stat]=Math.max(0,(f[stat]||0)+delta);
}

function recalcAllRecords() {
  fighters.forEach(f => {
    f.w=0; f.wko=0; f.wsplit=0; f.l=0; f.lko=0; f.lsplit=0;
    f.d=0; f.bonusPts=0; f.penaltyPts=0;
  });

  const foughtBefore = new Set();

  for (const ev of APB_EVENTS) {
    if (ev.isPending) continue;

    for (const ft of ev.fights) {
      const scoresBefore = {};
      fighters.forEach(f => {
        if (foughtBefore.has(normName(f.name))) {
          scoresBefore[normName(f.name)] = calcScore(f);
        }
      });

      const { bonus, underdogName } = calcBonusForFight(ft, scoresBefore);
      ft.bonus        = bonus;
      ft.underdogName = underdogName;

      if (ft.isDraw) {
        updateStat(ft.f1,'d',1); updateStat(ft.f2,'d',1);
      } else {
        const loser = normName(ft.f1)===normName(ft.winner||'')?ft.f2:ft.f1;
        updateStat(ft.winner,'w',1); updateStat(loser,'l',1);
        if (ft.method==='KO')             { updateStat(ft.winner,'wko',1);    updateStat(loser,'lko',1);    }
        if (ft.method==='Split Decision') { updateStat(ft.winner,'wsplit',1); updateStat(loser,'lsplit',1); }
        if (bonus > 0 && underdogName) {
          updateStat(underdogName, 'bonusPts', bonus);
        }
      }

      foughtBefore.add(normName(ft.f1));
      foughtBefore.add(normName(ft.f2));
    }

    for (const pen of (ev.penalties || [])) {
      if (pen.fighter && pen.pts > 0) {
        updateStat(pen.fighter, 'penaltyPts', pen.pts);
      }
    }
  }
}

// ─────────────────────────────────────────
//  TAB: TIMELINE
// ─────────────────────────────────────────
let tlCurrentIdx = -1;

function computeRankingSnapshot(upToIdx) {
  const snap = fighters.map(f => ({
    name: f.name,
    w:0, wko:0, wsplit:0, l:0, lko:0, lsplit:0,
    d:0, bonusPts:0, penaltyPts:0
  }));

  const upd = (name, stat, delta) => {
    const f = snap.find(x => normName(x.name) === normName(name));
    if (f) f[stat] = Math.max(0, (f[stat] || 0) + delta);
  };

  const foughtBefore = new Set();

  for (let i = 0; i <= upToIdx; i++) {
    const ev = APB_EVENTS[i];
    if (!ev || ev.isPending) continue;

    for (const ft of ev.fights) {
      const scoresBefore = {};
      snap.forEach(f => {
        if (foughtBefore.has(normName(f.name))) {
          scoresBefore[normName(f.name)] = calcScore(f);
        }
      });

      const { bonus, underdogName } = calcBonusForFight(ft, scoresBefore);

      if (ft.isDraw) {
        upd(ft.f1,'d',1); upd(ft.f2,'d',1);
      } else {
        const loser = normName(ft.f1)===normName(ft.winner||'')?ft.f2:ft.f1;
        upd(ft.winner,'w',1); upd(loser,'l',1);
        if (ft.method==='KO')             { upd(ft.winner,'wko',1);    upd(loser,'lko',1);    }
        if (ft.method==='Split Decision') { upd(ft.winner,'wsplit',1); upd(loser,'lsplit',1); }
        if (bonus > 0 && underdogName) {
          upd(underdogName, 'bonusPts', bonus);
        }
      }

      foughtBefore.add(normName(ft.f1));
      foughtBefore.add(normName(ft.f2));
    }

    for (const pen of (ev.penalties || [])) {
      if (pen.fighter && pen.pts > 0) upd(pen.fighter, 'penaltyPts', pen.pts);
    }
  }

  return snap;
}

function sortSnapshot(snap) {
  const ranked = snap.filter(f => f.w + f.l + f.d > 0);
  ranked.sort((a, b) => {
    const d = calcScore(b) - calcScore(a); if (d !== 0) return d;
    const tf = (b.w+b.l+b.d) - (a.w+a.l+a.d); if (tf !== 0) return tf;
    const tw = b.w - a.w; if (tw !== 0) return tw;
    const ko = b.wko - a.wko; if (ko !== 0) return ko;
    return a.l - b.l;
  });
  return ranked;
}

function findPrevRealEventIdx(evIdx) {
  for (let i = evIdx - 1; i >= 0; i--) {
    if (!APB_EVENTS[i].isPending) return i;
  }
  return -1;
}

function buildTimelineTab() {
  const sel = document.getElementById('tlEventSelector');
  const view = document.getElementById('tlRankingView');
  if (!sel || !view) return;

  const realEvents = APB_EVENTS.map((ev, idx) => ({ev, idx})).filter(x => !x.ev.isPending);

  if (!realEvents.length) {
    sel.innerHTML = '';
    view.innerHTML = '<div class="tl-empty">No hay eventos disputados todavía.</div>';
    tlCurrentIdx = -1;
    return;
  }

  sel.innerHTML = realEvents.map(({ev, idx}) => {
    const mainSub = ev.fights[0]?.subtitle || '';
    const label = mainSub ? `${ev.name} ${mainSub}` : ev.name;
    return `<button class="tl-pill ${idx===tlCurrentIdx?'active':''}" onclick="selectTimelineEvent(${idx})" data-tl-idx="${idx}">
      <span class="tl-pill-name">${label}</span>
      <span class="tl-pill-date">${ev.date}</span>
    </button>`;
  }).join('');

  const defaultIdx = realEvents[realEvents.length - 1].idx;
  const validCurrent = realEvents.some(x => x.idx === tlCurrentIdx);
  selectTimelineEvent(validCurrent ? tlCurrentIdx : defaultIdx);
}

function selectTimelineEvent(evIdx) {
  tlCurrentIdx = evIdx;
  document.querySelectorAll('.tl-pill').forEach(p => p.classList.remove('active'));
  document.querySelector(`.tl-pill[data-tl-idx="${evIdx}"]`)?.classList.add('active');
  renderTimelineRanking(evIdx);
}

function renderTimelineRanking(evIdx) {
  const view = document.getElementById('tlRankingView');
  if (!view) return;

  const ev = APB_EVENTS[evIdx];
  if (!ev) return;

  const snap     = computeRankingSnapshot(evIdx);
  const ranked   = sortSnapshot(snap);

  const prevIdx  = findPrevRealEventIdx(evIdx);
  const prevRanked = prevIdx >= 0 ? sortSnapshot(computeRankingSnapshot(prevIdx)) : [];
  const getPrevRank = name => {
    const i = prevRanked.findIndex(f => normName(f.name) === normName(name));
    return i >= 0 ? i + 1 : null;
  };

  const mainSub  = ev.fights[0]?.subtitle || '';
  const fullTitle = mainSub ? `${ev.name} ${mainSub}` : ev.name;

  const fightsHTML = ev.fights.map(ft => {
    const f1c = ft.isDraw ? 'draw' : (normName(ft.f1)===normName(ft.winner||'')?'winner':'loser');
    const f2c = ft.isDraw ? 'draw' : (normName(ft.f2)===normName(ft.winner||'')?'winner':'loser');
    const hasBonus = (ft.bonus||0) > 0;
    return `<div class="tl-fight-pill">
      <span class="tl-fight-f ${f1c}">${ft.f1}</span>
      <span class="tl-fight-vs">vs</span>
      <span class="tl-fight-f ${f2c}">${ft.f2}</span>
      <span class="tl-fight-method">${ft.isDraw?'Draw':ft.method}</span>
      ${hasBonus?`<span class="tl-fight-bonus">+${ft.bonus} UPSET</span>`:''}
    </div>`;
  }).join('');

  const penHTML = (ev.penalties||[]).length > 0 ? `
    <div class="tl-event-penalties">
      <span class="tl-pen-label">Penalizaciones aplicadas:</span>
      ${(ev.penalties||[]).map(p=>`<span class="tl-pen-tag">−${p.pts}pts ${p.fighter}</span>`).join('')}
    </div>` : '';

  let tableHTML = `<div class="tl-ranking-table">`;
  ranked.forEach((f, i) => {
    const rank    = i + 1;
    const pts     = calcScore(f);
    const ptsDisp = pts >= 0 ? `+${pts}` : `${pts}`;
    const prevRank = getPrevRank(f.name);

    let changeEl;
    if (!prevRank) {
      changeEl = `<span class="tl-change tl-change-new">NEW</span>`;
    } else {
      const delta = prevRank - rank;
      if      (delta > 0) changeEl = `<span class="tl-change tl-change-up">▲${delta}</span>`;
      else if (delta < 0) changeEl = `<span class="tl-change tl-change-down">▼${Math.abs(delta)}</span>`;
      else                changeEl = `<span class="tl-change tl-change-same">—</span>`;
    }

    const topCls = rank===1?' tl-row-top1':rank===2?' tl-row-top2':rank===3?' tl-row-top3':'';
    const penBadge = (f.penaltyPts||0) > 0 ? `<span class="tl-row-pen">−${f.penaltyPts}PEN</span>` : '';
    const bonusBadge = (f.bonusPts||0) > 0 ? `<span class="tl-row-bonus">+${f.bonusPts}B</span>` : '';

    tableHTML += `<div class="tl-row${topCls}">
      <div class="tl-row-rank">${rank}</div>
      ${changeEl}
      <div class="tl-row-name">${f.name}</div>
      <div class="tl-row-record">${f.w}–${f.l}–${f.d}</div>
      <div class="tl-row-badges">${bonusBadge}${penBadge}</div>
      <div class="tl-row-pts ${pts>=0?'pos':'neg'}">${ptsDisp} pts</div>
    </div>`;
  });
  tableHTML += '</div>';

  const notYet = snap.filter(f => f.w + f.l + f.d === 0);
  const notYetHTML = notYet.length ? `
    <div class="tl-unranked-label">Sin peleas hasta este evento: ${notYet.map(f=>f.name).join(', ')}</div>` : '';

  view.innerHTML = `
    <div class="tl-event-header">
      <div class="tl-event-title">${fullTitle}</div>
      <div class="tl-event-meta">${ev.date} · ${ev.arena}</div>
    </div>
    <div class="tl-fight-summary">${fightsHTML}</div>
    ${penHTML}
    ${tableHTML}
    ${notYetHTML}`;
}

// ─────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────
function showToast(msg) {
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}

// ─────────────────────────────────────────
//  TAB SWITCHING
// ─────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});

// ─────────────────────────────────────────
//  ARRANQUE
// ─────────────────────────────────────────
async function init() {
  // 1. Intentar cargar los JSON desde el servidor (fetch automático)
  try {
    const base = document.baseURI.replace(/[^/]*$/, '');
    const [rf, re] = await Promise.all([
      fetch(base + 'fighters.json'),
      fetch(base + 'events.json'),
    ]);
    if (rf.ok && re.ok) {
      fighters   = await rf.json();
      APB_EVENTS = migrateEvents(await re.json());
      localStorage.setItem(LS_FIGHTERS, JSON.stringify(fighters));
      localStorage.setItem(LS_EVENTS,   JSON.stringify(APB_EVENTS));
      console.log('[UFC] JSON cargados via fetch OK');
    } else {
      console.warn('[UFC] fetch respondió pero no ok:', rf.status, re.status);
      loadInitialData();
    }
  } catch (err) {
    console.warn('[UFC] fetch falló, usando localStorage/defaults:', err);
    loadInitialData();
  }

  recalcAllRecords();
  buildRankingTab();
  buildAPBTab();
  buildTimelineTab();

  // 2. Ocultar el banner siempre que haya datos cargados
  hideBannerIfDataLoaded();
}

function hideBannerIfDataLoaded() {
  const banner = document.getElementById('importBanner');
  if (!banner) return;
  if (fighters.length > 0 && APB_EVENTS.length > 0) {
    banner.classList.add('connected');
    document.body.classList.add('import-hidden');
    document.getElementById('import-status').textContent = 'Datos cargados';
    document.getElementById('import-status').className = 'import-status-text ok';
  } else {
    updateImportBanner();
  }
}

init();
