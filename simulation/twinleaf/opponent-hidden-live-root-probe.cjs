'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {actionSignature}=require('./rank10-hidden-order-live-probe.cjs');
const {stateGraphFingerprint}=
  require('./rank10-live-decision-noninterference.cjs');
const {captureTacticScores,compareTacticScores}=
  require('./tactic-score-trace.cjs');

/** @param {object} card @returns {'trainer'|'energy'|'pokemon'|'other'} */
function cardKind(card){
  if(card.trainerType!==undefined)return 'trainer';
  if(card.energyType!==undefined)return 'energy';
  if(card.stage!==undefined)return 'pokemon';
  return 'other';
}

/**
 * Offline candidate-exchange selection. The hidden cards themselves may be
 * completely unknown to the actor; selecting a contrast from their actual
 * identities is permitted only in this detached postgame diagnostic.
 * @param {object[]} hand
 * @param {object[]} deck
 * @returns {{handIndex:number,deckIndex:number,kindPair:string}|null}
 */
function chooseHiddenHandDeckSwap(hand,deck){
  let best=null;
  for(let hi=0;hi<hand.length;hi++){
    for(let di=0;di<deck.length;di++){
      if(hand[hi].fullName===deck[di].fullName)continue;
      const a=cardKind(hand[hi]),b=cardKind(deck[di]);
      const score=a!==b?2:1;
      if(best===null||score>best.score){
        best={handIndex:hi,deckIndex:di,kindPair:a+'-vs-'+b,score};
      }
    }
  }
  return best?{handIndex:best.handIndex,deckIndex:best.deckIndex,
    kindPair:best.kindPair}:null;
}

/** @param {object} player */
function hiddenZoneFingerprint(player){
  return [...player.hand.cards,...player.deck.cards]
    .map(card=>card.fullName+'#'+String(card.id??'unknown')).sort();
}

/**
 * Compare the *whole* fresh bot at one genuine owner root using a deferred
 * detached opponent hand/deck swap. A swap is a conditional hidden-world
 * counterexample only: complete observation history is not available here.
 * It is never installed in the live match or treated as a sampled outcome.
 *
 * @param {object} source Original authentic Store State (read-only).
 * @param {number} actorId Actual owner player ID.
 * @param {()=>object} newBot Fresh independent bot with frozen actual options.
 * @param {(state:object)=>object} cloneState Fully isolated State clone.
 * @param {()=>()=>number} makeRandom Independent equal-seeded policy RNG.
 * @param {{fingerprint?:(s:object)=>unknown}} [dependencies] Pure-test injection.
 */
function compareOpponentHiddenSwap(source,actorId,newBot,cloneState,makeRandom,
  dependencies={}){
  assert.equal(typeof cloneState,'function');
  assert.equal(typeof newBot,'function');
  assert.equal(typeof makeRandom,'function');
  const fingerprint=dependencies.fingerprint??stateGraphFingerprint;
  const sourceBefore=fingerprint(source);
  const own=source.players.find(player=>player.id===actorId);
  const originalOther=source.players.find(player=>player.id!==actorId);
  assert.ok(own&&originalOther&&source.players.length===2);
  const physical=cloneState(source);
  const alternate=cloneState(source);
  const opponent=alternate.players.find(player=>player.id!==actorId);
  const sourceHidden=hiddenZoneFingerprint(originalOther);
  assert.deepEqual(hiddenZoneFingerprint(opponent),sourceHidden,
    'Detached alternate changed the opponent hand/deck inventory');
  const option=chooseHiddenHandDeckSwap(
    opponent.hand.cards,opponent.deck.cards);
  if(option){
    const {handIndex,deckIndex}=option;
    const oldHand=opponent.hand.cards[handIndex];
    opponent.hand.cards[handIndex]=opponent.deck.cards[deckIndex];
    opponent.deck.cards[deckIndex]=oldHand;
    assert.deepEqual(hiddenZoneFingerprint(opponent),sourceHidden,
      'Hidden swap must conserve every opponent card instance');
    assert.equal(opponent.hand.cards.length,originalOther.hand.cards.length);
    assert.equal(opponent.deck.cards.length,originalOther.deck.cards.length);
  }

  function evaluate(state){
    const prior=Math.random;
    Math.random=makeRandom();
    try{
      const bot=newBot();
      const evaluated=captureTacticScores(bot,()=>bot.decodeNextAction(state));
      return {action:actionSignature(evaluated.result),scores:evaluated.trace};
    }finally{Math.random=prior;}
  }
  const base=evaluate(physical);
  const alternative=option?evaluate(alternate):null;
  const sourceAfter=fingerprint(source);
  assert.deepEqual(sourceAfter,sourceBefore,
    'Opponent hidden counterfactual mutated the live Store State');

  const change=alternative!==null&&!isDeepStrictEqual(
    base.action,alternative.action);
  return {
    physicalOrder:base.action,
    counterfactualOrder:alternative?.action??null,
    // Compatibility with the existing read-only, postgame observer's single
    // paired-world result fields; do not interpret this as an OWN-deck test.
    reversedOrder:alternative?.action??null,
    actionSensitiveToHiddenDeckOrder:false,
    actionSensitiveToOpponentHiddenHand:change,
    tacticScoreComparison:alternative?
      compareTacticScores(base.scores,alternative.scores):null,
    opportunity:option!==null,
    chosenExchangeKinds:option?.kindPair??null,
    sourceHiddenPoolConserved:true,
    liveStatePreserved:true,
    incompleteOwnerObservationHistory:true,
    opponentHandIdentityUnobservedVerified:false,
    classification:option?
      (change?'conditional-opponent-hidden-hand-action-reversal':
        'no-action-change-in-selected-conditional-swap'):
      'no-distinct-opponent-hand-deck-swap',
    caveat:'Counterfactual conditioned on actual hidden identities, with no full '+
      'public reveal-history proof. This is a postgame decision-policy '+
      'sensitivity diagnostic, not a competitive-game result.'
  };
}

module.exports={cardKind,chooseHiddenHandDeckSwap,hiddenZoneFingerprint,
  compareOpponentHiddenSwap};
