'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {terminalSignatures}=require('../simulation/twinleaf/terminal-signatures.cjs');

/** @param {object} [changes] */
function fixture(changes={}) {
  const before=[
    {prizesRemaining:6,inPlayPokemon:3,deckRemaining:8},
    {prizesRemaining:2,inPlayPokemon:1,deckRemaining:1}
  ];
  const after=before.map(player=>({...player}));
  for (const [seat, values] of Object.entries(changes)) {
    Object.assign(after[Number(seat)],values);
  }
  return {
    actionName:'PassTurnAction',playerSlot:0,
    before:{players:before,winner:-1},
    after:{players:after,winner:0}
  };
}

test('a zero deck alone is evidence of exhaustion, not a proved failed draw',()=>{
  const transition=fixture({1:{deckRemaining:0}});
  const result=terminalSignatures(transition);
  assert.equal(result.observed,true);
  assert.equal(result.candidate[1].emptyDeckAtTerminal,true);
  assert.equal(result.candidate[1].noPokemonInPlay,false);
  assert.equal(result.candidate[1].allPrizesGone,false);
  assert.equal(Object.hasOwn(result,'cause'),false);
  assert.match(result.interpretation,/not sufficient proof/);
});

test('last Pokémon disappearance records before/after without inventing result reason',()=>{
  const result=terminalSignatures(fixture({1:{inPlayPokemon:0}}));
  assert.equal(result.candidate[1].newlyLostLastPokemon,true);
  assert.equal(result.candidate[0].newlyLostLastPokemon,false);
  assert.equal(result.hasAmbiguousSimultaneousVisibleConditions,false);
  assert.equal(Object.hasOwn(result,'cause'),false);
});

test('both public end conditions remain visible when they coexist',()=>{
  const result=terminalSignatures(fixture({
    0:{prizesRemaining:0},1:{inPlayPokemon:0,deckRemaining:0}
  }));
  assert.equal(result.candidate[0].newlyTookLastPrizes,true);
  assert.equal(result.candidate[1].newlyLostLastPokemon,true);
  assert.equal(result.hasAmbiguousSimultaneousVisibleConditions,true);
  assert.equal(result.engineWinner,0);
});

test('pre-existing zero counts are not newly triggered',()=>{
  const transition=fixture();
  transition.before.players[1].inPlayPokemon=0;
  transition.before.players[1].prizesRemaining=0;
  transition.after.players[1].inPlayPokemon=0;
  transition.after.players[1].prizesRemaining=0;
  const result=terminalSignatures(transition);
  assert.equal(result.candidate[1].noPokemonInPlay,true);
  assert.equal(result.candidate[1].newlyLostLastPokemon,false);
  assert.equal(result.candidate[1].allPrizesGone,true);
  assert.equal(result.candidate[1].newlyTookLastPrizes,false);
});

test('unfinished state has no invented terminal evidence',()=>{
  const result=terminalSignatures(null);
  assert.equal(result.observed,false);
  assert.equal(Object.hasOwn(result,'candidate'),false);
});
