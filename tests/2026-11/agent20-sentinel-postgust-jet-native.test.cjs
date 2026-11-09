'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {stage, establishSentinelLock, resolveRank1Guzma} =
  require('../agent28-sentinel-direct-artazon-native.test.cjs');
const {actorObservation} =
  require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseSentinelPostGustJet} =
  require('../../simulation/twinleaf/2026-11/agent20-sentinel-postgust-jet.cjs');

const OUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native = file => require(path.join(OUT,file));

/** @param {object} owner */
function physical(owner) {
  return [...owner.active.cards,...owner.bench.flatMap(s=>s.cards),
    ...owner.hand.cards,...owner.deck.cards,...owner.discard.cards,
    ...owner.lostzone.cards,...owner.prizes.flatMap(s=>s.cards)];
}

/**
 * Condition the original printed 60 to draw a spare Jet on its first turn,
 * exchanging Pidgey into the deck. No foreign card enters the 60.
 * @param {ReturnType<typeof stage>} x
 */
function conditionSecondJet(x) {
  const held=x.owner.hand.cards.find(c=>c.fullName==='Pidgey MEW');
  const jet=x.owner.deck.cards.find(c=>c.fullName==='Jet Energy PAL');
  assert.ok(held && jet);
  x.owner.hand.cards.splice(x.owner.hand.cards.indexOf(held),1,jet);
  x.owner.deck.cards.splice(x.owner.deck.cards.indexOf(jet),1,held);
  const cards=physical(x.owner);
  assert.equal(cards.length,60);
  assert.equal(new Set(cards).size,60);
  assert.deepEqual(cards.map(c=>c.fullName).sort(),x.sourceSixty.slice().sort());
}

/** @param {object} store */
function settleWaits(store) {
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(let n=0;n<24;n++){
    const p=store.state.prompts.find(p=>p.result===undefined);
    if(!p)break;
    assert.equal(p.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(store.hasPrompts(),false);
}

for(const seat of [0,1]){
  test('unchanged Sentinel v1 post-Guzma Jet rescue: native seat '+seat,()=>{
    const x=stage(seat);
    conditionSecondJet(x);
    const store=x.f.store, owner=x.owner;
    establishSentinelLock(x);
    assert.equal(owner.hand.cards.filter(c=>
      c.fullName==='Jet Energy PAL').length,1);
    resolveRank1Guzma(x);
    assert.equal(owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
    assert.equal(owner.active.energies.cards.length,0);
    const {PassTurnAction}=native('game/store/actions/game-actions');
    store.dispatch(new PassTurnAction(x.f.defender.id));
    settleWaits(store);
    assert.equal(store.state.activePlayer,seat);
    assert.equal(owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
    const selected=chooseSentinelPostGustJet(
      actorObservation(store.state,seat));
    assert.equal(selected?.kind,'attach-jet-to-escape-item-lock');
    assert.equal(owner.hand.cards[selected.handIndex].fullName,'Jet Energy PAL');
    assert.equal(owner.bench[selected.benchIndex]
      .getPokemonCard()?.fullName,'Bunnelby PRC');

    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const prizesBefore=owner.getPrizeLeft();
    store.dispatch(new PlayCardAction(owner.id,selected.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
      index:selected.benchIndex
    }));
    assert.equal(owner.active.getPokemonCard()?.fullName,'Bunnelby PRC');
    assert.equal(owner.active.energies.cards.filter(c=>
      c.fullName==='Jet Energy PAL').length,2);
    assert.ok(owner.bench.some(s=>
      s.getPokemonCard()?.fullName==='Vileplume AOR'));
    assert.equal(owner.getPrizeLeft(),prizesBefore);
    assert.equal(owner.energyPlayedTurn,store.state.turn);
    const cards=physical(owner);
    assert.equal(cards.length,60);
    assert.equal(new Set(cards).size,60);
    assert.deepEqual(cards.map(c=>c.fullName).sort(),x.sourceSixty.slice().sort());
    console.log('AGENT20_ORIGINAL_JET_ESCAPE_NATIVE',JSON.stringify({
      seat,originalPrintedSixty:true,stagedDraw:'Jet replacing Pidgey',
      paidGhJetTmDoubleEvolution:true,opponentGuzma:true,
      ownerTurnNativeJetToFundedBunnelby:true,
      retainedBenchedVileplume:true,ownerPhysicalCards:cards.length,
      terminalGames:0,qualifiedGames:0
    }));
  });
}
