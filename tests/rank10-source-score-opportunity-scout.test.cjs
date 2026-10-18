'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withRootScoreCensus}=
  require('../simulation/twinleaf/rank10-source-score-opportunity-scout.cjs');

class PlayCardAction {
  constructor(handIndex=0){this.handIndex=handIndex;}
}
class ScoreTactic {
  evaluateAction(state){return state.turn;}
}
class Bot {
  constructor(){this.client={id:101};this.tactics=[new ScoreTactic()];}
  decodeNextAction(state){
    this.tactics[0].evaluateAction(state,101,new PlayCardAction(0));
    return new PlayCardAction(0);
  }
}
const root={
  turn:4,activePlayer:0,prompts:[],
  players:[{id:101,hand:{cards:[{fullName:"Professor's Research JTG"}]}}]
};

test('only authentic root state is scored and result preserved',()=>{
  const source=new Bot(),original=Bot.prototype.decodeNextAction;
  const result=withRootScoreCensus(Bot,()=>{
    source.decodeNextAction({turn:4,prompts:[],players:[]});
    return source.decodeNextAction(root);
  },()=>root,()=>22);
  assert.equal(result.rootCalls,1);
  assert.equal(result.events.length,1);
  assert.equal(result.events[0].candidateEvaluations,1);
  assert.equal(result.events[0].rootStep,22);
  assert.equal(result.events[0].actorId,101);
  assert.equal(result.events[0].playedHandPrinting,"Professor's Research JTG");
  assert.deepEqual(result.events[0].tacticCounts,{ScoreTactic:1});
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
  assert.equal(Object.hasOwn(source.tactics[0],'evaluateAction'),false);
});

test('unresolved prompt is not admitted as a root policy call',()=>{
  const source=new Bot(),physical={...root,prompts:[{result:undefined}]};
  const result=withRootScoreCensus(Bot,
    ()=>source.decodeNextAction(physical),()=>physical,()=>2);
  assert.equal(result.events.length,0);
  assert.equal(result.rootCalls,0);
});

test('root spy restores class method even if actor scorer throws',()=>{
  class ThrowBot extends Bot {
    decodeNextAction(){throw Error('hypothetical failure');}
  }
  const old=ThrowBot.prototype.decodeNextAction;
  assert.throws(()=>withRootScoreCensus(ThrowBot,
    ()=>new ThrowBot().decodeNextAction(root),()=>root,()=>4),
    /hypothetical failure/);
  assert.strictEqual(ThrowBot.prototype.decodeNextAction,old);
});
