'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const {
  VERSION: CERTIFICATE_VERSION,
  PHASES,certifyCohort
} = require('./agent42-source-policy-causal-certificate.cjs');

const VERSION = 'agent42-agent8-original-source-v2-archive-causal-reduction-v1';
const NATIVE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const RAW_ARTIFACT_ID = 13643482131;
const RAW_SHA256 = '41b86f970c9d108542ec29bb1a6cc8516fce2cc36b995fd0146a8d885dfe6fa1';

/** @param {object} result Full 32-attempt original native runner archive. */
function reduceAgent8Archive(result) {
  assert.equal(result.version,
    'agent8-source-search-quickball-mail-adversarial-2x2-prospective-v2');
  assert.equal(result.enginePin,NATIVE_PIN);
  assert.equal(result.nativeRootLimit,260);
  assert.equal(result.registeredGroups,8);
  assert.equal(result.nativeAttempts,32);
  assert.equal(result.status,'PHYSICAL-MATCHED-DEVELOPMENT-ONLY');
  assert.equal(result.qualifiedPaperGames,0);
  const rows={};
  for (const phase of PHASES) {
    const native=result.rawNativeRows?.[phase];
    const summaries=result.phaseSummaries?.[phase];
    assert.ok(Array.isArray(native)&&native.length===8);
    assert.ok(Array.isArray(summaries)&&summaries.length===8);
    const byId=new Map(summaries.map(row=>[row.id,row]));
    assert.equal(byId.size,8);
    rows[phase]=native.map(original=>{
      const s=byId.get(original.trial?.id);
      assert.ok(s,'Source summary missing '+original.trial?.id);
      assert.equal(original.trial.seed,s.seed);
      assert.equal(original.trial.rank,s.rank);
      assert.equal(original.sourceDealFingerprint,s.sourceDealFingerprint);
      assert.equal(original.fullPhysicalDealFingerprint,s.fullPhysicalDealFingerprint);
      assert.equal(original.finished===true,s.finished===true);
      assert.equal(original.winner??null,s.winner??null);
      assert.ok(['native-terminal','root-cap','engine-error'].includes(s.status));
      if(s.status==='root-cap'){
        assert.equal(original.finished,false);
        assert.equal(original.actionCount,result.nativeRootLimit);
      }
      return {...original,status:s.status};
    });
  }
  const trials=rows.P0S0.map(row=>row.trial);
  const cert=certifyCohort(rows,trials);
  assert.equal(cert.totals.physicallyMatched,8);
  assert.equal(cert.totals.qualifiedPaperGames,0);
  const compact=cert.groups.map(g=>({
    id:g.trialId,sourceSeat:g.sourceSeat,candidateSeat:g.candidateSeat,
    physicalPairMatched:g.physicalGate.admitted,
    withoutPivot:decision(g.withoutPivot),
    withPivot:decision(g.withPivot),
    dispositions:Object.fromEntries(PHASES.map(p=>[p,g.statuses[p].status])),
    fourNativeTerminals:g.fourTerminals,
    sourceWinnerEffects:g.sourceWinnerEffects,
    ownerPaymentCertified:g.ownerPaymentCertified,
    effectiveInnermostChooserSeatIsolation:g.effectiveInnermostChooserSeatIsolation
  }));
  const counts={...cert.totals,
    fullyTerminalFourArmGroups:compact.filter(x=>x.fourNativeTerminals).length,
    sourceChangesWithSameTurnSettledAttack:compact.reduce((n,g)=>n+
      Number(g.withoutPivot.status==='SOURCE_ATTACK_DEFERRED_SAME_TURN')+
      Number(g.withPivot.status==='SOURCE_ATTACK_DEFERRED_SAME_TURN'),0),
    sourceChangesWithoutConfirmedSameTurnAttack:compact.reduce((n,g)=>n+
      Number(g.withoutPivot.status==='SOURCE_ATTACK_NOT_SETTLED_SAME_TURN')+
      Number(g.withPivot.status==='SOURCE_ATTACK_NOT_SETTLED_SAME_TURN'),0),
    allFourNativeWinnerFlips:compact.filter(g=>
      g.sourceWinnerEffects?.withoutPivot===true||
      g.sourceWinnerEffects?.withPivot===true).length,
    nativeErrors:PHASES.reduce((n,p)=>n+rows[p].filter(x=>x.status==='engine-error').length,0),
    rootCaps:PHASES.reduce((n,p)=>n+rows[p].filter(x=>x.status==='root-cap').length,0),
    ownerPaymentCertifiedGroups:compact.filter(x=>x.ownerPaymentCertified).length,
    fieldWinRate:null,qualifiedPaperGames:0};
  return {schema:VERSION,enginePin:NATIVE_PIN,archiveArtifactId:RAW_ARTIFACT_ID,
    rawUncompressedSha256:RAW_SHA256,certificateVersion:CERTIFICATE_VERSION,
    evidenceClass:'read-only reduction of frozen retrospective native 32-arm data',
    summary:counts,groups:compact,
    note:'Store-root divergence and same-turn attacks are developmental evidence. Effective innermost seat isolation, complete paper payment, opponent competence, clock and competitive win rate remain unproven.'};
}

/** @param {object} change One original-source factor comparison. */
function decision(change){
  const first=change.firstDifference;
  return {status:change.status,
    firstChangedOrdinal:first?.challenger?.actionOrdinal??null,
    firstChangedTurn:first?.challenger?.turnBefore??null,
    baselineAction:first?.control?.action??null,
    baselineCardOrAttack:first?.control?.attack??first?.control?.card??null,
    treatedAction:first?.challenger?.action??null,
    treatedCardOrAttack:first?.challenger?.attack??first?.challenger?.card??null,
    actionReceipt:change.actionReceipt,
    baselineAttackSettlement:change.displacedAttack?.settlement??null,
    sameTurnSameAttackSettled:change.followthrough?.sameTurnSameAttackSettled??null,
    followthroughAttackOrdinal:change.followthrough?.settledAttackOrdinal??null,
    decisionQuality:change.decisionQuality??null};
}

/** Replay an immutable artifact without starting a native game. */
function reduceFile(file){
  const data=fs.readFileSync(file);
  const sha=createHash('sha256').update(data).digest('hex');
  assert.equal(sha,RAW_SHA256,'Unexpected or changed original native archive');
  return reduceAgent8Archive(JSON.parse(data.toString('utf8')));
}

if(require.main===module){
  const file=process.argv[2];
  assert.ok(file,'Provide the extracted historical native archive path');
  process.stdout.write(JSON.stringify(reduceFile(file),null,2)+'\n');
}
module.exports={VERSION,RAW_ARTIFACT_ID,RAW_SHA256,NATIVE_PIN,
  reduceAgent8Archive,decision,reduceFile};
