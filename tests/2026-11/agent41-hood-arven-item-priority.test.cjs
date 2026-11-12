'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rankHoodArvenItems}=require('../../simulation/twinleaf/agent41-hood-arven-item-priority.cjs');
const {resolveArvenHoodSearch}=require('../../simulation/twinleaf/agent31/arven-hood-owner-frontier.cjs');
const ITEM='ITEM',SUPPORTER='SUPPORTER',POKEMON='POKEMON';
const card=(name,trainerType=ITEM,superType='TRAINER')=>({
  name,fullName:name+' TEST',trainerType,superType
});
const slot=name=>({getPokemonCard:()=>({name})});
function board({hand=[],deck=[],discard=[],opponentTools=[],opponentStadium=[],ownPrizes=6,oppPrizes=6}={}){
  const own={id:101,hand:{cards:hand},deck:{cards:deck},discard:{cards:discard},
    active:slot('Shadow Rider Calyrex VMAX'),bench:[slot('Shadow Rider Calyrex VMAX')],
    prizes:Array(ownPrizes).fill(null),stadium:{cards:[]}};
  const opponent={id:202,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
    active:{getPokemonCard:()=>({name:'Iron Thorns ex'}),tools:opponentTools},
    bench:[],prizes:Array(oppPrizes).fill(null),stadium:{cards:opponentStadium}};
  return {state:{players:[own,opponent]},own,opponent};
}
function rank(b,names){return rankHoodArvenItems(b.state,0,names.map(n=>card(n)),SUPPORTER,POKEMON);}

test('Fog Crystal is selected for missing Psychic Energy regardless of deck permutation',()=>{
  const names=['Mysterious Treasure','Fog Crystal','VS Seeker','Quick Ball'];
  const b=board({deck:[card('Psychic Energy',undefined,'ENERGY'),...names.map(n=>card(n))]});
  const a=rank(b,names),z=rank(b,[...names].reverse());
  assert.equal(a[0].card.name,'Fog Crystal');
  assert.equal(z[0].card.name,'Fog Crystal');
  assert.equal(a[0].reason,'find Psychic Energy for Underworld Door');
});

test('Night Stretcher outranks deck search when Psychic Energy is already in discard',()=>{
  const names=['Fog Crystal','Night Stretcher','Mysterious Treasure'];
  const b=board({deck:[...names.map(n=>card(n)),card('Psychic Energy',undefined,'ENERGY')],
    discard:[card('Psychic Energy',undefined,'ENERGY')]});
  assert.equal(rank(b,names)[0].card.name,'Night Stretcher');
});

test('VS Seeker is prioritized only when a Supporter is actually in discard',()=>{
  const names=['VS Seeker','Fog Crystal'];
  const withSupporter=board({hand:[card('Psychic Energy',undefined,'ENERGY')],
    deck:[...names.map(n=>card(n)),card('Psychic Energy',undefined,'ENERGY')],
    discard:[card('Arven',SUPPORTER)]});
  assert.equal(rank(withSupporter,names)[0].card.name,'VS Seeker');
  const without=board({hand:[card('Psychic Energy',undefined,'ENERGY')],
    deck:[...names.map(n=>card(n)),card('Psychic Energy',undefined,'ENERGY')]});
  assert.equal(rank(without,names)[0].card.name,'Fog Crystal');
});

test('Battle Compressor is prioritized when Night Stretcher is held and Energy remains in deck',()=>{
  const names=['Battle Compressor','Fog Crystal','Night Stretcher'];
  const b=board({hand:[card('Night Stretcher'),card('Psychic Energy',undefined,'ENERGY')],
    deck:[...names.map(n=>card(n)),card('Psychic Energy',undefined,'ENERGY')]});
  assert.equal(rank(b,names)[0].card.name,'Battle Compressor');
});

test('Unfair Stamp rises when the public Prize count shows the opponent ahead',()=>{
  const names=['Unfair Stamp','Fog Crystal'];
  const b=board({hand:[card('Psychic Energy',undefined,'ENERGY')],
    deck:[...names.map(n=>card(n)),card('Psychic Energy',undefined,'ENERGY')],
    ownPrizes:5,oppPrizes:3});
  assert.equal(rank(b,names)[0].card.name,'Unfair Stamp');
});

test('Field Blower rises for a public opposing Tool',()=>{
  const names=['Field Blower','Fog Crystal'];
  const b=board({hand:[card('Psychic Energy',undefined,'ENERGY')],
    deck:[...names.map(n=>card(n)),card('Psychic Energy',undefined,'ENERGY')],
    opponentTools:[card('Float Stone','TOOL')]});
  assert.equal(rank(b,names)[0].card.name,'Field Blower');
});

test('native Arven resolver uses the highest-ranked Item that passes Store validation',()=>{
  const hood={name:'Stealthy Hood',fullName:'Stealthy Hood UNB',trainerType:'TOOL'};
  const fog=card('Fog Crystal'),treasure=card('Mysterious Treasure');
  const b=board({hand:[card('Unused Item')],
    deck:[treasure,hood,fog,card('Psychic Energy',undefined,'ENERGY')]});
  const prompt={id:'arven-1',playerId:b.own.id,result:undefined,cards:b.own.deck,
    validate(selected){return selected.includes(hood)&&selected.includes(treasure);}};
  prompt.constructor={name:'ChooseCardsPrompt'};
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  const result=resolveArvenHoodSearch(b.state,0,prompt,ResolvePromptAction,
    ITEM,SUPPORTER,POKEMON);
  assert.ok(result);
  assert.equal(result.item,treasure.fullName);
  assert.equal(result.itemReason,'no visible high-value Pokémon target or discard cost');
  assert.deepEqual(result.chosen,[hood.fullName,treasure.fullName]);
});

test('native Arven resolver falls back to Hood alone when no Item pair passes validation',()=>{
  const hood={name:'Stealthy Hood',fullName:'Stealthy Hood UNB',trainerType:'TOOL'};
  const fog=card('Fog Crystal');
  const b=board({deck:[fog,hood,card('Psychic Energy',undefined,'ENERGY')]});
  const prompt={id:'arven-2',playerId:b.own.id,result:undefined,cards:b.own.deck,
    validate(selected){return selected.length===1&&selected[0]===hood;}};
  prompt.constructor={name:'ChooseCardsPrompt'};
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  const result=resolveArvenHoodSearch(b.state,0,prompt,ResolvePromptAction,
    ITEM,SUPPORTER,POKEMON);
  assert.ok(result);
  assert.deepEqual(result.chosen,[hood.fullName]);
  assert.equal(result.item,null);
});
