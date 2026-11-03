'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {planAichi}=
  require('../simulation/evaluation/aichi-pilot.cjs');
const {candidateManifest,ENTRIES}=
  require('../simulation/twinleaf/agent50-rank26-unlocked-fifth-candidate-owner-root-v22.cjs');

test('shared native exact-print resolver flags FLF69 effect as uncorrected until opt-in paper hook',()=>{
  const entry=ENTRIES.find(e=>e.id==='agent5-adp-thorton-v2');
  assert.ok(entry,'Fixed candidate cannot silently disappear from rank26 registration');
  const input=candidateManifest(entry);
  const plan=planAichi(input,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60,
    'Provenance-bearing fixed v2 must remain exactly 60 native resolved printings');
  const markers=plan.candidate.substitutions.filter(x=>
    x.sourceName==='M Charizard-EX'&&
    x.sourcePrinting?.set==='FLF'&&
    String(x.sourcePrinting?.number)==='69');
  assert.equal(markers.length,1,'Exact FLF69 printed source needs a single auditable marker');
  assert.equal(markers[0].reason,
    'flf69-original-mega-reducer-requires-own-deck-wild-blaze-hook');
  assert.equal(markers[0].resolvedId,'M Charizard EX FLF');
  assert.equal(markers[0].count,1);
  assert.ok(plan.candidate.cards.includes('M Charizard EX FLF'));
  assert.equal(plan.candidate.cards.includes('M Charizard-EX FLF 69'),false,
    'Generated duplicate skips original printed Mega evolution turn');
  console.log('AGENT5_FLF69_UNCORRECTED_RESOLVER_MARKER',JSON.stringify({
    candidateHash:plan.candidateNativeOrderedSha256,
    paperEffectQualified:false,
    marker:markers[0],
    competitiveQualifiedGames:0
  }));
});
