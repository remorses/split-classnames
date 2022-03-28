import clsx from 'classnames'
function Component(x) {
    return (
        <Fragment>
            <p
                className={clsx(
                    'block w-full py-2 mt-8 text-sm font-semibold text-center text-white',
                    'bg-gray-900 border border-black rounded-md w-[340px] disabled:opacity-60',
                    'hover:cursor-pointer disabled:bg-gray-900 hover:bg-gray-700 sm:h-[60em]',
                )}
            />
        </Fragment>
    )
}
