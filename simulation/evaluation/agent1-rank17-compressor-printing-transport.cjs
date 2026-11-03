'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {printingFingerprint}=require('./agent13-source-identity-gate.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent1-rank17-compressor-printing-transport-20261103.json';
const OUT='agent1-rank17-compressor-printing-transport.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
/** Freeze original source identity and registered real seats before native play. */
function preflight(){
 const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
 assert.equal(reg.schema,'agent1-original-rank17-compressor-printed-opening-transport-v1');
 assert.deepEqual(reg.seedGroups,[2443530385,1246820961,2647505399,3029174418]);
 assert.deepEqual(reg.sourceSeats,[0,1]);
 assert.equal(reg.expectedAttempts,16);
 assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 const original=JSON.parse(fs.readFileSync(path.join(ROOT,
   'results/aichi-2026/full-decklists.json'),'utf8'));
 assert.equal(printingFingerprint(original.decks.find(x=>x.rank===17).cards),
   reg.originalPrintingFingerprint);
 const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
   allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
 const source=plan.opponents.find(x=>x.rank===17);
 assert.equal(source.status,'ready');
 assert.equal(source.cards.length,60);
 assert.equal(plan.candidate.cards.length,60);
 assert.equal(plan.engineRevision,reg.enginePin);
 return {reg,plan,source};
}
/** Count genuine accepted native source PlayCardAction rather than mere proposals. */
function sourceCompressorRoots(rows,seat){
 return (rows??[]).filter(x=>x.playerSlot===seat&&
   x.action==='PlayCardAction'&&typeof x.card==='string'&&
   x.card.startsWith('Battle Compressor '));
}
/** @param {object} setup Frozen plan and original 60. */
function nativeArm(setup,seed,seat,enabled){
 const {plan,source}=setup;
 const deckA=seat===0?source.cards:plan.candidate.cards;
 const deckB=seat===1?source.cards:plan.candidate.cards;
 const id={seed,seat,enabled,deckAHash:hash(deckA),deckBHash:hash(deckB)};
 try{
  const {result:g,audit:a}=withActorOnlyRootPolicy(()=>runMatch({
   deckA,deckB,seed,maxActions:180,strictPromptValidation:true,
   captureInitialFullPhysicalDeal:true,
   battleCompressorPositiveSelectionCorrection:true,
   electrodeGXEnergyCorrection:true,electroRainDamageCorrection:true,
   ...(enabled?{rank4RaichuCompressorSeat:seat}:{}),
   label:'rank17-printed-compressor-'+(enabled?'on':'off')
  }),{naturalEvolutionRoot:true});
  const sourceRoots=(g.rootActionLedger??[]).filter(x=>x.playerSlot===seat);
  const compressor=sourceCompressorRoots(sourceRoots,seat);
  return {...id,error:null,started:g.firstTurnSlot,
   physicalDealHash:hash(g.initialFullPhysicalDealFingerprint),
   sourceDealHash:g.initialSourceDealFingerprint?.digestSha256??null,
   sourceCompressorCount:compressor.length,acceptedCompressorRoots:compressor,
   sourceRoots,allNativeRoots:g.rootActionLedger??null,
   actorAcceptances:a.nativeRootAcceptances??[],
   nativeStatus:g.endReason??null,nativeWinner:g.winner??null,
   nativeFinished:g.finished,nativeActions:g.actions,nativeTurns:g.turns,
   competitiveGameQualified:false};
 }catch(e){
  return {...id,error:String(e?.stack??e),physicalDealHash:null,
   sourceDealHash:null,sourceCompressorCount:null,competitiveGameQualified:false};
 }
}
/** Each original source physical group has one control and one intervention. */
function runExperiment(action=nativeArm,setup=preflight()){
 const pairs=[];
 for(const seed of setup.reg.seedGroups)for(const seat of setup.reg.sourceSeats){
  const control=action(setup,seed,seat,false);
  const treatment=action(setup,seed,seat,true);
  const complete=control.error===null&&treatment.error===null;
  const physicalMatch=complete&&control.deckAHash===treatment.deckAHash&&
   control.deckBHash===treatment.deckBHash&&
   control.physicalDealHash===treatment.physicalDealHash&&
   control.sourceDealHash===treatment.sourceDealHash&&
   control.started===treatment.started;
  pairs.push({seed,seat,complete,physicalMatch,
   sourceCompressorDelta:complete?
    treatment.sourceCompressorCount-control.sourceCompressorCount:null,
   control,treatment});
 }
 return {schema:setup.reg.schema,originalPrintingFingerprint:
   setup.reg.originalPrintingFingerprint,enginePin:setup.reg.enginePin,
   sourceRank:17,referenceRank:1,registeredSource:REG,
   attempted:pairs.length*2,completedPairs:pairs.filter(x=>x.complete).length,
   matchedPairs:pairs.filter(x=>x.physicalMatch).length,
   controlCompressor:pairs.reduce((n,p)=>n+(p.control.sourceCompressorCount??0),0),
   treatmentCompressor:pairs.reduce((n,p)=>n+(p.treatment.sourceCompressorCount??0),0),
   pairs,sourceOnlyIntervention:true,competitiveQualifiedGames:0,
   certifiedFieldWinRate:null};
}
/** Atomic exclusive-locked raw output, preserving every attempt. */
function save(result){
 const dest=path.join(ROOT,OUT),lock=dest+'.lock',tmp=dest+'.'+randomUUID()+'.tmp';
 const fd=fs.openSync(lock,'wx');
 try{
  fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  fs.renameSync(tmp,dest);
 }finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);fs.closeSync(fd);fs.unlinkSync(lock);}
}
function main(){
 const r=runExperiment();save(r);
 process.stdout.write('RANK17_COMPRESSOR '+JSON.stringify({
  attempted:r.attempted,matched:r.matchedPairs,completed:r.completedPairs,
  controlCompressor:r.controlCompressor,treatmentCompressor:r.treatmentCompressor,
  competitiveQualifiedGames:0})+'\n');
 assert.equal(r.attempted,16);
 assert.equal(r.completedPairs,r.matchedPairs,'Reject unmatched actual physical deals');
}
if(require.main===module)main();
module.exports={preflight,sourceCompressorRoots,nativeArm,runExperiment,save,main};
