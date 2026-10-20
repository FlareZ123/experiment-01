'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank6BenchPsychicRedirect}=
  require('../simulation/twinleaf/agent30-rank6-bench-psychic-redirect.cjs');

const SlotType={ACTIVE:1,BENCH:2};
const SuperType={ENERGY:3};
const EnergyType={BASIC:0,SPECIAL:1};
class AddPlayerAction{}
class PlayCardAction{
  /** @param {number} id @param {number} handIndex @param {object} target */
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class PassTurnAction{}
class FakeStore{
  /** @param {object} state */
  constructor(state){this.state=state;}
  /** @param {object} action */
  dispatch(action){
    if(action instanceof PlayCardAction){
      const owner=this.state.players[0];
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      const recipient=action.target.slot===SlotType.ACTIVE?
        owner.active:owner.bench[action.target.index];
      recipient.energies.cards.push(card);
    }
    return this.state;
  }
}
class FakeBot{
  /** @param {number} id */
  constructor(id){this.client={id};}
  /** @param {object} state @returns {object} */
  decodeNextAction(state){
    if(state.turn!==9)return new PassTurnAction();
    return new PlayCardAction(101,0,{player:1,slot:1,index:0});
  }
}
const deps={Store:FakeStore,SimpleTacticsAi:FakeBot,PlayCardAction,
  SlotType,SuperType,EnergyType};
const pokemon=name=>({
  getPokemonCard:()=>name?{name,fullName:name}:null,
  energies:{cards:[]}
});
function fixture(){
  const owner={id:101,hand:{cards:[{
    name:'Psychic Energy',fullName:'Psychic Energy MEE',
    superType:SuperType.ENERGY,energyType:EnergyType.BASIC
  }]},active:pokemon('Galarian Articuno V'),bench:[
    pokemon('Unown'),pokemon('Gengar & Mimikyu-GX')
  ]};
  const state={turn:9,activePlayer:0,players:[owner,{id:202}]};
  return {store:new FakeStore(state),state,owner,bot:new FakeBot(101)};
}

test('replaces only authentic owner-turn Energy play with public Gengar Bench',()=>{
  const f=fixture();
  const oldStore=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const oldDecode=FakeBot.prototype.decodeNextAction;
  const observed=withRank6BenchPsychicRedirect(deps,{
    candidateSeat:0,selectedTurns:[9]
  },()=>{
    f.store.dispatch(new AddPlayerAction());
    const action=f.bot.decodeNextAction(f.state);
    assert.equal(action.constructor.name,'PlayCardAction');
    assert.deepEqual(action.target,{player:1,slot:2,index:1});
    f.store.dispatch(action);
    return 'accepted';
  });
  assert.equal(observed.result,'accepted');
  assert.equal(f.owner.bench[1].energies.cards.length,1);
  assert.equal(f.owner.active.energies.cards.length,0);
  assert.equal(observed.audit.actualBotActionReplacements.length,1);
  assert.equal(observed.audit.actualBotActionReplacements[0].printedEnergy,
    'Psychic Energy MEE');
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch'),oldStore);
  assert.equal(FakeBot.prototype.decodeNextAction,oldDecode);
});

test('speculative bot snapshots and opponent roots never get redirected',()=>{
  const f=fixture();
  const other=fixture();
  const result=withRank6BenchPsychicRedirect(deps,{
    candidateSeat:0,selectedTurns:[9]
  },()=>{
    f.store.dispatch(new AddPlayerAction());
    const fakeAction=other.bot.decodeNextAction(other.state);
    assert.equal(fakeAction.target.slot,1);
    const unowned=new FakeBot(202).decodeNextAction(f.state);
    assert.equal(unowned.target.slot,1);
    return f.bot.decodeNextAction(f.state);
  });
  assert.equal(result.audit.actualBotActionReplacements.length,1);
});

test('a replay failure restores both native prototype hooks',()=>{
  const f=fixture();
  const oldStore=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const oldDecode=FakeBot.prototype.decodeNextAction;
  assert.throws(()=>withRank6BenchPsychicRedirect(deps,{
    candidateSeat:0,selectedTurns:[9]
  },()=>{f.store.dispatch(new AddPlayerAction());throw Error('failed');}),
  /failed/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,
    'dispatch'),oldStore);
  assert.equal(FakeBot.prototype.decodeNextAction,oldDecode);
});
