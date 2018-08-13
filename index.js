const oneLiner = require('one-liner');

const PREFIX = '[ava-test-postcss]';

class PostcssTester {
  constructor(opts = {}) {
    if (typeof opts.postcss !== 'function') {
      throw new Error(
        `${PREFIX} You should pass postcss module to PostcssTester`
      );
    }
    this.postcss = opts.postcss;

    if (typeof opts.plugin !== 'function' && !Array.isArray(opts.plugin)) {
      throw new Error(
        `${PREFIX} You should pass your plugin to PostcssTester`
      );
    }
    this.plugins = [];
    if (Array.isArray(opts.plugin)) {
      for (const plugin of opts.plugin) {
        this.plugins.push(plugin);
      }
    } else {
      this.plugins.push(opts.plugin);
    }

    this.from = typeof opts.from === 'string'
      ? opts.from
      : '';

    this.tolerateWarnings = !!opts.tolerateWarnings;
    this.exactComparaison = !!opts.exactComparaison;
  }

  getPlugins(opts = {}) {
    const plugins = [];

    for (const plugin of opts.pluginsBefore || []) {
      plugins.push(plugin);
    }
    for (const plugin of this.plugins) {
      if (typeof opts.pluginOptions !== 'undefined') {
        plugins.push(plugin(opts.pluginOptions));
      } else {
        plugins.push(plugin);
      }
    }
    for (const plugin of opts.pluginsAfter || []) {
      plugins.push(plugin);
    }

    return plugins;
  }

  async test(input, output, t, opts = {}) {
    if (typeof output !== 'function') {
      t.plan(1);
    }

    await this.postcss(this.getPlugins(opts)).process(input, {
      from: this.from
    }).then(result => {
      if (output instanceof Error) {
        t.fail(
          `${PREFIX} Excepted an error but got a successfull result:`,
          result
        );
        return;
      }

      const warnings = result.warnings();
      if (warnings.length && !this.tolerateWarnings) {
        t.fail(`${PREFIX} Some warnings apparead:`, warnings);
        return;
      }

      if (typeof output === 'string') {
        if (this.exactComparaison) {
          t.is(result.css, output);
        } else {
          t.is(oneLiner(result.css).trim(), oneLiner(output).trim());
        }
        return;
      }

      if (typeof output === 'function') {
        output(null, result.css, t);
        return;
      }

      t.fail(`${PREFIX} Invalid output type`);
    }).catch(err => {
      if (typeof output === 'function') {
        output(err, null, t);
        return;
      }

      if (!(output instanceof Error)) {
        t.fail(`${PREFIX} An unexpected error occured:`, err);
        return;
      }

      t.is(err.message, output.message);
    });
  }
}

module.exports = PostcssTester;
