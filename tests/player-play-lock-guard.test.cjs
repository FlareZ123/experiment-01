'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {blockedHandPlay,withOwnerVisiblePlayLockGuard}=
  require('../simulation/twinleaf/player-play-lock-guard.cjs');

const enums={
  SuperType:{POKEMON:1,TRAINER:2,ENERGY:3},
  TrainerType:{ITEM:0,SUPPORTER:1,STADIUM:2,TOOL:3},
  EnergyType:{BASIC:0,SPECIAL:1}
};
const cards={
  stadium:{fullName:'Thunder Mountain Prism Star LOT',superType:2,trainerType:2},
  special:{fullName:'Double Colorless Energy SUM',superType:3,energyType:1},
  basic:{fullName:'Lightning Energy MEE',superType:3,energyType:0},
  item:{fullName:'Field Blower GRI',superType:2,trainerType:0},
  supporter:{fullName:'Guzma BUS',superType:2,trainerType:1},
  tool:{fullName:'Float Stone BKT',superType:2,trainerType:3}
};
const action=(id,handIndex=0)=>({type:'PLAY_CARD_ACTION',id,handIndex});
function fixture() {
  return {turn:3,players:[
    {id:101,hand:{cards:[cards.item]},cannotPlayItemCards:false},
    {id:202,hand:{cards:[cards.stadium,cards.special,cards.basic,
      cards.item,cards.supporter,cards.tool]},cannotPlayStadiumCards:true,
      cannotPlaySpecialEnergyCards:true}
  ]};
}

test('Shadow Mist veto is actor-local for Stadium and Special Energy',()=>{
  const state=fixture();
  assert.deepEqual(blockedHandPlay(state,action(202),enums),{
    actorId:202,turn:3,printedCard:cards.stadium.fullName,
    reason:'cannotPlayStadiumCards'
  });
  assert.equal(blockedHandPlay(state,action(202,1),enums).reason,
    'cannotPlaySpecialEnergyCards');
  assert.equal(blockedHandPlay(state,action(202,2),enums),null);
  assert.equal(blockedHandPlay(state,action(101),enums),null);
  assert.equal(blockedHandPlay(state,{type:'ATTACK_ACTION',id:202},enums),null);
});

test('distinct Item, Tool, Supporter and general Energy locks are respected',()=>{
  const state=fixture(),owner=state.players[1];
  owner.cannotPlayItemCards=true;
  owner.cannotPlaySupporterCards=true;
  owner.cannotPlayToolCards=true;
  owner.cannotPlayEnergyCards=true;
  for(const [index,reason] of [[3,'cannotPlayItemCards'],
    [4,'cannotPlaySupporterCards'],[5,'cannotPlayToolCards'],
    [2,'cannotPlayEnergyCards']]){
    assert.equal(blockedHandPlay(state,action(202,index),enums).reason,reason);
  }
  owner.cannotPlayStadiumCards=false;
  assert.equal(blockedHandPlay(state,action(202),enums),null);
});

test('bot continues to another tactic after blocked first proposal',()=>{
  class Bot {
    isValidAction(_state,_action){return true;}
    decode(state,alternatives) {
      return alternatives.find(candidate=>this.isValidAction(state,candidate));
    }
  }
  const before=Bot.prototype.isValidAction;
  const state=fixture();
  const originalActions=[action(202),action(202,1),action(202,4)];
  const {result,policyAudit}=withOwnerVisiblePlayLockGuard(()=>{
    const bot=new Bot();
    return bot.decode(state,originalActions);
  },{BotClass:Bot,enums});
  assert.equal(result.handIndex,4);
  assert.equal(policyAudit.rejectedProposals,2);
  assert.deepEqual(policyAudit.events.map(e=>e.reason),
    ['cannotPlayStadiumCards','cannotPlaySpecialEnergyCards']);
  assert.strictEqual(Bot.prototype.isValidAction,before);
});

test('restores the descriptor after a thrown game action',()=>{
  class Bot {isValidAction(){return true;}}
  const original=Object.getOwnPropertyDescriptor(Bot.prototype,'isValidAction');
  assert.throws(()=>withOwnerVisiblePlayLockGuard(()=>{
    assert.equal(new Bot().isValidAction(fixture(),action(202)),false);
    throw Error('test failure');
  },{BotClass:Bot,enums}),/test failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Bot.prototype,
    'isValidAction'),original);
});
