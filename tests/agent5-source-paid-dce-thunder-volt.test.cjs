'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceAfterDceThunderVolt,DCE,THUNDER,THORNS,ATTACK}=
  require('../simulation/twinleaf/agent5-source-paid-dce-thunder-volt.cjs');
const {DCE:PHYSICAL_DCE}=require(
  '../simulation/twinleaf/agent5-paid-ghala-dce-owner-witness.cjs');

function fixture(includeThunder=true){
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction{
    constructor(clientId,name){this.clientId=clientId;this.name=name;}
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class PassTurnAction{
    constructor(clientId){this.clientId=clientId;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction(this.client.id);}
  }
  const thorns=()=>({
    energies:{cards:[]},tools:[],damage:0,
    getPokemonCard(){return {fullName:THORNS,name:'Iron Thorns ex'};}
  });
  const energy={fullName:PHYSICAL_DCE};
  const stadium={fullName:THUNDER};
  const owner={
    id:100,hand:{cards:includeThunder?[energy,stadium]:[energy]},
    active:thorns(),bench:[thorns()],
    stadium:{cards:[]},energyPlayedTurn:0,
    stadiumPlayedTurn:0,cannotPlayEnergyCards:false,
    cannotPlayStadiumCards:false,cannotAttackTurnsRemaining:0
  };
  const opponent={id:200,active:thorns(),stadium:{cards:[]},
    get deck(){throw Error('CONCEALED_OPPONENT_DECK_READ');},
    get hand(){throw Error('CONCEALED_OPPONENT_HAND_READ');}
  };
  const state={turn:2,activePlayer:0,prompts:[],players:[owner,opponent]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return this.state;
      if(action instanceof PlayCardAction){
        const card=owner.hand.cards.splice(action.handIndex,1)[0];
        if(card===energy){
          owner.active.energies.cards.push(card);
          owner.energyPlayedTurn=this.state.turn;
        }else if(card===stadium){
          owner.stadium.cards.push(card);
          owner.stadiumPlayedTurn=this.state.turn;
        }else throw Error('UNKNOWN_SOURCE_CARD');
        return this.state;
      }
      if(action instanceof AttackAction){
        assert.equal(action.name,ATTACK);
        opponent.active.damage+=140;
        const prompt={
          id:45,playerId:owner.id,
          constructor:{name:'AttachEnergyPrompt'},
          cardList:owner.active,
          options:{min:1,max:1,allowCancel:false},
          result:undefined,
          validate(cards){return cards.length===1&&
            cards[0].card===energy&&cards[0].to.index===0;}
        };
        this.state.prompts.push(prompt);
        return this.state;
      }
      if(action instanceof ResolvePromptAction){
        const prompt=this.state.prompts.find(p=>p.id===action.id);
        assert.ok(prompt);
        assert.ok(prompt.validate(action.result));
        prompt.result=action.result;
        const card=action.result[0].card;
        const pos=owner.active.energies.cards.indexOf(card);
        assert.ok(pos>=0);
        owner.active.energies.cards.splice(pos,1);
        owner.bench[0].energies.cards.push(card);
        this.state.activePlayer=1;
        this.state.turn=3;
        return this.state;
      }
      if(action instanceof PassTurnAction){
        this.state.turn=3;this.state.activePlayer=1;return this.state;
      }
      throw Error('UNKNOWN_ACTION');
    }
  }
  return {
    AddPlayerAction,PlayCardAction,AttackAction,
    ResolvePromptAction,PassTurnAction,
    SimpleTacticsAi,Store,state,owner,opponent,energy,stadium
  };
}

test('real owner mocked dispatch replaces two genuine Pass decisions and resolves mandatory physical DCE move',()=>{
  const f=fixture();
  const store=new f.Store(),ai=new f.SimpleTacticsAi(f.owner.id);
  const priorStore=f.Store.prototype.dispatch;
  const priorAi=f.SimpleTacticsAi.prototype.decodeNextAction;
  const result=withSourceAfterDceThunderVolt(()=>{
    store.dispatch(new f.AddPlayerAction());
    store.dispatch(new f.PlayCardAction(f.owner.id,0,{
      player:2,slot:1,index:0}));
    const stadiumAction=ai.decodeNextAction(f.state);
    assert.equal(stadiumAction.constructor.name,'PlayCardAction');
    assert.equal(stadiumAction.handIndex,0);
    store.dispatch(stadiumAction);
    const attackAction=ai.decodeNextAction(f.state);
    assert.equal(attackAction.constructor.name,'AttackAction');
    assert.equal(attackAction.name,ATTACK);
    store.dispatch(attackAction);
    const promptAction=ai.decodeNextAction(f.state);
    assert.equal(promptAction.constructor.name,'ResolvePromptAction');
    store.dispatch(promptAction);
    return 42;
  },{trialId:'6:101:B:champion-reference',
    Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    PlayCardAction:f.PlayCardAction,AttackAction:f.AttackAction,
    ResolvePromptAction:f.ResolvePromptAction,
    PlayerType:{ANY:0,BOTTOM_PLAYER:2},
    SlotType:{BOARD:0,ACTIVE:1,BENCH:2}});
  assert.equal(result.result,42);
  assert.equal(result.audit.realActiveDcePaymentRoots,1);
  assert.equal(result.audit.realSourceBaselinePassAfterDce,1);
  assert.equal(result.audit.acceptedThunderStadiumRoots,1);
  assert.equal(result.audit.physicalThunderToStadiumSettlements,1);
  assert.equal(result.audit.acceptedVoltCycloneAttackRoots,1);
  assert.equal(result.audit.nativeVoltCycloneOwnerPrompts,1);
  assert.equal(result.audit.nativeSettledMandatoryEnergyMoves,1);
  assert.equal(result.audit.opponentResponseObserved,true);
  assert.deepEqual(f.owner.active.energies.cards,[]);
  assert.deepEqual(f.owner.bench[0].energies.cards,[f.energy]);
  assert.deepEqual(f.owner.stadium.cards,[f.stadium]);
  assert.equal(f.opponent.active.damage,140);
  assert.strictEqual(f.Store.prototype.dispatch,priorStore);
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,priorAi);
});

test('no held Thunder Mountain means original Pass decision remains',()=>{
  const f=fixture(false);
  const store=new f.Store(),ai=new f.SimpleTacticsAi(f.owner.id);
  const x=withSourceAfterDceThunderVolt(()=>{
    store.dispatch(new f.AddPlayerAction());
    store.dispatch(new f.PlayCardAction(f.owner.id,0,{
      player:2,slot:1,index:0}));
    return ai.decodeNextAction(f.state);
  },{trialId:'negative',
    Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    PlayCardAction:f.PlayCardAction,AttackAction:f.AttackAction,
    ResolvePromptAction:f.ResolvePromptAction,
    PlayerType:{ANY:0,BOTTOM_PLAYER:2},
    SlotType:{BOARD:0,ACTIVE:1,BENCH:2}});
  assert.equal(x.result.constructor.name,'PassTurnAction');
  assert.equal(x.audit.proposedThunderStadiumRoots,0);
  assert.equal(x.audit.proposedVoltCycloneAttackRoots,0);
});

test('native rejection propagates and both prototype hooks restore',()=>{
  const f=fixture();
  const priorStore=f.Store.prototype.dispatch;
  const priorAi=f.SimpleTacticsAi.prototype.decodeNextAction;
  let captured;
  try{
    withSourceAfterDceThunderVolt(()=>{
      const store=new f.Store();
      store.dispatch(new f.AddPlayerAction());
      store.dispatch({constructor:{name:'Unknown'}});
    },{trialId:'negative-error',Store:f.Store,
      SimpleTacticsAi:f.SimpleTacticsAi,
      PlayCardAction:f.PlayCardAction,AttackAction:f.AttackAction,
      ResolvePromptAction:f.ResolvePromptAction,
      PlayerType:{ANY:0,BOTTOM_PLAYER:2},
      SlotType:{BOARD:0,ACTIVE:1,BENCH:2}});
  }catch(error){captured=error;}
  assert.match(String(captured),/UNKNOWN_ACTION/);
  assert.equal(captured.agent5AfterDceThunderVoltAudit.competitiveGamesQualified,0);
  assert.strictEqual(f.Store.prototype.dispatch,priorStore);
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,priorAi);
});
