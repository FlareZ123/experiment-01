'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {copycatTurnStartSnapshot} =
  require('../simulation/twinleaf/copycat-turn-start-evidence.cjs');

/** @param {string|null} name @param {string[]} energies */
function slot(name, energies = []) {
  return {
    damage:0, getPokemonCard() {
      return name ? {fullName:name,name:name.split(' ').slice(0,-1).join(' '),
        attacks:[]} : undefined;
    },
    energies:{cards:energies.map(fullName => ({
      fullName,name:fullName.split(' ').slice(0,-1).join(' ')
    }))},tools:[]
  };
}
/** @param {string} fullName */
function card(fullName) {
  return {fullName,name:fullName.split(' ').slice(0,-1).join(' ')};
}

test('captures all candidate resource zones but no opposing hand identities', () => {
  const candidate={
    id:101, usedGX:false,active:slot('Latias ex SSP'),
    bench:[slot('Mimikyu GRI',['Psychic Energy MEE'])],
    hand:{cards:[card('Dialga-GX UPR'),card('Mysterious Treasure FLI')]},
    discard:{cards:[card('Psychic Energy MEE')]},
    stadium:{cards:[]},prizes:[{cards:[{}]}]
  };
  const opponent={
    id:202,active:slot('Regidrago VSTAR SIT'),bench:[],
    hand:{cards:[card('SECRET HIDDEN CARD')]},
    discard:{cards:[card('Dialga-GX UPR')]},
    stadium:{cards:[]},prizes:[{cards:[{}]}]
  };
  const state={players:[candidate,opponent],turn:27,
    playerLastAttack:{202:{sourceCard:card('Regidrago VSTAR SIT'),
      attack:{name:'Apex Dragon',gxAttack:false}}}};
  const prior=JSON.stringify(state);
  const result=copycatTurnStartSnapshot(state,0);
  assert.equal(JSON.stringify(state),prior,'Capture must not mutate live State');
  assert.deepEqual(result.ownDialga,{hand:1,discard:0,inPlay:0});
  assert.deepEqual(result.mimikyu,[{
    location:'bench',benchIndex:0,energyPrintings:['Psychic Energy MEE'],
    damage:0
  }]);
  assert.equal(result.previousOpponentAttack.name,'Apex Dragon');
  assert.equal(result.candidateUsedGX,false);
  assert.equal(result.opponentHandSize,1);
  assert.equal(JSON.stringify(result).includes('SECRET HIDDEN CARD'),false);
  assert.equal(result.board[0].active.name,'Latias ex');
});
