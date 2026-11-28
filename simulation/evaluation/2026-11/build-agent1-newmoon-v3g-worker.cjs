'use strict';
/* Deterministic research-only v3g bundle for import-disabled production VM.
 * Does NOT authorize native Twinleaf games or CI fixture dispatch.
 * node simulation/evaluation/2026-11/build-agent1-newmoon-v3g-worker.cjs
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dir=__dirname;
const p2=path.join(dir,'agent1-newmoon-v2-jammer-decision.cjs');
const p3=path.join(dir,'agent1-newmoon-v3-finisher-slice.cjs');
const pg=path.join(dir,'agent1-newmoon-v3g-gladion-policy.cjs');
const output=path.join(dir,'agent1-newmoon-v3g-worker-standalone.cjs');
const sources=[p2,p3,pg].map(x=>fs.readFileSync(x,'utf8'));
const [v2,v3,g]=sources;
const import2="const oldSetup=require('./agent1-newmoon-v2-jammer-decision.cjs');";
const import3="const parent=require('./agent1-newmoon-v3-finisher-slice.cjs');";
if(v3.split(import2).length!==2||g.split(import3).length!==2||
 !v2.includes('module.exports={POLICY_VERSION,DECK_SHA,createPolicy};'))
 throw Error('V3G_IMPORT_CONTRACT_CHANGED');
const v3Built=v3.replace(import2,[
 '/* Embedded v2 scope: no runtime require */',
 'const oldSetup=(()=>{','const module={exports:{}};',v2,
 'return module.exports;','})();'
].join('\n'));
const bundled=g.replace(import3,[
 '/* Embedded v3 scope: no runtime require */',
 'const parent=(()=>{','const module={exports:{}};',v3Built,
 'return module.exports;','})();'
].join('\n'));
if(bundled.includes(import2)||bundled.includes(import3)||
 /^(?![ \t]*\/\/).*require\s*\(/m.test(bundled)) throw Error('RUNTIME_REQUIRE_REMAINS');
fs.writeFileSync(output,bundled,'utf8');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
console.log(JSON.stringify({
 profile:'agent1-newmoon-v3g-gladion-rescue-research-v1',
 v2_sha256:sha(v2),v3_sha256:sha(v3),v3g_sha256:sha(g),
 bundled_sha256:sha(bundled),bytes:Buffer.byteLength(bundled),
 output:path.relative(process.cwd(),output)
}));
