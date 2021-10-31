import * as vscode from 'vscode'

import { transformSource } from 'codemod-split-classnames'
const config = vscode.workspace.getConfiguration()

const SPLIT_CLASSNAMES_COMMAND = 'vscode-extension.splitClassNames'

const allowedLanguageIds = new Set([
    'typescript',
    'typescriptreact',
    'javascript',
    'javascriptreact',
])

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension active')

    let disposable1 = vscode.commands.registerTextEditorCommand(
        SPLIT_CLASSNAMES_COMMAND,
        function (editor, edit) {
            const editorText = editor.document.getText()
            const editorLangId = editor.document.languageId
            if (!allowedLanguageIds.has(editorLangId)) {
                vscode.window.showWarningMessage(
                    `${editorLangId} is not supported by vscode-extension`,
                )
                return
            }
            const range = new vscode.Range(
                editor.document.positionAt(0),
                editor.document.positionAt(editorText.length),
            )
            try {
                const result = transformSource(editorText, {})
                edit.replace(range, result)
            } catch (e: any) {
                vscode.window.showErrorMessage(
                    `Error splitting classnames: ${e.message}`,
                )
            }
            // TODO run prettier formatting if prettier config is found? Maybe try running prettier command from vscode?
        },
    )
    context.subscriptions.push(disposable1)

    if (config.get('vscode-extension.runOnSave')) {
        context.subscriptions.push(
            vscode.workspace.onWillSaveTextDocument((_e) => {
                if (!allowedLanguageIds.has(_e.document.languageId)) {
                    return
                }
                vscode.commands.executeCommand(SPLIT_CLASSNAMES_COMMAND)
            }),
        )
    }
}

export function deactivate() {}
