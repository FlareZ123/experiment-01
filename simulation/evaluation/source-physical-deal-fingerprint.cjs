'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

/** @param {object} card */
function cardName(card) {
  assert.equal(typeof card?.fullName,'string','Missing physical printing');
  return card.fullName;
}
/** @param {object[]} cards */
function names(cards) {
  assert.ok(Array.isArray(cards));
  return cards.map(cardName);
}
/**
 * Hash all source-deck physical positions at the **first stable pre-action**
 * player-turn root. Setup prompts have already consumed Store actions.
 * Exact printings and ordered hidden zones are included
 * only inside the digest; the returned object contains no hidden names.
 *
 * This is offline telemetry for comparing paired *physical initial deals*.
 * Never expose it to a live decision policy. The digest does not prove the
 * hidden state of a later root, aligned decision policy, or engine fidelity.
 *
 * @param {object} state Pinned Store game state.
 * @param {0|1} sourceSeat Physical source seat.
 * @param {number} playerTurnActions Number of PLAYER_TURN actions since setup.
 * @returns {{digestSha256:string,schema:string,seat:number}}
 */
function fingerprintInitialSourceDeal(state,sourceSeat,playerTurnActions) {
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(playerTurnActions,0,'Initial deal must precede any player-turn action');
  assert.equal(state.turn,1,'Expected the first global game turn');
  assert.equal(state.phase,2,'Expected the pinned PLAYER_TURN phase');
  assert.ok(!state.prompts.some(prompt=>prompt.result===undefined),
    'Initial setup prompts must be completed');
  assert.equal(state.players.length,2);
  const source=state.players[sourceSeat];
  /** @param {object} slot */
  const slotCards=slot=>({
    cards:names(slot.cards),
    tools:names(slot.tools),
    energies:names(slot.energies.cards)
  });
  const privateSourcePositions={
    hand:names(source.hand.cards),
    deck:names(source.deck.cards),
    prizes:source.prizes.map(prize=>names(prize.cards)),
    active:slotCards(source.active),
    bench:source.bench.map(slotCards),
    discard:names(source.discard.cards),
    lostzone:names(source.lostzone.cards),
    stadium:names(source.stadium.cards),
    supporter:names(source.supporter.cards)
  };
  return Object.freeze({
    schema:'initial-source-physical-position-sha256-v1',
    seat:sourceSeat,
    digestSha256:createHash('sha256')
      .update(JSON.stringify(privateSourcePositions)).digest('hex')
  });
}
/**
 * Observe the runner's Store before each action, including setup prompts.
 * Only the first stable turn-1 board may be fingerprinted. The caller must
 * invoke observe before every action from the beginning of setup. This
 * detector itself never reads or modifies the bot's decision state.
 * @param {0|1} sourceSeat Source physical seat.
 */
function createInitialSourceDealObserver(sourceSeat) {
  assert.ok(sourceSeat===0||sourceSeat===1);
  let captured=null;
  let playerTurnRootsObserved=0;
  return Object.freeze({
    /** @param {object} state Real Store state before the next root action. */
    observe(state) {
      if(captured || state.phase!==2 ||
        state.prompts.some(prompt=>prompt.result===undefined))return;
      assert.equal(state.turn,1,
        'First observed stable player turn was already past turn 1');
      assert.equal(playerTurnRootsObserved,0);
      captured=fingerprintInitialSourceDeal(state,sourceSeat,0);
      playerTurnRootsObserved++;
    },
    /** @returns {object|null} Digest-only snapshot, never source cards. */
    result() {return captured;}
  });
}
module.exports={fingerprintInitialSourceDeal,createInitialSourceDealObserver};
