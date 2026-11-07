'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyTerminalCause}=
  require('../simulation/evaluation/terminal-cause-evidence.cjs');

test('actual original pinned Store ordinary simultaneous last-Prize KO exposes full public outcome',()=>{
  const runner=require('../simulation/twinleaf/headless.cjs');
  const baseline=runner.runMatch;
  let actualGame=null;
  runner.runMatch=function observer(request){
    const game=baseline(request);
    actualGame=game;
    return game;
  };
  let fixture;
  try{
    const {oneOrdinaryDoubleFinalKO}=
      require('../simulation/twinleaf/agent24-replay-simultaneous-ko-order.cjs');
    const {registration}=
      require('../simulation/twinleaf/agent47-rank20-apex-natural-audit.cjs');
    runner.initializeCards();
    const {byRank}=registration();
    fixture=oneOrdinaryDoubleFinalKO(0,byRank);
  }finally{runner.runMatch=baseline;}
  assert.ok(fixture?.nativeFinished);
  assert.equal(fixture?.ordinaryEndMatrix?.status,'SIMULTANEOUS_TIE');
  assert.equal(fixture.ordinaryEndMatrix.paperGameOutcomeQualified,false);
  assert.equal(actualGame?.winner,0);
  const terminal=actualGame?.terminalTransition;
  assert.ok(terminal,'Native ordinary terminal needs actual publicly captured transition');
  assert.equal(terminal.before.suddenDeath,false);
  assert.equal(terminal.after.suddenDeath,false);
  assert.equal(terminal.before.winner,-1);
  assert.equal(terminal.after.winner,0);
  const result=classifyTerminalCause({
    id:'real-source-staged-double-KO',
    status:'engine-terminal',engineWinner:0,
    terminalTransition:terminal
  });
  assert.deepEqual(result,{
    status:'bilateral-prize-settlement-unverified',
    conditions:[],engineWinner:0
  });
  assert.ok(terminal.after.players.every((p,seat)=>
    p.prizesRemaining<terminal.before.players[seat].prizesRemaining),
  'Pinned native real Store changed both players Prize counts in one dispatch');
  console.log('AGENT1_ORDINARY_NATIVE_BILATERAL_KO',JSON.stringify({
    sourceFixture:'Agent24 ordinary original ranks11/20 staged double final-KO',
    before:terminal.before,after:terminal.after,
    projectedPaperOutcome:fixture.ordinaryEndMatrix.status,
    nativeWinner:actualGame.winner,
    classifier:result.status,
    classifierConditions:result.conditions,
    nativeGameQualified:false
  }));
});
