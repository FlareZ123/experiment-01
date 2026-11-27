'use strict';

/*
 * Rank-32-only static worker closure builder.
 * This is a narrowly-scoped adapter for the existing agent49 V3 sandbox,
 * whose worker intentionally provides NO ambient CommonJS require.
 *
 * node simulation/evaluation/2026-11/agent3-rank32-worker-build.cjs --write
 * node simulation/evaluation/2026-11/agent3-rank32-worker-build.cjs --check
 */

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const SOURCE_NAMES = Object.freeze([
  'agent43-regidrago-apex-choice.cjs',
  'agent1-rank12-regidrago-opponent-policy-v2.cjs',
  'agent3-rank32-regidrago-opponent-policy.cjs'
]);
const ENTRY = './agent3-rank32-regidrago-opponent-policy.cjs';
const OUTPUT = 'agent3-rank32-regidrago-worker-bundle.cjs';

function gitBlobSha1(source) {
  const body = Buffer.from(source, 'utf8');
  return createHash('sha1').update('blob ' + body.length + '\0')
    .update(body).digest('hex');
}

function build({ rootDir = __dirname } = {}) {
  const files = SOURCE_NAMES.map(name => {
    const source = fs.readFileSync(path.join(rootDir, name), 'utf8');
    return { name, source, sha: gitBlobSha1(source) };
  });
  const modules = files.map(file => (
    JSON.stringify('./' + file.name) +
    ': function(require, module, exports) {\n' + file.source + '\n}'
  )).join(',\n');
  return [
    "'use strict';",
    '/*',
    ' * Agent3 rank32 source-bound V3 worker entrypoint, static CommonJS closure.',
    ' * Generated from the exact sources below; do not edit this bundle in isolation.',
    ' * Pin the bundle blob after independent review before any native worker use.',
    ...files.map(file => ' * ' + file.name + ' ' + file.sha),
    ' */',
    'const __rank32Modules = Object.freeze({',
    modules,
    '});',
    'const __rank32Cache = Object.create(null);',
    'function __rank32Load(id) {',
    "  if (!Object.prototype.hasOwnProperty.call(__rank32Modules, id)) throw new Error('UNKNOWN_RANK32_MODULE');",
    '  if (Object.prototype.hasOwnProperty.call(__rank32Cache, id)) return __rank32Cache[id].exports;',
    '  const internal = {exports: {}};',
    '  __rank32Cache[id] = internal;',
    '  __rank32Modules[id](__rank32Load,internal,internal.exports);',
    '  return internal.exports;',
    '}',
    'module.exports = __rank32Load(' + JSON.stringify(ENTRY) + ');',
    ''
  ].join('\n');
}

function run(argv = process.argv.slice(2)) {
  if (argv.length !== 1 || !['--write', '--check'].includes(argv[0])) {
    throw Error('Usage: node agent3-rank32-worker-build.cjs --write|--check');
  }
  const file = path.join(__dirname, OUTPUT);
  const output = build();
  if (argv[0] === '--write') {
    fs.writeFileSync(file, output, 'utf8');
    process.stdout.write(OUTPUT + ' updated (' + Buffer.byteLength(output) + ' bytes)\n');
    return;
  }
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== output) {
    throw Error('RANK32_STATIC_WORKER_BUNDLE_STALE');
  }
  process.stdout.write('RANK32_STATIC_WORKER_BUNDLE_MATCH\n');
}

if (require.main === module) run();

module.exports = { SOURCE_NAMES, ENTRY, OUTPUT, build, gitBlobSha1, run };
