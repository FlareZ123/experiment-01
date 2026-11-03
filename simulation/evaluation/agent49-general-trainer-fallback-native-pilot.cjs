'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash,randomUUID} = require('node:crypto');
const {initializeCards,runMatch} = require('../twinleaf/headless.cjs');
const {planAichi} = require('./aichi-pilot.cjs');
const {withActorOnlyRootPolicy} =
  require('../twinleaf/agent34-actor-only-root-policy.cjs');

const ROOT = path.resolve(__dirname,'../..');
const REG = 'results/aichi-2026/registrations/' +
  'agent49-general-trainer-after-pass-native-pilot-20261103.json';
const OUTPUT = path.join(ROOT,'agent49-generic-trainer-fallback-native.json');
const sha = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Preregistered original rank5 and rank11 exact source inventories, with
 * the game's existing documented equivalent-Basic-Energy and promo hooks.
 * No candidate transformation or arbitrary print substitution.
 */
function preflight() {
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  assert.equal(reg.schema,
    'agent49-generic-native-trainer-after-unsupported-pass-original-r5-r11-v1');
  assert.deepEqual(reg.seeds,[3280147331,2186770930]);
  assert.deepEqual(reg.primarySourceSeats,[0,1]);
  assert.equal(reg.expectedNativeArms,8);
  assert.equal(reg.maxActions,140);
  assert.equal(reg.prospective,true);
  assert.equal(reg.competitiveQualificationAllowed,false);
  const manager = initializeCards();
  assert.ok(manager.getAllCards().length>0);
  const plan = planAichi(5,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const rank5=plan.candidate.cards;
  const rank11=plan.opponents.find(d=>d.rank===11)?.cards;
  assert.equal(rank5?.length,60);
  assert.equal(rank11?.length,60);
  return {reg,rank5,rank11};
}

/**
 * Genuine Store paired policy invocation. Native Tactics is allowed to
 * propose a Trainer ONLY after a no-supported-root actor Pass in treatment;
 * the native proposal may use hidden information. This is developmental.
 * @param {object} setup Preflight original 60s and frozen registration.
 * @param {number} seed Registered 32-bit original initial-deal seed.
 * @param {0|1} seat Physical rank5 seat.
 * @param {boolean} enabled Experimental native proposal bridge.
 */
function arm(setup,seed,seat,enabled){
  const deckA=seat===0?setup.rank5:setup.rank11;
  const deckB=seat===1?setup.rank5:setup.rank11;
  const id={seed,rank5Seat:seat,nativeTrainerFallbackEnabled:enabled,
    deckAHash:sha(deckA),deckBHash:sha(deckB)};
  try {
    const trial=withActorOnlyRootPolicy(()=>runMatch({
      deckA,deckB,seed,maxActions:setup.reg.maxActions,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
      label:'agent49-original-rank5-rank11-generic-trainer-pass-diagnostic'
    }),{
      naturalEvolutionRoot:true,
      publicContextSpecialEnergy:true,
      nativeOwnerTrainerFallback:enabled
    });
    const game=trial.result;
    assert.ok(Array.isArray(game.rootActionLedger));
    assert.ok(typeof game.initialFullPhysicalDealFingerprint?.digestSha256===
      'string'&&
      game.initialFullPhysicalDealFingerprint.digestSha256.length===64);
    const actions=game.rootActionLedger.map(x=>({
      actionOrdinal:x.actionOrdinal,seat:x.playerSlot,
      globalTurn:x.turnBefore,action:x.action,
      printing:x.card??null,attackName:x.attackName??null
    }));
    return {
      ...id,error:null,
      fullPhysicalDealDigest:game.initialFullPhysicalDealFingerprint.digestSha256,
      firstTurnSlot:game.firstTurnSlot,
      nativeFinished:game.finished,
      endReason:game.endReason,nativeWinner:game.winner??null,
      nativeActions:game.actions,
      nativeRootActions:actions,
      rootActionCount:actions.length,
      rootPlayCardCount:actions.filter(x=>x.action==='PlayCardAction').length,
      rootPassCount:actions.filter(x=>x.action==='PassTurnAction').length,
      nativeTrainerBridge:trial.audit.nativeOwnerTrainerFallback??null,
      actorOwnerRootKinds:trial.audit.ownerRootIntents?.map(x=>({
        seat:x.seat??null,kind:x.kind??null,
        reason:x.reason??null
      }))??[],
      nativePolicyMayUseHiddenInformation:enabled,
      competitivelyQualified:false
    };
  } catch (error) {
    return {...id,error:String(error?.stack??error),
      fullPhysicalDealDigest:null,competitivelyQualified:false};
  }
}

/**
 * Keep all registered failed and capped arms. No filtering for better-looking
 * native action or winner totals is permitted.
 */
function experiment(execute=arm, setup=preflight()){
  const pairs=[];
  for(const seed of setup.reg.seeds)
    for(const seat of setup.reg.primarySourceSeats) {
      const control=execute(setup,seed,seat,false);
      const treatment=execute(setup,seed,seat,true);
      const complete=control.error===null&&treatment.error===null;
      pairs.push({
        seed,rank5Seat:seat,complete,
        physicallyMatched:complete&&
          control.fullPhysicalDealDigest===treatment.fullPhysicalDealDigest&&
          control.firstTurnSlot===treatment.firstTurnSlot&&
          control.deckAHash===treatment.deckAHash&&
          control.deckBHash===treatment.deckBHash,
        control,treatment
      });
    }
  return {
    schema:setup.reg.schema,
    registration:REG,enginePin:setup.reg.enginePin,
    originalSourceRanks:[5,11],maxActions:setup.reg.maxActions,
    attemptedArms:pairs.length*2,
    registeredPhysicalPairs:pairs.length,
    completePairs:pairs.filter(p=>p.complete).length,
    physicallyMatchedPairs:pairs.filter(p=>p.physicallyMatched).length,
    controlNativeRootPlayCards:pairs.reduce((n,p)=>
      n+(p.control.rootPlayCardCount??0),0),
    treatmentNativeRootPlayCards:pairs.reduce((n,p)=>
      n+(p.treatment.rootPlayCardCount??0),0),
    treatmentNativeTrainerFallbackRoots:pairs.reduce((n,p)=>
      n+(p.treatment.nativeTrainerBridge?.selectedNativeTrainerRoots??0),0),
    treatmentNativeTrainerAcceptedRoots:pairs.reduce((n,p)=>
      n+(p.treatment.nativeTrainerBridge?.acceptedNativeTrainerRoots??0),0),
    treatmentKnownPaymentVetoes:pairs.reduce((n,p)=>
      n+(p.treatment.nativeTrainerBridge?.declinedByReason?.[
        'all-known-mandatory-hand-cost-modes-impossible']??0),0),
    aborts:pairs.flatMap(p=>[p.control,p.treatment])
      .filter(x=>x.error!==null).map(x=>({
        seed:x.seed,rank5Seat:x.rank5Seat,
        fallback:x.nativeTrainerFallbackEnabled,error:x.error
      })),
    pairs,competitivelyQualifiedGames:0,estimatedWinRate:null,
    paperPlayerPolicyQualified:false,
    sourcePrintCardsRemainedUnchanged:true
  };
}

/** Atomic, locked, replaceable output writes for CI diagnostics only. */
function save(value){
  const lock=OUTPUT+'.lock';
  const temporary=OUTPUT+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n',
      {flag:'wx'});
    fs.renameSync(temporary,OUTPUT);
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function main(){
  const result=experiment();
  save(result);
  process.stdout.write('AGENT49_GENERIC_NATIVE_TRAINER '+JSON.stringify({
    attempted:result.attemptedArms,matched:result.physicallyMatchedPairs,
    complete:result.completePairs,baselinePlays:result.controlNativeRootPlayCards,
    treatedPlays:result.treatmentNativeRootPlayCards,
    fallbackRoots:result.treatmentNativeTrainerFallbackRoots,
    acceptedFallbacks:result.treatmentNativeTrainerAcceptedRoots,
    knownPaymentVetoes:result.treatmentKnownPaymentVetoes,
    aborts:result.aborts.length,competitiveGames:0
  })+'\n');
  assert.equal(result.attemptedArms,8);
  assert.equal(result.registeredPhysicalPairs,4);
  assert.equal(result.competitivelyQualifiedGames,0);
}

if(require.main===module)main();
module.exports={REG,OUTPUT,preflight,arm,experiment,save,main};
