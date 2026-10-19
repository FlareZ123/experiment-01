'use strict';

const assert=require('node:assert/strict');
const headless=require('../twinleaf/headless.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');

const FROZEN_ROOT_SHA=Object.freeze({
  '6:0:A:champion-reference':'df894ca4304355b937b515cc559dbacbf6c803a2c0b0fc23f47260889f900dbe',
  '6:0:A:new-moon-lockbreaker-v1':'87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4',
  '11:2:B:champion-reference':'dd2bfba15a260541405501c6f09b03e17d9140c908a8243132e5122e294c97b8',
  '11:2:B:new-moon-lockbreaker-v1':'6dab28f91a196a7cc63c18bbfa86f552dbe594c2d33aeb762727756221517618'
});

/**
 * Capture detached, retrospective true-Store attack closure data by wrapping
 * the exact canonical four-arm historical development runner. The extra
 * observer is outside the candidate and source decision policies.
 * @returns {object} Archived unqualified replay with fatal same-root vetoes.
 */
function runObservedLate14(){
  const original=headless.runMatch;
  const observed=[];
  assert.equal(typeof original,'function');
  function capture(request){
    const seat=request.capturePerfectionPassProbeSeat;
    assert.ok(seat===0||seat===1);
    const game=original({...request,capturePoltergeistEffectTrace:true});
    observed.push({
      trialLabel:request.label,
      seed:request.seed,
      candidateSeat:seat,
      candidateAttackSettlement:candidateAttackSettlement(game,seat)
    });
    return game;
  }
  headless.runMatch=capture;
  let development;
  try{
    development=runDevelopment({
      compressorPayload:true,
      lateCompressorPayload:true
    });
  }finally{
    assert.equal(headless.runMatch,capture);
    headless.runMatch=original;
  }
  assert.equal(headless.runMatch,original,'Read-only capture did not restore');
  assert.equal(development.rows.length,4);
  assert.equal(observed.length,4);
  for(let i=0;i<4;i++){
    const row=development.rows[i];
    assert.equal(row.error,undefined,'Real Store game failed');
    assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA[row.trial.id],
      'Retrospective policy or physical game root changed under observer');
    assert.equal(observed[i].seed,row.trial.seed);
    assert.equal(observed[i].candidateSeat,row.candidateSeat);
    assert.ok(observed[i].trialLabel.endsWith(row.trial.id));
    assert.equal(observed[i].candidateAttackSettlement.declarations,
      row.attackDeclarations.candidate);
  }
  return {
    schema:'agent37-late14-canonical-retrospective-postprompt-public-v1',
    originalCanonicalDevelopmentSchema:development.schema,
    originalRootSha256:development.rows.map(row=>({
      id:row.trial.id,rootActionLedgerSha256:row.rootActionLedgerSha256,
      sourceDealFingerprint:row.sourceDealFingerprint,
      actualStarterSeat:row.actualStarterSeat,
      winner:row.winner,finished:row.finished,actionCount:row.actionCount
    })),
    observed,
    competitiveQualifiedGames:0,
    status:'retrospective mechanics only; no printed-card fidelity, opponent policy or match-clock certification'
  };
}

if(require.main===module){
  const r=runObservedLate14();
  for(const row of r.observed){
    const audit=row.candidateAttackSettlement;
    process.stderr.write('RETROSPECTIVE_CANDIDATE_SETTLEMENT_ONLY '+
      JSON.stringify({label:row.trialLabel,
        declared:audit.declarations,settled:audit.settled,
        sourceReturns:audit.withImmediateSourceReturn,
        printedBases:audit.withRetrospectivePoltergeistBase})+'\n');
  }
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
}
module.exports={runObservedLate14,FROZEN_ROOT_SHA};
