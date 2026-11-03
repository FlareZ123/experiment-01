'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const {preflight: sourcePreflight}=
  require('./agent1-rank17-actor-compressor-bridge-prospective.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent1-rank17-native-electro-rain-settlement-retrospective-20261103.json';
const OUT=path.join(ROOT,'agent1-rank17-electro-rain-settlement-retrospective.json');
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

function preflight(){
  const previous=sourcePreflight();
  const r=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  assert.equal(r.schema,'agent1-rank17-native-electro-rain-settlement-retrospective-v1');
  assert.equal(r.enginePin,previous.reg.enginePin);
  assert.equal(r.originalSourcePrintingSha,previous.reg.sourceOriginalFingerprint);
  assert.equal(r.previousSourceElectroRainEvent.seed,3239786043);
  assert.equal(r.previousSourceElectroRainEvent.sourceSeat,0);
  assert.equal(r.registeredArms,2);
  assert.equal(r.explicitlyRetrospectivePositiveSelection,true);
  return {registered:r,original:previous.source};
}

/**
 * Run exact earlier disclosed source physical opening, only adding passive
 * engine-public attack/damage and source-owned zone integrity observation.
 * @param {object} original Exact source native resolved 60s.
 * @param {number} seed Registered previous success seed.
 * @param {boolean} enabled The sole actual decision-policy change.
 */
function nativeArm(original,seed,enabled) {
  const sourceSeat=0;
  const deckA=original.source.cards,deckB=original.plan.candidate.cards;
  const header={seed,sourceSeat,enabled,
    deckAHash:sha(deckA),deckBHash:sha(deckB)};
  try{
    const outer=withActorOnlyRootPolicy(()=>runMatch({
      deckA,deckB,seed,maxActions:180,
      strictPromptValidation:true,captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true,
      capturePublicAttackTransitions:true,
      capturePhysicalZoneIntegrity:true,
      captureElectrodeOpportunity:true,
      captureFinalPublicBoard:true,
      battleCompressorPositiveSelectionCorrection:true,
      electrodeGXEnergyCorrection:true,
      electroRainDamageCorrection:true,
      rank4RaichuCompressorSeat:sourceSeat,
      label:'agent1-retrospective-original-rank17-electro-rain-public-effect'
    }),{
      naturalEvolutionRoot:true,publicContextSpecialEnergy:enabled
    });
    const g=outer.result;
    const sourceAttacks=g.rootActionLedger.filter(a=>
      a.playerSlot===sourceSeat&&a.action==='AttackAction');
    const rain=sourceAttacks.filter(a=>a.attack==='Electro Rain');
    return {...header,error:null,
      actualFirstPlayer:g.firstTurnSlot,
      fullPhysicalDealHash:sha(g.initialFullPhysicalDealFingerprint),
      nativeStatus:g.endReason,nativeWinner:g.winner??null,
      nativeActions:g.actions,
      sourceAttackRoots:sourceAttacks,
      sourceElectroRainRoots:rain,
      attackTrace:g.attackTrace,
      attackDeclarationTrace:g.attackDeclarationTrace,
      publicAttackTransitions:g.publicAttackTransitions,
      physicalZoneIntegrity:g.physicalZoneIntegrity,
      electrodeOpportunitySummary:g.electrodeOpportunitySummary,
      finalPublicBoard:g.finalPublicBoard,
      nativeActorAudit:outer.audit,
      competitivelyQualifiedGame:false};
  }catch(error) {
    return {...header,error:String(error?.stack??error),
      fullPhysicalDealHash:null,competitivelyQualifiedGame:false};
  }
}
function runExperiment(execute=nativeArm,setup=preflight()){
  const seed=setup.registered.previousSourceElectroRainEvent.seed;
  const control=execute(setup.original,seed,false);
  const treatment=execute(setup.original,seed,true);
  const complete=control.error===null&&treatment.error===null;
  const matched=complete&&
    control.fullPhysicalDealHash===treatment.fullPhysicalDealHash&&
    control.actualFirstPlayer===treatment.actualFirstPlayer&&
    control.deckAHash===treatment.deckAHash&&
    control.deckBHash===treatment.deckBHash;
  return {
    schema:setup.registered.schema,registration:REG,
    seed,sourceSeat:0,complete,matched,
    expectedPastElectroRain:true,selectionIsRetrospective:true,
    twoActualStoreArms:2,
    sourceRainObserved:treatment.sourceElectroRainRoots?.length??0,
    control,treatment,competitivelyQualifiedGames:0,certifiedWinRate:null
  };
}
function save(result){
  const lock=OUT+'.lock',tmp=OUT+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try {
    fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,OUT);
  }finally {
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const result=runExperiment();
  save(result);
  process.stdout.write('RANK17_RETROSPECTIVE_RAIN '+JSON.stringify({
    complete:result.complete,matched:result.matched,
    actualRainRoots:result.sourceRainObserved,
    originalWinner:result.control.nativeWinner,
    treatmentWinner:result.treatment.nativeWinner,
    competitiveGames:0
  })+'\n');
  assert.equal(result.matched,true,'Original public attack settlement physical pair mismatch');
}
if(require.main===module)main();
module.exports={preflight,nativeArm,runExperiment,save,main};
