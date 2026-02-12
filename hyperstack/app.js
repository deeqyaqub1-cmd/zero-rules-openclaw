
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
  if(p==="dash"&&U)renderD()}

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
  document.getElementById("d-pt").innerHTML=U.plan==="PRO"?'<span class="badge" style="background:var(--glow);color:var(--accent);border:1px solid rgba(255,107,43,.3)">PRO</span>':'<span class="badge" style="background:rgba(136,136,160,.1);color:var(--dim);border:1px solid rgba(136,136,160,.2)">FREE</span>';
  const m=document.getElementById("dm");
  if(DV==="start")rStart(m);else if(DV==="cards")rCards(m);else if(DV==="key")rKey(m);else if(DV==="ws")rWs(m);else if(DV==="team")rTeam(m);else if(DV==="stats")rStats(m)}

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
function rWs(el){const pro=U.plan==="PRO";
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
        <a href="https://buy.stripe.com/dRmcN57Df9XucBH01JeUU03" class="btn bp bs">Upgrade to Pro — $15/mo</a>
        <a href="https://buy.stripe.com/cNi3cv5v79Xu1X34hZeUU04" class="btn bg bs">Yearly — $12/mo</a>
      </div>
    </div>
  </div>`}`}

/* ═══════════════════════════════════════════
   👥 TEAM — Premium display
   ═══════════════════════════════════════════ */
function rTeam(el){const pro=U.plan==="PRO";
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
        <a href="https://buy.stripe.com/dRmcN57Df9XucBH01JeUU03" class="btn bp">Upgrade to Pro — $15/mo</a>
        <a href="https://buy.stripe.com/cNi3cv5v79Xu1X34hZeUU04" class="btn bg">Yearly — $12/mo</a>
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
function rStats(el){const pro=U.plan==="PRO";
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
        <a href="https://buy.stripe.com/dRmcN57Df9XucBH01JeUU03" class="btn bp">Upgrade to Pro — $15/mo</a>
        <a href="https://buy.stripe.com/cNi3cv5v79Xu1X34hZeUU04" class="btn bg">Yearly — $12/mo</a>
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


// Auto-login
(async()=>{const t=localStorage.getItem("hs_t");if(!t)return;try{const r=await fetch(A+"/api/auth",{headers:{Authorization:"Bearer "+t}});if(r.ok){const d=await r.json();U=d.user;T=t;adminCheck()}}catch{}
  const l=!!U;document.getElementById("nl").classList.toggle("hidden",l);document.getElementById("nd").classList.toggle("hidden",!l);document.getElementById("no").classList.toggle("hidden",!l)})();
