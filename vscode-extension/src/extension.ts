import * as vscode from 'vscode'
import Conf from 'conf'
import fetch from 'node-fetch'

import { transformSource } from 'codemod-split-classnames'
const config = vscode.workspace.getConfiguration()

const SPLIT_CLASSNAMES_COMMAND = 'vscode-extension.splitClassNames'

const allowedLanguageIds = new Set([
    'typescript',
    'typescriptreact',
    'javascript',
    'javascriptreact',
])

const GUMROAD_PERMALINK = 'nNrvI'

async function validateLicenseKey(key: string) {
    const response = await fetch(`https://api.gumroad.com/v2/licenses/verify`, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            product_permalink: GUMROAD_PERMALINK,
            license_key: key,
        }),
        method: 'POST',
    })

    const data: any = await response.json()
    if (data?.success) {
        return true
    } else {
        return false
    }
}

async function promptLicenseKey(extensionConfig: Conf, prompt: string) {
    const res = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        password: false,
        placeHolder: '00000000-00000000-00000000-00000000',
        prompt,
    })
    const valid = await validateLicenseKey(res || '')
    if (valid) {
        extensionConfig.set('licenseKey', res)
        vscode.window.showInformationMessage(
            'License key for split-classnames saved!',
        )
        return true
    } else {
        vscode.window.showErrorMessage(
            'Invalid license key for split-classnames',
        )
        return false
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension active')
    const extensionConfig = new Conf({ projectName: 'vscode-split-classnames' })
    const licenseKey = extensionConfig.get<string>('licenseKey') as any
    let validLicense = true
    Promise.resolve().then(async function validateOnStartup() {
        if (!licenseKey) {
            const success = await promptLicenseKey(
                extensionConfig,
                'Enter the Gumroad license key for vscode-split-classnames to use the extension',
            )
            if (!success) {
                validLicense = false
            }
        } else {
            const valid = await validateLicenseKey(licenseKey)
            if (!valid) {
                const success = await promptLicenseKey(
                    extensionConfig,
                    'Saved license key is invalid, please enter new license key for split-sclassnames',
                )
                if (!success) {
                    validLicense = false
                }
            }
        }
    })

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand(
            SPLIT_CLASSNAMES_COMMAND,
            function (editor, edit) {
                if (!validLicense) {
                    return
                }
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
        ),
    )

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-extension.inputLicenseKey',
            () => {
                promptLicenseKey(
                    extensionConfig,
                    'Enter the Gumroad license key for vscode-split-classnames',
                )
            },
        ),
    )

    if (config.get('vscode-extension.runOnSave')) {
        context.subscriptions.push(
            vscode.workspace.onWillSaveTextDocument((_e) => {
                if (!validLicense) {
                    return
                }
                if (!allowedLanguageIds.has(_e.document.languageId)) {
                    return
                }
                vscode.commands.executeCommand(SPLIT_CLASSNAMES_COMMAND)
            }),
        )
    }
}

export function deactivate() {}
