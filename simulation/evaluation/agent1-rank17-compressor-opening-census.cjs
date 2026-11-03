'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const {preflight:sourcePreflight,sourceCompressorRoots}=
 require('./agent1-rank17-compressor-printing-transport.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
 require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withCompressorOpportunityCensus}=
 require('../twinleaf/agent1-rank17-compressor-opportunity-census.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent1-rank17-compressor-opening-census-20261103.json';
const OUT='agent1-rank17-compressor-opening-census.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
/** @returns {object} Original immutable native plan and transparent repeat registration. */
function preflight(){
 const source=sourcePreflight();
 const audit=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
 assert.equal(audit.schema,'agent1-rank17-compressor-owner-opening-census-v1');
 assert.equal(audit.knownNativeRunId,41588655921);
 assert.deepEqual(audit.seeds,source.reg.seedGroups);
 assert.deepEqual(audit.seats,source.reg.sourceSeats);
 assert.equal(audit.expectedNativeArms,16);
 assert.equal(audit.observationalOnly,true);
 assert.equal(audit.policyChanged,false);
 return {source,audit};
}
/** @param {object} source Frozen source plan. @param {number} seed Source RNG seed.
 * @param {0|1} seat Original source physical seat.
 * @param {boolean} enabled Existing native printed Compressor option. */
function arm(source,seed,seat,enabled){
 const {plan,source:original}=source;
 const deckA=seat===0?original.cards:plan.candidate.cards;
 const deckB=seat===1?original.cards:plan.candidate.cards;
 const identity={seed,seat,enabled,deckAHash:hash(deckA),
  deckBHash:hash(deckB)};
 try{
  const wrapped=withActorOnlyRootPolicy(()=>
   withCompressorOpportunityCensus(()=>runMatch({
    deckA,deckB,seed,maxActions:180,strictPromptValidation:true,
    captureInitialFullPhysicalDeal:true,captureDecisionTrace:true,
    battleCompressorPositiveSelectionCorrection:true,
    electrodeGXEnergyCorrection:true,electroRainDamageCorrection:true,
    ...(enabled?{rank4RaichuCompressorSeat:seat}:{}),
    label:'rank17-source-early-compressor-owner-census'
   }),seat),{naturalEvolutionRoot:true});
  const {result:g,audit:opportunity}=wrapped.result;
  assert.ok(Array.isArray(g.rootActionLedger));
  const sourceRoots=g.rootActionLedger.filter(row=>row.playerSlot===seat);
  return {...identity,error:null,actualStarterSeat:g.firstTurnSlot,
   fullPhysicalDealSha256:hash(g.initialFullPhysicalDealFingerprint),
   sourceNativeCompressorRoots:sourceCompressorRoots(sourceRoots,seat),
   fullNativeRoots:g.rootActionLedger,originalSourceRoots:sourceRoots,
   opportunity,actorRootAccepted:wrapped.audit.acceptedActorRoots,
   status:g.endReason,finished:g.finished,winner:g.winner,
   nativeActions:g.actions,competitiveGameQualified:false};
 }catch(error){
  return {...identity,error:String(error?.stack??error),
   fullPhysicalDealSha256:null,opportunity:null,
   competitiveGameQualified:false};
 }
}
/** Replay every already-seen physical arm. Not independent confirmation. */
function runExperiment(execute=arm,admitted=preflight()){
 const pairs=[];
 const {source}=admitted;
 for(const seed of admitted.audit.seeds)for(const seat of admitted.audit.seats){
  const control=execute(source,seed,seat,false);
  const treatment=execute(source,seed,seat,true);
  const complete=control.error===null&&treatment.error===null;
  const matched=complete&&
   control.fullPhysicalDealSha256===treatment.fullPhysicalDealSha256&&
   control.actualStarterSeat===treatment.actualStarterSeat&&
   control.deckAHash===treatment.deckAHash&&
   control.deckBHash===treatment.deckBHash;
  const rootLedgerSame=complete&&
   JSON.stringify(control.fullNativeRoots)===
   JSON.stringify(treatment.fullNativeRoots);
  pairs.push({seed,seat,complete,matched,rootLedgerSame,control,treatment});
 }
 const sum=(mode,key)=>pairs.reduce((n,p)=>
  n+(p[mode].opportunity?.[key]??0),0);
 return {schema:admitted.audit.schema,repeatRegistration:REG,
  previousKnownResultRun:admitted.audit.knownNativeRunId,
  registeredAttempts:pairs.length*2,
  completePairs:pairs.filter(p=>p.complete).length,
  matchedPairs:pairs.filter(p=>p.matched).length,
  rootIdenticalPairs:pairs.filter(p=>p.rootLedgerSame).length,
  controlEarlyOwnerDecisions:sum('control','sourceFirstTwoTurnDecisions'),
  treatmentEarlyOwnerDecisions:sum('treatment','sourceFirstTwoTurnDecisions'),
  controlHeldCompressorDecisions:sum('control','heldCompressorDecisions'),
  treatmentHeldCompressorDecisions:sum('treatment','heldCompressorDecisions'),
  controlEligibleDecisions:sum('control','eligibleDecisions'),
  treatmentEligibleDecisions:sum('treatment','eligibleDecisions'),
  treatmentEligibleSelected:sum('treatment','eligibleCompressorSelected'),
  pairs,priorResultsExposed:true,independentConfirmation:false,
  competitivelyQualifiedGames:0};
}
/** Exclusive lock and same-volume rename preserve a complete native archive. */
function save(result){
 const dest=path.join(ROOT,OUT),lock=dest+'.lock',tmp=dest+'.'+randomUUID()+'.tmp';
 const fd=fs.openSync(lock,'wx');
 try{
  fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  fs.renameSync(tmp,dest);
 }finally{
  if(fs.existsSync(tmp))fs.unlinkSync(tmp);
  fs.closeSync(fd);fs.unlinkSync(lock);
 }
}
function main(){
 const result=runExperiment();
 save(result);
 process.stdout.write('RANK17_OPENING_CENSUS '+JSON.stringify({
  registeredAttempts:result.registeredAttempts,
  matchedPairs:result.matchedPairs,
  rootIdenticalPairs:result.rootIdenticalPairs,
  held:[result.controlHeldCompressorDecisions,
   result.treatmentHeldCompressorDecisions],
  eligible:[result.controlEligibleDecisions,result.treatmentEligibleDecisions],
  selected:result.treatmentEligibleSelected,
  competitiveGames:0})+'\n');
 assert.equal(result.registeredAttempts,16);
 assert.equal(result.completePairs,result.matchedPairs,
  'Root census failed source physical start parity');
}
if(require.main===module)main();
module.exports={preflight,arm,runExperiment,save,main};
