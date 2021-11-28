import {
    API,
    Collection,
    FileInfo,
    JSCodeshift,
    Options,
    JSXAttribute,
    ImportDeclaration,
} from 'jscodeshift'
import { Rule } from 'eslint'
import clone from 'clone'
import _jscodeshift from 'jscodeshift'
import { generate } from 'astring'

import { builders as b } from 'ast-types'
const j: JSCodeshift = _jscodeshift

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
    // keep order
    return 0
}

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

// TODO you can also use https://github.com/dcastil/tailwind-merge to merge tailwind stuff

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

const possibleClassNamesImportSources = new Set([
    'classnames',
    'clsx',
    'classcat',
])

const CLASSNAMES_IMPORT_SOURCE = 'classnames'

export function transformer(
    {
        source: eslintAst,
        report,
    }: {
        source: any
        report: (x: {
            node: import('ast-types').ASTNode
            replaceWith?: import('ast-types').ASTNode
            insertBefore?: import('ast-types').ASTNode
        }) => void
    },
    {
        functionName,
        skipImportDeclaration = false,
        ...options
    }: {
        functionName?: string
        skipImportDeclaration?: boolean
    },
) {
    try {
        function createImportDeclaration(identifierName, source) {
            return j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier(identifierName))],
                j.literal(source),
            )
        }

        const getClassNamesIdentifierName = (ast) => {
            const importDeclarations = ast.find(
                j.ImportDeclaration,
                (node: ImportDeclaration) =>
                    node.type === 'ImportDeclaration' &&
                    possibleClassNamesImportSources.has(
                        node.source?.value as string,
                    ),
            )

            if (importDeclarations.length >= 1) {
                const importDeclaration = importDeclarations.get()
                const defaultImport = j(importDeclaration)
                    .find(j.ImportDefaultSpecifier)
                    .get()

                return defaultImport.node.local.name
            }
            return null
        }

        const ast: Collection = j(eslintAst)

        const classAttrNames = ['className', 'class']
            .map((x) => x.trim())
            .filter(Boolean)

        const existingClassNamesImportIdentifier =
            getClassNamesIdentifierName(ast)
        const classNamesImportName =
            existingClassNamesImportIdentifier ||
            functionName ||
            CLASSNAMES_IDENTIFIER_NAME


        let shouldInsertCXImport = false

        for (const classAttrName of classAttrNames) {
            // simple literals or literals inside expressions
            ast.find(
                j.JSXAttribute,
                (attr: JSXAttribute) =>
                    attr.name.name === classAttrName &&
                    attr?.value?.type === 'Literal',
            ).forEach((path) => {
                const literal = j(path).find(j.Literal).get()
                // const literal = path.value.

                const cxArguments = splitClassNames(literal.value?.value).map(
                    (s) => j.literal(s),
                )
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
            })
            // string literal inside expressions
            ast.find(
                j.JSXAttribute,
                (attr: JSXAttribute) =>
                    attr.name.name === classAttrName &&
                    attr?.value?.type === 'JSXExpressionContainer' &&
                    attr?.value?.expression?.type === 'Literal',
            ).forEach((path) => {
                shouldInsertCXImport = true
                const literal = j(path).find(j.Literal).get()

                const cxArguments = splitClassNames(literal.value?.value).map(
                    (s) => j.literal(s),
                )
                report({
                    node: literal.node,
                    replaceWith: j.callExpression(
                        j.identifier(classNamesImportName),
                        cxArguments,
                    ),
                })
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
                report({
                    node: templateLiteral.node,
                    replaceWith: j.callExpression(
                        j.identifier(classNamesImportName),
                        cxArguments,
                    ),
                })
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
                    if (arg.type === 'Literal') {
                        const newCxArguments = splitClassNames(arg.value).map(
                            (s) => j.literal(s),
                        )
                        newArgs.push(...newCxArguments)
                    } else {
                        newArgs.push(arg)
                    }
                })

                report({
                    node: callExpression.node,
                    replaceWith: j.callExpression(
                        j.identifier(classNamesImportName),
                        newArgs,
                    ),
                })
            })
        }
        return
        if (
            !skipImportDeclaration &&
            !existingClassNamesImportIdentifier &&
            shouldInsertCXImport
        ) {
            report({
                node: findProgramNode(ast)?.value?.body?.[0],
                insertBefore: createImportDeclaration(
                    classNamesImportName,
                    CLASSNAMES_IMPORT_SOURCE,
                ),
            })
            // findProgramNode(ast)?.value?.body?.unshift(
            //     createImportDeclaration(
            //         classNamesImportName,
            //         CLASSNAMES_IMPORT_SOURCE,
            //     ),
            // )
        }
        return ast.toSource({ ...options, parser: 'tsx' })
    } catch (e) {
        console.error(e)
        throw e
    }
}

const meta: import('eslint').Rule.RuleMetaData = {
    type: 'suggestion',

    docs: {
        description: 'suggest using className() or clsx() in JSX className',
        category: 'Stylistic Issues',
        recommended: true,
        // url: documentUrl('prefer-classnames-function'),
    },

    fixable: 'code',

    messages: {
        useFunction:
            'The className has more than {{ maxSpaceSeparetedClasses }} classes. Use {{ functionName }}() instead.',
        avoidFunction:
            'Do not use {{ functionName }}() when you have no greater than {{ maxSpaceSeparetedClasses }} classes.',
    },

    schema: [
        {
            type: 'object',
            functionName: false,
            properties: {
                maxSpaceSeparetedClasses: {
                    type: 'number',
                },
                functionName: {
                    type: 'string',
                },
            },
        },
    ],
}

export const rule: import('eslint').Rule.RuleModule = {
    meta,
    create(context) {
        const [params = {}] = context.options

        function report({
            replaceWith: replaceWith,
            insertBefore,
            node,
        }: {
            node: import('ast-types').ASTNode
            replaceWith?: import('ast-types').ASTNode
            insertBefore?: import('ast-types').ASTNode
        }) {
            context.report({
                node: node as any,
                message:
                    'The className is too long. Use {{ functionName }}() instead.',
                data: {
                    functionName: params.functionName || 'clsx',
                },

                *fix(fixer) {
                    if (replaceWith) {
                        const newSource = j(replaceWith as any).toSource()
                        console.log({ newSource })
                        return fixer.replaceText(node as any, newSource)
                    }
                    if (insertBefore) {
                        return fixer.insertTextBefore(
                            node as any,
                            j(insertBefore as any).toSource() + '\n',
                        )
                    }
                    throw new Error(
                        'Neither insertBefore of replaceWith passed',
                    )
                },
            })
        }
        
        return {
            'Program:exit': function reportAndReset(node) {
                const ast = context.getSourceCode().ast

                console.log(findProgramNode(j(ast as any)).body)

                const transformed = transformer(
                    {
                        source: clone(ast),
                        report({
                            replaceWith: replaceWith,
                            insertBefore,
                            node,
                        }) {
                            context.report({
                                node: node as any,
                                message:
                                    'The className is too long. Use {{ functionName }}() instead.',
                                data: {
                                    functionName: params.functionName || 'clsx',
                                },
                                fix(fixer) {
                                    if (replaceWith) {
                                        return fixer.replaceText(
                                            node as any,
                                            j(replaceWith as any).toSource(),
                                        )
                                    }
                                    if (insertBefore) {
                                        return fixer.insertTextBefore(
                                            node as any,
                                            j(insertBefore as any).toSource() +
                                                '\n',
                                        )
                                    }
                                    throw new Error(
                                        'Neither insertBefore of replaceWith passed',
                                    )
                                },
                            })
                        },
                    },
                    params,
                )
                // console.log(transformed)
            },
        }
    },
}

function findProgramNode(root): any {
    let result = null

    root.forEach((p) => {
        let parent = p

        while (parent.parent != null && parent.parent.value.body == null) {
            parent = parent.parent
        }

        result = parent
    })

    return result
}
