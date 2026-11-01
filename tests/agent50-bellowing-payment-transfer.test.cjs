'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {decodePayment}=require('../simulation/twinleaf/agent50-bellowing-payment-transfer.cjs');
const types={EnergyType:{BASIC:1},PlayerType:{BOTTOM_PLAYER:2},SlotType:{ACTIVE:3,BENCH:4}};
class DiscardEnergyPrompt{
 constructor(id){this.playerId=id;}
 decode(indices,state){return indices.map(x=>({from:x.from,card:state.players.find(p=>p.id===this.playerId).active.cards[x.index]}));}
 validate(x){return x.length===1&&x[0].card.energyType===1;}
}
test('physical Basic selection uses aggregate identity and original index',()=>{
 const light={fullName:'Lightning Energy MEE',energyType:1};
 const owner={id:7,active:{cards:[{name:'Raging Bolt ex'},light],energies:{cards:[light]}},bench:[]};
 const p=new DiscardEnergyPrompt(7);
 const selected=decodePayment({players:[owner]},p,owner,[{slot:'active',index:0,energyIndex:0,printing:light.fullName}],types);
 assert.equal(selected[0].card,light);
 assert.deepEqual(selected[0].from,{player:2,slot:3,index:0});
});
