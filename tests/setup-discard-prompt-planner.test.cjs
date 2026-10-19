'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSetupDeckDiscards}=require('../simulation/twinleaf/setup-discard-prompt-planner.cjs');
const donor='Gengar & Mimikyu-GX TEU',other='Trevenant & Dusknoir-GX SMP';
function given(names,options={}){
 const owner={deck:{cards:names.map((fullName,id)=>({fullName,id}))}};
 const o={min:1,max:3,blocked:[],...options};
 const prompt={player:owner,cards:owner.deck,options:o,
  validate(cards){return cards.length>=o.min&&cards.length<=o.max&&
    cards.every(x=>!o.blocked.includes(owner.deck.cards.indexOf(x)))&&
    (!o.reject||cards.every(x=>x.fullName!==o.reject));}};
 return {owner,prompt};
}
test('New Moon future donor discard utility differs from hand score',()=>{
 const {owner,prompt}=given(['Psychic Energy MEE',donor,other,'Forest Seal Stone SIT']);
 const x=chooseSetupDeckDiscards(prompt,owner,[{printing:donor,value:9},{printing:other,value:6}]);
 assert.deepEqual(x.printings,[donor,other].sort());
 assert.equal(x.utility,15);assert.equal(x.forcedOffPlan,false);
});
test('rank26 Exeggcute multiple print-matched copies',()=>{
 const {owner,prompt}=given(['Exeggcute PLF','Double Colorless Energy SUM','Exeggcute PLF']);
 const x=chooseSetupDeckDiscards(prompt,owner,[{printing:'Exeggcute PLF',value:8,maxCopies:2}]);
 assert.deepEqual(x.printings,['Exeggcute PLF','Exeggcute PLF']);
});
test('native minimum forces least costly off-plan discard with no target',()=>{
 const {owner,prompt}=given(['Rare Item','Basic Energy']);
 const x=chooseSetupDeckDiscards(prompt,owner,[{printing:donor,value:5}],-4);
 assert.equal(x.printings.length,1);assert.equal(x.forcedOffPlan,true);
});
test('blocked and native rejected targets cannot be selected',()=>{
 const {owner,prompt}=given([donor,other,'Spare'],{blocked:[0],reject:other});
 const x=chooseSetupDeckDiscards(prompt,owner,[{printing:donor,value:9},{printing:other,value:7}],-3);
 assert.deepEqual(x.printings,['Spare']);
});
test('minimum two is evaluated at complete selection',()=>{
 const {owner,prompt}=given([donor,other,'Spare'],{min:2});
 const x=chooseSetupDeckDiscards(prompt,owner,[{printing:donor,value:8},{printing:other,value:5}],-6);
 assert.deepEqual(x.printings,[donor,other].sort());
});
test('owner-deck permutation and concealed opponent do not influence printings',()=>{
 const rows=[[donor,other,'Spare'],['Spare',other,donor],[other,donor,'Spare']];
 const choices=rows.map(order=>{
  const {owner,prompt}=given(order);
  Object.defineProperty(owner,'prizes',{get(){throw Error('hidden');}});
  Object.defineProperty(owner,'opponent',{get(){throw Error('hidden');}});
  return chooseSetupDeckDiscards(prompt,owner,[{printing:donor,value:4}],-1).printings;
 });
 assert.deepEqual(choices,[choices[0],choices[0],choices[0]]);
});
test('no premature deck peeking or paper-invalid zero choice',()=>{
 const {owner,prompt}=given([donor]);
 assert.throws(()=>chooseSetupDeckDiscards(prompt,{deck:{cards:[]}},[]));
 prompt.options.min=0;
 assert.throws(()=>chooseSetupDeckDiscards(prompt,owner,[]));
});
