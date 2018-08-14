# ava-postcss-tester [![Build Status][travis badge]][travis link] [![Coverage Status][coveralls badge]][coveralls link]

Test your PostCSS plugin with AVA and this handy tool.

```js
// test.js
import test from 'ava';
import PostcssTester from 'ava-postcss-tester';

const tester = new PostcssTester({
  postcss: require('postcss'),
  plugin: require('.')
});

test('test name', async t => {
  const input = `
    .class {
      size: 100px;
    }
  `;
  const output = `
    .class {
      width: 100px;
      height: 100px;
    }
  `;
  await tester.test(input, output, t);
});
```

## Installation

```console
$ npm install -D ava-postcss-tester
```

## Usage

Create a new tester by calling `new PostcssTester` with an options object:

- `postcss`: The postcss module to use for process
- `plugin`: You PostCSS plugin to test (can be an array of plugins) 
tolerateWarnings;
- `from`: *Optional*, default: `''`, The `from` parameter passed to 
`postcss.process`, must be a file path
- `tolerateWarnings`: Optional, default: `false`, Ignore PostCSS warnings
- `exactComparaison`: Optional, default: `false`, Compare the `input` and 
`output` without any trimming or line breaks cleaning

```js
import test from 'ava';
import PostcssTester from 'ava-postcss-tester';

const tester = new PostcssTester({
  postcss: require('postcss'),
  plugin: require('.'),
  tolerateWarnings: true
});
```

Then you can run the async function `tester.test(input, output, t, options)``:

- `input`: A string containing your css input
- `output`: A string containing your excpected output, it can be either a CSS 
string, an `Error` or a function receiving (error, warnings, result) letting 
you finish the test as you would like it
  - `error`: A string containing the Error message
  - `warnings`: An array of PostCSS warnings, is null if there an error occured
  - `result`: A string containing the PostCSS process result
- `t`: The AVA test `t` object
- `options`: *Optional*, An object containing those additional parameters:
  - `pluginOptions`: Options passed to your plugin
  - `pluginsBefore`: An array of plugins to load before your plugin
  - `pluginsAfter`: An array of plugins to load after your plugin

```js
test('test name', async t => {
  const input = `
    .class {
      size: 100px;
    }
  `;
  const output = `
    .class {
      width: 100px;
      height: 100px;
    }
  `;
  await tester.test(input, output, t, {
    pluginOptions: {
      sizeShorthandActivated: true
    },
    pluginsAfter: [require('autoprefixer')]
  });
});
```

## Related

- [postcss][postcss] - Transforming styles with JS plugins
- [ava][ava] - Futuristic JavaScript test runner
- [one-liner][one-liner] - Module used for comparing excepted and real CSS
output

## License

This project is licensed under the [MIT license](LICENSE).

[travis badge]: https://travis-ci.org/dimitrinicolas/ava-postcss-tester.svg?branch=master
[travis link]: https://travis-ci.org/dimitrinicolas/ava-postcss-tester
[coveralls badge]: https://coveralls.io/repos/github/dimitrinicolas/ava-postcss-tester/badge.svg?branch=master
[coveralls link]: https://coveralls.io/github/dimitrinicolas/ava-postcss-tester?branch=master

[postcss]: https://github.com/postcss/postcss
[ava]: https://github.com/avajs/ava
[one-liner]: https://www.npmjs.com/package/one-liner
