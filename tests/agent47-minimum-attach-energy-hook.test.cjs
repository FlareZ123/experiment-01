'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {repairMinimumAttachSelection,withMinimumAttachEnergySelection}=
 require('../simulation/twinleaf/agent47-minimum-attach-energy-hook.cjs');
const TARGET={player:2,slot:1,index:0};
function fixture(min=3,extra={}){
 const energies=['Fire','Grass','Lightning'].map(name=>({fullName:name+' Energy MEE',provides:[name]}));
 const cards={cards:energies,filter:fn=>energies.filter(fn)};
 const player={id:202,forEachPokemon:(side,fn)=>{
  assert.equal(side,2);
  fn({getPokemonCard:()=>({name:'Regidrago V'})},{name:'Regidrago V'},TARGET);
 }};
 const state={players:[{id:101},player]};
 const prompt={id:38,playerType:2,slots:[1],cardList:cards,filter:()=>true,
  options:{min,max:min,maxPerType:null,sameTarget:false,
   differentTargets:false,differentTypes:false,...extra},
  getPerspectivePlayerId:()=>202,
  validate:rows=>Array.isArray(rows)&&rows.length===min&&
   rows.every(row=>energies.includes(row.card)&&row.to.player===2&&
     row.to.slot===1&&row.to.index===0)&&
   new Set(rows.map(row=>row.card)).size===rows.length};
 return{state,prompt,energies,proposed:[{card:energies[0],to:TARGET}]};
}
test('original rank20 min3 abort: preserve exact first card and fill two',()=>{
 const x=fixture(),result=repairMinimumAttachSelection(x.state,x.prompt,x.proposed);
 assert.equal(result.changed,true);assert.equal(result.value.length,3);
 assert.equal(x.prompt.validate(result.value),true);
 assert.strictEqual(result.value[0],x.proposed[0]);
 assert.deepEqual(result.value.map(row=>row.card),x.energies);
 assert.equal(x.proposed.length,1);
});
test('pinned native FilterType object accepted through physical CardList.filter',()=>{
 const x=fixture();
 const filter={superType:'ENERGY',energyType:'BASIC'};
 x.prompt.filter=filter;
 x.prompt.cardList.filter=arg=>{
  assert.strictEqual(arg,filter);
  return x.energies;
 };
 const r=repairMinimumAttachSelection(x.state,x.prompt,x.proposed);
 assert.equal(r.changed,true);
 assert.equal(r.value.length,3);
 assert.equal(x.prompt.validate(r.value),true);
});
test('second min2 abort: fill one of two eligible physical cards',()=>{
 const x=fixture(2);x.prompt.filter=c=>c!==x.energies[2];
 const r=repairMinimumAttachSelection(x.state,x.prompt,x.proposed);
 assert.equal(r.changed,true);
 assert.deepEqual(r.value.map(row=>row.card),x.energies.slice(0,2));
});
test('declines unsupported type, target, cap, scarcity and bad recipient',()=>{
 const x=fixture();
 for(const modified of [
  {...x.prompt,options:{...x.prompt.options,differentTargets:true}},
  {...x.prompt,options:{...x.prompt.options,differentTypes:true}},
  {...x.prompt,options:{...x.prompt.options,maxPerType:1}},
  {...x.prompt,options:{...x.prompt.options,min:4}},
  {...x.prompt,filter:c=>c===x.energies[0]}
 ]){
  const r=repairMinimumAttachSelection(x.state,modified,x.proposed);
  assert.equal(r.changed,false);assert.strictEqual(r.value,x.proposed);
 }
 const bad=[{card:x.energies[0],to:{player:1,slot:1,index:0}}];
 assert.equal(repairMinimumAttachSelection(x.state,x.prompt,bad).changed,false);
});
test('both physical owner seats share one reversible native resolver path',()=>{
 class Prompt{}
 const a=fixture(),b=fixture(2);
 Object.setPrototypeOf(a.prompt,Prompt.prototype);
 Object.setPrototypeOf(b.prompt,Prompt.prototype);
 class Resolver{getPromptResult(){return this.proposal;}}
 const old=Resolver.prototype.getPromptResult;
 const out=withMinimumAttachEnergySelection(()=>{
  const resolver=new Resolver();resolver.proposal=a.proposed;
  const one=resolver.getPromptResult(a.state,a.prompt);
  resolver.proposal=b.proposed;
  const two=resolver.getPromptResult(b.state,b.prompt);
  return[one,two];
 },{AttachEnergyPromptResolver:Resolver,AttachEnergyPrompt:Prompt});
 assert.equal(out.audit.proposedCorrections,2);
 assert.deepEqual(out.result.map(rows=>rows.length),[3,2]);
 assert.strictEqual(Resolver.prototype.getPromptResult,old);
});
test('native errors propagate with correction evidence; restoration is guaranteed',()=>{
 class Prompt{}
 class Resolver{getPromptResult(){return[];}}
 const old=Resolver.prototype.getPromptResult;
 assert.throws(()=>withMinimumAttachEnergySelection(()=>{
  throw new Error('native Store failed');
 },{AttachEnergyPromptResolver:Resolver,AttachEnergyPrompt:Prompt}),
 e=>e.message==='native Store failed'&&
     e.nativeMinimumAttachEvidence.version!==undefined);
 assert.strictEqual(Resolver.prototype.getPromptResult,old);
});
