'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {captureTacticScores,compareTacticScores}=
  require('../simulation/twinleaf/tactic-score-trace.cjs');

class PlayCardAction {
  constructor(handIndex){this.handIndex=handIndex;}
}
class ScoreTactic {
  evaluateAction(state,playerId,action) {
    return state.deck.cards[0].value+action.handIndex;
  }
}
class ScoreBot {
  constructor(){this.tactics=[new ScoreTactic()];}
  decodeNextAction(state) {
    const action=new PlayCardAction(2);
    const score=this.tactics[0].evaluateAction(state,101,action);
    return score>=0?{type:'pass'}:null;
  }
}

test('different unseen deck order changes score while selected action is fixed',()=>{
  const original={deck:{cards:[{value:4},{value:10}]}};
  const flipped={deck:{cards:[{value:10},{value:4}]}};
  const firstBot=new ScoreBot(),secondBot=new ScoreBot();
  const before=firstBot.tactics[0].evaluateAction;
  const a=captureTacticScores(firstBot,()=>firstBot.decodeNextAction(original));
  const b=captureTacticScores(secondBot,()=>secondBot.decodeNextAction(flipped));
  assert.deepEqual(a.result,b.result);
  assert.strictEqual(firstBot.tactics[0].evaluateAction,before);
  const comparison=compareTacticScores(a.trace,b.trace);
  assert.equal(comparison.equalScoreTraces,false);
  assert.equal(comparison.physicalEvaluations,1);
  assert.equal(comparison.counterfactualEvaluations,1);
  assert.equal(comparison.firstDifference.index,0);
  assert.equal(comparison.firstDifference.sameTacticAndCandidate,true);
  assert.equal(comparison.firstDifference.physical.score,6);
  assert.equal(comparison.firstDifference.counterfactual.score,12);
});

test('empty tactic instances remain unchanged and both traces empty',()=>{
  const bot={tactics:[]},seen=captureTacticScores(bot,()=>42);
  assert.deepEqual(seen,{result:42,trace:[]});
  assert.equal(compareTacticScores([],[]).equalScoreTraces,true);
});

test('evaluation-count mismatch is explicitly classified',()=>{
  const a=[{tactic:'A',actionType:'X',actionSignature:'{}',score:1,undefinedScore:false}];
  const b=[...a,a[0]];
  assert.deepEqual(compareTacticScores(a,b).firstDifference,
    {index:1,reason:'evaluation-count-mismatch'});
});

test('score capture restores instance method after throw',()=>{
  const bot=new ScoreBot(),original=bot.tactics[0].evaluateAction;
  assert.throws(()=>captureTacticScores(bot,()=>{throw Error('source invalid')}),/source invalid/);
  assert.strictEqual(bot.tactics[0].evaluateAction,original);
  assert.equal(Object.hasOwn(bot.tactics[0],'evaluateAction'),false);
});

test('undefined returned evaluation is marked, without inventing a numeric score',()=>{
  const bot={tactics:[{evaluateAction(){return undefined;}}]};
  const cap=captureTacticScores(bot,()=>bot.tactics[0].evaluateAction({},1,{x:1}));
  assert.equal(cap.trace.length,1);
  assert.equal(cap.trace[0].undefinedScore,true);
  assert.equal(cap.trace[0].score,null);
});
