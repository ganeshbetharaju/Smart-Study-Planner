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
