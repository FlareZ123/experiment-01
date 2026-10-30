'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent47-apex-ultraball-original-store.cjs');
const {assertSource60Conserved}=
  require('./agent47-apex-ultraball-followthrough-original-store.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(output,p));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

const DD='Double Dragon Energy ROS';
const G='Grass Energy MEE';

/** Staged same-printed-60 owner, one paid native Celestial Roar. */
function runOne(seat,scenario,paperCorrected=false){
 const x=stage(seat);
 const active=x.owner.active;
 const keepPoke=active.cards.find(c=>c.fullName==='Regidrago V SIT');
 const keepDde=active.cards.find(c=>c.fullName===DD);
 assert.ok(keepPoke&&keepDde);
 const removed=active.cards.filter(c=>c!==keepPoke&&c!==keepDde);
 assert.equal(removed.length,2);
 active.cards=[keepPoke,keepDde];
 active.energies.cards=[keepDde];
 const spareDde=removed.find(card=>card.fullName===DD);
 const removedVstar=removed.find(card=>card.fullName==='Regidrago VSTAR SIT');
 assert.ok(spareDde&&removedVstar);
 x.owner.discard.cards.push(removedVstar);
 x.owner.deck.cards.push(spareDde);
 // stage() places the other two Double Dragons and remaining Basics into
 // deterministic Prize cards. Move one held Basic to the artificial top three
 // instead, preserving all source physical cards.
 if(scenario==='special-and-basic'){
  const i=x.owner.hand.cards.findIndex(card=>card.fullName===G);
  assert.ok(i>=0);
  x.owner.deck.cards.push(x.owner.hand.cards.splice(i,1)[0]);
 }
 const choose=(name)=>{
  const i=x.owner.deck.cards.findIndex(c=>c.fullName===name);
  assert.ok(i>=0,'Original source printing unavailable: '+name);
  return x.owner.deck.cards.splice(i,1)[0];
 };
 const fixedSample=scenario==='special-only'?
  [choose(DD),choose('Quick Ball FST'),choose('Mysterious Treasure FLI')]:
  [choose(DD),choose(G),choose('Quick Ball FST')];
 x.owner.discard.cards.push(...x.owner.deck.cards);
 x.owner.deck.cards=fixedSample;
 assertSource60Conserved(x.owner);
 const beforeDde=x.owner.discard.cards.filter(c=>c.fullName===DD).length;
 const {AttackAction}=load('game/store/actions/game-actions');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const performAttack=()=>x.store.dispatch(
  new AttackAction(x.owner.id,'Celestial Roar'));
 const hook=paperCorrected?
  require('./agent47-celestial-roar-paper-energy-hook.cjs')
   .withPaperCelestialRoarEnergy(performAttack):null;
 if(!paperCorrected)performAttack();
 const pending=x.state.prompts.find(p=>p.result===undefined);
 let offered=null,settled=null;
 if(scenario==='special-and-basic'||paperCorrected){
  assert.equal(pending?.constructor?.name,'AttachEnergyPrompt');
  const eligible=pending.cardList.filter(pending.filter);
  const expected=paperCorrected?
    scenario==='special-and-basic'?[DD,G]:[DD]:
    [G];
  offered=eligible.map(c=>c.fullName);
  assert.deepEqual([...offered].sort(),[...expected].sort(),
    'Expected exact original physical Special/Basic eligibility');
  assert.equal(pending.options.min,expected.length);
  assert.equal(pending.options.max,expected.length);
  const target={player:2,slot:1,index:0};
  const assignment=eligible.map(card=>({card,to:target}));
  assert.equal(pending.validate(assignment,x.state),true);
  x.store.dispatch(new ResolvePromptAction(pending.id,assignment));
  settled=x.owner.active.energies.cards.map(c=>c.fullName);
  if(scenario==='special-and-basic')assert.ok(settled.includes(G));
 }else{
  assert.ok(pending===undefined||pending.constructor.name!=='AttachEnergyPrompt',
    'Pinned no-Basic branch must omit attachment prompt');
 }
 const afterDde=x.owner.discard.cards.filter(c=>c.fullName===DD).length;
 const stillAttached=x.owner.active.energies.cards.map(c=>c.fullName);
 assert.equal(afterDde,beforeDde+(paperCorrected?0:1),
   'Double Dragon should remain in discard only under pinned original reducer');
 assert.equal(stillAttached.filter(name=>name===DD).length,paperCorrected?2:1,
   'Corrected Energy effect must attach the original physical Special Energy');
 const physicalLive=[
  ...x.owner.active.cards,...x.owner.bench.flatMap(slot=>slot.cards),
  ...x.owner.hand.cards,...x.owner.deck.cards,...x.owner.discard.cards,
  ...x.owner.prizes.flatMap(slot=>slot.cards),...x.owner.lostzone.cards,
  ...x.owner.stadium.cards,...x.owner.supporter.cards
 ];
 const physicalSourceCardsInZones=physicalLive.length;
 assert.equal(new Set(physicalLive.map(c=>c.id)).size,physicalLive.length);
 // The original mixed-case reducer mutates temp.cards during forEach,
 // skipping one non-Energy after the Basic Energy is attached. This
 // intentionally records the 59-card state instead of hiding a true leak.
 const expectedLive= !paperCorrected&&scenario==='special-and-basic'?59:60;
 assert.equal(physicalSourceCardsInZones,expectedLive,
  'Unexpected physical-zone conservation during native Celestial Roar');
 return {seat,scenario,paperCorrected,hookAudit:hook?.audit??null,
  physicalSourceCardsInZones,physicalCardLeak:physicalSourceCardsInZones!==60,
  stagedOriginal60:true,fixedDeckTop3:fixedSample.map(c=>c.fullName),
  nativeAttack:'Celestial Roar',nativeTarget:'Active Regidrago V SIT',
  offeredNativeBasicOnly:offered,settledAttached:stillAttached,
  specialDiscarded:afterDde>beforeDde,
  nonBasicSpecialEligible:paperCorrected,
  printedText:'If any of those cards are Energy cards, attach them to this Pokémon.',
  paperEquivalence:paperCorrected?'settled-on-this-staged-sample':
   'discrepant-on-this-staged-source-legal-Double-Dragon-sample',
  qualifiedGame:false};
}
function main(){
 return {schema:'agent47-celestial-roar-double-dragon-original60-native-v1',
  enginePin:PIN,cases:[
   runOne(0,'special-only'),runOne(1,'special-only'),
   runOne(0,'special-and-basic'),runOne(1,'special-and-basic')],
  competitiveQualifiedGames:0,
  caveat:'Staged source 60 and synthetic top-three draw, no natural deal or opponent policy. Printed Energy includes eligible Special Double Dragon, while pinned reducer only transfers Basic. Mechanistic mismatch, not game performance.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={runOne,main};
