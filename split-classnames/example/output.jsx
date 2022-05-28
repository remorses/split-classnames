import clsx from 'classnames'
function Component() {
    return (
        <Fragment>
            <p
                className={clsx(
                    'block w-full py-2 mt-8 text-sm font-semibold text-center',
                    'text-white bg-gray-900 border border-black rounded-md',
                    'hover:bg-gray-700 disabled:opacity-60 hover:cursor-pointer',
                    'disabled:bg-gray-900',
                )}
            />
        </Fragment>
    )
}
