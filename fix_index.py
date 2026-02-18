import re

for path in ['hyperstack/index.html', 'index.html']:
    f = open(path, 'r', encoding='utf-8')
    lines = f.readlines()
    f.close()

    # Find exact line numbers dynamically — don't hardcode
    t_agents_line = None
    mt_agents_line = None
    dm_line = None

    for i, line in enumerate(lines):
        if 'id="t-agents"' in line:
            t_agents_line = i
        if 'id="mt-agents"' in line:
            mt_agents_line = i
        if 'id="dm"' in line:
            dm_line = i

    print(f'{path}: t-agents={t_agents_line}, mt-agents={mt_agents_line}, dm={dm_line}')

    if t_agents_line is not None:
        lines[t_agents_line] = '    <button class="sbtn" onclick="dt(\'agents\')" id="t-agents">&#x1F916; Agents</button>\n'

    if mt_agents_line is not None:
        lines[mt_agents_line] = '    <button onclick="dt(\'agents\')" id="mt-agents"><span style="font-size:16px">&#x1F916;</span><br>Agents</button>\n'

    if dm_line is not None:
        mob_bar = '  <div id="mob-dash-bar" style="display:none;position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,13,.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.08);padding:10px 16px;align-items:center;justify-content:space-between">\n    <button onclick="dt(\'start\')" style="background:none;border:none;color:rgba(255,255,255,.7);font-family:var(--mono);font-size:.8rem;cursor:pointer;padding:0">&#x2190; Home</button>\n    <span style="font-family:var(--mono);font-size:.75rem;color:rgba(255,255,255,.4)" id="mob-dash-title">Dashboard</span>\n    <button onclick="out()" style="background:none;border:none;color:rgba(255,255,255,.35);font-family:var(--mono);font-size:.72rem;cursor:pointer;padding:0">Log out</button>\n  </div>\n'
        # Only insert if not already there
        if 'mob-dash-bar' not in ''.join(lines):
            lines.insert(dm_line + 1, mob_bar)

    # Fix bottom nav overcrowding — make buttons narrower
    for i, line in enumerate(lines):
        if 'mob-nav-inner' in line:
            lines[i] = '  <div class="mob-nav-inner" style="overflow-x:auto;display:flex;justify-content:flex-start;gap:0;padding:0 4px;-webkit-overflow-scrolling:touch">\n'

    f = open(path, 'w', encoding='utf-8')
    f.writelines(lines)
    f.close()
    print(f'  Done: {path}')

print('All done')
