'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {auditDouble}=require('./agent5-rank6-double-duskull-native-audit.cjs');
const SOURCE='6:retrospective-sourcefirst:0:B:new-moon-lockbreaker-v1';
const EXPECTED_DOUBLE='c453169eb6116e273c0556f71e8c49046c1dfaaab80316f13cefa4a1debe21f5';

/**
 * Preserve all three earlier replay identities while testing a read-only
 * source owner hand observer for post-T33 trapped Thorns.
 * @param {object} untouched
 * @param {object} single
 * @param {object} double
 * @param {object} observed
 * @returns {object}
 */
function audit(untouched,single,double,observed){
  const previous=auditDouble(untouched,single,double);
  assert.equal(previous.doubleT15T17.nativeRootSha256,EXPECTED_DOUBLE);
  assert.equal(observed.rows?.length,4);
  const r=observed.rows.find(x=>x.trial?.id===SOURCE);
  assert.ok(r);
  assert.equal(r.rootActionLedgerSha256,EXPECTED_DOUBLE,
    'Source observer changed accepted Store decision transcript');
  assert.equal(r.sourceDealFingerprint,previous.sourceDealSha256);
  assert.equal(r.endReason,'action-limit');
  for(const old of double.rows){
    const next=observed.rows.find(x=>x.trial?.id===old.trial?.id);
    assert.ok(next);
    assert.equal(next.sourceDealFingerprint,old.sourceDealFingerprint);
    assert.equal(next.rootActionLedgerSha256,old.rootActionLedgerSha256);
  }
  const meta=observed.registeredLowPrizePromotion;
  assert.equal(meta?.secondTurn,true);
  assert.equal(meta?.sourceMobilityObserver,true);
  assert.equal(meta?.sourceMobilityObservations?.length,1);
  const obs=meta.sourceMobilityObservations[0];
  assert.equal(obs.sourceSeat,0);
  assert.equal(obs.changedActions,0);
  assert.ok(obs.observedTurns.length>0);
  assert.ok(obs.observedTurns.every(x=>x.turn>=35&&x.turn<=57));
  const positives=obs.observedTurns.filter(x=>x.sourceHeldGuzma.length>0&&
    x.sourceSupporterPlayedTurn===0&&
    !x.sourceSupporterLocked&&x.opponentBenchCount>0);
  const pseudoRecovery=obs.observedTurns.filter(x=>
    x.sourceHeldVsSeeker.length>0&&
    x.sourceDiscardGuzma.length>0&&
    x.sourceSupporterPlayedTurn===0&&
    !x.sourceSupporterLocked&&x.opponentBenchCount>0);
  return {
    schema:'agent5-rank6-source-owner-mobility-opportunity-v1',
    registration:'results/aichi-2026/registrations/agent5-rank6-source-mobility-observer-20261022.md',
    unchangedCompleteGameProof:{
      sourceDeal:previous.sourceDealSha256,
      nativeRootDigest:EXPECTED_DOUBLE,
      allFourCompared:true
    },
    sourceOnlyOwnerObservations:obs,
    literalHeldGuzmaCandidateTurns:positives.map(x=>x.turn),
    heldVsSeekerAndDiscardedGuzmaTurns:pseudoRecovery.map(x=>x.turn),
    inference:'Held hand and public board are owner-observed opportunities, not validated native Guzma switches or paper-equivalent game wins',
    competitiveQualifiedGames:0,winRateCertified:false
  };
}

if(require.main===module){
  const [a,b,c,d]=process.argv.slice(2).map(file=>
    JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write(JSON.stringify(audit(a,b,c,d),null,2)+'\n');
}

module.exports={EXPECTED_DOUBLE,audit};
