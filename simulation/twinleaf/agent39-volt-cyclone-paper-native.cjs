'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent11-native-last-bench-locked-dedenne.cjs');
const {initializeCards}=require('./headless.cjs');
const {withPaperPromptPortfolio,VERSION}=
  require('./agent39-paper-prompt-portfolio.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(root,p));

/**
 * Stage genuine original Iron Thorns ex TWM card/prompt classes in a real
 * Store. Directly invoke the printed after-attack reducer, holding attack
 * payment and damage outside this narrow prompt contract control.
 * @param {0|1} sourceSeat
 * @returns {object}
 */
function prepare(sourceSeat){
  const scene=stage(1-sourceSeat);
  const manager=initializeCards();
  const energy=manager.getCardByName('Double Colorless Energy SUM');
  const bench=manager.getCardByName('Iron Thorns ex TWM');
  assert.ok(energy&&bench);
  energy.id=99031;bench.id=99032;
  scene.opponent.active.cards.push(energy);
  scene.opponent.active.energies.cards.push(energy);
  scene.opponent.bench[0].cards.push(bench);
  scene.state.activePlayer=sourceSeat;
  const {AfterAttackEffect}=load('game/store/effects/game-phase-effects');
  const attacker=scene.opponent.active.getPokemonCard();
  assert.equal(attacker.fullName,'Iron Thorns ex TWM');
  const effect=new AfterAttackEffect(scene.opponent,scene.owner,
    attacker.attacks[0]);
  return {...scene,sourceSeat,energy,attacker,effect};
}

/**
 * @param {object} scene
 * @returns {object}
 */
function generatePrompt(scene){
  scene.attacker.reduceEffect(scene.store,scene.state,scene.effect);
  const prompt=scene.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name==='AttachEnergyPrompt');
  assert.ok(prompt,'Real TWM Volt Cyclone must create native AttachEnergyPrompt');
  return prompt;
}

/** @param {0|1} seat */
function verifySeat(seat){
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const legitimateTo={player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:0};
  const invalid=prepare(seat);
  const nativeUnchecked=generatePrompt(invalid);
  assert.equal(nativeUnchecked.options.min,1);
  assert.equal(nativeUnchecked.options.max,1);
  assert.equal(nativeUnchecked.options.allowCancel,false);
  // The native Store accepts an empty submission despite min=1. The
  // attack's required transfer then does nothing, a paper-inaccurate effect.
  invalid.store.dispatch(new ResolvePromptAction(nativeUnchecked.id,[]));
  assert.ok(invalid.opponent.active.energies.cards.includes(invalid.energy));
  const live=prepare(seat);
  const beforeProto=load('game/store/store').Store.prototype.dispatch;
  const beforeReduce=live.attacker.constructor.prototype.reduceEffect;
  const observed=withPaperPromptPortfolio(()=>{
    const prompt=generatePrompt(live);
    const before={
      attackerEnergy:live.opponent.active.energies.cards.length,
      benchedEnergy:live.opponent.bench[0].energies.cards.length,
      unresolved:prompt.result===undefined
    };
    // Genuine pinned Store must not turn a stale identity into a settled reply.
    live.store.dispatch(new ResolvePromptAction(prompt.id+1000000,
      [{card:live.energy,to:legitimateTo}]));
    assert.equal(prompt.result,undefined);
    assert.ok(live.opponent.active.energies.cards.includes(live.energy));
    assert.ok(!live.opponent.bench[0].energies.cards.includes(live.energy));
    assert.throws(()=>live.store.dispatch(
      new ResolvePromptAction(prompt.id,[])),
    /PAPER_PROMPT_INVALID:Iron Thorns ex TWM:exactly-one-energy-required/);
    assert.deepEqual({
      attackerEnergy:live.opponent.active.energies.cards.length,
      benchedEnergy:live.opponent.bench[0].energies.cards.length,
      unresolved:prompt.result===undefined
    },before,'Paper veto must occur before native Store mutation');
    live.store.dispatch(new ResolvePromptAction(prompt.id,
      [{card:live.energy,to:legitimateTo}]));
    assert.ok(!live.opponent.active.energies.cards.includes(live.energy));
    assert.ok(live.opponent.bench[0].energies.cards.includes(live.energy));
    return {promptId:prompt.id,physicalEnergyTransferred:true};
  },{liveStore:live.store});
  assert.equal(load('game/store/store').Store.prototype.dispatch,beforeProto);
  assert.equal(live.attacker.constructor.prototype.reduceEffect,beforeReduce);
  assert.equal(observed.audit.sourceMarkedPromptCount,1);
  assert.equal(observed.audit.paperInvalidVetoed,1);
  assert.equal(observed.audit.paperVerifiedNativeAccepted,1);
  assert.equal(observed.audit.liveNativeReturnedWithoutThrow,2);
  assert.equal(observed.audit.liveNativeSilentNoop,1);
  assert.equal(observed.audit.liveNativePromptSettled,1);
  assert.equal(observed.audit.livePaperVerifiedPhysicalEffect,1);
  assert.deepEqual(observed.audit.events.map(e=>e.nativeAccepted),
    [false,false,true]);
  return {seat,sourcePrinting:'Iron Thorns ex TWM',
    unguardedNativeEmptyTransferAccepted:true,
    guardedInvalidRejectedBeforeMutation:true,
    guardedValidEnergyTransferred:true,
    nativeStalePromptNoopDetected:true,
    eventCounts:{
      marked:observed.audit.sourceMarkedPromptCount,
      invalid:observed.audit.paperInvalidVetoed,
      verified:observed.audit.paperVerifiedNativeAccepted
    },status:'NARROW_NATIVE_PROMPT_CONTRACT_ONLY'};
}

/**
 * Distinguish a mandatory transfer with a legal target from a printed
 * non-applicable effect when no own Bench Pokémon exists. The original
 * reducer deliberately returns without a prompt in that case.
 * @param {0|1} seat
 * @returns {object}
 */
function verifyNoBenchSeat(seat){
  const scene=prepare(seat);
  scene.opponent.bench[0].cards.length=0;
  assert.equal(scene.opponent.bench.every(slot=>slot.cards.length===0),true);
  const startingEnergy=scene.opponent.active.energies.cards.length;
  const witnessed=withPaperPromptPortfolio(()=>{
    scene.attacker.reduceEffect(scene.store,scene.state,scene.effect);
    assert.equal(scene.state.prompts.length,0);
    assert.equal(scene.opponent.active.energies.cards.length,startingEnergy);
    return true;
  },{liveStore:scene.store});
  assert.equal(witnessed.result,true);
  assert.equal(witnessed.audit.sourceMarkedPromptCount,0);
  assert.equal(witnessed.audit.resolutionCount,0);
  return {seat,sourcePrinting:'Iron Thorns ex TWM',
    noOwnBenchPokemon:true,noTransferPromptGenerated:true,
    sourceEnergyRetained:true,status:'PRINTED_NO_ELIGIBLE_RECIPIENT'};
}

function run(){
  return {schema:VERSION,pinnedEngine:PIN,
    cases:[verifySeat(0),verifySeat(1)],
    noBenchCases:[verifyNoBenchSeat(0),verifyNoBenchSeat(1)],
    nativeStoreUsed:true,
    originalPhysical60:false,fullMatch:false,competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={prepare,generatePrompt,verifySeat,verifyNoBenchSeat,run};
