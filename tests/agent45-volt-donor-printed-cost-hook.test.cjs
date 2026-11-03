'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preferredAlternativeDonorName,withPrintedVoltDonorPreference}=
  require('../simulation/twinleaf/agent45-volt-donor-printed-cost-hook.cjs');

const speed='Speed Lightning Energy';
const spiky='Spiky Energy';
const dce='Double Colorless Energy';
const capture='Capture Energy';

test('owner cost preference changes Speed donor to Spiky on actual source energy types',()=>{
  assert.equal(preferredAlternativeDonorName([speed,spiky,dce],[],speed),spiky);
});

test('already payable native donor remains unchanged',()=>{
  assert.equal(preferredAlternativeDonorName([speed,spiky,dce],[],spiky),null);
  assert.equal(preferredAlternativeDonorName([speed,spiky,dce],[],dce),spiky);
});

test('unavoidable printed attack deficit remains native choice',()=>{
  assert.equal(preferredAlternativeDonorName([speed,dce],[],speed),null);
  assert.equal(preferredAlternativeDonorName([capture,dce],[],capture),null);
  assert.equal(preferredAlternativeDonorName([speed,spiky],[],speed),null);
});

test('Thunder Mountain changes printed preferred donor option',()=>{
  assert.equal(preferredAlternativeDonorName([speed,spiky,dce],
    ['Thunder Mountain Prism Star'],speed),null);
  assert.equal(preferredAlternativeDonorName([speed,spiky],
    ['Thunder Mountain Prism Star'],speed),null);
});

test('unknown Stadiums and invalid donor identity fail closed',()=>{
  assert.equal(preferredAlternativeDonorName([speed,spiky,dce],
    ['Other Stadium'],speed),null);
  assert.equal(preferredAlternativeDonorName([speed,spiky,dce],[],
    'Special Psychic Energy'),null);
});

const PlayerType={BOTTOM_PLAYER:'bottom'};
const SlotType={BENCH:'bench'};

class AfterAttackEffect {
  /** @param {object} player @param {object} attack */
  constructor(player,attack){this.player=player;this.attack=attack;}
}
class AttachEnergyPrompt {
  /** @param {object} owner */
  constructor(owner){
    this.playerId=owner.id;
    this.playerType=PlayerType.BOTTOM_PLAYER;
    this.slots=[SlotType.BENCH];
    this.cardList=owner.active;
    this.id=123;
    this.result=undefined;
  }
  /** @param {object[]} result @returns {boolean} */
  validate(result){
    return Array.isArray(result)&&result.length===1&&
      this.cardList.energies.cards.includes(result[0].card)&&
      result[0].to.slot===SlotType.BENCH&&result[0].to.index===0;
  }
}
class AddPlayerAction {}
class ResolvePromptAction{
  /** @param {number} id @param {object[]} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class MockIronThornsex{
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  /** @param {object} store @param {object} state @param {object} effect */
  reduceEffect(store,state,effect){
    state.prompts.push(new AttachEnergyPrompt(effect.player));
  }
}
class MockResolver{
  /** @param {object} state @param {object} prompt */
  getPromptResult(state,prompt){
    return [{card:prompt.cardList.energies.cards[0],
      to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}}];
  }
}
class MockStore {
  /** @param {object} state */
  constructor(state){this.state=state;}
  /** @param {object} action */
  dispatch(action){
    if(action instanceof AddPlayerAction)return;
    const pending=this.state.prompts.find(p=>p.id===action.id);
    assert.equal(pending.validate(action.result),true);
    const seat=this.state.players.findIndex(p=>p.id===pending.playerId);
    const player=this.state.players[seat];
    const transfer=action.result[0].card;
    const active=player.active.energies.cards;
    active.splice(active.indexOf(transfer),1);
    player.bench[0].energies.cards.push(transfer);
    pending.result=action.result;
  }
}

/** @returns {object} */
function board(){
  const energy=[speed,spiky,dce].map(name=>({name,fullName:name}));
  const pokemon={fullName:'Iron Thorns ex TWM'};
  const active={cards:[pokemon,...energy],energies:{cards:energy},
    getPokemonCard:()=>pokemon};
  const bench=[{cards:[{}],energies:{cards:[]}}];
  const owner={id:999,active,bench,stadium:{cards:[]}};
  return {owner,state:{activePlayer:0,turn:17,players:[owner,
    {stadium:{cards:[]}}],prompts:[]}};
}

test('reversible owner-only hook selects physical Spiky in a marked source reducer prompt',()=>{
  const {owner,state}=board();
  const store=new MockStore(state);
  const card=new MockIronThornsex();
  const originalResolver=MockResolver.prototype.getPromptResult;
  const originalReduce=MockIronThornsex.prototype.reduceEffect;
  const originalDispatch=MockStore.prototype.dispatch;
  const witness=withPrintedVoltDonorPreference(()=>{
    const effect=new AfterAttackEffect(owner,card.attacks[0]);
    card.reduceEffect(store,state,effect);
    const prompt=state.prompts[0];
    const submitted=new MockResolver().getPromptResult(state,prompt);
    store.dispatch(new ResolvePromptAction(prompt.id,submitted));
    return submitted[0].card.name;
  },{seat:0},{Store:MockStore,IronThornsex:MockIronThornsex,
    AttachEnergyPromptResolver:MockResolver,PlayerType,SlotType});
  assert.equal(witness.result,spiky);
  assert.deepEqual(owner.active.energies.cards.map(c=>c.name),[speed,dce]);
  assert.equal(witness.audit.markedSourcePrompts,1);
  assert.equal(witness.audit.nativeValidAlternativesSelected,1);
  assert.equal(witness.audit.nativeAcceptedSelectedMoves,1);
  assert.equal(witness.audit.acceptedPhysicalTransferReceipts[0].receivedOnBench,true);
  assert.strictEqual(MockResolver.prototype.getPromptResult,originalResolver);
  assert.strictEqual(MockIronThornsex.prototype.reduceEffect,originalReduce);
  assert.strictEqual(MockStore.prototype.dispatch,originalDispatch);
});

test('unmarked prompt is left entirely to original resolver',()=>{
  const {owner,state}=board();
  const card=new MockIronThornsex();
  const witness=withPrintedVoltDonorPreference(()=>{
    const prompt=new AttachEnergyPrompt(owner);
    state.prompts.push(prompt);
    return new MockResolver().getPromptResult(state,prompt)[0].card.name;
  },{seat:0},{Store:MockStore,IronThornsex:MockIronThornsex,
    AttachEnergyPromptResolver:MockResolver,PlayerType,SlotType});
  assert.equal(witness.result,speed);
  assert.equal(witness.audit.markedSourcePrompts,0);
  assert.equal(witness.audit.nativeValidAlternativesSelected,0);
});

test('each native Store in a multi-game replay has its own accepted donor receipt',()=>{
  const witness=withPrintedVoltDonorPreference(()=>{
    for(let i=0;i<2;i++){
      const {owner,state}=board();
      const store=new MockStore(state);
      store.dispatch(new AddPlayerAction());
      const card=new MockIronThornsex();
      card.reduceEffect(store,state,new AfterAttackEffect(owner,card.attacks[0]));
      const prompt=state.prompts[0];
      const chosen=new MockResolver().getPromptResult(state,prompt);
      store.dispatch(new ResolvePromptAction(prompt.id,chosen));
    }
  },{seat:0},{Store:MockStore,IronThornsex:MockIronThornsex,
    AttachEnergyPromptResolver:MockResolver,PlayerType,SlotType});
  assert.equal(witness.audit.nativeAcceptedSelectedMoves,2);
  assert.equal(witness.audit.liveStoreDetected,true);
  assert.deepEqual(witness.audit.acceptedPhysicalTransferReceipts.map(x=>
    x.genuineLiveStore),[true,true]);
  assert.deepEqual(witness.audit.acceptedPhysicalTransferReceipts.map(x=>
    x.printedCostStillPayable),[true,true]);
});
