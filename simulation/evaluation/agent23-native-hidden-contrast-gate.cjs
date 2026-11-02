'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {verifyNativeHistoricalControls}=
  require('./agent50-native-control-gate.cjs');

/**
 * Fail closed when a bounded concealed-world CI job is superficially green
 * despite never executing a genuine counterfactual, as happened during the
 * 1 November native fingerprint TDZ regression. Preserve all original rows
 * and their failures in the artifact; this gate only controls CI acceptance.
 *
 * @param {object} packet Original four-arm native Store audit JSON.
 * @param {{zone:'deck'|'prizes',swapSize:1|2}} expected Explicit workflow mode.
 * @returns {object} Authenticated developmental coverage counts.
 */
function verifyNativeBoundedContrast(packet,expected){
  verifyNativeHistoricalControls(packet);
  assert.ok(expected&&['deck','prizes'].includes(expected.zone));
  assert.ok(expected.swapSize===1||expected.swapSize===2);
  let attempted=0,successful=0,distinct=0,failed=0,reversals=0;
  for(const row of packet.rows){
    const scan=row.diagnostic?.nativeOpponentHiddenHandContrast;
    assert.ok(scan&&typeof scan==='object',
      'Missing native concealed-world report: '+row.trialId);
    assert.equal(scan.targetZone,expected.zone,row.trialId);
    assert.equal(scan.swapSize,expected.swapSize,row.trialId);
    for(const key of ['eligibleExchangePaths','attemptedExchangePaths',
      'successfulExchangePaths','failedExchangePaths','actionReversals',
      'eligibleDistinctOpponentHandCompositions',
      'testedDistinctOpponentHandCompositions',
      'successfulDistinctOpponentHandCompositions']){
      assert.ok(Number.isSafeInteger(scan[key])&&scan[key]>=0,
        row.trialId+': missing or invalid '+key);
    }
    assert.ok(Array.isArray(scan.cases),row.trialId+': missing case ledger');
    assert.equal(scan.attemptedExchangePaths,scan.cases.length,row.trialId);
    assert.equal(scan.attemptedExchangePaths,
      scan.successfulExchangePaths+scan.failedExchangePaths,row.trialId);
    assert.ok(scan.attemptedExchangePaths<=scan.eligibleExchangePaths,
      row.trialId+': attempted more paths than eligible');
    assert.ok(scan.testedDistinctOpponentHandCompositions<=
      scan.eligibleDistinctOpponentHandCompositions,
      row.trialId+': tested more distinct hands than eligible');
    assert.ok(scan.successfulDistinctOpponentHandCompositions<=
      scan.testedDistinctOpponentHandCompositions,
      row.trialId+': successful distinct hands exceed attempts');
    assert.ok(scan.actionReversals<=scan.successfulExchangePaths,
      row.trialId+': reversals exceed settled comparisons');
    assert.equal(scan.sourceRootUnchanged,true,row.trialId);
    assert.equal(scan.baselineReplayStable,true,row.trialId);
    assert.equal(scan.error,null,row.trialId);
    assert.equal(scan.failedExchangePaths,0,
      row.trialId+': bounded native playback failures');
    assert.equal(scan.contrastExecutable,
      scan.successfulExchangePaths>0,row.trialId);
    attempted+=scan.attemptedExchangePaths;
    successful+=scan.successfulExchangePaths;
    distinct+=scan.successfulDistinctOpponentHandCompositions;
    failed+=scan.failedExchangePaths;
    reversals+=scan.actionReversals;
  }
  assert.ok(successful>0,
    'No bounded native concealed-world comparison executed successfully');
  return {
    schema:'agent23-native-hidden-contrast-gate-v1',
    authenticatedHistoricalArms:packet.rows.length,
    zone:expected.zone,swapSize:expected.swapSize,
    attempted,successful,failed,
    successfulDistinctHandCompositions:distinct,
    actionReversals:reversals,
    competitiveGameQualified:false
  };
}

if(require.main===module){
  const file=process.argv[2];
  assert.ok(file,'Provide original native Store audit JSON file');
  const expected={
    zone:process.env.AGENT23_EXPECT_PRIZES==='true'?'prizes':'deck',
    swapSize:process.env.AGENT23_EXPECT_DOUBLE==='true'?2:1
  };
  const packet=JSON.parse(fs.readFileSync(file,'utf8'));
  console.log('AGENT23_NATIVE_CONTRAST_GATE',JSON.stringify(
    verifyNativeBoundedContrast(packet,expected)));
}

module.exports={verifyNativeBoundedContrast};
