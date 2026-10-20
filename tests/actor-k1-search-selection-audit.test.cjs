'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorK1SearchSelectionAudit,TARGETS}=
  require('../simulation/twinleaf/actor-k1-search-selection-audit.cjs');

const card=fullName=>({fullName});
function fixture(){
  const p={id:101,deck:{cards:[card('Mewtwo & Mew-GX UNM'),
    card('Mewtwo & Mew-GX UNM'),card('Gengar & Mimikyu-GX TEU'),
    card('Psychic Energy SVE')]},
    hand:{cards:[card('Psychic Energy SVE')]},
    active:{getPokemonCard:()=>card('Latias ex SSP')},
    bench:[]};
  const prompt={constructor:{name:'ChooseCardsPrompt'},id:13,
    playerId:p.id,cards:p.deck,result:undefined,
    validate:([x])=>x?.fullName?.endsWith('UNM')};
  return {state:{turn:3,players:[p,{id:202}]},prompt};
}

test('authenticated owner search shows printed counts and actual legal singles',()=>{
  const {state,prompt}=fixture();
  const x=actorK1SearchSelectionAudit(state,0,prompt);
  assert.equal(x.turn,3);
  assert.equal(x.observedDeckCount,4);
  assert.equal(x.targetCounts['Mewtwo & Mew-GX UNM'],2);
  assert.equal(x.targetCounts['Gengar & Mimikyu-GX TEU'],1);
  assert.equal(x.targetCounts['Battle Compressor PHF'],0);
  assert.equal(x.legalSingletonChoice['Mewtwo & Mew-GX UNM'],true);
  assert.equal(x.legalSingletonChoice['Gengar & Mimikyu-GX TEU'],false);
  assert.equal(x.ownHandTargets['Psychic Energy SVE'],1);
  assert.equal(x.ownActive,'Latias ex SSP');
  assert.equal(TARGETS.length,10);
});

test('rejects any missing, answered, foreign or non-deck search',()=>{
  const {state,prompt}=fixture();
  assert.equal(actorK1SearchSelectionAudit(state,0,undefined),null);
  assert.equal(actorK1SearchSelectionAudit(state,0,{...prompt,
    playerId:202}),null);
  assert.equal(actorK1SearchSelectionAudit(state,0,{...prompt,
    cards:{cards:prompt.cards.cards}}),null);
  assert.equal(actorK1SearchSelectionAudit(state,0,{...prompt,
    result:[]}),null);
  assert.equal(actorK1SearchSelectionAudit(state,0,{...prompt,
    constructor:{name:'ChooseCardsNotPrompt'}}),null);
});

test('no deck identity enumeration before a native prompt exists',()=>{
  const {state}=fixture();
  state.players[0].deck.cards=new Proxy({length:9},{get(obj,key){
    if(key==='length')return obj.length;
    throw new Error('K0 hidden access '+String(key));
  }});
  assert.equal(actorK1SearchSelectionAudit(state,0,null),null);
});

test('distinct printed variants never collapse into name-only matching',()=>{
  const {state,prompt}=fixture();
  state.players[0].deck.cards.push(card('Garbodor BKP'),card('Garbodor LTR'));
  const x=actorK1SearchSelectionAudit(state,0,prompt,
    ['Garbodor BKP','Garbodor LTR','Garbodor BKP']);
  assert.deepEqual(x.targetCounts,{'Garbodor BKP':1,'Garbodor LTR':1});
});
