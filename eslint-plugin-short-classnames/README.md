## Installation

Install the plugin with

```
npm i -D eslint-plugin-short-classnames
```

## Eslint config

Add the following code into your `.eslintrc.json` config

```json
{
    "plugins": ["short-classnames"],
    "rules": {
        "short-classnames/short-classnames": [
            "error",
            {
                "maxClassNameCharacters": 60,
                "functionName": "classNames"
            }
        ]
    }
}
```

To automatically split classnames run the following command or use the Vscode ESlint extension with `Ctrl - Shift - P` and `Eslint - Fix all auto fixable problems`

```sh
eslint --fix .
```
