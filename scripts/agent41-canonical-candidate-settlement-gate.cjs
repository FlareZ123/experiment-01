'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {FROZEN_ROOT_SHA}=
  require('../simulation/evaluation/agent37-late14-public-replay.cjs');

/**
 * Reconcile the full candidate consequence packet now exported directly by
 * the canonical bilateral runner against the independent read-only observer.
 * All comparisons refer to four previously selected development arms only.
 * @param {object} canonical
 * @param {object} independentlyObserved
 * @returns {object} A bounded, noncompetitive verification report.
 */
function verifyCanonicalCandidateSettlement(canonical,independentlyObserved){
  assert.equal(canonical.rows.length,4);
  assert.equal(independentlyObserved.observed.length,4);
  assert.equal(independentlyObserved.originalRootSha256.length,4);
  assert.equal(canonical.competitiveQualifiedGames,0);
  const report=[];
  for(let i=0;i<4;i++){
    const row=canonical.rows[i];
    const separate=independentlyObserved.observed[i];
    const provenance=independentlyObserved.originalRootSha256[i];
    const id=row.trial.id;
    assert.equal(row.error,undefined,id+' actual Store failed');
    assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA[id],
      id+' original selected gameplay changed');
    assert.equal(provenance.id,id);
    assert.equal(provenance.rootActionLedgerSha256,row.rootActionLedgerSha256);
    assert.equal(separate.seed,row.trial.seed);
    assert.equal(separate.candidateSeat,row.candidateSeat);
    assert.ok(separate.trialLabel.endsWith(id));
    assert.deepEqual(row.candidateAttackSettlement,
      separate.candidateAttackSettlement,
      id+' canonical settlement differs from independent observer');
    const packet=row.candidateAttackSettlement;
    assert.equal(packet.declarations,row.attackDeclarations.candidate);
    assert.equal(packet.attacks.length,packet.declarations);
    assert.equal(packet.qualifiedForCompetitiveInference,false);
    report.push({
      id,rootSha256:row.rootActionLedgerSha256,
      candidateDeclarations:packet.declarations,
      promptSettled:packet.settled,
      nextSourceReplies:packet.withImmediateSourceReturn,
      endReason:row.endReason,
      sourceActuallyFirst:row.sourceActuallyFirst
    });
  }
  const rank11=canonical.rows.find(row=>
    row.trial.id==='11:2:B:new-moon-lockbreaker-v1');
  assert.ok(rank11);
  const poltergeist=rank11.candidateAttackSettlement.attacks.filter(row=>
    row.attackName==='Poltergeist' && row.delegatedCopy===true);
  assert.equal(poltergeist.length,2);
  assert.ok(poltergeist.every(row=>row.settledPromptChain));
  assert.equal(poltergeist.filter(row=>row.nextSourceRoot).length,1);
  assert.equal(rank11.sourceActuallyFirst,false,
    'Historical Poltergeist success did not face a source-first opener');
  const rank6=canonical.rows.find(row=>
    row.trial.id==='6:0:A:new-moon-lockbreaker-v1');
  assert.ok(rank6);
  assert.equal(rank6.actionCount,260);
  assert.equal(rank6.candidateAttackSettlement.declarations,0);
  return {
    schema:'agent41-canonical-versus-independent-settlement-gate-v1',
    checkedArms:4,passed:4,competitiveQualifiedGames:0,
    paperRulesAndClockCertified:false,
    hiddenOpponentInformationParityCertified:false,
    prospectiveBilateralTrialsAuthorized:false,
    report
  };
}

if(require.main===module){
  const [a,b]=process.argv.slice(2);
  assert.ok(a&&b,'Provide canonical and independently observed JSON paths');
  const result=verifyCanonicalCandidateSettlement(
    JSON.parse(fs.readFileSync(a,'utf8')),
    JSON.parse(fs.readFileSync(b,'utf8')));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={verifyCanonicalCandidateSettlement};
