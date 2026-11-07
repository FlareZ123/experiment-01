'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {censusAichiBasics} =
  require('../scripts/agent12-aichi-basic-opening-census.cjs');
const {openingMulliganProbability,pairedSetupMulligans} =
  require('../scripts/agent12-expanded-mulligan-pairing.cjs');

test('all 29 authenticated original 60-card source printings resolve exact Basic stage', () => {
  const data = censusAichiBasics();
  assert.equal(data.sourceRanks, 29);
  assert.equal(data.allPokemonPrintingsResolved, true);
  assert.deepEqual(data.missingOriginalRanks.slice().sort((a,b)=>a-b),
    [23,25,28]);
  assert.equal(new Set(data.rows.map(row => row.rank)).size, 29);
  for (const row of data.rows) {
    assert.equal(row.deckCards,60);
    assert.equal(row.basicPrintings.reduce((n,p)=>n+p.count,0),
      row.basicCopies);
    assert.equal(row.nonBasicPrintings.reduce((n,p)=>n+p.count,0) +
      row.basicCopies,row.pokemonCopies);
    assert.ok(row.basicCopies >=1);
    assert.ok(row.basicCopies <= row.pokemonCopies);
    assert.ok(Math.abs(row.noBasicOpeningProbability -
      openingMulliganProbability(row.basicCopies)) < 1e-14);
    for (const card of row.basicPrintings) {
      assert.ok(card.printedSubtypes.includes('Basic'),
        'Actual Basic printing must be Basic, rank '+row.rank);
      assert.ok(typeof card.databaseCardId === 'string');
    }
    for (const card of row.nonBasicPrintings) {
      assert.equal(card.printedSubtypes.includes('Basic'),false);
    }
  }
  console.log('AICHI_PRINTED_BASIC_CENSUS ' + JSON.stringify(
    data.rows.map(x=>({rank:x.rank,archetype:x.archetype,
      basics:x.basicCopies,openingMulliganProbability:
      x.noBasicOpeningProbability,
      expectedOptionalDrawsOfferedVersusRank1:
      x.expectedOptionalDrawsOfferedVersusRank1}))));
});

test('source rank 1 has 14 actual Basic printings and four non-Basic VMAX', () => {
  const data = censusAichiBasics();
  const first = data.rows.find(x=>x.rank===1);
  assert.equal(first.basicCopies,14);
  assert.equal(first.pokemonCopies,18);
  const vmax = first.nonBasicPrintings.find(x=>
    x.name === 'Shadow Rider Calyrex VMAX');
  assert.equal(vmax.count,4);
  assert.equal(vmax.databaseCardId,'swsh6-75');
  const tagTeam = first.basicPrintings.find(x=>
    x.name==='Trevenant & Dusknoir-GX');
  assert.equal(tagTeam.databaseCardId,'smp-SM217');
});

test('three original source Iron Thorns 60s have exactly four eligible Basics', () => {
  const data = censusAichiBasics();
  for (const rank of [6,24,29]) {
    const row=data.rows.find(x=>x.rank===rank);
    assert.equal(row.basicCopies,4);
    assert.equal(row.pokemonCopies,4);
    assert.equal(row.basicPrintings.length,1);
    assert.equal(row.basicPrintings[0].databaseCardId,'sv6-77');
    assert.equal(row.basicPrintings[0].count,4);
    const comparison=pairedSetupMulligans(4,14);
    assert.ok(Math.abs(row.expectedOptionalDrawsOfferedVersusRank1-
      comparison.expectedOptionalDrawsAvailableToOpponent)<1e-14);
  }
});

test('Prism Star diamond variants resolve the same printed Basic card', () => {
  const data = censusAichiBasics();
  const ditto = data.rows.find(row => row.rank === 4)
    .basicPrintings.find(card => card.name === 'Ditto ♢');
  assert.equal(ditto.databaseCardId, 'sm8-154');
  assert.ok(ditto.printedSubtypes.includes('Basic'));

  const tapuKoko = data.rows.find(row => row.rank === 8)
    .basicPrintings.find(card => card.name === 'Tapu Koko ♢');
  assert.equal(tapuKoko.databaseCardId, 'sm9-51');
  assert.ok(tapuKoko.printedSubtypes.includes('Basic'));
});
