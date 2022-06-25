import _jscodeshift, { JSCodeshift } from 'jscodeshift'

const j: JSCodeshift = _jscodeshift.withParser('tsx')

const CLASSNAMES_IDENTIFIER_NAME = 'classNames'

// TODO make a sorter that does not sort based on chars length but instead creates groups, like group for md, lg, base, dark, hover, ...
function tailwindRank(a: string) {
    // a before b
    let rank = 0

    // a after b
    if (a.includes(':')) {
        rank += 1
    }

    // a after b
    if (a.includes('[')) {
        rank += 2
    }
    // keep order
    return rank
}

export function splitClassNames(
    className: string,
    maxClassLength: number = 60,
) {
    className = className.trim()
    if (className.length <= maxClassLength) {
        return null
    }
    const classes = className
        .split(/\s+/)
        .filter((name) => name.length > 0)
        .sort((a, b) => {
            const diff = tailwindRank(a) - tailwindRank(b)
            if (diff === 0) {
                return a < b ? 1 : -1
            }
            return diff
        })
    // console.log(classes)

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

    if (classGroups.length <= 1) {
        return null
    }

    return classGroups
}

// TODO you can also use https://github.com/dcastil/tailwind-merge to merge tailwind stuff

const possibleClassNamesImportNames = new Set([
    'classnames',
    'classNames',
    'clsx',
    'cc',
    'cx',
    'cs',
    'classcat',
])

const possibleClassNamesImportSources = new Set([
    'classnames',
    'clsx',
    'classcat',
])

// TODO custom function import source
const CLASSNAMES_IMPORT_SOURCE = 'classnames'

const meta: import('eslint').Rule.RuleMetaData = {
    type: 'problem',

    docs: {
        description: 'suggest using className() or clsx() in JSX className',
        category: 'Stylistic Issues',
        recommended: true,
        // url: documentUrl('prefer-classnames-function'),
    },

    fixable: 'code',

    schema: [
        {
            type: 'object',
            functionName: false,
            properties: {
                maxClassNameCharacters: {
                    type: 'number',
                },
                functionName: {
                    type: 'string',
                },
            },
        },
    ],
}

export type Opts = {
    maxClassNameCharacters?: number
    functionName?: string
}

export const rule: import('eslint').Rule.RuleModule = {
    meta,
    create(context) {
        const [params = {}] = context.options
        const { functionName, maxClassNameCharacters = 40 } = params
        let addedImport = false
        function report({
            replaceWith: replaceWith,
            message = '',
            node,
        }: {
            node: import('ast-types').ASTNode
            message?: string
            replaceWith?: import('ast-types').ASTNode
        }) {
            context.report({
                node: node as any,
                message: message || 'The className is too long.',
                data: {
                    functionName: params.functionName || 'clsx',
                },

                *fix(fixer) {
                    if (
                        !addedImport &&
                        shouldInsertCXImport &&
                        !existingClassNamesImportIdentifier &&
                        classNamesImportName
                    ) {
                        addedImport = true

                        yield fixer.insertTextBeforeRange(
                            [0, 0],
                            `import ${classNamesImportName} from '${CLASSNAMES_IMPORT_SOURCE}'\n`,
                        )
                    }
                    if (replaceWith) {
                        const newSource = j(replaceWith as any).toSource({
                            wrapColumn: 1000 * 10,
                            quote: 'single',
                        })
                        yield fixer.replaceText(node as any, newSource)
                    }
                },
            })
        }

        let existingClassNamesImportIdentifier: string
        let classNamesImportName: string
        let shouldInsertCXImport = false

        return {
            Program: (program) => {
                const ast = context.getSourceCode().ast
            },
            ImportDeclaration: (importDeclaration) => {
                // check if user has already imported the classnames function
                if (
                    possibleClassNamesImportSources.has(
                        importDeclaration.source?.value as string,
                    )
                ) {
                    const defaultImport = j(importDeclaration as any)
                        .find(j.ImportDefaultSpecifier)
                        .get()
                    existingClassNamesImportIdentifier =
                        defaultImport.node.local.name
                }
            },
            JSXAttribute: function reportAndReset(node) {
                classNamesImportName =
                    existingClassNamesImportIdentifier ||
                    functionName ||
                    CLASSNAMES_IDENTIFIER_NAME
                try {
                    if (
                        node.name.name !== 'className' &&
                        node.name.name !== 'class'
                    ) {
                        return
                    }

                    // simple literals or literals inside expressions
                    if (node?.value?.type === 'Literal') {
                        const literal = j(node).find(j.Literal).get()
                        // const literal = path.value.

                        const splitted = splitClassNames(
                            literal.value?.value,
                            maxClassNameCharacters,
                        )
                        if (!splitted) {
                            return
                        }
                        const cxArguments = splitted.map((s) => j.literal(s))
                        // don't add the classnames if className attr is short enough
                        if (cxArguments.length <= 1) {
                            return
                        }
                        shouldInsertCXImport = true
                        report({
                            node: literal.node,

                            replaceWith: j.jsxExpressionContainer(
                                j.callExpression(
                                    j.identifier(classNamesImportName),
                                    cxArguments,
                                ),
                            ),
                        })
                    }
                    // string literal inside expressions
                    if (
                        node?.value?.type === 'JSXExpressionContainer' &&
                        node?.value?.expression?.type === 'Literal'
                    ) {
                        shouldInsertCXImport = true
                        const literal = j(node).find(j.Literal).get()

                        const cxArguments = splitClassNames(
                            literal.value?.value,
                            maxClassNameCharacters,
                        )?.map((s) => j.literal(s))
                        if (!cxArguments) {
                            return
                        }
                        report({
                            node: literal.node,

                            replaceWith: j.callExpression(
                                j.identifier(classNamesImportName),
                                cxArguments,
                            ),
                        })
                    }

                    // template literal

                    if (
                        node.value.type === 'JSXExpressionContainer' &&
                        node.value.expression.type === 'TemplateLiteral'
                    ) {
                        shouldInsertCXImport = true
                        const templateLiteral = j(node)
                            .find(j.TemplateLiteral)
                            .get()
                        const { quasis, expressions } = templateLiteral.node
                        let cxArguments: any[] = []
                        let shouldReport = false
                        quasis.forEach((quasi, index) => {
                            if (quasi.value.raw.trim()) {
                                const classNames = splitClassNames(
                                    quasi.value.raw,
                                    maxClassNameCharacters,
                                )
                                if (classNames) {
                                    shouldReport = true
                                    cxArguments.push(
                                        ...classNames.map((className) =>
                                            j.literal(className),
                                        ),
                                    )
                                } else {
                                    cxArguments.push(j.literal(quasi.value.raw))
                                }
                            }
                            if (expressions[index] !== undefined) {
                                cxArguments.push(expressions[index])
                            }
                        })
                        if (shouldReport) {
                            report({
                                node: node.value,

                                replaceWith: fixArguments(
                                    j.jsxExpressionContainer(
                                        j.callExpression(
                                            j.identifier(classNamesImportName),
                                            cxArguments,
                                        ),
                                    ),
                                ),
                            })
                        }
                    }

                    // classnames arguments too long
                    // regroups together classnames literal arguments and splits them in groups of maxClassNameCharacters (reordered using tailwindSort)
                    const usedClassNameFn =
                        node?.value?.expression?.callee?.name
                    if (
                        node?.value?.type === 'JSXExpressionContainer' &&
                        node?.value?.expression?.type === 'CallExpression' &&
                        possibleClassNamesImportNames.has(usedClassNameFn)
                    ) {
                        const replaceWith = fixArguments(node)
                        if (replaceWith) {
                            report({
                                message: `The ${usedClassNameFn} arguments are not canonically organized.`,
                                node: node.value,
                                replaceWith,
                            })
                        }
                    }

                    function fixArguments(node) {
                        const callExpression = j(node)
                            .find(j.CallExpression)
                            .get()

                        const classNamesImportName =
                            callExpression.value.callee.name
                        let literalParts: string[] = []
                        let nonLiteralParts: string[] = []
                        callExpression.value.arguments.forEach((arg) => {
                            if (arg.type === 'Literal') {
                                literalParts.push(arg.value)
                            } else {
                                // TODO maybe support template literals in function arguments
                                nonLiteralParts.push(arg)
                            }
                        })
                        const splitted = splitClassNames(
                            literalParts.join(' '),
                            maxClassNameCharacters,
                        )

                        const changed =
                            splitted &&
                            splitted.some((x, i) => {
                                const diff =
                                    literalParts[i] && x !== literalParts[i]
                                // if (diff) {
                                //     console.log(literalParts[i], '-', x)
                                // }
                                return diff
                            })

                        if (changed) {
                            const newArgs: any[] = [
                                ...splitted.map((s) => j.literal(s)),
                                ...nonLiteralParts,
                            ]
                            const replaceWith = j.jsxExpressionContainer(
                                j.callExpression(
                                    j.identifier(classNamesImportName),
                                    newArgs,
                                ),
                            )
                            return replaceWith
                        }
                    }
                } catch (e) {
                    throw new Error(`could not report for class names, ` + e)
                }
            },
        }
    },
}
