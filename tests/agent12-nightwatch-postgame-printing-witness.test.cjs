'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withUniformNightWatchOpponentSelection}=
  require('../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs');

class Ai{
  resolvePrompt(){return null;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
test('physical identity is observed after the simulated game ends',()=>{
  let gameRunning=true;
  const player={id:101};
  const cards=Array.from({length:4},(_,i)=>{
    const card={};
    Object.defineProperty(card,'fullName',{get(){
      assert.equal(gameRunning,false);
      return 'Card '+i;
    }});
    return card;
  });
  const opponent={id:202,hand:{cards}};
  const prompt={
    id:32,playerId:101,cards:opponent.hand,filter:{},
    options:{min:2,max:2,allowCancel:false,isSecret:true},
    validate(answer){return answer.length===2&&
      answer.every(card=>cards.includes(card));}
  };
  Object.defineProperty(prompt,'constructor',{value:{name:'ChooseCardsPrompt'}});
  const ai=new Ai();
  const observed=withUniformNightWatchOpponentSelection(()=>{
    const action=ai.resolvePrompt(player,{
      turn:13,players:[player,opponent]
    },prompt);
    assert.ok(action instanceof ResolvePromptAction);
    assert.equal(gameRunning,true);
    gameRunning=false;
    return action;
  },{committedSeed:'independently-fixed',
    capturePostGamePhysicalNames:true,
    deps:{SimpleTacticsAi:Ai,ResolvePromptAction}});
  assert.deepEqual(observed.audit.events[0].postGameSelectedPrintings,
    observed.result.result.map(card=>card.fullName));
  assert.equal(observed.audit.postgamePhysicalNamesExposedToPolicy,false);
});
