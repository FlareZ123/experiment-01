'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose,validOpeningProbability,snorlaxLeadGivenValidOpening,
  hoodOpeningGivenValidOpening,allHoodsPrizedGivenValidOpening,
  forcedSnorlaxActiveGivenValidOpening,auditSoloSnorlax} =
  require('../scripts/aichi-snorlax-solo-block.cjs');

test('small and full-size combination arithmetic is exact',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(choose(60,6),50063860);
  assert.equal(choose(8,4),70);
  assert.equal(choose(4,6),0);
  assert.throws(()=>choose(2.2,1),/Invalid/);
});

test('both source Snorlax lists have verified Basic and active-lead counts',()=>{
  const a=auditSoloSnorlax();
  assert.equal(a.sourceDeckCount,29);
  const rows=new Map(a.opponents.map(o=>[o.rank,o]));
  assert.deepEqual([rows.get(3).snorlax,rows.get(3).basics],[3,11]);
  assert.deepEqual([rows.get(7).snorlax,rows.get(7).basics],[2,12]);
  assert.ok(Math.abs(rows.get(3).pSnorlaxLeadGivenValidOpening-
    0.40565605648759934)<1e-12);
  assert.ok(Math.abs(rows.get(7).pSnorlaxLeadGivenValidOpening-
    0.27363689572781247)<1e-12);
  assert.equal(rows.get(3).namedCounters['Tool Jammer'],1);
  assert.equal(rows.get(7).namedCounters['Tool Jammer'],1);
  assert.ok(Math.abs(rows.get(3).pForcedSnorlaxActiveGivenValidOpening-
    0.15945043530483485)<1e-12);
  assert.ok(Math.abs(rows.get(7).pForcedSnorlaxActiveGivenValidOpening-
    0.0839961250229095)<1e-12);
  assert.ok(rows.get(3).pForcedSnorlaxActiveGivenValidOpening<
    rows.get(3).pSnorlaxLeadGivenValidOpening);
  assert.ok(rows.get(7).pForcedSnorlaxActiveGivenValidOpening<
    rows.get(7).pSnorlaxLeadGivenValidOpening);
  assert.equal(rows.get(7).namedCounters.Faba,2);
  assert.equal(rows.get(7).namedCounters['Megaton Blower'],1);
});

test('all three fixed Shadow Rider inventories lack a universal switch Item',()=>{
  const a=auditSoloSnorlax();
  const rows=new Map(a.candidates.map(c=>[c.id,c]));
  for(const row of rows.values()){
    assert.equal(row.cards.Guzma,1);
    assert.equal(row.cards.Acerola,1);
    assert.equal(row.cards['Float Stone'],1);
    assert.equal(row.cards.Switch,0);
    assert.equal(row.cards['Escape Rope'],0);
    assert.equal(row.cards['Switch Cart'],0);
    assert.equal(row.cards['Jet Energy'],0);
  }
  assert.equal(rows.get('champion-reference').cards['Stealthy Hood'],0);
  assert.equal(rows.get('temple-v1').cards['Stealthy Hood'],0);
  assert.equal(rows.get('hood-shield-v1').cards['Stealthy Hood'],2);
  assert.equal(rows.get('hood-shield-v1').basics,14);
  assert.equal(rows.get('temple-v1').basics,15);
});

test('Hood conditional opening access and joint Prize collapse are distinct',()=>{
  const a=auditSoloSnorlax();
  const hood=a.candidates.find(c=>c.id==='hood-shield-v1');
  assert.ok(Math.abs(hood.directHoodGivenValidOpening-
    0.21139908159810397)<1e-12);
  assert.ok(Math.abs(hood.allHoodsPrizedGivenValidOpening-
    0.008584189968090307)<1e-12);
  assert.equal(hoodOpeningGivenValidOpening(0,14),0);
  assert.ok(validOpeningProbability(14)>0.86);
  assert.ok(hoodOpeningGivenValidOpening(1,14)<
    hoodOpeningGivenValidOpening(2,14));
  assert.ok(snorlaxLeadGivenValidOpening(2,12)<
    snorlaxLeadGivenValidOpening(3,11));
  assert.throws(()=>allHoodsPrizedGivenValidOpening(7,14),/Invalid/);
  assert.ok(forcedSnorlaxActiveGivenValidOpening(1,14)>0);
  assert.throws(()=>forcedSnorlaxActiveGivenValidOpening(0,14),/Invalid/);
});
