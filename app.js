
// HyperStack Dashboard v6 — with Graph Explorer
// Rate limiting
var _rl={};function rlCheck(key,ms){var now=Date.now();if(_rl[key]&&now-_rl[key]<ms)return false;_rl[key]=now;return true}
const A="https://hyperstack-cloud.vercel.app";let U=null,T=null,DV="start";
const ADMINS=["deeq.yaqub1@gmail.com"];
function adminCheck(){if(U&&ADMINS.includes(U.email))U.plan="PRO";}

const SC={projects:"#3b82f6",people:"#a855f7",decisions:"#ff6b2b",preferences:"#22c55e",workflows:"#eab308"};
const SE={projects:"📦",people:"👤",decisions:"⚖️",preferences:"⚙️",workflows:"🔄",general:"📄"};
const DEMO=[
  {slug:"project-webapp",title:"WebApp",stack:"projects",keywords:["nextjs","prisma","vercel","clerk"],body:"- Next.js 15 + Prisma + PostgreSQL\n- Auth: Clerk\n- CI: GitHub Actions → Vercel",updated:"2026-02-09",ver:3},
  {slug:"person-alice",title:"Alice Chen",stack:"people",keywords:["backend","postgresql","fastapi"],body:"- Senior Engineer, backend\n- Owns API service\n- EST timezone, morning standups",updated:"2026-02-10",ver:2},
  {slug:"decision-auth",title:"Auth: Auth0 → Clerk",stack:"decisions",keywords:["clerk","auth0","migration"],body:"- Chose Clerk (DX + pricing)\n- 3 day migration, zero downtime\n- Saves $400/month",updated:"2026-01-15",ver:1},
  {slug:"prefs-editor",title:"Editor Prefs",stack:"preferences",keywords:["neovim","typescript","fish"],body:"- TypeScript strict, 2-space indent\n- Neovim + LazyVim\n- Fish shell + starship",updated:"2026-02-10",ver:1},
];

function go(p){document.querySelectorAll('[id^="p-"]').forEach(e=>e.classList.add("hidden"));
  const el=document.getElementById("p-"+p);if(el)el.classList.remove("hidden");window.scrollTo(0,0);
  const l=!!U;document.getElementById("nl").classList.toggle("hidden",l);
  document.getElementById("nd").classList.toggle("hidden",!l);
  document.getElementById("no").classList.toggle("hidden",!l);
  document.querySelectorAll('.dash-back-link').forEach(a=>{a.style.display=l?'inline':'none'});
  if(p==="dash"&&U){DV="start";dt("start")}}

function heroSignup(){const e=document.getElementById("hero-email").value;
  if(!e||!e.includes("@")){document.getElementById("hero-note").innerHTML='<span style="color:var(--red)">Enter a valid email</span>';return}
  document.getElementById("su-e").value=e;go("signup")}
function bottomSignup(){const e=document.getElementById("bottom-email").value;
  if(!e||!e.includes("@")){document.getElementById("bottom-email").style.borderColor="var(--red)";document.getElementById("bottom-email").placeholder="Enter your email first";setTimeout(()=>{document.getElementById("bottom-email").style.borderColor="";document.getElementById("bottom-email").placeholder="you@example.com"},2000);return}document.getElementById("su-e").value=e;go("signup")}

async function doSignup(){if(!rlCheck("signup",10000)){return}const e=document.getElementById("su-e").value,p=document.getElementById("su-p").value,er=document.getElementById("su-err");
  er.classList.add("hidden");if(!e||!p){er.textContent="Fill in all fields";er.classList.remove("hidden");return}
  if(p.length<8){er.textContent="Password: 8+ characters";er.classList.remove("hidden");return}
  try{const r=await fetch(A+"/api/auth?action=signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});
    const d=await r.json();if(!r.ok){er.textContent=d.error||"Failed";er.classList.remove("hidden");return}
    U=d.user;T=d.token;adminCheck();localStorage.setItem("hs_t",d.token);go("dash")}
  catch(err){er.textContent="Cannot connect to server. Try again.";er.classList.remove("hidden")}}

async function doLogin(){if(!rlCheck("login",3000)){return}const e=document.getElementById("li-e").value,p=document.getElementById("li-p").value,er=document.getElementById("li-err");
  er.classList.add("hidden");if(!e||!p){er.textContent="Fill in all fields";er.classList.remove("hidden");return}
  try{const r=await fetch(A+"/api/auth?action=login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});
    const d=await r.json();if(!r.ok){er.textContent=d.error||"Failed";er.classList.remove("hidden");return}
    U=d.user;T=d.token;adminCheck();localStorage.setItem("hs_t",d.token);go("dash")}
  catch(err){er.textContent="Cannot connect to server. Try again.";er.classList.remove("hidden")}}

async function doForgot(){if(!rlCheck("forgot",30000)){document.getElementById("fp-err").textContent="Please wait 30 seconds between attempts.";document.getElementById("fp-err").classList.remove("hidden");return}
  const e=document.getElementById("fp-e").value;
  const k=document.getElementById("fp-k").value;
  const er=document.getElementById("fp-err"),ok=document.getElementById("fp-ok");
  er.classList.add("hidden");ok.classList.add("hidden");
  if(!e){er.textContent="Enter your email";er.classList.remove("hidden");return}
  if(!k){er.textContent="Enter your API key for verification";er.classList.remove("hidden");return}
  try{
    const r=await fetch(A+"/api/auth?action=request-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,apiKey:k})});
    const d=await r.json();
    if(!r.ok){er.textContent=d.error||"Verification failed. Check your email and API key.";er.classList.remove("hidden");return}
    if(d._devToken){
      sessionStorage.setItem("_rst",d._devToken);
      ok.textContent="Verified! Click below to set your new password.";ok.classList.remove("hidden");
    } else {
      ok.textContent="Verified. Proceed to set a new password.";ok.classList.remove("hidden");
    }
  }catch(err){er.textContent="Cannot connect to server.";er.classList.remove("hidden")}}

async function doReset(){
  const t=sessionStorage.getItem("_rst")||document.getElementById("rp-t").value;
  const p=document.getElementById("rp-p").value;
  const er=document.getElementById("rp-err"),ok=document.getElementById("rp-ok");
  er.classList.add("hidden");ok.classList.add("hidden");
  if(!t){er.textContent="No reset token. Go back and verify your identity first.";er.classList.remove("hidden");return}
  if(!p){er.textContent="Enter a new password";er.classList.remove("hidden");return}
  if(p.length<8){er.textContent="Password must be 8+ characters";er.classList.remove("hidden");return}
  try{
    const r=await fetch(A+"/api/auth?action=reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,password:p})});
    const d=await r.json();
    if(!r.ok){er.textContent=d.error||"Reset failed";er.classList.remove("hidden");return}
    sessionStorage.removeItem("_rst");
    ok.textContent="Password reset! Redirecting to sign in...";ok.classList.remove("hidden");
    setTimeout(()=>go("login"),2000);
  }catch(err){er.textContent="Cannot connect to server.";er.classList.remove("hidden")}}

function out(){U=null;T=null;localStorage.removeItem("hs_t");go("landing")}

function dt(t){DV=t;document.querySelectorAll(".sbtn").forEach(b=>b.classList.remove("act"));
  const b=document.getElementById("t-"+t);if(b)b.classList.add("act");
  document.querySelectorAll(".mob-nav button").forEach(b=>b.classList.remove("act"));
  const mb=document.getElementById("mt-"+t);if(mb)mb.classList.add("act");
  var dc=document.getElementById("dm");if(dc)dc.scrollTop=0;
  window.scrollTo(0,0);
  renderD()}

function showCode(lang,btn){document.querySelectorAll('[id^="code-"]').forEach(e=>e.classList.add("hidden"));
  document.getElementById("code-"+lang).classList.remove("hidden");
  document.querySelectorAll('.demo-tab').forEach(t=>t.classList.remove("active"));btn.classList.add("active")}

function showPlatform(p,btn){['mcp','openclaw','claude','python','js','curl'].forEach(id=>{
  const el=document.getElementById('ob-plat-'+id);if(el)el.classList.toggle('hidden',id!==p)});
  document.querySelectorAll('.plat-tab').forEach(b=>b.classList.remove('act'));
  if(btn)btn.classList.add('act')}

function renderD(){if(!U)return;
  document.getElementById("d-em").textContent=U.email;
  var planBadges={BUSINESS:'<span class="badge" style="background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.3)">BUSINESS</span>',PRO:'<span class="badge" style="background:var(--glow);color:var(--accent);border:1px solid rgba(255,107,43,.3)">PRO</span>',TEAM:'<span class="badge" style="background:rgba(59,130,246,.1);color:#3b82f6;border:1px solid rgba(59,130,246,.3)">TEAM</span>'};
  document.getElementById("d-pt").innerHTML=planBadges[U.plan]||'<span class="badge" style="background:rgba(136,136,160,.1);color:var(--dim);border:1px solid rgba(136,136,160,.2)">FREE</span> <a href="javascript:void(0)" onclick="go(\'pricing\')" style="font-size:.65rem;color:var(--accent);font-family:var(--mono)">Upgrade</a>';
  const m=document.getElementById("dm");
  if(DV==="start")rStart(m);else if(DV==="cards")rCards(m);else if(DV==="graph")rGraph(m);else if(DV==="key")rKey(m);else if(DV==="ws")rWs(m);else if(DV==="team")rTeam(m);else if(DV==="stats")rStats(m)}

/* ═══════════════════════════════════════════
   🚀 GET STARTED — Premium animated onboarding
   ═══════════════════════════════════════════ */
function rStart(el){
  el.innerHTML=`
  <div style="text-align:center;padding:20px 0 24px">
    <div style="font-family:var(--mono);font-size:.65rem;color:var(--accent);text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">Welcome to HyperStack</div>
    <h1 style="font-family:var(--mono);font-size:1.4rem;font-weight:800;margin-bottom:6px">Your agent is about to get a lot smarter</h1>
    <p style="color:var(--dim);font-size:.88rem">Three steps. Under 30 seconds. Let's go.</p>
  </div>

  <!-- Animated step indicators -->
  <div class="ob-steps" id="ob-steps-wrap">
    <div class="ob-step done" id="obs-1"><div class="num">✓</div><div class="stxt">Sign up</div></div>
    <div class="ob-step active" id="obs-2"><div class="num">2</div><div class="stxt">Copy key</div></div>
    <div class="ob-step" id="obs-3"><div class="num">3</div><div class="stxt">Paste & go</div></div>
  </div>

  <!-- Step 2: API Key card with glow -->
  <div style="position:relative;margin:8px 0 16px">
    <div style="position:absolute;inset:-2px;border-radius:14px;background:linear-gradient(135deg,rgba(255,107,43,.3),rgba(168,85,247,.2),rgba(59,130,246,.2));opacity:.3;filter:blur(16px);z-index:0"></div>
    <div style="position:relative;z-index:1;background:var(--surface);border:2px solid rgba(255,107,43,.3);border-radius:14px;padding:20px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)"></div>
        <span style="font-family:var(--mono);font-size:.68rem;color:var(--accent);letter-spacing:.06em;font-weight:600">YOUR API KEY</span>
      </div>
      <div class="key-display">
        <code>${U.apiKey}</code>
        <button onclick="cpKey(this)">Copy</button>
      </div>
      <p style="font-size:.72rem;color:var(--faint);margin-top:6px">Set as <code style="color:var(--accent);font-family:var(--mono);font-size:.72rem">HYPERSTACK_API_KEY</code> in your agent's environment</p>
    </div>
  </div>

  <!-- Step 3: Setup — animated code paste -->
  <div style="position:relative;margin-bottom:16px">
    <div style="position:relative;background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:20px;overflow:hidden;transition:border-color .3s" id="setup-wrap">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:1rem">⚡</span>
          <span style="font-family:var(--mono);font-size:.88rem;font-weight:700">Quick setup</span>
        </div>
        <span style="font-family:var(--mono);font-size:.62rem;color:var(--faint)">Pick your tool ↓</span>
      </div>

      <div class="plat-tabs">
        <button class="plat-tab act" onclick="showPlatform('mcp',this)">🔌 MCP Server</button>
        <button class="plat-tab" onclick="showPlatform('openclaw',this)">🐾 OpenClaw</button>
        <button class="plat-tab" onclick="showPlatform('claude',this)">🤖 Claude Code</button>
        <button class="plat-tab" onclick="showPlatform('python',this)">🐍 Python</button>
        <button class="plat-tab" onclick="showPlatform('js',this)">⚡ JS</button>
        <button class="plat-tab" onclick="showPlatform('curl',this)">💻 cURL</button>
      </div>

      <div id="ob-plat-mcp" class="code-block"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre><span style="color:var(--faint)">// claude_desktop_config.json or .cursor/mcp.json</span>
{
  "mcpServers": {
    "hyperstack": {
      "command": "npx",
      "args": ["-y", "hyperstack-mcp"],
      "env": {
        "HYPERSTACK_API_KEY": "<span style="color:var(--green)">${U.apiKey}</span>"
      }
    }
  }
}
<span style="color:var(--faint)">// Claude Desktop · Cursor · VS Code · Windsurf</span></pre></div>

      <div id="ob-plat-openclaw" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre><span style="color:var(--faint)"># Add skill + set env</span>
mkdir -p skills/hyperstack
export HYPERSTACK_API_KEY=<span style="color:var(--green)">${U.apiKey}</span>
export HYPERSTACK_WORKSPACE=<span style="color:var(--green)">default</span>
<span style="color:var(--faint)"># Agent reads SKILL.md and handles the rest</span></pre></div>

      <div id="ob-plat-claude" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre><span style="color:var(--faint)"># Add to .env or shell profile</span>
export HYPERSTACK_API_KEY=<span style="color:var(--green)">${U.apiKey}</span>
export HYPERSTACK_WORKSPACE=<span style="color:var(--green)">default</span>
<span style="color:var(--faint)"># Tell Claude: "Use HyperStack for memory"</span></pre></div>

      <div id="ob-plat-python" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre>import requests
h = {"X-API-Key": "<span style="color:var(--green)">${U.apiKey}</span>"}
<span style="color:var(--faint)"># Store a card</span>
requests.post("${A}/api/cards?workspace=default",
  headers=h, json={"slug":"test","title":"Test",
  "stack":"general","body":"It works!"})
<span style="color:var(--faint)"># Search cards</span>
r = requests.get("${A}/api/search?workspace=default&q=test", headers=h)</pre></div>

      <div id="ob-plat-js" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre>const KEY = "<span style="color:var(--green)">${U.apiKey}</span>"
await fetch("${A}/api/cards?workspace=default", {
  method: "POST",
  headers: {"X-API-Key": KEY, "Content-Type": "application/json"},
  body: JSON.stringify({slug:"test",title:"Test",
    stack:"general",body:"It works!"})
})</pre></div>

      <div id="ob-plat-curl" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre>curl -X POST "${A}/api/cards?workspace=default" \\
  -H "X-API-Key: ${U.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"slug":"test","title":"Test","stack":"general","body":"It works!"}'</pre></div>
    </div>
  </div>

  <!-- Quick links with card aesthetic -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:4px" class="ql-grid">
    <div class="ql-card" onclick="dt('cards')">
      <span class="ql-icon">🃏</span>
      <div class="ql-label">Cards</div>
    </div>
    <div class="ql-card" onclick="dt('key')">
      <span class="ql-icon">🔑</span>
      <div class="ql-label">API Key</div>
    </div>
    <div class="ql-card" onclick="dt('ws')">
      <span class="ql-icon">📁</span>
      <div class="ql-label">Workspaces</div>
    </div>
    <div class="ql-card" onclick="go('docs')">
      <span class="ql-icon">📖</span>
      <div class="ql-label">Docs</div>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════
   🃏 CARDS — Premium card grid with glow
   ═══════════════════════════════════════════ */
function rCards(el){
  el.innerHTML=`<div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">🃏 Memory Cards</h1><p>Loading...</p></div><div style="display:flex;gap:6px;align-items:center"><input class="sinput" placeholder="Search cards..." oninput="fCards(this.value)"><button class="btn bp bs" onclick="showCardForm()">+ New Card</button></div></div><div id="card-form-wrap"></div><div id="cl"><div style="text-align:center;padding:40px;color:var(--dim)"><div class="loading-dots"><span></span><span></span><span></span></div>Loading cards...</div></div>`;
  fetch(A+"/api/cards?workspace=default",{headers:{"X-API-Key":U.apiKey}}).then(r=>r.json()).then(d=>{
    const cards=d.cards||[];
    document.querySelector('.dh p').textContent=cards.length+' cards · '+d.plan+' ('+cards.length+'/'+d.limit+')';
    const cl=document.getElementById('cl');
    if(cards.length===0){cl.innerHTML=`<div style="text-align:center;padding:48px 20px">
      <div style="position:relative;display:inline-block;margin-bottom:16px">
        <div style="position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,rgba(255,107,43,.15),transparent);filter:blur(8px)"></div>
        <span style="font-size:3rem;position:relative">🃏</span>
      </div>
      <h3 style="font-family:var(--mono);margin:0 0 8px;font-size:1rem">No cards yet</h3>
      <p style="color:var(--dim);font-size:.85rem;margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto">Cards are how your agent remembers. Create one manually or let your agent create them via the API.</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn bp bs" onclick="showCardForm()">+ Create First Card</button>
        <button class="btn bo bs" onclick="dt('start')">← Setup Guide</button>
      </div>
    </div>`;return}
    const stacks=[...new Set(cards.map(c=>c.stack))];
    const filtersHtml=`<div class="filters"><button class="fb act" onclick="fStack('all',this)">All (${cards.length})</button>${stacks.map(s=>`<button class="fb" onclick="fStack('${s}',this)" style="border-color:${SC[s]||'#555'}30">${SE[s]||'📄'} ${s} (${cards.filter(c=>c.stack===s).length})</button>`).join('')}</div>`;
    const cardsHtml=`<div class="card-grid">${cards.map((c,i)=>{
      const bc=SC[c.stack]||'#555';
      const kw=(c.keywords||[]).slice(0,3);
      const body=(c.body||'').replace(/</g,'&lt;').substring(0,80);
      return`<div class="hsc" data-s="${c.stack}" data-q="${(c.title+' '+(c.keywords||[]).join(' ')+' '+(c.body||'')).toLowerCase()}" onclick="expandCard(${JSON.stringify(c).replace(/"/g,'&quot;')})" style="animation-delay:${i*60}ms">
        <div class="hsc-glow" style="background:linear-gradient(135deg,${bc},${bc}88,transparent)"></div>
        <div class="hsc-border" style="border-color:${bc}44">
          <button class="hsc-del" onclick="event.stopPropagation();if(confirm('Delete ${c.slug}?'))delCard('${c.slug}')" title="Delete">✕</button>
          <div class="hsc-header" style="border-color:${bc}25">
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:7px;height:7px;border-radius:50%;background:${bc};box-shadow:0 0 6px ${bc}"></div>
              <span style="font-family:var(--mono);font-size:.55rem;color:${bc};letter-spacing:.06em;font-weight:600">${(SE[c.stack]||'📄')} ${(c.stack||'').toUpperCase()}</span>
            </div>
            <span style="font-family:var(--mono);font-size:.5rem;color:var(--faint)">${c.tokens||0}t</span>
          </div>
          <div style="padding:8px 14px 0">
            <div style="font-family:var(--mono);font-size:.72rem;color:var(--accent);font-weight:600">${c.slug}</div>
          </div>
          <div style="padding:4px 14px 0">
            <div style="font-size:.84rem;font-weight:600;color:var(--text)">${c.title||c.slug}</div>
          </div>
          <div style="padding:6px 14px 0;display:flex;gap:3px;flex-wrap:wrap">
            ${kw.map(k=>`<span style="font-family:var(--mono);font-size:.55rem;background:${bc}10;color:${bc};padding:2px 7px;border-radius:4px;border:1px solid ${bc}20">${k}</span>`).join('')}
          </div>
          <div style="padding:6px 14px 0">
            <div style="font-size:.72rem;color:var(--dim);line-height:1.5;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-family:var(--mono);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${body}</div>
          </div>
          <div style="padding:8px 14px 10px;display:flex;align-items:center;justify-content:space-between">
            <span style="font-family:var(--mono);font-size:.55rem;color:var(--faint)">v${c.ver||1}</span>
            <span style="font-family:var(--mono);font-size:.55rem;color:var(--faint)">${c.updated||''}</span>
          </div>
        </div>
      </div>`}).join('')}</div>`;
    cl.innerHTML=filtersHtml+cardsHtml+`<div style="text-align:center;margin-top:16px"><button class="btn bo bs" onclick="rCards(document.getElementById('dm'))">↻ Refresh</button></div>`;
  }).catch(err=>{
    document.getElementById('cl').innerHTML=`<div style="text-align:center;padding:30px;color:var(--red)">Failed to load: ${err.message}<br><button class="btn bo bs" style="margin-top:10px" onclick="rCards(document.getElementById('dm'))">Retry</button></div>`;
  })}

function delCard(slug){fetch(A+"/api/cards?workspace=default&id="+slug,{method:"DELETE",headers:{"X-API-Key":U.apiKey}}).then(r=>r.json()).then(()=>rCards(document.getElementById('dm'))).catch(err=>alert("Delete failed: "+err.message))}

function fStack(s,b){document.querySelectorAll('.fb').forEach(x=>x.classList.remove('act'));b.classList.add('act');
  document.querySelectorAll('.hsc').forEach(e=>{e.style.display=(s==='all'||e.dataset.s===s)?'':'none'})}
function fCards(q){const t=q.toLowerCase();document.querySelectorAll('.hsc').forEach(e=>{e.style.display=e.dataset.q.includes(t)?'':'none'})}

function expandCard(c){const bc=SC[c.stack]||'#555';const kw=(c.keywords||[]);
  const ov=document.createElement('div');ov.className='card-expand';ov.onclick=e=>{if(e.target===ov)ov.remove()};
  ov.innerHTML=`<div class="card-expand-inner" style="border:2px solid ${bc}44;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 40px ${bc}15">
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:12px;border-bottom:1px solid ${bc}25;margin-bottom:14px">
      <div style="width:8px;height:8px;border-radius:50%;background:${bc};box-shadow:0 0 8px ${bc}"></div>
      <span style="font-family:var(--mono);font-size:.62rem;color:${bc};letter-spacing:.06em;font-weight:600">${SE[c.stack]||'📄'} ${(c.stack||'').toUpperCase()}</span>
      <span style="margin-left:auto;font-family:var(--mono);font-size:.55rem;color:var(--faint)">~${c.tokens||0} tokens</span>
      <button onclick="this.closest('.card-expand').remove()" style="background:none;border:none;color:var(--dim);font-size:16px;cursor:pointer;padding:2px 6px;margin-left:8px">✕</button>
    </div>
    <div style="margin-bottom:6px">
      <div style="font-family:var(--mono);font-size:.58rem;color:var(--faint);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">slug</div>
      <div style="font-family:var(--mono);font-size:.88rem;color:var(--accent);font-weight:600">${c.slug}</div>
    </div>
    <div style="margin-bottom:6px">
      <div style="font-family:var(--mono);font-size:.58rem;color:var(--faint);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">title</div>
      <div style="font-size:1rem;font-weight:600;color:var(--text)">${c.title||c.slug}</div>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:10px">
      <div>
        <div style="font-family:var(--mono);font-size:.58rem;color:var(--faint);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">stack</div>
        <span style="font-family:var(--mono);font-size:.72rem;background:${bc}12;color:${bc};padding:3px 10px;border-radius:6px;border:1px solid ${bc}25">${SE[c.stack]||'📄'} ${c.stack}</span>
      </div>
      <div>
        <div style="font-family:var(--mono);font-size:.58rem;color:var(--faint);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">keywords</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${kw.map(k=>`<span style="font-family:var(--mono);font-size:.62rem;background:${bc}10;color:${bc};padding:2px 8px;border-radius:4px;border:1px solid ${bc}20">${k}</span>`).join('')}</div>
      </div>
    </div>
    <div style="margin-bottom:14px">
      <div style="font-family:var(--mono);font-size:.58rem;color:var(--faint);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">body</div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">
        <pre style="font-family:var(--mono);font-size:.78rem;color:var(--dim);line-height:1.7;margin:0;white-space:pre-wrap">${(c.body||'').replace(/</g,'&lt;')}</pre>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border)">
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--faint)">v${c.ver||1} · ${c.updated||'just now'}</span>
      <button class="btn bo bs" style="color:var(--red);border-color:rgba(239,68,68,.3);font-size:.72rem" onclick="if(confirm('Delete ${c.slug}?')){delCard('${c.slug}');this.closest('.card-expand').remove()}">Delete</button>
    </div>
  </div>`;
  document.body.appendChild(ov)}

function cpKey(btn){navigator.clipboard.writeText(U.apiKey);btn.textContent='✓ Copied';btn.classList.add('copied-btn');
  setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied-btn')},2000);
  const s2=document.getElementById('obs-2'),s3=document.getElementById('obs-3');
  if(s2){s2.classList.add('done');s2.classList.remove('active');s2.querySelector('.num').textContent='✓'}
  if(s3)s3.classList.add('active')}

function cpBlock(btn){const pre=btn.parentElement.querySelector('pre');
  navigator.clipboard.writeText(pre.textContent);btn.textContent='✓ Copied';
  setTimeout(()=>{btn.textContent='Copy'},2000)}

function showCardForm(){const w=document.getElementById('card-form-wrap');
  if(w.innerHTML){w.innerHTML='';return}
  w.innerHTML=`<div style="position:relative;margin-bottom:16px">
    <div style="position:absolute;inset:-1px;border-radius:14px;background:linear-gradient(135deg,rgba(34,197,94,.2),rgba(59,130,246,.2));opacity:.3;filter:blur(12px);z-index:0"></div>
    <div style="position:relative;z-index:1;background:var(--surface);border:2px solid rgba(34,197,94,.3);border-radius:14px;padding:20px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)"></div>
        <span style="font-family:var(--mono);font-size:.68rem;color:var(--green);letter-spacing:.06em;font-weight:600">NEW CARD</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div class="fg"><label>Slug (unique ID)</label><input id="cf-slug" placeholder="project-webapp"></div>
        <div class="fg"><label>Title</label><input id="cf-title" placeholder="WebApp"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div class="fg"><label>Stack</label><select id="cf-stack" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;color:var(--text);font-family:var(--mono);font-size:.88rem;outline:none">
          <option value="projects">📦 projects</option><option value="people">👤 people</option><option value="decisions">⚖️ decisions</option>
          <option value="preferences">⚙️ preferences</option><option value="workflows">🔄 workflows</option><option value="general" selected>📄 general</option>
        </select></div>
        <div class="fg"><label>Keywords (comma-separated)</label><input id="cf-kw" placeholder="react, vercel, auth"></div>
      </div>
      <div class="fg" style="margin-bottom:12px"><label>Body</label><textarea id="cf-body" rows="3" placeholder="What should your agent remember?" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;color:var(--text);font-family:var(--mono);font-size:.85rem;outline:none;resize:vertical"></textarea></div>
      <div style="display:flex;gap:8px"><button class="btn bp bs" onclick="createCard()">Create Card →</button><button class="btn bo bs" onclick="document.getElementById('card-form-wrap').innerHTML=''">Cancel</button></div>
      <div id="cf-err" class="ferr hidden" style="margin-top:6px"></div>
    </div>
  </div>`}

function createCard(){const slug=document.getElementById('cf-slug').value.trim(),title=document.getElementById('cf-title').value.trim(),
  stack=document.getElementById('cf-stack').value,kw=document.getElementById('cf-kw').value.split(',').map(s=>s.trim()).filter(Boolean),
  body=document.getElementById('cf-body').value.trim(),err=document.getElementById('cf-err');
  err.classList.add('hidden');
  if(!slug||!title||!body){err.textContent='Fill in slug, title, and body';err.classList.remove('hidden');return}
  fetch(A+"/api/cards?workspace=default",{method:"POST",headers:{"X-API-Key":U.apiKey,"Content-Type":"application/json"},
    body:JSON.stringify({slug,title,stack,keywords:kw,body})}).then(r=>r.json()).then(d=>{
    if(d.error){err.textContent=d.error;err.classList.remove('hidden');return}
    document.getElementById('card-form-wrap').innerHTML='';rCards(document.getElementById('dm'));
  }).catch(e=>{err.textContent='Failed: '+e.message;err.classList.remove('hidden')})}

/* ═══════════════════════════════════════════
   🔑 API KEY — Premium display
   ═══════════════════════════════════════════ */
function rKey(el){el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">🔑 API Key</h1><p>Use this key in any agent or integration</p></div></div>

  <div style="position:relative;margin-bottom:16px">
    <div style="position:absolute;inset:-2px;border-radius:14px;background:linear-gradient(135deg,rgba(255,107,43,.3),rgba(168,85,247,.2));opacity:.25;filter:blur(16px)"></div>
    <div style="position:relative;background:var(--surface);border:2px solid rgba(255,107,43,.3);border-radius:14px;padding:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)"></div>
        <span style="font-family:var(--mono);font-size:.65rem;color:var(--accent);letter-spacing:.06em;font-weight:600">ACTIVE KEY</span>
        <span style="font-family:var(--mono);font-size:.55rem;color:var(--faint);margin-left:auto">workspace: default</span>
      </div>
      <div class="key-display">
        <code>${U.apiKey}</code>
        <button onclick="navigator.clipboard.writeText('${U.apiKey}');this.textContent='✓ Copied';this.classList.add('copied-btn');setTimeout(()=>{this.textContent='Copy';this.classList.remove('copied-btn')},2000)">Copy</button>
      </div>
    </div>
  </div>

  <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:1rem">📋</span>
      <span style="font-family:var(--mono);font-size:.88rem;font-weight:700">Environment variables</span>
    </div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;position:relative">
      <button class="cpbtn" onclick="cpBlock(this)">Copy</button>
      <pre style="font-family:var(--mono);font-size:.8rem;color:var(--dim);margin:0;line-height:1.8">HYPERSTACK_API_KEY=<span style="color:var(--green)">${U.apiKey}</span>
HYPERSTACK_WORKSPACE=<span style="color:var(--green)">default</span></pre>
    </div>
  </div>

  <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:20px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:1rem">🧪</span>
      <span style="font-family:var(--mono);font-size:.88rem;font-weight:700">Quick test</span>
      <span style="font-family:var(--mono);font-size:.6rem;color:var(--faint);margin-left:auto">paste in terminal</span>
    </div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;position:relative">
      <button class="cpbtn" onclick="cpBlock(this)">Copy</button>
      <pre style="font-family:var(--mono);font-size:.78rem;color:var(--dim);line-height:1.8;margin:0"><span style="color:var(--accent)">curl</span> <span style="color:var(--green)">"${A}/api/cards?workspace=default"</span> \\
  -H <span style="color:var(--green)">"X-API-Key: ${U.apiKey}"</span></pre>
    </div>
  </div>`}

/* ═══════════════════════════════════════════
   UNCHANGED TABS (Phase 2)
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   📁 WORKSPACES — Premium display
   ═══════════════════════════════════════════ */
function rWs(el){const pro=U.plan==="PRO"||U.plan==="TEAM"||U.plan==="BUSINESS";
  el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">📁 Workspaces</h1><p>${pro?'Unlimited workspaces':'1 workspace'} on ${U.plan} plan</p></div></div>

  <!-- Active workspace card with glow -->
  <div style="position:relative;margin-bottom:16px">
    <div style="position:absolute;inset:-2px;border-radius:14px;background:linear-gradient(135deg,rgba(34,197,94,.2),rgba(59,130,246,.15));opacity:.25;filter:blur(14px)"></div>
    <div style="position:relative;background:var(--surface);border:2px solid rgba(34,197,94,.3);border-radius:14px;padding:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);display:flex;align-items:center;justify-content:center;font-size:18px">📁</div>
          <div>
            <div style="font-family:var(--mono);font-weight:700;font-size:.95rem">default</div>
            <div style="font-family:var(--mono);font-size:.7rem;color:var(--dim)">Primary workspace</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green)"></div>
          <span style="font-family:var(--mono);font-size:.68rem;color:var(--green);font-weight:600">Active</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1.1rem">${DEMO.length}</div>
          <div style="font-size:.68rem;color:var(--dim)">Cards</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1.1rem">${[...new Set(DEMO.map(c=>c.stack))].length}</div>
          <div style="font-size:.68rem;color:var(--dim)">Stacks</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1.1rem;color:var(--green)">~${DEMO.length * 70}</div>
          <div style="font-size:.68rem;color:var(--dim)">Tokens stored</div>
        </div>
      </div>
    </div>
  </div>

  ${pro?`<div style="position:relative;margin-bottom:16px">
    <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:20px;text-align:center">
      <button class="btn bp" style="font-size:.82rem">+ Create New Workspace</button>
      <p style="font-size:.72rem;color:var(--faint);margin-top:8px">Separate workspaces for each project. Zero cross-contamination.</p>
    </div>
  </div>`:`
  <div style="position:relative;margin-bottom:16px">
    <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:28px;text-align:center">
      <div style="font-size:1.8rem;margin-bottom:10px">🔒</div>
      <h3 style="font-family:var(--mono);font-size:.92rem;font-weight:700;margin-bottom:6px">Multiple workspaces require Pro</h3>
      <p style="color:var(--dim);font-size:.82rem;margin-bottom:16px;max-width:380px;margin-left:auto;margin-right:auto">Separate workspaces per project so your agent only sees what's relevant. Zero cross-contamination.</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <a href="https://buy.stripe.com/test_cNi3cv5v79Xu1X34hZeUU04" class="btn bp bs">Upgrade — $29/mo</a>
        <a href="https://buy.stripe.com/test_dRmcN57Df9XucBH01JeUU03" class="btn bg bs">Team — $59/mo</a>
      </div>
    </div>
  </div>`}`}

/* ═══════════════════════════════════════════
   👥 TEAM — Premium display
   ═══════════════════════════════════════════ */
function rTeam(el){const pro=U.plan==="PRO"||U.plan==="TEAM"||U.plan==="BUSINESS";
  if(!pro){el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">👥 Team</h1><p>Shared memory across your team</p></div></div>
  <div style="position:relative;margin-bottom:16px">
    <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:36px 28px;text-align:center">
      <div style="font-size:2rem;margin-bottom:12px">👥</div>
      <h3 style="font-family:var(--mono);font-size:1rem;font-weight:700;margin-bottom:8px">Team Memory requires Pro</h3>
      <p style="color:var(--dim);font-size:.85rem;margin-bottom:8px;max-width:400px;margin-left:auto;margin-right:auto">When Alice's agent learns something, Bob's agent knows it too. Shared cards sync instantly across your entire team.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px auto;max-width:420px">
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:1.2rem;margin-bottom:4px">🔄</div>
          <div style="font-size:.7rem;color:var(--dim)">Instant sync</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:1.2rem;margin-bottom:4px">🔒</div>
          <div style="font-size:.7rem;color:var(--dim)">Private cards stay private</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:1.2rem;margin-bottom:4px">👤</div>
          <div style="font-size:.7rem;color:var(--dim)">Up to 20 members</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:20px">
        <a href="https://buy.stripe.com/test_cNi3cv5v79Xu1X34hZeUU04" class="btn bp">Upgrade — $29/mo</a>
        <a href="https://buy.stripe.com/test_dRmcN57Df9XucBH01JeUU03" class="btn bg">Team — $59/mo</a>
      </div>
    </div>
  </div>`;return}
  el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">👥 Team</h1><p>Shared memory across your team</p></div></div>

  <!-- Team members -->
  <div style="position:relative;margin-bottom:16px">
    <div style="position:absolute;inset:-2px;border-radius:14px;background:linear-gradient(135deg,rgba(168,85,247,.2),rgba(59,130,246,.15));opacity:.2;filter:blur(14px)"></div>
    <div style="position:relative;background:var(--surface);border:2px solid rgba(168,85,247,.2);border-radius:14px;padding:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--purple);box-shadow:0 0 8px var(--purple)"></div>
        <span style="font-family:var(--mono);font-size:.68rem;color:var(--purple);letter-spacing:.06em;font-weight:600">TEAM MEMBERS</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#000">${(U.name||U.email||'U')[0].toUpperCase()}</div>
        <div style="flex:1">
          <div style="font-family:var(--mono);font-size:.85rem;font-weight:600">${U.name||U.email}</div>
          <div style="font-size:.72rem;color:var(--dim)">${U.email}</div>
        </div>
        <span style="font-family:var(--mono);font-size:.62rem;background:var(--glow);color:var(--accent);padding:3px 10px;border-radius:6px;border:1px solid rgba(255,107,43,.3);font-weight:600">Owner</span>
      </div>
      <button class="btn bo" style="margin-top:14px;width:100%;text-align:center;font-size:.82rem">+ Invite Teammate</button>
    </div>
  </div>

  <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:18px;border-left:3px solid var(--accent)">
    <div style="display:flex;align-items:start;gap:10px">
      <span style="font-size:1rem;flex-shrink:0">💡</span>
      <div>
        <div style="font-family:var(--mono);font-size:.82rem;font-weight:600;margin-bottom:4px">How team sharing works</div>
        <p style="color:var(--dim);font-size:.82rem;line-height:1.6;margin:0">Set any card to <strong style="color:var(--text)">shared</strong> and it syncs to every team member's workspace. Private cards stay private — only you can see them.</p>
      </div>
    </div>
  </div>`}

/* ═══════════════════════════════════════════
   📊 ANALYTICS — Premium display
   ═══════════════════════════════════════════ */
function rStats(el){const pro=U.plan==="PRO"||U.plan==="TEAM"||U.plan==="BUSINESS";
  if(!pro){el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">📊 Analytics</h1><p>Track your agent's memory usage</p></div></div>
  <div style="position:relative;margin-bottom:16px">
    <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:36px 28px;text-align:center">
      <div style="font-size:2rem;margin-bottom:12px">📊</div>
      <h3 style="font-family:var(--mono);font-size:1rem;font-weight:700;margin-bottom:8px">Analytics requires Pro</h3>
      <p style="color:var(--dim);font-size:.85rem;margin-bottom:8px;max-width:400px;margin-left:auto;margin-right:auto">Track token savings, find stale cards, see usage patterns, and measure how much money your agent is saving you.</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px auto;max-width:480px">
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1rem;color:var(--green)">94%</div>
          <div style="font-size:.6rem;color:var(--faint)">Token savings</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1rem;color:var(--accent)">$254</div>
          <div style="font-size:.6rem;color:var(--faint)">Saved/mo</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1rem">📈</div>
          <div style="font-size:.6rem;color:var(--faint)">Usage trends</div>
        </div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
          <div style="font-family:var(--mono);font-weight:800;font-size:1rem">⚠️</div>
          <div style="font-size:.6rem;color:var(--faint)">Stale alerts</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:20px">
        <a href="https://buy.stripe.com/test_cNi3cv5v79Xu1X34hZeUU04" class="btn bp">Upgrade — $29/mo</a>
        <a href="https://buy.stripe.com/test_dRmcN57Df9XucBH01JeUU03" class="btn bg">Team — $59/mo</a>
      </div>
    </div>
  </div>`;return}

  const totalTokens=DEMO.reduce((s,c)=>s+(c.tokens||70),0);
  const savedPerMsg=6000-350;
  el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">📊 Analytics</h1><p>Your agent's memory performance</p></div></div>

  <!-- Stats grid with glow -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
    <div style="position:relative">
      <div style="position:absolute;inset:-1px;border-radius:12px;background:rgba(34,197,94,.15);filter:blur(8px)"></div>
      <div style="position:relative;background:var(--surface);border:2px solid rgba(34,197,94,.25);border-radius:12px;padding:16px;text-align:center">
        <div style="font-family:var(--mono);font-size:1.6rem;font-weight:800;color:var(--green)">94%</div>
        <div style="font-family:var(--mono);font-size:.68rem;color:var(--dim);margin-top:4px">Token Savings</div>
      </div>
    </div>
    <div style="background:var(--surface);border:2px solid var(--border);border-radius:12px;padding:16px;text-align:center">
      <div style="font-family:var(--mono);font-size:1.6rem;font-weight:800">${DEMO.length}</div>
      <div style="font-family:var(--mono);font-size:.68rem;color:var(--dim);margin-top:4px">Total Cards</div>
    </div>
    <div style="position:relative">
      <div style="position:absolute;inset:-1px;border-radius:12px;background:rgba(255,107,43,.12);filter:blur(8px)"></div>
      <div style="position:relative;background:var(--surface);border:2px solid rgba(255,107,43,.2);border-radius:12px;padding:16px;text-align:center">
        <div style="font-family:var(--mono);font-size:1.6rem;font-weight:800;color:var(--accent)">$254</div>
        <div style="font-family:var(--mono);font-size:.68rem;color:var(--dim);margin-top:4px">Saved / month</div>
      </div>
    </div>
    <div style="background:var(--surface);border:2px solid rgba(234,179,8,.15);border-radius:12px;padding:16px;text-align:center">
      <div style="font-family:var(--mono);font-size:1.6rem;font-weight:800;color:var(--yellow)">1</div>
      <div style="font-family:var(--mono);font-size:.68rem;color:var(--dim);margin-top:4px">Stale Cards</div>
    </div>
  </div>

  <!-- Token comparison -->
  <div style="background:var(--surface);border:2px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <span style="font-size:1rem">⚡</span>
      <span style="font-family:var(--mono);font-size:.88rem;font-weight:700">Token Usage Per Message</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="text-align:center;padding:16px;background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.15);border-radius:10px">
        <div style="font-family:var(--mono);font-size:1.5rem;font-weight:800;color:var(--red)">6,000</div>
        <div style="font-size:.72rem;color:var(--dim);margin-top:2px">Without HyperStack</div>
        <div style="width:100%;height:6px;background:rgba(239,68,68,.15);border-radius:3px;margin-top:10px"><div style="width:100%;height:100%;background:var(--red);border-radius:3px"></div></div>
      </div>
      <div style="text-align:center;padding:16px;background:rgba(34,197,94,.04);border:1px solid rgba(34,197,94,.15);border-radius:10px">
        <div style="font-family:var(--mono);font-size:1.5rem;font-weight:800;color:var(--green)">350</div>
        <div style="font-size:.72rem;color:var(--dim);margin-top:2px">With HyperStack</div>
        <div style="width:100%;height:6px;background:rgba(34,197,94,.15);border-radius:3px;margin-top:10px"><div style="width:6%;height:100%;background:var(--green);border-radius:3px"></div></div>
      </div>
    </div>
    <div style="text-align:center;font-family:var(--mono);font-size:.75rem;color:var(--faint)">You save <strong style="color:var(--green)">~${savedPerMsg.toLocaleString()} tokens</strong> every message</div>
  </div>

  <!-- Stale cards alert -->
  <div style="background:var(--surface);border:2px solid rgba(234,179,8,.2);border-radius:14px;padding:20px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:1rem">⚠️</span>
      <span style="font-family:var(--mono);font-size:.88rem;font-weight:700">Stale Cards</span>
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--faint);margin-left:auto">Cards not updated in 21+ days</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg);border:1px solid var(--border);border-radius:8px">
      <div style="width:7px;height:7px;border-radius:50%;background:var(--yellow);box-shadow:0 0 6px var(--yellow)"></div>
      <div style="flex:1">
        <span style="font-family:var(--mono);font-size:.82rem;font-weight:600">decision-auth</span>
        <span style="font-size:.78rem;color:var(--dim);margin-left:8px">Auth0 → Clerk</span>
      </div>
      <span style="font-family:var(--mono);font-size:.65rem;background:rgba(234,179,8,.1);color:var(--yellow);padding:3px 10px;border-radius:6px;border:1px solid rgba(234,179,8,.2);font-weight:600">26 days</span>
    </div>
    <p style="font-size:.72rem;color:var(--faint);margin-top:8px;text-align:center">Stale cards may contain outdated info. Consider reviewing or archiving them.</p>
  </div>`}


/* ═══════════════════════════════════════════
   CONTEXT GRAPH — Bubblemaps-style interactive
   ═══════════════════════════════════════════ */
var _graphAnim=null; // animation frame id

var _REL_DESC={
  related:'General connection between cards',
  owns:'Ownership or responsibility',
  decided:'Made a decision about this',
  approved:'Gave approval for this',
  uses:'Depends on or utilizes this',
  triggers:'Causes or initiates this',
  blocks:'Prevents progress on this',
  'depends-on':'Requires this to proceed',
  reviews:'Reviews or evaluates this'
};

function rGraph(el){
  if(_graphAnim){cancelAnimationFrame(_graphAnim);_graphAnim=null}
  el.innerHTML=`
  <div class="dh"><div><h1 style="display:flex;align-items:center;gap:10px">\ud83d\udd17 Context Graph</h1><p id="graph-status">Loading cards...</p></div>
  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
    <select id="gf-focus" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 10px;color:var(--text);font-family:var(--mono);font-size:.75rem;outline:none;max-width:160px">
      <option value="">All cards</option>
    </select>
    <select id="gf-type" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 10px;color:var(--text);font-family:var(--mono);font-size:.75rem;outline:none">
      <option value="">All types</option>
      <option value="person">\ud83d\udc64 person</option><option value="project">\ud83d\udce6 project</option><option value="decision">\u2696\ufe0f decision</option>
      <option value="preference">\u2764\ufe0f preference</option><option value="workflow">\u2699\ufe0f workflow</option><option value="event">\ud83d\udcc5 event</option>
      <option value="account">\ud83c\udfe2 account</option><option value="general">\ud83d\udcc4 general</option>
    </select>
    <select id="gf-rel" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 10px;color:var(--text);font-family:var(--mono);font-size:.75rem;outline:none">
      <option value="">All relations</option>
      <option value="related">\ud83d\udd17 related — general connection</option>
      <option value="owns">\ud83d\udc51 owns — ownership</option>
      <option value="decided">\u2696\ufe0f decided — made a decision</option>
      <option value="approved">\u2705 approved — gave approval</option>
      <option value="uses">\ud83d\udd27 uses — depends on</option>
      <option value="triggers">\u26a1 triggers — causes</option>
      <option value="blocks">\ud83d\udeab blocks — prevents</option>
      <option value="depends-on">\ud83d\udd04 depends-on — requires</option>
      <option value="reviews">\ud83d\udd0d reviews — evaluates</option>
    </select>
    <button class="btn bo bs" onclick="rGraph(document.getElementById('dm'))" style="font-size:.75rem">\u21bb Refresh</button>
  </div></div>
  <div id="graph-wrap" style="position:relative;background:#0a0a0c;border:2px solid var(--border);border-radius:14px;overflow:hidden;min-height:400px;touch-action:none">
    <div id="graph-loading" style="text-align:center;padding:60px 20px;color:var(--dim);font-family:var(--mono);font-size:.85rem">Loading graph...</div>
    <canvas id="graph-canvas" style="width:100%;display:none;cursor:grab"></canvas>
    <div id="graph-empty" style="display:none;text-align:center;padding:60px 20px">
      <div style="font-size:2.5rem;margin-bottom:12px">\ud83d\udd17</div>
      <h3 style="font-family:var(--mono);font-size:1rem;font-weight:700;margin-bottom:8px">No linked cards yet</h3>
      <p style="color:var(--dim);font-size:.85rem;max-width:380px;margin:0 auto 16px">Create cards with <code style="color:var(--accent);font-family:var(--mono)">links</code> and <code style="color:var(--accent);font-family:var(--mono)">cardType</code> to see your knowledge graph.</p>
      <button class="btn bo bs" onclick="dt('cards')">\u2190 Go to Cards</button>
    </div>
    <div id="graph-tooltip" style="display:none;position:absolute;background:rgba(15,15,18,.95);border:1px solid var(--border);border-radius:10px;padding:12px;pointer-events:none;z-index:10;max-width:260px;box-shadow:0 8px 30px rgba(0,0,0,.6);backdrop-filter:blur(12px)"></div>
    <div id="graph-detail" style="display:none;position:absolute;top:12px;right:12px;width:260px;background:rgba(12,12,15,.95);border:2px solid var(--border);border-radius:12px;padding:16px;z-index:10;backdrop-filter:blur(12px);max-height:calc(100% - 24px);overflow-y:auto"></div>
    <div id="graph-legend" style="position:absolute;bottom:12px;left:12px;display:flex;gap:6px;flex-wrap:wrap;z-index:5"></div>
    <div id="graph-stats" style="position:absolute;top:12px;left:12px;font-family:var(--mono);font-size:.6rem;color:var(--faint);z-index:5"></div>
    <div id="graph-guide" style="position:absolute;top:12px;right:12px;z-index:6">
      <button onclick="var g=document.getElementById('gg-body');g.style.display=g.style.display==='none'?'block':'none'" style="background:rgba(17,17,20,.9);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--dim);cursor:pointer;font-family:var(--mono);font-size:.65rem;backdrop-filter:blur(8px)">? Guide</button>
      <div id="gg-body" style="display:none;background:rgba(10,10,13,.95);border:1px solid var(--border);border-radius:8px;padding:12px;margin-top:4px;width:200px;backdrop-filter:blur(12px)">
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--accent);margin-bottom:6px;font-weight:700">CONTROLS</div>
        <div style="font-size:.62rem;color:var(--dim);line-height:1.8;font-family:var(--mono)">
          \ud83d\udd18 Drag node \u2192 move &amp; pin<br>
          \ud83d\udd18 Double-click \u2192 details<br>
          \ud83d\udd18 Click node \u2192 highlight<br>
          \ud83d\udd18 Scroll \u2192 zoom<br>
          \ud83d\udd18 Drag empty \u2192 pan<br>
        </div>
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--accent);margin:8px 0 4px;font-weight:700">MOBILE</div>
        <div style="font-size:.62rem;color:var(--dim);line-height:1.8;font-family:var(--mono)">
          \u261d\ufe0f Drag \u2192 move or pan<br>
          \ud83e\udd0f Pinch \u2192 zoom<br>
          \ud83d\udc46 Double-tap \u2192 details
        </div>
        <div style="font-family:var(--mono);font-size:.6rem;color:var(--accent);margin:8px 0 4px;font-weight:700">FILTERS</div>
        <div style="font-size:.62rem;color:var(--dim);line-height:1.8;font-family:var(--mono)">
          \ud83c\udfaf Focus \u2192 one card + neighbors<br>
          \ud83c\udfa8 Type \u2192 persons, projects...<br>
          \ud83d\udd17 Relation \u2192 owns, triggers...
        </div>
      </div>
    </div>
    <div id="graph-zoom" style="position:absolute;bottom:12px;right:12px;display:flex;flex-direction:column;gap:4px;z-index:5">
      <button id="gz-in" style="background:rgba(17,17,20,.85);border:1px solid var(--border);border-radius:6px;width:30px;height:30px;color:var(--text);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">+</button>
      <button id="gz-out" style="background:rgba(17,17,20,.85);border:1px solid var(--border);border-radius:6px;width:30px;height:30px;color:var(--text);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">\u2212</button>
      <button id="gz-fit" style="background:rgba(17,17,20,.85);border:1px solid var(--border);border-radius:6px;width:30px;height:30px;color:var(--text);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center">\u25a3</button>
    </div>
  </div>`;

  fetch(A+"/api/cards?workspace=default",{headers:{"X-API-Key":U.apiKey}}).then(function(r){return r.json()}).then(function(d){
    var cards=d.cards||[];
    var plan=d.plan||'FREE';
    var planLimits={FREE:10,PRO:100,TEAM:500,BUSINESS:2000};
    var limit=planLimits[plan]||10;
    var pct=Math.round(cards.length/limit*100);
    var statusEl=document.getElementById('graph-status');

    // FREE users see upgrade gate over the graph
    if(plan==='FREE'){
      statusEl.innerHTML=cards.length+'/'+limit+' cards \u00b7 FREE';
      var overlay=document.createElement('div');
      overlay.style.cssText='position:absolute;inset:0;background:rgba(10,10,12,.88);z-index:20;display:flex;align-items:center;justify-content:center;border-radius:12px;backdrop-filter:blur(4px)';
      overlay.innerHTML='<div style="text-align:center;max-width:320px"><div style="font-size:2rem;margin-bottom:12px">\ud83d\udd12</div><h3 style="font-family:var(--mono);font-size:1rem;font-weight:700;margin-bottom:8px;color:var(--text)">Graph Explorer is a paid feature</h3><p style="font-size:.82rem;color:var(--dim);margin-bottom:16px;line-height:1.5">Upgrade to Pro to unlock graph traversal, visual explorer, and 100 cards.</p><a href="javascript:void(0)" onclick="go(\'pricing\')" class="btn bp" style="font-size:.82rem">Unlock Graph \u2014 $29/mo</a><p style="font-size:.68rem;color:var(--faint);margin-top:10px">Your '+cards.length+' cards are safe. Upgrade adds the graph on top.</p></div>';
      document.getElementById('graph-wrap').appendChild(overlay);
      return;
    }

    if(pct>=70){
      statusEl.innerHTML=cards.length+'/'+limit+' cards <span style="color:var(--red)">'+pct+'% used</span> \u00b7 '+plan+' \u00b7 <a href="javascript:void(0)" onclick="go(\'pricing\')" style="color:var(--accent);text-decoration:underline">Upgrade</a>';
    }else{
      statusEl.textContent=cards.length+'/'+limit+' cards \u00b7 '+plan;
    }
    var nodeMap={},edges=[],linkedSlugs=new Set();
    cards.forEach(function(c){
      nodeMap[c.slug]={slug:c.slug,title:c.title,stack:c.stack,cardType:c.cardType||'general',keywords:c.keywords||[],links:c.links||[],tokens:c.tokens||0,triggeredBy:c.triggeredBy,approvedBy:c.approvedBy,reason:c.reason};
      (c.links||[]).forEach(function(l){
        var target=typeof l==='string'?l:l.slug;
        var relation=typeof l==='object'?(l.relation||'related'):'related';
        if(target){linkedSlugs.add(c.slug);linkedSlugs.add(target);edges.push({from:c.slug,to:target,relation:relation})}
      });
    });
    var nodes;
    if(linkedSlugs.size>0){nodes=Object.values(nodeMap).filter(function(n){return linkedSlugs.has(n.slug)})}
    else{nodes=Object.values(nodeMap)}
    if(nodes.length===0||edges.length===0){
      var gl=document.getElementById('graph-loading');if(gl)gl.style.display='none';
      document.getElementById('graph-canvas').style.display='none';
      document.getElementById('graph-empty').style.display='block';return;
    }
    // Populate focus dropdown
    var focusSel=document.getElementById('gf-focus');
    cards.forEach(function(c){
      var o=document.createElement('option');o.value=c.slug;o.textContent=(c.cardType?c.cardType[0].toUpperCase()+': ':'')+c.title;focusSel.appendChild(o);
    });
    var redraw=function(){_gDraw(nodes,edges,document.getElementById('gf-type').value,document.getElementById('gf-rel').value,document.getElementById('gf-focus').value)};
    document.getElementById('gf-type').onchange=redraw;
    document.getElementById('gf-rel').onchange=redraw;
    document.getElementById('gf-focus').onchange=redraw;
    requestAnimationFrame(function(){setTimeout(function(){_gDraw(nodes,edges,'','','')},60)});
  }).catch(function(err){var gs=document.getElementById('graph-status');if(gs)gs.textContent='Failed: '+err.message});
}

function _gDraw(allNodes,allEdges,filterType,filterRel,focusSlug){
  if(_graphAnim){cancelAnimationFrame(_graphAnim);_graphAnim=null}
  var TC={person:'#a855f7',project:'#3b82f6',decision:'#ff6b2b',preference:'#22c55e',workflow:'#eab308',event:'#f43f5e',account:'#06b6d4',general:'#8888a0'};
  var RC={related:'#8888aa',owns:'#c084fc',decided:'#ff8855',approved:'#4ade80',uses:'#60a5fa',triggers:'#facc15',blocks:'#f87171','depends-on':'#22d3ee',reviews:'#d8b4fe'};

  // Filter
  var edges=allEdges.slice();
  if(filterRel)edges=edges.filter(function(e){return e.relation===filterRel});

  // Focus mode — only show cards connected to the focus card (depth 2)
  if(focusSlug){
    var focusSet=new Set([focusSlug]);
    // Depth 1
    edges.forEach(function(e){if(e.from===focusSlug)focusSet.add(e.to);if(e.to===focusSlug)focusSet.add(e.from)});
    // Depth 2
    var d1=new Set(focusSet);
    edges.forEach(function(e){if(d1.has(e.from))focusSet.add(e.to);if(d1.has(e.to))focusSet.add(e.from)});
    edges=edges.filter(function(e){return focusSet.has(e.from)&&focusSet.has(e.to)});
  }
  var activeSlugs=new Set();
  edges.forEach(function(e){activeSlugs.add(e.from);activeSlugs.add(e.to)});
  var nodes;
  if(focusSlug){
    var allSlugs=new Set(activeSlugs);allSlugs.add(focusSlug);
    nodes=allNodes.filter(function(n){return allSlugs.has(n.slug)});
    if(filterType)nodes=nodes.filter(function(n){return n.cardType===filterType||n.slug===focusSlug});
  }else if(filterType){nodes=allNodes.filter(function(n){return n.cardType===filterType});nodes.forEach(function(n){activeSlugs.add(n.slug)})}
  else if(activeSlugs.size>0){nodes=allNodes.filter(function(n){return activeSlugs.has(n.slug)})}
  else{nodes=allNodes.slice()}
  var nodeSlugs=new Set(nodes.map(function(n){return n.slug}));
  edges=edges.filter(function(e){return nodeSlugs.has(e.from)&&nodeSlugs.has(e.to)});

  if(nodes.length===0){
    document.getElementById('graph-canvas').style.display='none';
    document.getElementById('graph-empty').style.display='block';
    var gl=document.getElementById('graph-loading');if(gl)gl.style.display='none';return;
  }
  document.getElementById('graph-canvas').style.display='block';
  document.getElementById('graph-empty').style.display='none';
  var gl2=document.getElementById('graph-loading');if(gl2)gl2.style.display='none';

  // Canvas setup
  var canvas=document.getElementById('graph-canvas');
  var wrap=document.getElementById('graph-wrap');
  var W=wrap.clientWidth||wrap.offsetWidth||Math.min(window.innerWidth-32,800);
  var H=Math.max(400,Math.min(600,nodes.length*50+200));
  if(W<100)W=Math.min(window.innerWidth-32,800);
  var dpr=window.devicePixelRatio||1;
  canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.height=H+'px';canvas.style.width=W+'px';
  var ctx=canvas.getContext('2d');

  // Camera: zoom & pan
  var cam={x:0,y:0,z:1};
  function toScreen(wx,wy){return{x:(wx+cam.x)*cam.z+W/2,y:(wy+cam.y)*cam.z+H/2}}
  function toWorld(sx,sy){return{x:(sx-W/2)/cam.z-cam.x,y:(sy-H/2)/cam.z-cam.y}}

  // Node size by connections
  function nR(n){
    var linkCount=(n.links||[]).length;
    var inLinks=edges.filter(function(e){return e.to===n.slug}).length;
    return Math.max(20,Math.min(45,16+(linkCount+inLinks)*3));
  }

  // Initialize positions — circular with jitter
  var pos={};
  nodes.forEach(function(n,i){
    var angle=(i/nodes.length)*Math.PI*2;
    var rad=Math.min(W,H)*0.25;
    pos[n.slug]={
      x:Math.cos(angle)*rad+(Math.random()-.5)*60,
      y:Math.sin(angle)*rad+(Math.random()-.5)*60,
      vx:0,vy:0
    };
  });

  // Physics state
  var physics={cooling:1,running:true,tick:0};
  var pinned={};  // slugs that user dragged — they stay put
  var hovNode=null,selNode=null,dragNode=null,dragStart=null,isPanning=false,panStart=null,camStart=null;

  // Live force simulation
  function simulate(){
    if(physics.cooling<0.005){physics.running=false;return}
    physics.cooling*=0.993;
    physics.tick++;

    // Repulsion (all pairs)
    for(var i=0;i<nodes.length;i++){
      for(var j=i+1;j<nodes.length;j++){
        var a=pos[nodes[i].slug],b=pos[nodes[j].slug];
        if(pinned[nodes[i].slug]&&pinned[nodes[j].slug])continue;
        var dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy)||1;
        var force=2500/(dist*dist)*physics.cooling;
        var fx=dx/dist*force,fy=dy/dist*force;
        if(!pinned[nodes[i].slug]){a.vx-=fx;a.vy-=fy}
        if(!pinned[nodes[j].slug]){b.vx+=fx;b.vy+=fy}
      }
    }
    // Attraction along edges
    edges.forEach(function(e){
      var a=pos[e.from],b=pos[e.to];if(!a||!b)return;
      var dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy)||1;
      var ideal=110+nodes.length*6;
      var force=(dist-ideal)*0.012*physics.cooling;
      var fx=dx/dist*force,fy=dy/dist*force;
      if(!pinned[e.from]){a.vx+=fx;a.vy+=fy}
      if(!pinned[e.to]){b.vx-=fx;b.vy-=fy}
    });
    // Very light centering — only during first 80 ticks, then none
    var centerForce=physics.tick<80?0.001:0;
    nodes.forEach(function(n){
      var p=pos[n.slug];
      if(pinned[n.slug]){p.vx=0;p.vy=0;return}
      if(dragNode&&dragNode.slug===n.slug)return;
      p.vx+=(0-p.x)*centerForce*physics.cooling;
      p.vy+=(0-p.y)*centerForce*physics.cooling;
      p.x+=p.vx;p.y+=p.vy;
      p.vx*=0.82;p.vy*=0.82;
    });
  }

  // Breathing animation phase
  var breathPhase=0;

  // Render
  function render(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    // Subtle grid
    ctx.globalAlpha=0.04;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
    var gridSize=60*cam.z;
    var offX=(cam.x*cam.z+W/2)%gridSize;
    var offY=(cam.y*cam.z+H/2)%gridSize;
    for(var gx=offX;gx<W;gx+=gridSize){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke()}
    for(var gy=offY;gy<H;gy+=gridSize){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke()}
    ctx.globalAlpha=1;

    breathPhase+=0.015;

    // Edges
    edges.forEach(function(e){
      var a=pos[e.from],b=pos[e.to];if(!a||!b)return;
      var sa=toScreen(a.x,a.y),sb=toScreen(b.x,b.y);
      var hi=hovNode&&(hovNode.slug===e.from||hovNode.slug===e.to);
      var si=selNode&&(selNode.slug===e.from||selNode.slug===e.to);
      var active=hi||si;
      var dimmed=(hovNode||selNode)&&!active;
      var rc=RC[e.relation]||'#8888aa';
      var mx=(sa.x+sb.x)/2,my=(sa.y+sb.y)/2;
      var ddx=sb.x-sa.x,ddy=sb.y-sa.y;
      var cx=mx-ddy*0.1,cy=my+ddx*0.1;

      // Line
      ctx.beginPath();ctx.moveTo(sa.x,sa.y);ctx.quadraticCurveTo(cx,cy,sb.x,sb.y);
      ctx.strokeStyle=rc;
      ctx.lineWidth=active?3.5*cam.z:2*cam.z;
      ctx.globalAlpha=active?1:(dimmed?0.12:0.55);
      ctx.setLineDash(active?[]:[6*cam.z,4*cam.z]);ctx.stroke();ctx.setLineDash([]);

      // Arrow at target end
      var t=0.75;
      var ax=(1-t)*(1-t)*sa.x+2*(1-t)*t*cx+t*t*sb.x;
      var ay=(1-t)*(1-t)*sa.y+2*(1-t)*t*cy+t*t*sb.y;
      var tx=2*(1-t)*(cx-sa.x)+2*t*(sb.x-cx);
      var ty=2*(1-t)*(cy-sa.y)+2*t*(sb.y-cy);
      var ang=Math.atan2(ty,tx);
      var arrowSize=(active?10:7)*cam.z;
      ctx.beginPath();
      ctx.moveTo(ax+Math.cos(ang)*arrowSize,ay+Math.sin(ang)*arrowSize);
      ctx.lineTo(ax+Math.cos(ang+2.5)*arrowSize*0.6,ay+Math.sin(ang+2.5)*arrowSize*0.6);
      ctx.lineTo(ax+Math.cos(ang-2.5)*arrowSize*0.6,ay+Math.sin(ang-2.5)*arrowSize*0.6);
      ctx.closePath();
      ctx.fillStyle=rc;
      ctx.globalAlpha=active?0.9:(dimmed?0.08:0.4);
      ctx.fill();

      // Relation label — always show, brighter when active
      var fs=Math.max(7,(active?11:9)*cam.z);
      ctx.font='600 '+fs+'px "JetBrains Mono"';ctx.textAlign='center';
      ctx.globalAlpha=active?1:(dimmed?0.08:0.4);
      // Label background pill
      var labelW=ctx.measureText(e.relation).width+8*cam.z;
      var labelH=fs+4*cam.z;
      ctx.fillStyle='rgba(10,10,12,0.85)';
      if(ctx.roundRect){ctx.beginPath();ctx.roundRect(cx-labelW/2,cy-labelH/2-2*cam.z,labelW,labelH,4*cam.z);ctx.fill()}
      else{ctx.fillRect(cx-labelW/2,cy-labelH/2-2*cam.z,labelW,labelH)}
      // Label text
      ctx.fillStyle=active?'#ffffff':rc;
      ctx.fillText(e.relation,cx,cy+fs*0.3-2*cam.z);

      ctx.globalAlpha=1;
    });

    // Nodes
    nodes.forEach(function(n){
      var p=pos[n.slug],s=toScreen(p.x,p.y);
      var isFocus=focusSlug&&n.slug===focusSlug;
      var baseR=(isFocus?nR(n)*1.3:nR(n))*cam.z;
      var breath=1+Math.sin(breathPhase+n.slug.length*0.7)*0.03;
      var r=baseR*breath;
      var color=TC[n.cardType]||'#8888a0';
      var hi=hovNode&&hovNode.slug===n.slug;
      var si=selNode&&selNode.slug===n.slug;
      var conn=hovNode&&edges.some(function(e){return(e.from===hovNode.slug&&e.to===n.slug)||(e.to===hovNode.slug&&e.from===n.slug)});
      var dim=(hovNode||selNode)&&!hi&&!si&&!conn;

      // Glow
      if(hi||si){
        var glowR=r*1.8;
        var g=ctx.createRadialGradient(s.x,s.y,r*0.3,s.x,s.y,glowR);
        g.addColorStop(0,color+'40');g.addColorStop(1,color+'00');
        ctx.beginPath();ctx.arc(s.x,s.y,glowR,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
      }

      // Outer ring
      ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);
      ctx.fillStyle=dim?color+'08':color+'15';
      ctx.fill();
      ctx.strokeStyle=dim?color+'22':color+((hi||si)?'cc':'66');
      ctx.lineWidth=(hi||si)?3:1.5;
      ctx.stroke();

      // Inner dot
      var dotR=Math.max(3,r*0.2);
      ctx.beginPath();ctx.arc(s.x,s.y,dotR,0,Math.PI*2);
      ctx.fillStyle=dim?color+'33':color;ctx.fill();

      // Pulse ring for selected
      if(si){
        var pulseR=r*(1.1+Math.sin(breathPhase*2)*0.08);
        ctx.beginPath();ctx.arc(s.x,s.y,pulseR,0,Math.PI*2);
        ctx.strokeStyle=color+'44';ctx.lineWidth=1;ctx.stroke();
      }

      // Labels
      ctx.globalAlpha=dim?0.25:1;
      var fontSize=Math.max(8,((hi||si)?12:10)*cam.z);
      ctx.font='600 '+fontSize+'px "JetBrains Mono"';
      ctx.fillStyle=dim?'#666680':'#e8e8ec';ctx.textAlign='center';
      var label=n.title.length>16?n.title.substring(0,14)+'\u2026':n.title;
      ctx.fillText(label,s.x,s.y+r+13*cam.z);

      var tfs=Math.max(6,8*cam.z);
      ctx.font='600 '+tfs+'px "JetBrains Mono"';
      ctx.fillStyle=dim?color+'33':color+'99';
      ctx.fillText(n.cardType,s.x,s.y+r+23*cam.z);
      // Pin indicator
      if(pinned[n.slug]){
        ctx.font='600 '+Math.max(7,9*cam.z)+'px "JetBrains Mono"';
        ctx.fillStyle='#ffffff66';ctx.fillText('\ud83d\udccc',s.x+r*0.7,s.y-r*0.7);
      }
      // Focus ring
      if(isFocus){
        ctx.beginPath();ctx.arc(s.x,s.y,r+4*cam.z,0,Math.PI*2);
        ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
      }
      ctx.globalAlpha=1;
    });
  }

  // Animation loop
  function loop(){
    if(physics.running)simulate();
    render();
    _graphAnim=requestAnimationFrame(loop);
  }

  // Hit test
  function hitN(wx,wy){
    for(var i=nodes.length-1;i>=0;i--){
      var p=pos[nodes[i].slug],r=nR(nodes[i]);
      if(Math.hypot(wx-p.x,wy-p.y)<=r+6)return nodes[i];
    }return null;
  }
  function evtToWorld(e){
    var rect=canvas.getBoundingClientRect();
    var sx=(e.clientX-rect.left)*(W/rect.width);
    var sy=(e.clientY-rect.top)*(H/rect.height);
    return toWorld(sx,sy);
  }

  // Mouse events
  canvas.onmousemove=function(e){
    var w=evtToWorld(e);
    if(isPanning&&panStart){
      var rect=canvas.getBoundingClientRect();
      var sx=(e.clientX-rect.left)*(W/rect.width);
      var sy=(e.clientY-rect.top)*(H/rect.height);
      cam.x=camStart.x+(sx-panStart.x)/cam.z;
      cam.y=camStart.y+(sy-panStart.y)/cam.z;
      return;
    }
    if(dragNode){
      pos[dragNode.slug].x=w.x;pos[dragNode.slug].y=w.y;
      pos[dragNode.slug].vx=0;pos[dragNode.slug].vy=0;
      physics.cooling=Math.max(physics.cooling,0.3);physics.running=true;
      return;
    }
    var node=hitN(w.x,w.y);
    if(node!==hovNode){
      hovNode=node;canvas.style.cursor=node?'pointer':'grab';
      var tt=document.getElementById('graph-tooltip');
      if(node&&!selNode){
        var color=TC[node.cardType]||'#8888a0';
        var linkCount=(node.links||[]).length;
        var inCount=edges.filter(function(e){return e.to===node.slug}).length;
        tt.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><div style="width:8px;height:8px;border-radius:50%;background:'+color+';box-shadow:0 0 8px '+color+'"></div><span style="font-family:var(--mono);font-size:.68rem;color:'+color+';font-weight:700">'+node.cardType.toUpperCase()+'</span></div><div style="font-family:var(--mono);font-size:.6rem;color:var(--accent)">'+node.slug+'</div><div style="font-size:.88rem;font-weight:700;color:var(--text);margin:3px 0 6px">'+node.title+'</div><div style="display:flex;gap:8px;font-family:var(--mono);font-size:.58rem;color:var(--dim)"><span>\u2197 '+linkCount+' out</span><span>\u2199 '+inCount+' in</span><span>~'+node.tokens+'t</span></div>'+(node.reason?'<div style="font-size:.68rem;color:var(--dim);margin-top:6px;padding-top:6px;border-top:1px solid var(--border)">'+node.reason.substring(0,100)+'</div>':'');
        var rect=canvas.getBoundingClientRect();
        tt.style.display='block';
        // Position in corner farthest from the node
        var nx=e.clientX-rect.left;
        var ny=e.clientY-rect.top;
        var ttW=260,ttH=140;
        if(nx<W/2){tt.style.left=Math.max(W-ttW-12,10)+'px'}
        else{tt.style.left='12px'}
        if(ny<H/2){tt.style.top=Math.max(H-ttH-12,10)+'px'}
        else{tt.style.top='12px'}
      }else{tt.style.display='none'}
    }
  };

  canvas.onmousedown=function(e){
    var w=evtToWorld(e);var node=hitN(w.x,w.y);
    if(node){dragNode=node;dragStart={x:w.x,y:w.y};canvas.style.cursor='grabbing'}
    else{
      isPanning=true;canvas.style.cursor='grabbing';
      var rect=canvas.getBoundingClientRect();
      panStart={x:(e.clientX-rect.left)*(W/rect.width),y:(e.clientY-rect.top)*(H/rect.height)};
      camStart={x:cam.x,y:cam.y};
    }
  };
  canvas.onmouseup=function(e){
    if(dragNode){
      var w=evtToWorld(e);
      var moved=dragStart?Math.hypot(w.x-dragStart.x,w.y-dragStart.y):0;
      if(moved>8){
        // Real drag — pin the node where it was dropped
        pinned[dragNode.slug]=true;
      }else{
        // Tiny move = click — toggle selection highlight
        selNode=(selNode&&selNode.slug===dragNode.slug)?null:dragNode;
      }
    }
    if(isPanning&&panStart){
      var rect=canvas.getBoundingClientRect();
      var sx=(e.clientX-rect.left)*(W/rect.width);
      var sy=(e.clientY-rect.top)*(H/rect.height);
      var totalPan=Math.hypot(sx-panStart.x,sy-panStart.y);
      if(totalPan<5){selNode=null;_gDetail(null,nodes,edges,TC,RC)}
    }
    dragNode=null;dragStart=null;isPanning=false;panStart=null;camStart=null;
    canvas.style.cursor='grab';
  };
  // Double-click opens detail panel
  canvas.ondblclick=function(e){
    var w=evtToWorld(e);var node=hitN(w.x,w.y);
    if(node){
      selNode=node;
      document.getElementById('graph-tooltip').style.display='none';
      _gDetail(selNode,nodes,edges,TC,RC);
    }
  };
  canvas.onmouseleave=function(){hovNode=null;dragNode=null;isPanning=false;panStart=null;document.getElementById('graph-tooltip').style.display='none';canvas.style.cursor='grab'};

  // Zoom with wheel
  canvas.onwheel=function(e){
    e.preventDefault();
    var zoomFactor=e.deltaY>0?0.9:1.1;
    var newZ=Math.max(0.3,Math.min(3,cam.z*zoomFactor));
    // Zoom toward mouse position
    var rect=canvas.getBoundingClientRect();
    var mx=(e.clientX-rect.left)*(W/rect.width)-W/2;
    var my=(e.clientY-rect.top)*(H/rect.height)-H/2;
    cam.x+=(mx/cam.z-mx/newZ);
    cam.y+=(my/cam.z-my/newZ);
    cam.z=newZ;
  };

  // Touch events for mobile
  var touchNode=null,lastTouchDist=0,lastTouchMid=null,lastTapTime=0;
  canvas.ontouchstart=function(e){
    e.preventDefault();
    if(e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      lastTouchDist=Math.hypot(dx,dy);
      lastTouchMid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2};
      return;
    }
    var t=e.touches[0];var rect=canvas.getBoundingClientRect();
    var sx=(t.clientX-rect.left)*(W/rect.width);
    var sy=(t.clientY-rect.top)*(H/rect.height);
    var w=toWorld(sx,sy);
    touchNode=hitN(w.x,w.y);
    if(touchNode){dragNode=touchNode;dragStart={x:w.x,y:w.y}}
    else{isPanning=true;panStart={x:sx,y:sy};camStart={x:cam.x,y:cam.y}}
  };
  canvas.ontouchmove=function(e){
    e.preventDefault();
    if(e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      var dist=Math.hypot(dx,dy);
      var scale=dist/lastTouchDist;
      cam.z=Math.max(0.3,Math.min(3,cam.z*scale));
      lastTouchDist=dist;
      var mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2};
      if(lastTouchMid){cam.x+=(mid.x-lastTouchMid.x)/cam.z;cam.y+=(mid.y-lastTouchMid.y)/cam.z}
      lastTouchMid=mid;
      return;
    }
    var t=e.touches[0];var rect=canvas.getBoundingClientRect();
    var sx=(t.clientX-rect.left)*(W/rect.width);
    var sy=(t.clientY-rect.top)*(H/rect.height);
    if(dragNode){
      var w=toWorld(sx,sy);
      pos[dragNode.slug].x=w.x;pos[dragNode.slug].y=w.y;
      pos[dragNode.slug].vx=0;pos[dragNode.slug].vy=0;
      physics.cooling=Math.max(physics.cooling,0.3);physics.running=true;
    }else if(isPanning&&panStart){
      cam.x=camStart.x+(sx-panStart.x)/cam.z;
      cam.y=camStart.y+(sy-panStart.y)/cam.z;
    }
  };
  canvas.ontouchend=function(e){
    e.preventDefault();
    var now=Date.now();
    if(touchNode){
      // Double-tap detection
      if(now-lastTapTime<350){
        selNode=touchNode;
        document.getElementById('graph-tooltip').style.display='none';
        _gDetail(selNode,nodes,edges,TC,RC);
      }else{
        var w2=dragStart;
        if(w2&&dragNode){
          var p=pos[dragNode.slug];
          var moved=Math.hypot(p.x-w2.x,p.y-w2.y);
          if(moved>10){pinned[dragNode.slug]=true}
          else{selNode=(selNode&&selNode.slug===dragNode.slug)?null:dragNode}
        }
      }
      lastTapTime=now;
    }
    dragNode=null;dragStart=null;touchNode=null;isPanning=false;panStart=null;lastTouchDist=0;lastTouchMid=null;
  };

  // Zoom buttons
  document.getElementById('gz-in').onclick=function(){cam.z=Math.min(3,cam.z*1.3)};
  document.getElementById('gz-out').onclick=function(){cam.z=Math.max(0.3,cam.z/1.3)};
  document.getElementById('gz-fit').onclick=function(){cam.x=0;cam.y=0;cam.z=1};

  // Legend
  var usedTypes=[];nodes.forEach(function(n){if(usedTypes.indexOf(n.cardType)===-1)usedTypes.push(n.cardType)});
  document.getElementById('graph-legend').innerHTML=usedTypes.map(function(t){return'<div style="display:flex;align-items:center;gap:4px;background:rgba(10,10,12,.85);padding:3px 8px;border-radius:6px;border:1px solid '+(TC[t]||'#555')+'33"><div style="width:6px;height:6px;border-radius:50%;background:'+(TC[t]||'#555')+';box-shadow:0 0 4px '+(TC[t]||'#555')+'"></div><span style="font-family:var(--mono);font-size:.55rem;color:'+(TC[t]||'#555')+'">'+t+'</span></div>'}).join('');
  document.getElementById('graph-stats').innerHTML=nodes.length+' nodes \u00b7 '+edges.length+' edges';

  // Start loop
  loop();
}

function _gDetail(node,nodes,edges,TC,RC){
  var panel=document.getElementById('graph-detail');
  if(!node){panel.style.display='none';return}
  var color=TC[node.cardType]||'#8888a0';
  var outE=edges.filter(function(e){return e.from===node.slug});
  var inE=edges.filter(function(e){return e.to===node.slug});
  panel.style.display='block';panel.style.borderColor=color+'44';
  var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div style="display:flex;align-items:center;gap:6px"><div style="width:10px;height:10px;border-radius:50%;background:'+color+';box-shadow:0 0 8px '+color+'"></div><span style="font-family:var(--mono);font-size:.62rem;color:'+color+';font-weight:700;letter-spacing:.06em">'+node.cardType.toUpperCase()+'</span></div><button onclick="document.getElementById(\'graph-detail\').style.display=\'none\'" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:16px">\u2715</button></div>';
  h+='<div style="font-family:var(--mono);font-size:.62rem;color:var(--accent);margin-bottom:2px">'+node.slug+'</div>';
  h+='<div style="font-size:.95rem;font-weight:700;color:var(--text);margin-bottom:8px">'+node.title+'</div>';
  h+='<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:10px">'+(node.keywords||[]).map(function(k){return'<span style="font-family:var(--mono);font-size:.55rem;background:'+color+'12;color:'+color+';padding:2px 6px;border-radius:4px;border:1px solid '+color+'20">'+k+'</span>'}).join('')+'</div>';
  if(node.reason)h+='<div style="background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:6px;padding:8px;margin-bottom:10px"><div style="font-family:var(--mono);font-size:.55rem;color:var(--faint);text-transform:uppercase;margin-bottom:3px">Reason</div><div style="font-size:.75rem;color:var(--dim);line-height:1.5">'+node.reason+'</div></div>';
  if(node.triggeredBy)h+='<div style="font-family:var(--mono);font-size:.6rem;color:var(--dim);margin-bottom:3px">\u26a1 triggered by: <span style="color:var(--accent)">'+node.triggeredBy+'</span></div>';
  if(node.approvedBy)h+='<div style="font-family:var(--mono);font-size:.6rem;color:var(--dim);margin-bottom:3px">\u2713 approved by: <span style="color:var(--green)">'+node.approvedBy+'</span></div>';
  if(outE.length>0){h+='<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-family:var(--mono);font-size:.55rem;color:var(--faint);text-transform:uppercase;margin-bottom:6px">Links out ('+outE.length+')</div>';outE.forEach(function(e){var rd=_REL_DESC[e.relation]||'';h+='<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><span style="font-family:var(--mono);font-size:.58rem;color:'+(RC[e.relation]||'#555')+';background:'+(RC[e.relation]||'#555')+'15;padding:1px 6px;border-radius:3px" title="'+rd+'">'+e.relation+'</span><span style="font-family:var(--mono);font-size:.6rem;color:var(--accent)">\u2192 '+e.to+'</span></div>'});h+='</div>'}
  if(inE.length>0){h+='<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-family:var(--mono);font-size:.55rem;color:var(--faint);text-transform:uppercase;margin-bottom:6px">Links in ('+inE.length+')</div>';inE.forEach(function(e){var rd=_REL_DESC[e.relation]||'';h+='<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><span style="font-family:var(--mono);font-size:.6rem;color:var(--accent)">'+e.from+' \u2192</span><span style="font-family:var(--mono);font-size:.58rem;color:'+(RC[e.relation]||'#555')+';background:'+(RC[e.relation]||'#555')+'15;padding:1px 6px;border-radius:3px" title="'+rd+'">'+e.relation+'</span></div>'});h+='</div>'}
  h+='<div style="margin-top:12px"><button class="btn bo bs" style="width:100%;font-size:.72rem" onclick="dt(\'cards\')">View in Cards</button></div>';
  panel.innerHTML=h;
}

// Auto-login
(async()=>{const t=localStorage.getItem("hs_t");if(!t)return;try{const r=await fetch(A+"/api/auth",{headers:{Authorization:"Bearer "+t}});if(r.ok){const d=await r.json();U=d.user;T=t;adminCheck()}}catch{}
  const l=!!U;document.getElementById("nl").classList.toggle("hidden",l);document.getElementById("nd").classList.toggle("hidden",!l);document.getElementById("no").classList.toggle("hidden",!l)})();

// ═══════════════════════════════════════════════════════
// ANIMATED GRAPH TRAVERSAL DEMO — landing page
// ═══════════════════════════════════════════════════════

var _demoTimer=null;
function demoGraphPlay(){
  if(_demoTimer){clearTimeout(_demoTimer);_demoTimer=null}
  var canvas=document.getElementById('demo-graph');
  if(!canvas)return;
  var dpr=window.devicePixelRatio||1;
  var rect=canvas.getBoundingClientRect();
  var W=rect.width,H=rect.height;
  canvas.width=W*dpr;canvas.height=H*dpr;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  var ctx=canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);

  var TC={person:'#a855f7',project:'#3b82f6',decision:'#ff6b2b',preference:'#22c55e'};

  // Demo nodes
  var nodes=[
    {id:'use-stripe',label:'Use Stripe',type:'decision',x:W*0.5,y:H*0.32},
    {id:'alice',label:'Alice (Lead)',type:'person',x:W*0.25,y:H*0.25},
    {id:'cto',label:'CTO',type:'person',x:W*0.15,y:H*0.55},
    {id:'saas-mvp',label:'SaaS MVP',type:'project',x:W*0.75,y:H*0.28},
    {id:'billing-v2',label:'Billing v2',type:'project',x:W*0.72,y:H*0.62},
    {id:'use-paddle',label:'Rejected: Paddle',type:'decision',x:W*0.42,y:H*0.72},
    {id:'pref-ts',label:'TypeScript',type:'preference',x:W*0.85,y:H*0.5}
  ];
  var edges=[
    {from:'alice',to:'use-stripe',rel:'decided',color:'#ff8855'},
    {from:'cto',to:'use-stripe',rel:'approved',color:'#4ade80'},
    {from:'saas-mvp',to:'use-stripe',rel:'triggers',color:'#facc15'},
    {from:'billing-v2',to:'use-stripe',rel:'depends-on',color:'#22d3ee'},
    {from:'use-stripe',to:'use-paddle',rel:'blocks',color:'#f87171'},
    {from:'saas-mvp',to:'pref-ts',rel:'uses',color:'#60a5fa'},
    {from:'alice',to:'saas-mvp',rel:'owns',color:'#c084fc'}
  ];

  // State
  var activeNodes=new Set();
  var activeEdges=new Set();
  var glowPhase=0;
  var pathText='';
  var animFrame=null;

  function nMap(id){return nodes.find(function(n){return n.id===id})}

  function draw(){
    ctx.clearRect(0,0,W,H);

    // Subtle grid
    ctx.globalAlpha=0.03;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
    for(var gx=0;gx<W;gx+=50){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke()}
    for(var gy=0;gy<H;gy+=50){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke()}
    ctx.globalAlpha=1;

    glowPhase+=0.04;

    // Edges
    edges.forEach(function(e,i){
      var a=nMap(e.from),b=nMap(e.to);if(!a||!b)return;
      var active=activeEdges.has(i);
      var mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      var dx=b.x-a.x,dy=b.y-a.y;
      var cx=mx-dy*0.08,cy=my+dx*0.08;

      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(cx,cy,b.x,b.y);
      ctx.strokeStyle=active?e.color:'#333340';
      ctx.lineWidth=active?3:1.5;
      ctx.globalAlpha=active?0.9:0.25;
      ctx.setLineDash(active?[]:[5,4]);ctx.stroke();ctx.setLineDash([]);

      // Arrow
      var t=0.72;
      var ax2=(1-t)*(1-t)*a.x+2*(1-t)*t*cx+t*t*b.x;
      var ay2=(1-t)*(1-t)*a.y+2*(1-t)*t*cy+t*t*b.y;
      var tx2=2*(1-t)*(cx-a.x)+2*t*(b.x-cx);
      var ty2=2*(1-t)*(cy-a.y)+2*t*(b.y-cy);
      var ang=Math.atan2(ty2,tx2);
      var sz=active?9:6;
      ctx.beginPath();
      ctx.moveTo(ax2+Math.cos(ang)*sz,ay2+Math.sin(ang)*sz);
      ctx.lineTo(ax2+Math.cos(ang+2.5)*sz*0.6,ay2+Math.sin(ang+2.5)*sz*0.6);
      ctx.lineTo(ax2+Math.cos(ang-2.5)*sz*0.6,ay2+Math.sin(ang-2.5)*sz*0.6);
      ctx.closePath();ctx.fillStyle=active?e.color:'#333340';ctx.fill();

      // Label
      if(active){
        ctx.globalAlpha=0.85;
        ctx.font='600 9px "JetBrains Mono",monospace';ctx.textAlign='center';
        var lw=ctx.measureText(e.rel).width+8;
        ctx.fillStyle='rgba(10,10,12,.85)';
        ctx.fillRect(cx-lw/2,cy-8,lw,14);
        ctx.fillStyle='#fff';ctx.fillText(e.rel,cx,cy+3);
      }
      ctx.globalAlpha=1;
    });

    // Nodes
    nodes.forEach(function(n){
      var active=activeNodes.has(n.id);
      var color=TC[n.type]||'#8888a0';
      var r=active?22:16;
      var breath=active?1+Math.sin(glowPhase)*0.06:1;
      r*=breath;

      // Glow
      if(active){
        var g=ctx.createRadialGradient(n.x,n.y,r*0.3,n.x,n.y,r*2);
        g.addColorStop(0,color+'50');g.addColorStop(1,color+'00');
        ctx.beginPath();ctx.arc(n.x,n.y,r*2,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();

        // Pulse ring
        var pr=r*(1.3+Math.sin(glowPhase*1.5)*0.15);
        ctx.beginPath();ctx.arc(n.x,n.y,pr,0,Math.PI*2);
        ctx.strokeStyle=color+'55';ctx.lineWidth=1.5;ctx.stroke();
      }

      // Ring
      ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
      ctx.fillStyle=active?color+'20':color+'08';ctx.fill();
      ctx.strokeStyle=active?color+'cc':color+'33';ctx.lineWidth=active?2.5:1.5;ctx.stroke();

      // Dot
      ctx.beginPath();ctx.arc(n.x,n.y,r*0.2,0,Math.PI*2);
      ctx.fillStyle=active?color:color+'44';ctx.fill();

      // Label
      ctx.globalAlpha=active?1:0.35;
      ctx.font=(active?'700':'500')+' '+(active?11:9)+'px "JetBrains Mono",monospace';
      ctx.textAlign='center';ctx.fillStyle=active?'#e8e8ec':'#888';
      ctx.fillText(n.label,n.x,n.y+r+14);

      // Type badge
      ctx.font='600 7px "JetBrains Mono",monospace';
      ctx.fillStyle=active?color+'bb':color+'33';
      ctx.fillText(n.type,n.x,n.y+r+24);
      ctx.globalAlpha=1;
    });

    animFrame=requestAnimationFrame(draw);
  }

  // Animation sequence
  var qEl=document.getElementById('dg-query');
  var pEl=document.getElementById('dg-path');
  var rEl=document.getElementById('dg-replay');
  qEl.style.opacity='0';pEl.style.opacity='0';rEl.style.display='none';
  activeNodes.clear();activeEdges.clear();

  draw();

  function step(delay,fn){_demoTimer=setTimeout(fn,delay)}

  // Step 1: Query appears
  step(600,function(){
    qEl.style.opacity='1';
  });

  // Step 2: Find use-stripe node
  step(1800,function(){
    activeNodes.add('use-stripe');
    pEl.innerHTML='<span style="color:var(--accent)">use-stripe</span> found';
    pEl.style.opacity='1';
  });

  // Step 3: Traverse — who decided?
  step(3000,function(){
    activeNodes.add('alice');
    activeEdges.add(0); // alice->use-stripe decided
    pEl.innerHTML='<span style="color:#a855f7">alice</span> <span style="color:#ff8855">\u2192 decided \u2192</span> <span style="color:var(--accent)">use-stripe</span>';
  });

  // Step 4: Who approved?
  step(4200,function(){
    activeNodes.add('cto');
    activeEdges.add(1); // cto->use-stripe approved
    pEl.innerHTML='<span style="color:#a855f7">alice</span> <span style="color:#ff8855">decided</span> \u00b7 <span style="color:#a855f7">cto</span> <span style="color:#4ade80">approved</span>';
  });

  // Step 5: What triggered it?
  step(5400,function(){
    activeNodes.add('saas-mvp');
    activeEdges.add(2); // saas-mvp->use-stripe triggers
    pEl.innerHTML='<span style="color:#3b82f6">saas-mvp</span> <span style="color:#facc15">triggered</span> \u2192 <span style="color:#a855f7">alice</span> <span style="color:#ff8855">decided</span> \u2192 <span style="color:#a855f7">cto</span> <span style="color:#4ade80">approved</span>';
  });

  // Step 6: What depends on it?
  step(6600,function(){
    activeNodes.add('billing-v2');
    activeEdges.add(3); // billing-v2->use-stripe depends-on
    pEl.innerHTML='Full trail: <span style="color:#3b82f6">saas-mvp</span> \u2192 <span style="color:#a855f7">alice</span> \u2192 <span style="color:#a855f7">cto</span> \u2192 <span style="color:var(--accent)">use-stripe</span> \u2190 <span style="color:#3b82f6">billing-v2</span>';
  });

  // Step 7: What did it block?
  step(7800,function(){
    activeNodes.add('use-paddle');
    activeEdges.add(4); // use-stripe->use-paddle blocks
    pEl.innerHTML='<span style="color:var(--accent)">use-stripe</span> <span style="color:#f87171">blocks</span> <span style="color:#ff6b2b">use-paddle</span> \u00b7 Decision trail complete';
  });

  // Step 8: Light up remaining
  step(9000,function(){
    activeNodes.add('pref-ts');
    activeEdges.add(5);activeEdges.add(6);
    pEl.innerHTML='\u2705 Full context in <strong style="color:var(--accent)">one API call</strong>. 7 cards, 7 edges, 0 follow-ups.';
  });

  // Step 9: Show replay
  step(11000,function(){
    rEl.style.display='block';
    if(animFrame)cancelAnimationFrame(animFrame);
  });
}

// Auto-play when section becomes visible or tab is shown
var _demoObserver=null;
(function initDemo(){
  var c=document.getElementById('demo-graph');
  if(!c){setTimeout(initDemo,200);return}
  // If already visible, play immediately
  if(c.offsetParent!==null&&c.getBoundingClientRect().width>0){
    setTimeout(demoGraphPlay,300);
  }
  // Also watch for scroll into view
  if(typeof IntersectionObserver!=='undefined'){
    _demoObserver=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting&&entries[0].target.getBoundingClientRect().width>0){
        demoGraphPlay();_demoObserver.disconnect();
      }
    },{threshold:0.2});
    _demoObserver.observe(c);
  }
})();

// ═══════════════════════════════════════════════════════
// STRIPE SUCCESS — poll for plan upgrade
// ═══════════════════════════════════════════════════════

function checkSuccess(){
  if(!U||!T)return;
  var loading=document.getElementById('success-loading');
  var done=document.getElementById('success-done');
  var err=document.getElementById('success-error');
  var planEl=document.getElementById('success-plan');
  var cardsEl=document.getElementById('success-cards');
  var attempts=0;
  var maxAttempts=12; // 12 x 3s = 36 seconds

  function poll(){
    attempts++;
    fetch(A+"/api/auth",{headers:{Authorization:"Bearer "+T}})
      .then(function(r){return r.json()})
      .then(function(d){
        if(d.user&&d.user.plan&&d.user.plan!=="FREE"){
          // Plan upgraded!
          U=d.user;adminCheck();
          var plan=U.plan;
          var cardLimits={PRO:100,TEAM:500,BUSINESS:2000};
          planEl.textContent=plan.charAt(0)+plan.slice(1).toLowerCase();
          planEl.style.color=plan==='BUSINESS'?'var(--green)':plan==='TEAM'?'#60a5fa':'var(--accent)';
          cardsEl.textContent=cardLimits[plan]||100;
          loading.style.display='none';
          done.style.display='block';
        }else if(attempts>=maxAttempts){
          // Timeout — show fallback
          loading.style.display='none';
          err.style.display='block';
        }else{
          setTimeout(poll,3000);
        }
      })
      .catch(function(){
        if(attempts>=maxAttempts){
          loading.style.display='none';
          err.style.display='block';
        }else{
          setTimeout(poll,3000);
        }
      });
  }

  setTimeout(poll,2000); // Wait 2s before first poll
}

// Detect ?success=true in URL and route to success page
(function(){
  var params=new URLSearchParams(window.location.search);
  if(params.get('success')==='true'){
    // Wait for auto-login to complete, then show success
    var waitForLogin=setInterval(function(){
      if(U&&T){
        clearInterval(waitForLogin);
        go('success');
        checkSuccess();
      }
    },300);
    // Safety timeout — if not logged in after 5s, show success anyway
    setTimeout(function(){
      clearInterval(waitForLogin);
      if(!U){
        go('login');
      }else{
        go('success');
        checkSuccess();
      }
    },5000);
  }
})();
