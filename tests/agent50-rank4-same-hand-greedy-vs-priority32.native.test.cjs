'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerStartingBasicChoice}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');
const {withOwnerEntryPriorityOpening}=
  require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withOwnerOpeningStoreReceipt}=
  require('../simulation/twinleaf/agent50-owner-opening-store-receipt.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

const VERSION='agent50-rank4-same-hand-greedy-vs-priority32-v1';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const source=plan.opponents.find(x=>x.rank===4);
assert.equal(source?.status,'ready');
assert.equal(plan.engineRevision,
  'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');

function save(row){
  const directory=process.env.AGENT50_RANK4_PAIRED_RECEIPT_DIR;
  if(!directory)return;
  fs.mkdirSync(directory,{recursive:true});
  const basename='rank4-paired-seat'+row.seat+'-seed'+row.seed+'.json';
  const filename=path.resolve(directory,basename);
  const contents=JSON.stringify(row,null,2)+'\n';
  const digest=createHash('sha256').update(contents).digest('hex');
  writeAtomicLocked(filename,contents);
  writeAtomicLocked(filename+'.sha256',digest+'  '+basename+'\n');
}

/**
 * Both variants are source-rank-blind and receive the same native owner-only
 * setup Confirm and later fail-closed actor policy; only their initial native
 * owner Basic choice differs. The independent observer wraps real Store.
 *
 * @param {0|1} seat Authenticated physical source seat.
 * @param {number} seed Registered fixed initial game-event seed.
 * @param {'greedy'|'entry-priority'} mode
 * @returns {object}
 */
function arm(seat,seed,mode){
  let error=null,returned=false;
  const selector=mode==='greedy'?
    withOwnerStartingBasicChoice:withOwnerEntryPriorityOpening;
  try{
    withNativeRawStateFallbackQuarantine(()=>
      withOwnerSetupConfirm(()=>
        selector(()=>
          withOwnerOpeningStoreReceipt(()=>
            withCanonicalActorOnlyPolicy(()=>runMatch({
              deckA:seat===0?source.cards:plan.candidate.cards,
              deckB:seat===1?source.cards:plan.candidate.cards,
              seed,maxActions:80,captureNativeAbortEvidence:true
            })),{sourceSeat:seat}))));
    returned=true;
  }catch(e){error=e;}
  const observer=error?.ownerOpeningStoreReceiptAudit??null;
  const events=observer?.events??[];
  const guard=error?.nativeRawStateFallbackQuarantine??null;
  const initial=events[0]??null;
  return {
    mode,returned,
    abortCode:error?.code??null,
    publicNativeFallback:guard?.records?.[0]??null,
    nativeRawDecoderExecuted:guard?.originalNativeDecoderExecuted??null,
    sourceInitialEventCount:events.length,
    sourceInitialStoreEvent:initial,
    armNativeStoreVerified:events.length===1&&
      initial?.nativeStoreAccepted===true&&
      initial?.mandatoryInitialPlacementCompleted===true&&
      guard?.originalNativeDecoderExecuted===false&&
      guard?.rawStateFallbackCalls>=1&&
      error?.code===CODE&&!returned
  };
}

test('32 predeclared source-owned real Store same-hand policy pairs',()=>{
  const rows=[];
  for(const seat of [0,1]){
    for(let seed=20261120;seed<=20261135;seed++){
      const greedy=arm(seat,seed,'greedy');
      const priority=arm(seat,seed,'entry-priority');
      const g=greedy.sourceInitialStoreEvent;
      const p=priority.sourceInitialStoreEvent;
      const matched=Boolean(g&&p&&
        g.preOwnerHandSha256===p.preOwnerHandSha256&&
        JSON.stringify(g.preOwnerHandPrintings)===
          JSON.stringify(p.preOwnerHandPrintings));
      const ordinaryAvailable=(p?.eligibleBasicPrintings.length??0)>
        (p?.eligibleTurnEntryBasicPrintings.length??0);
      const eligibleEntrants=p?.eligibleTurnEntryBasicPrintings.length??0;
      const shouldProtect=matched&&ordinaryAvailable&&eligibleEntrants>0&&
        (p?.eligibleBasicPrintings.length??0)<=6;
      const preserved=shouldProtect&&
        g.selectedTriggerBasicPrintings.length>=1&&
        p.selectedTriggerBasicPrintings.length===0&&
        p.previouslyEligibleEntryCardsStillInHand.length===eligibleEntrants&&
        p.sourceActiveChoiceIsEntrySupport===false;
      const comparable=greedy.armNativeStoreVerified&&
        priority.armNativeStoreVerified&&matched;
      const row={
        version:VERSION,rank:4,seat,seed,
        printedSource60Sha256:createHash('sha256')
          .update(JSON.stringify(source.cards)).digest('hex'),
        printedCandidate60Sha256:createHash('sha256')
          .update(JSON.stringify(plan.candidate.cards)).digest('hex'),
        sourceManifestDigest:plan.manifestDigest,
        pinnedEngine:plan.engineRevision,
        ciRunId:process.env.GITHUB_RUN_ID??null,
        ciHeadSha:process.env.GITHUB_SHA??null,
        greedy,priority,
        sourceHandPrintingOrderMatches:matched,
        bothNativeArmsAcceptedAndComparable:comparable,
        independentlyEligibleSupportAndOrdinaryBasic:shouldProtect,
        observedAcceptedConsumptionVersusPreservation:preserved,
        paperPaymentVerified:false,qualifiedCompetitiveGames:0
      };
      save(row);
      rows.push(row);
    }
  }
  assert.equal(rows.length,32);
  const invalid=rows.filter(x=>!x.bothNativeArmsAcceptedAndComparable);
  const positive=rows.filter(x=>
    x.independentlyEligibleSupportAndOrdinaryBasic);
  const contrasted=rows.filter(x=>
    x.observedAcceptedConsumptionVersusPreservation);
  console.log('AGENT50_RANK4_SAME_HAND_GREEDY_PRIORITY32',JSON.stringify({
    version:VERSION,
    registeredPairs:rows.length,
    invalidPairs:invalid.map(x=>({
      seat:x.seat,seed:x.seed,
      greedy:x.greedy.armNativeStoreVerified,
      protected:x.priority.armNativeStoreVerified,
      sameOrderedHand:x.sourceHandPrintingOrderMatches
    })),
    realNativeSameHandPositive:positive.length,
    realNativeStoreObservedContrasts:contrasted.length,
    positiveSeeds:contrasted.map(x=>({
      seat:x.seat,seed:x.seed,
      initialOrderedHandSha256:
        x.priority.sourceInitialStoreEvent.preOwnerHandSha256,
      baselineSelected:
        x.greedy.sourceInitialStoreEvent.selectedPrintings,
      protectedSelected:
        x.priority.sourceInitialStoreEvent.selectedPrintings,
      heldEntry:
        x.priority.sourceInitialStoreEvent
          .previouslyEligibleEntryCardsStillInHand
    })),
    qualifiedCompetitiveGames:0
  }));
  assert.equal(invalid.length,0,
    'All fixed hands require owner-ordered printing parity and native Store acceptance');
  assert.ok(positive.length>=1,
    'At least one original source must offer support plus an ordinary Basic');
  assert.equal(contrasted.length,positive.length,
    'Every physically eligible support/ordinary Basic setup must show matched native consumption versus retention');
});
