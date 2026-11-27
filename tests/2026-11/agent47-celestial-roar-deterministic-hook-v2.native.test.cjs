'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent47-apex-ultraball-original-store.cjs');
const {assertSource60Conserved}=
  require('../../simulation/twinleaf/agent47-apex-ultraball-followthrough-original-store.cjs');
const {withDeterministicCelestialRoar}=
  require('../../simulation/twinleaf/agent47-celestial-roar-deterministic-hook-v2.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {AttackAction}=require(path.join(output,'game/store/actions/game-actions'));
const DD='Double Dragon Energy ROS',G='Grass Energy MEE';
function run(seat,scenario){
 const x=stage(seat),active=x.owner.active;
 const keepV=active.cards.find(c=>c.fullName==='Regidrago V SIT');
 const keepD=active.cards.find(c=>c.fullName===DD);
 assert.ok(keepV&&keepD);
 const removed=active.cards.filter(c=>c!==keepV&&c!==keepD);
 const spareD=removed.find(c=>c.fullName===DD);
 const spareStar=removed.find(c=>c.fullName==='Regidrago VSTAR SIT');
 assert.ok(spareD&&spareStar);
 active.cards=[keepV,keepD];active.energies.cards=[keepD];
 x.owner.discard.cards.push(spareStar);
 x.owner.deck.cards.push(spareD);
 if(scenario!=='special-only'){
   const i=x.owner.hand.cards.findIndex(c=>c.fullName===G);
   assert.ok(i>=0);x.owner.deck.cards.push(x.owner.hand.cards.splice(i,1)[0]);
 }
 const take=name=>{
   const i=x.owner.deck.cards.findIndex(c=>c.fullName===name);
   assert.ok(i>=0,'missing source identity '+name);
   return x.owner.deck.cards.splice(i,1)[0];
 };
 const top=scenario==='special-only'?[take(DD),take('Quick Ball FST'),take('Mysterious Treasure FLI')]:
   scenario==='basic-and-two-trainers'?[take(G),take('Quick Ball FST'),take('Mysterious Treasure FLI')]:
   [take(DD),take(G),take('Quick Ball FST')];
 const expected=top.filter(c=>c.fullName===DD||c.fullName===G).map(c=>c.fullName);
 const nonenergy=top.filter(c=>c.fullName!==DD&&c.fullName!==G).map(c=>c.fullName);
 x.owner.discard.cards.push(...x.owner.deck.cards);x.owner.deck.cards=top;
 assertSource60Conserved(x.owner);
 const before=x.owner.active.energies.cards.map(c=>c.fullName),
   originalDiscard=x.owner.discard.cards.length;
 const out=withDeterministicCelestialRoar(()=>x.store.dispatch(
   new AttackAction(x.owner.id,'Celestial Roar')));
 assert.equal(out.audit.attacksIntercepted,1);
 assert.equal(out.audit.completeSettlements,1);
 assert.equal(out.audit.nativePromptsCreated,0);
 assert.equal(x.state.prompts.filter(p=>p.result===undefined&&p.constructor.name==='AttachEnergyPrompt').length,0);
 const after=x.owner.active.energies.cards.map(c=>c.fullName);
 assert.deepEqual(after.slice(before.length).sort(),expected.sort(),
   'Every top-three Energy should attach to Regidrago under actual native moves');
 const additions=x.owner.discard.cards.slice(originalDiscard).map(c=>c.fullName);
 assert.deepEqual(additions.sort(),nonenergy.sort(),'All non-Energy physical cards reach discard');
 assertSource60Conserved(x.owner);
 const sourcePhysical=[...x.owner.active.cards,...x.owner.bench.flatMap(p=>p.cards),
   ...x.owner.hand.cards,...x.owner.deck.cards,...x.owner.discard.cards,
   ...x.owner.prizes.flatMap(p=>p.cards),...x.owner.lostzone.cards,
   ...x.owner.stadium.cards,...x.owner.supporter.cards];
 assert.equal(sourcePhysical.length,60);
 assert.equal(new Set(sourcePhysical.map(c=>c.id)).size,60);
 return {seat,scenario,attached:after,discarded:nonenergy,
   originalCardsRetained:sourcePhysical.length,nativePromptsCreated:out.audit.nativePromptsCreated};
}
for(const seat of [0,1])for(const scenario of ['special-only','special-and-basic','basic-and-two-trainers']){
 test('native rank20 original60 seat'+seat+' '+scenario,()=>{
   const row=run(seat,scenario);
   assert.equal(row.originalCardsRetained,60);
 });
}
