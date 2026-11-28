'use strict';
/*
 * Research build only, no native game dispatch.
 * node simulation/evaluation/2026-11/build-agent1-newmoon-v3-worker.cjs
 * The production policy worker runs with require completely disabled.
 * Inline v2 generic setup inside an isolated local scope, then v3 as outer
 * policy. Do not edit the upstream production worker.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const here=__dirname;
const v2Path=path.join(here,'agent1-newmoon-v2-jammer-decision.cjs');
const v3Path=path.join(here,'agent1-newmoon-v3-finisher-slice.cjs');
const outPath=path.join(here,'agent1-newmoon-v3-worker-standalone.cjs');
const v2=fs.readFileSync(v2Path,'utf8'),v3=fs.readFileSync(v3Path,'utf8');
const needle="const oldSetup=require('./agent1-newmoon-v2-jammer-decision.cjs');";
if(v3.split(needle).length!==2||
 !v2.includes("module.exports={POLICY_VERSION,DECK_SHA,createPolicy};")||
 !v3.includes("module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,"))
 throw Error('SOURCE_CONTRACT_DRIFT');
if(/require\s*\(/.test(v2))throw Error('NESTED_MODULE_DEPENDENCY_NOT_ALLOWED');
const standalone=v3.replace(needle,[
 '/* Bundled v2 generic opening module in isolated lexical scope; no runtime import. */',
 'const oldSetup=(()=>{',
 ' const module={exports:{}};',
 v2,
 ' return module.exports;',
 '})();'
].join('\n'));
if(standalone.includes(needle)||
 /^[ \t]*const[ \t]+oldSetup[ \t]*=[ \t]*require/m.test(standalone))
 throw Error('PRODUCTION_REQUIRE_LEFT_OVER');
fs.writeFileSync(outPath,standalone,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const info={profile:'agent1-newmoon-dusknoir-v3-finisher-research-v1',
 v2_sha256:sha(v2),v3_sha256:sha(v3),output_sha256:sha(standalone),
 output_path:path.relative(process.cwd(),outPath),bytes:Buffer.byteLength(standalone)};
console.log(JSON.stringify(info));
