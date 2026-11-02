'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureCrobatRetreatFee,settleCrobatRetreatFee,
  withCrobatRetreatFeeCustody}=require(
    '../simulation/twinleaf/agent9-retreat-fee-custody.cjs');

class AddPlayerAction{}
class RetreatAction{
  /** @param {number} clientId @param {number} benchIndex */
  constructor(clientId,benchIndex){
    this.clientId=clientId;this.benchIndex=benchIndex;
  }
}

function slot(pokemon,energy=[]){
  return {cards:[pokemon,...energy],energies:{cards:[...energy]},
    getPokemonCard(){return pokemon;}};
}
function fixture(){
  const crobat={fullName:'Crobat V DAA'};
  const mew={fullName:'Mew VMAX FST'};
  const donor={fullName:'Genesect V FST'};
  const paid={fullName:'Double Colorless Energy SUM'};
  const retained={fullName:'Double Colorless Energy SUM'};
  const owner={id:71,active:slot(crobat,[paid]),
    bench:[slot(mew,[retained]),slot(donor)],
    discard:{cards:[]},retreatedTurn:0};
  const opponent={id:82,active:slot({fullName:'Mimikyu PAL'}),
    bench:[],discard:{cards:[]}};
  const state={players:[owner,opponent],turn:52,prompts:[]};
  return {state,owner,opponent,crobat,mew,paid,retained,
    action:new RetreatAction(owner.id,0)};
}
function nativeStore(initial,{pay=true,swap=true,pending=false}={}){
  class Store {
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return null;
      if(action instanceof RetreatAction){
        const owner=this.state.players[0];
        const from=owner.active,to=owner.bench[action.benchIndex];
        if(pay){
          from.cards=from.cards.filter(c=>c!==initial.paid);
          from.energies.cards=from.energies.cards.filter(c=>c!==initial.paid);
          owner.discard.cards.push(initial.paid);
        }
        if(swap){owner.active=to;owner.bench[action.benchIndex]=from;
          owner.retreatedTurn=this.state.turn;}
        if(pending)this.state.prompts.push({result:undefined});
      }
      return null;
    }
  }
  return Store;
}
test('native matching root captures the actual DCE card object',()=>{
  const x=fixture(),pre=captureCrobatRetreatFee(x.state,x.action);
  assert.equal(pre.paidCard,x.paid);
  assert.equal(pre.target,x.mew);
  assert.equal(captureCrobatRetreatFee(x.state,new AddPlayerAction()),null);
  const wrong=new RetreatAction(x.opponent.id,0);
  assert.equal(captureCrobatRetreatFee(x.state,wrong),null);
  x.owner.bench[0]=slot({fullName:'Mew V FST'},[x.retained]);
  assert.equal(captureCrobatRetreatFee(x.state,x.action),null);
});

test('exact physical DCE moves to owner discard and original Mew is promoted',()=>{
  const x=fixture(),Store=nativeStore(x),store=new Store(x.state);
  const receipt=withCrobatRetreatFeeCustody(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(x.action);
    return 'native-action-returned';
  },{Store});
  assert.equal(receipt.result,'native-action-returned');
  assert.equal(receipt.audit.readOnly,true);
  assert.equal(receipt.audit.gameCount,1);
  assert.equal(receipt.audit.attemptedPhysicalRoots,1);
  assert.equal(receipt.audit.settledExactPhysicalFees,1);
  assert.equal(receipt.audit.nativeDispatchRejects,0);
  assert.equal(receipt.audit.records[0].status,'EXACT_PHYSICAL_FEE_AND_PROMOTION');
  assert.equal(receipt.audit.records[0].physicalDceObjectInOwnDiscard,true);
  assert.equal(receipt.audit.records[0].originalMewCardObjectPromoted,true);
  assert.ok(x.owner.discard.cards.includes(x.paid));
  assert.ok(x.owner.active.cards.includes(x.retained));
  assert.equal(receipt.audit.qualifiedCompetitiveGames,0);
});

test('same-printing copy in discard cannot satisfy exact physical-card custody',()=>{
  const x=fixture(),otherDce={fullName:'Double Colorless Energy SUM'};
  x.owner.discard.cards.push(otherDce);
  const pre=captureCrobatRetreatFee(x.state,x.action);
  const Store=nativeStore(x,{pay:false}),store=new Store(x.state);
  const output=withCrobatRetreatFeeCustody(()=>store.dispatch(x.action),{Store});
  assert.equal(output.audit.settledExactPhysicalFees,0);
  assert.equal(output.audit.unverifiedOrPending,1);
  assert.equal(output.audit.records[0].physicalDceObjectInOwnDiscard,false);
  assert.equal(settleCrobatRetreatFee(pre,x.state).status,
    'PHYSICAL_FEE_OR_POSITION_UNVERIFIED');
});

test('no real promotion cannot qualify even if exact fee reached discard',()=>{
  const x=fixture(),Store=nativeStore(x,{swap:false}),store=new Store(x.state);
  const output=withCrobatRetreatFeeCustody(()=>store.dispatch(x.action),{Store});
  assert.equal(output.audit.settledExactPhysicalFees,0);
  assert.equal(output.audit.records[0].physicalDceObjectInOwnDiscard,true);
  assert.equal(output.audit.records[0].originalMewCardObjectPromoted,false);
});

test('an unresolved prompt cannot produce a paid retreat proof',()=>{
  const x=fixture(),Store=nativeStore(x,{pending:true}),store=new Store(x.state);
  const output=withCrobatRetreatFeeCustody(()=>store.dispatch(x.action),{Store});
  assert.equal(output.audit.attemptedPhysicalRoots,1);
  assert.equal(output.audit.settledExactPhysicalFees,0);
  assert.equal(output.audit.unsettledAtEnd,1);
  assert.equal(output.audit.qualifiedCompetitiveGames,0);
});

test('restores the native Store dispatch descriptor after test workload',()=>{
  const x=fixture(),Store=nativeStore(x);
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  withCrobatRetreatFeeCustody(()=>new Store(x.state).dispatch(x.action),{Store});
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),original);
});
