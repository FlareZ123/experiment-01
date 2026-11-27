'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const bolt=require('../../simulation/evaluation/2026-11/agent23-rank19-bellowing-thunder-draft.cjs');
const mod=require('../../simulation/evaluation/2026-11/agent23-rank19-acceleration-draft.cjs');
const L='Lightning Energy MEE',F='Fighting Energy MEE',D='Darkness Energy MEE',X='Double Dragon Energy ROS';
const A='Arceus & Dialga & Palkia GX CEC',B='Raging Bolt ex TEF',M='Galarian Moltres V CRE 97',FL='Flutter Mane TEF',S="Professor Sada's Vitality PAR";
const mon=(printing,energies=[])=>({printing,energies,hp:320,damage:0,tools:[]});
const own=(active,bench,discard=[])=>({active,bench,discard,stadium:[],publicTurnRestrictions:{gxUsed:true}});
const target=()=>mon('Shadow Rider Calyrex VMAX CRE');
const root=(token,kind,actorPrinting,attackName)=>({token,kind,actorPrinting,attackName,publicMetadata:{attackCostPayable:true}});
const sada=root('sada','play-card',S),ray=root('ray','attack',A,'Ultimate Ray'),gx=root('gx','attack',A,'Altered Creation-GX');
const sourceS={sourceKind:'card-effect',sourcePrinting:S,effectName:"Professor Sada's Vitality"},sourceR={sourceKind:'card-effect',sourcePrinting:A,effectName:'Ultimate Ray'};
const request=(seat,o,items=[])=>({role:'opponent',seat,observation:{actorSeat:seat,ownPublic:o,opponentPublic:{active:target(),stadium:[]}},actionFrontier:{items}});
function draftPrompt(o,source,energies){
 const sp=mod.spec(source),slots=[{zone:'active',index:0,pokemon:o.active},...o.bench.map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(s=>s.pokemon&&(sp.id==='ray'||[B,FL].includes(s.pokemon.printing)));
 const choices=energies.flatMap((e,i)=>slots.map(s=>({kind:'energy',token:'e'+i+'-'+s.zone+s.index,printing:e,publicMetadata:{ownerSeat:'actor',sourceZone:sp.zone,isOwnerVisible:true,energyType:'BASIC',zone:s.zone,...(s.zone==='bench'?{benchIndex:s.index}:{}),selectionIndex:i,selectedCount:1}})));
 if(sp.min===0)choices.push({kind:'empty-selection',token:'empty'});
 return {promptType:'AttachEnergyPrompt',source,choices,publicMetadata:{selectionType:'energy-attachment-set',minimumCount:sp.min,maximumCount:sp.max,allowCancel:false}};
}
for(const seat of [0,1]){
 test('seat '+seat+' Sada powers both Bolts with distinct physical energy cards and recipients',()=>{
  const o=own(mon(B,[L]),[mon(B,[F])],[L,F,D]),r=request(seat,o,[sada]);
  assert.equal(mod.root(r,'unapproved'),null);
  assert.deepEqual(mod.root(r,'rank19-attachment-set-v1'),{kind:'select-action',token:'sada'});
  r.prompt=draftPrompt(o,sourceS,[L,F,D]);
  assert.deepEqual(mod.decide(r),{kind:'select-choices',tokens:['e0-bench0','e1-active0']});
 });
 test('seat '+seat+' Sada retains lone Darkness for Moltres if no extra readiness gained',()=>{
  const o=own(mon(B,[L,F]),[mon(FL),mon(M,[])],[F,D]),r=request(seat,o,[sada]);r.prompt=draftPrompt(o,sourceS,[F,D]);
  const d=mod.decide(r);
  assert.equal(d.tokens.length,1);assert.equal(d.tokens[0].startsWith('e0-'),true);
 });
 test('seat '+seat+' Ultimate Ray uses all three Basic attachments to ready bench Moltres',()=>{
  const o=own(mon(A,[X,L]),[mon(M,[]),mon(B,[])],[]),r=request(seat,o,[ray,gx]);
  assert.deepEqual(mod.root(r,'rank19-attachment-set-v1'),{kind:'select-action',token:'ray'});
  r.prompt=draftPrompt(o,sourceR,[D,D,F]);
  assert.deepEqual(mod.decide(r),{kind:'select-choices',tokens:['e0-bench0','e1-bench0','e2-bench0']});
 });
 test('seat '+seat+' Ray can complete two attackers, rather than overfund Moltres',()=>{
  const o=own(mon(A,[X,L]),[mon(M,[D,D]),mon(B,[L])],[]),r=request(seat,o,[ray]);r.prompt=draftPrompt(o,sourceR,[L,F,D]);
  const d=mod.decide(r);
  assert.equal(d.tokens.length,3);
  assert.equal(d.tokens.includes('e1-bench1'),true);
  assert.equal(d.tokens.some(t=>t.endsWith('bench0')),true);
 });
 test('seat '+seat+' Ray prefers unused GX except ordinary immediate terminal knockout',()=>{
  const o=own(mon(A,[X,L]),[mon(M,[])],[]);o.publicTurnRestrictions.gxUsed=false;o.prizeCount=3;
  const r=request(seat,o,[ray,gx]);assert.deepEqual(mod.root(r,'rank19-attachment-set-v1'),{kind:'select-action',token:'gx'});
  r.observation.opponentPublic.active.damage=180;
  assert.deepEqual(mod.root(r,'rank19-attachment-set-v1'),{kind:'select-action',token:'ray'});
 });
 test('seat '+seat+' rejects forged Sada owner and wrong targets',()=>{
  const o=own(mon(B,[L]),[mon(B,[F])],[L,F]),r=request(seat,o,[sada]);r.prompt=draftPrompt(o,sourceS,[L,F]);
  r.prompt.choices[0].publicMetadata.ownerSeat='opponent';assert.equal(mod.decide(r),null);
  r.prompt=draftPrompt(o,sourceS,[L,F]);r.prompt.choices[1].publicMetadata.benchIndex=2;assert.equal(mod.decide(r),null);
  r.prompt=draftPrompt(o,sourceS,[L,F]);r.prompt.choices.shift();assert.equal(mod.decide(r),null);
 });
}
const native={PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:0,BENCH:1},SuperType:{ENERGY:1},EnergyType:{BASIC:0},CardTag:{ANCIENT:9},EnergyCard:class EnergyCard{constructor(fullName,energyType=0){Object.assign(this,{fullName,energyType,superType:1});}}};
class AttachEnergyPrompt{
 constructor(actor,sp,blockedTo=[]){Object.assign(this,{playerId:actor.id,playerType:0,message:sp.id==='sada'?'ATTACH_ENERGY_TO_ACTIVE':'ATTACH_ENERGY_TO_BENCH',slots:[1,0],cardList:actor[sp.zone],filter:{superType:1,energyType:0},options:{min:sp.min,max:sp.max,allowCancel:false,differentTargets:sp.distinct,differentTypes:false,sameTarget:false,blocked:[],blockedTo}});}
 getPerspectivePlayerId(){return this.playerId;}
 decode(result){return result.map(t=>({card:this.cardList.cards[t.index],to:t.to}));}
 validate(result){return result.length>=this.options.min&&result.length<=this.options.max&&result.every(x=>x.card?.superType===1);}
}
const slot=(fullName,ancient=false)=>{const p={fullName,hasTag:t=>t===9&&ancient};return {getPokemonCard:()=>p};};
for(const seat of [0,1]){
 test('host seat '+seat+' exact Sada raw target set and duplicate-physical-card rejection',()=>{
  const actor={id:1,active:slot(B,true),bench:[slot(M),slot(B,true)],discard:{cards:[new native.EnergyCard(F),new native.EnergyCard(X,1),new native.EnergyCard(L)]}};
  const other={id:2,active:slot('other'),bench:[]},prompt=new AttachEnergyPrompt(actor,mod.spec(sourceS),[{player:0,slot:1,index:0}]);
  const state={players:seat?[other,actor]:[actor,other],prompts:[prompt]};
  const args={pin:bolt.PIN,native,state,prompt,actorSeat:seat,source:sourceS};
  const p=mod.project(args);assert.equal(p.prompt.choices.length,4);
  assert.equal(p.prompt.choices.some(c=>c.publicMetadata.benchIndex===0),false);
  assert.deepEqual(p.resolve({kind:'select-choices',tokens:['attach-0','attach-3']}),[{index:0,to:{player:0,slot:0,index:0}},{index:2,to:{player:0,slot:1,index:1}}]);
  assert.equal(p.resolve({kind:'select-choices',tokens:['attach-0','attach-1']}),null);
  assert.equal(p.resolve({kind:'select-choices',tokens:['attach-0','attach-2']}),null);
  assert.equal(p.resolve({kind:'select-choice',token:'attach-empty'}),null);
  assert.equal(mod.project({...args,actorSeat:1-seat}),null);
  state.prompts=[];assert.equal(p.resolve({kind:'select-choices',tokens:['attach-0']}),null);
 });
 test('host seat '+seat+' Ultimate Ray allows same recipient, hides physical deck indices and supports zero',()=>{
  const actor={id:1,active:slot(A),bench:[slot(M)],deck:{cards:[{fullName:'hidden trainer',superType:2},new native.EnergyCard(L),new native.EnergyCard(D),new native.EnergyCard(X,1),new native.EnergyCard(F)]}};
  const other={id:2,active:slot('other'),bench:[]},prompt=new AttachEnergyPrompt(actor,mod.spec(sourceR)),state={players:seat?[other,actor]:[actor,other],prompts:[prompt]};
  const p=mod.project({pin:bolt.PIN,native,state,prompt,actorSeat:seat,source:sourceR});
  assert.equal(p.prompt.choices.length,7);
  assert.equal(JSON.stringify(p.prompt).includes('hidden trainer'),false);
  assert.equal(p.prompt.choices[0].publicMetadata.selectionIndex,0);
  assert.deepEqual(p.resolve({kind:'select-choices',tokens:['attach-1','attach-3','attach-5']}),[{index:2,to:{player:0,slot:1,index:0}},{index:4,to:{player:0,slot:1,index:0}},{index:1,to:{player:0,slot:1,index:0}}]);
  assert.deepEqual(p.resolve({kind:'select-choice',token:'attach-empty'}),[]);
  assert.equal(p.resolve({kind:'select-choices',tokens:['attach-0','attach-1']}),null);
 });
}

test('immediate five-energy knockout can override the Darkness reserve',()=>{
 const o=own(mon(B,[L,F]),[mon(FL),mon(M,[D])],[F,D]),r=request(0,o,[sada]);r.prompt=draftPrompt(o,sourceS,[F,D]);
 assert.equal(mod.decide(r).tokens.length,2);
});
