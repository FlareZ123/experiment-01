'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {contrast,SCHEMA}=
  require('../simulation/evaluation/agent25-original-32-lillie-contrast.cjs');

function make(treated=false){
  const rows=Array.from({length:32},(_,i)=>{
    const accepted=treated&&i===3;
    const seq=[
      {actionOrdinal:0,turnBefore:1,turnAfter:2,
        playerSlot:0,action:'PassTurnAction'},
      {actionOrdinal:1,turnBefore:2,turnAfter:3,
        playerSlot:1,action:accepted?'PlayCardAction':'PassTurnAction'}
    ];
    const native=accepted?[
      {globalTurn:2,seat:1,kind:'play-lowhand-lillie',
        accepted:true,intent:{printing:"Lillie's Determination M1L"},
        nativePhysicalEffect:'confirmed-public-effect',
        before:{supporterQuota:0},after:{supporterQuota:1}},
      {globalTurn:3,seat:0,kind:'attack',accepted:true,
        nativePhysicalEffect:'confirmed-public-effect'}
    ]:[];
    return {
      trial:{id:'trial-'+i,rank:i%2?11:6,
        candidateId:i%2?'champion-reference':'new-moon-lockbreaker-v1'},
      sourceDealFingerprint:'source-'+i,actualStarterSeat:i%2,
      rootActionLedger:seq,
      rootActionLedgerSha256:accepted?'different-'+i:'unchanged-'+i,
      rootActionCount:seq.length,
      finished:true,winner:1,candidateSeat:1,sourceSeat:0,
      actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
        lowHandLillieRootOptIn:treated,
        typedIntentCounts:accepted?{'play-lowhand-lillie':1}:{},
        nativePhysicalConfirmedByIntent:accepted?
          {'play-lowhand-lillie':1}:{},
        nativeRootAcceptances:native
      }}}
    };
  });
  return {
    schema:'agent41-preregistered-32-arm-canonical-scout-v1',
    registrationBlob:'fixed-original-frozen-plan',
    summary:{attempts:32},
    developmentResult:{attempted:32,enginePin:'fixed-pin',
      competitiveQualifiedGames:0,rows},
    ...(treated?{agent25NativeLillieDrawSettlement:{
      readOnly:true,supportRoots:1,printedDrawConfirmed:1,unresolved:0
    }}:{})
  };
}
test('full frozen cohort reports physical Lillie and source next root',()=>{
  const result=contrast(make(),make(true));
  assert.equal(result.schema,SCHEMA);
  assert.equal(result.identicalSourceDeals,32);
  assert.equal(result.identicalFirstPlayers,32);
  assert.equal(result.ledgerIdentical,31);
  assert.equal(result.nativeAccepted,1);
  assert.equal(result.nativePublicConfirmed,1);
  assert.equal(result.printedDrawConfirmed,1);
  assert.equal(result.nextOpposingNativeRoots,1);
  assert.equal(result.rows[3].firstOpponentNativeRoot.kind,'attack');
  assert.equal(result.rows[3].firstAccepted.printing,
    "Lillie's Determination M1L");
  assert.equal(result.competitiveQualifiedGames,0);
});
test('mark native error/capped games and reject physical source-deal changes',()=>{
  const base=make(),treated=make(true);
  treated.developmentResult.rows[0].status='engine-error';
  treated.developmentResult.rows[0].error='Store threw';
  treated.developmentResult.rows[0].finished=false;
  treated.developmentResult.rows[1].sourceDealFingerprint='DIFFERENT';
  const out=contrast(base,treated);
  assert.equal(out.rows[0].treatmentStatus,'engine-error');
  assert.equal(out.rows[0].treatmentError,'Store threw');
  assert.equal(out.identicalSourceDeals,31);
});
test('duplicate, missing or unregistered outcomes fail',()=>{
  const base=make(),treated=make(true);
  treated.developmentResult.rows[0].trial.id='trial-1';
  assert.throws(()=>contrast(base,treated),/Duplicate treatment id/);
  treated.developmentResult.rows.pop();
  assert.throws(()=>contrast(base,treated));
});
