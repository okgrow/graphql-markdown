module.exports = {
  "parser": "babel-eslint",
  "extends": "airbnb",
  "env": {
    jest: true,
    node: true,
    es6: true,
  },
  "rules": {
    "max-len": 1, // Warn as sometimes necessary to have long strings to not risk whitespace
    "new-cap": 1, // Warn only as we don't have any control over external packages doing this
    "import/named": 2, // Ensure named imports correspond to a named export in the remote file
    "no-mixed-operators": 0, // Allow && || usage. e.g: const foo = a && a.foo || undefined;
    "arrow-parens": ["error", "as-needed"], // Allow usage of: foo => {...}
  }
}
