'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerSelectedDialgaPaidRetreat}=require(
  '../simulation/twinleaf/agent2-rank1-dialga-owner-decoder-retreat-v2.cjs');

/** @returns {object} Fresh source-visible/native-typed mock Store. */
function fixture({seat=1,paymentCount=3,mode='accept',
  sourcePrinting='Bunnelby PRC',statuses=[],otherActive=false}={}){
  const cost=Array.from({length:paymentCount},(_,i)=>({
    fullName:'Psychic Energy MEE',id:'cost-'+i
  }));
  const funded=[{fullName:'Psychic Energy MEE',id:'bench-1'},
    {fullName:'Psychic Energy MEE',id:'bench-2'}];
  const dialga={getPokemonCard:()=>({fullName:'Dialga-GX UPR'}),
    energies:{cards:[...cost]},specialConditions:[...statuses]};
  const shadow={getPokemonCard:()=>({
    fullName:'Shadow Rider Calyrex V CRE'}),
    energies:{cards:[...funded]}};
  const owner={id:'owner',active:dialga,bench:[shadow],
    discard:{cards:[]},retreatedTurn:0,cannotRetreat:false};
  const opponent={id:'foe',
    active:{getPokemonCard:()=>({fullName:sourcePrinting})}};
  const players=seat===0?[owner,opponent]:[opponent,owner];
  class PassTurnAction{constructor(id){this.clientId=id;}}
  class RetreatAction{
    constructor(id,benchIndex){
      this.clientId=id;this.benchIndex=benchIndex;
    }
  }
  class SimpleTacticsAi{
    decodeNextAction(state){
      const acting=state.players[state.activePlayer];
      return new PassTurnAction(acting.id);
    }
  }
  class Store{
    constructor(){
      this.state={players,turn:33,
        activePlayer:otherActive?1-seat:seat,prompts:[]};
      this.received=[];
    }
    dispatch(action){
      this.received.push(action.constructor.name);
      if(action.constructor.name==='RetreatAction'&&mode==='accept'){
        owner.discard.cards.push(...dialga.energies.cards.splice(0,3));
        owner.active=shadow;owner.bench[0]=dialga;owner.retreatedTurn=33;
      }
      return undefined;
    }
  }
  const store=new Store(),ai=new SimpleTacticsAi();
  return {store,ai,owner,cost,funded,dialga,shadow,
    deps:{ai:{SimpleTacticsAi},store:{Store},actions:{RetreatAction}}};
}

/** @param {object} fx @param {boolean} treatment */
function run(fx,treatment){
  return withOwnerSelectedDialgaPaidRetreat(()=>{
    const action=fx.ai.decodeNextAction(fx.store.state);
    fx.store.dispatch(action);
  },{treatment,ownerSeat:fx.store.state.activePlayer,
    targetTurn:33,deps:fx.deps});
}

test('both seats: selected typed RetreatAction causes three-card settlement',()=>{
  for(const seat of [0,1]){
    const fx=fixture({seat});
    const {audit}=run(fx,true);
    assert.deepEqual(fx.store.received,['RetreatAction']);
    assert.equal(audit.typedRetreatChoices,1);
    assert.equal(audit.storeRetreatDispatches,1);
    assert.equal(audit.verifiedPayments,1);
    assert.equal(audit.unverifiedReturns,0);
    assert.equal(audit.pendingAtEnd,0);
    assert.deepEqual(fx.owner.discard.cards,fx.cost);
    assert.deepEqual(fx.owner.active.energies.cards,fx.funded);
    assert.strictEqual(fx.owner.active,fx.shadow);
  }
});

test('no-op accepted return never certifies physical settlement',()=>{
  for(const seat of [0,1]){
    const fx=fixture({seat,mode:'silent-no-op'});
    const {audit}=run(fx,true);
    assert.deepEqual(fx.store.received,['RetreatAction']);
    assert.equal(audit.typedRetreatChoices,1);
    assert.equal(audit.verifiedPayments,0);
    assert.equal(audit.unverifiedReturns,1);
    assert.equal(audit.receipts[0].valid,false);
  }
});

test('unchanged control emits actual owner Pass',()=>{
  const fx=fixture();
  const {audit}=run(fx,false);
  assert.deepEqual(fx.store.received,['PassTurnAction']);
  assert.equal(audit.eligiblePasses,1);
  assert.equal(audit.typedRetreatChoices,0);
  assert.equal(audit.verifiedPayments,0);
});

test('non-owner or insufficient physical payment is not selected',()=>{
  for(const config of [{paymentCount:2},{sourcePrinting:'Snorlax PGO'},
    {statuses:['ASLEEP']},{otherActive:true}]){
    const fx=fixture(config);
    const {audit}=run(fx,true);
    assert.deepEqual(fx.store.received,['PassTurnAction']);
    assert.equal(audit.typedRetreatChoices,0);
    assert.equal(audit.verifiedPayments,0);
  }
});
