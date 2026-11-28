'use strict';

/*
 * Manual, deliberately staged pinned-Twinleaf Store smoke check for the
 * rank13 Regidrago VS Seeker -> Crispin -> Apex/Shred endgame. This script
 * is an executable native-store integration target, not a competitive,
 * source-dealt, originally legal setup, or a registered fixture. It is NOT
 * automatically run in V3 and must not be used as win-rate evidence.
 *
 * Run after compiling pinned vendor:
 *   node simulation/twinleaf/2026-11/agent47-rank13-crispin-native-smoke.cjs
 * Optional stricter owner-root check (no V3 fixture):
 *   AGENT47_STRICT_ROOTS=1 node simulation/twinleaf/2026-11/agent47-rank13-crispin-native-smoke.cjs
 *
 * It uses the existing host's native Store, native prompt origin hook,
 * typed owner prompt projector (with one opt-in Crispin extension), native
 * validators, card objects and native PlayCard/Attack/ResolvePrompt actions.
 */

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../headless.cjs');
const {actorObservation}=require('../actor-observation-contract.cjs');
const baseProject=require('../../evaluation/2026-11/agent36-prompt-projection.cjs');
const rootAdapter=require('../../evaluation/2026-11/agent36-native-action-frontier.cjs');
const knownCapFree=require('../../evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const protocol=require('../../evaluation/2026-11/agent49-policy-protocol.cjs');
const {installPromptProvenanceHook}=
  require('../../evaluation/2026-11/agent36-prompt-provenance.cjs');
const {projectRank13CrispinPrompt}=
  require('../../evaluation/2026-11/agent47-rank13-crispin-attach-projection.cjs');
const workerModule=require('../../evaluation/2026-11/agent47-rank13-crispin-overlay.cjs');

const output=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(output,relative));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {Store}=native('game/store/store');
const {GameError}=native('game/game-error');
const {EnergyCard}=native('game/store/card/energy-card');
const {PokemonCard}=native('game/store/card/pokemon-card');
const {TrainerCard}=native('game/store/card/trainer-card');
const {ActionEnumerator}=native('advanced-bot/action-enumerator');
const {Simulator}=native('game/bots/simulator');
const {SuperType,EnergyType,CardType,TrainerType}=
  native('game/store/card/card-types');

const ownerPrintings=Object.freeze({
  active:'Regidrago VSTAR SIT',
  basic:'Regidrago V SIT',
  donor:'Dialga-GX UPR',
  vsSeeker:'VS Seeker PHF',
  crispin:'Crispin SCR',
  guzma:'Guzma BUS',
  grass:'Grass Energy MEE',
  fire:'Fire Energy MEE',
  foeActive:'Mimikyu GRI',
  foeBench:'Pidgey MEW'
});

function setup(seat) {
  const x=stage(seat),manager=initializeCards();
  let nextId=50000+seat*1000;
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Native card missing: '+name);
    found.id=nextId++;
    return found;
  };
  // Stage only known printings in a plausible in-play evolution stack.
  // No source-dealt / prior-turn evolution sequence is claimed.
  const basic=card(ownerPrintings.basic),vstar=card(ownerPrintings.active),
    grass1=card(ownerPrintings.grass),
    fire1=card(ownerPrintings.fire),mimikyu=card(ownerPrintings.foeActive);
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(basic,vstar,grass1,fire1);
  x.owner.active.pokemonPlayedTurn=2;
  assert.equal(x.owner.active.isEvolved(),true);
  x.owner.active.energies.cards.push(grass1,fire1);
  for(const slot of x.owner.bench) {
    slot.cards.length=0;slot.energies.cards.length=0;
  }
  x.owner.bench[0].cards.push(card('Budew ASC'));
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(mimikyu);
  for(const slot of x.opponent.bench) {
    slot.cards.length=0;slot.energies.cards.length=0;
  }
  x.opponent.bench[0].cards.push(card(ownerPrintings.foeBench));
  x.owner.discard.cards.length=0;
  x.owner.discard.cards.push(card(ownerPrintings.donor),
    card(ownerPrintings.crispin),card(ownerPrintings.guzma));
  x.owner.hand.cards.length=0;
  x.owner.hand.cards.push(card(ownerPrintings.vsSeeker));
  x.owner.deck.cards.length=0;
  for(const name of [ownerPrintings.grass,ownerPrintings.grass,
    ownerPrintings.fire,ownerPrintings.fire,'Psychic Energy SVE']){
    x.owner.deck.cards.push(card(name));
  }
  x.owner.prizes.splice(1);
  x.state.turn=5;
  x.state.activePlayer=seat;
  x.state.phase=x.GamePhase.PLAYER_TURN;
  x.owner.supporterTurn=0;
  x.owner.usedVSTAR=true; // fixed game: no VSTAR-power divergence
  x.owner.usedGX=true; // copied Shred, not extra-turn Timeless-GX
  assert.equal(x.owner.prizes.length,1);
  assert.equal(x.opponent.active.getPokemonCard(),mimikyu);
  return {...x,source:ownerPrintings,card};
}

function pending(store) {
  return store.state.prompts.find(p=>p?.result===undefined)??null;
}
function assertSelected(decision,promptProjection) {
  protocol.validateDecision(decision,promptProjection,new Set());
  if(decision.kind!=='select-choice' && decision.kind!=='select-choices')
    throw Error('R13_CRISPIN_NATIVE_UNSUPPORTED_DECISION:'+decision.kind);
  return decision;
}
function nativeContext() {
  return {Store,GameError,ResolvePromptAction,PokemonCard,TrainerCard,
    EnergyCard,EnergyType,CardType,TrainerType,
    ActionEnumerator,Simulator,SuperType,PlayerType,SlotType};
}
function resolveOne(x,policy,provenance,history) {
  const prompt=pending(x.store);
  assert.ok(prompt,'No native pending prompt');
  const context={prompt,state:x.store.state,actorSeat:x.seat,
    native:nativeContext(),store:x.store,provenanceHook:provenance};
  const origin=provenance.getPromptProvenance(prompt);
  // A card's ShowCardsPrompt can be owned by the *other* player. Never feed
  // such host-only presentations to the actor-bound prompt projector, which
  // correctly rejects owner-seat mismatches before classifying a prompt.
  const host=baseProject.hostOnlyPrompt(prompt,origin);
  if(host?.hostOnly){
    // Host-only presentation/shuffle: no fabricated owner worker token.
    // Fixed shuffle sample is intentionally NOT competitive physical RNG.
    const one=baseProject.resolveHostOnlyPrompt({
      ...context,physicalRandom:()=>0.271828,
      enginePin:PIN,dispatch:true});
    history.push({kind:'host-only',promptType:prompt.constructor.name,
      promptedSeat:x.store.state.players.findIndex(p=>p.id===prompt.playerId),
      reason:host.reason??null,effectName:origin?.effectName??null});
    return one;
  }
  assert.equal(prompt.playerId,x.owner.id,
    'Only the matching actor owns discretionary native prompts');
  const provider=origin?.sourceCard?.name==='Crispin'?
    projectRank13CrispinPrompt:baseProject.projectPrompt;
  const projected=provider(context);
  assert.equal(projected.hostOnly,false,'host-only prompt was not intercepted');
  const actor=actorObservation(x.store.state,x.seat);
  const request={role:'opponent',seat:x.seat,
    observation:actor,prompt:projected.promptProjection};
  const decision=assertSelected(policy.decide(request),projected.promptProjection);
  const selected=decision.kind==='select-choice'?[decision.token]:decision.tokens;
  history.push({kind:'actor-prompt',promptType:prompt.constructor.name,
    source:projected.promptProjection.source,
    selected: selected.map(token=>projected.promptProjection.choices
      .find(choice=>choice.token===token)?.printing??null)});
  return baseProject.dispatchPromptChoice({
    store:x.store,prompt,state:x.store.state,actorSeat:x.seat,
    projection:projected,decision,native:nativeContext()});
}
function settlePrompts(x,policy,provenance,history,limit=16) {
  for(let i=0;i<limit;i++){
    if(!pending(x.store))return;
    resolveOne(x,policy,provenance,history);
  }
  throw Error('R13_CRISPIN_NATIVE_PROMPT_LOOP_EXCEEDED_'+limit);
}
function playHand(x,printing) {
  assert.equal(pending(x.store),null,'Cannot play while native prompt pending');
  const idx=x.owner.hand.cards.findIndex(card=>card.fullName===printing);
  assert.ok(idx>=0,'Expected actor hand printing unavailable: '+printing);
  x.store.dispatch(new PlayCardAction(x.owner.id,idx,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
}
function dispatchWorkerRoot(x,policy,wanted,history){
  const view=actorObservation(x.store.state,x.seat);
  assert.equal(view.decisionKind,'owner-root');
  const fullNative=nativeContext();
  // The base ActionEnumerator does not attach the necessary attack-source
  // identity binding; use the same pinned known-cap adapter as the V3 host.
  const enumerator=knownCapFree.createKnownCapFreeActionEnumerator({
    native:fullNative,enginePin:PIN
  });
  const validated=rootAdapter.buildNativeActionFrontier({
    state:x.store.state,actorSeat:x.seat,native:fullNative,
    enumerator,maxItems:64
  });
  knownCapFree.assertKnownCapFreeAdapterAdmissionClear({
    enumerator,enginePin:PIN,frontierDiagnostics:validated.diagnostics
  });
  const request={role:'opponent',seat:x.seat,observation:view,
    prompt:null,actionFrontier:validated.actionFrontier};
  const decision=policy.decide(request);
  const accepted=protocol.validateDecision(decision,null,
    new Set(validated.actionFrontier.items.map(item=>item.token)));
  assert.equal(accepted.kind,'select-action',
    'Full worker must choose a native root action');
  const chosen=validated.actionFrontier.items
    .find(item=>item.token===accepted.token);
  assert.ok(chosen,'selected root action lacks a native frontier item');
  const selectedPrinting=chosen.actorPrinting??null;
  const selectedAttack=chosen.attackName??null;
  if(wanted.startsWith('attack:')){
    assert.equal(chosen.kind,'attack');
    assert.equal(selectedAttack,wanted.slice('attack:'.length));
  }else{
    assert.equal(chosen.kind,'play-card');
    assert.equal(selectedPrinting,wanted);
  }
  const action=rootAdapter.selectedNativeAction(validated,accepted.token);
  x.store.dispatch(action);
  history.push({kind:'actor-root',chosenKind:chosen.kind,
    chosenPrinting:selectedPrinting,chosenAttack:selectedAttack,
    enumeratedCount:validated.diagnostics.enumeratedCount,
    validatedCount:validated.diagnostics.validatedCount,
    nativeDispatched:true});
}

function activeEnergyTypes(x){
  return x.owner.active.energies.cards.map(c=>c.name);
}

function runSeat(seat) {
  assert.ok(seat===0||seat===1);
  const x=setup(seat),history=[],provenance=installPromptProvenanceHook(x.store);
  const strictRoots=process.env.AGENT47_STRICT_ROOTS==='1';
  const policy=workerModule.createPolicy({role:'opponent',seat,
    policyVersion:workerModule.POLICY_VERSION,config:{}});
  try{
    assert.deepEqual(activeEnergyTypes(x),['Grass Energy','Fire Energy']);
    if(strictRoots)dispatchWorkerRoot(x,policy,ownerPrintings.vsSeeker,history);
    else playHand(x,ownerPrintings.vsSeeker);
    settlePrompts(x,policy,provenance,history);
    assert.equal(x.owner.hand.cards.some(c=>c.fullName===ownerPrintings.crispin),true,
      'native VS Seeker must recover the exact Crispin');
    if(strictRoots)dispatchWorkerRoot(x,policy,ownerPrintings.crispin,history);
    else playHand(x,ownerPrintings.crispin);
    settlePrompts(x,policy,provenance,history);
    assert.deepEqual(activeEnergyTypes(x).sort(),
      ['Fire Energy','Grass Energy','Grass Energy'].sort(),
      'native Crispin must attach one selected Grass to active');
    assert.equal(x.owner.supporterTurn,1,
      'native Crispin must consume the one-Supporter allowance');
    const before=x.opponent.active.damage;
    if(strictRoots)dispatchWorkerRoot(x,policy,'attack:Apex Dragon',history);
    else x.store.dispatch(new AttackAction(x.owner.id,'Apex Dragon'));
    settlePrompts(x,policy,provenance,history);
    const won=x.owner.prizes.length===0;
    assert.ok(x.opponent.active.damage>=before+80 || won,
      'copied Shred must settle 80 damage or KO final-prize opponent');
    assert.equal(won,true,'staged native owner must take its last Prize');
    const chosen=history.filter(row=>row.kind==='actor-prompt');
    assert.ok(chosen.some(row=>row.source.sourcePrinting===ownerPrintings.vsSeeker &&
      row.selected.includes(ownerPrintings.crispin)));
    assert.ok(chosen.some(row=>row.source.sourcePrinting===ownerPrintings.crispin &&
      row.selected.some(x=>x?.startsWith('Grass Energy'))));
    return {seat,nativeStoreActionSeq:['VS Seeker','Crispin','Apex Dragon'],
      nativeOwnerPromptHistory:history,
      finalOwnerPrizes:x.owner.prizes.length,
      nativeStagedLastPrize:true,strictRoots,qualifiedGame:false,
      originalFull60:false,paperSetupLegal:false};
  }finally{
    provenance.restore();
  }
}
function main() {
  return {schema:'agent47-rank13-crispin-staged-native-store-smoke-v2',
    enginePin:PIN,policyVersion:workerModule.POLICY_VERSION,
    cases:[runSeat(0),runSeat(1)],qualifiedCompetitiveGames:0,
    note:'Staged native-only integration check. Must be run and validated by owner before any game/CI admission.'};
}
if(require.main===module){
  try{process.stdout.write(JSON.stringify(main(),null,2)+'\n');}
  catch(e){console.error('AGENT47_CRISPIN_NATIVE_SMOKE_FAILED',e.stack??String(e));
    process.exitCode=1;}
}
module.exports={main,runSeat,setup,settlePrompts,resolveOne};
