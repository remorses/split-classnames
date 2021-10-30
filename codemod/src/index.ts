export const DEFAULT_JSC_OPTIONS = {
    parser: 'tsx',
}
import {
    API,
    Collection,
    FileInfo,
    JSCodeshift,
    Options,
    JSXAttribute,
} from 'jscodeshift'

const CLASSNAMES_IDENTIFIER_NAME = 'clsx'

function tailwindSort(a: string, b: string) {
    // a before b
    if (b.includes(':')) {
        return -1
    }
    // a after b
    if (a.includes(':')) {
        return 1
    }
    // a before b
    if (b.includes('[')) {
        return -1
    }
    // a after b
    if (a.includes('[')) {
        return 1
    }
    // a must be equal to b
    return 0
}

// TODO group classes by tailwind type (e.g. flex, grid, font and text, etc)
// groups are: defaults, md, lg, .etc, :dark, :hover, :focus, :active, :disabled
export function splitClassNames(
    className: string,
    maxClassLength: number = 60,
) {
    className = className.trim()
    if (className.length <= maxClassLength) {
        return [className]
    }
    const classes = className
        .split(/\s+/)
        .filter((name) => name.length > 0)
        .sort(tailwindSort)

    const classGroups: string[] = []
    let currentSize = 0
    let lastAddedIndex = 0

    for (let i = 0; i < classes.length; i += 1) {
        currentSize += classes[i].length
        if (currentSize >= maxClassLength || i === classes.length - 1) {
            classGroups.push(classes.slice(lastAddedIndex, i + 1).join(' '))
            lastAddedIndex = i + 1
            currentSize = 0
        }
    }

    return classGroups
}

// TODO support out of the box popular classnames libraries: clsx, classnames, etc.
// i can do this because i only change stuff inside className attribute, this is almost always a classnames implementation
// user can also give a priority implementation to use
// you can also use https://github.com/dcastil/tailwind-merge to merge tailwind stuff

// TODO let user choose if always add the clsx call instead of leaving short literals classes

const possibleClassNamesImportNames = new Set([
    'classnames',
    'classNames',
    'clsx',
    'cc',
    'cx',
    'cs',
    'classcat',
])

const CLASSNAMES_IMPORT_SOURCE = 'classnames'

export function transformer(
    fileInfo,
    api,
    options: Options & {
        classAttrNames?: string
        classnamesImport?: string
    },
) {
    try {
        const filePath = fileInfo.path
        const j: JSCodeshift = api.jscodeshift

        function createImportDeclaration(identifierName, source) {
            return j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier(identifierName))],
                j.stringLiteral(source),
            )
        }

        const getClassNamesIdentifierName = (ast) => {
            const importDeclarations = ast.find(j.ImportDeclaration, {
                type: 'ImportDeclaration',
                source: {
                    value: CLASSNAMES_IMPORT_SOURCE,
                },
            })

            if (importDeclarations.length === 1) {
                const importDeclaration = importDeclarations.get()
                const defaultImport = j(importDeclaration)
                    .find(j.ImportDefaultSpecifier)
                    .get()

                return defaultImport.node.local.name
            }
            return null
        }

        const ast: Collection = j(fileInfo.source)

        const classAttrNames = [
            'className',
            ...(options.classAttrNames || '').split(','),
        ]
            .map((x) => x.trim())
            .filter(Boolean)

        const existingClassNamesImportIdentifier =
            getClassNamesIdentifierName(ast)
        const classNamesImportName =
            existingClassNamesImportIdentifier ||
            options.classnamesImport ||
            CLASSNAMES_IDENTIFIER_NAME

        const lastLibImport: any = (() => {
            let firstImport
            let lastLibImport
            const importDeclarations = ast.find(j.ImportDeclaration)

            importDeclarations.forEach((path, i) => {
                const importSource = path.node.source.value as string
                if (i === 0) {
                    firstImport = path
                }
                if (importSource?.charAt(0) !== '.') {
                    lastLibImport = path
                }
            })
            return lastLibImport || firstImport
        })()

        let shouldInsertCXImport = false

        for (const classAttrName of classAttrNames) {
            // simple literals or literals inside expressions
            ast.find(
                j.JSXAttribute,
                (attr: JSXAttribute) =>
                    attr.name.name === classAttrName &&
                    attr?.value?.type === 'StringLiteral',
            ).forEach((path) => {
                const literal = j(path).find(j.StringLiteral).get()

                const cxArguments = splitClassNames(literal.value?.value).map(
                    (s) => j.stringLiteral(s),
                )
                // don't add the classnames if className attr is short enough
                if (cxArguments.length <= 1) {
                    return
                }
                shouldInsertCXImport = true
                j(literal).replaceWith(
                    j.jsxExpressionContainer(
                        j.callExpression(
                            j.identifier(classNamesImportName),
                            cxArguments,
                        ),
                    ),
                )
            })
            // string literal inside expressions
            ast.find(
                j.JSXAttribute,
                (attr: JSXAttribute) =>
                    attr.name.name === classAttrName &&
                    attr?.value?.type === 'JSXExpressionContainer' &&
                    attr?.value?.expression?.type === 'StringLiteral',
            ).forEach((path) => {
                shouldInsertCXImport = true
                const literal = j(path).find(j.StringLiteral).get()

                const cxArguments = splitClassNames(literal.value?.value).map(
                    (s) => j.stringLiteral(s),
                )
                j(literal).replaceWith(
                    j.callExpression(
                        j.identifier(classNamesImportName),
                        cxArguments,
                    ),
                )
            })

            // template literal
            ast.find(j.JSXAttribute, {
                type: 'JSXAttribute',
                name: {
                    type: 'JSXIdentifier',
                    name: classAttrName,
                },
                value: {
                    type: 'JSXExpressionContainer',
                    expression: {
                        type: 'TemplateLiteral',
                    },
                },
            }).forEach((path) => {
                shouldInsertCXImport = true
                const templateLiteral = j(path).find(j.TemplateLiteral).get()
                const { quasis, expressions } = templateLiteral.node
                let cxArguments: any[] = []
                quasis.forEach((quasi, index) => {
                    if (quasi.value.raw.trim()) {
                        const classNames = splitClassNames(quasi.value.raw)
                        cxArguments.push(
                            ...classNames.map((className) =>
                                j.literal(className),
                            ),
                        )
                    }
                    if (expressions[index] !== undefined) {
                        cxArguments.push(expressions[index])
                    }
                })
                j(templateLiteral).replaceWith(
                    j.callExpression(
                        j.identifier(classNamesImportName),
                        cxArguments,
                    ),
                )
            })

            // classnames arguments too long
            ast.find(
                j.JSXAttribute,

                (attr: JSXAttribute) =>
                    attr.name.name === classAttrName &&
                    attr?.value?.type === 'JSXExpressionContainer' &&
                    attr?.value?.expression?.type === 'CallExpression' &&
                    possibleClassNamesImportNames.has(
                        // @ts-ignore
                        attr?.value?.expression?.callee?.name,
                    ),
            ).forEach((path) => {
                const callExpression = j(path).find(j.CallExpression).get()
                const newArgs: any[] = []
                const classNamesImportName = callExpression.value.callee.name
                callExpression.value.arguments.forEach((arg) => {
                    if (arg.type === 'StringLiteral') {
                        const newCxArguments = splitClassNames(arg.value).map(
                            (s) => j.stringLiteral(s),
                        )
                        newArgs.push(...newCxArguments)
                    } else {
                        newArgs.push(arg)
                    }
                })

                j(callExpression).replaceWith(
                    j.callExpression(
                        j.identifier(classNamesImportName),
                        newArgs,
                    ),
                )
            })
        }

        if (!existingClassNamesImportIdentifier && shouldInsertCXImport) {
            if (lastLibImport) {
                lastLibImport.insertAfter(
                    createImportDeclaration(
                        classNamesImportName,
                        CLASSNAMES_IMPORT_SOURCE,
                    ),
                )
            } else {
                ast.get().node.program.body.unshift(
                    createImportDeclaration(
                        classNamesImportName,
                        CLASSNAMES_IMPORT_SOURCE,
                    ),
                )
            }
        }
        return ast.toSource(options as any)
    } catch (e) {
        // console.error(e)
        throw e
    }
}
