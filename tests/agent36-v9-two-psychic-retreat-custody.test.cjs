'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,capture,settle,withTwoPsychicAnyTargetCustody}=
  require('../simulation/twinleaf/agent36-v9-two-psychic-retreat-custody.cjs');

class RetreatAction{
  constructor(clientId,benchIndex){this.clientId=clientId;this.benchIndex=benchIndex;}
}
function pokemon(fullName,retreat=[9,9]){
  return {fullName,retreat};
}
function slot(card,energies){
  return {getPokemonCard:()=>card,energies:{cards:[...energies]},
    tools:{cards:[]},cards:[]};
}
function fixture(){
  const first={fullName:'Psychic Energy MEE'};
  const second={fullName:'Psychic Energy SVE'};
  const latias=pokemon('Latias ex SSP',[9,9]);
  const vmax=pokemon('Shadow Rider Calyrex VMAX CRE',[9,9]);
  const target=slot(latias,[{fullName:'Psychic Energy SVE'},
    {fullName:'Psychic Energy MEE'},{fullName:'Psychic Energy MEE'}]);
  const source=slot(vmax,[first,second]);
  const owner={id:'owner',active:source,bench:[target],
    discard:{cards:[]},retreatedTurn:0};
  const opponent={id:'opponent',active:slot(pokemon('Lunatone OBF'),[]),
    bench:[],discard:{cards:[]},retreatedTurn:0};
  const state={turn:22,activePlayer:0,players:[owner,opponent],prompts:[]};
  return {state,owner,source,target,first,second};
}
class FakeStore{
  constructor(state,mode='settle'){this.state=state;this.mode=mode;}
  dispatch(action){
    if(action instanceof RetreatAction){
      if(this.mode==='throw')throw Error('fixture rejection');
      if(this.mode==='pending'){
        this.state.prompts=[{result:undefined}];
        return true;
      }
      const owner=this.state.players[0];
      const source=owner.active,target=owner.bench[action.benchIndex];
      const payment=[...source.energies.cards];
      source.energies.cards=[];
      owner.discard.cards.push(...payment);
      owner.active=target;owner.bench[action.benchIndex]=source;
      owner.retreatedTurn=this.state.turn;
    }
    return true;
  }
}

test('captures exact two-Basic-Psychic payment and promotes a funded non-VMAX target',()=>{
  const f=fixture();
  const action=new RetreatAction('owner',0);
  const before=capture(f.state,action);
  assert.ok(before);
  const result=withTwoPsychicAnyTargetCustody(()=>{
    const store=new FakeStore(f.state);
    store.dispatch(action);
    return store.state.players[0].active.getPokemonCard().fullName;
  },{Store:FakeStore});
  assert.equal(result.result,'Latias ex SSP');
  assert.equal(result.audit.schema,VERSION);
  assert.equal(result.audit.attempts,1);
  assert.equal(result.audit.exactPhysicalPaidRetreats,1);
  assert.equal(result.audit.receipts[0].exactPhysicalPayment,true);
  assert.equal(result.audit.receipts[0].exactPhysicalPromotion,true);
  assert.equal(result.audit.receipts[0].targetEnergyObjectsPreserved,true);
  assert.equal(result.audit.receipts[0].retreatQuotaUsed,true);
  assert.deepEqual(result.audit.receipts[0].physicalPaymentPrintings,
    ['Psychic Energy MEE','Psychic Energy SVE']);
});

test('rejects an incorrect source, insufficient payment, or empty target',()=>{
  const a=fixture();
  a.state.players[0].active=slot(pokemon('Mewtwo & Mew-GX'),[
    {fullName:'Psychic Energy MEE'},{fullName:'Psychic Energy SVE'}]);
  assert.equal(capture(a.state,new RetreatAction('owner',0)),null);
  const b=fixture();
  b.state.players[0].active.energies.cards.pop();
  assert.equal(capture(b.state,new RetreatAction('owner',0)),null);
  const c=fixture();
  c.state.players[0].bench[0]=null;
  assert.equal(capture(c.state,new RetreatAction('owner',0)),null);
});

test('pending native prompt is not misreported as a settled payment',()=>{
  const f=fixture();
  const result=withTwoPsychicAnyTargetCustody(()=>{
    const store=new FakeStore(f.state,'pending');
    store.dispatch(new RetreatAction('owner',0));
    return store;
  },{Store:FakeStore});
  assert.equal(result.audit.attempts,1);
  assert.equal(result.audit.exactPhysicalPaidRetreats,0);
  assert.equal(result.audit.pendingAtEnd,1);
  assert.equal(result.audit.receipts.length,0);
});

test('Store rejection is preserved and the prototype wrapper is restored',()=>{
  const descriptor=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const f=fixture();
  assert.throws(()=>withTwoPsychicAnyTargetCustody(()=>{
    new FakeStore(f.state,'throw').dispatch(new RetreatAction('owner',0));
  },{Store:FakeStore}),/fixture rejection/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    descriptor);
});

test('wrong actor and pre-existing prompt do not create custody records',()=>{
  const a=fixture();
  assert.equal(capture(a.state,new RetreatAction('opponent',0)),null);
  const b=fixture();
  b.state.prompts=[{result:undefined}];
  assert.equal(capture(b.state,new RetreatAction('owner',0)),null);
});
