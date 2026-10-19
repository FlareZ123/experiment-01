'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {availableUnown}=require(
  '../simulation/twinleaf/newmoon-rank6-pass-farewell-observer.cjs');

const slot=(name,energies=[],tools=[])=>({
  getPokemonCard:()=>name?{fullName:name}:null,
  energies:{cards:energies},tools
});

test('only owner public Unown AOR without attached cards is probed',()=>{
  const player={bench:[
    slot('Unown AOR',['Psychic Energy']),
    slot('Mewtwo & Mew-GX UNM'),
    slot('Unown AOR'),
    slot('Unown AOR',[],['Forest Seal Stone']),
    slot(null)
  ]};
  assert.equal(availableUnown(player),2);
  assert.equal(availableUnown({bench:[slot('Unown SM8'),slot(null)]}),-1);
});
