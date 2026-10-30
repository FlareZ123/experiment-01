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
const F='Fire Energy MEE';

/**
 * Use all sixty original rank20 physical cards without substituting printed
 * cards. Artificially arrange the three deck cards for deterministic native
 * effects. All other original deck cards move to own discard for fixture only.
 *
 * @param {0|1} seat
 * @param {'special-only'|'special-and-basic'} scenario
 */
function prepare(seat,scenario){
 const x=stage(seat);
 const active=x.owner.active;
 const regidrago=active.cards.find(c=>c.fullName==='Regidrago V SIT');
 const ddes=active.cards.filter(c=>c.fullName===DD);
 assert.ok(regidrago&&ddes.length===2);
 active.cards=[regidrago,ddes[0]];
 active.energies.cards=[ddes[0]];
 const extracted=active.cards.filter(c=>!c);
 assert.equal(extracted.length,0);
 // The staged original 60 included VSTAR and two attached Double Dragons.
 const vstar=x.owner.discard.cards.length===0?
   null:null;
 // Restore the removed VSTAR and spare attached DDE into a physical zone.
 const sourceDeck=x.owner.deck.cards;
 const firstVstar=sourceDeck.filter(c=>c.fullName==='Regidrago VSTAR SIT').length;
 assert.ok(firstVstar>=0);
 // stage() built Active as V + VSTAR + DDE + DDE. Move removed cards.
 const source60=stageSourceCardVault(x);
 assert.equal(source60.length,2);
 x.owner.discard.cards.push(...source60);
 // Take the original printed temporary-energy sample from the deck.
 const choose=(name)=>{
  const index=sourceDeck.findIndex(c=>c.fullName===name);
  assert.ok(index>=0,'No physical source card '+name);
  return sourceDeck.splice(index,1)[0];
 };
 const top= scenario==='special-only' ?
   [choose(DD),choose('Quick Ball FST'),choose('Mysterious Treasure FLI')] :
   [choose(DD),choose(G),choose('Quick Ball FST')];
 x.owner.discard.cards.push(...sourceDeck);
 x.owner.deck.cards=top;
 assertSource60Conserved(x.owner);
 return {...x,scenario,top:top.map(c=>c.fullName)};
}

/**
 * Stage() creates the physical Active VSTAR and second DDE; this builder
 * keeps references to removed cards before resetting the Active list.
 * @param {object} x
 */
function stageSourceCardVault(x){
 return x._removedFromActive;
}

function runOne(seat,scenario){
 const x=stage(seat);
 const active=x.owner.active;
 const keepPoke=active.cards.find(c=>c.fullName==='Regidrago V SIT');
 const keepDde=active.cards.find(c=>c.fullName===DD);
 assert.ok(keepPoke&&keepDde);
 const removed=active.cards.filter(c=>c!==keepPoke&&c!==keepDde);
 assert.equal(removed.length,2);
 active.cards=[keepPoke,keepDde];
 active.energies.cards=[keepDde];
 x.owner.discard.cards.push(...removed);
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
 x.store.dispatch(new AttackAction(x.owner.id,'Celestial Roar'));
 const pending=x.state.prompts.find(p=>p.result===undefined);
 let offered=null,settled=null;
 if(scenario==='special-and-basic'){
  assert.equal(pending?.constructor?.name,'AttachEnergyPrompt');
  assert.equal(pending.options.min,1);
  assert.equal(pending.options.max,1);
  const eligible=pending.cardList.filter(pending.filter);
  offered=eligible.map(c=>c.fullName);
  assert.deepEqual(offered,[G],'Pinned Celestial Roar must exhibit Basic-only filtering');
  const card=eligible[0],target={player:2,slot:1,index:0};
  const assignment=[{card,to:target}];
  assert.equal(pending.validate(assignment,x.state),true);
  x.store.dispatch(new ResolvePromptAction(pending.id,assignment));
  settled=x.owner.active.energies.cards.map(c=>c.fullName);
  assert.ok(settled.includes(G));
 }else{
  assert.ok(pending===undefined||pending.constructor.name!=='AttachEnergyPrompt',
    'Pinned no-Basic branch must omit attachment prompt');
 }
 const afterDde=x.owner.discard.cards.filter(c=>c.fullName===DD).length;
 const stillAttached=x.owner.active.energies.cards.map(c=>c.fullName);
 assert.equal(afterDde,beforeDde+1,
   'Original Double Dragon Special Energy is discarded instead of attached');
 assert.equal(stillAttached.filter(name=>name===DD).length,1,
   'Only the originally attached Double Dragon remains on attacker');
 assertSource60Conserved(x.owner);
 return {seat,scenario,stagedOriginal60:true,fixedDeckTop3:fixedSample.map(c=>c.fullName),
  nativeAttack:'Celestial Roar',nativeTarget:'Active Regidrago V SIT',
  offeredNativeBasicOnly:offered,settledAttached:stillAttached,
  specialDiscarded:afterDde>beforeDde,
  nonBasicSpecialEligible:false,
  printedText:'If any of those cards are Energy cards, attach them to this Pokémon.',
  paperEquivalence:'discrepant-on-this-staged-source-legal-Double-Dragon-sample',
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
