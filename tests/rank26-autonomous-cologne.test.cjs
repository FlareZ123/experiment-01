'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {cologneOpeningOpportunity} =
  require('../simulation/twinleaf/rank26-cologne-opener.cjs');
const {rank26SourceSeat} =
  require('../simulation/evaluation/aichi-campaign-runner.cjs');

/** @param {string|null} name */
function slot(name) {
  return {getPokemonCard() {return name ? {name} : null;}};
}

/** @returns {{state:object,own:object}} */
function source() {
  const own = {
    active: slot('Meloetta ex'),
    hand: {cards: [
      {name:'Canceling Cologne'},
      {name:'Damage Pump'},
      {name:'Quick Ball'}
    ]}
  };
  return {
    own,
    state: {
      turn:1,phase:7,activePlayer:1,
      players:[{active:slot('Iron Thorns ex')},own]
    }
  };
}

test('policy detects source hand and active Iron Thorns or Klefki', () => {
  const {state,own} = source();
  Object.defineProperty(own,'deck',{get(){throw Error('K0 hidden deck access');}});
  Object.defineProperty(own,'prizes',{get(){throw Error('Hidden prizes access');}});
  assert.equal(cologneOpeningOpportunity(state,own,1,7),true);
  state.players[0].active = slot('Klefki');
  assert.equal(cologneOpeningOpportunity(state,own,1,7),true);
});

test('policy declines irrelevant turn, opponent, source and hand states', () => {
  const cases = [
    s => {s.state.turn=2;},
    s => {s.state.activePlayer=0;},
    s => {s.state.phase=3;},
    s => {s.own.active=slot('Unown');},
    s => {s.own.hand.cards.splice(0,1);},
    s => {s.state.players[0].active=slot('Shadow Rider Calyrex V');},
    s => {s.state.players[0].active=slot(null);}
  ];
  for(const change of cases) {
    const s=source();
    change(s);
    assert.equal(cologneOpeningOpportunity(s.state,s.own,1,7),false);
  }
});

test('source-seat identity is bound to the scheduled rank26 match', () => {
  assert.equal(rank26SourceSeat({rank:26,candidateEngineSlot:'A'}),1);
  assert.equal(rank26SourceSeat({rank:26,candidateEngineSlot:'B'}),0);
  assert.throws(()=>rank26SourceSeat({rank:11,candidateEngineSlot:'A'}));
  assert.throws(()=>rank26SourceSeat({rank:26,candidateEngineSlot:'C'}));
});


test('Cologne plus Damage Pump profile is reachable through shared dispatch', () => {
  const {ALLOWED_PROFILES, RANK26_COLOGNE_PUMP_PROFILE} =
    require('../simulation/twinleaf/policy-profiles.cjs');
  assert.equal(RANK26_COLOGNE_PUMP_PROFILE, 'rank26-autonomous-cologne-pump-v2');
  assert.ok(ALLOWED_PROFILES.includes(RANK26_COLOGNE_PUMP_PROFILE));
});
