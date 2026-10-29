'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withNativeSupporterScoreDisposition}=require(
  '../simulation/twinleaf/agent2-native-supporter-score-disposition.cjs');

const SUPPORTER=7;
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class PassTurnAction{constructor(id){this.id=id;}}
class SimpleTactic{
  constructor(){this.options={scores:{tactics:{supporterBonus:2}}};}
  getStateScore(){return 10;}
  evaluateAction(state,_id,action){return state.scores[action.handIndex];}
}
class PlaySupporterTactic extends SimpleTactic{
  useTactic(state,owner){
    let best=this.getStateScore(state,owner.id)-
      this.options.scores.tactics.supporterBonus;
    let selected;
    for(let i=0;i<owner.hand.cards.length;i++){
      if(owner.hand.cards[i].trainerType!==SUPPORTER)continue;
      const proposed=new PlayCardAction(owner.id,i);
      const score=this.evaluateAction(state,owner.id,proposed);
      if(score!==undefined&&score>best){
        best=score;selected=proposed;
      }
    }
    return selected;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};this.supporter=new PlaySupporterTactic();}
  decodeNextAction(state){
    const owner=state.players.find(p=>p.id===this.client.id);
    return this.supporter.useTactic(state,owner)??
      new PassTurnAction(owner.id);
  }
}
function state(scores,seat=0){
  const players=[{id:101,hand:{cards:[
    {fullName:'Lillie TEST',trainerType:SUPPORTER},
    {fullName:'Guzma TEST',trainerType:SUPPORTER}]},supporterTurn:0,
    supporter:{cards:[]}},
  {id:202,hand:{cards:[
    {fullName:'Marnie TEST',trainerType:SUPPORTER}]},
   supporterTurn:0,supporter:{cards:[]}}];
  return {players,turn:seat+1,scores,activePlayer:seat};
}
const deps={SimpleTacticsAi,PlaySupporterTactic,SimpleTactic,
  supporterType:SUPPORTER};
test('observes native bonus threshold and score-disfavored Pass, preserving action',()=>{
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const bot=new SimpleTacticsAi(101),s=state([7,6]);
  const expected=bot.decodeNextAction(s).constructor.name;
  const output=withNativeSupporterScoreDisposition(()=>
    bot.decodeNextAction(s),deps);
  assert.equal(output.result.constructor.name,expected);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
  assert.equal(output.audit.storedPasses,1);
  assert.equal(output.audit.storedPassesWithEvaluations,1);
  const event=output.audit.events[0],tactic=event.tactics[0];
  assert.equal(tactic.baseline,10);
  assert.equal(tactic.supporterBonus,2);
  assert.deepEqual(tactic.evaluations.map(x=>x.score),[7,6]);
  assert.deepEqual(tactic.evaluations.map(x=>x.printing),
    ['Lillie TEST','Guzma TEST']);
  assert.equal(tactic.returnAction,'undefined');
});
test('observes undefined simulator scores and an accepted prospective action',()=>{
  const bot=new SimpleTacticsAi(101);
  const result=withNativeSupporterScoreDisposition(()=>{
    const a=bot.decodeNextAction(state([undefined,undefined]));
    const b=bot.decodeNextAction(state([9,7]));
    return [a.constructor.name,b.constructor.name];
  },deps);
  assert.deepEqual(result.result,['PassTurnAction','PlayCardAction']);
  assert.equal(result.audit.storedPassesAllEvaluationsUndefined,1);
  assert.equal(result.audit.events[1].tactics[0].returnPrinting,
    'Lillie TEST');
});
test('restores all four descriptors after an actual native tactic error',()=>{
  const bot=new SimpleTacticsAi(101);
  const originals=[SimpleTacticsAi.prototype.decodeNextAction,
    PlaySupporterTactic.prototype.useTactic,
    SimpleTactic.prototype.evaluateAction,
    SimpleTactic.prototype.getStateScore];
  const badState=state([6,7]);
  badState.players[0].hand=null;
  let err;
  try{withNativeSupporterScoreDisposition(()=>
    bot.decodeNextAction(badState),deps);}catch(e){err=e;}
  assert.ok(err instanceof Error);
  assert.ok(err.agent2SupporterScoreEvidence);
  assert.deepEqual([SimpleTacticsAi.prototype.decodeNextAction,
    PlaySupporterTactic.prototype.useTactic,
    SimpleTactic.prototype.evaluateAction,
    SimpleTactic.prototype.getStateScore],originals);
});
