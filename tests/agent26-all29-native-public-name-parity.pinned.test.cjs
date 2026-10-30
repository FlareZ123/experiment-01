'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {publicAichiSourceNameIndex}=require(
 '../simulation/evaluation/agent26-public-mulligan-printing-name-bridge.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');
const inventory=names=>{
 const map=new Map();
 for(const name of names)map.set(name,(map.get(name)??0)+1);
 return map;
};

test('audit all currently playable native original sixties against exact public source-name inventory',()=>{
 const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
 const known=publicAichiSourceNameIndex(initializeCards().getAllCards());
 const records=[],seen=new Set(),variants=new Map();
 for(const source of manifest.decks){
  const prepared=source.rank===1?plan.candidate:
   plan.opponents.find(x=>x.rank===source.rank);
  assert.ok(prepared,'Original source not considered by deck resolver');
  if(prepared.status&&prepared.status!=='ready'){
   records.push({rank:source.rank,status:prepared.status});
   continue;
  }
  const physical=prepared.cards;
  assert.equal(physical.length,60);
  const names=physical.map(fullName=>{
   assert.ok(known.has(fullName),'Unknown public printing '+fullName);
   return known.get(fullName);
  });
  for(let i=0;i<physical.length;i++){
   const name=names[i];
   if(!variants.has(name))variants.set(name,new Set());
   variants.get(name).add(physical[i]);
  }
  const observed=inventory(names);
  const expected=inventory(source.cards.flatMap(c=>Array(c.count).fill(c.name)));
  const differences=[...new Set([...observed.keys(),...expected.keys()])]
   .filter(name=>(observed.get(name)??0)!==(expected.get(name)??0))
   .map(name=>({name,original:expected.get(name)??0,
    native:observed.get(name)??0}));
  records.push({rank:source.rank,status:'ready',differenceCount:differences.length,
   differences});
  seen.add(source.rank);
 }
 console.log('AGENT26_ALL29_NATIVE_PUBLIC_NAME_PARITY',
  JSON.stringify({checked:seen.size,total:records.length,records}));
 assert.equal(records.length,29);
 assert.ok(seen.size>0);
 console.log('AGENT26_NATIVE_SOURCE_MULTIPRINTS',JSON.stringify(
  [...variants].filter(([,v])=>v.size>1).map(([name,v])=>({name,prints:[...v]}))));
});
