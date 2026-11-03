'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const VERSION='agent4-authenticated-paper-trainer-frontier-native-aba-v1';
const ENGINE_PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const registrationFile=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent4-owner-paper-native-parity-v1-20261103.json');
const registrationBytes=fs.readFileSync(registrationFile);
const registration=JSON.parse(registrationBytes.toString('utf8'));
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Summarize *repeat observations* of held exact printed Trainer copies. Each
 * status has its own evidence requirement; counts can overlap, and none are
 * independently paper-legal opportunity counts. Real owner-private audit
 * contents are for offline postgame inspection only.
 *
 * @param {object} audit Actual read-only native observer audit.
 * @returns {object}
 */
function paperCensus(audit){
  assert.equal(audit?.ownerPaperNecessityOptIn,true);
  assert.ok(Array.isArray(audit.roots));
  const counts=()=>({
    roots:0,heldTrainerCopies:0,nativeOfferedCopies:0,
    provenNecessaryConditionFailures:0,
    publiclyBlockedCopies:0,
    printedTemporalProvenBlocked:0,
    conservativeTemporalUnknown:0,
    printedMandatoryHandPaymentImpossible:0,
    remainingUnresolvedCopies:0,
    offeredButProvenBlocked:0,
    notOfferedYetUnresolved:0,
    passWithSomeUnresolved:0,
    selectedTrainerRootAccepted:0
  });
  const bySeat={0:counts(),1:counts()};
  const vipExamples=[],paperOwnerRoots=[],guaranteedTargetPasses=[];
  for(const root of audit.roots){
    assert.ok(root.seat===0||root.seat===1);
    assert.equal(root.ownerTurnReceipt.actorSeat,root.seat);
    assert.equal(root.ownerTurnReceipt.globalTurn,root.turn);
    const c=bySeat[root.seat],p=root.ownerPaperNecessity;
    assert.equal(p.actorSeat,root.seat);
    assert.equal(p.globalTurn,root.turn);
    c.roots++;
    c.heldTrainerCopies+=p.heldTrainerCopies;
    c.nativeOfferedCopies+=p.enumeratorOfferedCopies;
    c.provenNecessaryConditionFailures+=p.provenNecessaryConditionFailures;
    c.remainingUnresolvedCopies+=p.remainingUnresolvedCopies;
    if(root.chosen?.trainer&&root.dispatch==='native-accepted')
      c.selectedTrainerRootAccepted++;
    const certifiedVip=root.guaranteedK0FirstTurnVip??null;
    if(certifiedVip&&root.chosen?.action==='PassTurnAction'&&
      root.dispatch==='native-accepted'){
      assert.equal(root.ownerTurnReceipt.provenPastFirstOwnerTurn,false);
      assert.equal(certifiedVip.printing,'Battle VIP Pass FST');
      guaranteedTargetPasses.push({
        seat:root.seat,turn:root.turn,ordinal:root.ordinal,
        ownerTurnReceipt:root.ownerTurnReceipt,
        certificate:certifiedVip,
        chosenAction:root.chosen.action,
        nativeDispatch:root.dispatch,
        paperSettlementNotVerified:true,
        allCompetingOptionsNotEvaluated:true
      });
    }
    const unresolved=p.rows.filter(x=>x.paperPlayable===null);
    if(root.chosen?.action==='PassTurnAction'&&
      root.dispatch==='native-accepted'&&unresolved.length)
      c.passWithSomeUnresolved++;
    for(const x of p.rows){
      if(x.genericPublicBlocker)c.publiclyBlockedCopies++;
      if(x.printedTemporalIneligibilityProven)
        c.printedTemporalProvenBlocked++;
      if(x.printedTemporalConservativeDecline)
        c.conservativeTemporalUnknown++;
      if(x.printedMandatoryHandPayment==='physically-impossible')
        c.printedMandatoryHandPaymentImpossible++;
      if(x.nativeEnumeratorOffered&&x.paperPlayable===false)
        c.offeredButProvenBlocked++;
      if(x.nativeEnumeratorOffered===false&&x.paperPlayable===null)
        c.notOfferedYetUnresolved++;
      if(x.printing==='Battle VIP Pass FST'&&vipExamples.length<100)
        vipExamples.push({
          seat:root.seat,turn:root.turn,ordinal:root.ordinal,
          ownerTurnReceipt:root.ownerTurnReceipt,
          offered:x.nativeEnumeratorOffered,
          publiclyBlocked:x.genericPublicBlocker,
          temporal:x.printedTemporalStatus,
          ineligibilityProven:x.printedTemporalIneligibilityProven,
          paperPlayable:x.paperPlayable,
          selectedAction:root.chosen?.action,
          nativeDispatch:root.dispatch,
          ownerPrivatePostgameOnly:true
        });
    }
    paperOwnerRoots.push({
      ordinal:root.ordinal,seat:root.seat,turn:root.turn,
      ownerTurnReceipt:root.ownerTurnReceipt,
      ownerPaperNecessity:p,
      guaranteedK0FirstTurnVip:certifiedVip,
      selectedNativeAction:root.chosen,
      nativeDispatch:root.dispatch,
      nativeError:root.error??null,
      ownerPrivatePostgameOnly:true
    });
  }
  return {
    version:VERSION,
    bySeat,vipExamples,paperOwnerRoots,
    guaranteedTargetPasses,
    guaranteedTargetPassCount:guaranteedTargetPasses.length,
    nativeEnumeratorIsNotPaperLegality:true,
    confirmedPaperLegalAvailableMoves:0,
    paperTargetAndCustodyVerified:false,
    strategicDominanceOrGameOutcomeCertified:false,
    repeatedObservationCountsNotIndependentGames:true,
    totalRoots:audit.roots.length,
    missingRootsDueToCap:audit.rootsOmittedDueToCap
  };
}

/** @param {object} result Real pinned headless result. */
function witness(result){
  return {
    deckHashes:result.deckHashes,
    firstTurnSlot:result.firstTurnSlot,
    physicalDeal:result.initialFullPhysicalDealFingerprint,
    decisionTrace:result.decisionTrace,
    rootActionLedger:result.rootActionLedger,
    finished:result.finished,winner:result.winner
  };
}

/** One real Store attempt, with errors retained rather than silently dropped. */
function attempt(request,instrumented){
  const record={instrumented,status:'not-attempted',error:null,
    native:null,paperCensus:null};
  try{
    const run=withCanonicalActorOnlyPolicy(()=>runMatch(request),{},{
      genericFallbackAttribution:true,
      ownerGenericTrainerFrontier:instrumented,
      ownerPaperNecessity:instrumented,
      ...(instrumented?{
        ownerTrainerRegisteredSixties:[request.deckA,request.deckB]
      }:{})
    });
    const game=run.result;
    assert.equal(game.engine,ENGINE_PIN);
    record.native={
      witnessSha256:sha(witness(game)),
      firstTurnSlot:game.firstTurnSlot,
      fullPhysicalDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      deckHashes:game.deckHashes,
      finished:game.finished===true,
      winner:game.finished===true?game.winner:null,
      nativeActionCount:game.rootActionLedger?.length??null,
      actionCapped:game.finished!==true
    };
    if(instrumented)
      record.paperCensus=paperCensus(run.audit.ownerTrainerFrontierAudit);
    record.status=game.finished?'native-terminal':'action-capped';
  }catch(error){
    record.status='native-error';
    record.error=String(error?.stack||error).slice(0,4200);
  }
  return record;
}

/** Historical exact deal read-only compatibility check, never performance. */
function run(){
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  assert.equal(registration.schema,
    'agent4-owner-paper-opportunity-native-registration-v1');
  assert.deepEqual(registration.originalSourceRanks,[5,11]);
  assert.equal(registration.plannedNativeAttempts,6);
  assert.deepEqual(registration.arms,[
    'same-canonical-no-paper-observer',
    'same-canonical-plus-read-only-paper-observer',
    'same-canonical-no-paper-observer-repeat'
  ]);
  initializeCards();
  const plan=planAichi(5,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const deckFive=plan.candidate.cards;
  const deckEleven=plan.opponents.find(x=>x.rank===11)?.cards;
  assert.equal(deckFive.length,60);
  assert.equal(deckEleven?.length,60);
  const seeds=deriveSlotSeeds(registration.seeds.base,
    registration.seeds.phase,registration.seeds.rank,
    registration.seeds.repeat);
  const groups=[];
  for(const {slot,rank5Seat} of registration.physicalSeatOrders){
    const request={
      deckA:rank5Seat===0?deckFive:deckEleven,
      deckB:rank5Seat===0?deckEleven:deckFive,
      seed:seeds[slot],label:VERSION+':'+slot,
      maxActions:registration.nativeActionCap,
      strictPromptValidation:registration.strictPromptValidation,
      isolatePolicyRandomness:registration.isolatePolicyRandomness,
      captureDecisionTrace:registration.captureDecisionTrace,
      captureInitialFullPhysicalDeal:
        registration.captureInitialFullPhysicalDeal
    };
    const attempts=[attempt(request,false),attempt(request,true),
      attempt(request,false)];
    const physical=attempts.map(a=>a.native?.fullPhysicalDealSha256??null);
    const trace=attempts.map(a=>a.native?.witnessSha256??null);
    const success=attempts.every(a=>a.native!==null);
    groups.push({
      slot,rank5Seat,seed:request.seed,
      originalDeckSha256:[sha(request.deckA),sha(request.deckB)],
      nativeAttemptCount:attempts.length,
      allPhysicalDealMatched:success&&physical[0]!==null&&
        physical.every(x=>x===physical[0]),
      allActionTraceMatched:success&&trace[0]!==null&&
        trace.every(x=>x===trace[0]),
      physicalSha256:physical,traceSha256:trace,attempts
    });
  }
  const complete=groups.every(g=>
    g.allPhysicalDealMatched&&g.allActionTraceMatched);
  return {
    version:VERSION,enginePin:ENGINE_PIN,registration,
    registrationSha256:createHash('sha256')
      .update(registrationBytes).digest('hex'),
    sourceRanks:[5,11],samePrintedSixties:true,
    bothRealSeats:true,allAttempted:groups.length*3,
    allPhysicalAndDecisionParity:complete,
    nativeErrors:groups.flatMap(g=>g.attempts.filter(a=>a.error)
      .map(a=>({slot:g.slot,instrumented:a.instrumented,error:a.error}))),
    noNativePaperGameQualified:true,competitiveQualifiedGames:0,
    fixedSixtySelected:false,fieldWinRate:null,
    groups
  };
}

if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent4-owner-paper-native-parity.json'),result);
  process.stdout.write('AGENT4_OWNER_PAPER_NATIVE_PARITY '+
    JSON.stringify({
      attempts:result.allAttempted,
      parity:result.allPhysicalAndDecisionParity,
      errors:result.nativeErrors.length,
      perSeat:result.groups.map(group=>({
        slot:group.slot,
        rank5Seat:group.rank5Seat,
        nativeStatuses:group.attempts.map(x=>x.status),
        physicalMatched:group.allPhysicalDealMatched,
        actionMatched:group.allActionTraceMatched,
        paper:group.attempts[1].paperCensus?.bySeat??null,
        vip:group.attempts[1].paperCensus?.vipExamples??[],
        K0VipPasses:group.attempts[1].paperCensus?.guaranteedTargetPasses??[]
      }))
    })+'\n');
  if(!result.allPhysicalAndDecisionParity||result.allAttempted!==6||
     result.nativeErrors.length)process.exitCode=1;
}

module.exports={VERSION,registration,paperCensus,witness,attempt,run};
