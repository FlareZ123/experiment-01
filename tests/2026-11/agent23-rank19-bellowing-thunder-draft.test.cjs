'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const m=require('../../simulation/evaluation/2026-11/agent23-rank19-bellowing-thunder-draft.cjs');
const L='Lightning Energy MEE',F='Fighting Energy MEE',D='Darkness Energy MEE',X='Double Dragon Energy ROS';
const mon=(printing,energies=[],hp=320,damage=0,tools=[])=>({printing,energies,hp,damage,tools});
const bolt=(e)=>mon('Raging Bolt ex TEF',e,240);
const mol=(e)=>mon('Galarian Moltres V CRE 97',e,220);
const target=(damage=0)=>mon('Shadow Rider Calyrex VMAX CRE 75',[],320,damage);
const ho=(e)=>mon('Ho-Oh-EX DRX 22',e,160);
const own=(active,bench=[])=>({active,bench,stadium:[]});
const request=(seat,o,t,items=[])=>({role:'opponent',seat,observation:{actorSeat:seat,ownPublic:o,opponentPublic:{active:t,stadium:[]}},actionFrontier:{items}});
const attack={kind:'attack',token:'attack',actorPrinting:'Raging Bolt ex TEF',attackName:'Bellowing Thunder',publicMetadata:{attackCostPayable:true}};
const metadata=e=>({ownerSeat:'actor',sourceZone:'play',isOwnerVisible:true,energyType:'BASIC',zone:e.slot.zone,...(e.slot.zone==='bench'?{benchIndex:e.slot.index}:{}),slotIndex:e.energyIndex});
const prompt=o=>({promptType:'DiscardEnergyPrompt',source:{sourceKind:'card-effect',effectName:'Bellowing Thunder',sourcePrinting:'Raging Bolt ex TEF'},choices:[...m.inventory(o).map((e,i)=>({kind:'energy',token:'e'+i,printing:e.printing,publicMetadata:metadata(e)})),{kind:'empty-selection',token:'empty'}],publicMetadata:{selectionType:'energy-discard',minimumCount:0,maximumCount:m.inventory(o).length,allowCancel:false}});
for(const seat of [0,1]){
 test('seat '+seat+' exact minimum lethal consumes five and preserves Moltres readiness',()=>{
  const o=own(bolt([X]),[mol([D,D,L]),ho([L,F,D,F,L])]);
  const r=request(seat,o,target(),[attack]);
  const p=m.plan(o,target(),false);
  assert.equal(p.minimumCards,5);
  assert.equal(p.damage,350);
  assert.deepEqual(p.donors.map(x=>x.slot.index),[1,1,1,1,1]);
  assert.equal(m.root(r,'unapproved'),null);
  assert.deepEqual(m.root(r,'rank19-bellowing-discard-v1'),{kind:'select-action',token:'attack'});
  r.prompt=prompt(o);
  assert.deepEqual(m.decideDiscard(r),{kind:'select-choices',tokens:['e3','e4','e5','e6','e7']});
 });
 test('seat '+seat+' damaged target costs one, preserve typed active payment',()=>{
  const o=own(bolt([L,F]),[ho([D])]);const r=request(seat,o,target(260),[attack]);r.prompt=prompt(o);
  assert.deepEqual(m.decideDiscard(r),{kind:'select-choices',tokens:['e2']});
 });
 test('seat '+seat+' no lethal without enough Basics, empty selection remains legal',()=>{
  const o=own(bolt([X]),[ho([L,F,D])]);const r=request(seat,o,target(),[attack]);r.prompt=prompt(o);
  assert.equal(m.root(r,'rank19-bellowing-discard-v1'),null);
  assert.deepEqual(m.decideDiscard(r),{kind:'select-choice',token:'empty'});
 });
 test('seat '+seat+' foreign owner, missing donor, duplicated donor or special reject',()=>{
  const o=own(bolt([X]),[ho([L,F,D])]);const r=request(seat,o,target(250),[attack]);
  r.prompt=prompt(o);r.prompt.choices[0].publicMetadata.ownerSeat='opponent';assert.equal(m.decideDiscard(r),null);
  r.prompt=prompt(o);r.prompt.choices.shift();assert.equal(m.decideDiscard(r),null);
  r.prompt=prompt(o);r.prompt.choices[1]={...r.prompt.choices[0],token:'e1'};assert.equal(m.decideDiscard(r),null);
  r.prompt=prompt(o);r.prompt.choices[0].printing=X;assert.equal(m.decideDiscard(r),null);
 });
}
test('native paid frontier required, unknown tool and printing rejected',()=>{
 const o=own(bolt([X]),[ho([L,F,D])]),r=request(0,o,target(250),[{...attack,publicMetadata:{attackCostPayable:false}}]);
 assert.equal(m.root(r,'rank19-bellowing-discard-v1'),null);
 assert.equal(m.knockoutCost(mon('Shadow Rider Calyrex VMAX CRE 74',[],320,250)),null);
 assert.equal(m.knockoutCost(mon('Shadow Rider Calyrex VMAX CRE 75',[],320,250,['unknown'])),null);
});
const native={PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:0,BENCH:1},SuperType:{ENERGY:1},EnergyType:{BASIC:0},EnergyCard:class EnergyCard{constructor(fullName,energyType=0){Object.assign(this,{fullName,energyType,superType:1});}}};
class DiscardEnergyPrompt{
 constructor(actor,max){Object.assign(this,{playerId:actor.id,playerType:0,message:'CHOOSE_ENERGIES_TO_DISCARD',slots:[0,1],filter:{superType:1,energyType:0},options:{min:0,max,allowCancel:false,blockedFrom:[],blockedMap:[]}});}
 getPerspectivePlayerId(){return this.playerId;}
 decode(result,state){return result.map(t=>{const a=state.players.find(x=>x.id===this.playerId);return {card:(t.from.slot===0?a.active:a.bench[t.from.index]).cards[t.index]};});}
 validate(result){return Array.isArray(result)&&result.length<=this.options.max&&result.every(x=>x.card?.superType===1);}
}
const slot=(fullName,e)=>{const pokemon={fullName,superType:0};return {cards:[pokemon,...e],energies:{cards:e.slice()},getPokemonCard:()=>pokemon};};
const source={sourceKind:'card-effect',effectName:'Bellowing Thunder',sourcePrinting:'Raging Bolt ex TEF'};
for(const seat of [0,1]){
 test('host seat '+seat+' maps actor energy-list indexes to native raw card-list indexes',()=>{
  const a=new native.EnergyCard(L),d=new native.EnergyCard(D),x=new native.EnergyCard(X,1),f=new native.EnergyCard(F);
  const actor={id:40,active:slot('Raging Bolt ex TEF',[x,a]),bench:[slot('Ho-Oh-EX DRX',[d,f])]};
  const other={id:41,active:slot('Shadow Rider Calyrex VMAX CRE',[new native.EnergyCard(D)]),bench:[]};
  const prompt=new DiscardEnergyPrompt(actor,3),state={players:seat===0?[actor,other]:[other,actor],prompts:[prompt]};
  const args={pin:m.PIN,native,state,prompt,actorSeat:seat,source};
  const p=m.project(args);
  assert.equal(p.prompt.choices.length,4);
  assert.equal(p.prompt.choices[0].publicMetadata.slotIndex,1);
  assert.deepEqual(p.resolve({kind:'select-choices',tokens:['bolt-energy-0','bolt-energy-2']}),[{from:{player:0,slot:0,index:0},index:2},{from:{player:0,slot:1,index:0},index:2}]);
  assert.deepEqual(p.resolve({kind:'select-choice',token:'bolt-empty'}),[]);
  assert.equal(p.resolve({kind:'select-choices',tokens:['bolt-energy-0','bolt-energy-0']}),null);
  assert.equal(p.resolve({kind:'select-choices',tokens:['bolt-energy-0','foreign']}),null);
  [actor.bench[0].cards[1],actor.bench[0].cards[2]]=[actor.bench[0].cards[2],actor.bench[0].cards[1]];
  assert.equal(p.resolve({kind:'select-choices',tokens:['bolt-energy-1']}),null);
  assert.equal(m.project({...args,pin:'unknown'}),null);
  assert.equal(m.project({...args,actorSeat:1-seat}),null);
  assert.equal(m.project({...args,source:{...source,effectName:'other'}}),null);
  prompt.options.max=4;assert.equal(m.project(args),null);
 });
}

for(const seat of [0,1]){
 test('seat '+seat+' avoid exposing two Darkness to Girafarig when alternate lethal donors exist',()=>{
  const t=mon('Wobbuffet PHF',[],110),o=own(bolt([L,F]),[mon('Latias ex SSP',[D,D],210)]);
  o.discard=[];o.lostZone=[];
  const ordinary=m.plan(o,t,false);
  assert.deepEqual(ordinary.donors.map(x=>x.type),['Darkness','Darkness']);
  const aware=m.plan(o,t,false,{girafarigThreat:true});
  assert.equal(aware.donors.filter(x=>x.type==='Darkness').length,1);
  assert.equal(aware.rank[0],0);
  const r=request(seat,o,t,[attack]);r.observation.opponentPublic.lostZone=['Girafarig LOT'];
  r.prompt=prompt(o);
  assert.deepEqual(m.decideDiscard(r),{kind:'select-choices',tokens:['e2','e3']});
 });
 test('seat '+seat+' nonlethal pressure keeps funded Lele for a two-hit VMAX route',()=>{
  const t=mon('Shadow Rider Calyrex VMAX CRE',Array(8).fill('Psychic Energy MEE'),320);
  const o=own(bolt([X]),[mon('Tapu Lele-GX GRI',[D,F],170),mon('Latias ex SSP',[L,L],210)]);
  const p=m.planPressure(o,t,false,{girafarigThreat:true});
  assert.equal(p.damage,140);assert.equal(p.followupDamage,200);assert.equal(p.setup,true);
  assert.deepEqual(p.donors.map(x=>x.slot.index),[1,1]);
  const r=request(seat,o,t,[attack]);r.observation.globalTurn=4;r.observation.ownHand=['Guzma BUS'];
  assert.deepEqual(m.pressureRoot(r,'rank19-bellowing-discard-v1'),{kind:'select-action',token:'attack'});
  r.prompt=prompt(o);assert.deepEqual(m.decideDiscard(r),{kind:'select-choices',tokens:['e2','e3']});
 });
 test('seat '+seat+' early low hand preserves Burst Roar, late pressure uses spare Basics',()=>{
  const o=own(bolt([X]),[mon('Latias ex SSP',[L,F],210)]),r=request(seat,o,target(),[attack]);
  r.observation.globalTurn=3;r.observation.ownHand=['Guzma BUS'];
  assert.equal(m.pressureRoot(r,'rank19-bellowing-discard-v1'),null);
  r.observation.globalTurn=4;
  assert.deepEqual(m.pressureRoot(r,'rank19-bellowing-discard-v1'),{kind:'select-action',token:'attack'});
 });
}
