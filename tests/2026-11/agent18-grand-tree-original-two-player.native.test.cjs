'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {resolveManifestFile}=require('../../simulation/twinleaf/resolve-field.cjs');
const {
  runWithResearchProfile,EXPANDED_SOURCE_PROFILE
}=require('../../simulation/twinleaf/policy-profiles.cjs');
const {
  canonicalizePublishedGrandTreeDeck,withCanonicalGrandTreeLookup,CANONICAL
}=require('../../simulation/twinleaf/2026-11/agent18-grand-tree-printing-alias.cjs');

const file=path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json');
const sha256=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

test('actual shared two-player runner constructs printed Grand Tree original rank2 60 in both physical seats',()=>{
  const published=JSON.parse(fs.readFileSync(file,'utf8'));
  const native=resolveManifestFile(file,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const rank1=native.decks.find(row=>row.rank===1);
  const rank2=native.decks.find(row=>row.rank===2);
  const rank2Source=published.decks.find(row=>row.rank===2);
  assert.equal(rank1?.playableUnderEngine,true);
  assert.equal(rank2?.playableUnderEngine,true);
  const canonical=canonicalizePublishedGrandTreeDeck(
    rank2.cardIds,rank2Source.cards);
  assert.equal(canonical.filter(id=>id===CANONICAL).length,1);
  const results=[];
  for(const seat of [0,1]){
    const deckA=seat===0?canonical:rank1.cardIds;
    const deckB=seat===1?canonical:rank1.cardIds;
    const options={
      deckA,deckB,seed:20261109,maxActions:30,
      captureDecisionTrace:true,
      strictPromptValidation:true,
      grandTreeFirstTurnCorrection:true,
      label:'Original Aichi source rank2 canonical Grand Tree two-player smoke'
    };
    const beforeNative=rank2.cardIds.slice();
    const output=withCanonicalGrandTreeLookup(()=>
      runWithResearchProfile(options,EXPANDED_SOURCE_PROFILE));
    assert.deepEqual(output.deckHashes,[sha256(deckA),sha256(deckB)]);
    assert.equal(output.actions>0,true);
    assert.equal(output.actions<=30,true);
    assert.ok(Array.isArray(output.rootActionLedger));
    assert.ok(output.rootActionLedger.length>0);
    assert.deepEqual(rank2.cardIds,beforeNative);
    results.push({
      sourceRank:2,sourceSeat:seat,
      nativeActions:output.actions,rootActions:output.rootActionLedger.length,
      finished:output.finished,winningSeat:output.finished?output.winner:null,
      exactSourceListPreserved:true,canonicalGrandTreeCopies:1,
      frozenSource60Fingerprint:output.deckHashes[seat],
      gamePaperQualified:false
    });
  }
  console.log('AGENT18_GRANDTREE_ORIGINAL_TWO_PLAYER',JSON.stringify(results));
});
