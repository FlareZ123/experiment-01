'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {basicPaperResult,classifyTerminalCause,summarizeTerminalCauses}=
  require('../simulation/evaluation/terminal-cause-evidence.cjs');

/**
 * @param {number} mask Simultaneous outcome flags relative to winner seat 1.
 * @returns {object}
 */
function terminalMask(mask){
  const original=[
    {deckRemaining:7,prizesRemaining:2,inPlayPokemon:2},
    {deckRemaining:11,prizesRemaining:2,inPlayPokemon:2}
  ];
  const after=[
    {deckRemaining:7,prizesRemaining:mask&2?0:2,inPlayPokemon:mask&8?0:2},
    {deckRemaining:11,prizesRemaining:mask&1?0:2,inPlayPokemon:mask&4?0:2}
  ];
  return {status:'engine-terminal',engineWinner:1,
    terminalTransition:{evidenceType:'observed-engine-terminal-transition-v1',
      before:{phase:3,turn:12,activePlayer:1,winner:-1,players:original},
      after:{phase:7,turn:12,activePlayer:1,winner:1,players:after}}
  };
}

const EXPECTED=[
  'none','winner','loser','tie','loser','tie','loser','loser',
  'winner','winner','tie','winner','tie','winner','loser','tie'
];

test('all 16 paper basic simultaneous result combinations match rulebook I.E',()=>{
  for(let mask=0;mask<16;mask++){
    const row=terminalMask(mask);
    const got=basicPaperResult(row.terminalTransition.after,1);
    assert.equal(got,EXPECTED[mask],`mask ${mask}`);
    const conclusion=classifyTerminalCause(row);
    if(got==='tie'||got==='loser'){
      assert.equal(conclusion.status,'paper-basic-result-conflict',`mask ${mask}`);
      assert.deepEqual(conclusion.conditions,[]);
      assert.equal(conclusion.paperBasicOutcome,got);
    }else{
      assert.notEqual(conclusion.status,'paper-basic-result-conflict',`mask ${mask}`);
    }
  }
});

test('a native winner cannot be certified if both take their last Prize',()=>{
  const row=terminalMask(3);
  const result=classifyTerminalCause(row);
  assert.equal(result.status,'paper-basic-result-conflict');
  assert.equal(result.paperBasicOutcome,'tie');
  assert.equal(summarizeTerminalCauses([row]).paperBasicConflicts,1);
});

test('winner taking last Prize while only own Pokémon disappear is a paper tie',()=>{
  assert.equal(classifyTerminalCause(terminalMask(5)).paperBasicOutcome,'tie');
});

test('winner taking last Prize plus opponent no Pokémon remains a winner',()=>{
  assert.deepEqual(classifyTerminalCause(terminalMask(9)).conditions,
    ['winner-took-final-prize','loser-has-no-pokemon']);
});

test('three-way winner prize and both no Pokémon is a winner under rulebook',()=>{
  assert.deepEqual(classifyTerminalCause(terminalMask(13)).conditions,
    ['winner-took-final-prize','loser-has-no-pokemon']);
});

test('actual next-draw deckout remains classified when basic conditions absent',()=>{
  const row=terminalMask(0);
  row.terminalTransition.before.players[0].deckRemaining=0;
  row.terminalTransition.after.players[0].deckRemaining=0;
  row.terminalTransition.after.turn=13;
  row.terminalTransition.after.activePlayer=0;
  assert.deepEqual(classifyTerminalCause(row).conditions,
    ['loser-empty-deck-at-new-turn']);
});

test('noninteger state counts and backwards turn cannot pass certification',()=>{
  const row=terminalMask(1);
  row.terminalTransition.after.players[0].prizesRemaining='6';
  assert.equal(classifyTerminalCause(row).status,'missing-or-inconsistent-transition');
  const row2=terminalMask(1);
  row2.terminalTransition.after.turn=11;
  assert.equal(classifyTerminalCause(row2).status,'missing-or-inconsistent-transition');
});

test('conflicts are retained as unresolved native games, not counted as victories',()=>{
  const summary=summarizeTerminalCauses([terminalMask(1),terminalMask(3),
    {status:'action-cap-or-incomplete',id:'censored'}]);
  assert.equal(summary.trials,3);
  assert.equal(summary.engineTerminals,2);
  assert.equal(summary.observedTerminals,1);
  assert.equal(summary.unresolvedTerminals,1);
  assert.equal(summary.paperBasicConflicts,1);
  assert.equal(summary.capped,1);
  assert.equal(summary.competitiveGamesQualified,0);
});

test('all basic outcomes are symmetric under physical seat reversal',()=>{
  for(let mask=0;mask<16;mask++){
    const row=terminalMask(mask);
    row.engineWinner=0;
    row.terminalTransition.before.players.reverse();
    row.terminalTransition.after.players.reverse();
    row.terminalTransition.after.winner=0;
    assert.equal(basicPaperResult(row.terminalTransition.after,0),
      EXPECTED[mask],`reversed mask ${mask}`);
    const actual=classifyTerminalCause(row);
    if(EXPECTED[mask]==='tie'||EXPECTED[mask]==='loser')
      assert.equal(actual.status,'paper-basic-result-conflict');
  }
});
