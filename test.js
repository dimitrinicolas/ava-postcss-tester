import test from 'ava';
import path from 'path';

import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssImportExtGlob from 'postcss-import-ext-glob';

import PostcssTester from '.';

class FailPasser {
  constructor(t, msg) {
    t.plan(1);
    this.fail = err => {
      if (typeof msg === 'string') {
        t.is(err, msg);
      } else if (msg instanceof RegExp) {
        t.true(msg.test(err));
      } else {
        t.fail();
      }
    };
    this.plan = this.is = () => {};
  }
}

test('simple test', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: postcssImport
  });
  await tester.test('', '', t);
});

test('No postcss given', async t => {
  try {
    // eslint-disable-next-line no-new
    new PostcssTester();
  } catch (err) {
    t.is(
      err.message,
      '[ava-test-postcss] You should pass postcss module to PostcssTester'
    );
  }
});

test('No plugin given', async t => {
  try {
    // eslint-disable-next-line no-new
    new PostcssTester({ postcss });
  } catch (err) {
    t.is(
      err.message,
      '[ava-test-postcss] You should pass your plugin to PostcssTester'
    );
  }
});

test('Random from option', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: postcssImport,
    from: '__random/foo.css'
  });
  t.plan(1);
  await tester.test('@import "fixtures/css/foo/bar.css";', err => {
    t.is(err.message.slice(0, 14), 'Failed to find');
  });
});

test('pluginsBefore, pluginsAfter and pluginOptions', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: postcssImportExtGlob,
    from: path.join(__dirname, 'test.css')
  });
  const input = '@import-glob "fixtures/css/foo/**/*.css";';
  const output = `
    .foo {
      display: block;
    }
    .bar {
      display: inline-block;
    }
  `;

  await tester.test(input, output, t, {
    pluginsBefore: [postcssImport],
    pluginOptions: {
      sort: 'desc'
    },
    pluginsAfter: [postcssImport]
  });
});

test('getPlugins', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: postcssImport
  });
  t.is(tester.getPlugins().length, 1);
});

test('getPlugins multiple', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport, postcssImport]
  });
  t.is(tester.getPlugins().length, 2);
});

test('An unexpected error occured', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport]
  });
  const passer = new FailPasser(t, /An unexpected error occured/);
  const input = '@import "__random.css";';
  await tester.test(input, '', passer);
});

test('Excepted an error but got a successfull result', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport]
  });
  const passer = new FailPasser(
    t,
    /Excepted an error but got a successfull result/
  );
  await tester.test('', new Error(), passer);
});

test('Some warnings apparead', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport]
  });
  const passer = new FailPasser(t, /Some warnings apparead/);
  await tester.test('@import a.css', null, passer);
});

test('exactMatch', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport],
    tolerateWarnings: true,
    exactComparaison: true
  });
  await tester.test('@import a.css', '', t);
});

test('Function output', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport],
    tolerateWarnings: true
  });
  t.plan(1);
  await tester.test('@import a.css', (err, warnings, result) => {
    t.is(result, '');
  });
});

test('Invalid output type', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImport],
    tolerateWarnings: true
  });
  t.plan(1);
  const passer = new FailPasser(t, /Invalid output type/);
  await tester.test('@import a.css', null, passer);
});

test('An unexpected error occured', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImportExtGlob]
  });
  const input = '@import-glob';
  const passer = new FailPasser(t, /An unexpected error occured/);
  await tester.test(input, '', passer);
});

test('Error output', async t => {
  const tester = new PostcssTester({
    postcss,
    plugin: [postcssImportExtGlob]
  });
  const input = '@import-glob';
  const output = new Error(
    'postcss-import-ext-glob: <css input>:1:1: No string found with rule'
    + ' @import-glob '
  );
  await tester.test(input, output, t);
});
