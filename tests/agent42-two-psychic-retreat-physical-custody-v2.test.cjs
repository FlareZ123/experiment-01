'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureTwoPsychicRetreat,withTwoPsychicRetreatCustody}=require('../simulation/twinleaf/agent42-two-psychic-retreat-physical-custody-v2.cjs');
class RetreatAction{constructor(clientId,benchIndex){Object.assign(this,{clientId,benchIndex});}}
const card=fullName=>({fullName});
const slot=(name,energies)=>({cards:[card(name)],energies:{cards:energies.map(card)},tools:{cards:[]},getPokemonCard(){return this.cards[0];}});
function setup(seat=1,pay=true){
 const old=slot('Shadow Rider Calyrex VMAX CRE',['Psychic Energy MEE','Psychic Energy MEE']);
 const next=slot('Latias ex SSP',['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE']);
 const player={id:27,active:old,bench:[next],discard:{cards:[]},retreatedTurn:0};
 const other={id:59,active:slot('Lunatone OBF',[]),bench:[]};
 const state={turn:22,activePlayer:seat,players:seat===1?[other,player]:[player,other],prompts:[]};
 class Store{constructor(){this.state=state;}dispatch(action){if(action instanceof RetreatAction){player.active=next;player.bench[0]=old;player.retreatedTurn=22;if(pay)player.discard.cards.push(...old.energies.cards.splice(0,2));}return 'accepted';}}
 return {Store,state,player,other};
}
for(const seat of [0,1])test('captures VMAX to Latias paid pivot on seat '+seat,()=>{
 const f=setup(seat),r=withTwoPsychicRetreatCustody(()=>new f.Store().dispatch(new RetreatAction(f.player.id,0)),{Store:f.Store});
 assert.equal(r.audit.exactPhysicalPaidRetreats,1);
 assert.equal(r.audit.receipts[0].targetPrinting,'Latias ex SSP');
 assert.equal(r.audit.receipts[0].targetEnergyCount,3);
 assert.equal(r.audit.receipts[0].physicalPaymentObjectCustodyConfirmed,true);
});
test('a pivot without the two physical cards is not certified',()=>{
 const f=setup(1,false),r=withTwoPsychicRetreatCustody(()=>new f.Store().dispatch(new RetreatAction(f.player.id,0)),{Store:f.Store});
 assert.equal(r.audit.exactPhysicalPaidRetreats,0);
});
test('unsupported fee and foreign actor fail before capture',()=>{
 const f=setup();f.player.active.energies.cards[0].fullName='Double Colorless Energy EVO';
 assert.equal(captureTwoPsychicRetreat(f.state,new RetreatAction(f.player.id,0)),null);
 const g=setup();assert.equal(captureTwoPsychicRetreat(g.state,new RetreatAction(g.other.id,0)),null);
});
