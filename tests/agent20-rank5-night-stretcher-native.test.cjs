'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {inspectNightStretcherPass}=require(
  '../simulation/twinleaf/agent20-rank5-night-stretcher-native.cjs');

/** @param {string|null} name */
const slot=name=>({cards:name?[{name,fullName:name}]:[],
  getPokemonCard:()=>name?{name,fullName:name}:null});

test('owner-hand Night Stretcher and face-up discard, no opponent secrets',()=>{
  const owner={
    hand:{cards:[{name:'Night Stretcher',fullName:'Night Stretcher ASC'}]},
    discard:{cards:[
      {name:'Dialga-GX',fullName:'Dialga-GX UPR'},
      {name:'Latias ex',fullName:'Latias ex SSP'}]},
    active:slot('Girafarig'),bench:[slot(null),slot(null)],
    cannotPlayItemCards:false,cannotPlayPokemonCards:false};
  const opponent={active:slot('Mew VMAX'),
    bench:[slot('Mew VMAX'),slot('Genesect V')],
    hand:{cards:[{name:'Secret',fullName:'UNREADABLE'}]},discard:{cards:[]}};
  const out=inspectNightStretcherPass({players:[owner,opponent],turn:24},0);
  assert.equal(out.nightStretcherHeld,true);
  assert.equal(out.benchCount,0);
  assert.equal(out.targetBasicDiscardPrintings.length,2);
  assert.deepEqual(out.opponentBench,['Mew VMAX','Genesect V']);
  assert.equal(JSON.stringify(out).includes('UNREADABLE'),false);
  assert.equal(out.competitiveQualifiedGame,false);
});
