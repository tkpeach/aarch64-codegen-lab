const vscode = require('vscode');
const { randomBytes } = require('node:crypto');

function answerRange(source, name) {
  if (typeof name !== 'string' || !/^[A-Za-z0-9_-]+$/.test(name)) return;
  const pattern = new RegExp(
    '(<textarea\\b[^>]*\\bname="' + name + '"[^>]*>)[\\s\\S]*?(?=</textarea>)',
    'g'
  );
  const [match, duplicate] = source.matchAll(pattern);
  if (match && !duplicate) return [match.index + match[1].length, match.index + match[0].length];
}

function render(source, webview, extensionUri) {
  const nonce = randomBytes(24).toString('hex');
  const script = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'editor.js'));
  const policy = "default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-" + nonce + "'";
  return source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="' + policy + '">')
    .replace('</body>', '<script nonce="' + nonce + '" src="' + script + '"></script></body>');
}

function activate(context) {
  const provider = {
    resolveCustomTextEditor(document, panel) {
      const { webview } = panel;
      webview.options = { enableScripts: true, localResourceRoots: [context.extensionUri] };
      const refresh = () => { webview.html = render(document.getText(), webview, context.extensionUri); };
      let applying = false;
      let queue = Promise.resolve();
      const receive = webview.onDidReceiveMessage(message => {
        queue = queue.then(async () => {
          if (message.type === 'save') {
            if (!await document.save()) throw new Error('VS Code did not save the HTML');
            return;
          }
          if (message.type !== 'answer' || typeof message.value !== 'string') return;
          const range = answerRange(document.getText(), message.name);
          if (!range) throw new Error('Answer field missing or duplicated');
          const value = '\n' + message.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const edit = new vscode.WorkspaceEdit();
          edit.replace(document.uri, new vscode.Range(...range.map(offset => document.positionAt(offset))), value);
          applying = true;
          try {
            if (!await vscode.workspace.applyEdit(edit)) throw new Error('VS Code rejected the answer edit');
          } finally {
            applying = false;
          }
        }).catch(error => {
          webview.postMessage({ type: 'error', text: error.message });
        });
      });
      const change = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === document && !applying && event.contentChanges.length) refresh();
      });
      const saved = vscode.workspace.onDidSaveTextDocument(file => {
        if (file === document) webview.postMessage({ type: 'saved' });
      });
      panel.onDidDispose(() => {
        receive.dispose();
        change.dispose();
        saved.dispose();
      });
      refresh();
    },
  };
  context.subscriptions.push(vscode.window.registerCustomEditorProvider(
    'repofoundry.learningCheckpoint', provider, { webviewOptions: { retainContextWhenHidden: true } }
  ));
}

module.exports = { activate, answerRange };
