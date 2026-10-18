'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installCancelingCologneOncePerTurnHook} =
  require('./canceling-cologne-once-per-turn-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const pinned = name => require(path.join(output, name));

/**
 * Stage an otherwise ordinary two-player paper Expanded turn. Every Cologne
 * action uses the pinned Store dispatcher and printed physical cards.
 * @returns {object} Instrumented eligibility and card-zone evidence.
 */
function runTwoCologneBoard() {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} fullName */
  const card = fullName => {
    const found = manager.getCardByName(fullName);
    assert.ok(found, 'Unknown pinned card ' + fullName);
    found.id = nextId++;
    return found;
  };
  const {Store} = pinned('game/store/store');
  const {Player} = pinned('game/store/state/player');
  const {GamePhase} = pinned('game/store/state/state');
  const {CardList} = pinned('game/store/state/card-list');
  const {Format} = pinned('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    pinned('game/store/actions/play-card-action');
  const {CAN_PLAY_TRAINER_CARD} =
    pinned('game/store/prefabs/trainer-prefabs');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const opponent = new Player();
  const mine = new Player();
  opponent.id = 101;
  mine.id = 202;
  opponent.active.cards.push(card('Iron Thorns ex TWM'));
  mine.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  state.players = [opponent, mine];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;
  for (const player of state.players) {
    player.deck.cards.push(card('Psychic Energy SVE'), card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const first = card('Canceling Cologne ASR');
  const second = card('Canceling Cologne ASR');
  assert.notStrictEqual(first, second, 'Two separate physical Cologne cards required');
  mine.hand.cards.push(first, second);
  const target = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const firstEligible = CAN_PLAY_TRAINER_CARD(store,state,mine,first);
  assert.equal(firstEligible,true,'First Cologne must remain playable');
  store.dispatch(new PlayCardAction(mine.id,0,target));
  const afterFirst = {
    firstInDiscard:mine.discard.cards.includes(first),
    secondInHand:mine.hand.cards.includes(second),
    firstMarker:opponent.marker.hasMarker('CANCELING_COLOGNE_MARKER',first),
    pending:state.prompts.filter(p=>p.result===undefined).length
  };
  assert.deepEqual(afterFirst,{
    firstInDiscard:true,secondInHand:true,firstMarker:true,pending:0
  });
  const secondEligible = CAN_PLAY_TRAINER_CARD(store,state,mine,second);

  // Headless bots reason in speculative Simulator clones. Verify the
  // research Player field transfers, the exact second-card legality survives
  // cloning, and no clone-local action changes the original Store.
  const {Simulator} = pinned('game/bots/simulator');
  const sourceHand = mine.hand.cards.slice();
  const sourceDiscard = mine.discard.cards.slice();
  const sourceMarkers = opponent.marker.markers.slice();
  const simulation = new Simulator(state);
  const cloneState = simulation.store.state;
  const cloneMine = cloneState.players.find(p=>p.id===mine.id);
  const cloneOpponent = cloneState.players.find(p=>p.id===opponent.id);
  const cloneSecond = cloneMine.hand.cards.find(c=>c.fullName===second.fullName);
  assert.ok(cloneSecond,'Simulated hand lost the second printed Cologne');
  const speculative = {
    secondEligible:CAN_PLAY_TRAINER_CARD(simulation.store,cloneState,cloneMine,cloneSecond),
    dispatchError:null,
    secondInHand:null,
    secondMarker:null
  };
  try {
    simulation.dispatch(new PlayCardAction(cloneMine.id,
      cloneMine.hand.cards.indexOf(cloneSecond),target));
  } catch(error) {
    speculative.dispatchError = error.constructor.name+': '+error.message;
  }
  speculative.secondInHand = cloneMine.hand.cards.includes(cloneSecond);
  speculative.secondMarker = cloneOpponent.marker.hasMarker('CANCELING_COLOGNE_MARKER',
    cloneSecond);
  const originalUntouchedByClone =
    sourceHand.length===mine.hand.cards.length &&
    sourceHand.every((c,i)=>c===mine.hand.cards[i]) &&
    sourceDiscard.length===mine.discard.cards.length &&
    sourceDiscard.every((c,i)=>c===mine.discard.cards[i]) &&
    sourceMarkers.length===opponent.marker.markers.length &&
    sourceMarkers.every((m,i)=>m===opponent.marker.markers[i]);

  const handIndex = mine.hand.cards.indexOf(second);
  assert.ok(handIndex >= 0);
  let secondDispatchError = null;
  try {
    store.dispatch(new PlayCardAction(mine.id,handIndex,target));
  } catch (error) {
    secondDispatchError = error.constructor.name + ': ' + error.message;
  }
  const secondInHand = mine.hand.cards.includes(second);
  const secondInDiscard = mine.discard.cards.includes(second);
  const secondMarker = opponent.marker.hasMarker('CANCELING_COLOGNE_MARKER',second);
  const nextTurnCanPlay = second.canPlay(store,{...state,turn:state.turn+2},mine);
  return {
    firstEligible,afterFirst,secondEligible,speculative,originalUntouchedByClone,
    secondDispatchError,secondInHand,secondInDiscard,secondMarker,nextTurnCanPlay,
    pending:state.prompts.filter(p=>p.result===undefined).length
  };
}

function run() {
  const unpatched = runTwoCologneBoard();
  const restore = installCancelingCologneOncePerTurnHook();
  const repeatRestore = installCancelingCologneOncePerTurnHook();
  assert.strictEqual(repeatRestore,restore,'Hook must be idempotent');
  let corrected;
  try {
    corrected = runTwoCologneBoard();
  } finally {
    restore();
    repeatRestore();
  }
  const restored = runTwoCologneBoard();
  assert.equal(unpatched.firstEligible,true);
  assert.equal(unpatched.secondEligible,true,
    'Pinned canPlay accepted redundant same-turn Cologne');
  assert.equal(unpatched.secondInDiscard,true,
    'Stock engine actually consumed the second illegal same-turn Cologne');
  assert.equal(unpatched.secondMarker,true,
    'Stock engine applied the duplicate opponent Ability-lock marker');
  assert.equal(unpatched.speculative.secondEligible,true);
  assert.equal(unpatched.speculative.secondInHand,false);
  assert.equal(unpatched.speculative.secondMarker,true);
  assert.equal(unpatched.originalUntouchedByClone,true,
    'Original state changed while running a speculative duplicate action');
  assert.equal(corrected.firstEligible,true);
  assert.equal(corrected.secondEligible,false,
    'Paper-ruling guard must reject second Cologne');
  assert.equal(corrected.secondInHand,true);
  assert.equal(corrected.secondInDiscard,false);
  assert.equal(corrected.secondMarker,false);
  assert.equal(corrected.speculative.secondEligible,false,
    'A cloned turn must retain the first Cologne play turn');
  assert.equal(corrected.speculative.secondInHand,true);
  assert.equal(corrected.speculative.secondMarker,false);
  assert.match(corrected.speculative.dispatchError||'', /CANNOT_PLAY_THIS_CARD|GameError/);
  assert.equal(corrected.originalUntouchedByClone,true,
    'Guarded speculative action altered the original state');
  assert.match(corrected.secondDispatchError||'', /CANNOT_PLAY_THIS_CARD|GameError/,
    'The real Store must veto before moving the second Item out of hand');
  assert.equal(corrected.nextTurnCanPlay,true,
    'A separate future turn must not remain blocked');
  assert.deepEqual(restored,unpatched,'Uninstall must restore stock behavior');
  return {
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    officialRuling:'pokemon-card.com Q&A: second Canceling Cologne in one turn cannot be played',
    qualification:'staged true Store action only; no source-dealt match or competitive win inference',
    unpatched,corrected,restoredExactly:true
  };
}

if (require.main === module) {
  console.log('CANCELING_COLOGNE_REPEAT_PAPER_GATE',JSON.stringify(run(),null,2));
}
module.exports = {runTwoCologneBoard,run};
