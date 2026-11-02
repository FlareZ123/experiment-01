'use strict';
const assert=require('node:assert/strict');

/** Compare 16 identical registered physical deals without treating either bot as competitive. */
function auditPairedCensor(base,longer){
  assert.equal(base.rows.length,16);assert.equal(longer.rows.length,16);
  const pairs=[];
  for(const a of base.rows){
    const b=longer.rows.find(x=>JSON.stringify(x.caseInfo)===JSON.stringify(a.caseInfo));
    assert.ok(b,'Missing original physical seed in extended run');
    const fingerprints=typeof a.fullPhysicalDeal==='string'&&
      a.fullPhysicalDeal===b.fullPhysicalDeal&&
      typeof a.originalSourceDeal==='string'&&
      a.originalSourceDeal===b.originalSourceDeal;
    const evolutionsStart=JSON.stringify(a.evolutionRoots??[])===
      JSON.stringify((b.evolutionRoots??[]).slice(0,(a.evolutionRoots??[]).length));
    pairs.push({caseInfo:a.caseInfo,fullPhysicalFingerprintsMatch:fingerprints,
      earlyMewEvolutionEventsPrefixMatch:evolutionsStart,
      baseStatus:a.status,extendedStatus:b.status,
      baseTwoMew:a.monitor?.dualBoard>0,
      extendedTwoMew:b.monitor?.dualBoard>0,
      baseCopyOpportunity:a.monitor?.actualOfferedMirror>0,
      extendedCopyOpportunity:b.monitor?.actualOfferedMirror>0,
      baseNativeError:a.status==='native-error',
      extendedNativeError:b.status==='native-error'});
  }
  return {schema:'agent19-paired-censor-extension-audit-v1',
    note:'Physical fingerprint and observed Mew roots are necessary comparability checks, not proof of identical complete root sequence or competitive strength',
    pairs,
    summary:{attempts:pairs.length,
      matchingPhysicalDeals:pairs.filter(p=>p.fullPhysicalFingerprintsMatch).length,
      earlyEvolutionPrefixesMatch:pairs.filter(p=>p.earlyMewEvolutionEventsPrefixMatch).length,
      200ActionTwoMew:pairs.filter(p=>p.baseTwoMew).length,
      500ActionTwoMew:pairs.filter(p=>p.extendedTwoMew).length,
      200ActionCounterMenus:pairs.filter(p=>p.baseCopyOpportunity).length,
      500ActionCounterMenus:pairs.filter(p=>p.extendedCopyOpportunity).length,
      qualifiedGames:0}};
}
module.exports={auditPairedCensor};
