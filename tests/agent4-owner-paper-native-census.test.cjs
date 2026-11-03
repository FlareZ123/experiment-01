'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {paperCensus,VERSION}=
  require('../simulation/twinleaf/agent4-owner-paper-native-parity.cjs');

function paperRow(printing,paperPlayable,offered=true){
  return {
    printing,paperPlayable,nativeEnumeratorOffered:offered,
    genericPublicBlocker:null,
    printedTemporalIneligibilityProven:paperPlayable===false,
    printedTemporalConservativeDecline:false,
    printedMandatoryHandPayment:'unmodeled-printing'
  };
}
function witness(seat,turn,ordinal,rows,cert=null){
  const taken=rows.filter(row=>row.paperPlayable===false).length;
  return {
    seat,turn,ordinal,dispatch:'native-accepted',
    chosen:{action:'PassTurnAction',trainer:null},
    ownerTurnReceipt:{
      actorSeat:seat,globalTurn:turn,
      distinctObservedOwnerTurns:turn===1?1:2,
      provenPastFirstOwnerTurn:turn!==1
    },
    guaranteedK0FirstTurnVip:cert,
    ownerPaperNecessity:{
      actorSeat:seat,globalTurn:turn,
      heldTrainerCopies:rows.length,
      enumeratorOfferedCopies:rows.filter(x=>x.nativeEnumeratorOffered).length,
      provenNecessaryConditionFailures:taken,
      remainingUnresolvedCopies:rows.length-taken,
      rows
    }
  };
}

test('read-only paper census separates real first-turn guaranteed Basic from later expired offer',()=>{
  const cert={
    printing:'Battle VIP Pass FST',minimumBasicStillInDeck:1,
    certified:'paper-VIP-play-conditions-and-at-least-one-hidden-Basic'
  };
  const roots=[
    witness(0,1,0,[paperRow('Battle VIP Pass FST',null)],cert),
    witness(1,5,1,[paperRow('Battle VIP Pass FST',false)])
  ];
  const original=JSON.stringify(roots);
  const c=paperCensus({
    ownerPaperNecessityOptIn:true,roots,rootsOmittedDueToCap:0
  });
  assert.equal(c.version,VERSION);
  assert.equal(c.guaranteedTargetPassCount,1);
  assert.equal(c.guaranteedTargetPasses[0].seat,0);
  assert.equal(c.guaranteedTargetPasses[0].turn,1);
  assert.equal(c.guaranteedTargetPasses[0].certificate,cert);
  assert.equal(c.guaranteedTargetPasses[0].allCompetingOptionsNotEvaluated,true);
  assert.equal(c.bySeat[0].provenNecessaryConditionFailures,0);
  assert.equal(c.bySeat[1].provenNecessaryConditionFailures,1);
  assert.equal(c.bySeat[1].offeredButProvenBlocked,1);
  assert.equal(c.bySeat[0].passWithSomeUnresolved,1);
  assert.equal(c.confirmedPaperLegalAvailableMoves,0);
  assert.equal(JSON.stringify(roots),original);
});

test('cannot call expired second owner-turn VIP a guaranteed first-turn Pass',()=>{
  const late=witness(0,5,7,
    [paperRow('Battle VIP Pass FST',false)],{
      printing:'Battle VIP Pass FST',
      minimumBasicStillInDeck:2
    });
  assert.throws(()=>paperCensus({
    ownerPaperNecessityOptIn:true,roots:[late],rootsOmittedDueToCap:0
  }),/Expected values/);
});

test('native omissions and unverified physical payment remain distinct from legality',()=>{
  const row={
    ...paperRow('Ultra Ball MEG',null,false),
    printedMandatoryHandPayment:'physically-possible-unpaid'
  };
  const c=paperCensus({
    ownerPaperNecessityOptIn:true,
    roots:[witness(1,2,4,[row])],
    rootsOmittedDueToCap:3
  });
  assert.equal(c.bySeat[1].notOfferedYetUnresolved,1);
  assert.equal(c.bySeat[1].provenNecessaryConditionFailures,0);
  assert.equal(c.missingRootsDueToCap,3);
  assert.equal(c.paperTargetAndCustodyVerified,false);
  assert.equal(c.guaranteedTargetPassCount,0);
});
