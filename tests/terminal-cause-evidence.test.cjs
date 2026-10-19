'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {classifyTerminalCause,summarizeTerminalCauses}=
  require('../simulation/evaluation/terminal-cause-evidence.cjs');

/** @param {object} [options] @returns {object} */
function terminal(options={}) {
  const winner=options.winner??1;
  const before=options.before??[
    {deckRemaining:20,prizesRemaining:6,inPlayPokemon:2},
    {deckRemaining:10,prizesRemaining:2,inPlayPokemon:5}
  ];
  const after=options.after??[
    {deckRemaining:20,prizesRemaining:6,inPlayPokemon:1},
    {deckRemaining:10,prizesRemaining:0,inPlayPokemon:5}
  ];
  return {
    id:options.id??'fixture',status:'engine-terminal',engineWinner:winner,
    terminalTransition:{
      evidenceType:'observed-engine-terminal-transition-v1',
      before:{phase:3,turn:options.turnBefore??9,activePlayer:1,winner:-1,players:before},
      after:{phase:7,turn:options.turnAfter??9,
        activePlayer:options.activeAfter??1,winner:options.afterWinner??winner,
        players:after}
    }
  };
}

test('distinguishes simultaneous final prize and board wipe conditions',()=>{
  const row=terminal({after:[
    {deckRemaining:20,prizesRemaining:6,inPlayPokemon:0},
    {deckRemaining:10,prizesRemaining:0,inPlayPokemon:5}
  ]});
  assert.deepEqual(classifyTerminalCause(row),{
    status:'observed-sufficient-conditions',
    conditions:['winner-took-final-prize','loser-has-no-pokemon'],engineWinner:1
  });
});

test('observes a winner with no Prize gain and loser empty on the next draw',()=>{
  const row=terminal({before:[
    {deckRemaining:0,prizesRemaining:6,inPlayPokemon:9},
    {deckRemaining:11,prizesRemaining:6,inPlayPokemon:9}
  ],after:[
    {deckRemaining:0,prizesRemaining:6,inPlayPokemon:9},
    {deckRemaining:11,prizesRemaining:6,inPlayPokemon:9}
  ],turnBefore:33,turnAfter:34,activeAfter:0});
  assert.deepEqual(classifyTerminalCause(row).conditions,
    ['loser-empty-deck-at-new-turn']);
});

test('zero deck during unchanged turn is insufficient deckout evidence',()=>{
  const row=terminal({before:[
    {deckRemaining:0,prizesRemaining:6,inPlayPokemon:4},
    {deckRemaining:11,prizesRemaining:6,inPlayPokemon:4}
  ],after:[
    {deckRemaining:0,prizesRemaining:6,inPlayPokemon:4},
    {deckRemaining:11,prizesRemaining:6,inPlayPokemon:4}
  ]});
  assert.equal(classifyTerminalCause(row).status,'terminal-rule-unresolved');
});

test('winner mismatch or absent transition cannot certify terminal cause',()=>{
  assert.equal(classifyTerminalCause(terminal({afterWinner:0})).status,
    'missing-or-inconsistent-transition');
  assert.equal(classifyTerminalCause({
    status:'engine-terminal',engineWinner:1,terminalTransition:null
  }).status,'missing-or-inconsistent-transition');
  assert.equal(classifyTerminalCause(terminal({winner:3})).status,
    'missing-or-inconsistent-transition');
});

test('summaries retain censored games and count overlapping causes separately',()=>{
  const rows=[
    terminal({id:'lastPrize',after:[
      {deckRemaining:20,prizesRemaining:6,inPlayPokemon:0},
      {deckRemaining:10,prizesRemaining:0,inPlayPokemon:5}
    ]}),
    terminal({id:'unresolved',before:[
      {deckRemaining:0,prizesRemaining:6,inPlayPokemon:4},
      {deckRemaining:11,prizesRemaining:6,inPlayPokemon:4}
    ],after:[
      {deckRemaining:0,prizesRemaining:6,inPlayPokemon:4},
      {deckRemaining:11,prizesRemaining:6,inPlayPokemon:4}
    ]}),
    {id:'cap',status:'action-cap-or-incomplete'},
    {id:'error',status:'engine-error'}
  ];
  const out=summarizeTerminalCauses(rows);
  assert.equal(out.trials,4);
  assert.equal(out.engineTerminals,2);
  assert.equal(out.observedTerminals,1);
  assert.equal(out.unresolvedTerminals,1);
  assert.equal(out.capped,1);
  assert.equal(out.errors,1);
  assert.deepEqual(out.conditionIncidences,{
    'loser-has-no-pokemon':1,'winner-took-final-prize':1
  });
  assert.equal(out.competitiveGamesQualified,0);
});
