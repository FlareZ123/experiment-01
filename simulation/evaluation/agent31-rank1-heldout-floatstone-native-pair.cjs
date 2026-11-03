'use strict';
const assert=require('node:assert/strict');
const {prereg,REG,BLOB}=require('./agent31-floatstone-heldout-provenance.cjs');
const {summarizeRows}=require('./agent31-heldout-floatstone-summary.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const VERSION='agent31-rank1-heldout-floatstone-v1';
function run(){
 const {registration,original}=prereg();
 const policy={...original.registration.frozenCommonPolicy,
  registeredTrials:registration.trials,registeredFrameName:registration.schema,
  bilateralBasicEnergyRecipientFrontier:true,
  actorUnderworldDoorPromptOwner:true,actorUnderworldDoorRoot:true};
 const old=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
 process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
 const undo=installUnderworldDoorPsychicRecipientHook();
 let a,b;
 try{
  a=runDevelopment({...policy,actorFundedShadowRiderFloatStoneRoot:false});
  b=runDevelopment({...policy,actorFundedShadowRiderFloatStoneRoot:true});
 }finally{
  undo();
  if(old===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old;
 }
 const rows=summarizeRows(registration.trials,a,b);
 const sum=k=>rows.reduce((n,r)=>n+(r[k]??0),0),count=f=>rows.filter(f).length;
 const summary={registeredSeedGroups:8,registeredPairs:16,nativeAttempts:32,
  matchedSourceDeals:count(r=>r.sourceMatch),
  matchedCompleteDeals:count(r=>r.physicalMatch),
  sourceVerifiedToolRetreatAttackChains:sum('physicalToolAttack'),
  totalRescueSelectionsAllSeats:sum('allSeatRescueSelected'),
  baseSourceAttacks:sum('controlAttacks'),newSourceAttacks:sum('rescueAttacks'),
  baseSourceMaxGeist:sum('controlMaxGeist'),newSourceMaxGeist:sum('rescueMaxGeist'),
  improvedAttackRows:count(r=>r.rescueAttacks>r.controlAttacks),
  worsenedAttackRows:count(r=>r.rescueAttacks<r.controlAttacks),
  unchangedAttackRows:count(r=>r.rescueAttacks===r.controlAttacks),
  baseSourceNativeTerminals:count(r=>r.controlStatus==='source-native-terminal'),
  newSourceNativeTerminals:count(r=>r.rescueStatus==='source-native-terminal'),
  controlErrors:count(r=>r.controlStatus==='engine-error'),
  treatmentErrors:count(r=>r.rescueStatus==='engine-error'),
  paperQualifiedGames:0};
 return {schema:VERSION,registrationBlob:BLOB,registrationPath:REG,
  frozenOriginalSourceAndCandidateSixties:true,
  fullPhysicalOpeningCompared:true,actorOnlySymmetricBothSeats:true,
  paperPsychicRecipientHookBothArms:true,pinnedEngine:original.pin,
  originalRosterBlob:original.rosterBlob,
  onlyDifference:'funded Shadow Rider Float Stone root OFF vs ON',
  summary,rows,control:a,treatment:b};
}
if(require.main===module){
 if(process.argv.includes('--preflight')){
  const x=prereg();
  process.stdout.write('AGENT31_FLOATSTONE_HELDOUT_PREFLIGHT '+
   JSON.stringify({blob:BLOB,seeds:x.registration.seeds})+'\n');
 }else{
  const x=run();
  if(process.env.AGENT31_HELDOUT_FLOATSTONE_OUTPUT)
   save(process.env.AGENT31_HELDOUT_FLOATSTONE_OUTPUT,x);
  process.stdout.write('AGENT31_FLOATSTONE_HELDOUT_NATIVE '+
   JSON.stringify({summary:x.summary,rows:x.rows})+'\n');
  assert.equal(x.summary.matchedCompleteDeals,16);
  assert.equal(x.summary.controlErrors,0);
  assert.equal(x.summary.treatmentErrors,0);
 }
}
module.exports={VERSION,run};
