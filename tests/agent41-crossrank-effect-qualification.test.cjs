'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditPartition,classifyRow} = require('../scripts/agent41-crossrank-effect-qualification.cjs');

/** @returns {object} */
function fixture() {
  const rows=[];
  for(const rank of [6,11]) for(let repeat=0;repeat<3;repeat++) {
    for(const candidateSlot of ['A','B']) {
      for(const candidateId of ['champion-reference','new-moon-lockbreaker-v1']) {
        const id=[rank,repeat,candidateSlot,candidateId].join(':');
        const failure=id==='6:2:A:champion-reference';
        const index=rows.length;
        const opportunity=[0,7,9,16].includes(index);
        rows.push({id,rank,repeat,candidateSlot,candidateId,
          seed:5000+rank*100+repeat*2+(candidateSlot==='B'?1:0),
          qualifiedCompetitiveGame:false,
          status:failure?'engine-error':index<14?'engine-terminal':
            'action-cap-or-incomplete',
          verifiedFirstTurn:!failure,
          sourceActuallyFirst:repeat!==1,
          sourceFirstRecordedOwnHandSha256:failure?null:
            'hand-'+rank+'-'+repeat+'-'+candidateSlot,
          sourceTriggerTurn:opportunity?3:null,
          responseDecisions:opportunity?[{turn:4}]:[],
          declaredAttackProtocol:'real-store-attack-log-declarations-v1',
          sourceAttackDeclarations:1,candidateAttackDeclarations:1,
          sourcePolicyAudit:rank===6?{
            turn2:{started:opportunity,completed:opportunity&&index===0,
              abortReason:opportunity&&index!==0?'no-payment':null},
            turn3:{started:false,completed:false,abortReason:null}
          }:{opportunityTurn:opportunity?1:null,
            completed:opportunity,nextTurnLockWitness:{equippedGarbodor:opportunity},
            aborted:null}
        });
      }
    }
  }
  return {
    schema:'agent41-crossrank-bilateral-exploratory-observations-v1',
    partition:0,registeredTotal:48,partitionScheduled:24,
    competitiveQualifiedGames:0,competitiveWinRateCertified:false,
    researchRevision:'fixture',
    seedProtocol:'aichi-decorrelated-slots-v3',
    preregistration:'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    statusCounts:{'engine-terminal':13,'action-cap-or-incomplete':10,'engine-error':1},
    sourceOpportunityCounts:{rank6:3,rank11:1},
    pairedSourceHandAgreement:11,rows
  };
}

test('complete 24-arm denominator yields audit with zero qualified results',()=>{
  const audit=auditPartition(fixture());
  assert.equal(audit.observedArms,24);
  assert.equal(audit.terminalOnlyInEngine,13);
  assert.equal(audit.incomplete,10);
  assert.equal(audit.errors,1);
  assert.equal(audit.sourceSelectedOpportunities,4);
  assert.equal(audit.byRank[6].opportunities,3);
  assert.equal(audit.byRank[11].opportunities,1);
  assert.equal(audit.pairs.length,12);
  assert.equal(audit.pairs.filter(x=>x.comparableOnInitialSourceHandAndRealStarter).length,11);
  assert.equal(audit.qualificationVerdict,'NO-COMPETITIVE-WIN-RATE-EVIDENCE');
  assert.equal(audit.sourceAppliedDamageVerified,0);
  assert.equal(audit.sourceAppliedKOVerified,0);
});

test('raw attack declaration is never upgraded to damage/KO',()=>{
  const f=fixture();
  const row=f.rows[0];row.candidateAttackDeclarations=100;
  const audited=classifyRow(row);
  assert.equal(audited.sourceLineSelectorCompleted,true);
  assert.equal(audited.candidateDeclarationCount,100);
  assert.equal(audited.sourceAppliedDamageObserved,false);
  assert.equal(audited.sourceAppliedKOObserved,false);
  assert.equal(audited.competitiveWinCertified,false);
});

test('post-trigger response is only a recorded decision, not proven consequence',()=>{
  const f=fixture();
  f.rows[0].responseDecisions=[{turn:3}];
  assert.equal(classifyRow(f.rows[0]).sourceActionFollowedByCandidateDecision,false);
  f.rows[0].responseDecisions=[{turn:4}];
  assert.equal(classifyRow(f.rows[0]).sourceActionFollowedByCandidateDecision,true);
  f.rows[0].declaredAttackProtocol=null;
  assert.equal(classifyRow(f.rows[0]).sourceActionFollowedByCandidateDecision,false);
});

test('error arm blocks pairability even if the source hand appears equal',()=>{
  const f=fixture();
  const a=auditPartition(f);
  assert.equal(a.pairs.find(p=>p.key==='6:2:A').containsDispatchError,true);
  assert.equal(a.pairs.find(p=>p.key==='6:2:A').comparableOnInitialSourceHandAndRealStarter,false);
});

test('a genuine source-hand or real-start mismatch blocks pairability',()=>{
  const f=fixture();
  const found=f.rows.find(row=>row.id==='6:0:A:new-moon-lockbreaker-v1');
  found.sourceActuallyFirst=!found.sourceActuallyFirst;
  f.pairedSourceHandAgreement=10;
  const a=auditPartition(f);
  assert.equal(a.pairs.filter(p=>p.comparableOnInitialSourceHandAndRealStarter).length,10);
});

test('missing, duplicated and unregistered arm data fail closed',()=>{
  const missing=fixture();missing.rows.pop();
  assert.throws(()=>auditPartition(missing));
  const repeated=fixture();repeated.rows[1]=repeated.rows[0];
  assert.throws(()=>auditPartition(repeated),/Repeated registered arm/);
  const lying=fixture();lying.competitiveQualifiedGames=1;
  assert.throws(()=>auditPartition(lying));
  const embellished=fixture();embellished.rows[0].qualifiedCompetitiveGame=true;
  assert.throws(()=>auditPartition(embellished));
});

test('summary inconsistency triggers assertion instead of silent renormalization',()=>{
  const f=fixture();f.statusCounts['engine-terminal']=14;
  assert.throws(()=>auditPartition(f));
});

test('same-size off-registration rank/repeat partition fails closed',()=>{
  const f=fixture();
  for (const r of f.rows.filter(x=>x.rank===6&&x.repeat===0)) {
    r.repeat=6; r.id=[r.rank,r.repeat,r.candidateSlot,r.candidateId].join(':');
  }
  assert.throws(()=>auditPartition(f),/Missing\/extra preregistered/);
});
