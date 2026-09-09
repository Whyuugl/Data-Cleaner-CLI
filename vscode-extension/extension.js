const vscode = require('vscode');

const { scan } = require('../src/core/scanner');
const { sanitize } = require('../src/core/sanitizer');

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(255, 193, 7, 0.22)',
  border: '1px solid rgba(255, 193, 7, 0.65)'
});

function rangeFor(document, detection) {
  const start = document.positionAt(detection.index);
  const end = document.positionAt(detection.index + detection.value.length);

  return new vscode.Range(start, end);
}

function activeEditor() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage('DevSanitize: no active file.');
    return null;
  }

  return editor;
}

function scanCurrentFile() {
  const editor = activeEditor();

  if (!editor) return;

  const detections = scan(editor.document.getText());

  editor.setDecorations(
    decorationType,
    detections.map(detection => ({
      range: rangeFor(editor.document, detection),
      hoverMessage: `[${detection.severity.toUpperCase()}] ${detection.type}: ${detection.preview}`
    }))
  );

  vscode.window.showInformationMessage(
    detections.length === 0
      ? 'DevSanitize: no sensitive data detected.'
      : `DevSanitize: ${detections.length} sensitive value(s) detected.`
  );
}

async function scrubCurrentFile() {
  const editor = activeEditor();

  if (!editor) return;

  const result = sanitize(editor.document.getText());

  if (result.detections.length === 0) {
    vscode.window.showInformationMessage('DevSanitize: no sensitive data detected.');
    return;
  }

  const fullRange = new vscode.Range(
    editor.document.positionAt(0),
    editor.document.positionAt(editor.document.getText().length)
  );

  await editor.edit(editBuilder => {
    editBuilder.replace(fullRange, result.output);
  });

  editor.setDecorations(decorationType, []);
  vscode.window.showInformationMessage(
    `DevSanitize: ${result.detections.length} sensitive value(s) scrubbed.`
  );
}

function activate(context) {
  context.subscriptions.push(
    decorationType,
    vscode.commands.registerCommand('devsanitize.scanCurrentFile', scanCurrentFile),
    vscode.commands.registerCommand('devsanitize.scrubCurrentFile', scrubCurrentFile)
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
