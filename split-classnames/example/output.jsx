import clsx from 'classnames'
function Component() {
    return (
        <Fragment>
            <p
                className={clsx(
                    'block w-full py-2 mt-8 text-sm font-semibold text-center',
                    'text-white bg-gray-900 border border-black rounded-md',
                    'disabled:bg-gray-900 hover:cursor-pointer',
                    'disabled:opacity-60',
                    'hover:bg-gray-700',
                )}
            />
        </Fragment>
    )
}
