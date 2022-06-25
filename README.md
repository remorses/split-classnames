<div align='center'>
    <br/>
    <h3>Splits long className attributes to make them more readable</h3>
    <br/>
    <br/>
</div>

Subscribe to my [Newsletter](https://xmorse.xyz) if you want to get notified about other cool projects and updates.

## Example

The following code

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
import classNames from 'classnames'
function Component() {
    return (
        <Fragment>
            <p
                className={classNames(
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
```

## Usage as a cli

```sh
npm i -g split-classnames
# split classnames on all js files in the src directory
split-classnames --dry --max 30 'src/**'
```

## Usage as an eslint plugin

Install the plugin:

```sh
npm i -D eslint-plugin-split-classnames
```

Add the plugin to your eslint config:

```json
// .eslintrc.json
{
    "plugins": ["split-classnames"],
    "rules": {
        "split-classnames/split-classnames": [
            "error",
            {
                "maxClassNameCharacters": 40,
                "functionName": "classnames"
            }
        ]
    }
}
```

Then run eslint with `--fix` to split long classnames

```sh
eslint --fix ./src
```

## Features

-   Works bot on typescript and javascript jsx
-   Works on string literals (`className='something'`)
-   Works on template literals (`className={`something ${anotherClass}`}`)
-   Works on existing classnames calls (`className={clsx('very long classNames are slitted in groups')}`)
-   Regroups already existing classnames calls
-   Sorts the classes for tailwind (variants like `sm:` and `lg:` are put last)


## Sponsors

[**Notaku**](https://notaku.website)


[![Notaku](https://preview.notaku.website/github_banner.jpg)](https://notaku.website)

