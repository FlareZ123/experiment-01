'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {assessTerminalBoundFieldEvidence,assertTerminalOutcomeBinding}=
  require('../scripts/aichi-qualified-outcome-binding.cjs');
const {assessFieldEvidence}=
  require('../scripts/aichi-anytime-field-evidence.cjs');

/** @param {number} iteration @returns {object[]} */
function evidenceRound(iteration=0) {
  return Array.from({length:64},(_,i)=>{
    const seat=i<32 ? 'first' : 'second';
    const firstSlot=seat==='first' ? 0 : 1;
    const firstName=firstSlot===0 ? 'research-A' : 'research-B';
    return {
      rank:i%32+1,startingSeat:seat,outcome:'win',finished:true,winnerIndex:0,
      status:'qualified-completed-game',gameId:'source:'+iteration+':'+i,
      seed:10000+64*iteration+i,
      candidateDeckSha256:'a'.repeat(64),
      opponentDeckSha256:(i%32+1).toString(16).padStart(64,'0'),
      candidatePolicyRevision:'candidate-frozen-v1',
      opponentPolicyRevision:'opponent-frozen-v1',
      engineRevision:'twinleafgg/pinned-fake-fixture',
      rulesetRevision:'expanded-paper/test-v1',
      candidateEngineSlot:'A',
      turnEvidence:{
        firstTurnSlot:firstSlot,
        firstTurnPlayerId:firstSlot===0 ? 101 : 202,
        firstTurnPlayerName:firstName,
        firstDrawLogName:firstName,
        verifiedByDrawLog:true
      }
    };
  });
}

test('complete perfect rounds keep the existing arithmetic unchanged',()=>{
  const rounds=Array.from({length:10},(_,i)=>evidenceRound(i));
  const original=assessFieldEvidence(rounds);
  const guarded=assessTerminalBoundFieldEvidence(rounds);
  assert.deepEqual(guarded,original);
  assert.equal(guarded.wins,640);
  assert.equal(guarded.currentCrosses,true);
});

test('a single inverted winner label cannot manufacture perfect evidence',()=>{
  const rounds=Array.from({length:10},(_,i)=>evidenceRound(i));
  rounds[0][0].winnerIndex=1;
  assert.throws(()=>assessTerminalBoundFieldEvidence(rounds),/contradicts/);
  assert.equal(assessFieldEvidence(rounds).wins,640);
  rounds[0][0].outcome='loss';
  const trueResult=assessTerminalBoundFieldEvidence(rounds);
  assert.equal(trueResult.wins,639);
  assert.equal(trueResult.currentCrosses,false);
});

test('both physical candidate slots, true draws and completed flag',()=>{
  const b=evidenceRound()[0];
  b.candidateEngineSlot='B';
  b.winnerIndex=1;
  b.turnEvidence={
    firstTurnSlot:1,firstTurnPlayerId:202,firstTurnPlayerName:'research-B',
    firstDrawLogName:'research-B',verifiedByDrawLog:true
  };
  assertTerminalOutcomeBinding(b);
  assert.equal(assessTerminalBoundFieldEvidence([[
    ...evidenceRound().slice(0,1).map(()=>b),
    ...evidenceRound().slice(1)
  ]]).wins,64);

  b.winnerIndex=3;b.outcome='draw';
  assertTerminalOutcomeBinding(b);
  const withDraw=evidenceRound();withDraw[0]=b;
  assert.equal(assessTerminalBoundFieldEvidence([withDraw]).wins,63);
  b.finished=false;
  assert.throws(()=>assertTerminalOutcomeBinding(b),/Missing or invalid/);
  b.finished=true;delete b.winnerIndex;
  assert.throws(()=>assertTerminalOutcomeBinding(b),/Missing or invalid/);
});
