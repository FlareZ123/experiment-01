'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerEvolutionVipBasics}=
  require('../simulation/twinleaf/agent3-owner-evolution-vip-search.cjs');
const {chooseCommonVipBasics}=
  require('../simulation/twinleaf/agent7-common-vip-pass-bridge.cjs');
const card=(name,kind='Basic',evolvesFrom)=>({
  name,fullName:name+' TEST',kind,evolvesFrom
});
const slot=name=>({getPokemonCard:()=>name?card(name):null});
const owner=hand=>({active:slot('Oranguru V'),bench:Array.from({length:5},()=>slot(null)),hand:{cards:hand}});
const nativePrompt=cards=>({cards:{cards},validate(choice){
  return choice.length>0&&choice.length<=2&&choice.every(c=>c.kind==='Basic');
}});

test('rank11 ordinary alphabetical VIP choice can omit required Trubbish',()=>{
  const cards=[card('Crobat V'),card('Latias ex'),card('Mega Absol ex'),
    card('Trubbish'),card('Garbodor','Stage1','Trubbish'),card('Dark Patch','Item')];
  const own=owner([]),prompt=nativePrompt(cards);
  const legacy=chooseCommonVipBasics(own,prompt,{}).map(c=>c.name);
  const evolutionary=chooseOwnerEvolutionVipBasics(own,prompt,{}).map(c=>c.name);
  assert.deepEqual(legacy,['Crobat V','Latias ex']);
  assert.deepEqual(evolutionary,['Crobat V','Trubbish']);
});

test('no Evolution in owner-hand/deck preserves original alphabetical tie',()=>{
  const cards=[card('Trubbish'),card('Latias ex'),card('Crobat V')];
  const own=owner([]),prompt=nativePrompt(cards);
  assert.deepEqual(chooseOwnerEvolutionVipBasics(own,prompt,{}),
    chooseCommonVipBasics(own,prompt,{}));
});

test('native validity and Bench slots control output cardinality',()=>{
  const own=owner([card('Garbodor','Stage1','Trubbish')]);
  const basics=[card('Trubbish'),card('Crobat V')];
  const prompt=nativePrompt(basics);
  own.bench[0]=slot('Mega Absol ex');
  own.bench[1]=slot('Latias ex');
  own.bench[2]=slot('Dedenne GX');
  own.bench[3]=slot('Tapu Lele GX');
  assert.deepEqual(chooseOwnerEvolutionVipBasics(own,prompt,{}).map(c=>c.name),['Trubbish']);
  own.bench[4]=slot('Shadow Rider Calyrex V');
  assert.deepEqual(chooseOwnerEvolutionVipBasics(own,prompt,{}),[]);
});

test('opponent concealed hand, deck and Prize identities do not influence selection',()=>{
  const own=owner([]),prompt=nativePrompt([
    card('Crobat V'),card('Trubbish'),card('Garbodor','Stage1','Trubbish')]);
  const a={players:[own,{hand:{cards:[card('Unrevealed A')]}}]};
  const b={players:[own,{hand:{cards:[card('Unrevealed B')]}}]};
  assert.deepEqual(chooseOwnerEvolutionVipBasics(own,prompt,a),
    chooseOwnerEvolutionVipBasics(own,prompt,b));
});
