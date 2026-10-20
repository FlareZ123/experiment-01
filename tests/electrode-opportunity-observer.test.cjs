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
 * @param {{active?:string,bench?:string[],discard?:string[],hand?:string[],prizes?:number}} args
 */
function player({active = '', bench = [], discard = [], hand = [], prizes = 6} = {}) {
  return {
    active: cardList(active),
    bench: bench.map(cardList),
    discard: {cards: discard.map(fullName => ({fullName}))},
    hand: {cards: hand.map(fullName => ({fullName}))},
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

test('position frontier distinguishes Stage 1 bench readiness from Active pairing',()=>{
  const observer=createElectrodeOpportunityObserver();
  const state={
    activePlayer:1,turn:4,
    players:[
      player({active:'Shadow Rider Calyrex VMAX CRE',prizes:4}),
      player({active:'Dedenne-GX UNB',
        bench:['Alolan Raichu UNM','Electrode-GX CES','Crobat V DAA'],
        hand:['Escape Rope BST','Quick Ball FST'],
        discard:['Counter Energy CIN','Reversal Energy PAL',
          'Unit Energy LPM UPR'],prizes:6})
    ]
  };
  const frozen=JSON.stringify(state);
  observer.observe(state);
  assert.equal(JSON.stringify(state),frozen);
  const out=observer.snapshot();
  assert.equal(out.countsBySeat[1].both,0);
  const frontier=out.positionFrontier;
  assert.equal(frontier.schema,'aichi-raichu-electrode-owner-position-frontier-v1');
  assert.equal(frontier.countsBySeat[1].benchedRaichu,1);
  assert.equal(frontier.countsBySeat[1].bothBenched,1);
  assert.equal(frontier.countsBySeat[1].bothBenchedWithThreeDiscardSpecial,1);
  assert.equal(frontier.countsBySeat[1].bothBenchedWithHeldEscapeRope,1);
  assert.equal(frontier.countsBySeat[1].heldEscapeRopePrizeWindow,1);
  assert.equal(frontier.distinctOwnedPositionStates[0].activePrinting,'Dedenne-GX UNB');
  assert.equal(frontier.distinctOwnedPositionStates[0].pivotResourceWindow,true);
  assert.equal(frontier.nativeRetreatOrEscapeRopeLegalityVerified,false);
  assert.equal(frontier.selfKnockoutOrAttackConversionVerified,false);
  assert.equal(frontier.opponentPrivateZonesInspected,false);
  state.players[1].hand.cards=[];
  observer.observe(state);
  assert.equal(observer.snapshot().positionFrontier.countsBySeat[1]
    .heldEscapeRopePrizeWindow,1);
  assert.equal(observer.snapshot().positionFrontier.distinctOwnedPositionStates.length,2);
});

test('board/evolution predecessor census includes unresolved setup without fabricating action',()=>{
  const observer=createElectrodeOpportunityObserver();
  observer.observe({
    activePlayer:0,turn:3,
    players:[
      player({active:'Crobat V DAA',bench:['Pikachu LOR','Voltorb ROS'],
        hand:['Alolan Raichu UNM','Electrode-GX CES'],
        discard:['Reversal Energy PAL'],prizes:6}),
      player({prizes:6})
    ]
  });
  const frontier=observer.snapshot().positionFrontier;
  assert.equal(frontier.countsBySeat[0].bothBasicPredecessorsVisible,1);
  assert.equal(frontier.countsBySeat[0].heldRaichuEvolution,1);
  assert.equal(frontier.countsBySeat[0].heldElectrodeEvolution,1);
  assert.equal(frontier.countsBySeat[0].bothBenched,0);
  assert.equal(frontier.countsBySeat[0].heldEscapeRopePrizeWindow,0);
  assert.equal(observer.snapshot().countsBySeat[0].both,0);
});

test('opponent hidden-hand changes cannot influence an acting-owner position frontier',()=>{
  const makeState=secret=>{
    const active=player({active:'Pikachu LOR',bench:['Voltorb ROS'],
      hand:['Alolan Raichu UNM']});
    const opposing=player({active:'Shadow Rider Calyrex V CRE'});
    Object.defineProperty(opposing,'hand',{get(){
      throw Error('Forbidden to inspect opponent hand: '+secret);
    }});
    return {activePlayer:0,turn:3,players:[active,opposing]};
  };
  const a=createElectrodeOpportunityObserver();
  const b=createElectrodeOpportunityObserver();
  a.observe(makeState('A'));
  b.observe(makeState('B'));
  assert.deepEqual(a.snapshot(),b.snapshot());
});
