'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {withRank9RetreatPhysicalCustody} =
  require('../simulation/twinleaf/agent10-rank9-retreat-physical-custody.cjs');

function fixture({moveEnergy = true, opponentTurn = false} = {}) {
  const prism = {fullName:'Prism Energy ASC'};
  const dark = {fullName:'Darkness Energy SVE'};
  const electrode = {getPokemonCard:()=>({fullName:'Electrode-GX CES'}),
    energies:{cards:[prism,dark]}};
  const absol = {getPokemonCard:()=>({fullName:'Mega Absol ex M1L'}),
    energies:{cards:[]}};
  const owner = {id:'source',active:electrode,bench:[absol],
    discard:{cards:[{fullName:'Other original discard'}]}};
  const state = {turn:42,activePlayer:opponentTurn?0:1,
    players:[{id:'opponent'},owner],prompts:[]};
  class Store {
    constructor(){this.state=state;}
    dispatch(action){
      if(action.constructor.name==='RetreatAction'){
        owner.active=absol;owner.bench=[electrode];
        state.prompts=[{constructor:{name:'ChooseEnergyPrompt'},
          result:undefined,playerId:owner.id}];
      }
      if(action.constructor.name==='ResolvePromptAction'){
        if(moveEnergy){
          electrode.energies.cards.splice(0,1);
          owner.discard.cards.push(prism);
        }
        state.prompts[0].result=true;
      }
      return 'accepted';
    }
  }
  class RetreatAction {constructor(){this.benchIndex=0;}}
  class ResolvePromptAction {}
  return {Store,state,owner,electrode,prism,dark,
    run:()=>{const store=new Store();store.dispatch(new RetreatAction());
      store.dispatch(new ResolvePromptAction());return 7;}};
}

test('read-only native witness matches exact Prism object in discard',()=>{
  const f=fixture();
  const prior=Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch').value;
  const out=withRank9RetreatPhysicalCustody(f.run,{Store:f.Store});
  assert.equal(out.result,7);
  assert.equal(out.audit.exactPhysicalPaidRetreatReceipts,1);
  assert.equal(out.audit.receipts[0].samePhysicalCardObject,true);
  assert.deepEqual(out.audit.receipts[0].energyDiscarded,['Prism Energy ASC']);
  assert.equal(f.electrode.energies.cards[0],f.dark);
  assert.equal(f.owner.discard.cards.at(-1),f.prism);
  assert.strictEqual(f.Store.prototype.dispatch,prior);
});

test('missing discarded card is never certified',()=>{
  const f=fixture({moveEnergy:false});
  const out=withRank9RetreatPhysicalCustody(f.run,{Store:f.Store});
  assert.equal(out.audit.receipts.length,1);
  assert.equal(out.audit.exactPhysicalPaidRetreatReceipts,0);
});

test('opponent turn cannot produce source receipt',()=>{
  const f=fixture({opponentTurn:true});
  const out=withRank9RetreatPhysicalCustody(f.run,{Store:f.Store});
  assert.equal(out.audit.receipts.length,0);
});

test('restores native dispatch after caller error',()=>{
  const f=fixture();
  const original=f.Store.prototype.dispatch;
  assert.throws(()=>withRank9RetreatPhysicalCustody(()=>{
    throw Error('replay failed');},{Store:f.Store}),/replay failed/);
  assert.strictEqual(f.Store.prototype.dispatch,original);
});
