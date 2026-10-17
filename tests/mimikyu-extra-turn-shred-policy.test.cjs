'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {shouldCopyApexShred} =
  require('../simulation/twinleaf/mimikyu-extra-turn-shred-policy.cjs');

/** @returns {{state:object,player:object}} */
function fixture() {
  const candidate={
    id:202,usedGX:true,
    active:{
      getPokemonCard:()=>({fullName:'Mimikyu GRI'}),
      energies:{cards:[
        {name:'Psychic Energy',fullName:'Psychic Energy MEE'},
        {name:'Psychic Energy',fullName:'Psychic Energy MEE'}
      ]}
    },
    discard:{cards:[{fullName:'Dialga-GX UPR'}]}
  };
  const enemy={
    id:101,active:{damage:210,
      getPokemonCard:()=>({fullName:'Regidrago VSTAR SIT'})}
  };
  return {
    player:candidate,
    state:{
      turn:28,players:[enemy,candidate],
      playerLastAttack:{
        101:{attack:{name:'Apex Dragon',gxAttack:false},
          sourceCard:{fullName:'Regidrago VSTAR SIT'}}
      }
    }
  };
}

test('source-turn28 exact spent-GX Shred policy activates',()=>{
  const {state,player}=fixture();
  assert.equal(shouldCopyApexShred(state,player),true);
});

test('turn27 and no spent GX are excluded',()=>{
  const {state,player}=fixture();
  state.turn=27;
  assert.equal(shouldCopyApexShred(state,player),false);
  state.turn=28;
  player.usedGX=false;
  assert.equal(shouldCopyApexShred(state,player),false);
});

test('the opponent last-attack record must be ordinary Apex Dragon',()=>{
  const {state,player}=fixture();
  state.playerLastAttack[101].attack.gxAttack=true;
  assert.equal(shouldCopyApexShred(state,player),false);
  state.playerLastAttack[101].attack.gxAttack=false;
  state.playerLastAttack[101].attack.name='Kaiser Tackle';
  assert.equal(shouldCopyApexShred(state,player),false);
});

test('the defender must be within the Shred printed knockout range',()=>{
  const {state,player}=fixture();
  state.players[0].active.damage=190;
  assert.equal(shouldCopyApexShred(state,player),false);
});

test('correct attacker, Psychic and discarded Dragon are required',()=>{
  const {state,player}=fixture();
  player.discard.cards.length=0;
  assert.equal(shouldCopyApexShred(state,player),false);
  player.discard.cards.push({fullName:'Dialga-GX UPR'});
  player.active.energies.cards=[{name:'Fire Energy'},{name:'Fire Energy'}];
  assert.equal(shouldCopyApexShred(state,player),false);
  player.active.energies.cards=[{name:'Psychic Energy'},{name:'Psychic Energy'}];
  player.active.getPokemonCard=()=>({fullName:'Latias ex SSP'});
  assert.equal(shouldCopyApexShred(state,player),false);
});
