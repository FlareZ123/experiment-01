'use strict';

/* Exact-source static sandbox worker builder for Aichi Regidrago rank 14.
 *
 * This includes the original rank-12 family implementation, rank-independent
 * Apex evaluator, already tested source-specific rank-32 substrate, and the
 * narrower rank-14 overlay; no ambient require remains in the final worker.
 *
 * node simulation/evaluation/2026-11/agent3-rank14-worker-build.cjs --write
 * node simulation/evaluation/2026-11/agent3-rank14-worker-build.cjs --check
 */
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobSha1}=require('./agent3-rank32-worker-build.cjs');
const SOURCE_NAMES=Object.freeze([
  'agent43-regidrago-apex-choice.cjs',
  'agent1-rank12-regidrago-opponent-policy-v2.cjs',
  'agent3-rank32-regidrago-opponent-policy.cjs',
  'agent3-rank14-regidrago-opponent-policy.cjs'
]);
const OUTPUT='agent3-rank14-regidrago-worker-bundle.cjs';
const ENTRY='./agent3-rank14-regidrago-opponent-policy.cjs';
function build({rootDir=__dirname}={}){
  const files=SOURCE_NAMES.map(name=>{
    const source=fs.readFileSync(path.join(rootDir,name),'utf8');
    return {name,source,sha:gitBlobSha1(source)};
  });
  const modules=files.map(f=>
    JSON.stringify('./'+f.name)+': function(require, module, exports) {\n'+f.source+'\n}'
  ).join(',\n');
  return [
    "'use strict';",
    '/*',
    ' * Agent3 rank14 source-bound V3 worker entrypoint, static CommonJS closure.',
    ' * Generated from exact sources; do not edit this bundle directly.',
    ...files.map(f=>' * '+f.name+' '+f.sha),
    ' */',
    'const __rank14Modules = Object.freeze({',
    modules,
    '});',
    'const __rank14Cache = Object.create(null);',
    'function __rank14Load(id) {',
    "  if (!Object.prototype.hasOwnProperty.call(__rank14Modules,id)) throw new Error('UNKNOWN_RANK14_MODULE');",
    '  if (Object.prototype.hasOwnProperty.call(__rank14Cache,id)) return __rank14Cache[id].exports;',
    '  const internal = {exports:{}};',
    '  __rank14Cache[id] = internal;',
    '  __rank14Modules[id](__rank14Load,internal,internal.exports);',
    '  return internal.exports;',
    '}',
    'module.exports = __rank14Load('+JSON.stringify(ENTRY)+');',
    ''
  ].join('\n');
}
function run(argv=process.argv.slice(2)){
  if(argv.length!==1||!['--write','--check'].includes(argv[0]))
    throw Error('Usage: node agent3-rank14-worker-build.cjs --write|--check');
  const target=path.join(__dirname,OUTPUT);
  const text=build();
  if(argv[0]==='--write'){
    fs.writeFileSync(target,text,'utf8');
    process.stdout.write(OUTPUT+' updated\n');
  }else{
    if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==text)
      throw Error('RANK14_STATIC_WORKER_BUNDLE_STALE');
    process.stdout.write('RANK14_STATIC_WORKER_BUNDLE_MATCH\n');
  }
}
if(require.main===module)run();
module.exports={SOURCE_NAMES,OUTPUT,ENTRY,build,run};
