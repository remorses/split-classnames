import React from 'react'

import clsx from 'classnames'

export default function Component() {
    return (
        <div>
            <p className='ciao'></p>
            <p className={clsx('a b c d e', 'f g')}></p>
            <p
                className={clsx(
                    'a b c d e',
                    'f g',
                    'another one',
                    true && 'another',
                )}
            ></p>
            <p className={clsx('ciao sono un template literal', x)}></p>
            <p className={clsx(cond ? 'literal-class' : '')}></p>
            <p className={clsx('x', cond ? 'literal-class' : '', 'z')}></p>

            <p className={clsx('ciao sono un literal')}></p>
            <p className={clsx('a b c d e', 'f g')}></p>
        </div>
    )
}