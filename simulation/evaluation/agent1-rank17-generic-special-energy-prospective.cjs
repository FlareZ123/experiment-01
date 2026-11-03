'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const {preflight: priorPreflight}=
  require('./agent1-rank17-actor-compressor-bridge-prospective.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG_PATH='results/aichi-2026/registrations/agent1-rank17-generic-special-energy-root-prospective-20261103.json';
const OUTPUT=path.join(ROOT,'agent1-rank17-generic-special-energy-prospective.json');
const SPECIFIC_ENERGY_NAMES=new Set([
  'Reversal Energy','Counter Energy','Unit Energy LPM'
]);
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Original source printings, source fingerprint, and prospective seed cohort. */
function preflight(){
  const {source,reg:prior}=priorPreflight();
  const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG_PATH),'utf8'));
  assert.equal(reg.schema,'agent1-rank17-public-context-special-energy-prospective-v1');
  assert.equal(reg.sourcePrinted60Fingerprint,prior.sourceOriginalFingerprint);
  assert.deepEqual(reg.seeds,[2781263540,3213416555,3668291815,3239786043]);
  assert.deepEqual(reg.sourceSeats,[0,1]);
  assert.equal(reg.expectedNativeArms,16);
  assert.equal(reg.symmetricBothActorPolicy,true);
  assert.equal(reg.sourceOnlyBridge,false);
  assert.equal(source.source.cards.length,60);
  assert.equal(source.plan.candidate.cards.length,60);
  return {source,reg};
}

/**
 * Capture true original Store source roots without granting any player extra
 * private information. Selector receives only its own public actor view.
 * @param {object} source Validated printed source/unchanged rank1 decks.
 * @param {number} seed Previously committed RNG seed.
 * @param {0|1} sourceSeat Physical position of original rank17 printed sixty.
 * @param {boolean} enabled Generic existing public-context Energy option.
 * @returns {object} Full raw native source and reference root telemetry.
 */
function arm(source,seed,sourceSeat,enabled){
  const deckA=sourceSeat===0?source.source.cards:source.plan.candidate.cards;
  const deckB=sourceSeat===1?source.source.cards:source.plan.candidate.cards;
  const id={seed,sourceSeat,enabled,
    deckAHash:sha(deckA),deckBHash:sha(deckB)};
  try{
    const trial=withActorOnlyRootPolicy(()=>runMatch({
      deckA,deckB,seed,maxActions:180,
      strictPromptValidation:true,captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true,
      battleCompressorPositiveSelectionCorrection:true,
      electrodeGXEnergyCorrection:true,electroRainDamageCorrection:true,
      rank4RaichuCompressorSeat:sourceSeat,
      label:'agent1-original-rank17-generic-public-context-energy-ablation'
    }),{
      naturalEvolutionRoot:true,
      publicContextSpecialEnergy:enabled
    });
    const g=trial.result;
    assert.ok(Array.isArray(g.rootActionLedger));
    const owner=g.rootActionLedger.filter(x=>x.playerSlot===sourceSeat);
    const reference=g.rootActionLedger.filter(x=>x.playerSlot!==sourceSeat);
    const extract=(roots)=>({
      attackRoots:roots.filter(x=>x.action==='AttackAction').map(x=>({
        actionOrdinal:x.actionOrdinal,turn:x.turnBefore,
        attackName:x.attackName??null
      })),
      manualEnergyRoots:roots.filter(x=>
        x.action==='PlayCardAction'&&
        (SPECIFIC_ENERGY_NAMES.has(x.card)||x.card==='Psychic Energy')
      ).map(x=>({
        actionOrdinal:x.actionOrdinal,turn:x.turnBefore,
        printedCard:x.card
      })),
      passRoots:roots.filter(x=>x.action==='PassTurnAction').length,
      playCardRoots:roots.filter(x=>x.action==='PlayCardAction').length,
      acceptedRoots:roots.length
    });
    return {...id,error:null,enginePin:source.reg.enginePin,
      actualStarterSeat:g.firstTurnSlot,
      fullPhysicalDealHash:sha(g.initialFullPhysicalDealFingerprint),
      nativeStatus:g.endReason,nativeWinner:g.winner??null,
      nativeFinished:g.finished,nativeActions:g.actions,
      sourceRoots:extract(owner),referenceRoots:extract(reference),
      allNativeRootActions:g.rootActionLedger,
      nativeActorAudit:trial.audit,
      competitivelyQualifiedGame:false};
  }catch(error){
    return {...id,error:String(error?.stack??error),
      fullPhysicalDealHash:null,competitivelyQualifiedGame:false};
  }
}
/**
 * All fresh seed/seat physical groups and both policy modes stay in the
 * denominator even after a physical mismatch, error, or action censor.
 */
function runExperiment(execute=arm,setup=preflight()){
  const {source,reg}=setup;
  const pairs=[];
  for(const seed of reg.seeds){
    for(const sourceSeat of reg.sourceSeats){
      const control=execute(source,seed,sourceSeat,false);
      const treatment=execute(source,seed,sourceSeat,true);
      const complete=control.error===null&&treatment.error===null;
      const matched=complete&&
        control.fullPhysicalDealHash===treatment.fullPhysicalDealHash&&
        control.actualStarterSeat===treatment.actualStarterSeat&&
        control.deckAHash===treatment.deckAHash&&
        control.deckBHash===treatment.deckBHash;
      pairs.push({seed,sourceSeat,cohort:'prospective-fresh',
        complete,matched,control,treatment});
    }
  }
  const sum=(key,mode)=>pairs.reduce((n,p)=>
    n+(p[mode].sourceRoots?.[key]?.length??0),0);
  return {
    schema:reg.schema,registration:REG_PATH,
    sourceRank:17,referenceRank:1,enginePin:source.reg.enginePin,
    attemptedNativeArms:16,prospectivePhysicalGroups:8,
    completePairs:pairs.filter(p=>p.complete).length,
    physicallyMatchedPairs:pairs.filter(p=>p.matched).length,
    originalSourceControl:{
      nativeManualEnergyRoots:sum('manualEnergyRoots','control'),
      nativeAttackRoots:sum('attackRoots','control')
    },
    originalSourcePublicContextSpecial:{
      nativeManualEnergyRoots:sum('manualEnergyRoots','treatment'),
      nativeAttackRoots:sum('attackRoots','treatment')
    },
    pairs,competitivelyQualifiedGames:0,certifiedWinRate:null
  };
}
function save(result){
  const lock=OUTPUT+'.lock',tmp=OUTPUT+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function main(){
  const result=runExperiment();
  save(result);
  process.stdout.write('RANK17_GENERIC_SPECIAL_ENERGY '+JSON.stringify({
    attempted:result.attemptedNativeArms,
    complete:result.completePairs,matched:result.physicallyMatchedPairs,
    control:result.originalSourceControl,
    treatment:result.originalSourcePublicContextSpecial,
    competitiveGames:0
  })+'\n');
  assert.equal(result.physicallyMatchedPairs,8);
}
if(require.main===module)main();
module.exports={REG_PATH,SPECIFIC_ENERGY_NAMES,preflight,arm,runExperiment,save,main};
