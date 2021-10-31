import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
    console.log(
        'Congratulations, your extension "vscode-extension" is now active!',
    )

    let disposable = vscode.commands.registerCommand(
        'vscode-extension.helloWorld',
        () => {
            vscode.window.showInformationMessage(
                'Hello World from vscode-extension!',
            )
        },
    )

    context.subscriptions.push(disposable)
}

export function deactivate() {}
