'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  classifyTerminalCause,summarizeTerminalCauses
}=require('../simulation/evaluation/terminal-cause-evidence.cjs');

/**
 * Reuse Agent24's independently source-authenticated pinned Store staged
 * both-KO tiebreaker fixture without copying its synthetic mutations.
 * Interpose on the adapter runner's return solely to read the captured
 * native public FINISHED transition. This wrapper never changes actions.
 *
 * @returns {object}
 */
function runOneStagedNativeReplay(){
  const runner=require('../simulation/twinleaf/headless.cjs');
  const baseline=runner.runMatch;
  let actualGame=null;
  runner.runMatch=function observeOriginalStagedReplay(request){
    const game=baseline(request);
    actualGame=game;
    return game;
  };
  try{
    // Require after interposing so Agent24 captures the read-only runner.
    const {one}=require('../simulation/twinleaf/agent24-replay-simultaneous-ko-order.cjs');
    const {registration}=
      require('../simulation/twinleaf/agent47-rank20-apex-natural-audit.cjs');
    runner.initializeCards();
    const {byRank}=registration();
    const fixture=one(1,byRank);
    assert.ok(fixture.syntheticSimultaneousActiveLethalDamage);
    assert.equal(fixture.genuineNativeSixPrizeReplay,true);
    assert.ok(fixture.nativeFinished);
    assert.ok(actualGame?.finished);
    assert.equal(actualGame.winner,fixture.nativeWinner);
    assert.ok(actualGame.terminalTransition,
      'Actual terminal must be observed across a real pinned Store dispatch');
    return {fixture,actualGame};
  }finally{
    runner.runMatch=baseline;
  }
}

test('real pinned replay sudden death is tagged in both Store public snapshots',()=>{
  const {fixture,actualGame}=runOneStagedNativeReplay();
  const transition=actualGame.terminalTransition;
  assert.equal(transition.evidenceType,
    'observed-engine-terminal-transition-v1');
  assert.equal(transition.before.suddenDeath,true);
  assert.equal(transition.after.suddenDeath,true);
  assert.equal(transition.before.winner,-1);
  assert.equal(transition.after.winner,actualGame.winner);
  assert.equal(actualGame.winner,0,
    'Previous native staged equal-award replay observed seat0 bias');
  assert.equal(fixture.pendingPrizeAudit.status,
    'PENDING_KO_PRIZES_NO_STRICT_LEAD');
  assert.equal(fixture.nativePendingComparison.paperGameOutcomeQualified,false);
  const row={id:'actual-store-replay',status:'engine-terminal',
    engineWinner:actualGame.winner,terminalTransition:transition};
  const classification=classifyTerminalCause(row);
  assert.deepEqual(classification,{
    status:'tiebreaker-batch-adjudication-unresolved',
    conditions:[],engineWinner:0
  });
  const counts=summarizeTerminalCauses([row]);
  assert.equal(counts.engineTerminals,1);
  assert.equal(counts.tiebreakerUnresolved,1);
  assert.equal(counts.observedTerminals,0);
  assert.equal(counts.competitiveGamesQualified,0);
  console.log('AGENT1_REAL_TIEBREAKER_EPOCH_NATIVE',JSON.stringify({
    sourceFixture:'Agent24 replay staged both-KO, original ranks20/11',
    syntheticReplayEvent:true,
    checkoutEnginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    engineWinner:actualGame.winner,
    beforeEpoch:transition.before.suddenDeath,
    afterEpoch:transition.after.suddenDeath,
    paperProjection:fixture.pendingPrizeAudit.status,
    classifier:classification.status,
    paperGameQualified:false
  }));
});
