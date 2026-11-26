const vscode = acquireVsCodeApi();
const form = document.querySelector('#answers');
const status = document.querySelector('#save-status');

if (form && status) {
  status.textContent = '可直接填写。按 Cmd+S（Windows/Linux：Ctrl+S）保存到原 HTML。';
  const fields = form.querySelectorAll('textarea[name]');
  function fit(field) {
    field.style.height = 'auto';
    const borders = field.offsetHeight - field.clientHeight;
    field.style.height = (field.scrollHeight + borders) + 'px';
  }

  for (const field of fields) {
    field.readOnly = false;
    field.style.overflowY = 'hidden';
    field.style.resize = 'none';
    fit(field);
  }
  window.addEventListener('resize', () => {
    for (const field of fields) fit(field);
  });

  form.addEventListener('input', ({ target }) => {
    if (!target.matches('textarea[name]')) return;
    fit(target);
    vscode.postMessage({ type: 'answer', name: target.name, value: target.value });
    status.textContent = '有改动，按 Cmd+S 保存。';
  });
  document.addEventListener('keydown', event => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's' || event.shiftKey) return;
    event.preventDefault();
    vscode.postMessage({ type: 'save' });
  });
  window.addEventListener('message', ({ data }) => {
    if (data.type === 'saved') status.textContent = '已保存到原 HTML';
    if (data.type === 'error') status.textContent = '无法保存：' + data.text;
  });
}
