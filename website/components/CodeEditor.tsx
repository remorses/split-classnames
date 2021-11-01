import React from 'react'
import Editor from 'react-simple-code-editor'
import classNames from 'classnames'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
// import 'prismjs/themes/prism.css'

export function CodeEditor({
    code,
    className = '',
    onChange = (x) => {},
    readOnly = false,
}) {
    function hl(code) {
        try {
            return highlight(code, languages.tsx, 'typescript')
        } catch (e) {
            return code
        }
    }
    return (
        <div className='overflow-x-auto text-gray-100 max-w-screen-lg flex  flex-col'>
            <style jsx>{`
                textarea,
                code,
                pre {
                    white-space: pre !important;
                }
            `}</style>

            <Editor
                className={classNames(
                    '!focus:outline-none shadow-xl relative px-8 py-8 my-6 bg-gray-800 !border-transparent rounded-lg flex-shrink-0 ',
                    className,
                )}
                preClassName='!focus:outline-none'
                textareaClassName='!focus:outline-none'
                value={code}
                onValueChange={onChange}
                highlight={hl}
                padding={20}
                readOnly={readOnly}
                style={{
                    backgroundColor: '#17102B',
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                }}
            />
        </div>
    )
}
