'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {projectOrdinaryWinMatrix}=
  require('../simulation/evaluation/agent24-ordinary-simultaneous-win-matrix.cjs');

/**
 * @param {boolean[]} prizes Seat-ordered cards exhausted.
 * @param {boolean[]} noPokemon Seat-ordered total board absence.
 * @returns {object} Conditional ordinary-game rulebook-E result.
 */
function project(prizes,noPokemon){
  return projectOrdinaryWinMatrix({
    authenticatedOrdinaryState:true,
    deckOutConditionExcluded:true,
    allPrizesTaken:prizes,
    noPokemonInPlay:noPokemon
  });
}

test('all eleven Advanced Rules 3.4 section E table rows match the stated result',()=>{
  const cases=[
    {prizes:[true,false],noPokemon:[true,false],expected:null},
    {prizes:[false,true],noPokemon:[false,true],expected:null},
    {prizes:[true,true],noPokemon:[true,true],expected:null},
    {prizes:[true,true],noPokemon:[false,false],expected:null},
    {prizes:[false,false],noPokemon:[true,true],expected:null},
    {prizes:[true,true],noPokemon:[false,true],expected:0},
    {prizes:[true,false],noPokemon:[true,true],expected:0},
    {prizes:[true,false],noPokemon:[false,true],expected:0},
    {prizes:[true,true],noPokemon:[true,false],expected:1},
    {prizes:[false,true],noPokemon:[true,true],expected:1},
    {prizes:[false,true],noPokemon:[true,false],expected:1}
  ];
  for(const [index,c] of cases.entries()){
    const r=project(c.prizes,c.noPokemon);
    assert.equal(r.projectedWinnerSeat,c.expected,
      'Rulebook table row '+(index+1));
    assert.equal(r.status,c.expected===null?
      'SIMULTANEOUS_TIE':'SEAT_WITH_MORE_WINNING_CONDITIONS');
    assert.equal(r.paperGameOutcomeQualified,false);
  }
});

test('ordinary two final-Prize simultaneous KO with live Benches is a tie',()=>{
  const result=project([true,true],[false,false]);
  assert.equal(result.status,'SIMULTANEOUS_TIE');
  assert.deepEqual(result.winningReasonsBySeat,[1,1]);
  assert.equal(result.projectedWinnerSeat,null);
  assert.equal(result.officialClockVerified,false);
});

test('ordinary table cannot classify an unverified deck-out condition',()=>{
  const r=projectOrdinaryWinMatrix({
    authenticatedOrdinaryState:true,
    allPrizesTaken:[true,true],
    noPokemonInPlay:[false,false]
  });
  assert.equal(r.status,'RULES_TABLE_PRECONDITIONS_UNVERIFIED');
  assert.equal(r.projectedWinnerSeat,null);
});

test('ordinary matrix rejects incomplete public conditions and no win cases',()=>{
  for(const malformed of [
    {allPrizesTaken:[true],noPokemonInPlay:[false,false]},
    {allPrizesTaken:[true,true],noPokemonInPlay:['false',false]},
    {allPrizesTaken:null,noPokemonInPlay:[false,false]}
  ]){
    const r=projectOrdinaryWinMatrix({
      authenticatedOrdinaryState:true,
      deckOutConditionExcluded:true,...malformed
    });
    assert.equal(r.status,'PUBLIC_END_CONDITIONS_UNVERIFIED');
  }
  const none=project([false,false],[false,false]);
  assert.equal(none.status,'NO_OBSERVED_END_CONDITION');
  assert.equal(none.projectedWinnerSeat,null);
});
