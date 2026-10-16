'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {Store} = require(path.join(output,'game/store/store'));
const {GamePhase} = require(path.join(output,'game/store/state/state'));

const seed = 20367160;
const sourceHand = [
  'Guzma', "Trainers' Mail", 'Guzma & Hala', 'Tropical Beach',
  'Thunder Mountain Prism Star', 'Cynthia & Caitlin', 'Palace Belt'
];

/** @param {object} p */
function sourceSnapshot(p) {
  /** @param {object} slot */
  const names = slot => slot.cards.map(card=>card.fullName);
  const prizes = p.prizes.flatMap(names);
  const deck = names(p.deck);
  const hand = names(p.hand);
  const discard = names(p.discard);
  const location = {
    hand: hand.filter(x=>x.startsWith('Double Colorless Energy')),
    deck: deck.filter(x=>x.startsWith('Double Colorless Energy')),
    prizes: prizes.filter(x=>x.startsWith('Double Colorless Energy')),
    discard: discard.filter(x=>x.startsWith('Double Colorless Energy')),
    active: names(p.active).filter(x=>x.startsWith('Double Colorless Energy'))
  };
  return {
    active: p.active.getPokemonCard()?.fullName || null,
    hand, prizes, deckCount: deck.length, discard, doubleColorless: location,
    stadium: names(p.stadium),
    occupiedBench: p.bench.flatMap(names).filter(Boolean)
  };
}

/**
 * Record one privileged truth snapshot after the normal bot proposes its
 * first turn-two action, before Store dispatch. Never expose this information
 * to the bot or mutate the Store. The hook is always restored.
 * @template T
 * @param {()=>T} fn
 * @returns {{out:T,observed:object|null}}
 */
function withSourceOpeningProbe(fn) {
  const original = Store.prototype.dispatch;
  let observed = null;
  Store.prototype.dispatch = function observedDispatch(action,...rest) {
    const state = this.state;
    if (!observed && state.turn === 2 &&
      state.phase === GamePhase.PLAYER_TURN && state.activePlayer === 1 &&
      state.players.length === 2 &&
      !state.prompts.some(prompt=>prompt.result === undefined)) {
      const player = state.players[1];
      observed = {
        turn:state.turn,slot:state.activePlayer,
        proposedAction:action.constructor.name,
        proposedCard:action.constructor.name === 'PlayCardAction' ?
          player.hand.cards[action.handIndex]?.fullName : null,
        ...sourceSnapshot(player)
      };
    }
    return original.call(this,action,...rest);
  };
  try { return {out:fn(),observed}; }
  finally { Store.prototype.dispatch = original; }
}

/** @param {object} game */
function signature(game) {
  const fields = ['seed','actions','turns','finished','winner','firstTurnSlot',
    'verifiedByDrawLog','actionCounts','cardsPlayedBySeat','attackTrace',
    'decisionTrace','deckHashes','prizesRemaining','finalState','phase'];
  const evidence = Object.fromEntries(fields.map(field=>[field,game[field]]));
  return crypto.createHash('sha256')
    .update(JSON.stringify(evidence)).digest('hex');
}

function main() {
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const rank6 = plan.opponents.find(o=>o.rank===6);
  assert.ok(plan.candidate.cards && rank6?.cards,
    'Both exact source inventories must resolve under declared print policy');
  const request = {
    deckA:plan.candidate.cards, deckB:rank6.cards,seed,maxActions:110,
    strictPromptValidation:true, forestSealSearchCorrection:true,
    doubleDragonRecovery:true, supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const plain = runMatch(request);
  const {out,observed} = withSourceOpeningProbe(()=>runMatch(request));
  assert.equal(signature(plain),signature(out),
    'Privileged observation must not change source-dealt gameplay');
  assert.equal(out.verifiedByDrawLog,true);
  assert.equal(out.firstTurnSlot,0,
    'This archived physical seed requires candidate A to start');
  assert.ok(observed,'Did not reach physical B first-turn choice');
  const names = observed.hand.map(x=>x.split(' ').slice(0,-1).join(' '));
  const sourceNames = sourceHand.slice().sort();
  const actualNames = observed.hand.map(print=>{
    const all = [...sourceHand, 'Iron Thorns ex','Double Colorless Energy'];
    return all.find(name=>print.startsWith(name+' ')) ||
      print.replace(/ [^ ]+$/,'');
  }).sort();
  const exactHandMatch = sourceNames.length===actualNames.length &&
    sourceNames.every((value,index)=>value===actualNames[index]);
  const dceZoneCounts = Object.fromEntries(Object.entries(observed.doubleColorless)
    .map(([zone,cards])=>[zone,cards.length]));
  assert.equal(Object.values(dceZoneCounts).reduce((a,b)=>a+b,0),1,
    'Source rank6 must have exactly one DCE across all zones');
  const digest = signature(out);
  const record = {
    source:'Aichi rank6 published 60-card printing resolution',
    engine:out.engine,seed,observedTurn:observed.turn,
    observedPlayerSlot:observed.slot,firstTurnSlot:out.firstTurnSlot,
    originalSevenCardNames:sourceHand,actualHandPrintings:observed.hand,
    sourceHandMatch:exactHandMatch,proposedAction:observed.proposedAction,
    proposedCard:observed.proposedCard,
    active:observed.active,prizePrintings:observed.prizes,
    dceZoneCounts,prizeCount:observed.prizes.length,
    remainingDeckSize:observed.deckCount,
    supporterDiscarded:observed.discard,
    fullyDeterministicGameplaySignature:digest,
    observationNoninterferenceVerified:true,
    policy:out.policy,sourceDeckHashes:out.deckHashes,
    note:'Privileged physical Prize inspection is research evidence only; never allowed in bot decisions before K1. Same seed and printed decks do not establish policy competence or tournament win rate.'
  };
  console.log(JSON.stringify(record,null,2));
  return record;
}
if(require.main===module) main();
module.exports={sourceSnapshot,withSourceOpeningProbe,signature,main};
