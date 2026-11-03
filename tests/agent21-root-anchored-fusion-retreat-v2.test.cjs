'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withRootAnchoredFusionMewRetreat}=
  require('../simulation/twinleaf/agent21-root-anchored-fusion-retreat-v2.cjs');

const DCE='Double Colorless Energy SUM';
class AddPlayerAction {constructor(playerId){this.playerId=playerId;}}
class PassTurnAction {constructor(playerId){this.playerId=playerId;}}
class RetreatAction {
  constructor(playerId,benchIndex){
    this.playerId=playerId;this.benchIndex=benchIndex;
  }
}
class ResolvePromptAction {constructor(playerId){this.playerId=playerId;}}

function pokemon(name,withDce=false){
  const p={fullName:name};
  const e={fullName:DCE};
  return {cards:withDce?[p,e]:[p],energies:{cards:withDce?[e]:[]},
    getPokemonCard(){return p;}};
}

/** Simulates the structural Store contract, not paper card rules. */
class DemoStore {
  constructor(seat,mode='paid'){
    const owner={id:101,active:pokemon('Crobat V DAA',true),
      bench:[pokemon('Mew VMAX FST',true)],
      discard:{cards:[{fullName:DCE}]},retreatedTurn:0};
    const other={id:202,active:pokemon('Tapu Lele-GX GRI'),
      bench:[],discard:{cards:[]},retreatedTurn:0};
    this.state={phase:'PLAYER_TURN',turn:47,activePlayer:seat,
      prompts:[],players:seat===0?[owner,other]:[other,owner]};
    this.owner=owner;
    this.mode=mode;
    this.calls=[];
    this.originalFee=owner.active.energies.cards[0];
  }
  dispatch(action){
    const name=action.constructor.name;
    this.calls.push(name);
    if(name==='RetreatAction'){
      if(this.mode==='reject')throw Error('native rejects action');
      const former=this.owner.active;
      this.owner.active=this.owner.bench[action.benchIndex];
      this.owner.bench[action.benchIndex]=former;
      this.owner.retreatedTurn=this.state.turn;
      if(this.mode==='pending')this.state.prompts=[{result:undefined}];
      else if(this.mode==='paid')this.payFee();
    }
    if(name==='ResolvePromptAction'){
      this.state.prompts=[];
      this.payFee();
    }
    return 'native-returned';
  }
  payFee(){
    const former=this.owner.bench[0];
    const fee=this.originalFee;
    former.energies.cards=former.energies.cards.filter(c=>c!==fee);
    former.cards=former.cards.filter(c=>c!==fee);
    this.owner.discard.cards.push(fee);
  }
}

const deps={
  Store:DemoStore,
  actions:{PassTurnAction,RetreatAction},
  phase:{GamePhase:{PLAYER_TURN:'PLAYER_TURN'}},
  types:{CardType:{COLORLESS:9},SpecialCondition:{}},
  observe:()=>({decisionKind:'owner-root',ownPublic:{}}),
  choose:()=>({kind:'paid-retreat',benchIndex:0,
    printing:'Mew VMAX FST',paymentPrinting:DCE})
};

for(const seat of [0,1]){
  test('anchored paid root: exact DCE + promotion, seat '+seat,()=>{
    const s=new DemoStore(seat,'paid');
    const prior=DemoStore.prototype.dispatch;
    const {audit}=withRootAnchoredFusionMewRetreat(()=>{
      s.dispatch(new AddPlayerAction(101));
      s.dispatch(new PassTurnAction(101));
    },deps);
    assert.deepEqual(s.calls,['AddPlayerAction','RetreatAction']);
    assert.equal(audit.anchoredStores,1);
    assert.equal(audit.eligibleOffers,1);
    assert.equal(audit.exactPhysicalFeeAndPromotion,1);
    assert.equal(audit.unverifiedPhysicalFees,0);
    assert.strictEqual(s.owner.discard.cards.at(-1),s.originalFee);
    assert.equal(s.owner.bench[0].energies.cards.length,0);
    assert.strictEqual(DemoStore.prototype.dispatch,prior);
    assert.equal(audit.competitivelyQualifiedGames,0);
  });

  test('anchored unpaid root with stale discard DCE FAILS certification, seat '+seat,()=>{
    const s=new DemoStore(seat,'unpaid');
    const oldDiscard=[...s.owner.discard.cards];
    const {audit}=withRootAnchoredFusionMewRetreat(()=>{
      s.dispatch(new AddPlayerAction(101));
      s.dispatch(new PassTurnAction(101));
    },deps);
    assert.equal(audit.eligibleOffers,1);
    assert.equal(audit.nativeReplacementReturns,1);
    assert.equal(audit.exactPhysicalFeeAndPromotion,0);
    assert.equal(audit.unverifiedPhysicalFees,1);
    assert.deepEqual(s.owner.discard.cards,oldDiscard);
    assert.equal(s.owner.bench[0].energies.cards[0],s.originalFee);
    assert.equal(audit.records.at(-1).status,
      'PHYSICAL_FEE_OR_POSITION_UNVERIFIED');
  });
}

test('auxiliary same-class Store Pass is unchanged; live Store is corrected',()=>{
  const auxiliary=new DemoStore(0,'paid');
  const live=new DemoStore(0,'paid');
  const {audit}=withRootAnchoredFusionMewRetreat(()=>{
    auxiliary.dispatch(new PassTurnAction(101));
    live.dispatch(new AddPlayerAction(101));
    live.dispatch(new PassTurnAction(101));
  },deps);
  assert.deepEqual(auxiliary.calls,['PassTurnAction']);
  assert.deepEqual(live.calls,['AddPlayerAction','RetreatAction']);
  assert.equal(audit.auxiliaryPassesUnchanged,1);
  assert.equal(audit.exactPhysicalFeeAndPromotion,1);
  assert.equal(audit.verifiedSelectedRootLedgerJoin,false);
});

test('root with payment prompt only counts after physical settlement',()=>{
  const s=new DemoStore(0,'pending');
  const {audit}=withRootAnchoredFusionMewRetreat(()=>{
    s.dispatch(new AddPlayerAction(101));
    s.dispatch(new PassTurnAction(101));
    s.dispatch(new ResolvePromptAction(101));
  },deps);
  assert.deepEqual(s.calls,[
    'AddPlayerAction','RetreatAction','ResolvePromptAction']);
  assert.equal(audit.eligibleOffers,1);
  assert.equal(audit.pendingAtEnd,0);
  assert.equal(audit.exactPhysicalFeeAndPromotion,1);
});

test('native rejection propagates and prototype is restored',()=>{
  const s=new DemoStore(0,'reject');
  const prior=DemoStore.prototype.dispatch;
  assert.throws(()=>withRootAnchoredFusionMewRetreat(()=>{
    s.dispatch(new AddPlayerAction(101));
    s.dispatch(new PassTurnAction(101));
  },deps),/native rejects action/);
  assert.strictEqual(DemoStore.prototype.dispatch,prior);
});
