import React from 'react'

export default function Component() {
    return (
        <div className='ciao'>
            <p className='ciao'/>
            <p
                className={clsx(
                    'block w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border block w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border',
                )}
            ></p>
            <p
                className={clsx(
                    'block w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border',
                    'another one',
                    true && 'another',
                )}
            ></p>
            <p
                className={`block w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border block w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border ${x}`}
            ></p>
            <p className={`${cond ? 'literal-class' : ''}`}></p>
            <p className={`x ${cond ? 'literal-class' : ''} z`}></p>

            <p className={'ciao sono un literal'}></p>
            <p className='a b c d e f g'></p>
        </div>
    )
}
