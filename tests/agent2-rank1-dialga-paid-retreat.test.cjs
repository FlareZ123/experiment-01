'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank1DialgaPaidRetreatOnPass}=require(
  '../simulation/twinleaf/agent2-rank1-dialga-paid-retreat.cjs');

/** @returns {object} Fresh genuine-identity physical fixture for the owner. */
function gameFixture({mode='physical',ownerSeat=1,fee=3,status=[],
  energyCount=3}={}){
  const energy=Array.from({length:energyCount},(_,i)=>({
    fullName:'Psychic Energy MEG',identity:'payment-'+i
  }));
  const targetEnergy=[{fullName:'Psychic Energy MEG',identity:'target-0'},
    {fullName:'Psychic Energy MEG',identity:'target-1'}];
  const dialga={
    getPokemonCard:()=>({fullName:'Dialga-GX UPR'}),
    energies:{cards:[...energy]},specialConditions:[...status]
  };
  const shadow={
    getPokemonCard:()=>({fullName:'Shadow Rider Calyrex V CRE'}),
    energies:{cards:[...targetEnergy]},specialConditions:[]
  };
  const owner={id:'owner',active:dialga,bench:[shadow],
    discard:{cards:[]},retreatedTurn:0,cannotRetreat:false};
  const adversary={id:'opponent',active:{
    getPokemonCard:()=>({fullName:'Bunnelby PRC'})},bench:[]};
  const players=ownerSeat===1?[adversary,owner]:[owner,adversary];
  class PassTurnAction{
    constructor(clientId){this.clientId=clientId;}
  }
  class RetreatAction{
    constructor(clientId,benchIndex){
      this.clientId=clientId;this.benchIndex=benchIndex;
    }
  }
  class CheckRetreatCostEffect{
    constructor(){this.cost=[9,9,9].slice(0,fee);}
  }
  class Store{
    constructor(){
      this.state={players,activePlayer:ownerSeat,turn:33,prompts:[]};
      this.received=[];
    }
    reduceEffect(){return undefined;}
    dispatch(action){
      this.received.push(action.constructor.name);
      if(action.constructor.name==='RetreatAction'&&mode==='physical'){
        owner.discard.cards.push(...dialga.energies.cards.splice(0,3));
        owner.active=shadow;
        owner.bench[action.benchIndex]=dialga;
        owner.retreatedTurn=this.state.turn;
      }
      return undefined;
    }
  }
  const deps={store:{Store},actions:{RetreatAction},
    checks:{CheckRetreatCostEffect}};
  const store=new Store();
  return {store,owner,dialga,shadow,energy,targetEnergy,
    deps,pass:new PassTurnAction(owner.id)};
}

/** @param {object} fx @param {boolean} treatment */
function execute(fx,treatment){
  return withRank1DialgaPaidRetreatOnPass(
    ()=>fx.store.dispatch(fx.pass),
    {treatment,ownerSeat:fx.store.state.activePlayer,
      targetTurn:33,deps:fx.deps}
  );
}

test('both seats: real physical three-Psychic payment and promotion',()=>{
  for(const ownerSeat of [0,1]){
    const fx=gameFixture({ownerSeat});
    const {audit}=execute(fx,true);
    assert.deepEqual(fx.store.received,['RetreatAction']);
    assert.equal(audit.genuineOwnerPasses,1);
    assert.equal(audit.paperConditionalOffers,1);
    assert.equal(audit.retreatSubmitted,1);
    assert.equal(audit.exactThreeCardPaidRetreats,1);
    assert.equal(audit.noOpSettlementCount,0);
    assert.equal(audit.pendingAtEnd,0);
    assert.equal(audit.physicalSettlements[0].status,
      'THREE_PHYSICAL_PSYCHIC_ENERGIES_PAID');
    assert.strictEqual(fx.owner.active,fx.shadow);
    assert.deepEqual(fx.owner.discard.cards,fx.energy);
    assert.deepEqual(fx.owner.active.energies.cards,fx.targetEnergy);
  }
});

test('both seats: a nonthrowing unchanged Store rejects proof',()=>{
  for(const ownerSeat of [0,1]){
    const fx=gameFixture({ownerSeat,mode:'nonthrowing-no-op'});
    const {audit}=execute(fx,true);
    assert.deepEqual(fx.store.received,['RetreatAction']);
    assert.equal(audit.retreatSubmitted,1);
    assert.equal(audit.exactThreeCardPaidRetreats,0);
    assert.equal(audit.noOpSettlementCount,1);
    assert.equal(audit.physicalSettlements[0].status,
      'PHYSICAL_SETTLEMENT_UNVERIFIED');
  }
});

test('control retains genuine Pass and root ledger unchanged',()=>{
  const fx=gameFixture();
  const {audit}=execute(fx,false);
  assert.deepEqual(fx.store.received,['PassTurnAction']);
  assert.equal(audit.paperConditionalOffers,1);
  assert.equal(audit.replacedPasses,0);
  assert.equal(audit.exactThreeCardPaidRetreats,0);
});

test('insufficient native fee, insufficient physical cards, and status block',()=>{
  for(const options of [{fee:4},{energyCount:2},{status:['ASLEEP']}]){
    const fx=gameFixture(options);
    const {audit}=execute(fx,true);
    assert.deepEqual(fx.store.received,['PassTurnAction']);
    assert.equal(audit.retreatSubmitted,0);
    assert.equal(audit.exactThreeCardPaidRetreats,0);
  }
});
