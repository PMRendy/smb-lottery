[index.html](https://github.com/user-attachments/files/29441525/index.html)
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SMB Lottery</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font-sans,system-ui,sans-serif);background:var(--surface-0,#f5f5f3);color:var(--text-primary,#1a1a18);min-height:100vh}
.screen{display:none;min-height:100vh;padding:1.5rem}
.screen.active{display:flex;flex-direction:column;align-items:center;justify-content:center}
.card{background:var(--surface-2,#fff);border:0.5px solid var(--border,rgba(0,0,0,.12));border-radius:12px;padding:1.5rem;width:100%;max-width:500px}
h1{font-size:22px;font-weight:500;text-align:center;margin-bottom:4px}
.sub{font-size:13px;color:var(--text-muted,#888);text-align:center;margin-bottom:1.5rem}
input[type=text],input[type=password],input[type=time]{width:100%;padding:10px 12px;border:0.5px solid var(--border-strong,rgba(0,0,0,.2));border-radius:8px;font-size:15px;background:var(--surface-1,#f9f9f7);color:var(--text-primary,#1a1a18);margin-bottom:12px;outline:none}
input:focus{border-color:#378add;box-shadow:0 0 0 3px rgba(55,138,221,.15)}
button{width:100%;padding:10px;border:0.5px solid var(--border-strong,rgba(0,0,0,.2));border-radius:8px;background:transparent;color:var(--text-primary,#1a1a18);font-size:14px;cursor:pointer;margin-bottom:8px;transition:background .15s}
button:hover{background:var(--surface-1,#f5f5f3)}
button:disabled{opacity:.4;cursor:not-allowed}
button.primary{background:#1a1a18;color:#fff;border-color:#1a1a18}
button.primary:hover{background:#333}
button.accent{background:#185fa5;color:#fff;border-color:#185fa5}
button.accent:hover{background:#0c447c}
button.success{background:#3b6d11;color:#fff;border-color:#3b6d11}
button.success:hover{background:#27500a}
button.warn{background:#854f0b;color:#fff;border-color:#854f0b}
button.warn:hover{background:#633806}
.err{font-size:13px;color:#a32d2d;min-height:18px;text-align:center;margin-bottom:8px}
.num-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:1rem 0}
.num-btn{aspect-ratio:1;border-radius:50%;border:0.5px solid var(--border-strong,rgba(0,0,0,.2));background:var(--surface-1,#f9f9f7);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;padding:0}
.num-btn:hover:not(:disabled){background:#e6f1fb;border-color:#378add;color:#0c447c}
.num-btn.selected{background:#185fa5;border-color:#185fa5;color:#fff}
.num-btn:disabled{opacity:.4;cursor:not-allowed}
.picks-row{display:flex;gap:8px;justify-content:center;margin:1rem 0}
.pick-bubble{width:44px;height:44px;border-radius:50%;border:2px dashed var(--border-strong,rgba(0,0,0,.2));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:500;color:var(--text-muted,#aaa);transition:all .2s}
.pick-bubble.filled{background:#185fa5;border:2px solid #185fa5;color:#fff}
.drawn-nums{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0}
.drawn-ball{width:50px;height:50px;border-radius:50%;background:#185fa5;color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:500;border:3px solid #0c447c}
.drawn-ball.pending{background:var(--surface-1,#f5f5f3);color:var(--text-muted,#aaa);border:2px dashed var(--border-strong,rgba(0,0,0,.2))}
.entries-list{max-height:280px;overflow-y:auto;margin:8px 0}
.entry-row{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:0.5px solid var(--border,rgba(0,0,0,.08));font-size:13px}
.entry-row:last-child{border-bottom:none}
.entry-nums{display:flex;gap:4px;flex-shrink:0}
.e-ball{width:24px;height:24px;border-radius:50%;background:#e6f1fb;color:#0c447c;font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center}
.e-ball.match{background:#185fa5;color:#fff}
.winner-badge{font-size:11px;background:#eaf3de;color:#3b6d11;padding:2px 8px;border-radius:20px;flex-shrink:0;margin-left:auto}
.section-label{font-size:12px;color:var(--text-muted,#aaa);font-weight:500;margin-bottom:6px;letter-spacing:.04em}
.tab-bar{display:flex;border:0.5px solid var(--border-strong,rgba(0,0,0,.2));border-radius:8px;overflow:hidden;margin-bottom:1rem;width:100%;max-width:500px}
.tab{flex:1;padding:8px;font-size:12px;border:none;background:transparent;cursor:pointer;color:var(--text-secondary,#666);margin:0}
.tab.active{background:#1a1a18;color:#fff}
.slot-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.slot-num{width:24px;height:24px;border-radius:50%;background:#185fa5;color:#fff;font-size:12px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cdisplay{font-size:13px;font-weight:500;font-family:var(--font-mono,monospace);min-width:72px;text-align:right;color:#185fa5}
.cdisplay.imminent{color:#a32d2d;font-weight:700}
.history-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--border,rgba(0,0,0,.08))}
.history-row:last-child{border-bottom:none}
.h-balls{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}
.h-ball{width:26px;height:26px;border-radius:50%;background:#e6f1fb;color:#0c447c;font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center}
.history-check{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--border,rgba(0,0,0,.08))}
.history-check:last-child{border-bottom:none}
.history-check input[type=checkbox]{width:16px;height:16px;margin-top:3px;flex-shrink:0;accent-color:#185fa5;cursor:pointer}
.auto-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;background:#eaf3de;color:#3b6d11;padding:4px 10px;border-radius:20px;margin-bottom:12px}
.dot{width:7px;height:7px;border-radius:50%;background:#3b6d11;animation:blink 1.2s infinite;flex-shrink:0}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
.log-list{max-height:110px;overflow-y:auto;margin-top:6px}
.log-entry{font-size:12px;color:var(--text-secondary,#555);padding:3px 0;border-bottom:0.5px solid var(--border,rgba(0,0,0,.06))}
.log-entry:last-child{border-bottom:none}
hr{border:none;border-top:0.5px solid var(--border,rgba(0,0,0,.08));margin:1rem 0}
.announce-box{background:var(--surface-1,#f9f9f7);border:0.5px solid var(--border,rgba(0,0,0,.12));border-radius:10px;padding:12px;margin-bottom:12px}
.announce-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.announce-cd{font-size:13px;font-weight:500;font-family:var(--font-mono,monospace);color:#185fa5;min-width:72px}
.announce-cd.imminent{color:#a32d2d;font-weight:700}
.rule-row{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:0.5px solid var(--border,rgba(0,0,0,.06));font-size:13px}
.rule-row:last-child{border-bottom:none}
.rule-icon{width:22px;height:22px;border-radius:50%;background:#e6f1fb;color:#0c447c;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="loginScreen" class="screen active">
  <div style="text-align:center;margin-bottom:1.5rem">
    <div style="font-size:36px;margin-bottom:6px">🎱</div>
    <h1>SMB Lottery</h1>
    <p class="sub">Bayaning Puyat Draw &mdash; pick 5 lucky numbers</p>
  </div>
  <div class="card">
    <p class="section-label">Your name</p>
    <input type="text" id="loginName" placeholder="Enter your name" autocomplete="off">
    <p class="section-label">PIN</p>
    <input type="password" id="loginPin" placeholder="&bull;&bull;&bull;&bull;&bull;" maxlength="10">
    <div class="err" id="loginErr"></div>
    <button class="primary" onclick="doLogin()">Continue</button>
    <button onclick="$('loginName').value='Admin'">Go to admin</button>
  </div>
</div>

<!-- AGENT PICK SCREEN -->
<div id="pickScreen" class="screen">
  <div style="width:100%;max-width:500px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem">
      <div style="width:36px;height:36px;border-radius:50%;background:#e6f1fb;display:flex;align-items:center;justify-content:center;font-weight:500;font-size:14px;color:#0c447c;flex-shrink:0" id="agentInitials"></div>
      <div>
        <p style="font-size:15px;font-weight:500" id="agentName"></p>
        <p style="font-size:12px;color:var(--text-muted,#aaa)">Pick 5 numbers · 1 to 42</p>
      </div>
      <button onclick="logout()" style="width:auto;padding:6px 12px;margin:0;margin-left:auto;font-size:12px">Log out</button>
    </div>
    <div class="card">
      <p class="section-label">Your picks</p>
      <div class="picks-row" id="picksRow"></div>
      <div class="num-grid" id="numGrid"></div>
      <div class="err" id="pickErr"></div>
      <button class="accent" id="submitBtn" onclick="submitPicks()" disabled>Submit picks</button>
      <button onclick="clearPicks()">Clear</button>
    </div>
    <p id="alreadyMsg" style="font-size:13px;color:#3b6d11;text-align:center;margin-top:10px;display:none">Picks locked in. Good luck!</p>
  </div>
</div>

<!-- ADMIN SCREEN -->
<div id="adminScreen" class="screen">
  <div style="width:100%;max-width:500px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem">
      <h1 style="font-size:18px;flex:1">Admin panel</h1>
      <button onclick="logout()" style="width:auto;padding:6px 12px;margin:0;font-size:12px">Log out</button>
    </div>
    <div class="tab-bar">
      <button class="tab active" onclick="switchTab('schedule')">Schedule</button>
      <button class="tab" onclick="switchTab('draw')">Draw</button>
      <button class="tab" onclick="switchTab('entries')">Entries</button>
      <button class="tab" onclick="switchTab('history')">History</button>
      <button class="tab" onclick="switchTab('settings')">Settings</button>
    </div>

    <!-- SCHEDULE TAB -->
    <div id="tabSchedule" class="card">
      <div class="auto-badge"><span class="dot"></span>Auto-draw active</div>

      <p class="section-label">Draw times (PHT) — one draw per slot</p>
      <div id="drawSlots"></div>
      <button class="primary" onclick="saveSchedule()">Save draw schedule</button>
      <p id="scheduleMsg" style="font-size:13px;color:#3b6d11;text-align:center;margin-top:6px;min-height:18px"></p>

      <hr>

      <!-- ANNOUNCEMENT TIME -->
      <p class="section-label">Shift summary announcement time (PHT)</p>
      <div class="announce-box">
        <div class="announce-row">
          <input type="time" id="announceTime" value="06:00" style="flex:1;margin:0">
          <div class="announce-cd" id="announceCd">--:--:--</div>
        </div>
        <p style="font-size:12px;color:var(--text-muted,#aaa);line-height:1.5">At this time, all winning numbers from every completed draw this shift will be posted as a single summary message to #general-all-smb-staff.</p>
      </div>
      <button class="primary" onclick="saveAnnounceTime()">Save announcement time</button>
      <p id="announceMsg" style="font-size:13px;color:#3b6d11;text-align:center;margin-top:6px;min-height:18px"></p>

      <hr>

      <p class="section-label">Slack posting rules</p>
      <div style="margin-bottom:4px">
        <div class="rule-row"><div class="rule-icon">1</div><div><strong>Per number drawn</strong> — each number is posted to #general-all-smb-staff the moment it is drawn from the wheel.</div></div>
        <div class="rule-row"><div class="rule-icon">2</div><div><strong>Shift summary</strong> — all draw results for the shift are posted as one consolidated message at the announcement time set above.</div></div>
      </div>

      <hr>
      <button class="warn" onclick="testDraw()">Run test draw now</button>
      <p style="font-size:12px;color:var(--text-muted,#aaa);text-align:center;margin-top:-4px">Fires a full draw immediately. Posts each number live + a summary. Uses label "Test Draw".</p>
    </div>

    <!-- DRAW TAB -->
    <div id="tabDraw" class="card" style="display:none">
      <p class="section-label">Current draw</p>
      <div id="currentDrawLabel" style="font-size:13px;color:var(--text-muted,#aaa);margin-bottom:10px">Waiting for next scheduled draw</div>
      <div class="drawn-nums" id="drawnNums"></div>
      <div style="display:flex;justify-content:center;margin:8px 0">
        <canvas id="wheel" width="240" height="240"></canvas>
      </div>
      <div id="spinStatus" style="font-size:13px;color:var(--text-muted,#aaa);text-align:center;margin-bottom:8px">Ready</div>
      <button class="accent" id="spinBtn" onclick="manualSpin()">Spin wheel</button>
      <button onclick="resetCurrentDraw()">Reset draw</button>
      <hr>
      <p class="section-label">Activity log</p>
      <div class="log-list" id="logList"><p style="font-size:12px;color:var(--text-muted,#aaa)">No activity yet.</p></div>
    </div>

    <!-- ENTRIES TAB -->
    <div id="tabEntries" class="card" style="display:none">
      <p class="section-label">Agent entries (<span id="entryCount">0</span>)</p>
      <div class="entries-list" id="entriesList"></div>
    </div>

    <!-- HISTORY TAB -->
    <div id="tabHistory" class="card" style="display:none">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <p class="section-label" style="margin:0">Completed draws this session</p>
        <button onclick="toggleSelectAll()" id="selectAllBtn" style="width:auto;padding:4px 10px;margin:0;font-size:12px">Select all</button>
      </div>
      <div id="historyList"><p style="font-size:13px;color:var(--text-muted,#aaa)">No draws completed yet.</p></div>
      <hr>
      <button class="success" onclick="postSelectedSummary()">Post selected to Slack</button>
    </div>

    <!-- SETTINGS TAB -->
    <div id="tabSettings" class="card" style="display:none">
      <p class="section-label">Slack webhook</p>
      <input type="text" id="webhookUrl" placeholder="https://hooks.slack.com/services/...">
      <p class="section-label">Admin PIN</p>
      <input type="password" id="newAdminPin" placeholder="Leave blank to keep current">
      <p class="section-label">Agent PIN</p>
      <input type="password" id="newAgentPin" placeholder="Leave blank to keep current">
      <button class="primary" onclick="saveSettings()">Save settings</button>
      <p id="settingsMsg" style="font-size:13px;color:#3b6d11;text-align:center;margin-top:6px;min-height:18px"></p>
    </div>
  </div>
</div>

<script>
const STATE={
  adminPin:'010285', agentPin:'12345', webhookUrl:'',
  entries:{},
  drawTimes:['01:00','02:00','03:00','04:00','05:00'],
  announceTime:'06:00',
  announceFired: false,
  currentNums:[], spinning:false,
  drawHistory:[], firedTimes:new Set()
};

let currentUser=null, wheelAngle=0, agentPicks=[], masterClock=null, actLog=[];
const COLORS=['#185fa5','#3b6d11','#993c1d','#534ab7','#854f0b','#7f77dd','#d4537e','#0f6e56','#633806','#a32d2d'];

function $(id){return document.getElementById(id)}
function screen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active')}
function logout(){currentUser=null;$('loginName').value='';$('loginPin').value='';$('loginErr').textContent='';screen('loginScreen')}

function doLogin(){
  const name=$('loginName').value.trim(), pin=$('loginPin').value.trim();
  if(!name){$('loginErr').textContent='Enter your name.';return}
  if(pin===STATE.agentPin){currentUser={name,role:'agent'};loadPickScreen();screen('pickScreen')}
  else if(pin===STATE.adminPin){currentUser={name,role:'admin'};loadAdminScreen();screen('adminScreen')}
  else $('loginErr').textContent='Incorrect PIN.';
}
$('loginPin').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});

/* ── AGENT ── */
function loadPickScreen(){
  const n=currentUser.name;
  $('agentName').textContent=n;
  $('agentInitials').textContent=n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  agentPicks=(STATE.entries[n]?.picks)||[];
  buildNumGrid(); renderPicksRow();
  const locked=!!STATE.entries[n]?.locked;
  disableGrid(locked);
  $('submitBtn').disabled=locked||agentPicks.length!==5;
  $('alreadyMsg').style.display=locked?'block':'none';
}
function buildNumGrid(){
  const g=$('numGrid');g.innerHTML='';
  for(let i=1;i<=42;i++){
    const b=document.createElement('button');
    b.className='num-btn'+(agentPicks.includes(i)?' selected':'');
    b.textContent=i; b.onclick=()=>toggleNum(i,b); g.appendChild(b);
  }
}
function toggleNum(n,btn){
  if(STATE.entries[currentUser?.name]?.locked)return;
  const idx=agentPicks.indexOf(n);
  if(idx>-1){agentPicks.splice(idx,1);btn.classList.remove('selected')}
  else{if(agentPicks.length>=5){$('pickErr').textContent='Max 5 numbers.';return}agentPicks.push(n);btn.classList.add('selected')}
  $('pickErr').textContent=''; renderPicksRow();
  $('submitBtn').disabled=agentPicks.length!==5;
}
function renderPicksRow(){
  const r=$('picksRow');r.innerHTML='';
  for(let i=0;i<5;i++){
    const d=document.createElement('div');
    d.className='pick-bubble'+(agentPicks[i]!==undefined?' filled':'');
    d.textContent=agentPicks[i]??''; r.appendChild(d);
  }
}
function clearPicks(){agentPicks=[];buildNumGrid();renderPicksRow();$('submitBtn').disabled=true}
function disableGrid(yes){document.querySelectorAll('.num-btn').forEach(b=>b.disabled=yes)}
function submitPicks(){
  if(agentPicks.length!==5){$('pickErr').textContent='Pick exactly 5.';return}
  STATE.entries[currentUser.name]={picks:[...agentPicks],locked:true};
  disableGrid(true);$('submitBtn').disabled=true;$('alreadyMsg').style.display='block';
}

/* ── ADMIN ── */
function loadAdminScreen(){
  $('webhookUrl').value=STATE.webhookUrl;
  $('announceTime').value=STATE.announceTime;
  renderDrawSlots(); renderDrawPanel(); renderEntries(); renderHistory();
  startMasterClock();
}
function switchTab(tab){
  ['schedule','draw','entries','history','settings'].forEach(t=>{
    const el=$('tab'+t.charAt(0).toUpperCase()+t.slice(1));
    if(el) el.style.display=t===tab?'':'none';
  });
  document.querySelectorAll('.tab').forEach((b,i)=>{
    b.classList.toggle('active',['schedule','draw','entries','history','settings'][i]===tab);
  });
  if(tab==='entries') renderEntries();
  if(tab==='draw') renderDrawPanel();
  if(tab==='history') renderHistory();
}

function renderDrawSlots(){
  const c=$('drawSlots');c.innerHTML='';
  STATE.drawTimes.forEach((t,i)=>{
    const row=document.createElement('div');row.className='slot-row';
    row.innerHTML=`<div class="slot-num">${i+1}</div>
      <input type="time" value="${t}" id="dt${i}" style="flex:1;margin:0">
      <div class="cdisplay" id="cd${i}">--:--:--</div>`;
    c.appendChild(row);
  });
}
function saveSchedule(){
  STATE.drawTimes=STATE.drawTimes.map((_,i)=>$(`dt${i}`).value);
  STATE.firedTimes.clear();
  $('scheduleMsg').textContent='Draw schedule saved.';
  setTimeout(()=>$('scheduleMsg').textContent='',2500);
}
function saveAnnounceTime(){
  STATE.announceTime=$('announceTime').value;
  STATE.announceFired=false;
  $('announceMsg').textContent='Announcement time saved.';
  setTimeout(()=>$('announceMsg').textContent='',2500);
}

/* ── MASTER CLOCK ── */
function startMasterClock(){
  if(masterClock)clearInterval(masterClock);
  masterClock=setInterval(()=>{
    const now=new Date();
    const hhmm=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    const sec=now.getSeconds();

    // draw slot countdowns
    STATE.drawTimes.forEach((t,i)=>{
      const cd=$(`cd${i}`);
      if(cd){const ms=msUntil(t);cd.textContent=fmtMs(ms);cd.className='cdisplay'+(ms<60000?' imminent':'');}
      if(t===hhmm && sec===0 && !STATE.firedTimes.has(t+'-'+now.toDateString())){
        STATE.firedTimes.add(t+'-'+now.toDateString());
        if(!STATE.spinning){addLog(`Scheduled draw triggered at ${t} PHT`);runDraw(`Draw at ${t} PHT`,false);}
      }
    });

    // announcement countdown
    const acd=$('announceCd');
    if(acd){const ms=msUntil(STATE.announceTime);acd.textContent=fmtMs(ms);acd.className='announce-cd'+(ms<60000?' imminent':'');}
    if(STATE.announceTime===hhmm && sec===0 && !STATE.announceFired){
      STATE.announceFired=true;
      addLog('Shift summary announcement triggered');
      postShiftSummary(true);
    }
  },1000);
}

function msUntil(timeStr){
  const now=new Date();
  const [h,m]=timeStr.split(':').map(Number);
  const t=new Date(now);t.setHours(h,m,0,0);
  if(t<=now)t.setDate(t.getDate()+1);
  return t-now;
}
function fmtMs(ms){
  return [Math.floor(ms/3600000),Math.floor((ms%3600000)/60000),Math.floor((ms%60000)/1000)].map(v=>v.toString().padStart(2,'0')).join(':');
}

/* ── LOG ── */
function addLog(msg){
  const now=new Date();
  const ts=[now.getHours(),now.getMinutes(),now.getSeconds()].map(v=>v.toString().padStart(2,'0')).join(':');
  actLog.unshift(`${ts} — ${msg}`);
  if(actLog.length>30)actLog.pop();
  renderLog();
}
function renderLog(){
  const c=$('logList');if(!c)return;
  c.innerHTML=actLog.length?actLog.map(l=>`<div class="log-entry">${l}</div>`).join(''):'<p style="font-size:12px;color:var(--text-muted,#aaa)">No activity yet.</p>';
}

/* ── DRAW ENGINE ── */
function runDraw(label, isTest=false){
  if(STATE.spinning)return;
  STATE.currentNums=[];
  if(currentUser?.role==='admin'){renderDrawPanel();switchTab('draw');}
  const lbl=$('currentDrawLabel');if(lbl)lbl.textContent=label+(isTest?' (test)':'');
  addLog(`Starting: ${label}`);
  const spinNext=()=>{
    if(STATE.currentNums.length>=5){
      addLog(`Complete — ${label} — ${STATE.currentNums.join(', ')}`);
      const now=new Date();
      const record={label,nums:[...STATE.currentNums],date:now.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}),time:now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),test:isTest};
      STATE.drawHistory.unshift(record);
      if(currentUser?.role==='admin'){renderDrawPanel();renderEntries();renderHistory();}
      return;
    }
    spinOneNumber(label, ()=>setTimeout(spinNext,2500));
  };
  spinNext();
}

function testDraw(){
  if(STATE.spinning){alert('A draw is already running.');return}
  addLog('Test draw initiated by admin');
  runDraw('Test Draw',true);
  switchTab('draw');
}

function spinOneNumber(drawLabel, cb){
  const avail=[];
  for(let i=1;i<=42;i++) if(!STATE.currentNums.includes(i)) avail.push(i);
  if(!avail.length){cb&&cb();return}
  const target=avail[Math.floor(Math.random()*avail.length)];
  STATE.spinning=true;
  if(currentUser?.role==='admin'){
    const sb=$('spinBtn');if(sb)sb.disabled=true;
    const ss=$('spinStatus');if(ss)ss.textContent=`Spinning… (${STATE.currentNums.length+1} of 5)`;
  }
  const dur=2600+Math.random()*1400;
  const extraSpins=4+Math.floor(Math.random()*4);
  const slice=(2*Math.PI)/avail.length;
  const tIdx=avail.indexOf(target);
  const tAngle=-(tIdx*slice+slice/2)+Math.PI/2;
  const total=extraSpins*2*Math.PI+(tAngle-wheelAngle%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  const sa=wheelAngle, t0=performance.now();
  function step(now){
    const t=Math.min((now-t0)/dur,1);
    const ease=1-Math.pow(1-t,4);
    wheelAngle=sa+total*ease;
    if(currentUser?.role==='admin') drawWheel(wheelAngle,t===1?target:null);
    if(t<1){requestAnimationFrame(step)}
    else{
      wheelAngle=sa+total;
      STATE.currentNums.push(target);
      addLog(`Drew: ${target} (${STATE.currentNums.length}/5)`);
      // RULE 1 — post each number live to Slack
      postNumberLive(drawLabel, target, STATE.currentNums.length);
      if(currentUser?.role==='admin'){
        renderDrawnBalls();
        const ss=$('spinStatus');if(ss)ss.textContent=`Drew ${target} — ${STATE.currentNums.length}/5`;
      }
      STATE.spinning=false;
      cb&&cb();
    }
  }
  requestAnimationFrame(step);
}

function manualSpin(){
  if(STATE.spinning)return;
  if(STATE.currentNums.length>=5){return}
  const lbl=$('currentDrawLabel');
  if(!lbl.textContent||lbl.textContent.includes('Waiting')) lbl.textContent='Manual draw';
  const label=lbl.textContent;
  spinOneNumber(label,()=>{
    if(STATE.currentNums.length>=5){
      addLog(`Manual draw complete — ${STATE.currentNums.join(', ')}`);
      const record={label:'Manual draw',nums:[...STATE.currentNums],date:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}),time:new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),test:false};
      STATE.drawHistory.unshift(record);
      renderHistory();
    }
    renderDrawPanel();renderEntries();
  });
}

function resetCurrentDraw(){
  STATE.currentNums=[];wheelAngle=0;
  const lbl=$('currentDrawLabel');if(lbl)lbl.textContent='Waiting for next scheduled draw';
  renderDrawPanel();addLog('Draw reset by admin');
}

/* ── WHEEL & UI ── */
function renderDrawPanel(){
  renderDrawnBalls();drawWheel(wheelAngle,null);
  const done=STATE.currentNums.length>=5;
  const sb=$('spinBtn');if(sb){sb.disabled=STATE.spinning||done;}
  const ss=$('spinStatus');if(ss)ss.textContent=STATE.spinning?'Spinning…':done?'All 5 drawn — reset to run again':'Ready';
  renderLog();
}
function renderDrawnBalls(){
  const c=$('drawnNums');if(!c)return;c.innerHTML='';
  for(let i=0;i<5;i++){
    const b=document.createElement('div');
    b.className='drawn-ball'+(STATE.currentNums[i]===undefined?' pending':'');
    b.textContent=STATE.currentNums[i]??'?';c.appendChild(b);
  }
}
function drawWheel(angle,highlight){
  const canvas=$('wheel');if(!canvas)return;
  const ctx=canvas.getContext('2d'),cx=120,cy=120,r=108;
  const nums=[];for(let i=1;i<=42;i++) if(!STATE.currentNums.includes(i)) nums.push(i);
  ctx.clearRect(0,0,240,240);
  if(!nums.length){ctx.fillStyle='#888';ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText('All drawn',cx,cy);return;}
  const slice=(2*Math.PI)/nums.length;
  nums.forEach((n,i)=>{
    const s=angle+i*slice,e=s+slice;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,s,e);ctx.closePath();
    ctx.fillStyle=COLORS[i%COLORS.length];ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(s+slice/2);
    ctx.textAlign='right';ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';
    ctx.fillText(n,r-5,4);ctx.restore();
  });
  ctx.beginPath();ctx.arc(cx,cy,14,0,2*Math.PI);
  ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+r+8,cy-7);ctx.lineTo(cx+r+8,cy+7);ctx.lineTo(cx+r-4,cy);
  ctx.closePath();ctx.fillStyle='#a32d2d';ctx.fill();
  if(highlight!=null){
    const idx=nums.indexOf(highlight);
    if(idx>-1){const s=angle+idx*slice,e=s+slice;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,s,e);ctx.closePath();ctx.strokeStyle='#ffcc00';ctx.lineWidth=4;ctx.stroke();}
  }
}

function renderEntries(){
  const list=$('entriesList');list.innerHTML='';
  const names=Object.keys(STATE.entries);
  $('entryCount').textContent=names.length;
  if(!names.length){list.innerHTML='<p style="font-size:13px;color:var(--text-muted,#aaa);padding:8px 12px">No entries yet.</p>';return}
  names.forEach(name=>{
    const e=STATE.entries[name];
    const row=document.createElement('div');row.className='entry-row';
    const m=e.picks.filter(n=>STATE.currentNums.includes(n)).length;
    const numsHtml=e.picks.map(n=>`<div class="e-ball${STATE.currentNums.includes(n)?' match':''}">${n}</div>`).join('');
    const badge=m===5?'<span class="winner-badge">JACKPOT!</span>':m>=3?`<span class="winner-badge">${m} match</span>`:'';
    row.innerHTML=`<span style="font-weight:500;min-width:90px;flex-shrink:0">${name}</span><div class="entry-nums">${numsHtml}</div>${badge}`;
    list.appendChild(row);
  });
}
function renderHistory(){
  const c=$('historyList');if(!c)return;
  if(!STATE.drawHistory.length){c.innerHTML='<p style="font-size:13px;color:var(--text-muted,#aaa)">No draws completed yet.</p>';return}
  c.innerHTML=STATE.drawHistory.map((r,i)=>`
    <div class="history-check">
      <input type="checkbox" id="hchk${i}" checked>
      <label for="hchk${i}" style="flex:1;cursor:pointer">
        <p style="font-size:13px;font-weight:500;margin-bottom:2px">${r.label}${r.test?' <span style="font-size:11px;background:#faeeda;color:#633806;padding:1px 6px;border-radius:10px">test</span>':''}</p>
        <p style="font-size:12px;color:var(--text-muted,#aaa);margin-bottom:4px">${r.date} &middot; ${r.time}</p>
        <div class="h-balls">${r.nums.map(n=>`<div class="h-ball">${n}</div>`).join('')}</div>
      </label>
    </div>`).join('');
}
function toggleSelectAll(){
  const boxes=document.querySelectorAll('[id^=hchk]');
  const allChecked=[...boxes].every(b=>b.checked);
  boxes.forEach(b=>b.checked=!allChecked);
  $('selectAllBtn').textContent=allChecked?'Select all':'Deselect all';
}
async function postSelectedSummary(){
  const boxes=document.querySelectorAll('[id^=hchk]');
  const selected=[...boxes].map((b,i)=>b.checked?STATE.drawHistory[i]:null).filter(Boolean);
  if(!selected.length){addLog('No draws selected');return;}
  const real=selected.filter(r=>!r.test);
  if(!real.length){addLog('Only test draws selected — nothing to post');return;}
  let text=`:trophy: *SMB Lottery — Draw Results*\n\n`;
  real.slice().reverse().forEach(r=>{
    const winners=Object.entries(STATE.entries).filter(([,e])=>e.picks.filter(n=>r.nums.includes(n)).length===5).map(([n])=>n);
    const partials=Object.entries(STATE.entries).map(([name,e])=>({name,m:e.picks.filter(n=>r.nums.includes(n)).length})).filter(x=>x.m>=1&&x.m<5).sort((a,b)=>b.m-a.m);
    text+=`:eight_spoked_asterisk: *${r.label}*\n`;
    text+=`   📅 ${r.date} · ${r.time}\n`;
    text+=`   Numbers: \`${r.nums.join(' · ')}\`\n`;
    if(winners.length) text+=`   :tada: Jackpot: ${winners.join(', ')}\n`;
    else text+=`   _No jackpot_\n`;
    if(partials.length) text+=`   :star: Top: ${partials[0].name} (${partials[0].m} match${partials[0].m>1?'es':''})\n`;
    text+='\n';
  });
  addLog(`Posting ${real.length} selected draw(s) to Slack…`);
  const ok=await slackPost(text);
  if(ok) addLog('Selected results posted to Slack');
}

/* ── SLACK ── */
async function slackPost(text){
  const WEBHOOK='https://hooks.slack.com/services/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';
  try{
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:1000,
        messages:[{role:'user',content:`Send a message to Slack channel #general-all-smb-staff with this exact text:\n\n${text}`}],
        mcp_servers:[{type:'url',url:'https://mcp.slack.com/mcp',name:'slack'}]
      })
    });
    if(res.ok){addLog('Slack: message sent');return true;}
    addLog(`Slack post failed — ${res.status}`);return false;
  } catch(e){
    addLog('Slack post failed — '+e.message);return false;
  }
}

// RULE 1 — post each number as it is drawn
async function postNumberLive(drawLabel, number, idx){
  const balls=[':one:',':two:',':three:',':four:',':five:'];
  const text=`:lottery: *SMB Lottery — ${drawLabel}*\n${balls[idx-1]||`#${idx}`} Number drawn: *${number}*`;
  const ok=await slackPost(text);
  if(ok) addLog(`Slack: posted number ${number} (${idx}/5)`);
}

// RULE 2 — shift summary at announcement time (or manually)
async function postShiftSummary(auto=false){
  if(!STATE.drawHistory.length){addLog('No completed draws to summarise');return;}
  const realDraws=STATE.drawHistory.filter(r=>!r.test);
  if(!realDraws.length){addLog('No real draws to summarise (test draws excluded)');return;}

  let text=`:trophy: *SMB Lottery — Shift Summary*${auto?' _(auto-posted)_':''}\n\n`;
  realDraws.slice().reverse().forEach(r=>{
    const winners=Object.entries(STATE.entries).filter(([,e])=>e.picks.filter(n=>r.nums.includes(n)).length===5).map(([n])=>n);
    const partials=Object.entries(STATE.entries).map(([name,e])=>({name,m:e.picks.filter(n=>r.nums.includes(n)).length})).filter(x=>x.m>=1&&x.m<5).sort((a,b)=>b.m-a.m);
    text+=`:eight_spoked_asterisk: *${r.label}* (${r.time}) — \`${r.nums.join(' · ')}\`\n`;
    if(winners.length) text+=`   :tada: Jackpot: ${winners.join(', ')}\n`;
    if(partials.length) text+=`   :star: Top match: ${partials[0].name} (${partials[0].m} match${partials[0].m>1?'es':''})\n`;
    text+='\n';
  });

  addLog('Posting shift summary to Slack…');
  const ok=await slackPost(text);
  if(ok) addLog('Shift summary posted to Slack');
}

function saveSettings(){
  const w=$('webhookUrl').value.trim(),ap=$('newAdminPin').value.trim(),up=$('newAgentPin').value.trim();
  if(w)STATE.webhookUrl=w;if(ap)STATE.adminPin=ap;if(up)STATE.agentPin=up;
  $('settingsMsg').textContent='Saved.';setTimeout(()=>$('settingsMsg').textContent='',2000);
}

drawWheel(0,null);
</script>
</body>
</html>
