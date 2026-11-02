'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,hypotheticalBracketCutoffs
}=require('../simulation/evaluation/agent1-public-prize-hypothetical-cutoffs.cjs');

function row(turn,prizes){
  return {
    turnClosed:turn,nextTurn:turn+1,
    afterSecondStarterTurn:turn%2===0,
    afterPrizes:prizes,
    paperTimeCallObserved:false,
    postFinalCheckupExcluded:false
  };
}
const base={
  version:'agent1-native-public-turn-prize-closure-v1',
  paperClockCertified:false
};

test('conditional official Prize adjudication keeps the actual paper clock unknown',()=>{
  const trial=hypotheticalBracketCutoffs({...base,closures:[
    row(20,[4,4]),row(21,[2,6]),row(22,[2,6]),
    row(24,[1,3]),row(26,[1,1]),row(28,[3,1])
  ]});
  assert.equal(trial.version,VERSION);
  assert.equal(trial.actualPaperTimeCallObserved,false);
  assert.equal(trial.paperClockCertified,false);
  assert.deepEqual(trial.snapshots.map(x=>x.turnClosed),[20,22,24,26,28]);
  assert.deepEqual(trial.snapshots.map(x=>x.conditionalWinner),
    [null,0,0,null,1]);
  assert.deepEqual(trial.snapshots.map(x=>x.conditionalStatus),[
    'bracket-extension-required',
    'bracket-timeout-prize-lead-win',
    'bracket-timeout-prize-lead-win',
    'bracket-extension-required',
    'bracket-timeout-prize-lead-win'
  ]);
});

test('source observer without a verified real clock stays qualification-failed',()=>{
  const noTime=hypotheticalBracketCutoffs({...base,closures:[
    row(2,[6,6]),row(4,[6,6]),row(6,[6,6])
  ]});
  assert.equal(noTime.snapshots.every(x=>x.conditionalWinner===null),true);
  assert.equal(noTime.paperClockCertified,false);
  assert.equal(noTime.nativePostCheckupCannotProveExcluded,true);
});

test('reject non-public or fake time-call observations and avoid adjudicating zero-Prize terminal',()=>{
  assert.throws(()=>hypotheticalBracketCutoffs({
    ...base,closures:[{...row(10,[1,6]),paperTimeCallObserved:true}]
  }));
  const out=hypotheticalBracketCutoffs({
    ...base,closures:[row(12,[0,3])]
  });
  assert.equal(out.snapshots[0].conditionalStatus,
    'normal-win-termination-not-inferred');
  assert.equal(out.snapshots[0].conditionalWinner,null);
});
