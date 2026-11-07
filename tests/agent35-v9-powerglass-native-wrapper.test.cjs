'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PRINTING,withOwnerPowerglassAfterSupporter}=
  require('../simulation/twinleaf/agent35-v9-owner-powerglass-after-lillie.cjs');

const PlayerType={BOTTOM_PLAYER:1},SlotType={ACTIVE:0};
const CardType={COLORLESS:9},EnergyType={BASIC:1},SuperType={ENERGY:2};
class AddPlayerAction{}
class PassTurnAction{constructor(id){this.id=id;}}
class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class SimpleTacticsAi{
  constructor(client){this.client=client;}
  decodeNextAction(){return new PassTurnAction(this.client.id);}
}
class Store{
  constructor(){
    const tool={fullName:PRINTING};
    const energy={fullName:'Psychic Energy MEE',
      superType:SuperType.ENERGY,energyType:EnergyType.BASIC};
    this.owner={id:100,hand:{cards:[tool]},
      active:{tools:[],energies:{cards:[]}},discard:{cards:[energy]}};
    this.tool=tool;
    this.energy=energy;
    this.state={turn:14,activePlayer:1,prompts:[],
      players:[{id:200},this.owner]};
  }
  dispatch(action){
    const {owner,tool,energy,state}=this;
    if(action.constructor.name==='AddPlayerAction')return;
    if(action.constructor.name==='PlayCardAction'){
      assert.equal(action.target.player,PlayerType.BOTTOM_PLAYER);
      assert.equal(action.target.slot,SlotType.ACTIVE);
      assert.equal(owner.hand.cards[action.handIndex],tool);
      owner.hand.cards.splice(action.handIndex,1);
      owner.active.tools.push(tool);
      return;
    }
    if(action.constructor.name==='PassTurnAction'){
      assert.ok(owner.active.tools.includes(tool));
      state.activePlayer=0;
      state.prompts.push({
        id:77+state.prompts.length,constructor:{name:'AttachEnergyPrompt'},
        playerId:owner.id,result:undefined,cardList:owner.discard,
        playerType:PlayerType.BOTTOM_PLAYER,slots:[SlotType.ACTIVE],
        options:{min:0,max:1},
        validate(chosen){
          return chosen.length===0||chosen.length===1&&
            chosen[0].card===energy&&chosen[0].to.slot===SlotType.ACTIVE;
        }
      });
      return;
    }
    assert.equal(action.constructor.name,'ResolvePromptAction');
    const prompt=state.prompts.find(p=>p.id===action.id&&p.result===undefined);
    assert.equal(prompt.validate(action.result),true);
    prompt.result=action.result;
    if(action.result.length){
      owner.discard.cards.splice(owner.discard.cards.indexOf(energy),1);
      owner.active.energies.cards.push(energy);
    }
  }
}
function observe(){
  return {decisionKind:'owner-root',globalTurn:14,
    ownTurnResources:{supporterPlayedTurn:1,toolPlayLocked:false},
    ownHand:[PRINTING],ownPublic:{
      active:{printing:'Unown AOR',energies:[],tools:[],
        attacks:[{name:'Hidden Power',cost:[9],damage:10}]},
      discard:['Psychic Energy MEE'],
      publicTurnRestrictions:{toolPlayLocked:false}},
    opponentPublic:{active:{hp:70,damage:60}}};
}
const deps={
  bot:{SimpleTacticsAi},store:{Store},
  play:{PlayCardAction,PlayerType,SlotType},
  prompt:{ResolvePromptAction},cardTypes:{CardType,EnergyType,SuperType},
  observe
};
test('physically pays Tool, passes, and moves Basic Energy from own discard',()=>{
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const observed=withOwnerPowerglassAfterSupporter(()=>{
    const store=new Store();
    const bot=new SimpleTacticsAi({id:100});
    store.dispatch(new AddPlayerAction());
    const tool=bot.decodeNextAction(store.state);
    assert.equal(tool.constructor.name,'PlayCardAction');
    store.dispatch(tool);
    store.dispatch(new PassTurnAction(100));
    const attachment=bot.decodeNextAction(store.state);
    assert.equal(attachment.constructor.name,'ResolvePromptAction');
    store.dispatch(attachment);
    assert.ok(store.owner.active.tools.includes(store.tool));
    assert.ok(store.owner.active.energies.cards.includes(store.energy));
    assert.equal(store.owner.discard.cards.includes(store.energy),false);
    // After an attack on a later turn, the Tool must also resolve an
    // optional empty prompt when no Basic Energy remains in the discard.
    store.dispatch(new PassTurnAction(100));
    const second=bot.decodeNextAction(store.state);
    assert.equal(second.constructor.name,'ResolvePromptAction');
    assert.deepEqual(second.result,[]);
    store.dispatch(second);
    return 'settled';
  },deps);
  assert.equal(observed.result,'settled');
  assert.equal(observed.audit.rootAccepted,1);
  assert.equal(observed.audit.promptAccepted,2);
  assert.equal(observed.audit.attachedFromDiscard,1);
  assert.equal(observed.audit.promptEvents[1].emptyOptional,true);
  assert.equal(observed.audit.rootRejected,0);
  assert.deepEqual(observed.audit.promptEvents.map(r=>r.printing),
    ['Psychic Energy MEE',null]);
  assert.equal(observed.audit.qualifiedCompetitiveGames,0);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});
test('rejected physical payment fails closed and restores engine methods',()=>{
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  assert.throws(()=>withOwnerPowerglassAfterSupporter(()=>{
    const store=new Store();
    const bot=new SimpleTacticsAi({id:100});
    store.dispatch(new AddPlayerAction());
    const proposed=bot.decodeNextAction(store.state);
    store.owner.hand.cards=[];
    store.dispatch(proposed);
  },deps),/undefined/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});
