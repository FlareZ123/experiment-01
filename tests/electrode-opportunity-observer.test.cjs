'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createElectrodeOpportunityObserver } =
  require('../simulation/twinleaf/electrode-opportunity-observer.cjs');

/** @param {string|null} fullName */
const cardList = fullName => ({
  getPokemonCard: () => fullName ? {fullName} : undefined
});

/**
 * @param {{active?:string,bench?:string[],discard?:string[],prizes?:number}} args
 */
function player({active = '', bench = [], discard = [], prizes = 6} = {}) {
  return {
    active: cardList(active),
    bench: bench.map(cardList),
    discard: {cards: discard.map(fullName => ({fullName}))},
    getPrizeLeft: () => prizes
  };
}

test('source Bomb opportunity counts actual decision states without mutation', () => {
  const observer = createElectrodeOpportunityObserver();
  const state = {
    activePlayer: 0, turn: 5,
    players: [
      player({active:'Alolan Raichu UNM',
        bench:['Electrode-GX CES','Crobat V DAA'],
        discard:['Reversal Energy PAL','Counter Energy CIN',
          'Unit Energy LPM UPR','Psychic Energy SVE'], prizes:6}),
      player({active:'Shadow Rider Calyrex VMAX CRE', prizes:4})
    ]
  };
  const original = JSON.stringify(state);
  observer.observe(state);
  observer.observe(state);
  assert.equal(JSON.stringify(state), original);
  let result = observer.snapshot();
  assert.deepEqual(result.countsBySeat[0], {
    decisions:2, activeRaichu:2, benchedElectrode:2,
    both:2, bothWithDiscardSpecial:2, withSafePrizeWindow:2,
    withPostBombReversalWindow:2
  });
  assert.equal(result.distinctInterestingStates.length,1);
  assert.equal(result.distinctInterestingStates[0].discardSpecialCount,3);
  assert.equal(result.countsBySeat[1].decisions,0);

  state.turn = 6;
  state.players[1] = player({prizes:2});
  observer.observe(state);
  result = observer.snapshot();
  assert.equal(result.countsBySeat[0].both,3);
  assert.equal(result.countsBySeat[0].withSafePrizeWindow,2);
  assert.equal(result.distinctInterestingStates.length,2);

  state.turn = 7;
  state.players[0] = player({active:'Alolan Raichu UNM',
    bench:['Electrode-GX CES'], discard:['Psychic Energy SVE'],prizes:6});
  observer.observe(state);
  result = observer.snapshot();
  assert.equal(result.countsBySeat[0].both,4);
  assert.equal(result.countsBySeat[0].bothWithDiscardSpecial,3);
  assert.equal(result.countsBySeat[0].withSafePrizeWindow,2);
});

test('separate opponent seat and no exact source line stay unqualified', () => {
  const observer = createElectrodeOpportunityObserver();
  const state = {
    activePlayer:1, turn:8,
    players:[player(),player({
      active:'Dedenne-GX UNB',bench:['Electrode-GX CES'],
      discard:['Reversal Energy PAL'],prizes:6
    })]
  };
  observer.observe(state);
  const result = observer.snapshot();
  assert.equal(result.countsBySeat[0].decisions,0);
  assert.equal(result.countsBySeat[1].decisions,1);
  assert.equal(result.countsBySeat[1].benchedElectrode,1);
  assert.equal(result.countsBySeat[1].activeRaichu,0);
  assert.equal(result.countsBySeat[1].both,0);
  assert.equal(result.distinctInterestingStates.length,1);
  assert.equal(result.distinctInterestingStates[0].seat,1);
});
