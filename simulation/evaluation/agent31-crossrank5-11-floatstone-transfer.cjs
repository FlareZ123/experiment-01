'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {summarizeRows}=require('./agent31-heldout-floatstone-summary.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const REG='results/aichi-2026/registrations/agent31-crossrank5-11-floatstone-20261103.json';
const SHA='04eeebb1d3335202aba9f283d7419b74e74c8dbe';
function prereg(){
 const bytes=fs.readFileSync(path.resolve(__dirname,'../..',REG));
 assert.equal(gitBlobHash(bytes),SHA);
 const x=JSON.parse(bytes.toString('utf8'));
 assert.equal(x.registeredBeforeNativeResults,true);
 assert.equal(x.trials.length,32);assert.equal(x.groups,16);
 const used=new Set(Object.values(JSON.parse(fs.readFileSync(
  path.resolve(__dirname,'../..','results/aichi-2026/registrations/agent31-rank1-heldout-floatstone-20261103.json'),'utf8')).seeds).flat());
 const values=[];
 for(const rank of [5,11])for(const slot of ['A','B']){
  assert.equal(x.seeds[rank][slot].length,4);
  values.push(...x.seeds[rank][slot]);
 }
 assert.equal(new Set(values).size,16);
 assert.ok(values.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=0xffffffff&&!used.has(n)));
 const pair=new Map();
 for(const trial of x.trials){
  assert.ok([5,11].includes(trial.rank));
  assert.ok(['A','B'].includes(trial.candidateSlot));
  assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,trial.candidateId].join(':'));
  assert.equal(trial.seed,x.seeds[trial.rank][trial.candidateSlot][trial.repeat]);
  const key=[trial.rank,trial.candidateSlot,trial.repeat].join(':');
  const group=pair.get(key)??[];group.push(trial.candidateId);pair.set(key,group);
 }
 assert.equal(pair.size,16);
 for(const c of pair.values())assert.deepEqual(c.sort(),
  ['champion-reference','new-moon-lockbreaker-v1']);
 return x;
}
function run(){
 const reg=prereg(),original=preflight();
 const common={...original.registration.frozenCommonPolicy,
  registeredTrials:reg.trials,registeredFrameName:reg.schema,
  bilateralBasicEnergyRecipientFrontier:true,
  actorUnderworldDoorPromptOwner:true,actorUnderworldDoorRoot:true};
 const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
 process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
 const undo=installUnderworldDoorPsychicRecipientHook();
 let base,rescue;
 try{
  base=runDevelopment({...common,actorFundedShadowRiderFloatStoneRoot:false});
  rescue=runDevelopment({...common,actorFundedShadowRiderFloatStoneRoot:true});
 }finally{
  undo();
  if(previous===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
 }
 const rows=summarizeRows(reg.trials,base,rescue);
 const num=k=>rows.reduce((s,x)=>s+(x[k]??0),0);
 const count=f=>rows.filter(f).length;
 const summary={independentSeedGroups:16,matchedPairs:rows.length,nativeAttempts:rows.length*2,
  exactSourceAndCandidateOpeningPairs:count(r=>r.physicalMatch&&r.sourceMatch),
  changedSourceRootHashPairs:count(r=>r.controlSHA!==r.rescueSHA),
  physicallyAcceptedSourceFloatStoneAttackChains:num('physicalToolAttack'),
  rescueIntentSelectionsBothSeats:num('allSeatRescueSelected'),
  originalSourceAttacksControl:num('controlAttacks'),
  originalSourceAttacksRescue:num('rescueAttacks'),
  originalSourceNativeTerminalsControl:count(r=>r.controlStatus==='source-native-terminal'),
  originalSourceNativeTerminalsRescue:count(r=>r.rescueStatus==='source-native-terminal'),
  errorsControl:count(r=>r.controlStatus==='engine-error'),
  errorsRescue:count(r=>r.rescueStatus==='engine-error'),
  competitivePaperQualifiedGames:0};
 return {schema:reg.schema,registryBlob:SHA,originalRanks:[5,11],
  originalSourceAndCandidateDecksFrozen:true,
  onlyDifference:'fundedVmaxFloatStoneRoot OFF vs ON on both seats',
  researchQualification:'developmental native actions, no paper match win inference',
  summary,rows,base,rescue};
}
if(require.main===module){
 if(process.argv.includes('--preflight'))process.stdout.write('AGENT31_CROSSRANK_PREFLIGHT '+JSON.stringify(prereg().seeds)+'\n');
 else{
  const x=run();
  if(process.env.AGENT31_CROSSRANK_FLOATSTONE_OUTPUT)save(process.env.AGENT31_CROSSRANK_FLOATSTONE_OUTPUT,x);
  process.stdout.write('AGENT31_CROSSRANK_NATIVE '+JSON.stringify({summary:x.summary,rows:x.rows})+'\n');
  assert.equal(x.summary.exactSourceAndCandidateOpeningPairs,32);
 }
}
module.exports={REG,SHA,prereg,run};
