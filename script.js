// ═══════════════════════════════════════════════════════════════
//  script.js  —  UFC Ranking
//  Persistencia: File System Access API + localStorage fallback
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────
//  ESTADO
// ─────────────────────────────────────────
let fighters   = [];
let APB_EVENTS = [];
let openCard   = null;

let fightersHandle  = null;
let eventsHandle    = null;
let imagesDirHandle = null;  // carpeta img/ para exportar con imágenes

let modalPenalties = []; // temp: penalizaciones mientras se edita un evento en modal

const LS_FIGHTERS  = 'ufc_fighters_v2';
const LS_EVENTS    = 'ufc_events_v2';
const SUPPORTS_FSA = ('showOpenFilePicker' in window);

// ─────────────────────────────────────────
//  DATOS POR DEFECTO
// ─────────────────────────────────────────
const DEFAULT_FIGHTERS = [
  { name: "JP 'MAKÉLÉLÉ' Álvarez",              w:1, wko:0, wsplit:0, l:0, lko:0, lsplit:0, d:0 },
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
//  MIGRACIÓN: formato viejo → nuevo
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
  // Asegurar campo penalties (nuevo)
  if (!base.penalties) base.penalties = [];
  return base;
}
function migrateEvents(arr) { return arr.map(migrateEvent); }

// ─────────────────────────────────────────
//  FILE SYSTEM ACCESS API
// ─────────────────────────────────────────
async function writeHandle(handle, data) {
  if (!handle) return;
  try { const w = await handle.createWritable(); await w.write(JSON.stringify(data, null, 2)); await w.close(); }
  catch (e) { console.error('FSA write error:', e); }
}
async function readHandle(handle) {
  const file = await handle.getFile();
  return JSON.parse(await file.text());
}

async function connectFighters() {
  if (!SUPPORTS_FSA) return alert('Tu navegador no soporta File System Access API. Usa Chrome o Edge.');
  try {
    const [h] = await window.showOpenFilePicker({ id:'ufc-fighters', types:[{description:'JSON',accept:{'application/json':['.json']}}] });
    fightersHandle = h;
    try { fighters = await readHandle(h); } catch { await writeHandle(h, fighters); }
    localStorage.setItem(LS_FIGHTERS, JSON.stringify(fighters));
    updateFSABanner(); buildRankingTab(); buildAPBTab(); buildManageTab(); buildTimelineTab();
    showToast('fighters.json conectado');
  } catch (e) { if (e.name !== 'AbortError') console.error(e); }
}

async function connectEvents() {
  if (!SUPPORTS_FSA) return alert('Tu navegador no soporta File System Access API. Usa Chrome o Edge.');
  try {
    const [h] = await window.showOpenFilePicker({ id:'ufc-events', types:[{description:'JSON',accept:{'application/json':['.json']}}] });
    eventsHandle = h;
    try { APB_EVENTS = migrateEvents(await readHandle(h)); } catch { await writeHandle(h, APB_EVENTS); }
    localStorage.setItem(LS_EVENTS, JSON.stringify(APB_EVENTS));
    updateFSABanner(); buildRankingTab(); buildAPBTab(); buildManageTab(); buildTimelineTab();
    showToast('events.json conectado');
  } catch (e) { if (e.name !== 'AbortError') console.error(e); }
}

async function connectImagesFolder() {
  if (!SUPPORTS_FSA) return alert('Tu navegador no soporta File System Access API. Usa Chrome o Edge.');
  try {
    imagesDirHandle = await window.showDirectoryPicker({ id: 'ufc-images', mode: 'read' });
    updateFSABanner();
    showToast('Carpeta img/ conectada — export PNG incluira imagenes');
  } catch (e) { if (e.name !== 'AbortError') console.error(e); }
}

function updateFSABanner() {
  const fBtn   = document.getElementById('fsa-btn-fighters');
  const eBtn   = document.getElementById('fsa-btn-events');
  const iBtn   = document.getElementById('fsa-btn-images');
  const status = document.getElementById('fsa-status');
  const banner = document.getElementById('fsaBanner');
  if (fBtn) fBtn.className = 'fsa-file-btn' + (fightersHandle  ? ' connected' : '');
  if (eBtn) eBtn.className = 'fsa-file-btn' + (eventsHandle    ? ' connected' : '');
  if (iBtn) iBtn.className = 'fsa-file-btn' + (imagesDirHandle ? ' connected' : '');
  const both = fightersHandle && eventsHandle;
  const none = !fightersHandle && !eventsHandle;
  if (status) {
    if (both && imagesDirHandle) {
      status.textContent = 'Auto-save active — Export PNG incluira imagenes de fighters';
      status.className = 'fsa-status-text ok';
    } else if (both) {
      status.textContent = 'Auto-save active — Conecta la carpeta img/ para exportar con imagenes';
      status.className = 'fsa-status-text ok';
    } else {
      status.textContent = none ? 'Connect your JSON files to enable auto-save'
        : 'Connect the remaining file to activate auto-save';
      status.className = 'fsa-status-text';
    }
  }
  if (both && banner) {
    setTimeout(() => { banner.classList.add('connected'); document.body.classList.add('fsa-hidden'); }, 1200);
  }
}

// ─────────────────────────────────────────
//  PERSISTENCIA
// ─────────────────────────────────────────
async function saveAll() {
  try { localStorage.setItem(LS_FIGHTERS, JSON.stringify(fighters)); localStorage.setItem(LS_EVENTS, JSON.stringify(APB_EVENTS)); }
  catch (e) { console.warn('localStorage:', e); }
  await Promise.all([writeHandle(fightersHandle, fighters), writeHandle(eventsHandle, APB_EVENTS)]);
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
  buildRankingTab(); buildAPBTab(); buildManageTab(); buildTimelineTab();
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
       - (f.penaltyPts || 0);  // penaltyPts acumulado desde eventos (cronológico)
}

function normName(n) { return n.trim().toLowerCase().replace(/\s+/g, ' ').replace(/['']/g, "'"); }

// ─────────────────────────────────────────
//  SISTEMA BRECHA + CONTUNDENCIA
// ─────────────────────────────────────────
/**
 * Calcula el Bonus por Upset para una pelea.
 * SOLO se otorga cuando el UNDERDOG gana. El favorito nunca recibe bonus.
 * scoresBefore: mapa normName → puntos ANTES de esta pelea (solo Ranked).
 */
function calcBonusForFight(ft, scoresBefore) {
  const zero = { bonus: 0, underdogName: null };
  if (ft.isDraw || !ft.winner) return zero;

  const n1 = normName(ft.f1), n2 = normName(ft.f2);

  // Solo aplica si ambos son Ranked (ya han peleado antes)
  if (!(n1 in scoresBefore) || !(n2 in scoresBefore)) return zero;

  const s1 = scoresBefore[n1], s2 = scoresBefore[n2];
  if (s1 === s2) return zero;

  const undNorm  = s1 > s2 ? n2 : n1;
  const undName  = s1 > s2 ? ft.f2 : ft.f1;
  const absDiff  = Math.abs(s1 - s2);

  // El underdog DEBE haber ganado — si gana el favorito, cero bonus
  if (normName(ft.winner) !== undNorm) return zero;

  // Bonus por Brecha
  if (absDiff < 4) return zero;
  let brechaBonus;
  if      (absDiff <=  7) brechaBonus = 1;
  else if (absDiff <= 12) brechaBonus = 2;
  else                    brechaBonus = 3;

  // Bonus por Contundencia
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
//  HELPERS: matchup / auto-nombre
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

  const avatarHTML = f.img
    ? `<div class="fighter-avatar">
         <img src="img/${f.img}"
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
      <div class="download-card-wrap">
        <button class="download-card-btn" data-fighter-id="${cardId}">Download Card</button>
        <span class="download-card-btn-label">PNG · High Resolution</span>
      </div>
    </div>`;

  card.addEventListener('click', (e) => {
    if (e.target.closest('.download-card-btn')) return;
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

    // Penalizaciones del evento
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
//  TAB: MANAGE
// ─────────────────────────────────────────
function buildManageTab() { buildManageFightersList(); buildManageEventsList(); }

function buildManageFightersList() {
  const c = document.getElementById('mgFightersList'); c.innerHTML = '';
  [...fighters].sort((a,b)=>{const d=calcScore(b)-calcScore(a);return d!==0?d:(b.w+b.l+b.d)-(a.w+a.l+a.d);}).forEach(f => {
    const pts = calcScore(f), row = document.createElement('div');
    row.className = 'mg-fighter-row';
    row.innerHTML = `
      <div class="mg-fighter-name">${f.name}</div>
      <div class="mg-fighter-stats">
        <span class="mg-stat w">${f.w}W</span><span class="mg-stat wko">${f.wko}KO</span>
        <span class="mg-stat l">${f.l}L</span><span class="mg-stat lko">${f.lko}KO</span>
        <span class="mg-stat d">${f.d}D</span>
        <span class="mg-stat pts ${pts>=0?'pos':'neg'}">${pts>=0?'+':''}${pts}pts</span>
        ${(f.bonusPts||0)!==0?`<span class="mg-stat bonus bpos">${(f.bonusPts||0)>0?'+':''}${f.bonusPts||0}B</span>`:''}
        ${(f.penaltyPts||0)>0?`<span class="mg-stat pen">−${f.penaltyPts}PEN</span>`:''}
      </div>
      <div class="mg-fighter-actions">
        <button class="mg-btn mg-btn-rename"   data-action="rename-fighter"   data-name="${f.name}">Rename</button>
        <button class="mg-btn mg-btn-edit"     data-action="edit-fighter"     data-name="${f.name}">Edit</button>
        <button class="mg-btn mg-btn-del"      data-action="del-fighter"      data-name="${f.name}">Delete</button>
      </div>`;
    c.appendChild(row);
  });
}

function buildManageEventsList() {
  const c = document.getElementById('mgEventsList'); c.innerHTML = '';
  APB_EVENTS.forEach(ev => {
    const row = document.createElement('div'); row.className = 'mg-event-row';
    const fightsInfo = ev.fights.map((ft, fi) => {
      const tag   = ft.isTitleBout ? ` <span class="mg-title-tag">${ft.titleBoutName||'Title Bout'}</span>` : '';
      const label = ev.fights.length > 1 ? `<span class="mg-fight-label">${fi===0?'Main':'Co-Main'}</span> ` : '';
      return `<span class="mg-event-matchup">${label}${ft.f1} vs ${ft.f2}${tag}</span>`;
    }).join('');
    const penInfo = (ev.penalties||[]).length > 0
      ? `<span class="mg-event-penalties">${ev.penalties.length} penalización${ev.penalties.length>1?'es':''}</span>` : '';
    row.innerHTML = `
      <div class="mg-event-info">
        <span class="mg-event-name">${ev.name}${ev.fights[0]?.subtitle ? ' ' + ev.fights[0].subtitle : ''}${ev.isPending?' <span class="apb-pending-badge" style="font-size:0.5rem;padding:1px 5px">Upcoming</span>':''}</span>
        ${fightsInfo}
        ${penInfo}
        <span class="mg-event-date">${ev.date} · ${ev.arena}</span>
      </div>
      <div class="mg-fighter-actions">
        <button class="mg-btn mg-btn-edit" data-action="edit-event" data-id="${ev.id}">Edit</button>
        <button class="mg-btn mg-btn-del"  data-action="del-event"  data-id="${ev.id}">Delete</button>
      </div>`;
    c.appendChild(row);
  });
}

// ─────────────────────────────────────────
//  MODALES
// ─────────────────────────────────────────
function showModal(html) { document.getElementById('mgModalBox').innerHTML = html; document.getElementById('mgOverlay').classList.add('active'); }
function closeModal()    { document.getElementById('mgOverlay').classList.remove('active'); modalPenalties = []; }
function toggleTitleNameInput(p) {
  const w = document.getElementById(`${p}-titleNameWrap`);
  if (w) w.style.display = document.getElementById(`${p}-titleBout`).checked ? 'block' : 'none';
}

function togglePendingMode(evPrefix) {
  const pending = document.getElementById(`${evPrefix}-pending`).checked;
  ['1','2'].forEach(n => {
    const rw = document.getElementById(`${evPrefix}${n}-result-wrap`);
    if (rw) rw.style.display = pending ? 'none' : 'block';
  });
}

// ─────────────────────────────────────────
//  PENALIZACIONES DEL MODAL (por evento)
// ─────────────────────────────────────────
function renderModalPenalties() {
  const c = document.getElementById('modal-pen-list');
  if (!c) return;
  if (!modalPenalties.length) {
    c.innerHTML = '<div class="modal-pen-empty">Sin penalizaciones en este evento</div>';
    return;
  }
  c.innerHTML = modalPenalties.map((p, i) => `
    <div class="modal-pen-row">
      <select class="modal-input modal-pen-fighter" onchange="modalPenalties[${i}].fighter=this.value">
        ${fighters.map(f=>`<option value="${f.name}" ${normName(f.name)===normName(p.fighter)?'selected':''}>${f.name}</option>`).join('')}
      </select>
      <div class="modal-pen-pts-wrap">
        <span class="modal-pen-minus">−</span>
        <input class="modal-input modal-pen-pts" type="number" min="1" value="${p.pts}"
               onchange="modalPenalties[${i}].pts=Math.max(1,+this.value||1)">
        <span class="modal-pen-unit">pts</span>
      </div>
      <button class="mg-btn mg-btn-del" onclick="removeModalPenalty(${i})" type="button">✕</button>
    </div>`).join('');
}

function addModalPenalty() {
  modalPenalties.push({ fighter: fighters[0]?.name || '', pts: 1 });
  renderModalPenalties();
}

function removeModalPenalty(i) {
  modalPenalties.splice(i, 1);
  renderModalPenalties();
}

function penaltySectionHTML() {
  return `
    <div class="modal-pen-section">
      <div class="modal-pen-header">
        <span class="modal-pen-title">Penalizaciones del Evento</span>
        <button class="mg-btn mg-btn-add" onclick="addModalPenalty()" type="button" style="font-size:0.6rem;padding:5px 14px">+ Añadir</button>
      </div>
      <div id="modal-pen-list"></div>
    </div>`;
}

// ── Bloque HTML de una pelea en el modal ──
function fightBlockHTML(pfx, label, fOpts1, fOpts2, curResult, isTitleBout, titleBoutName, subtitle, isPending) {
  const rOpts = [
    {v:'f1-decision',l:'Fighter 1 wins (Decision)'},{v:'f1-split',l:'Fighter 1 wins (Split Decision)'},{v:'f1-ko',l:'Fighter 1 wins (KO)'},
    {v:'f2-decision',l:'Fighter 2 wins (Decision)'},{v:'f2-split',l:'Fighter 2 wins (Split Decision)'},{v:'f2-ko',l:'Fighter 2 wins (KO)'},
    {v:'draw',l:'Draw'},
  ].map(o=>`<option value="${o.v}" ${o.v===curResult?'selected':''}>${o.l}</option>`).join('');
  return `
    <div class="modal-fight-block">
      <div class="modal-fight-label">${label}</div>
      <div class="modal-grid-2">
        <label class="modal-label">Fighter 1<select class="modal-input" id="${pfx}-f1" onchange="autoSub('${pfx}')">${fOpts1}</select></label>
        <label class="modal-label">Fighter 2<select class="modal-input" id="${pfx}-f2" onchange="autoSub('${pfx}')">${fOpts2}</select></label>
      </div>
      <div id="${pfx}-result-wrap" style="display:${isPending?'none':'block'}">
        <label class="modal-label">Result<select class="modal-input" id="${pfx}-result">${rOpts}</select></label>
      </div>
      <label class="modal-label">Subtitle<input class="modal-input" type="text" id="${pfx}-subtitle" value="${subtitle||''}" placeholder="Auto-generated from fighters"></label>
      <label class="modal-checkbox-label">
        <input type="checkbox" id="${pfx}-titleBout" class="modal-checkbox" ${isTitleBout?'checked':''} onchange="toggleTitleNameInput('${pfx}')">
        <span class="modal-checkbox-text">Title Bout</span>
      </label>
      <div id="${pfx}-titleNameWrap" style="display:${isTitleBout?'block':'none'}">
        <label class="modal-label">Title Name<input class="modal-input" type="text" id="${pfx}-titleBoutName" placeholder="e.g. Welterweight Championship Bout" value="${titleBoutName||''}"></label>
      </div>
    </div>`;
}

function autoSub(pfx, excludeId) {
  const f1El = document.getElementById(`${pfx}-f1`), f2El = document.getElementById(`${pfx}-f2`), subEl = document.getElementById(`${pfx}-subtitle`);
  if (f1El && f2El && subEl) subEl.value = genSubtitle(f1El.value, f2El.value, excludeId||null);
}

function readFight(pfx) {
  const f1 = document.getElementById(`${pfx}-f1`).value;
  const f2 = document.getElementById(`${pfx}-f2`).value;
  const result = document.getElementById(`${pfx}-result`).value;
  const subtitle = document.getElementById(`${pfx}-subtitle`).value.trim();
  const isTitleBout = document.getElementById(`${pfx}-titleBout`).checked;
  const titleBoutName = isTitleBout ? document.getElementById(`${pfx}-titleBoutName`).value.trim() : '';
  const isDraw = result==='draw', isKO=result.endsWith('-ko'), isSplit=result.endsWith('-split');
  const winnerF = result.startsWith('f1')?f1:f2, loserF = result.startsWith('f1')?f2:f1;
  const method = isDraw?'No Fighter Defeated':isKO?'KO':isSplit?'Split Decision':'Decision';
  return { f1, f2, subtitle, isDraw, isKO, isSplit, winnerF, loserF, method, winner:isDraw?null:winnerF, isTitleBout, titleBoutName };
}

// ── ADD EVENT ──
function openAddEvent() {
  modalPenalties = [];
  const nextId    = APB_EVENTS.length ? Math.max(...APB_EVENTS.map(e=>e.id))+1 : 1;
  const suggested = suggestEventName();
  const opts      = fighters.map(f=>`<option value="${f.name}">${f.name}</option>`).join('');
  const opts2     = fighters.map((f,i)=>`<option value="${f.name}" ${i===1?'selected':''}>${f.name}</option>`).join('');
  showModal(`
    <div class="modal-title">Add New Event</div>
    <div class="modal-form">
      <div class="modal-grid-2">
        <label class="modal-label">Event Name<input class="modal-input" type="text" id="ae-name" placeholder="e.g. UFC 11:" value="${suggested}"></label>
        <label class="modal-label">Date<input class="modal-input" type="text" id="ae-date" placeholder="21 Mar 2026"></label>
      </div>
      <label class="modal-label">Arena<input class="modal-input" type="text" id="ae-arena" placeholder="Arena Panenka"></label>
      <label class="modal-checkbox-label" style="margin-bottom:4px">
        <input type="checkbox" id="ae-pending" class="modal-checkbox" onchange="togglePendingMode('ae')">
        <span class="modal-checkbox-text">Pending — event not yet disputed</span>
      </label>
      ${fightBlockHTML('ae1','Main Event',opts,opts2,'f1-decision',false,'','',false)}
      <button class="mg-btn mg-btn-add-fight" id="ae-addco-btn" onclick="showCoMain('ae')" type="button">+ Add Co-Main Event</button>
      <div id="ae-co-wrap" style="display:none">
        ${fightBlockHTML('ae2','Co-Main Event',opts,opts2,'f1-decision',false,'','',false)}
        <button class="mg-btn mg-btn-cancel" onclick="hideCoMain('ae')" type="button" style="margin-top:4px;font-size:0.7rem">Remove Co-Main</button>
      </div>
      ${penaltySectionHTML()}
      <div id="ae-error" class="modal-error" style="display:none"></div>
      <div class="modal-actions">
        <button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="mg-btn mg-btn-save" onclick="saveNewEvent(${nextId})">Add Event</button>
      </div>
    </div>`);
  autoSub('ae1'); autoSub('ae2');
  renderModalPenalties();
}

function showCoMain(p) { document.getElementById(`${p}-co-wrap`).style.display='block'; document.getElementById(`${p}-addco-btn`).style.display='none'; autoSub(`${p}2`); }
function hideCoMain(p) { document.getElementById(`${p}-co-wrap`).style.display='none'; document.getElementById(`${p}-addco-btn`).style.display=''; }

async function saveNewEvent(id) {
  const name=document.getElementById('ae-name').value.trim(), date=document.getElementById('ae-date').value.trim(), arena=document.getElementById('ae-arena').value.trim();
  const err=document.getElementById('ae-error');
  if (!name)  { err.textContent='Event name is required.';  err.style.display='block'; return; }
  if (!date)  { err.textContent='Date is required.';        err.style.display='block'; return; }
  if (!arena) { err.textContent='Arena is required.';       err.style.display='block'; return; }
  const ft1 = readFight('ae1');
  if (ft1.f1===ft1.f2) { err.textContent='Main Event: fighters must be different.'; err.style.display='block'; return; }
  const hasCoMain = document.getElementById('ae-co-wrap').style.display !== 'none';
  let ft2 = null;
  if (hasCoMain) { ft2 = readFight('ae2'); if (ft2.f1===ft2.f2) { err.textContent='Co-Main: fighters must be different.'; err.style.display='block'; return; } }

  const isPending = document.getElementById('ae-pending').checked;
  const fights = [toFight(ft1)];
  if (ft2) fights.push(toFight(ft2));
  const penalties = [...modalPenalties].filter(p => p.fighter && p.pts > 0);
  APB_EVENTS.push({ id, name, date, arena, isPending, penalties, fights });
  recalcAllRecords();
  closeModal(); await persistAndRefresh(); showToast(isPending ? 'Event scheduled — pending dispute' : 'Event added — records updated');
}

// ── EDIT EVENT ──
function openEditEvent(id) {
  const ev = APB_EVENTS.find(e=>e.id===id); if (!ev) return;
  modalPenalties = JSON.parse(JSON.stringify(ev.penalties || []));
  const ft1 = ev.fights[0], ft2 = ev.fights[1]||null;
  const optsFor = (sel) => fighters.map(f=>`<option value="${f.name}" ${f.name===sel?'selected':''}>${f.name}</option>`).join('');
  const getR = (ft) => { if (ft.isDraw) return 'draw'; const isF1=normName(ft.f1)===normName(ft.winner||''), m=ft.method; return isF1?(m==='KO'?'f1-ko':m==='Split Decision'?'f1-split':'f1-decision'):(m==='KO'?'f2-ko':m==='Split Decision'?'f2-split':'f2-decision'); };
  const opts = fighters.map(f=>`<option value="${f.name}">${f.name}</option>`).join('');

  const isPending = ev.isPending || false;
  showModal(`
    <div class="modal-title">Edit Event</div>
    <div class="modal-form">
      <div class="modal-grid-2">
        <label class="modal-label">Event Name<input class="modal-input" type="text" id="ee-name" value="${ev.name}"></label>
        <label class="modal-label">Date<input class="modal-input" type="text" id="ee-date" value="${ev.date}"></label>
      </div>
      <label class="modal-label">Arena<input class="modal-input" type="text" id="ee-arena" value="${ev.arena}"></label>
      <label class="modal-checkbox-label" style="margin-bottom:4px">
        <input type="checkbox" id="ee-pending" class="modal-checkbox" ${isPending?'checked':''} onchange="togglePendingMode('ee')">
        <span class="modal-checkbox-text">Pending — event not yet disputed</span>
      </label>
      ${fightBlockHTML('ee1','Main Event',optsFor(ft1.f1),optsFor(ft1.f2),getR(ft1),ft1.isTitleBout,ft1.titleBoutName,ft1.subtitle,isPending)}
      <button class="mg-btn mg-btn-add-fight" id="ee-addco-btn" onclick="showCoMain('ee')" type="button" style="display:${ft2?'none':''}">+ Add Co-Main Event</button>
      <div id="ee-co-wrap" style="display:${ft2?'block':'none'}">
        ${ft2 ? fightBlockHTML('ee2','Co-Main Event',optsFor(ft2.f1),optsFor(ft2.f2),getR(ft2),ft2.isTitleBout,ft2.titleBoutName,ft2.subtitle,isPending) : fightBlockHTML('ee2','Co-Main Event',opts,opts,'f1-decision',false,'','',isPending)}
        <button class="mg-btn mg-btn-cancel" onclick="hideCoMain('ee')" type="button" style="margin-top:4px;font-size:0.7rem">Remove Co-Main</button>
      </div>
      ${penaltySectionHTML()}
      <div id="ee-error" class="modal-error" style="display:none"></div>
      <div class="modal-actions">
        <button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="mg-btn mg-btn-save" onclick="saveEventEdit(${id})">Save</button>
      </div>
    </div>`);
  renderModalPenalties();
}

async function saveEventEdit(id) {
  const ev=APB_EVENTS.find(e=>e.id===id); if (!ev) return;
  const err=document.getElementById('ee-error');
  const name=document.getElementById('ee-name').value.trim(), date=document.getElementById('ee-date').value.trim(), arena=document.getElementById('ee-arena').value.trim();
  if (!name) { err.textContent='Event name is required.'; err.style.display='block'; return; }
  const ft1 = readFight('ee1');
  if (ft1.f1===ft1.f2) { err.textContent='Main Event: fighters must be different.'; err.style.display='block'; return; }
  const hasCoMain = document.getElementById('ee-co-wrap').style.display !== 'none';
  let ft2 = null;
  if (hasCoMain) { ft2 = readFight('ee2'); if (ft2.f1===ft2.f2) { err.textContent='Co-Main: fighters must be different.'; err.style.display='block'; return; } }
  ev.name=name; ev.date=date; ev.arena=arena;
  ev.isPending = document.getElementById('ee-pending').checked;
  ev.fights = [toFight(ft1)];
  if (ft2) ev.fights.push(toFight(ft2));
  ev.penalties = [...modalPenalties].filter(p => p.fighter && p.pts > 0);
  recalcAllRecords(); closeModal(); await persistAndRefresh(); showToast('Event updated — records recalculated');
}

function toFight(ft) { return { subtitle:ft.subtitle, f1:ft.f1, f2:ft.f2, winner:ft.winner, method:ft.method, isDraw:ft.isDraw, isTitleBout:ft.isTitleBout, titleBoutName:ft.titleBoutName }; }

function applyStats(ft) {
  if (ft.isDraw) { updateStat(ft.f1,'d',1); updateStat(ft.f2,'d',1); }
  else {
    updateStat(ft.winnerF,'w',1); updateStat(ft.loserF,'l',1);
    if (ft.isKO)    { updateStat(ft.winnerF,'wko',1);    updateStat(ft.loserF,'lko',1);    }
    if (ft.isSplit) { updateStat(ft.winnerF,'wsplit',1); updateStat(ft.loserF,'lsplit',1); }
  }
}

// ── DELETE EVENT ──
function confirmDeleteEvent(id) {
  const ev=APB_EVENTS.find(e=>e.id===id); if (!ev) return;
  showModal(`<div class="modal-title">Delete Event</div><div class="modal-confirm-text">Remove <strong>${ev.name}</strong>?<br>Fighter records will be recalculated.</div>
    <div class="modal-actions"><button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button><button class="mg-btn mg-btn-danger" onclick="deleteEvent(${id})">Delete</button></div>`);
}
async function deleteEvent(id) {
  APB_EVENTS=APB_EVENTS.filter(e=>e.id!==id); recalcAllRecords(); closeModal(); await persistAndRefresh(); showToast('Event removed — records recalculated');
}

// ── RENAME FIGHTER ──
function openRenameFighter(name) {
  const f=fighters.find(x=>x.name===name); if (!f) return;
  showModal(`
    <div class="modal-title">Rename Fighter</div>
    <div class="modal-fighter-name">${f.name}</div>
    <div class="modal-form">
      <label class="modal-label">New Name<input class="modal-input" type="text" id="rn-name" value="${f.name}"></label>
      <div id="rn-error" class="modal-error" style="display:none"></div>
      <div class="modal-actions">
        <button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="mg-btn mg-btn-save" onclick="saveRenameFighter('${f.name.replace(/'/g,"\\'")}')">Rename</button>
      </div>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('rn-name');if(i){i.focus();i.select();}},50);
}

async function saveRenameFighter(oldName) {
  const newName=document.getElementById('rn-name').value.trim(), err=document.getElementById('rn-error');
  if (!newName)          { err.textContent='Name cannot be empty.';                     err.style.display='block'; return; }
  if (newName===oldName) { closeModal(); return; }
  if (fighters.some(x=>normName(x.name)===normName(newName)&&x.name!==oldName)) { err.textContent='A fighter with this name already exists.'; err.style.display='block'; return; }
  const f=fighters.find(x=>x.name===oldName); if (f) f.name=newName;
  for (const ev of APB_EVENTS) {
    for (const ft of ev.fights) {
      if (ft.f1===oldName)     ft.f1=newName;
      if (ft.f2===oldName)     ft.f2=newName;
      if (ft.winner===oldName) ft.winner=newName;
    }
    for (const p of (ev.penalties||[])) {
      if (p.fighter===oldName) p.fighter=newName;
    }
  }
  closeModal(); await persistAndRefresh(); showToast(`Fighter renamed to "${newName}"`);
}

// ── EDIT FIGHTER ──
function openEditFighter(name) {
  const f=fighters.find(x=>x.name===name); if (!f) return;
  showModal(`
    <div class="modal-title">Edit Fighter</div>
    <div class="modal-fighter-name">${f.name}</div>
    <div class="modal-form">
      <label class="modal-label" style="grid-column:1/-1">Image filename <span style="color:#555;font-size:0.8em">(e.g. juan.png — colocala en img/)</span>
        <input class="modal-input" type="text" id="ef-img" placeholder="filename.png" value="${f.img||''}">
      </label>
      <div class="modal-grid-2" style="margin-top:10px">
        <label class="modal-label">Wins<input class="modal-input" type="number" id="ef-w" min="0" value="${f.w}"></label>
        <label class="modal-label">KO Wins<input class="modal-input" type="number" id="ef-wko" min="0" value="${f.wko}"></label>
        <label class="modal-label">Split Wins<input class="modal-input" type="number" id="ef-wsplit" min="0" value="${f.wsplit||0}"></label>
        <label class="modal-label">Losses<input class="modal-input" type="number" id="ef-l" min="0" value="${f.l}"></label>
        <label class="modal-label">KO Losses<input class="modal-input" type="number" id="ef-lko" min="0" value="${f.lko}"></label>
        <label class="modal-label">Split Losses<input class="modal-input" type="number" id="ef-lsplit" min="0" value="${f.lsplit||0}"></label>
        <label class="modal-label" style="grid-column:1/-1">Draws<input class="modal-input" type="number" id="ef-d" min="0" value="${f.d}"></label>
      </div>
      <div id="ef-error" class="modal-error" style="display:none"></div>
      <div class="modal-actions">
        <button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="mg-btn mg-btn-save" onclick="saveFighterEdit('${f.name.replace(/'/g,"\\'")}')">Save</button>
      </div>
    </div>`);
}

async function saveFighterEdit(name) {
  const f=fighters.find(x=>x.name===name); if (!f) return;
  const w=+document.getElementById('ef-w').value||0,      wko=+document.getElementById('ef-wko').value||0,   ws=+document.getElementById('ef-wsplit').value||0;
  const l=+document.getElementById('ef-l').value||0,      lko=+document.getElementById('ef-lko').value||0,   ls=+document.getElementById('ef-lsplit').value||0;
  const d=+document.getElementById('ef-d').value||0,      err=document.getElementById('ef-error');
  if (wko+ws>w) { err.textContent='KO + Split wins cannot exceed total wins.';    err.style.display='block'; return; }
  if (lko+ls>l) { err.textContent='KO + Split losses cannot exceed total losses.'; err.style.display='block'; return; }
  const img=document.getElementById('ef-img').value.trim();
  f.w=w; f.wko=wko; f.wsplit=ws; f.l=l; f.lko=lko; f.lsplit=ls; f.d=d; if(img) f.img=img; else delete f.img;
  closeModal(); await persistAndRefresh(); showToast('Fighter updated');
}

// ── ADD FIGHTER ──
function openAddFighter() {
  showModal(`
    <div class="modal-title">Add New Fighter</div>
    <div class="modal-form">
      <label class="modal-label">Fighter Name<input class="modal-input" type="text" id="af-name" placeholder="Fighter name"></label>
      <label class="modal-label" style="margin-top:6px">Image filename <span style="color:#555;font-size:0.8em">(e.g. juan.png — colocala en img/)</span><input class="modal-input" type="text" id="af-img" placeholder="filename.png"></label>
      <div class="modal-grid-2" style="margin-top:10px">
        <label class="modal-label">Wins<input class="modal-input" type="number" id="af-w" min="0" value="0"></label>
        <label class="modal-label">KO Wins<input class="modal-input" type="number" id="af-wko" min="0" value="0"></label>
        <label class="modal-label">Split Wins<input class="modal-input" type="number" id="af-wsplit" min="0" value="0"></label>
        <label class="modal-label">Losses<input class="modal-input" type="number" id="af-l" min="0" value="0"></label>
        <label class="modal-label">KO Losses<input class="modal-input" type="number" id="af-lko" min="0" value="0"></label>
        <label class="modal-label">Split Losses<input class="modal-input" type="number" id="af-lsplit" min="0" value="0"></label>
        <label class="modal-label" style="grid-column:1/-1">Draws<input class="modal-input" type="number" id="af-d" min="0" value="0"></label>
      </div>
      <div id="af-error" class="modal-error" style="display:none"></div>
      <div class="modal-actions">
        <button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="mg-btn mg-btn-save" onclick="saveNewFighter()">Add Fighter</button>
      </div>
    </div>`);
}

async function saveNewFighter() {
  const name=document.getElementById('af-name').value.trim();
  const w=+document.getElementById('af-w').value||0,   wko=+document.getElementById('af-wko').value||0,  ws=+document.getElementById('af-wsplit').value||0;
  const l=+document.getElementById('af-l').value||0,   lko=+document.getElementById('af-lko').value||0,  ls=+document.getElementById('af-lsplit').value||0;
  const d=+document.getElementById('af-d').value||0,   err=document.getElementById('af-error');
  if (!name) { err.textContent='Fighter name is required.'; err.style.display='block'; return; }
  if (fighters.some(x=>normName(x.name)===normName(name))) { err.textContent='A fighter with this name already exists.'; err.style.display='block'; return; }
  if (wko+ws>w) { err.textContent='KO + Split wins cannot exceed total wins.';    err.style.display='block'; return; }
  if (lko+ls>l) { err.textContent='KO + Split losses cannot exceed total losses.'; err.style.display='block'; return; }
  const img=document.getElementById('af-img').value.trim();
  const newFighter={name,w,wko,wsplit:ws,l,lko,lsplit:ls,d,bonusPts:0,penaltyPts:0};
  if(img) newFighter.img=img;
  fighters.push(newFighter);
  closeModal(); await persistAndRefresh(); showToast('Fighter added');
}

// ── DELETE FIGHTER ──
function confirmDeleteFighter(name) {
  showModal(`<div class="modal-title">Delete Fighter</div><div class="modal-confirm-text">Remove <strong>${name}</strong> from the roster?<br>This cannot be undone.</div>
    <div class="modal-actions"><button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button><button class="mg-btn mg-btn-danger" onclick="deleteFighter('${name.replace(/'/g,"\\'")}')">Delete</button></div>`);
}
async function deleteFighter(name) {
  fighters=fighters.filter(f=>f.name!==name); closeModal(); await persistAndRefresh(); showToast('Fighter removed');
}

// ── RESET ──
function confirmReset() {
  showModal(`<div class="modal-title">Reset All Data</div><div class="modal-confirm-text">This will erase all changes and restore the original data.<br><strong>This cannot be undone.</strong></div>
    <div class="modal-actions"><button class="mg-btn mg-btn-cancel" onclick="closeModal()">Cancel</button><button class="mg-btn mg-btn-danger" onclick="resetAllData()">Reset</button></div>`);
}
async function resetAllData() {
  fighters=JSON.parse(JSON.stringify(DEFAULT_FIGHTERS)); APB_EVENTS=JSON.parse(JSON.stringify(DEFAULT_EVENTS));
  closeModal(); await persistAndRefresh(); showToast('Data reset to defaults');
}

// ─────────────────────────────────────────
//  HELPERS DE CÁLCULO
// ─────────────────────────────────────────
/**
 * Puntos que un luchador ganó/perdió en una pelea específica.
 * CORREGIDO: el bonus SOLO se aplica al underdog ganador.
 * El favorito que pierde NO recibe penalización de bonus extra.
 */
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

  // Bonus SOLO para el underdog cuando gana — el favorito nunca recibe bonus ni penalización extra
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

/**
 * Recalcula TODOS los stats desde cero, en orden cronológico de eventos.
 * Incluye: bonusPts (upset), penaltyPts (penalizaciones por evento).
 * El bonus SOLO se acumula en el underdog ganador.
 */
function recalcAllRecords() {
  fighters.forEach(f => {
    f.w=0; f.wko=0; f.wsplit=0; f.l=0; f.lko=0; f.lsplit=0;
    f.d=0; f.bonusPts=0; f.penaltyPts=0;
  });

  const foughtBefore = new Set();

  for (const ev of APB_EVENTS) {
    if (ev.isPending) continue;

    for (const ft of ev.fights) {
      // Snapshot de scores ANTES de esta pelea (solo Ranked)
      const scoresBefore = {};
      fighters.forEach(f => {
        if (foughtBefore.has(normName(f.name))) {
          scoresBefore[normName(f.name)] = calcScore(f);
        }
      });

      // Calcular bonus y guardar en el fight object (para uso en fightPoints)
      const { bonus, underdogName } = calcBonusForFight(ft, scoresBefore);
      ft.bonus        = bonus;
      ft.underdogName = underdogName;

      // Aplicar stats base
      if (ft.isDraw) {
        updateStat(ft.f1,'d',1); updateStat(ft.f2,'d',1);
      } else {
        const loser = normName(ft.f1)===normName(ft.winner||'')?ft.f2:ft.f1;
        updateStat(ft.winner,'w',1); updateStat(loser,'l',1);
        if (ft.method==='KO')             { updateStat(ft.winner,'wko',1);    updateStat(loser,'lko',1);    }
        if (ft.method==='Split Decision') { updateStat(ft.winner,'wsplit',1); updateStat(loser,'lsplit',1); }

        // CORREGIDO: bonus SOLO al underdog ganador — el favorito no recibe penalización de bonus
        if (bonus > 0 && underdogName) {
          updateStat(underdogName, 'bonusPts', bonus);
          // ← eliminado: updateStat(favName, 'bonusPts', -bonus)
        }
      }

      foughtBefore.add(normName(ft.f1));
      foughtBefore.add(normName(ft.f2));
    }

    // Aplicar penalizaciones del evento (cronológicamente)
    for (const pen of (ev.penalties || [])) {
      if (pen.fighter && pen.pts > 0) {
        updateStat(pen.fighter, 'penaltyPts', pen.pts);
      }
    }
  }
}

// ─────────────────────────────────────────
//  TAB: TIMELINE — EVOLUCIÓN DEL RANKING
// ─────────────────────────────────────────

let tlCurrentIdx = -1;

/**
 * Construye un snapshot del ranking hasta el evento en la posición upToIdx.
 * NO modifica el estado global de fighters.
 */
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

  // Seleccionar el último evento real por defecto (o mantener actual si sigue siendo válido)
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

  // Snapshot anterior para calcular deltas de posición
  const prevIdx  = findPrevRealEventIdx(evIdx);
  const prevRanked = prevIdx >= 0 ? sortSnapshot(computeRankingSnapshot(prevIdx)) : [];
  const getPrevRank = name => {
    const i = prevRanked.findIndex(f => normName(f.name) === normName(name));
    return i >= 0 ? i + 1 : null;
  };

  // Encabezado del evento
  const mainSub  = ev.fights[0]?.subtitle || '';
  const fullTitle = mainSub ? `${ev.name} ${mainSub}` : ev.name;

  // Resumen de peleas del evento
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

  // Penalizaciones del evento
  const penHTML = (ev.penalties||[]).length > 0 ? `
    <div class="tl-event-penalties">
      <span class="tl-pen-label">Penalizaciones aplicadas:</span>
      ${(ev.penalties||[]).map(p=>`<span class="tl-pen-tag">−${p.pts}pts ${p.fighter}</span>`).join('')}
    </div>` : '';

  // Tabla de ranking
  let tableHTML = `<div class="tl-ranking-table">`;
  ranked.forEach((f, i) => {
    const rank    = i + 1;
    const pts     = calcScore(f);
    const ptsDisp = pts >= 0 ? `+${pts}` : `${pts}`;
    const prevRank = getPrevRank(f.name);
    const ws = f.wsplit||0, wNormal = f.w - f.wko - ws;

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

  // Sección de no-ranked (aún sin peleas en este punto)
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
//  DELEGACIÓN DE CLICKS — MANAGE
// ─────────────────────────────────────────
document.getElementById('tab-manage').addEventListener('click', e => {
  const a=e.target.dataset?.action; if (!a) return;
  if (a==='rename-fighter') openRenameFighter(e.target.dataset.name);
  if (a==='edit-fighter')   openEditFighter(e.target.dataset.name);
  if (a==='del-fighter')    confirmDeleteFighter(e.target.dataset.name);
  if (a==='edit-event')     openEditEvent(Number(e.target.dataset.id));
  if (a==='del-event')      confirmDeleteEvent(Number(e.target.dataset.id));
});
document.getElementById('mgOverlay').addEventListener('click', e => {
  if (e.target===document.getElementById('mgOverlay')) closeModal();
});

// ─────────────────────────────────────────
//  DESCARGA TARJETA PNG
// ─────────────────────────────────────────
async function downloadFighterCard(btn) {
  const card=document.getElementById(btn.dataset.fighterId); if (!card) return;
  btn.textContent='Generating...'; btn.classList.add('loading');
  const detail=card.querySelector('.card-detail'), wasOpen=card.classList.contains('is-open'), prevMaxH=detail.style.maxHeight;
  card.style.opacity='1'; card.style.transform='none'; card.style.animation='none';
  card.classList.add('is-open'); detail.style.overflow='visible'; detail.style.maxHeight='none';
  btn.closest('.download-card-wrap').style.display='none';
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  await new Promise(r=>setTimeout(r,60));
  const originals = await inlineAvatarsForExport(card);
  await new Promise(r=>setTimeout(r,30));
  try {
    const canvas=await html2canvas(card,{backgroundColor:'#0a0a0a',scale:2.5,useCORS:false,allowTaint:true,logging:false,scrollX:0,scrollY:-window.scrollY});
    const nameEl=card.querySelector('.fighter-name'), safe=nameEl?nameEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''):btn.dataset.fighterId;
    const link=document.createElement('a'); link.download=`${safe}-card.png`; link.href=canvas.toDataURL('image/png'); link.click();
  } catch(e) { alert('Could not generate the card image: ' + e.message); }
  finally {
    restoreAvatars(originals);
    btn.closest('.download-card-wrap').style.display='';
    detail.style.overflow=''; detail.style.maxHeight=wasOpen?'none':prevMaxH;
    if (!wasOpen) card.classList.remove('is-open');
    card.style.opacity=''; card.style.transform=''; card.style.animation='';
    btn.textContent='Download Card'; btn.classList.remove('loading');
  }
}
document.addEventListener('click', e=>{const b=e.target.closest('.download-card-btn');if(b){e.stopPropagation();downloadFighterCard(b);}});

// ─────────────────────────────────────────
//  HELPER: imagen local → base64
//  Estrategia 1: File System Access API (carpeta img/ conectada)
//  Estrategia 2: fetch() blob (funciona con servidor local / extensión)
//  Estrategia 3: null → la imagen no aparece en el export
// ─────────────────────────────────────────
async function imgToBase64(url) {
  // Estrategia 1: leer directo desde la carpeta img/ conectada via FSA
  if (imagesDirHandle) {
    try {
      const filename = url.split('/').pop().split('?')[0];
      const fileHandle = await imagesDirHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    } catch { /* no estaba en esa carpeta, intentar fetch */ }
  }
  // Estrategia 2: fetch como blob (funciona con servidor HTTP)
  try {
    const cleanUrl = url.split('?')[0];
    const resp = await fetch(cleanUrl);
    if (!resp.ok) throw new Error('fetch failed');
    const blob = await resp.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

async function inlineAvatarsForExport(target) {
  const imgs = [...target.querySelectorAll('.fighter-avatar img')];
  const originals = [];
  for (const img of imgs) {
    const orig = img.src;
    originals.push({ img, orig });
    const b64 = await imgToBase64(orig);
    if (b64) img.src = b64;
  }
  return originals; // para restaurar después
}

function restoreAvatars(originals) {
  for (const { img, orig } of originals) img.src = orig;
}

// ─────────────────────────────────────────
//  EXPORT PNG
// ─────────────────────────────────────────
async function exportPNG(targetId, filename, btnEl, btnLabel) {
  btnEl.textContent='Generating...'; btnEl.classList.add('loading');
  const target=document.getElementById(targetId);
  const allCards=target.querySelectorAll('.fighter-card,.apb-card');
  const hEls=target.querySelectorAll('.header-eyebrow,.header-title,.header-sub,.gold-line,.apb-header h2,.apb-header p');
  allCards.forEach(c=>{c.style.opacity='1';c.style.transform='none';c.style.animation='none';});
  hEls.forEach(el=>{el.style.opacity='1';el.style.transform='none';el.style.animation='none';});
  document.body.classList.add('no-overlay'); target.classList.add('capturing');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  await new Promise(r=>setTimeout(r,80));
  const originals = await inlineAvatarsForExport(target);
  await new Promise(r=>setTimeout(r,40));
  try {
    const W=target.scrollWidth, H=target.scrollHeight;
    const canvas=await html2canvas(target,{backgroundColor:'#0a0a0a',scale:3,useCORS:false,allowTaint:true,logging:false,scrollX:0,scrollY:0,width:W,height:H,windowWidth:W,windowHeight:H});
    const link=document.createElement('a'); link.download=filename; link.href=canvas.toDataURL('image/png'); link.click();
    showToast('Image downloaded');
  } catch(e) { alert('Could not generate the image: ' + e.message); }
  finally {
    restoreAvatars(originals);
    allCards.forEach(c=>{c.style.opacity='';c.style.transform='';c.style.animation='';});
    hEls.forEach(el=>{el.style.opacity='';el.style.transform='';el.style.animation='';});
    target.classList.remove('capturing'); document.body.classList.remove('no-overlay');
    btnEl.textContent=btnLabel; btnEl.classList.remove('loading');
  }
}

document.getElementById('exportBtn').addEventListener('click', function() {
  if (openCard){openCard.querySelector('.card-detail').style.maxHeight='0';openCard.classList.remove('is-open');openCard=null;}
  exportPNG('ranking-export','combat-ranking.png',this,'Export Ranking');
});

document.getElementById('exportApbBtn').addEventListener('click', function() {
  exportPNG('apb-export','event-history.png',this,'Export History');
});

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
loadInitialData();
recalcAllRecords();
buildRankingTab();
buildAPBTab();
buildManageTab();
buildTimelineTab();
updateFSABanner();