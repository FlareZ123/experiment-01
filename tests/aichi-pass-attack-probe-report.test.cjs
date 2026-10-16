'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {summarizePassAttackProbes} =
  require('../scripts/aichi-pass-attack-probe-report.cjs');

/** @returns {object} Minimal explicit noncompetitive archive. */
function archive() {
  return {
    planDigest:'source-plan-test',
    strengthClaimPermitted:false,
    policyFlags:{captureAttackPassProbes:true},
    records:[
      {
        trialId:'pilot:2:0:hood-shield-v1:A',
        candidateId:'hood-shield-v1',
        candidateEngineSlot:'A',
        opponentRank:2,status:'completed-engine-game',
        traceSummary:{chronologicalActionTrace:[
          {
            action:'PassTurnAction',actionOrdinal:1,turnBefore:2,playerSlot:0,
            attackPassProbe:{activePokemon:'Clefairy',
              tested:[{name:'Moon Power',source:'printed',engineAcceptedAnnouncement:false}]}
          },
          {
            action:'PassTurnAction',actionOrdinal:2,turnBefore:3,playerSlot:1,
            attackPassProbe:{activePokemon:'Bunnelby',
              tested:[{name:'Evolution',source:'attached-tool',engineAcceptedAnnouncement:true}]}
          },
          {action:'PassTurnAction',actionOrdinal:3,turnBefore:4,playerSlot:0},
          {
            action:'PassTurnAction',actionOrdinal:4,turnBefore:5,playerSlot:0,
            attackPassProbe:{activePokemon:'Shadow Rider Calyrex VMAX',
              tested:[{name:'Max Geist',source:'printed',engineAcceptedAnnouncement:true}]}
          },
          {action:'AttackAction',playerSlot:1,actionOrdinal:5}
        ]}
      },
      {
        trialId:'pilot:2:0:hood-shield-v1:B',
        candidateId:'hood-shield-v1',
        candidateEngineSlot:'B',
        opponentRank:2,status:'action-limited',
        traceSummary:{chronologicalActionTrace:[
          {action:'PassTurnAction',playerSlot:1,actionOrdinal:1,
            attackPassProbe:{activePokemon:'Latias ex',auditError:'test error'}},
          {action:'PassTurnAction',playerSlot:0,actionOrdinal:2}
        ]}
      }
    ]
  };
}

test('separates actual candidate/opponent seats and accepted engine announcements', () => {
  const x=summarizePassAttackProbes(archive());
  assert.equal(x.winRateEvidence,false);
  assert.equal(x.rankingPermitted,false);
  assert.equal(x.collectionRequested,true);
  assert.equal(x.records.length,2);

  const a=x.records[0];
  assert.equal(a.candidateSeat,0);
  assert.equal(a.candidate.passesObserved,3);
  assert.equal(a.candidate.probedPasses,2);
  assert.equal(a.candidate.unprobedPasses,1);
  assert.equal(a.candidate.acceptedAlternativePasses,1);
  assert.equal(a.candidate.rejectedOrNoCandidatePasses,1);
  assert.deepEqual(a.candidate.alternatives[0].acceptedAttacks,
    [{name:'Max Geist',source:'printed'}]);
  assert.equal(a.opponent.passesObserved,1);
  assert.equal(a.opponent.acceptedAlternativePasses,1);
  assert.equal(a.opponent.alternatives[0].acceptedAttacks[0].name,'Evolution');

  const b=x.records[1];
  assert.equal(b.candidateSeat,1);
  assert.equal(b.candidate.probeErrors,1);
  assert.equal(b.candidate.acceptedAlternativePasses,0);
  assert.equal(b.opponent.probedPasses,0);
});

test('missing action trace reports unavailable rather than zero observations', () => {
  const data=archive();
  data.records[0].traceSummary=null;
  const summary=summarizePassAttackProbes(data);
  assert.equal(summary.records[0].candidate.passesObserved,null);
  assert.equal(summary.records[0].opponent.traceStatus,'missing-meaningful-action-trace');
});

test('rejects strength-qualified archives and invalid physical slots', () => {
  const data=archive();
  data.strengthClaimPermitted=true;
  assert.throws(()=>summarizePassAttackProbes(data),/noncompetitive/);
  data.strengthClaimPermitted=false;
  data.records[0].candidateEngineSlot='C';
  assert.throws(()=>summarizePassAttackProbes(data),/physical slot/);
});

test('a pass with no successful engine announcements stays distinct from unprobed',()=>{
  const data=archive();
  data.records[0].traceSummary.chronologicalActionTrace=[
    {action:'PassTurnAction',playerSlot:0,
      attackPassProbe:{activePokemon:'Clefairy',tested:[]}},
    {action:'PassTurnAction',playerSlot:0}
  ];
  const c=summarizePassAttackProbes(data).records[0].candidate;
  assert.equal(c.passesObserved,2);
  assert.equal(c.probedPasses,1);
  assert.equal(c.rejectedOrNoCandidatePasses,1);
  assert.equal(c.unprobedPasses,1);
  assert.equal(c.acceptedAlternativePasses,0);
});
