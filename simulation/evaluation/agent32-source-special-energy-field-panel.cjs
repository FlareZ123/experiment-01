'use strict';

const assert=require('node:assert/strict');
const {sourceSpecialEnergyExposure}=
  require('./agent32-source-special-energy-exposure.cjs');

const VERSION='agent32-aichi-original29-special-energy-physical-exposure-v1';
const BASIC_ENERGY=/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$/;
const CANDIDATES=Object.freeze({
  adpV2Basics:7,shadowRiderReferenceBasics:14
});

/**
 * Source-only exact printed 60s and already independently verified
 * print-sensitive Basic-Pokemon counts. Does not read hidden game state.
 * @param {object} original Roster with 29 exact original name/count sixties.
 * @param {object[]} basicRows Uniquely matched originalBasicCounts() records.
 * @returns {object} Field-wide source physical Special Energy exposure.
 */
function summarizeSourceSpecialEnergyPanel(original,basicRows){
  assert.equal(original.published_deck_count,29);
  assert.equal(original.decks.length,29);
  assert.deepEqual(original.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  assert.equal(basicRows.length,29);
  const basic=new Map(basicRows.map(row=>[row.rank,row.basicCopies]));
  assert.equal(basic.size,29,'Duplicate original Basic-count rank');

  const rows=[];
  for(const deck of original.decks){
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    const b=basic.get(deck.rank);
    assert.ok(Number.isSafeInteger(b)&&b>0&&b<=60,
      'Unmatched source printing rank '+deck.rank);
    const energyCards=deck.cards.filter(c=>c.category==='Energy');
    const totalEnergy=energyCards.reduce((s,c)=>s+c.count,0);
    const specialEnergy=energyCards.filter(c=>!BASIC_ENERGY.test(c.name))
      .reduce((s,c)=>s+c.count,0);
    const specialOnly=totalEnergy>0&&specialEnergy===totalEnergy;
    const exposure=(candidateBasics,ordinaryDraw=0)=>specialEnergy>0?
      sourceSpecialEnergyExposure({sourceBasics:b,sourceSpecialEnergy:specialEnergy,
        contenderBasics:candidateBasics,ordinaryDraw}).energyAccessUpper:0;
    const accessSeven=exposure(CANDIDATES.adpV2Basics);
    const accessFourteen=exposure(CANDIDATES.shadowRiderReferenceBasics);
    rows.push({rank:deck.rank,archetype:deck.archetype,
      basicPokemonCopies:b,energyCopies:totalEnergy,
      specialEnergyCopies:specialEnergy,specialOnly,
      sourceSpecialAccessVsSeven:accessSeven,
      sourceSpecialAccessVsFourteen:accessFourteen,
      differenceSevenMinusFourteen:accessSeven-accessFourteen,
      sourceSpecialAccessWithDrawVsSeven:
        exposure(CANDIDATES.adpV2Basics,1),
      sourceSpecialAccessWithDrawVsFourteen:
        exposure(CANDIDATES.shadowRiderReferenceBasics,1)});
  }
  rows.sort((a,b)=>a.rank-b.rank);
  assert.equal(new Set(rows.map(r=>r.rank)).size,29);
  assert.equal(rows.reduce((s,r)=>s+r.specialEnergyCopies,0),118);
  assert.equal(rows.filter(r=>r.specialEnergyCopies>0).length,24);
  assert.deepEqual(rows.filter(r=>r.specialOnly).map(r=>r.rank),
    [4,5,6,7,17,24,29]);

  const mean=(records,key)=>records.reduce((s,r)=>s+r[key],0)/records.length;
  const summarize=records=>({
    n:records.length,
    sourceSpecialAccessVsSeven:
      mean(records,'sourceSpecialAccessVsSeven'),
    sourceSpecialAccessVsFourteen:
      mean(records,'sourceSpecialAccessVsFourteen'),
    differenceSevenMinusFourteen:
      mean(records,'differenceSevenMinusFourteen')
  });
  return {
    version:VERSION,
    source:'results/aichi-2026/full-decklists.json',
    comparatorBasics:CANDIDATES,
    totalOriginalField:32,
    authenticatedOriginals:29,
    missingRanks:[23,25,28],
    totalOriginalSpecialEnergyCopies:118,
    acrossAll29:summarize(rows),
    acrossSpecialBearing24:summarize(rows.filter(r=>r.specialEnergyCopies>0)),
    acrossSpecialOnly7:summarize(rows.filter(r=>r.specialOnly)),
    rows,
    paperGamesQualified:0,
    interpretation:'Uniform physical setup, full optional mulligan bonus draws, with or without one ordinary draw. Does not certify payable Energy, policy action, games or wins.'
  };
}

function main(){
  const original=require('../../results/aichi-2026/full-decklists.json');
  const {originalBasicCounts}=
    require('./agent32-adp-field-mulligan-offers.cjs');
  return summarizeSourceSpecialEnergyPanel(original,originalBasicCounts(original.decks));
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,BASIC_ENERGY,CANDIDATES,
  summarizeSourceSpecialEnergyPanel,main};
