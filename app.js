const A="https://hyperstack-cloud.vercel.app";let U=null,T=null,DV="start";
const SC={projects:"#3b82f6",people:"#a855f7",decisions:"#ff6b2b",preferences:"#22c55e",workflows:"#eab308"};
const SE={projects:"📦",people:"👤",decisions:"⚖ï¸",preferences:"⚙ï¸",workflows:"🔄",general:"📄"};
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

async function doSignup(){const e=document.getElementById("su-e").value,p=document.getElementById("su-p").value,er=document.getElementById("su-err");
  er.classList.add("hidden");if(!e||!p){er.textContent="Fill in all fields";er.classList.remove("hidden");return}
  if(p.length<8){er.textContent="Password: 8+ characters";er.classList.remove("hidden");return}
  try{const r=await fetch(A+"/api/auth?action=signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});
    const d=await r.json();if(!r.ok){er.textContent=d.error||"Failed";er.classList.remove("hidden");return}
    U=d.user;T=d.token;localStorage.setItem("hs_t",d.token);go("dash")}
  catch(err){er.textContent="Cannot connect to server. Try again.";er.classList.remove("hidden")}}

async function doLogin(){const e=document.getElementById("li-e").value,p=document.getElementById("li-p").value,er=document.getElementById("li-err");
  er.classList.add("hidden");if(!e||!p){er.textContent="Fill in all fields";er.classList.remove("hidden");return}
  try{const r=await fetch(A+"/api/auth?action=login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});
    const d=await r.json();if(!r.ok){er.textContent=d.error||"Failed";er.classList.remove("hidden");return}
    U=d.user;T=d.token;localStorage.setItem("hs_t",d.token);go("dash")}
  catch(err){er.textContent="Cannot connect to server. Try again.";er.classList.remove("hidden")}}

async function doForgot(){const e=document.getElementById("fp-e").value,er=document.getElementById("fp-err"),ok=document.getElementById("fp-ok");
  er.classList.add("hidden");ok.classList.add("hidden");if(!e){er.textContent="Enter your email";er.classList.remove("hidden");return}
  try{const r=await fetch(A+"/api/auth?action=request-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})});
    const d=await r.json();ok.textContent="If that email exists, a reset code has been generated.";ok.classList.remove("hidden");
    if(d._devToken){ok.innerHTML="Reset code (dev mode):<br><code style=\"font-size:.75rem;word-break:break-all;color:var(--accent)\">"+d._devToken+"</code><br>Copy this and click \"Already have a code?\" below.";ok.classList.remove("hidden")}}
  catch(err){er.textContent="Cannot connect to server. Try again.";er.classList.remove("hidden")}}

async function doReset(){const t=document.getElementById("rp-t").value,p=document.getElementById("rp-p").value,er=document.getElementById("rp-err"),ok=document.getElementById("rp-ok");
  er.classList.add("hidden");ok.classList.add("hidden");
  if(!t||!p){er.textContent="Fill in all fields";er.classList.remove("hidden");return}
  if(p.length<8){er.textContent="Password: 8+ characters";er.classList.remove("hidden");return}
  try{const r=await fetch(A+"/api/auth?action=reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:t,password:p})});
    const d=await r.json();if(!r.ok){er.textContent=d.error||"Failed";er.classList.remove("hidden");return}
    ok.textContent="Password reset! Redirecting to sign in...";ok.classList.remove("hidden");
    setTimeout(()=>go("login"),2000)}
  catch(err){er.textContent="Cannot connect to server. Try again.";er.classList.remove("hidden")}}

function out(){U=null;T=null;localStorage.removeItem("hs_t");go("landing")}

function dt(t){DV=t;document.querySelectorAll(".sbtn").forEach(b=>b.classList.remove("act"));
  const b=document.getElementById("t-"+t);if(b)b.classList.add("act");
  document.querySelectorAll(".mob-nav button").forEach(b=>b.classList.remove("act"));
  const mb=document.getElementById("mt-"+t);if(mb)mb.classList.add("act");
  renderD()}

function showCode(lang,btn){document.querySelectorAll('[id^="code-"]').forEach(e=>e.classList.add("hidden"));
  document.getElementById("code-"+lang).classList.remove("hidden");
  document.querySelectorAll('.demo-tab').forEach(t=>t.classList.remove("active"));btn.classList.add("active")}

function showPlatform(p,btn){['openclaw','claude','python','js','curl'].forEach(id=>{
  const el=document.getElementById('ob-plat-'+id);if(el)el.classList.toggle('hidden',id!==p);
  // Also support old plat- prefix
  const el2=document.getElementById('plat-'+id);if(el2)el2.classList.toggle('hidden',id!==p)});
  document.querySelectorAll('.plat-tab').forEach(b=>b.classList.remove('act'));
  if(btn)btn.classList.add('act');else if(event&&event.target)event.target.classList.add('act')}
function renderD(){if(!U)return;
  document.getElementById("d-em").textContent=U.email;
  document.getElementById("d-pt").innerHTML=U.plan==="PRO"?'<span class="badge" style="background:var(--glow);color:var(--accent);border:1px solid rgba(255,107,43,.3)">PRO</span>':'<span class="badge" style="background:rgba(136,136,160,.1);color:var(--dim);border:1px solid rgba(136,136,160,.2)">FREE</span>';
  const m=document.getElementById("dm");
  if(DV==="start")rStart(m);else if(DV==="cards")rCards(m);else if(DV==="key")rKey(m);else if(DV==="ws")rWs(m);else if(DV==="team")rTeam(m);else if(DV==="stats")rStats(m)}

function rStart(el){el.innerHTML=`<div style="text-align:center;padding:16px 0 20px">
    <h1 style="font-family:var(--mono);font-size:1.3rem;font-weight:800">🚀 You're saving money already</h1>
    <p style="color:var(--dim);margin-top:6px;font-size:.88rem">Copy your key, paste into your agent, done.</p>
  </div>

  <div class="ob-savings">
    <div class="ob-save-card" style="border-left:3px solid var(--red)">
      <div class="big" style="color:var(--red)">$270<span style="font-size:.7rem;color:var(--dim)">/mo</span></div>
      <div class="lbl">Without HyperStack</div>
    </div>
    <div class="ob-save-card" style="border-left:3px solid var(--green)">
      <div class="big" style="color:var(--green)">$16<span style="font-size:.7rem;color:var(--dim)">/mo</span></div>
      <div class="lbl">With HyperStack</div>
    </div>
  </div>

  <div class="ob-steps">
    <div class="ob-step done"><div class="num">✓</div><div class="stxt">Sign up</div></div>
    <div class="ob-step active"><div class="num">2</div><div class="stxt">Copy key</div></div>
    <div class="ob-step"><div class="num">3</div><div class="stxt">Paste & go</div></div>
  </div>

  <div class="setup-card">
    <h3>🔑 Your API Key</h3>
    <div class="key-display">
      <code>${U.apiKey}</code>
      <button onclick="cpKey(this)">Copy</button>
    </div>
    <p style="font-size:.72rem;color:var(--faint);margin-top:4px">Add to your agent env as <code style="color:var(--accent);font-family:var(--mono);font-size:.72rem">HYPERSTACK_API_KEY</code></p>
  </div>

  <div class="setup-card">
    <h3>⚡ Quick setup</h3>
    <div class="plat-tabs">
      <button class="plat-tab act" onclick="showPlatform('mcp',this)">🔌 MCP Server</button>
      <button class="plat-tab" onclick="showPlatform('openclaw',this)">🐾 OpenClaw</button>
      <button class="plat-tab" onclick="showPlatform('claude',this)">🤖 Claude Code</button>
      <button class="plat-tab" onclick="showPlatform('python',this)">🐍 Python</button>
      <button class="plat-tab" onclick="showPlatform('js',this)">⚡ JS</button>
      <button class="plat-tab" onclick="showPlatform('curl',this)">💻 cURL</button>
    </div>

    <div id="ob-plat-mcp" class="code-block"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre><span style="color:var(--faint)">// Add to claude_desktop_config.json or .cursor/mcp.json</span>
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
<span style="color:var(--faint)">// Works with: Claude Desktop, Cursor, VS Code, Windsurf</span></pre></div>

    <div id="ob-plat-openclaw" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre><span style="color:var(--faint)"># Add skill + set env</span>
mkdir -p skills/hyperstack
export HYPERSTACK_API_KEY=<span style="color:var(--green)">${U.apiKey}</span>
export HYPERSTACK_WORKSPACE=<span style="color:var(--green)">default</span>
<span style="color:var(--faint)"># Your agent reads SKILL.md and handles the rest</span></pre></div>

    <div id="ob-plat-claude" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre><span style="color:var(--faint)"># Add to .env or shell profile</span>
export HYPERSTACK_API_KEY=<span style="color:var(--green)">${U.apiKey}</span>
export HYPERSTACK_WORKSPACE=<span style="color:var(--green)">default</span>
<span style="color:var(--faint)"># Tell Claude: "Use HyperStack API for memory"</span></pre></div>

    <div id="ob-plat-python" class="code-block hidden"><button class="cpbtn" onclick="cpBlock(this)">Copy</button>
<pre>import requests
h = {"X-API-Key": "<span style="color:var(--green)">${U.apiKey}</span>"}
<span style="color:var(--faint)"># Store</span>
requests.post("${A}/api/cards?workspace=default",
  headers=h, json={"slug":"test","title":"Test",
  "stack":"general","body":"It works!"})
<span style="color:var(--faint)"># Search</span>
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

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">
    <div class="setup-card" style="text-align:center;cursor:pointer;margin:0;padding:16px" onclick="dt('cards')">
      <span style="font-size:1.3rem">🃏</span>
      <div style="font-family:var(--mono);font-size:.78rem;font-weight:600;margin-top:4px">View Cards</div>
    </div>
    <div class="setup-card" style="text-align:center;cursor:pointer;margin:0;padding:16px" onclick="go('docs')">
      <span style="font-size:1.3rem">📖</span>
      <div style="font-family:var(--mono);font-size:.78rem;font-weight:600;margin-top:4px">Docs</div>
    </div>
  </div>`}

function rCards(el){el.innerHTML=`<div class="dh"><div><h1>🃏 Memory Cards</h1><p>Loading...</p></div><div style="display:flex;gap:6px;align-items:center"><input class="sinput" placeholder="🔍 Search..." oninput="fCards(this.value)"><button class="btn bp bs" onclick="showCardForm()">+ New</button></div></div><div id="card-form-wrap"></div><div id="cl"><div style="text-align:center;padding:40px;color:var(--dim)">Loading cards from API...</div></div>`;
  fetch(A+"/api/cards?workspace=default",{headers:{"X-API-Key":U.apiKey}}).then(r=>r.json()).then(d=>{
    const cards=d.cards||[];
    document.querySelector('.dh p').textContent=cards.length+' cards Â· '+d.plan+' ('+cards.length+'/'+d.limit+')';
    const cl=document.getElementById('cl');
    if(cards.length===0){cl.innerHTML=`<div style="text-align:center;padding:40px">
      <span style="font-size:2.5rem">🃏</span>
      <h3 style="font-family:var(--mono);margin:12px 0 8px">No cards yet</h3>
      <p style="color:var(--dim);font-size:.85rem;margin-bottom:16px">Your agent creates cards via the API. Go back to setup to get started.</p>
      <button class="btn bp bs" onclick="dt('start')">â† Setup</button>
      <button class="btn bo bs" style="margin-left:6px" onclick="rCards(document.getElementById('dm'))">🔄 Refresh</button>
    </div>`;return}
    const stacks=[...new Set(cards.map(c=>c.stack))];
    const filtersHtml=`<div class="filters"><button class="fb act" onclick="fStack('all',this)">🗂ï¸ All (${cards.length})</button>${stacks.map(s=>`<button class="fb" onclick="fStack('${s}',this)">${SE[s]||'📄'} ${s} (${cards.filter(c=>c.stack===s).length})</button>`).join('')}</div>`;
    const cardsHtml=`<div class="card-grid">${cards.map(c=>{
      const bc=SC[c.stack]||'#555';
      const kw=(c.keywords||[]).slice(0,3);
      const body=(c.body||'').replace(/</g,'&lt;').substring(0,80);
      return`<div class="cc" data-s="${c.stack}" data-q="${(c.title+' '+(c.keywords||[]).join(' ')+' '+(c.body||'')).toLowerCase()}" onclick="expandCard(${JSON.stringify(c).replace(/"/g,'&quot;')})">
        <div class="cc-stripe" style="background:${bc}"></div>
        <button class="cc-del" onclick="event.stopPropagation();if(confirm('Delete ${c.slug}?'))delCard('${c.slug}')" title="Delete">✕</button>
        <div class="cc-head"><span class="cc-icon">${SE[c.stack]||'📄'}</span><span class="cc-title">${c.title||c.slug}</span></div>
        <div class="cc-body">${body}</div>
        <div class="cc-footer"><div class="cc-tags">${kw.map(k=>`<span class="cc-tag" style="background:${bc}15;color:${bc};border:1px solid ${bc}30">#${k}</span>`).join('')}</div><span class="cc-meta">${c.tokens||0}t</span></div>
      </div>`}).join('')}</div>`;
    cl.innerHTML=filtersHtml+cardsHtml+`<div style="text-align:center;margin-top:14px"><button class="btn bo bs" onclick="rCards(document.getElementById('dm'))">🔄 Refresh</button></div>`;
  }).catch(err=>{
    document.getElementById('cl').innerHTML=`<div style="text-align:center;padding:30px;color:var(--red)">Failed to load cards: ${err.message}<br><button class="btn bo bs" style="margin-top:10px" onclick="rCards(document.getElementById('dm'))">Retry</button></div>`;
  })}

function delCard(slug){fetch(A+"/api/cards?workspace=default&id="+slug,{method:"DELETE",headers:{"X-API-Key":U.apiKey}}).then(r=>r.json()).then(()=>rCards(document.getElementById('dm'))).catch(err=>alert("Delete failed: "+err.message))}

function fStack(s,b){document.querySelectorAll('.fb').forEach(x=>x.classList.remove('act'));b.classList.add('act');
  document.querySelectorAll('.cc').forEach(e=>{e.style.display=(s==='all'||e.dataset.s===s)?'':'none'})}
function fCards(q){const t=q.toLowerCase();document.querySelectorAll('.cc').forEach(e=>{e.style.display=e.dataset.q.includes(t)?'':'none'})}

function expandCard(c){const bc=SC[c.stack]||'#555';const kw=(c.keywords||[]);
  const ov=document.createElement('div');ov.className='card-expand';ov.onclick=e=>{if(e.target===ov)ov.remove()};
  ov.innerHTML=`<div class="card-expand-inner">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:14px">
      <div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:20px">${SE[c.stack]||'📄'}</span><span style="font-family:var(--mono);font-weight:700;font-size:1rem">${c.title||c.slug}</span></div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">${kw.map(k=>`<span style="padding:2px 8px;border-radius:8px;font-family:var(--mono);font-size:.65rem;font-weight:600;background:${bc}15;color:${bc};border:1px solid ${bc}30">#${k}</span>`).join('')}</div></div>
      <button onclick="this.closest('.card-expand').remove()" style="background:none;border:none;color:var(--dim);font-size:18px;cursor:pointer;padding:4px">✕</button>
    </div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px">
      <pre style="font-family:var(--mono);font-size:.78rem;color:var(--dim);line-height:1.7;margin:0;white-space:pre-wrap">${(c.body||'').replace(/</g,'&lt;')}</pre>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:var(--mono);font-size:.68rem;color:var(--faint)">${c.slug} Â· ${c.tokens||0} tokens Â· ${c.stack}</span>
      <button class="btn bo bs" style="color:var(--red);border-color:rgba(239,68,68,.3)" onclick="if(confirm('Delete ${c.slug}?')){delCard('${c.slug}');this.closest('.card-expand').remove()}">🗑ï¸ Delete</button>
    </div>
  </div>`;
  document.body.appendChild(ov)}

function cpKey(btn){navigator.clipboard.writeText(U.apiKey);btn.textContent='✓ Copied';btn.classList.add('copied-btn');
  setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied-btn')},2000);
  const steps=document.querySelectorAll('.ob-step');
  if(steps[1]){steps[1].classList.add('done');steps[1].classList.remove('active')}
  if(steps[2])steps[2].classList.add('active')}

function cpBlock(btn){const pre=btn.parentElement.querySelector('pre');
  navigator.clipboard.writeText(pre.textContent);btn.textContent='✓ Copied';
  setTimeout(()=>{btn.textContent='Copy'},2000)}

function showCardForm(){const w=document.getElementById('card-form-wrap');
  if(w.innerHTML){w.innerHTML='';return}
  w.innerHTML=`<div class="setup-card" style="margin-bottom:14px">
    <h3 style="margin-bottom:12px">✨ Create Memory Card</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div class="fg"><label>Slug (unique ID)</label><input id="cf-slug" placeholder="project-webapp"></div>
      <div class="fg"><label>Title</label><input id="cf-title" placeholder="WebApp"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div class="fg"><label>Stack</label><select id="cf-stack" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;color:var(--text);font-family:var(--mono);font-size:.88rem;outline:none">
        <option value="projects">📦 projects</option><option value="people">👤 people</option><option value="decisions">⚖ï¸ decisions</option>
        <option value="preferences">⚙ï¸ preferences</option><option value="workflows">🔄 workflows</option><option value="general" selected>📄 general</option>
      </select></div>
      <div class="fg"><label>Keywords (comma-separated)</label><input id="cf-kw" placeholder="react, vercel, auth"></div>
    </div>
    <div class="fg" style="margin-bottom:10px"><label>Body</label><textarea id="cf-body" rows="3" placeholder="What should your agent remember?" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;color:var(--text);font-family:var(--mono);font-size:.85rem;outline:none;resize:vertical"></textarea></div>
    <div style="display:flex;gap:6px"><button class="btn bp bs" onclick="createCard()">Create Card →</button><button class="btn bo bs" onclick="document.getElementById('card-form-wrap').innerHTML=''">Cancel</button></div>
    <div id="cf-err" class="ferr hidden" style="margin-top:6px"></div>
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

function rKey(el){el.innerHTML=`<div class="dh"><div><h1>🔑 API Key</h1><p>Use this key in any agent</p></div></div>
  <div class="akbox"><p style="color:var(--text);font-weight:500;margin-bottom:4px">Your API Key</p>
    <div class="key">${U.apiKey}</div> <button class="btn bo bs" onclick="navigator.clipboard.writeText('${U.apiKey}');this.textContent='✓ Copied'">Copy</button>
    <p style="margin-top:12px;color:var(--dim);font-size:.85rem">Add to your agent's environment:</p>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:12px;margin-top:8px">
      <pre style="font-family:var(--mono);font-size:.8rem;color:var(--dim);margin:0">HYPERSTACK_API_KEY=${U.apiKey}
HYPERSTACK_WORKSPACE=default</pre></div></div>
  <div class="akbox"><p style="color:var(--text);font-weight:500;margin-bottom:8px">Quick test</p>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:12px">
      <pre style="font-family:var(--mono);font-size:.78rem;color:var(--dim);line-height:1.8;margin:0"><span style="color:var(--accent)">curl</span> <span style="color:var(--green)">"https://hyperstack-cloud.vercel.app/api/cards?workspace=default"</span> \\
  -H <span style="color:var(--green)">"X-API-Key: ${U.apiKey}"</span></pre></div></div>`}

function rWs(el){const pro=U.plan==="PRO";
  el.innerHTML=`<div class="dh"><div><h1>📁 Workspaces</h1><p>${pro?'Unlimited':'1 workspace'} on ${U.plan}</p></div></div>
  <div class="ci"><div class="ci-top"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">📁</span><div><div class="ci-title">default</div><div style="font-size:.78rem;color:var(--dim)">${DEMO.length} cards</div></div></div>
  <span class="badge" style="background:var(--greend);color:var(--green);border:1px solid rgba(34,197,94,.3)">Active</span></div></div>
  ${pro?'<button class="btn bo" style="margin-top:10px">+ New Workspace</button>':`<div class="ci" style="text-align:center;padding:20px;margin-top:10px"><p style="color:var(--dim);margin-bottom:8px">Need more workspaces?</p><a href="https://buy.stripe.com/dRmcN57Df9XucBH01JeUU03" class="btn bp bs">Upgrade to Pro — $15/mo</a> <a href="https://buy.stripe.com/cNi3cv5v79Xu1X34hZeUU04" class="btn bg bs" style="margin-left:6px">Yearly — $12/mo</a></div>`}`}

function rTeam(el){const pro=U.plan==="PRO";
  if(!pro){el.innerHTML=`<div class="dh"><div><h1>👥 Team</h1></div></div><div class="ci" style="text-align:center;padding:32px"><span style="font-size:2rem">👥</span><h3 style="font-family:var(--mono);margin:10px 0 6px">Team Memory requires Pro</h3><p style="color:var(--dim);margin-bottom:12px">Share cards across teammates so every agent stays in sync.</p><a href="https://buy.stripe.com/dRmcN57Df9XucBH01JeUU03" class="btn bp">Upgrade to Pro — $15/mo</a> <a href="https://buy.stripe.com/cNi3cv5v79Xu1X34hZeUU04" class="btn bg" style="margin-left:8px">Yearly — $12/mo</a></div>`;return}
  el.innerHTML=`<div class="dh"><div><h1>👥 Team</h1><p>Share cards across your team</p></div></div>
  <div class="ci"><div style="display:flex;align-items:center;gap:10px;padding:6px 0"><div style="width:28px;height:28px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:12px">🧑â€💻</div><div><div style="font-family:var(--mono);font-size:.82rem">${U.name||U.email}</div><div style="font-size:.72rem;color:var(--dim)">${U.email}</div></div><span class="badge" style="background:var(--glow);color:var(--accent);margin-left:auto">Owner</span></div></div>
  <button class="btn bo" style="margin-top:10px">+ Invite Teammate</button>
  <div style="background:var(--surface);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;padding:14px;margin-top:14px"><p style="color:var(--dim);font-size:.82rem">Set cards to <strong style="color:var(--text)">shared</strong> and they'll sync to every team member's workspace. Private cards stay private.</p></div>`}

function rStats(el){const pro=U.plan==="PRO";
  if(!pro){el.innerHTML=`<div class="dh"><div><h1>📊 Analytics</h1></div></div><div class="ci" style="text-align:center;padding:32px"><span style="font-size:2rem">📊</span><h3 style="font-family:var(--mono);margin:10px 0 6px">Analytics requires Pro</h3><p style="color:var(--dim);margin-bottom:12px">Token savings, stale cards, usage patterns.</p><a href="https://buy.stripe.com/dRmcN57Df9XucBH01JeUU03" class="btn bp">Upgrade to Pro — $15/mo</a> <a href="https://buy.stripe.com/cNi3cv5v79Xu1X34hZeUU04" class="btn bg" style="margin-left:8px">Yearly — $12/mo</a></div>`;return}
  el.innerHTML=`<div class="dh"><div><h1>📊 Analytics</h1></div></div>
  <div class="sgrid"><div class="sc"><div class="n" style="color:var(--green)">94%</div><div class="l">Token Savings</div></div>
  <div class="sc"><div class="n">${DEMO.length}</div><div class="l">Cards</div></div>
  <div class="sc"><div class="n" style="color:var(--accent)">$254</div><div class="l">Saved/mo</div></div>
  <div class="sc"><div class="n" style="color:var(--yellow)">1</div><div class="l">Stale Cards</div></div></div>
  <div class="ci"><p style="color:var(--text);font-weight:500;margin-bottom:10px">Token Savings</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div style="text-align:center;padding:10px;background:var(--redd);border-radius:6px"><div style="font-family:var(--mono);font-size:1.3rem;font-weight:800;color:var(--red)">6,000</div><div style="font-size:.72rem;color:var(--dim)">Without (tok/msg)</div></div>
  <div style="text-align:center;padding:10px;background:var(--greend);border-radius:6px"><div style="font-family:var(--mono);font-size:1.3rem;font-weight:800;color:var(--green)">350</div><div style="font-size:.72rem;color:var(--dim)">With HyperStack</div></div></div></div>
  <div class="ci" style="margin-top:8px"><p style="color:var(--text);font-weight:500;margin-bottom:6px">⚠ï¸ Stale Cards</p>
  <div style="display:flex;align-items:center;gap:6px"><span class="badge" style="background:rgba(234,179,8,.1);color:var(--yellow);border:1px solid rgba(234,179,8,.3)">26 days</span><span style="font-family:var(--mono);font-size:.82rem">decision-auth</span><span style="font-size:.78rem;color:var(--dim)">Auth0 → Clerk</span></div></div>`}

// Auto-login
(async()=>{const t=localStorage.getItem("hs_t");if(!t)return;try{const r=await fetch(A+"/api/auth",{headers:{Authorization:"Bearer "+t}});if(r.ok){const d=await r.json();U=d.user;T=t}}catch{}
  const l=!!U;document.getElementById("nl").classList.toggle("hidden",l);document.getElementById("nd").classList.toggle("hidden",!l);document.getElementById("no").classList.toggle("hidden",!l)})();
