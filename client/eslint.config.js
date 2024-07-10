import globals from "globals"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import eslintPluginSvelte from "eslint-plugin-svelte"
import typescriptESLintParser from "@typescript-eslint/parser"
import prettier from "eslint-config-prettier"

export default [
    ...eslintPluginSvelte.configs["flat/recommended"],
    prettier,
    ...eslintPluginSvelte.configs["flat/prettier"],
    {
        ignores: [
            ".svelte-kit",
            "vite.config.ts",
            "build/",
            "node_modules/"
        ]
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: typescriptESLintParser,
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                "sourceType": "module",
                "ecmaVersion": 2020,
            }
        },
        plugins: {
            eslintPluginSvelte,
            typescriptEslint
        },
        rules: {
            "no-unused-vars": "off",
            "no-undef": "error",
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "never"]
        }
    },
    {
        files: ["**/*.svelte"],
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parserOptions: {
                "sourceType": "module",
                "ecmaVersion": 2020,
                "parser": typescriptESLintParser
            }
        },
        rules: {
            "no-unused-vars": "off",
            "no-undef": "error",
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "never"]
        }
    }
]
