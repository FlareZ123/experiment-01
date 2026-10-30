'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {auditBilateralEnergy} =
  require('../scripts/agent41-bilateral-special-energy-native-audit.cjs');

function pair(profile = true) {
  const c=[],t=[];
  for (let i = 0; i < 4; i++) {
    const trial={id:String(i),seed:i+1,candidateSlot:i%2?'B':'A'};
    const base={trial,sourceDealFingerprint:'sha'+i,verifiedFirstTurn:true,
      actualStarterSeat:i%2,fullPhysicalDealFingerprint:String(i).padStart(64,'0'),
      rootActionLedgerSha256:'control'+i,qualifiesForCompetitiveInference:false};
    c.push(base);
    t.push({...base,rootActionLedgerSha256:'treated'+i,
      ...(profile?{bilateralSpecialEnergyProfile:{mode:'both',sharedPolicy:true,
        ownerSeat:null,enabled:true}}:{}),actorOnlyDecisionCoverage:{
          detailedComponentAudits:{root:{acceptedActorRoots:67,
            typedIntentCounts:{'attach-special-energy':1},
            nativeRootAcceptances:[{seat:trial.candidateSlot==='A'?1:0,
              kind:'attach-special-energy',accepted:true,
              nativePhysicalEffect:'confirmed-public-effect'}]}}
        }});
  }
  return [{attempted:4,rows:c,sourceFirstRetrospective:true,
    competitiveQualifiedGames:0},
    {attempted:4,rows:t,sourceFirstRetrospective:true,
      competitiveQualifiedGames:0}];
}

test('all same-deal source-first trials retained, source seats and confirmed roots attributed',()=>{
  const a=auditBilateralEnergy(...pair());
  assert.equal(a.totalNativeArms,8);
  assert.equal(a.matchedStarts,4);
  assert.equal(a.matchedFullPhysicalStarts,4);
  assert.equal(a.sourceSampledAccepted,4);
  assert.equal(a.candidateSampledAccepted,0);
  assert.equal(a.competitiveQualifiedGames,0);
  assert.ok(a.rows.every(x => x.rootAuditSampleTruncated));
});

test('errors, absent receipts and changed source deals are retained',()=>{
  const [c,t]=pair();
  t.rows[0]={...t.rows[0],status:'engine-error',actorOnlyDecisionCoverage:null};
  t.rows[1]={...t.rows[1],sourceDealFingerprint:'wrong'};
  const a=auditBilateralEnergy(c,t);
  assert.equal(a.totalNativeArms,8);
  assert.equal(a.matchedStarts,3);
  assert.equal(a.rows[0].rootAuditPresent,false);
  assert.equal(a.rows[0].treatmentStatus,'engine-error');
});

test('rejects invalid sham both-seat provenance and lost attempts',()=>{
  const [c,t]=pair();
  t.rows[0].bilateralSpecialEnergyProfile.ownerSeat=0;
  assert.throws(()=>auditBilateralEnergy(c,t));
  const [c2,t2]=pair();t2.rows.pop();
  assert.throws(()=>auditBilateralEnergy(c2,t2));
});
