'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('./aichi-pilot.cjs');

/**
 * Exercise the genuine pinned Twinleaf printing resolver and Aichi plan once
 * per unchanged source inventory. This performs no speculative game play.
 * @returns {object} Reproducible provenance receipt for the 29 original 60s.
 */
function main(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const receipt=plan.originalSourceIdentity;
  assert.ok(receipt,'Missing identity receipt from actual native plan');
  assert.equal(receipt.publishedCount,29);
  assert.equal(receipt.sources.length,29);
  assert.deepEqual(receipt.missingRanks,[23,25,28]);
  assert.equal(plan.sourceDeckCount,29);
  assert.equal(plan.opponents.length,32);
  const rank11=receipt.sources.find(row=>row.rank===11);
  assert.equal(rank11.player,'Wataru Yano');
  assert.equal(rank11.archetype,'Absol Garbodor');
  for(const source of receipt.sources){
    const opponent=plan.opponents.find(row=>row.rank===source.rank);
    assert.equal(source.nativeStatus,opponent.status);
    assert.match(source.printingSha256,/^[a-f0-9]{64}$/);
    if(opponent.status==='ready'){
      assert.equal(opponent.cards.length,60);
      assert.match(source.nativeOrderedSha256,/^[a-f0-9]{64}$/);
      assert.equal(source.nativeHasSubstitutions,
        opponent.substitutions.length>0);
    }else{
      assert.equal(source.nativeOrderedSha256,null);
      assert.equal(opponent.cards,null);
    }
  }
  const summary={
    schema:'agent13-actual-pinned-native-original-source-identity-v1',
    engineRevision:plan.engineRevision,
    candidateRank:plan.candidateRank,
    sourceDeckCount:receipt.publishedCount,
    missingRanks:receipt.missingRanks,
    nativeReadyRanks:receipt.sources.filter(s=>s.nativeStatus==='ready')
      .map(s=>s.rank),
    unresolvedRanks:receipt.sources.filter(s=>s.nativeStatus!=='ready')
      .map(s=>s.rank),
    substitutionRanks:receipt.sources.filter(s=>s.nativeHasSubstitutions)
      .map(s=>s.rank),
    rank11:{rank:rank11.rank,player:rank11.player,
      archetype:rank11.archetype,
      printedSha256:rank11.printingSha256,
      nativeOrderedSha256:rank11.nativeOrderedSha256,
      nativeStatus:rank11.nativeStatus},
    gameCount:0,
    competitiveGameQualified:false
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  return summary;
}

if(require.main===module)main();
module.exports={main};
