'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {withActorHandDiscard,actorHandDiscardInput} =
  require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result) {this.id=id;this.result=result;}
}
class ChooseCardsPrompt {
  constructor(owner) {
    this.id=40;this.playerId=owner.id;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.cards={cards:[...owner.hand.cards]};
    this.options={min:2,max:2,allowCancel:false};
  }
  validate(cards) {
    return Array.isArray(cards)&&cards.length===2 &&
      new Set(cards).size===2 && cards.every(c=>this.cards.cards.includes(c));
  }
}
class Store {
  constructor(state) {this.state=state;}
  dispatch(action) {
    if(action instanceof ResolvePromptAction) {
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt.validate(action.result));
      const owner=this.state.players.find(p=>p.id===prompt.playerId);
      for(const card of action.result) {
        const i=owner.hand.cards.indexOf(card);
        assert.ok(i>=0);
        owner.hand.cards.splice(i,1);
        owner.discard.cards.push(card);
      }
      prompt.result=action.result;
    }
    return this.state;
  }
}
class SimpleTacticsAi {
  constructor(id) {this.client={id};}
  decodeNextAction(){return 'fallback';}
}
const fullName = name => ({fullName:name});
function make(seat,options={}) {
  const hand=['Dragapult ex TWM','Megaton Blower SSP',
    'Grass Energy MEE','Grass Energy MEE'].map(fullName);
  const owner={id:99,hand:{cards:hand},discard:{cards:[]}};
  const opponent={id:98,hand:{cards:[fullName('SECRET')]},
    discard:{cards:[]}};
  const players=seat===0?[owner,opponent]:[opponent,owner];
  const state={players,activePlayer:seat,turn:8,
    prompts:[new ChooseCardsPrompt(owner)]};
  const observe=(actual,index)=>actorHandDiscardInput(actual,index,(_s,_i)=>({
    decisionKind:'owner-prompt',globalTurn:8,
    ownHand:owner.hand.cards.map(c=>c.fullName),
    ownPublic:{active:{printing:'Regidrago VSTAR SIT',
      attacks:[{name:'Apex Dragon'}],
      energies:options.basic?
        ['Grass Energy MEE','Grass Energy MEE','Fire Energy MEE']:
        ['Double Dragon Energy ROS','Double Dragon Energy ROS'],
      specialConditions:[],publicRestrictions:{}},
      discard:options.payloadAlready?['Dialga-GX UPR']:[],
      stadium:[],publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{stadium:options.temple?['Temple of Sinnoh ASR']:[]}
  }));
  const store=new Store(state),bot=new SimpleTacticsAi(99);
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const output=withActorHandDiscard(()=>{
    store.dispatch(new AddPlayerAction());
    const action=bot.decodeNextAction(state);
    assert.ok(action instanceof ResolvePromptAction);
    store.dispatch(action);
    return action.result.map(card=>card.fullName).sort();
  },{Store,SimpleTacticsAi,ResolvePromptAction,validate:()=>{},observe},
    {apexPayloadDiscard:options.enabled===true});
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.equal(output.audit.accepted,1);
  assert.equal(output.audit.rejected,0);
  assert.equal(output.audit.nativePromptPostconditionsConfirmed,1);
  assert.equal(output.audit.bySeat[seat],1);
  assert.equal(state.prompts[0].result.length,2);
  assert.equal(owner.discard.cards.length,2);
  assert.ok(owner.discard.cards.every(c=>state.prompts[0].cards.cards.includes(c)));
  return {...output,physicalDiscard:owner.discard.cards.map(c=>c.fullName).sort()};
}

test('default OFF retains two Grass, explicit opt-in chooses one Dragon + Grass',()=>{
  const baseline=make(0),treatment=make(0,{enabled:true});
  assert.deepEqual(baseline.result,['Grass Energy MEE','Grass Energy MEE']);
  assert.deepEqual(treatment.result,['Dragapult ex TWM','Grass Energy MEE']);
  assert.equal(baseline.audit.apexPayloadDiscardOptIn,false);
  assert.equal(treatment.audit.apexPayloadDiscardOptIn,true);
  assert.equal(treatment.audit.apexAlternativeProposals,1);
  assert.equal(treatment.audit.apexSelected,1);
  assert.deepEqual(treatment.physicalDiscard,treatment.result);
});

test('owner physical seat 1 uses own cards, never the concealed opponent card',()=>{
  const treatment=make(1,{enabled:true});
  assert.deepEqual(treatment.result,['Dragapult ex TWM','Grass Energy MEE']);
  assert.equal(treatment.audit.bySeat[0],0);
  assert.equal(treatment.audit.bySeat[1],1);
});

test('Temple and existing copyable discard provide hold negatives',()=>{
  for(const options of [{temple:true},{payloadAlready:true}]) {
    const r=make(0,{enabled:true,...options});
    assert.deepEqual(r.result,['Grass Energy MEE','Grass Energy MEE']);
    assert.equal(r.audit.apexAlternativeProposals,0);
    assert.equal(r.audit.apexSelected,0);
  }
});

test('typed basic Energy direct cost permits prompt alternative even under Temple',()=>{
  const r=make(0,{enabled:true,basic:true,temple:true});
  assert.deepEqual(r.result,['Dragapult ex TWM','Grass Energy MEE']);
});
