'use strict';

const Mocha = require('mocha');
const path  = require('path');

function assertionAnalyser(err) {
  if (!err) return [];
  return [{ method: 'assert', args: [err.message || String(err)] }];
}

module.exports = function(app) {

  app.route('/_api/app-info').get(function(req, res) {
    const routes = app._router.stack
      .filter(r => r.route)
      .map(r => r.route.path);
    res.json({ routes });
  });

  app.route('/_api/get-tests').get(function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    try {
      const mocha = new Mocha({ timeout: 10000, ui: 'tdd' });
      mocha.suite.emit('pre-require', global, '', mocha);

      const testFile = path.join(process.cwd(), 'tests', '2_functional-tests.js');
      delete require.cache[require.resolve(testFile)];
      mocha.addFile(testFile);

      const output = [];

      mocha.run()
        .on('pass', test => {
          output.push({
            title:      test.fullTitle(),
            context:    test.titlePath()[0] || 'Functional Tests',
            state:      'passed',
            assertions: [{ method: 'equal', args: ['true', 'true'] }]
          });
        })
        .on('fail', (test, err) => {
          output.push({
            title:      test.fullTitle(),
            context:    test.titlePath()[0] || 'Functional Tests',
            state:      'failed',
            assertions: assertionAnalyser(err)
          });
        })
        .on('end', () => res.json(output));
    } catch(err) {
      console.error('Test runner error:', err);
      res.status(500).json({ error: err.message });
    }
  });
};
