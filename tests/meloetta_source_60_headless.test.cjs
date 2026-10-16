'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('../simulation/twinleaf/resolve-field.cjs');
const {runDamagePumpCorrectedMatch} =
  require('../simulation/twinleaf/damage-pump-corrected-match.cjs');

const source = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');

/** @returns {object} Explicitly mapped published Aichi field. */
function field() {
  return resolveManifestFile(source,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
}

test('rank-26 source prints form a legal engine 60 after disclosed benign mappings',()=>{
  const mapped=field();
  const m=mapped.decks.find(d=>d.rank===26);
  assert.ok(m,'Aichi rank 26 absent from published source');
  assert.equal(m.playableUnderEngine,true,
    'Source rank 26 must be printable and engine-recognized with permitted mappings');
  assert.equal(m.cardIds.length,60);
  assert.equal(m.cardIds.filter(name=>name==='Meloetta ex SV11B').length,1);
  assert.equal(m.cardIds.filter(name=>name==='Exeggcute PLF').length,2);
  assert.equal(m.cardIds.filter(name=>name==='Damage Pump LOR').length,4);
  assert.equal(m.cardIds.filter(name=>name==='Risky Ruins MEG').length,4);
  assert.equal(m.cardIds.filter(name=>name==='Tapu Koko Prism Star TEU').length,1);
  assert.ok(m.modifications.every(row=>
    ['same-set-basic-energy-number-mismatch','prism-glyph-name-alias',
      'verified-prc60-omega-barrier-disambiguation',
      'research-only-japanese-promo-implementation'].includes(row.reason)));
});

test('bounded pinned source 60 can enter headless gameplay from either seat with corrected Pump',()=>{
  const mapped=field();
  const m=mapped.decks.find(d=>d.rank===26);
  const champion=mapped.decks.find(d=>d.rank===1);
  assert.equal(m.playableUnderEngine,true);
  assert.equal(champion.playableUnderEngine,true);
  for(const [deckA,deckB,seed] of [
    [m.cardIds,champion.cardIds,260126],
    [champion.cardIds,m.cardIds,260127]
  ]) {
    const result=runDamagePumpCorrectedMatch({
      deckA,deckB,seed,maxActions:200,
      isolatePolicyRandomness:true
    });
    assert.equal(result.damagePumpSingleSourceCorrection,true);
    assert.match(result.policy,/\+DamagePumpSingleSource-v1$/);
    assert.equal(result.deckHashes.length,2);
    assert.equal(result.actionCounts.constructor,Object);
    assert.ok(result.turns>=0);
  }
});
