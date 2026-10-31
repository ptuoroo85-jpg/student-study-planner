(() => {
  'use strict';
  const STORAGE_KEY = 'studyspace.tasks.v1';
  const $ = selector => document.querySelector(selector);
  let tasks = [];
  let filter = 'all';
  let toastTimer;
  let storageProblem = false;
  const validTask = task => task && typeof task.id === 'string' && typeof task.title === 'string' && task.title.trim() && task.title.length <= 160 && typeof task.subject === 'string' && task.subject.length <= 80 && typeof task.completed === 'boolean';
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored) || !stored.every(validTask) || new Set(stored.map(task => task.id)).size !== stored.length) throw new Error('Invalid saved data');
    tasks = stored;
  } catch { storageProblem = true; }

  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      $('.local-badge').innerHTML = '<i></i> Saved on this device';
      return true;
    } catch {
      $('.local-badge').textContent = 'Changes not saved';
      notify('Your browser could not save changes. Keep this page open to retain your tasks.');
      return false;
    }
  }
  function render() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    const counts = { total: tasks.length, pending, done: completed };
    Object.entries(counts).forEach(([key, value]) => { $(`#${key}-count`).textContent = value; });
    $('#list-count').textContent = tasks.length;
    $('#filter-all').textContent = tasks.length;
    $('#filter-pending').textContent = pending;
    $('#filter-completed').textContent = completed;
    $('#progress-bar').style.width = `${percent}%`;
    $('#percent-count').textContent = `${percent}%`;
    $('#progress-label').textContent = `${percent}% of your tasks complete`;
    $('#encouragement').textContent = tasks.length === 0 ? 'A fresh page. Start with one small task.' : pending === 0 ? 'All caught up. Take a moment to enjoy your progress.' : `${pending} ${pending === 1 ? 'step' : 'steps'} ahead. You have room to make progress.`;
    $('#remaining').textContent = tasks.length ? `${pending} ${pending === 1 ? 'task' : 'tasks'} left to do` : 'No tasks yet';
    const visibleTasks = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
    $('#task-list').replaceChildren(...visibleTasks.map(task => {
      const row = document.createElement('li');
      row.className = `task-row${task.completed ? ' completed' : ''}`;
      const toggle = document.createElement('button');
      toggle.className = 'task-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', `Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`);
      toggle.setAttribute('aria-pressed', String(task.completed));
      toggle.textContent = task.completed ? '✓' : '';
      toggle.addEventListener('click', () => {
        task.completed = !task.completed;
        const saved = persist(); render();
        if (saved) notify(task.completed ? 'Task complete. A little progress worth celebrating.' : 'Task moved back to your to-do list.');
        const index = visibleTasks.findIndex(item => item.id === task.id);
        const buttons = document.querySelectorAll('.task-toggle');
        (buttons[Math.min(index, buttons.length - 1)] || $('[data-filter].selected')).focus();
      });
      const content = document.createElement('div');
      content.className = 'task-content';
      const title = document.createElement('p');
      title.className = 'task-name'; title.textContent = task.title;
      content.append(title);
      if (task.subject) {
        const subject = document.createElement('span');
        subject.className = 'task-subject'; subject.textContent = task.subject;
        content.append(subject);
      }
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'delete-task';
      remove.setAttribute('aria-label', `Delete ${task.title}`);
      remove.title = 'Delete task';
      remove.innerHTML = '<svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg>';
      remove.addEventListener('click', () => {
        const index = visibleTasks.findIndex(item => item.id === task.id);
        tasks = tasks.filter(item => item.id !== task.id);
        const saved = persist(); render();
        if (saved) notify('Task deleted.');
        const buttons = document.querySelectorAll('.delete-task');
        (buttons[Math.min(index, buttons.length - 1)] || $('[data-filter].selected')).focus();
      });
      row.append(toggle, content, remove);
      return row;
    }));
    $('#empty-state').hidden = visibleTasks.length > 0;
    $('#empty-add').hidden = filter !== 'all' && tasks.length > 0;
    $('#empty-title').textContent = !tasks.length ? 'Your next chapter starts here' : filter === 'completed' ? 'Your progress will show up here' : 'All caught up. Nicely done.';
    $('#empty-description').textContent = !tasks.length ? 'Add your first study task and give your goals a little space to grow.' : filter === 'completed' ? 'Complete a task to see it here. One small step at a time.' : 'You have no tasks left to do. Enjoy a well-earned break.';
  }
  $('#today').textContent = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
  $('#task-form').addEventListener('submit', event => {
    event.preventDefault();
    const title = $('#task-title').value.trim();
    if (!title) {
      $('#title-error').hidden = false;
      $('#task-title').setAttribute('aria-invalid', 'true');
      $('#task-title').focus();
      return;
    }
    tasks.unshift({ id: crypto.randomUUID(), title, subject: $('#task-subject').value.trim(), completed: false });
    const saved = persist();
    $('#task-form').reset();
    $('#title-error').hidden = true;
    $('#task-title').removeAttribute('aria-invalid');
    filter = 'all'; updateFilters(); render();
    $('#task-title').focus();
    if (saved) notify('Task added. Your next step is ready.');
  });
  $('#task-title').addEventListener('input', () => {
    if ($('#task-title').value.trim()) {
      $('#title-error').hidden = true;
      $('#task-title').removeAttribute('aria-invalid');
    }
  });
  function updateFilters() {
    document.querySelectorAll('[data-filter]').forEach(button => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter; updateFilters(); render();
  }));
  $('#empty-add').addEventListener('click', () => { $('#task-title').focus(); $('#task-title').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  render();
  if (storageProblem) { $('.local-badge').textContent = 'Saved tasks could not be loaded'; notify('Saved tasks could not be loaded. New tasks will be saved when browser storage is available.'); }
})();
