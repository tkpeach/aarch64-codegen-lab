const form = document.querySelector('#answers');
const status = document.querySelector('#save-status');
const draftKey = 'repofoundry:draft:' + location.pathname;

if (location.protocol === 'http:' && location.hostname === '127.0.0.1') {
  const pending = new Map();
  let timer;
  let saving = false;

  function keepDraft() {
    try {
      if (pending.size) {
        localStorage.setItem(draftKey, JSON.stringify(Object.fromEntries(pending)));
      } else {
        localStorage.removeItem(draftKey);
      }
      return true;
    } catch {
      return false;
    }
  }

  function schedule(delay = 400) {
    clearTimeout(timer);
    timer = setTimeout(save, delay);
  }

  async function save() {
    if (saving || !pending.size) return;
    clearTimeout(timer);
    saving = true;
    const batch = new Map(pending);
    status.textContent = '正在写入 HTML…';
    try {
      const response = await fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(batch)),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(response.status);
      for (const [key, value] of batch) {
        if (pending.get(key) === value) pending.delete(key);
      }
      keepDraft();
      status.textContent = pending.size ? '有改动待写入…' : '已写入原 HTML';
      if (pending.size) schedule();
    } catch {
      status.textContent = keepDraft()
        ? '尚未写入 HTML。草稿已保存在此浏览器，正在自动重试。'
        : '尚未写入 HTML。请保留此页，正在自动重试。';
      schedule(3000);
    } finally {
      saving = false;
    }
  }

  function fit(field) {
    field.style.height = 'auto';
    field.style.height = field.scrollHeight + 'px';
  }

  let draft = {};
  try {
    draft = JSON.parse(localStorage.getItem(draftKey)) || {};
  } catch {
    // Disk content remains available when browser storage is unavailable.
  }
  for (const field of form.querySelectorAll('textarea[name]')) {
    if (typeof draft[field.name] === 'string' && draft[field.name] !== field.value) {
      field.value = draft[field.name];
      pending.set(field.name, field.value);
    }
    field.readOnly = false;
    fit(field);
  }
  keepDraft();
  status.textContent = pending.size ? '已恢复草稿，正在写入 HTML…' : '输入后自动写入 HTML';
  if (pending.size) schedule();
  form.addEventListener('input', ({ target }) => {
    if (!target.matches('textarea[name]')) return;
    pending.set(target.name, target.value);
    keepDraft();
    fit(target);
    status.textContent = '有改动待写入…';
    schedule();
  });
  form.addEventListener('focusout', save);
  window.addEventListener('online', save);
  window.addEventListener('beforeunload', event => {
    if (pending.size && !keepDraft()) event.preventDefault();
  });
}
