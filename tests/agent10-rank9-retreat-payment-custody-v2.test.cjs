'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank9RetreatPaymentCustody}=
  require('../simulation/twinleaf/agent10-rank9-retreat-payment-custody-v2.cjs');
function prepare({promptFee=false, pay=true, turn=32, sourceSeat=1}={}){
  const prism={fullName:'Prism Energy ASC'};
  const darkness={fullName:'Darkness Energy MEE'};
  const electrode={getPokemonCard:()=>({fullName:'Electrode-GX CES'}),
    energies:{cards:promptFee?[prism,darkness]:[prism]}};
  const absol={getPokemonCard:()=>({fullName:'Mega Absol ex M1L'}),
    energies:{cards:[]}};
  const originalDiscard={fullName:'Earlier card'};
  const player={id:'source',active:electrode,bench:[absol],
    discard:{cards:[originalDiscard]}};
  const state={turn,activePlayer:sourceSeat,players:[{},player],prompts:[]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action.constructor.name==='RetreatAction'){
        player.active=absol;player.bench=[electrode];
        if(promptFee)state.prompts=[{
          constructor:{name:'ChooseEnergyPrompt'},playerId:player.id,
          result:undefined
        }];
        else if(pay){
          electrode.energies.cards.splice(0,1);
          player.discard.cards.push(prism);
        }
      }
      if(action.constructor.name==='ResolvePromptAction'){
        if(pay){
          electrode.energies.cards.splice(0,1);
          player.discard.cards.push(prism);
        }
        state.prompts[0].result=true;
      }
      return 'ok';
    }
  }
  class RetreatAction{constructor(){this.benchIndex=0;}}
  class ResolvePromptAction{}
  return {Store,player,electrode,prism,darkness,
    execute:()=>{const s=new Store();s.dispatch(new RetreatAction());
      if(promptFee)s.dispatch(new ResolvePromptAction());return 9;}};
}
test('single attached Prism is the identical auto-paid discard card',()=>{
  const f=prepare();
  const before=f.Store.prototype.dispatch;
  const r=withRank9RetreatPaymentCustody(f.execute,{Store:f.Store});
  assert.equal(r.result,9);
  assert.equal(r.audit.exactPhysicalPaymentCount,1);
  assert.equal(r.audit.receipts[0].route,'automatic');
  assert.deepEqual(r.audit.receipts[0].retained,[]);
  assert.strictEqual(f.player.discard.cards[1],f.prism);
  assert.strictEqual(f.Store.prototype.dispatch,before);
});
test('two attached Energy use selected Prism prompt and retain Darkness',()=>{
  const f=prepare({promptFee:true,turn:42});
  const r=withRank9RetreatPaymentCustody(f.execute,{Store:f.Store});
  assert.equal(r.audit.exactPhysicalPaymentCount,1);
  assert.equal(r.audit.receipts[0].route,'selected-prompt');
  assert.deepEqual(r.audit.receipts[0].retained,['Darkness Energy MEE']);
  assert.strictEqual(f.electrode.energies.cards[0],f.darkness);
});
test('no physical payment fails the receipt',()=>{
  const f=prepare({pay:false});
  const r=withRank9RetreatPaymentCustody(f.execute,{Store:f.Store});
  assert.equal(r.audit.exactPhysicalPaymentCount,0);
  assert.equal(r.audit.receipts[0].identityReceipt,false);
});
test('cannot scope a source turn to the opponent',()=>{
  const f=prepare({sourceSeat:0});
  const r=withRank9RetreatPaymentCustody(f.execute,{Store:f.Store});
  assert.equal(r.audit.receipts.length,0);
});
test('restores Store after error',()=>{
  const f=prepare();
  const before=f.Store.prototype.dispatch;
  assert.throws(()=>withRank9RetreatPaymentCustody(()=>{
    throw Error('abort');},{Store:f.Store}),/abort/);
  assert.strictEqual(f.Store.prototype.dispatch,before);
});
