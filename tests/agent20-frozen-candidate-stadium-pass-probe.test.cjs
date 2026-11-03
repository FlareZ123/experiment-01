'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  detachedStadiumAtPass,withFrozenCandidateStadiumPassProbe
}=require('../simulation/twinleaf/agent20-frozen-candidate-stadium-pass-probe.cjs');

const TYPE={STADIUM:'stadium',ITEM:'item'};
class TrainerCard{
  constructor(fullName,name,trainerType=TYPE.STADIUM){
    Object.assign(this,{fullName,name,trainerType});
  }
}
class PlayCardAction{
  constructor(clientId,handIndex,slot){
    Object.assign(this,{clientId,handIndex,slot});
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class AddPlayerAction{}
class PassTurnAction{
  constructor(clientId){this.clientId=clientId;}
}
class FakeStore{
  constructor(){this.state=null;this.selected=[];}
  dispatch(action){
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.clientId);
      if(!owner)throw Error('Not owner');
      const card=owner.hand.cards[action.handIndex];
      if(!card || card.trainerType!==TYPE.STADIUM)
        throw Error('Not Stadium');
      if(owner.stadiumPlayedTurn===this.state.turn)
        throw Error('Stadium quota consumed');
      const enemy=this.state.players.find(p=>p!==owner);
      const present=owner.stadium.cards.concat(enemy.stadium.cards);
      if(present.some(x=>x.name===card.name))
        throw Error('Same name');
      owner.hand.cards.splice(action.handIndex,1);
      for(const player of [owner,enemy]){
        for(const removed of player.stadium.cards.splice(0)){
          if(removed.fullName==='Thunder Mountain Prism Star LOT')
            player.lostZone.cards.push(removed);
          else player.discard.cards.push(removed);
        }
      }
      owner.stadium.cards.push(card);
      owner.stadiumPlayedTurn=this.state.turn;
      return 'native-accepted';
    }
    return 'unchanged-real-store';
  }
}
function player(id,hand=[],stadiums=[]){
  return {
    id,hand:{cards:hand},stadium:{cards:stadiums},
    discard:{cards:[]},lostZone:{cards:[]},deck:{cards:[]},
    stadiumPlayedTurn:0,cannotPlayStadiumCards:false
  };
}
function state(held='Dimension Valley PHF'){
  const name=held.startsWith('Dimension')?'Dimension Valley':'Path to the Peak';
  return {
    turn:4,activePlayer:0,prompts:[],
    players:[
      player(101,[new TrainerCard(held,name)]),
      player(202,[],[new TrainerCard(
        'Thunder Mountain Prism Star LOT','Thunder Mountain')])
    ]
  };
}
const deps={
  store:{Store:FakeStore},
  play:{PlayCardAction,PlayerType:{ANY:'any'},
    SlotType:{BOARD:'board'}},
  trainer:{TrainerCard},types:{TrainerType:TYPE},
  resolve:{ResolvePromptAction},utils:{deepClone:structuredClone}
};

test('detached genuine Stadium replacement has physical card and Prism custody',()=>{
  const live=state();
  const before=structuredClone(live);
  const result=detachedStadiumAtPass(live,0,deps);
  assert.equal(result.nativeCounterfactualAcceptedReplacements,1);
  const arm=result.attempts[0];
  assert.equal(arm.nativeRootAccepted,true);
  assert.equal(arm.promptsSettled,true);
  assert.equal(arm.exactNewStadiumPhysicalCustody,true);
  assert.equal(arm.replacedPreviousSourceStadium,true);
  assert.deepEqual(arm.nativeSourcePrismStarDisposal,{
    ownerLostZone:1,ownerDiscard:0
  });
  assert.deepEqual(structuredClone(live),before,
    'Actual source game state must remain unchanged');
  assert.equal(result.competitiveGameQualified,false);
});

test('both specific archived held Stadium printings are printable native options',()=>{
  for(const held of ['Dimension Valley PHF','Path to the Peak CRE']){
    const receipt=detachedStadiumAtPass(state(held),0,deps);
    assert.equal(receipt.attempts[0].printing,held);
    assert.equal(receipt.attempts[0].publicGenericRuleBlocker,null);
    assert.equal(receipt.attempts[0].nativeRootAccepted,true);
  }
});

test('same-name Stadium or already-played Stadium is not counterfactually dispatched',()=>{
  const a=state();
  a.players[1].stadium.cards[0].name='Dimension Valley';
  const blocked=detachedStadiumAtPass(a,0,deps);
  assert.equal(blocked.attempts[0].publicGenericRuleBlocker,
    'same-named-stadium');
  assert.equal(blocked.attempts[0].nativeRootAccepted,false);
  const b=state();
  b.players[0].stadiumPlayedTurn=4;
  const used=detachedStadiumAtPass(b,0,deps);
  assert.equal(used.attempts[0].publicGenericRuleBlocker,
    'stadium-already-played');
  assert.equal(used.nativeCounterfactualAcceptedReplacements,0);
});

test('live prompt or owner-turn mismatch prevents clone experiment',()=>{
  const a=state();
  a.prompts.push({result:undefined});
  assert.equal(detachedStadiumAtPass(a,0,deps)
    .attempts[0].publicGenericRuleBlocker,'not-owner-root');
  const b=state();
  b.activePlayer=1;
  assert.equal(detachedStadiumAtPass(b,0,deps)
    .attempts[0].publicGenericRuleBlocker,'not-owner-root');
});

test('Store rejection is preserved as a native negative and original state remains',()=>{
  class ThrowStore extends FakeStore{
    dispatch(action){if(action instanceof PlayCardAction)
      throw Error('Native-Store-incompatible');return super.dispatch(action);}
  }
  const live=state(),prior=structuredClone(live);
  const got=detachedStadiumAtPass(live,0,{
    ...deps,store:{Store:ThrowStore}
  });
  assert.equal(got.nativeCounterfactualAcceptedReplacements,0);
  assert.equal(got.attempts[0].nativeRootAccepted,false);
  assert.match(got.attempts[0].nativeError,/Native-Store-incompatible/);
  assert.deepEqual(structuredClone(live),prior);
});

test('observer only targets actual registered candidate-A turn-four Pass roots',()=>{
  const trials=[
    {id:'6:0:A:champion-reference',rank:6,candidateSlot:'A',
      candidateId:'champion-reference'},
    {id:'6:0:A:new-moon-lockbreaker-v1',rank:6,candidateSlot:'A',
      candidateId:'new-moon-lockbreaker-v1'},
    {id:'6:1:B:champion-reference',rank:6,candidateSlot:'B',
      candidateId:'champion-reference'},
    {id:'6:1:B:new-moon-lockbreaker-v1',rank:6,candidateSlot:'B',
      candidateId:'new-moon-lockbreaker-v1'}
  ];
  const before=Object.getOwnPropertyDescriptor(FakeStore.prototype,
    'dispatch');
  const result=withFrozenCandidateStadiumPassProbe(()=>{
    for(const trial of trials){
      const game=new FakeStore();
      game.state=state();
      game.dispatch(new AddPlayerAction());
      game.dispatch(new AddPlayerAction());
      game.dispatch(new PassTurnAction(
        trial.candidateSlot==='A'?101:202));
    }
    return {realGamePolicy:'unchanged'};
  },trials,{store:{Store:FakeStore},
    probe:(actual,seat)=>({proof:'detached',seat,turn:actual.turn})});
  assert.equal(result.result.realGamePolicy,'unchanged');
  assert.equal(result.audit.observedActualNativeGames,4);
  assert.deepEqual(result.audit.events.map(x=>x.trialId),
    trials.slice(0,2).map(x=>x.id));
  assert.ok(result.audit.events.every(e=>e.nativePassAccepted));
  assert.equal(FakeStore.prototype.dispatch,before.value);
});

test('observer restores Store descriptor after native failures',()=>{
  const trials=Array.from({length:4},(_,i)=>({
    id:'6:'+i,candidateSlot:'A',rank:6
  }));
  const original=FakeStore.prototype.dispatch;
  assert.throws(()=>withFrozenCandidateStadiumPassProbe(()=>{
    throw Error('Inner game failed');
  },trials,{store:{Store:FakeStore},probe:()=>null}),/Inner game failed/);
  assert.equal(FakeStore.prototype.dispatch,original);
});
