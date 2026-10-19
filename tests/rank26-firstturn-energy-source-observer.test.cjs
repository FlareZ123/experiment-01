'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceEnergyBoard,withRank26SourceEnergyObserver} =
  require('../simulation/twinleaf/rank26-firstturn-energy-source-observer.cjs');

function slot(pokemon,energy=[],tools=[]) {
  return {
    getPokemonCard:()=>pokemon && ({fullName:pokemon}),
    energies:{cards:energy.map(fullName=>({fullName}))},
    tools:tools.map(fullName=>({fullName}))
  };
}

test('read-only energy snapshot preserves native Active and Bench identities',()=>{
  const player = {
    active:slot('Exeggcute PLF',[ 'Lightning Energy MEE']),
    bench:[
      slot('Exeggcute PLF',[]),
      slot('Meloetta ex BLK',['Double Colorless Energy SUM'],['TM Crisis Punch'])
    ],
    energyPlayedTurn:1
  };
  const original = JSON.stringify(player.bench[1].energies.cards);
  const snapshot=sourceEnergyBoard(player);
  assert.equal(snapshot.bench.length,2);
  assert.deepEqual(snapshot.active.energy,['Lightning Energy MEE']);
  assert.equal(snapshot.bench[1].pokemon,'Meloetta ex BLK');
  assert.deepEqual(snapshot.bench[1].energy,['Double Colorless Energy SUM']);
  assert.deepEqual(snapshot.bench[1].tools,['TM Crisis Punch']);
  assert.equal(snapshot.energyPlayedTurn,1);
  snapshot.bench[1].energy.push('other');
  assert.equal(JSON.stringify(player.bench[1].energies.cards),original);
});

test('rejects invalid source identity before attempting compiled engine',()=>{
  assert.throws(()=>withRank26SourceEnergyObserver(2,()=>{}),TypeError);
  assert.throws(()=>withRank26SourceEnergyObserver(1,null),TypeError);
});
