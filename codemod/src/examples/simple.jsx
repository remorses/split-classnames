import React from 'react'

export default function Component() {
    return (
        <div>
            <p className='ciao'></p>
            <p className={clsx('a b c d e f g')}></p>
            <p
                className={clsx(
                    'a b c d e f g',
                    'another one',
                    true && 'another',
                )}
            ></p>
            <p className={`ciao sono un template literal ${x}`}></p>
            <p className={`${cond ? 'literal-class' : ''}`}></p>
            <p className={`x ${cond ? 'literal-class' : ''} z`}></p>

            <p className={'ciao sono un literal'}></p>
            <p className='a b c d e f g'></p>
        </div>
    )
}
