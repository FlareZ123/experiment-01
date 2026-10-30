'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {pairPreregisteredSpecial} =
  require('../scripts/agent41-prereg32-bilateral-special-census.cjs');

function pair() {
  const control=[], treatment=[];
  for(let i=0;i<32;i++){
    const candidateSlot=i%2===0?'A':'B';
    const sourceSeat=candidateSlot==='A'?1:0;
    const trial={id:'original-'+i,seed:1000+i,rank:i<16?6:11,
      candidateSlot,candidateId:i%4<2?'champion-reference':
        'new-moon-lockbreaker-v1'};
    const base={trial,sourceSeat,qualifiesForCompetitiveInference:false,
      fullPhysicalDealFingerprint:String(i).padStart(64,'0'),
      sourceDealFingerprint:'source-'+i,
      verifiedFirstTurn:true,actualStarterSeat:sourceSeat,
      finished:true,winner:sourceSeat,actionCount:20,
      rootActionLedgerSha256:'root-0',
      sourceAttackSettlement:{settled:0}};
    control.push(base);
    treatment.push({...base,rootActionLedgerSha256:'root-1',
      sourceAttackSettlement:{settled:1},
      actorOnlyDecisionCoverage:{
        detailedComponentAudits:{root:{
          acceptedActorRoots:1,typedIntentCounts:{'attach-special-energy':1},
          nativeRootAcceptances:[{seat:sourceSeat,
            kind:'attach-special-energy',accepted:true,
            nativePhysicalEffect:'confirmed-public-effect'}]
        }}
      }});
  }
  const pack=(mode,rows)=>({mode,registeredAttempts:32,
    registrationPredatesPolicy:true,registrationBlob:'frozen',
    registrationPath:'registered',competitiveQualifiedGames:0,
    result:{attempted:32,rows,enginePin:'pinned'}});
  return [pack('control',control),pack('both-special',treatment)];
}

test('32 original matched starts and 32 sample-confirmed source attachments',()=>{
  const x=pairPreregisteredSpecial(...pair());
  assert.equal(x.totalNativeArms,64);
  assert.equal(x.fullPhysicalMatches,32);
  assert.equal(x.sourceSampledAccepted,32);
  assert.equal(x.sourceSampledConfirmed,32);
  assert.equal(x.sourceAttackChanges,32);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('engine errors and absent native evidence retained in denominator',()=>{
  const [c,t]=pair();
  delete t.result.rows[3].sourceSeat;
  t.result.rows[3]={...t.result.rows[3],status:'engine-error',
    fullPhysicalDealFingerprint:null,sourceAttackSettlement:undefined,
    actorOnlyDecisionCoverage:null};
  t.result.rows[6].fullPhysicalDealFingerprint='f'.repeat(64);
  const x=pairPreregisteredSpecial(c,t);
  assert.equal(x.attemptedPerPolicy,32);
  assert.equal(x.fullPhysicalEvidenceMissing,1);
  assert.equal(x.physicalMismatches,1);
  assert.equal(x.fullPhysicalMatches,30);
  assert.equal(x.pairs[3].after.status,'engine-error');
  assert.equal(x.pairs[3].rootedSpecial.auditAvailable,false);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('all original registrations must be paired exactly by seed and slot',()=>{
  const [c,t]=pair();
  t.result.rows[1].trial={...t.result.rows[1].trial,seed:999999};
  assert.throws(()=>pairPreregisteredSpecial(c,t));
  const [a,b]=pair();
  b.result.rows[1].trial={...b.result.rows[1].trial,
    id:b.result.rows[0].trial.id};
  assert.throws(()=>pairPreregisteredSpecial(a,b));
});
