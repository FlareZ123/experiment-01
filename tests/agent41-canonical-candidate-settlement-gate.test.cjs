'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {FROZEN_ROOT_SHA}=
  require('../simulation/evaluation/agent37-late14-public-replay.cjs');
const {verifyCanonicalCandidateSettlement}=
  require('../scripts/agent41-canonical-candidate-settlement-gate.cjs');

function fixture(){
  const ids=Object.keys(FROZEN_ROOT_SHA);
  const rows=ids.map(id=>{
    const isRank11=id.startsWith('11:');
    const isNewMoon=id.endsWith('new-moon-lockbreaker-v1');
    const attackList=isRank11&&isNewMoon?[
      {attackName:'Poltergeist',delegatedCopy:true,
        settledPromptChain:true,nextSourceRoot:{action:'PlayCardAction'}},
      {attackName:'Poltergeist',delegatedCopy:true,
        settledPromptChain:true,nextSourceRoot:null}
    ]:[];
    return {
      trial:{id,seed:321},
      rootActionLedgerSha256:FROZEN_ROOT_SHA[id],
      sourceActuallyFirst:false,
      candidateSeat:isRank11?1:0,
      actionCount:!isRank11&&isNewMoon?260:90,
      attackDeclarations:{candidate:attackList.length},
      candidateAttackSettlement:{
        declarations:attackList.length,
        settled:attackList.length,
        withImmediateSourceReturn:attackList.filter(x=>x.nextSourceRoot).length,
        attacks:attackList,
        qualifiedForCompetitiveInference:false
      },
      endReason:isNewMoon&&!isRank11?'action-limit':'finished'
    };
  });
  return {
    canonical:{rows,competitiveQualifiedGames:0},
    observed:{
      observed:rows.map(row=>({
        trialLabel:'same-game-'+row.trial.id,
        seed:row.trial.seed,candidateSeat:row.candidateSeat,
        candidateAttackSettlement:structuredClone(row.candidateAttackSettlement)
      })),
      originalRootSha256:rows.map(row=>({
        id:row.trial.id,rootActionLedgerSha256:row.rootActionLedgerSha256
      }))
    }
  };
}

test('four historical arms match and all New Moon copied effects are preserved',()=>{
  const {canonical,observed}=fixture();
  const result=verifyCanonicalCandidateSettlement(canonical,observed);
  assert.equal(result.checkedArms,4);
  assert.equal(result.passed,4);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.prospectiveBilateralTrialsAuthorized,false);
  assert.equal(result.report.find(x=>
    x.id==='11:2:B:new-moon-lockbreaker-v1').promptSettled,2);
});

test('cross-observer disagreement or altered historical roots veto the gate',()=>{
  const {canonical,observed}=fixture();
  observed.observed.find(x=>
    x.trialLabel.endsWith('11:2:B:new-moon-lockbreaker-v1'))
    .candidateAttackSettlement.attacks.pop();
  assert.throws(()=>
    verifyCanonicalCandidateSettlement(canonical,observed),
  /differs from independent observer/);
  const second=fixture();
  second.canonical.rows[0].rootActionLedgerSha256='unexpected';
  assert.throws(()=>
    verifyCanonicalCandidateSettlement(second.canonical,second.observed),
  /original selected gameplay changed/);
});
