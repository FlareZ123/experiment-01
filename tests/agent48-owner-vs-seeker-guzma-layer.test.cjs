'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerVsSeekerGuzmaLayer}=require('../simulation/twinleaf/agent48-owner-vs-seeker-guzma-layer.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(playerId,playerType,slotType,handIndex){
    Object.assign(this,{playerId,playerType,slotType,handIndex});
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class PassTurnAction{}
class ChooseCardsPrompt{
  constructor(id,playerId,cards){
    Object.assign(this,{id,playerId,cards,result:undefined});
  }
  validate(selection){
    return selection.length===1&&this.cards.cards.includes(selection[0]);
  }
}
class Store{
  constructor(state,wrongZone=false){this.state=state;this.wrongZone=wrongZone;}
  dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    const seat=this.state.players.findIndex(p=>p.id===action.playerId);
    if(action instanceof PlayCardAction){
      const owner=this.state.players[seat];
      assert.equal(owner.hand.cards[action.handIndex].fullName,'VS Seeker PHF');
      const seeker=owner.hand.cards.splice(action.handIndex,1)[0];
      owner.discard.cards.push(seeker);
      const cards=this.wrongZone?owner.deck:owner.discard;
      this.state.prompts=[new ChooseCardsPrompt(91,owner.id,cards)];
      return true;
    }
    assert.ok(action instanceof ResolvePromptAction);
    const owner=this.state.players.find(p=>p.id===this.state.prompts[0].playerId);
    const prompt=this.state.prompts.find(p=>p.id===action.id&&p.result===undefined);
    assert.ok(prompt&&prompt.validate(action.result,this.state));
    for(const card of action.result){
      const index=owner.discard.cards.indexOf(card);
      owner.discard.cards.splice(index,1);
      owner.hand.cards.push(card);
    }
    prompt.result=action.result;
    return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction();}
}
function slot(fullName){
  const card=fullName?{
    fullName,name:fullName,hp:100,stage:'Basic',cardType:['Psychic'],
    retreat:[],weakness:[],resistance:[],attacks:[],powers:[]
  }:null;
  return {cards:card?[card]:[],energies:{cards:[]},tools:[],
    specialConditions:[],damage:0,pokemonPlayedTurn:1,
    getPokemonCard(){return card;}};
}
function scenario(ownerSeat,wrongZone=false){
  const owner={
    id:101,hand:{cards:[{fullName:'VS Seeker PHF'}]},
    discard:{cards:[{fullName:'Guzma BUS',id:'physical-guzma'}]},
    deck:{cards:[]},prizes:Array.from({length:6},()=>({cards:[{fullName:'Prize'}]})),
    stadium:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
    active:slot('Own Active'),bench:[slot('Own Bench'),slot(null)],
    supporterTurn:0,retreatedTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,stadiumUsedTurn:0,usedGX:false,usedVSTAR:false,
    cannotPlayItemCards:false,cannotPlaySupporterCards:false,
    cannotPlayPokemonCards:false
  };
  const rival={
    id:202,hand:{cards:[]},discard:{cards:[]},deck:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[{fullName:'Prize'}]})),
    stadium:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
    active:slot('Rival Active'),bench:[slot('Rival Bench'),slot(null)],
    supporterTurn:0,retreatedTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,stadiumUsedTurn:0,usedGX:false,usedVSTAR:false,
    cannotPlayItemCards:false,cannotPlaySupporterCards:false,
    cannotPlayPokemonCards:false
  };
  const state={turn:3,phase:2,activePlayer:ownerSeat,prompts:[],
    players:ownerSeat===0?[owner,rival]:[rival,owner]};
  return {state,owner,rival,store:new Store(state,wrongZone)};
}
const deps={
  Store,SimpleTacticsAi,PlayCardAction,ResolvePromptAction,
  actionTypes:{PlayerType:{ANY:0},SlotType:{BOARD:1}}
};

test('both physical seats recover the exact owner-discard Guzma through native prompt dispatch',()=>{
  const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const result=withOwnerVsSeekerGuzmaLayer(()=>{
    const rows=[];
    for(const seat of [0,1]){
      const f=scenario(seat),owner=f.state.players[seat];
      f.store.dispatch(new AddPlayerAction());
      const bot=new SimpleTacticsAi(owner.id);
      const root=bot.decodeNextAction(f.state);
      assert.ok(root instanceof PlayCardAction);
      f.store.dispatch(root);
      const promptAction=bot.decodeNextAction(f.state);
      assert.ok(promptAction instanceof ResolvePromptAction);
      assert.equal(promptAction.id,91);
      assert.strictEqual(promptAction.result[0],owner.discard.cards.find(c=>c.fullName==='Guzma BUS'));
      f.store.dispatch(promptAction);
      assert.ok(owner.hand.cards.includes(promptAction.result[0]));
      assert.ok(!owner.discard.cards.includes(promptAction.result[0]));
      rows.push(owner.hand.cards.find(c=>c.fullName==='Guzma BUS'));
    }
    return rows;
  },deps);
  assert.equal(result.audit.rootsProposed,2);
  assert.equal(result.audit.rootsAccepted,2);
  assert.equal(result.audit.promptsProposed,2);
  assert.equal(result.audit.promptsAccepted,2);
  assert.equal(result.audit.receipts.length,2);
  assert.equal(result.audit.actualGamesSeen,2);
  assert.ok(result.audit.receipts.every(x=>x.exactPhysicalCardMoved&&x.supportItemMovedToDiscard));
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});

test('rejects a native prompt whose collection is not the owner discard',()=>{
  const f=scenario(0,true);
  assert.throws(()=>withOwnerVsSeekerGuzmaLayer(()=>{
    f.store.dispatch(new AddPlayerAction());
    const bot=new SimpleTacticsAi(101);
    f.store.dispatch(bot.decodeNextAction(f.state));
  },deps),/authenticated owner-discard prompt/);
});
