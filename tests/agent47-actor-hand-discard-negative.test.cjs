'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  actorHandDiscardInput,chooseActorHandDiscard,withActorHandDiscard
}=require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');

class ChooseCardsPrompt{
  constructor(owner,options){
    this.id=17;this.playerId=owner.id;this.cards=owner.hand;
    this.options=options;this.message='CHOOSE_CARD_TO_DISCARD';
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length===this.options.min&&
      new Set(cards).size===cards.length&&
      cards.every(c=>this.cards.cards.includes(c)&&c.fullName!=='blocked');
  }
}
const hand=(...names)=>({cards:names.map((name,index)=>({fullName:name,index}))});
const view=(s,seat)=>({
  decisionKind:'owner-prompt',globalTurn:7,
  ownHand:s.players[seat].hand.cards.map(c=>c.fullName)
});
const state=()=>{
  const a={id:10,hand:hand('OPP')},b={id:11,hand:hand('A','A','blocked')};
  return {players:[a,b],prompts:[new ChooseCardsPrompt(b,{min:1,max:1})]};
};

test('second physical seat owns prompt, blocked card never in menu',()=>{
  const s=state();
  assert.equal(actorHandDiscardInput(s,0,view),null);
  const input=actorHandDiscardInput(s,1,view);
  assert.deepEqual(input.prompt.menu,[['A']]);
  assert.deepEqual(chooseActorHandDiscard(input),{printings:['A']});
  s.players[0].hand=hand('CHANGED','OPP');
  assert.deepEqual(actorHandDiscardInput(s,1,view),input);
});

test('no card allowed yields strict fallback without fabricated action',()=>{
  const s=state();
  s.players[1].hand=hand('blocked');
  s.prompts[0].cards=s.players[1].hand;
  assert.equal(actorHandDiscardInput(s,1,view),null);
});

test('cloned non-live proposal remains generic and never selected',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    constructor(s){this.state=s;}
    dispatch(){return this.state;}
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:11};}
    decodeNextAction(){return 'generic';}
  }
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const s=state(),store=new Store(s),ai=new SimpleTacticsAi();
  const outcome=withActorHandDiscard(()=>{
    store.dispatch(new AddPlayerAction());
    const clone={...s};
    assert.equal(ai.decodeNextAction(clone),'generic');
    assert.ok(ai.decodeNextAction(s) instanceof ResolvePromptAction);
  },{Store,SimpleTacticsAi,ResolvePromptAction,
    observe:(actual,seat)=>actorHandDiscardInput(actual,seat,view),
    validate:()=>{}});
  assert.equal(outcome.audit.nonLiveSpeculativeFallbacks,1);
  assert.equal(outcome.audit.selected,1);
  assert.equal(outcome.audit.accepted,0);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
});
