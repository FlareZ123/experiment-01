'use strict';
/*
 * Deterministic one-command, research-only standalone builder for fixed
 * New Moon v3 Counter Catcher overlay. The production worker disables require;
 * this statically bundles v2, v3, Agent22 staged action policy and the overlay.
 *
 * Run from repo root:
 * node simulation/evaluation/2026-11/build-agent22-newmoon-v3-countercatcher-worker.cjs
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const here=__dirname;
const read=name=>fs.readFileSync(path.join(here,name),'utf8');
const v2=read('agent1-newmoon-v2-jammer-decision.cjs');
const v3=read('agent1-newmoon-v3-finisher-slice.cjs');
const seq=read('agent22-newmoon-countercatcher-actor-sequence.cjs');
const direct=read('agent22-newmoon-direct-countercatcher-gust.cjs');
const own=read('agent22-newmoon-v3-countercatcher-worker.cjs');
const outPath=path.join(here,'agent22-newmoon-v3-countercatcher-worker-standalone.cjs');
const v2Need="const oldSetup=require('./agent1-newmoon-v2-jammer-decision.cjs');";
const v3Need="const parent=require('./agent1-newmoon-v3-finisher-slice.cjs');";
const seqNeed="const {createSlice,visiblePrintedDuoDamage}=require('./agent22-newmoon-countercatcher-actor-sequence.cjs');";
const directNeed="const {createDirectGustSlice}=require('./agent22-newmoon-direct-countercatcher-gust.cjs');";
const directSeqNeed="const {\n offeredMewtwoAttack,ownerBenchChoice,ownerPerfectionNightWatchPrompt,\n visiblePrintedDuoDamage,psychicCostPhysicallyReady,nightWatchDonor,\n certifiedDamage\n}=require('./agent22-newmoon-countercatcher-actor-sequence.cjs');";
const replaceOnce=(txt,needle,value)=>{
 if(txt.split(needle).length!==2)throw Error('BUNDLE_SOURCE_CONTRACT_DRIFT: '+needle);
 return txt.replace(needle,value);
};
if(/require\s*\(/.test(v2)||/require\s*\(/.test(seq))
 throw Error('NESTED_RUNTIME_REQUIRE_NOT_ALLOWED');
const scoped=(name,body)=>[
 '/* Static '+name+' module, private lexical scope. */',
 '(()=>{const module={exports:{}};',
 body,
 'return module.exports;})()'
].join('\n');
const v3Standalone=replaceOnce(v3,v2Need,
 'const oldSetup='+scoped('v2 setup',v2)+';');
const directStandalone=replaceOnce(
 direct,directSeqNeed,
 'const {offeredMewtwoAttack,ownerBenchChoice,ownerPerfectionNightWatchPrompt,visiblePrintedDuoDamage,psychicCostPhysicallyReady,nightWatchDonor,certifiedDamage}='+
 scoped('countercatcher sequence for direct gust',seq)+';');
const ownStandalone=replaceOnce(
 replaceOnce(
  replaceOnce(own,v3Need,'const parent='+scoped('v3 parent',v3Standalone)+';'),
  seqNeed,'const {createSlice,visiblePrintedDuoDamage}='+scoped('countercatcher sequence',seq)+';'),
 directNeed,'const {createDirectGustSlice}='+scoped('direct gust',directStandalone)+';');
if(/require\s*\(/.test(ownStandalone))
 throw Error('BUNDLE_UNEXPECTED_RUNTIME_REQUIRE');
fs.writeFileSync(outPath,ownStandalone,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
console.log(JSON.stringify({profile:'agent22-newmoon-v3-countercatcher-terminal-research-v2',
 sourceHashes:{v2:sha(v2),v3:sha(v3),sequence:sha(seq),direct:sha(direct),overlay:sha(own)},
 standaloneSha256:sha(ownStandalone),
 output:path.relative(process.cwd(),outPath),
 bytes:Buffer.byteLength(ownStandalone)},null,2));
