'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const {preflight:base,sourceCompressorRoots}=
 require('./agent1-rank17-compressor-printing-transport.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
 require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withCompressorOpportunityCensus}=
 require('../twinleaf/agent1-rank17-compressor-opportunity-census.cjs');
const {withOwnerEarlyCompressorAfterPass}=
 require('../twinleaf/agent1-raichu-actor-compressor-bridge.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent1-rank17-actor-compressor-bridge-prospective-20261103.json';
const OUT='agent1-rank17-actor-compressor-bridge-prospective.json';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
/** Verify original printed sixty and already frozen seed cohorts. */
function preflight(){
 const source=base();
 const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
 assert.equal(reg.schema,'agent1-rank17-actor-compressor-bridge-prospective-v1');
 assert.equal(reg.enginePin,source.reg.enginePin);
 assert.equal(reg.sourceOriginalFingerprint,source.reg.originalPrintingFingerprint);
 assert.deepEqual(reg.prospectiveSeedGroups,
  [725554645,1648575463,1505670861,2143415530,
   1965282964,2208314832,194900276,4010383176]);
 assert.deepEqual(reg.prospectiveSourceSeats,[0,1]);
 assert.equal(reg.expectedTotalNativeArms,38);
 return {source,reg};
}
/** Run one unchanged original source 60 with optional actor Item bridge. */
function arm(source,seed,seat,enabled){
 const deckA=seat===0?source.source.cards:source.plan.candidate.cards;
 const deckB=seat===1?source.source.cards:source.plan.candidate.cards;
 const id={seed,seat,enabled,deckAHash:hash(deckA),deckBHash:hash(deckB)};
 try{
  const run=()=>runMatch({deckA,deckB,seed,maxActions:180,
   strictPromptValidation:true,captureDecisionTrace:true,
   captureInitialFullPhysicalDeal:true,
   battleCompressorPositiveSelectionCorrection:true,
   electrodeGXEnergyCorrection:true,electroRainDamageCorrection:true,
   rank4RaichuCompressorSeat:seat,label:'source-rank17-compressor-actor'});
  const result=withActorOnlyRootPolicy(()=>
   withCompressorOpportunityCensus(()=>
    enabled?withOwnerEarlyCompressorAfterPass(run,seat):
     {result:run(),audit:null},seat),{naturalEvolutionRoot:true});
  const {result:inner,audit:opening}=result.result;
  const {result:g,audit:bridge}=inner;
  assert.ok(Array.isArray(g.rootActionLedger));
  const roots=g.rootActionLedger.filter(r=>r.playerSlot===seat);
  return {...id,error:null,actualStarterSeat:g.firstTurnSlot,
   fullPhysicalDealHash:hash(g.initialFullPhysicalDealFingerprint),
   nativeStatus:g.endReason,nativeFinished:g.finished,
   nativeWinner:g.winner??null,nativeActions:g.actions,
   sourceCompressorRoots:sourceCompressorRoots(roots,seat),
   sourceRootActions:roots,allNativeRootActions:g.rootActionLedger,
   opening,bridge,competitiveGameQualified:false};
 }catch(error){
  return {...id,error:String(error?.stack??error),
   fullPhysicalDealHash:null,competitiveGameQualified:false};
 }
}
/** Preserve every registered source/seat/seed pair, including failures. */
function runExperiment(execute=arm,setup=preflight()){
 const {source,reg}=setup,pairs=[];
 const cohort=[...reg.retrospectivePositiveControl.map(p=>({
  sourceSeat:p.sourceSeat,seed:p.seed,cohort:'known-positive'})),
  ...reg.prospectiveSeedGroups.flatMap(seed=>[0,1].map(sourceSeat=>({
   seed,sourceSeat,cohort:'fresh'})))];
 for(const {seed,sourceSeat,cohort:tag} of cohort){
  const control=execute(source,seed,sourceSeat,false);
  const treatment=execute(source,seed,sourceSeat,true);
  const complete=control.error===null&&treatment.error===null;
  const matched=complete&&control.fullPhysicalDealHash===
   treatment.fullPhysicalDealHash&&
   control.actualStarterSeat===treatment.actualStarterSeat&&
   control.deckAHash===treatment.deckAHash&&
   control.deckBHash===treatment.deckBHash;
  pairs.push({seed,sourceSeat,cohort:tag,complete,matched,
   identicalNativeRootTrace:complete&&
    JSON.stringify(control.allNativeRootActions)===
    JSON.stringify(treatment.allNativeRootActions),
   control,treatment});
 }
 const agg=(c,key)=>pairs.filter(p=>p.cohort===c).reduce(
  (n,p)=>n+(p.treatment.bridge?.[key]??0),0);
 const native=(c)=>pairs.filter(p=>p.cohort===c).reduce(
  (n,p)=>n+(p.treatment.sourceCompressorRoots?.length??0),0);
 return {schema:reg.schema,registration:REG,enginePin:reg.enginePin,
  priorOutcomesExposed:true,attemptedNativeArms:pairs.length*2,
  completePairs:pairs.filter(p=>p.complete).length,
  physicalMatchedPairs:pairs.filter(p=>p.matched).length,
  knownPositiveAcceptedItems:native('known-positive'),
  prospectiveAcceptedItems:native('fresh'),
  knownPositiveBridgeProposed:agg('known-positive','proposed'),
  prospectiveBridgeProposed:agg('fresh','proposed'),
  nativeRejected:pairs.reduce((n,p)=>n+(p.treatment.bridge?.rejected??0),0),
  pairs,competitivelyQualifiedGames:0,certifiedWinRate:null};
}
/** Exclusive lock and atomic replace of the complete JSON archive. */
function save(result){
 const dest=path.join(ROOT,OUT),lock=dest+'.lock',tmp=dest+'.'+randomUUID()+'.tmp';
 const fd=fs.openSync(lock,'wx');
 try{fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  fs.renameSync(tmp,dest);}
 finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);fs.closeSync(fd);fs.unlinkSync(lock);}
}
function main(){
 const r=runExperiment();save(r);
 process.stdout.write('RANK17_BRIDGE '+JSON.stringify({
  attempted:r.attemptedNativeArms,matched:r.physicalMatchedPairs,
  complete:r.completePairs,
  knownPositive:r.knownPositiveAcceptedItems,
  fresh:r.prospectiveAcceptedItems,
  proposedPositive:r.knownPositiveBridgeProposed,
  proposedFresh:r.prospectiveBridgeProposed,
  rejected:r.nativeRejected,competitiveGames:0})+'\n');
 assert.equal(r.attemptedNativeArms,38);
 assert.equal(r.completePairs,r.physicalMatchedPairs,'Source deal mismatch');
}
if(require.main===module)main();
module.exports={preflight,arm,runExperiment,save,main};
