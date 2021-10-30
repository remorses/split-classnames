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

const CLASSNAMES_IDENTIFIER_NAME = 'cx'

const getClassNames = (string) => {
    return string
        .trim()
        .split(/\s/)
        .filter((name) => name.length > 0)
}

const isFalsyNodeValue = (node) =>
    (node.type === 'StringLiteral' && !node.value) ||
    node.type === 'NullLiteral' ||
    (node.type === 'Identifier' && node.name === 'undefined')

const _createObjectExpression = (j) => (entries) => {
    return j.objectExpression(
        entries.map(([property, value]) =>
            j.objectProperty.from({
                key: property,
                value,
                computed: true,
            }),
        ),
    )
}

const _createLiteral = (j) => (className) => {
    return j.literal(className)
}

const _createCxCallExpression = (j) => (args, classNamesIdentifier) => {
    return j.callExpression(j.identifier(classNamesIdentifier), args)
}

const _createImportDeclaration = (j) => (identifierName, source) => {
    return j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(identifierName))],
        j.stringLiteral(source),
    )
}

const _getLastLibImport = (j) => (ast) => {
    let firstImport = null
    let lastLibImport = null
    const importDeclarations = ast.find(j.ImportDeclaration)

    importDeclarations.forEach((path, i) => {
        const importSource = path.node.source.value
        if (i === 0) {
            firstImport = path
        }
        if (importSource.charAt(0) !== '.') {
            lastLibImport = path
        }
    })
    return lastLibImport || firstImport
}

const _getClassNamesIdentifierName = (j) => (ast) => {
    const importDeclarations = ast.find(j.ImportDeclaration, {
        type: 'ImportDeclaration',
        source: {
            value: 'classnames',
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

function splitClassNames(className: string, maxClassesPerGroup: number = 5) {
    const classes = className.split(/\s+/).filter((name) => name.length > 0)
    if (classes.length <= maxClassesPerGroup) {
        return [className.trim()]
    }
    const classGroups: string[] = []
    for (let i = 0; i < classes.length; i += maxClassesPerGroup) {
        classGroups.push(classes.slice(i, i + maxClassesPerGroup).join(' '))
    }
    return classGroups
}

export function transformer(
    fileInfo,
    api,
    options: Options & {
        classAttrName?: string
        classnamesImport?: string
        logicalExp?: boolean
        conditionalExp?: boolean
        falsyConditionalExp?: boolean
    },
) {
    try {
        const filePath = fileInfo.path
        const j: JSCodeshift = api.jscodeshift
        const createLiteral = _createLiteral(j)
        const createCxCallExpression = _createCxCallExpression(j)
        const createImportDeclaration = _createImportDeclaration(j)
        const createObjectExpression = _createObjectExpression(j)
        const getClassNamesIdentifierName = _getClassNamesIdentifierName(j)

        const ast: Collection = j(fileInfo.source)

        const transformLogicalExp = options.logicalExp
        const transformConditionalExpression = options.conditionalExp
        const transformFalsyConditionalExp = options.falsyConditionalExp
        const classAttrName = [
            'className',
            // ...(options.classAttrName || '').split(','),
        ]

        const existingClassNamesImportIdentifer =
            getClassNamesIdentifierName(ast)
        const classNamesImportName =
            existingClassNamesImportIdentifer ||
            options.classnamesImport ||
            CLASSNAMES_IDENTIFIER_NAME

        const lastLibImport: any = _getLastLibImport(j)(ast)
        let shouldInsertCXImport = false

        classAttrName.forEach((classAttrName) => {
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
                    j.jsxExpressionContainer(
                        j.callExpression(
                            j.identifier(classNamesImportName),
                            cxArguments,
                        ),
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
                    console.log('raw', quasi.value.raw)
                    if (quasi.value.raw.trim()) {
                        const classNames = splitClassNames(quasi.value.raw)
                        cxArguments.push(...classNames.map(createLiteral))
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
            ast.find(j.JSXAttribute, {
                type: 'JSXAttribute',
                name: {
                    type: 'JSXIdentifier',
                    name: classAttrName,
                },
                value: {
                    type: 'JSXExpressionContainer',
                    expression: {
                        type: 'CallExpression',
                        callee: { name: classNamesImportName },
                    },
                },
            }).forEach((path) => {
                shouldInsertCXImport = true
                const callExpression = j(path).find(j.CallExpression).get()
                const newArgs: any[] = []
                console.log({ callExpression })
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
                    j.jsxExpressionContainer(
                        j.callExpression(
                            j.identifier(classNamesImportName),
                            newArgs,
                        ),
                    ),
                )
            })
        })

        if (!existingClassNamesImportIdentifer && shouldInsertCXImport) {
            lastLibImport.insertAfter(
                createImportDeclaration(classNamesImportName, 'classnames'),
            )
        }
        return ast.toSource(options as any)
    } catch (e) {
        console.error(e)
        throw e
    }
}
