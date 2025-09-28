# Smart-Study-Planner
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Smart Study Planner</title>
  <meta name="description" content="Smart Study Planner - frontend only project using Local Storage" />
  <style>
    /* ====== Simple, modern responsive styling ====== */
    :root{
      --bg:#0f1724; --card:#0b1220; --muted:#94a3b8; --accent:#06b6d4; --accent-2:#7c3aed;
      --glass: rgba(255,255,255,0.03);
      font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    }
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,var(--bg) 0%, #071021 100%);color:#e6eef6;min-height:100vh}
    .container{max-width:1100px;margin:28px auto;padding:20px}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px}
    h1{margin:0;font-size:20px;letter-spacing:0.4px}
    .sub{color:var(--muted);font-size:13px}

    .grid{display:grid;grid-template-columns:1fr 360px;gap:18px;margin-top:18px}
    @media (max-width:920px){.grid{grid-template-columns:1fr} .right{order:2}}

    /* card */
    .card{background:linear-gradient(180deg,var(--card), rgba(255,255,255,0.02));border-radius:14px;padding:14px;box-shadow:0 6px 18px rgba(2,6,23,0.6)}

    /* form */
    form .row{display:flex;gap:8px;margin-bottom:10px}
    label{font-size:13px;color:var(--muted)}
    input[type=text], input[type=datetime-local], input[type=date], select, textarea{width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit}
    textarea{min-height:70px}
    .btn{display:inline-block;padding:10px 12px;border-radius:10px;background:linear-gradient(90deg,var(--accent),var(--accent-2));border:none;color:#031022;cursor:pointer;font-weight:600}
    .muted{color:var(--muted);font-size:13px}

    /* task list */
    .task-list{margin-top:10px;display:flex;flex-direction:column;gap:10px}
    .task{display:flex;align-items:flex-start;gap:12px;padding:10px;border-radius:10px;background:var(--glass);border:1px solid rgba(255,255,255,0.02)}
    .checkbox{width:18px;height:18px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
    .task h3{margin:0;font-size:15px}
    .meta{font-size:12px;color:var(--muted)}
    .pill{font-size:12px;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,0.03)}
    .actions{margin-left:auto;display:flex;gap:8px}
    .action-btn{background:transparent;border:0;color:var(--muted);cursor:pointer}

    /* right column */
    .right .card{margin-bottom:12px}
    .progress{height:12px;border-radius:999px;background:rgba(255,255,255,0.04);overflow:hidden}
    .progress > i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2));width:0%}

    /* timeline */
    .timeline{display:flex;gap:10px;overflow:auto;padding-bottom:6px}
    .day{min-width:120px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.02)}

    footer{margin-top:18px;color:var(--muted);font-size:13px;text-align:center}

    /* small helpers */
    .flex{display:flex;align-items:center;gap:8px}
    .small{font-size:13px;color:var(--muted)}
    .search{display:flex;gap:8px}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Smart Study Planner</h1>
        <div class="sub">Plan, track and complete study tasks — local-only</div>
      </div>
      <div class="flex">
        <div class="small">Saved locally · Works offline</div>
        <button id="notify-perm" class="btn" style="margin-left:12px">Enable Reminders</button>
      </div>
    </header>

    <div class="grid">
      <main>
        <div class="card">
          <form id="task-form">
            <div style="display:flex;gap:12px;align-items:center;justify-content:space-between">
              <div>
                <label>Task title</label>
                <input id="title" type="text" placeholder="e.g. Revise calculus chapter 3" required />
              </div>
              <div style="width:170px">
                <label>Priority</label>
                <select id="priority">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div style="flex:1">
                <label>Subject / Tag</label>
                <input id="subject" type="text" placeholder="Math, Physics..." />
              </div>
              <div style="width:210px">
                <label>Due (date & time)</label>
                <input id="due" type="datetime-local" />
              </div>
            </div>

            <div class="row">
              <div style="flex:1">
                <label>Notes</label>
                <textarea id="notes" placeholder="Optional notes..."></textarea>
              </div>
              <div style="width:120px">
                <label>Duration (mins)</label>
                <input id="duration" type="text" inputmode="numeric" placeholder="60" />
              </div>
            </div>

            <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:8px">
              <div class="muted">You can export / import tasks from the right panel</div>
              <div>
                <button type="submit" class="btn">Add Task</button>
                <button type="button" id="clear-form" class="action-btn">Clear</button>
              </div>
            </div>
          </form>

          <div style="margin-top:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div class="small">Tasks</div>
              <div class="search">
                <input id="search" type="text" placeholder="Search title or subject" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);background:transparent;color:inherit" />
                <select id="filter">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div id="task-list" class="task-list"></div>
          </div>
        </div>

        <div class="card" style="margin-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="small">Quick timeline</div>
              <div class="muted">7-day overview</div>
            </div>
            <div class="small" id="today-count"></div>
          </div>
          <div class="timeline" id="timeline"></div>
        </div>

      </main>

      <aside class="right">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="small">Today Progress</div>
              <div class="sub" id="today-progress-text">0 / 0 tasks</div>
            </div>
            <div style="width:140px">
              <div class="progress" aria-hidden="true"><i id="today-progress-bar"></i></div>
            </div>
          </div>

          <hr style="margin:12px 0;border:0;border-top:1px solid rgba(255,255,255,0.03)" />

          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
            <div>
              <div class="small">Export / Import</div>
              <div class="muted">Backup or restore tasks as JSON</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button id="export-json" class="btn">Export</button>
              <input id="import-file" type="file" accept="application/json" style="display:none" />
              <button id="import-json" class="action-btn">Import</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="small">Settings</div>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
            <label class="small"><input id="auto-notify" type="checkbox" /> Auto reminders for due tasks (1 min before)</label>
            <label class="small"><input id="compact-list" type="checkbox" /> Compact task list</label>
            <button id="clear-all" class="action-btn">Clear All Tasks</button>
          </div>
        </div>

        <div class="card">
          <div class="small">About</div>
          <p class="muted" style="margin-top:8px">A minimal frontend-only student study planner built with HTML/CSS/JS. Stores tasks in Local Storage. Use for portfolio or extend to a full-stack app.</p>
        </div>

      </aside>
    </div>

    <footer class="card" style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="small">Smart Study Planner · Frontend demo</div>
        <div class="small">Author: Ganesh</div>
      </div>
    </footer>
  </div>

  <script>
    // ======= Simple Study Planner JS (LocalStorage) =======
    // Data model: tasks = [{id, title, subject, due, notes, duration, priority, done, createdAt}]
    const LS_KEY = 'smart-study-tasks-v1';
    const form = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const timeline = document.getElementById('timeline');
    const todayCount = document.getElementById('today-count');
    const progressText = document.getElementById('today-progress-text');
    const progressBar = document.getElementById('today-progress-bar');

    const notifyBtn = document.getElementById('notify-perm');
    const exportBtn = document.getElementById('export-json');
    const importBtn = document.getElementById('import-json');
    const importFile = document.getElementById('import-file');
    const clearAllBtn = document.getElementById('clear-all');

    const autoNotifyToggle = document.getElementById('auto-notify');
    const compactToggle = document.getElementById('compact-list');

    // util
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    const load = ()=> JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    const save = (items)=> localStorage.setItem(LS_KEY, JSON.stringify(items));

    // initial render
    let tasks = load();
    renderAll();

    // form submit
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const t = document.getElementById('title').value.trim();
      if(!t) return alert('Enter a task title');
      const newTask = {
        id: uid(),
        title: t,
        subject: document.getElementById('subject').value.trim(),
        due: document.getElementById('due').value || null,
        notes: document.getElementById('notes').value.trim(),
        duration: parseInt(document.getElementById('duration').value) || null,
        priority: document.getElementById('priority').value,
        done: false,
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      save(tasks);
      form.reset();
      renderAll();
      scheduleNotifications();
    });

    document.getElementById('clear-form').addEventListener('click', ()=>form.reset());

    // search / filter
    document.getElementById('search').addEventListener('input', renderAll);
    document.getElementById('filter').addEventListener('change', renderAll);

    // export / import
    exportBtn.addEventListener('click', ()=>{
      const data = JSON.stringify(tasks, null, 2);
      const blob = new Blob([data], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'smart-study-tasks.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    importBtn.addEventListener('click', ()=> importFile.click());
    importFile.addEventListener('change', async (e)=>{
      const f = e.target.files[0];
      if(!f) return;
      try{
        const txt = await f.text();
        const parsed = JSON.parse(txt);
        if(!Array.isArray(parsed)) throw new Error('Invalid file');
        tasks = parsed.concat(tasks);
        save(tasks);
        renderAll();
        alert('Imported ' + parsed.length + ' tasks');
      }catch(err){alert('Failed to import: ' + err.message)}
      importFile.value = '';
    });

    clearAllBtn.addEventListener('click', ()=>{
      if(!confirm('Delete ALL tasks? This cannot be undone.')) return;
      tasks = [];
      save(tasks);
      renderAll();
    });

    // notifications
    notifyBtn.addEventListener('click', async ()=>{
      if(!('Notification' in window)) return alert('Notifications are not supported in your browser');
      const p = await Notification.requestPermission();
      if(p === 'granted') alert('Reminders enabled — allow browser notifications');
    });

    // schedule simple timers for tasks due within next 24 hours (auto-notify optionally)
    function scheduleNotifications(){
      if(Notification.permission !== 'granted') return;
      if(!autoNotifyToggle.checked) return;
      // clear old timers by relying on new set (simple approach)
      tasks.forEach(t => {
        if(!t.due || t.done) return;
        const dueMs = new Date(t.due).getTime();
        const notifyAt = dueMs - (60*1000); // 1 minute before
        const delay = notifyAt - Date.now();
        if(delay > 0 && delay < 24*60*60*1000){
          setTimeout(()=>{
            new Notification('Upcoming: ' + t.title, {body: t.subject || 'Study task', tag: t.id});
          }, delay);
        }
      })
    }

    // render helpers
    function renderAll(){
      renderList();
      renderTimeline();
      renderProgress();
      scheduleNotifications();
    }

    function renderList(){
      const q = document.getElementById('search').value.toLowerCase();
      const filter = document.getElementById('filter').value;
      taskList.innerHTML = '';
      const visible = tasks.filter(t=>{
        if(filter === 'pending' && t.done) return false;
        if(filter === 'done' && !t.done) return false;
        if(q){
          if(t.title.toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q)) return true;
          return false;
        }
        return true;
      });

      visible.forEach(t=>{
        const el = document.createElement('div'); el.className = 'task';
        const chk = document.createElement('div'); chk.className='checkbox'; chk.innerHTML = t.done ? '✓' : '';
        chk.addEventListener('click', ()=>{ toggleDone(t.id); });
        const info = document.createElement('div'); info.style.flex='1';
        const h = document.createElement('h3'); h.textContent = t.title;
        const meta = document.createElement('div'); meta.className='meta';
        meta.innerHTML = `${t.subject ? '<span class="pill">'+escapeHtml(t.subject)+'</span> ' : ''}` +
                         `${t.duration ? ' · ' + t.duration + 'm' : ''}` +
                         `${t.due ? ' · due ' + prettyDate(t.due) : ''}` +
                         ` · <em>${t.priority}</em>`;
        info.appendChild(h); info.appendChild(meta);
        const actions = document.createElement('div'); actions.className='actions';
        const editBtn = document.createElement('button'); editBtn.className='action-btn'; editBtn.textContent='Edit';
        editBtn.addEventListener('click', ()=> editTask(t.id));
        const delBtn = document.createElement('button'); delBtn.className='action-btn'; delBtn.textContent='Delete';
        delBtn.addEventListener('click', ()=>{ if(confirm('Delete this task?')) deleteTask(t.id) });

        actions.appendChild(editBtn); actions.appendChild(delBtn);

        el.appendChild(chk); el.appendChild(info); el.appendChild(actions);
        taskList.appendChild(el);
      });
      if(visible.length === 0) taskList.innerHTML = '<div class="muted" style="padding:12px">No tasks found — add your first study task.</div>';
    }

    function renderTimeline(){
      timeline.innerHTML = '';
      const start = startOfDay(new Date());
      const days = [];
      for(let i=0;i<7;i++){
        const d = new Date(start.getTime() + i*24*60*60*1000);
        days.push(d);
      }
      days.forEach(d=>{
        const dayBox = document.createElement('div'); dayBox.className='day';
        const heading = document.createElement('div'); heading.innerHTML = `<strong>${d.toLocaleDateString(undefined,{weekday:'short'})}</strong><div class="small">${d.toLocaleDateString()}</div>`;
        dayBox.appendChild(heading);
        const list = document.createElement('div'); list.style.marginTop='8px';
        const items = tasks.filter(t=> t.due && sameDay(new Date(t.due), d));
        items.forEach(it=>{
          const itEl = document.createElement('div'); itEl.style.marginBottom='8px';
          itEl.innerHTML = `<div style="font-weight:600">${escapeHtml(it.title)}</div><div class="muted">${it.subject || ''} ${it.duration? ' · ' + it.duration+'m':''}</div>`;
          list.appendChild(itEl);
        });
        if(items.length===0) list.innerHTML = '<div class="muted">No tasks</div>';
        dayBox.appendChild(list);
        timeline.appendChild(dayBox);
      });
      const todayTasks = tasks.filter(t=> t.due && sameDay(new Date(), new Date(t.due)));
      todayCount.textContent = todayTasks.length + ' today';
    }

    function renderProgress(){
      const todayTasks = tasks.filter(t=> t.due && sameDay(new Date(), new Date(t.due)));
      const total = todayTasks.length;
      const done = todayTasks.filter(t=>t.done).length;
      progressText.textContent = `${done} / ${total} tasks`;
      const pct = total === 0 ? 0 : Math.round(done/total*100);
      progressBar.style.width = pct + '%';
    }

    // task operations
    function toggleDone(id){
      tasks = tasks.map(t=> t.id===id ? {...t, done: !t.done} : t);
      save(tasks);
      renderAll();
    }
    function deleteTask(id){ tasks = tasks.filter(t=> t.id!==id); save(tasks); renderAll(); }
    function editTask(id){
      const t = tasks.find(x=>x.id===id); if(!t) return;
      // populate form for simple edit (title, subject, due, notes, duration, priority)
      document.getElementById('title').value = t.title;
      document.getElementById('subject').value = t.subject || '';
      document.getElementById('due').value = t.due || '';
      document.getElementById('notes').value = t.notes || '';
      document.getElementById('duration').value = t.duration || '';
      document.getElementById('priority').value = t.priority || 'medium';
      // remove the old task
      tasks = tasks.filter(x=> x.id!==id); save(tasks);
      renderAll();
    }

    // small util funcs
    function prettyDate(s){
      try{ const d = new Date(s); return d.toLocaleString(); }catch(e){return s}
    }
    function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
    function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

    // simple autosave on unload
    window.addEventListener('beforeunload', ()=> save(tasks));

    // optionally enable compact list styling
    compactToggle.addEventListener('change', ()=>{
      document.querySelectorAll('.task').forEach(el=> el.style.padding = compactToggle.checked? '6px':'10px');
    });

    // keyboard: press n to focus title
    window.addEventListener('keydown', (e)=>{ if(e.key==='n'){ document.getElementById('title').focus(); e.preventDefault(); } });

    // initial notifications schedule
    scheduleNotifications();

    // end of file
  </script>
</body>
</html>
