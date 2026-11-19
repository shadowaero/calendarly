const vm = require('vm');
const fs = require('fs');
try {
  new vm.SourceTextModule(fs.readFileSync('tmp/wgtest/wg-bundle-check.js', 'utf8'));
  console.log('PARSE OK');
} catch (e) {
  console.log('ERR ' + e.message.slice(0, 400));
}
