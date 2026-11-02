'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectFutureApexDiscard}=require(
 '../simulation/twinleaf/agent47-preapex-payload-opportunity.cjs');

function fixture(extra={}){
 const actor={
  decisionKind:'owner-prompt',globalTurn:4,
  ownHand:['Ultra Ball BRS','Dragapult ex TWM','Fire Energy MEE','Grass Energy MEE'],
  ownPublic:{
   active:{printing:'Regidrago V SIT',energies:[],attacks:[]},
   bench:[],
   discard:[],stadium:[],publicTurnRestrictions:{}
  },
  opponentPublic:{stadium:[]}
 };
 const prompt={requiredCount:2,menu:[
  ['Fire Energy MEE','Grass Energy MEE'],
  ['Dragapult ex TWM','Fire Energy MEE']
 ]};
 return {actor:{...actor,...extra.actor,ownPublic:{
  ...actor.ownPublic,...extra.ownPublic
 }},prompt:extra.prompt??prompt};
}
test('owner-visible unevolved V can see a pre-Apex payload menu without altering choice',()=>{
 const x=inspectFutureApexDiscard(fixture());
 assert.equal(x.opportunity,true);assert.equal(x.directlyReady,false);
 assert.equal(x.regidragoOnBoard,true);
 assert.equal(x.soleCopyAlternative,true);
 assert.equal(x.reason,'preapex-alternative-payload');
});
test('no own Regidrago in play excludes a tempting Dragon discard',()=>{
 const x=inspectFutureApexDiscard(fixture({
  ownPublic:{active:{printing:'Budew PRE'},bench:[]}
 }));
 assert.equal(x.opportunity,false);
 assert.equal(x.reason,'no-own-regidrago-on-board');
});
test('alternate payload already chosen by conservative baseline is not counted as change',()=>{
 const x=fixture({
  prompt:{requiredCount:1,menu:[['Dragapult ex TWM']]}
 });
 const r=inspectFutureApexDiscard(x);
 assert.equal(r.baselineAlreadyDiscards,true);
 assert.equal(r.opportunity,false);
});
test('first copy already in public discard is reported but still could have a distinct payload',()=>{
 const x=inspectFutureApexDiscard(fixture({
  ownPublic:{discard:['Kyurem SFA']}
 }));
 assert.equal(x.priorPayloadInPublicDiscard,true);
 assert.equal(x.opportunity,true);
});
test('no legal candidate Dragon multiset means no pre-Apex option',()=>{
 const x=inspectFutureApexDiscard(fixture({
  prompt:{requiredCount:2,menu:[['Fire Energy MEE','Grass Energy MEE']]}
 }));
 assert.equal(x.opportunity,false);
 assert.equal(x.reason,'no-valid-payload-discard-menu');
});
test('an already payable live VSTAR is not a pre-Apex opportunity',()=>{
 const x=inspectFutureApexDiscard(fixture({
  ownPublic:{active:{
   printing:'Regidrago VSTAR SIT',
   attacks:[{name:'Apex Dragon'}],
   energies:['Double Dragon Energy ROS','Double Dragon Energy ROS'],
   publicRestrictions:{},specialConditions:[]
  }}
 }));
 assert.equal(x.directlyReady,true);
 assert.equal(x.opportunity,false);
 assert.equal(x.reason,'apex-already-directly-ready');
});

test('all three Dragon payloads omitted by rank20-only v1 are recognized before Apex',()=>{
 for(const printing of [
   'Hisuian Goodra VSTAR LOR','Koraidon ex TEF','Salamence ex JTG'
 ]){
  const f=fixture();
  f.actor.ownHand[1]=printing;
  f.prompt.menu[1][0]=printing;
  const r=inspectFutureApexDiscard(f);
  assert.equal(r.opportunity,true,printing);
  assert.equal(r.alternativeMenus,1,printing);
  assert.equal(r.soleCopyAlternative,true,printing);
 }
});
test('a non-Dragon Pokemon cannot masquerade as a Regidrago payload',()=>{
 const f=fixture();
 f.actor.ownHand[1]="Lillie's Clefairy ex JTG";
 f.prompt.menu[1][0]="Lillie's Clefairy ex JTG";
 const r=inspectFutureApexDiscard(f);
 assert.equal(r.opportunity,false);
 assert.equal(r.reason,'no-valid-payload-discard-menu');
});
test('recognized non-engine Dragon set exactly covers all nine authenticated source 60s',()=>{
 const path=require('node:path');
 const manifest=require('../results/aichi-2026/full-decklists.json');
 const {DRAGONS}=require(
  '../simulation/twinleaf/agent47-preapex-payload-opportunity.cjs');
 const {loadPrintedPokemon}=require(
  '../scripts/aichi-regidrago-attack-payload-panel.cjs');
 const catalog=loadPrintedPokemon(manifest,path.join(__dirname,'../resources'));
 const observed=new Set(),ranksWithV1Misses=new Set();
 const omittedByV1=new Set([
  'Hisuian Goodra VSTAR LOR','Koraidon ex TEF','Salamence ex JTG'
 ]);
 const decks=manifest.decks.filter(d=>d.archetype==='Regidrago');
 assert.equal(decks.length,9);
 for(const deck of decks){
  for(const c of deck.cards.filter(c=>c.category==='Pokémon')){
   const key=JSON.stringify([c.name,c.printing.set,String(c.printing.number)]);
   const printed=catalog.get(key);
   assert.ok(printed,key);
   if(!printed.types.includes('Dragon')||
      ['Regidrago V','Regidrago VSTAR'].includes(c.name))continue;
   assert.ok(printed.attacks.length>0,key);
   const fullName=c.name+' '+c.printing.set;
   observed.add(fullName);
   assert.ok(DRAGONS.has(fullName),fullName);
   if(omittedByV1.has(fullName))ranksWithV1Misses.add(deck.rank);
  }
 }
 assert.equal(observed.size,8);
 assert.deepEqual([...DRAGONS].filter(x=>x!=='Regidrago V SIT').sort(),
  [...observed].sort());
 assert.deepEqual([...ranksWithV1Misses].sort((a,b)=>a-b),
  [10,12,13,14,18,21,27,32]);
});

test('the shared source donor roster is defensively copied for observers',()=>{
 const {DRAGONS}=require(
  '../simulation/twinleaf/agent47-preapex-payload-opportunity.cjs');
 const {verifiedApexPayloadPrintings}=require(
  '../simulation/twinleaf/agent47-actor-hand-discard.cjs');
 const a=verifiedApexPayloadPrintings();
 assert.deepEqual([...a].sort(),[...DRAGONS].sort());
 a.add('Not a real Dragon');
 assert.equal(verifiedApexPayloadPrintings().has('Not a real Dragon'),false);
 assert.equal(DRAGONS.has('Not a real Dragon'),false);
});
