<div align='center'>
    <br/>
    <br/>
    <img src='' width='320px'>
    <br/>
    <h1></h1>
    <p>Splits long className attributes into shorter calls to `classnames`</p>
    <br/>
    <br/>
</div>

## Example

```tsx
function Component() {
    return (
        <Fragment>
            <p className='block w-full py-2 mt-8 text-sm font-semibold text-center text-white bg-gray-900 border border-black rounded-md hover:bg-gray-700 disabled:bg-gray-900 hover:cursor-pointer disabled:opacity-60' />
        </Fragment>
    )
}
```

becomes

```tsx
import clsx from 'classnames'
function Component() {
    return (
        <Fragment>
            <p
                className={clsx(
                    'block w-full py-2 mt-8 text-sm',
                    'font-semibold text-center text-white bg-gray-900 border',
                    'border-black rounded-md hover:bg-gray-700 disabled:bg-gray-900 hover:cursor-pointer',
                    'disabled:opacity-60',
                )}
            />
        </Fragment>
    )
}
```

## Features

-   Works on simple string literals (`className='something'`)
-   Works on template literals (`className={`something ${anotherClass}`}`)
-   Works on existing classnames calls (`className={clsx('very long classNames are slitted in groups')}`)
-   Sorts the classes for tailwind (variants are put last)
