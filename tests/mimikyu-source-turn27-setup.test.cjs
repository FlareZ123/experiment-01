'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSetupAction}=require('../simulation/twinleaf/mimikyu-source-turn27-setup.cjs');
/** @param {string} name @param {string[]} energies */
function slot(name,energies=[]) {
  return {getPokemonCard:()=>({fullName:name}),
    energies:{cards:energies.map(name=>({name}))}};
}
/** @param {string} fullName */
const card=fullName=>({fullName,name:fullName.replace(/ (?:UPR|FLI|ASC|MEE)$/,'')});
function fixture() {
  const candidate={id:101,usedGX:false,energyPlayedTurn:25,retreatedTurn:25,
    active:slot('Latias ex SSP',['Psychic Energy','Psychic Energy']),
    bench:[slot('Tapu Lele-GX GRI'),slot('Mimikyu GRI',['Psychic Energy'])],
    hand:{cards:['Mysterious Treasure FLI','Dialga-GX UPR',
      'Night Stretcher ASC'].map(card)},
    discard:{cards:[card('Psychic Energy MEE')]}};
  const opponent={id:202,active:slot('Regidrago VSTAR SIT'),
    bench:[],hand:{cards:[]},discard:{cards:[]}};
  const state={turn:27,players:[opponent,candidate],playerLastAttack:{
    202:{sourceCard:card('Regidrago VSTAR SIT'),
      attack:{name:'Apex Dragon',gxAttack:false}}
  }};
  return {state,candidate};
}
test('turn27 response plan chooses a resource sequence',()=>{
  const {state,candidate}=fixture();
  assert.deepEqual(chooseSetupAction(state,candidate),
    {kind:'discard-dialga',handIndex:0});
  candidate.discard.cards.push(candidate.hand.cards.splice(1,1)[0]);
  candidate.hand.cards.shift();
  assert.deepEqual(chooseSetupAction(state,candidate),
    {kind:'recover-psychic',handIndex:0});
  candidate.hand.cards.shift();
  candidate.hand.cards.push(card('Psychic Energy MEE'));
  assert.deepEqual(chooseSetupAction(state,candidate),
    {kind:'attach-psychic',handIndex:0,benchIndex:1});
  candidate.hand.cards.shift();
  candidate.bench[1].energies.cards.push({name:'Psychic Energy'});
  candidate.energyPlayedTurn=state.turn;
  assert.deepEqual(chooseSetupAction(state,candidate),
    {kind:'promote-mimikyu',benchIndex:1});
  candidate.active=slot('Mimikyu GRI',['Psychic Energy','Psychic Energy']);
  candidate.bench[1]=slot('Latias ex SSP');
  assert.equal(chooseSetupAction(state,candidate),null);
});
test('rejects wrong last attack or consumed GX',()=>{
  const {state,candidate}=fixture();
  candidate.usedGX=true;
  assert.equal(chooseSetupAction(state,candidate),null);
  candidate.usedGX=false;
  state.playerLastAttack[202].attack.name='Timeless-GX';
  assert.equal(chooseSetupAction(state,candidate),null);
});
