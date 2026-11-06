'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeTeamFlareOwnerChoices,VERSION}=
  require('../simulation/twinleaf/agent5-owner-teamflare-prompt-generic-v1.cjs');

class AddPlayerAction{}
class PlayCardAction {
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt {
  constructor(player,active,message){
    this.playerId=player.id;this.cards=active;this.id=91;
    this.message=message;this.result=undefined;
    this.options={min:1,max:1,allowCancel:false};
  }
  validate(cards){return cards.length===1&&this.cards.energies.cards.includes(cards[0]);}
}
class Ai {
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'native-delegated-pass'};}
}
const GamePhase={PLAYER_TURN:3};
function slot(fullName,energies=[]){
  return {fullName,cards:[...energies],
    energies:{cards:[...energies]},getPokemonCard:()=>({fullName})};
}
function exercise({seat=0,mode='settled',printing='Team Flare Grunt XY'}={}){
  const energy={fullName:'Psychic Energy MEE'};
  const trainer={fullName:printing};
  const players=[
    {id:'a',active:slot('Iron Thorns ex TWM'),hand:{cards:[]},
      supporter:{cards:[]},discard:{cards:[]},supporterTurn:0},
    {id:'b',active:slot('Tapu Lele-GX GRI',[energy]),hand:{cards:[]},
      supporter:{cards:[]},discard:{cards:[]},supporterTurn:0}
  ];
  const owner=players[seat],enemy=players[1-seat];
  owner.hand.cards.push(trainer);
  // Only the opponent's publicly revealed board is needed.
  Object.defineProperty(enemy,'hand',{get(){throw Error('concealed-hand access');}});
  class Store {
    constructor(){this.state={turn:5,phase:GamePhase.PLAYER_TURN,
      activePlayer:seat,players,prompts:[]};}
    dispatch(action){
      if(action instanceof PlayCardAction){
        owner.supporter.cards.push(owner.hand.cards.splice(action.handIndex,1)[0]);
        owner.supporterTurn=1;
        this.state.prompts.push(new ChooseCardsPrompt(owner,enemy.active,
          mode==='wrong-shape'?'CHOOSE_SPECIAL_CARD':'CHOOSE_CARD_TO_DISCARD'));
      }else if(action instanceof ResolvePromptAction){
        if(mode==='reject')throw Error('native prompt failed');
        if(mode==='silent')return true;
        const prompt=this.state.prompts[0];
        const chosen=action.result[0];prompt.result=action.result;
        for(const list of [enemy.active.cards,enemy.active.energies.cards]){
          const i=list.indexOf(chosen);assert.ok(i>=0);list.splice(i,1);
        }
        enemy.discard.cards.push(chosen);
      }
      return true;
    }
  }
  const store=new Store(), beforeDispatch=Store.prototype.dispatch,
    beforeDecode=Ai.prototype.decodeNextAction;
  let action;
  try{
    const result=withNativeTeamFlareOwnerChoices(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction(owner.id,0));
      action=new Ai(owner.id).decodeNextAction(store.state);
      if(action instanceof ResolvePromptAction)store.dispatch(action);
      return store;
    },{Store,SimpleTacticsAi:Ai,ResolvePromptAction,GamePhase});
    assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,beforeDecode);
    return {...result,energy,trainer,owner,enemy,action};
  }catch(error){
    assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,beforeDecode);
    throw error;
  }
}

for(const seat of [0,1]){
  test(`real Team Flare native owner card-choice settlement on physical seat ${seat}`,()=>{
    const r=exercise({seat});
    assert.equal(r.audit.version,VERSION);
    assert.equal(r.audit.realStores,1);
    assert.equal(r.audit.acceptedFlareRoots,1);
    assert.equal(r.audit.authenticOwnerPromptOffers,1);
    assert.equal(r.audit.proposedOwnerResponses,1);
    assert.equal(r.audit.settledRealEnergyChoices,1);
    assert.ok(r.action instanceof ResolvePromptAction);
    assert.strictEqual(r.action.result[0],r.energy);
    assert.deepEqual(r.enemy.discard.cards,[r.energy]);
    assert.equal(r.audit.physicalReceipts[0].originalEnergyIdentity,true);
    assert.equal(r.audit.physicalReceipts[0].sourceSeat,seat);
    assert.equal(r.audit.physicalReceipts[0].sourceSupporterTurnAtPrompt,1);
    assert.equal(r.audit.competitiveGamesQualified,0);
  });
}
test('silent non-settlement is never counted as physical accepted result',()=>{
  const r=exercise({mode:'silent'});
  assert.equal(r.audit.acceptedFlareRoots,1);
  assert.equal(r.audit.proposedOwnerResponses,1);
  assert.equal(r.audit.settledRealEnergyChoices,0);
  assert.equal(r.audit.unexpectedReturn,1);
});
test('wrong prompt shape delegates without selecting a fictitious Energy',()=>{
  const r=exercise({mode:'wrong-shape'});
  assert.equal(r.action.kind,'native-delegated-pass');
  assert.equal(r.audit.settledRealEnergyChoices,0);
  assert.equal(r.audit.unsupportedNativePromptShapes,1);
});
test('non-Team-Flare root leaves unrelated pending card choice alone',()=>{
  const r=exercise({printing:'Boss\'s Orders RCL'});
  assert.equal(r.action.kind,'native-delegated-pass');
  assert.equal(r.audit.acceptedFlareRoots,0);
  assert.equal(r.audit.settledRealEnergyChoices,0);
});
test('real native prompt error propagates and hook restores',()=>{
  assert.throws(()=>exercise({mode:'reject'}),e=>{
    assert.match(String(e),/native prompt failed/);
    assert.equal(e.agent5AllTeamFlareAudit.rejectedOwnerPrompts,1);
    assert.equal(e.agent5AllTeamFlareAudit.settledRealEnergyChoices,0);
    return true;
  });
});
