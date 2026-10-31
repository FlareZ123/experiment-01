'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent48-decision-opportunity-receipt-v2-probe-completeness';

/** Stable JSON for already detached actor observations, not live Store state. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().filter(
      key => value[key] !== undefined
    ).map(key => [key, canonical(value[key])]));
  }
  return value;
}

/**
 * Provisional grouping of equivalent *observed* owner roots. The contract
 * currently omits some public history, so this cannot certify equivalent
 * full information states. Hand order is irrelevant, but hand multiplicity,
 * Bench ordering, public events, resources and global turn are preserved.
 *
 * @param {object} view A detached actorObservation owner-root view.
 * @returns {string} SHA-256 observation digest (after-game diagnostic only).
 */
function observedRootDigest(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(view.ownPublic && view.opponentPublic && view.ownTurnResources);
  const payload = {...view, actorSeat:undefined,
    ownHand:[...view.ownHand].sort()};
  return createHash('sha256').update(JSON.stringify(canonical(payload)))
    .digest('hex');
}

/**
 * A strict, one-record-per-actor-root postgame accounting adapter. Input
 * action witnesses must come from real Store/probe ledgers, not inferred
 * from theoretical access. Unsupported and unknown cells stay unqualified.
 *
 * @param {object[]} records Each record has trialId, sourceDealFingerprint,
 *   seat, rootOrdinal, view, and offers with affirmative evidence flags.
 * @param {{sampleLimit?:number}} [options]
 * @returns {object} Lossless denominators with bounded, honest examples.
 */
function decisionOpportunityReceipt(records, options = {}) {
  assert.ok(Array.isArray(records));
  const limit=options.sampleLimit??8;
  assert.ok(Number.isSafeInteger(limit)&&limit>=0);
  const allRoots=new Set(),deals=new Set(),trials=new Set();
  const pairDeals=new Map(),pairTrialIds=new Map();
  const configs=new Set(),arms=new Map();
  const total={ownerRoots:0,rootsWithOffers:0,nativePlayableWindows:0,
    chosenWindows:0,acceptedWindows:0,settledWindows:0,
    laterOwnerRootWindows:0,opponentReplyWindows:0,
    acceptedChangedChoices:0,offerChoices:0,nativePlayableChoices:0,
    nativeProbedChoices:0,nativeProbedWindows:0};
  const ordered=[...records].sort((a,b)=>
    String(a.trialId).localeCompare(String(b.trialId))||
    a.rootOrdinal-b.rootOrdinal||a.seat-b.seat);
  for(const record of ordered){
    const {trialId,sourceDealFingerprint,seat,rootOrdinal,view}=record;
    assert.ok(typeof trialId==='string'&&trialId.length>0);
    assert.ok(typeof sourceDealFingerprint==='string'&&
      sourceDealFingerprint.length>0);
    assert.ok(seat===0||seat===1);
    assert.ok(Number.isSafeInteger(rootOrdinal)&&rootOrdinal>=1);
    const rootKey=JSON.stringify([trialId,seat,rootOrdinal]);
    assert.ok(!allRoots.has(rootKey),'Repeated physical decision root');
    allRoots.add(rootKey);trials.add(trialId);deals.add(sourceDealFingerprint);
    if(record.pairedComparisonId!==undefined){
      assert.ok(typeof record.pairedComparisonId==='string'&&
        record.pairedComparisonId.length>0);
      const key=record.pairedComparisonId;
      const old=pairDeals.get(key);
      if(old!==undefined)assert.equal(old,sourceDealFingerprint,
        'A paired comparison cannot span different source deals');
      pairDeals.set(key,sourceDealFingerprint);
      if(!pairTrialIds.has(key))pairTrialIds.set(key,new Set());
      pairTrialIds.get(key).add(trialId);
    }
    const digest=observedRootDigest(view);configs.add(digest);
    const offers=record.offers??[];
    assert.ok(Array.isArray(offers));
    const flags={offered:false,nativePlayable:false,nativeProbed:false,
      chosen:false,
      accepted:false,settled:false,laterOwnerRoot:false,
      opponentReply:false,acceptedChangedChoice:false};
    let positiveWitness=null,rootProbedChoices=0,rootOfferChoices=0;
    for(const offer of offers){
      assert.ok(typeof offer.kind==='string'&&offer.kind.length>0);
      const on=key=>offer[key]===true;
      const known=key=>offer[key]===undefined||typeof offer[key]==='boolean';
      for(const field of ['ownerHeld','structurallyOffered','nativeCanPlay',
        'chosen','storeAccepted','effectSettled','laterOwnerRoot',
        'opponentReplied','changedFromBaseline'])
        assert.ok(known(field),'Invalid '+field+' evidence status');
      if(typeof offer.nativeCanPlay==='boolean')
        assert.ok(on('structurallyOffered'),
        'Native canPlay positive requires a structural offer');
      if(on('storeAccepted'))assert.ok(on('chosen'),
        'Accepted choice must be proposed/selected');
      if(on('effectSettled'))assert.ok(on('storeAccepted'),
        'Settled effect must have accepted Store action');
      if(on('changedFromBaseline')&&on('storeAccepted'))
        flags.acceptedChangedChoice=true;
      if(on('structurallyOffered'))flags.offered=true;
      if(typeof offer.nativeCanPlay==='boolean'){
        flags.nativeProbed=true;
        total.nativeProbedChoices++;
        rootProbedChoices++;
      }
      if(on('nativeCanPlay')){
        flags.nativePlayable=true;
        total.nativePlayableChoices++;
        if(!positiveWitness)positiveWitness={trialId,seat,rootOrdinal,
          kind:offer.kind,printing:offer.printing??null,
          slot:offer.slot??null,index:offer.index??null,
          digest};
      }
      total.offerChoices+=Number(on('structurallyOffered'));
      rootOfferChoices+=Number(on('structurallyOffered'));
      flags.chosen ||=on('chosen');
      flags.accepted ||=on('storeAccepted');
      flags.settled ||=on('effectSettled');
      flags.laterOwnerRoot ||=on('laterOwnerRoot');
      flags.opponentReply ||=on('opponentReplied');
    }
    total.ownerRoots++;
    for(const [flag,metric] of Object.entries({offered:'rootsWithOffers',
      nativePlayable:'nativePlayableWindows',nativeProbed:'nativeProbedWindows',
      chosen:'chosenWindows',
      accepted:'acceptedWindows',settled:'settledWindows',
      laterOwnerRoot:'laterOwnerRootWindows',
      opponentReply:'opponentReplyWindows',
      acceptedChangedChoice:'acceptedChangedChoices'}))
      total[metric]+=Number(flags[flag]);
    let arm=arms.get(trialId);
    if(!arm){
      arm={trialId,sourceDealFingerprint,rootCount:0,
        nativePositiveRoots:0,nativeProbedRoots:0,structuralOfferRoots:0,
        nativeProbedChoices:0,structuralOfferedChoices:0,
        positiveWitness:null,
        sourceExamples:[],nativePositiveExamples:[],
        repeatedObservedConfigurations:0,observedDigests:new Set()};
      arms.set(trialId,arm);
    }else assert.equal(arm.sourceDealFingerprint,sourceDealFingerprint,
      'One trial cannot change original source deal fingerprint');
    arm.rootCount++;
    arm.nativeProbedRoots+=Number(flags.nativeProbed);
    arm.structuralOfferRoots+=Number(flags.offered);
    arm.nativeProbedChoices+=rootProbedChoices;
    arm.structuralOfferedChoices+=rootOfferChoices;
    if(arm.observedDigests.has(digest))
      arm.repeatedObservedConfigurations++;
    arm.observedDigests.add(digest);
    const example={seat,rootOrdinal,globalTurn:view.globalTurn,digest,
      offered:flags.offered,nativePlayable:flags.nativePlayable,
      accepted:flags.accepted,settled:flags.settled,
      opponentReply:flags.opponentReply};
    if(arm.sourceExamples.length<limit)arm.sourceExamples.push(example);
    if(positiveWitness){
      arm.nativePositiveRoots++;
      arm.positiveWitness??=positiveWitness;
      if(arm.nativePositiveExamples.length<limit)
        arm.nativePositiveExamples.push(positiveWitness);
    }
  }
  return {version:VERSION,qualification:{publicHistorySufficiency:
      'UNVERIFIED',nativeOutcomeBinding:'REQUIRES_STORE_LEDGER',
      competitiveQualifiedGames:0},
    independentSourceDeals:deals.size,physicalTrials:trials.size,
    pairedComparisons:[...pairTrialIds.values()].filter(
      ids=>ids.size>=2).length,
    unpairedComparisonRegistrations:[...pairTrialIds.values()].filter(
      ids=>ids.size<2).length,
    uniqueObservedConfigurations:configs.size,
    ...total,
    arms:[...arms.values()].map(arm=>({
      trialId:arm.trialId,sourceDealFingerprint:arm.sourceDealFingerprint,
      rootCount:arm.rootCount,
      nativePositiveRoots:arm.nativePositiveRoots,
      nativeProbedRoots:arm.nativeProbedRoots,
      structuralOfferRoots:arm.structuralOfferRoots,
      nativeProbedChoices:arm.nativeProbedChoices,
      structuralOfferedChoices:arm.structuralOfferedChoices,
      uniqueObservedConfigurations:arm.observedDigests.size,
      repeatedObservedConfigurations:arm.repeatedObservedConfigurations,
      sourceExamples:arm.sourceExamples,
      nativePositiveExamples:arm.nativePositiveExamples,
      earliestNativePositiveWitness:arm.positiveWitness,
      sourceExamplesMayBeTruncated:arm.rootCount>arm.sourceExamples.length,
      positiveExamplesMayBeTruncated:
        arm.nativePositiveRoots>arm.nativePositiveExamples.length,
      positiveWitnessCoverage:arm.nativePositiveRoots===0?
        arm.structuralOfferRoots===0?'NO_STRUCTURAL_OFFERS':
        arm.nativeProbedRoots===0?'NATIVE_PLAYABILITY_UNPROBED':
        arm.nativeProbedChoices<arm.structuralOfferedChoices?
          'PARTIAL_NATIVE_PROBE_NO_POSITIVE':
          'PROBED_NO_NATIVE_POSITIVE':arm.positiveWitness?
        'EARLIEST_NATIVE_POSITIVE_PRESERVED':'POSITIVE_WITNESS_MISSING'
    }))};
}

/**
 * Qualify only the completeness of the actor hook's native dispatch receipts.
 * The policy decision ordinal still is not a Store action ordinal; joining it
 * to action history requires a separate same-dispatch native witness.
 * @param {object} audit Actual withActorOnlyRootPolicy audit.
 * @returns {object}
 */
function actorNativeReceiptCoverage(audit) {
  const counts=['selectedRootDecisions','acceptedActorRoots','rejectedActorRoots'];
  for(const field of counts)assert.ok(Number.isSafeInteger(audit?.[field])&&
    audit[field]>=0,'Invalid native root audit counter '+field);
  assert.ok(Array.isArray(audit.nativeRootAcceptances));
  const dispatched=audit.acceptedActorRoots+audit.rejectedActorRoots;
  const retained=audit.nativeRootAcceptances.length;
  assert.ok(dispatched<=audit.selectedRootDecisions,
    'More dispatches than selected actor root decisions');
  assert.ok(retained<=dispatched,'More retained receipts than dispatches');
  const ordinals=new Set();
  for(const receipt of audit.nativeRootAcceptances){
    assert.ok(receipt.accepted===true||receipt.accepted===false,
      'Unclassified native root dispatch result');
    assert.ok(Number.isSafeInteger(receipt.policyDecisionOrdinal)&&
      receipt.policyDecisionOrdinal>=1&&
      receipt.policyDecisionOrdinal<=audit.selectedRootDecisions,
      'Missing/invalid actor policy decision ordinal');
    assert.ok(!ordinals.has(receipt.policyDecisionOrdinal),
      'Duplicate native policy decision ordinal');
    ordinals.add(receipt.policyDecisionOrdinal);
  }
  const missing=dispatched-retained;
  const selectedWithoutDispatch=audit.selectedRootDecisions-dispatched;
  const status=missing>0?'NATIVE_ROOT_WITNESSES_TRUNCATED':
    selectedWithoutDispatch>0?'ACTOR_SELECTION_WITHOUT_DISPATCH':
    'COMPLETE_POLICY_CLOCK_ONLY';
  return {status,selectedActorRoots:audit.selectedRootDecisions,
    dispatchedActorRoots:dispatched,retainedNativeReceipts:retained,
    missingNativeReceipts:missing,selectedWithoutDispatch,
    nativeActionOrdinalBound:false,competitiveQualifiedGames:0};
}

module.exports={VERSION,observedRootDigest,decisionOpportunityReceipt,
  actorNativeReceiptCoverage};
