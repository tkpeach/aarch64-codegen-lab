# Learning Checkpoint Editor

Open checkpoint HTML from the VS Code Explorer, fill the rendered answer fields, and save the original HTML with Cmd+S or Ctrl+S. Use **Reopen Editor With… → Text Editor** to edit the lesson source.

## Build and install

From the project root, with Node.js and the VS Code CLI available:

```sh
mkdir -p evidence/vscode
(
  cd tools/vscode-learning-editor
  npx --yes @vscode/vsce package --allow-missing-repository \
    --out ../../evidence/vscode/learning-checkpoint-editor.vsix
)
code --install-extension evidence/vscode/learning-checkpoint-editor.vsix
```

The workspace associates only `learning/checkpoints/*.html` with this editor. If a checkpoint is open already, use **Reopen Editor With… → Learning Checkpoint**.

Lessons provide an `#answers` form, a `#save-status` element, and a unique `name` on each answer textarea. The editor updates only textarea contents in the underlying text document.
