## Eslint config

Add the following code into your .eslintrc.json config

```json
{
    "extends": ["plugin:short-classnames/config"]
}
```

You can also configure the plugin options

```json
{
    "extends": ["plugin:short-classnames/config"],
    "rules": {
        "short-classnames/short-classnames": [
            "error",
            {
                "maxClassNameCharacters": 100,
                "functionName": "classNames"
            }
        ]
    }
}
```
