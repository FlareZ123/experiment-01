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
const {withOwnerEntryPriorityOpening}=
  require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

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
  const directory=process.env.AGENT50_ENTRY_RANK4_RECEIPT_DIR;
  if(!directory)return;
  fs.mkdirSync(directory,{recursive:true});
  const basename='rank4-seat'+row.seat+'-seed'+row.seed+'.json';
  const filename=path.resolve(directory,basename);
  const contents=JSON.stringify(row,null,2)+'\n';
  const digest=createHash('sha256').update(contents).digest('hex');
  writeAtomicLocked(filename,contents);
  writeAtomicLocked(filename+'.sha256',digest+'  '+basename+'\n');
}

function attempt(seat,seed){
  let error=null;
  try{
    withNativeRawStateFallbackQuarantine(()=>withOwnerSetupConfirm(()=>
      withOwnerEntryPriorityOpening(()=>
        withCanonicalActorOnlyPolicy(()=>runMatch({
          deckA:seat===0?source.cards:plan.candidate.cards,
          deckB:seat===1?source.cards:plan.candidate.cards,
          seed,maxActions:80,captureNativeAbortEvidence:true
        })))));
  }catch(e){error=e;}
  const priority=error?.ownerEntryPriorityAudit;
  const bridge=priority?.nativeStoreAdapterAudit;
  const guard=error?.nativeRawStateFallbackQuarantine;
  const sourceChoices=priority?.ownerEntrySelectionEvents
    ?.filter(e=>e.seat===seat)??[];
  const sourceActive=bridge?.events?.filter(e=>e.seat===seat)??[];
  const positive=sourceChoices.some(e=>
    e.eligibleTurnEntrySupports>=1&&
    e.validEligibleBasics>e.eligibleTurnEntrySupports&&
    e.chosenEntrySupport===false);
  const valid=error?.code===CODE&&
    guard?.originalNativeDecoderExecuted===false&&
    guard?.rawStateFallbackCalls>=1&&
    bridge?.accepted>=2&&
    bridge?.physicallyPlacedActiveConfirmed===bridge.accepted&&
    bridge?.physicallyPlacedActiveMissing===0&&
    bridge?.rejected===0&&
    sourceChoices.length>=1&&sourceActive.length>=1&&
    sourceChoices.every(e=>
      !e.chosenEntrySupport||
      e.eligibleTurnEntrySupports===e.validEligibleBasics);
  const receipt={
    schema:'agent50-original4-owner-priority-natural32-v1',
    rank:4,seat,seed,
    sourceManifestDigest:plan.manifestDigest,
    sourceNativeDeckDigest:createHash('sha256')
      .update(JSON.stringify(source.cards)).digest('hex'),
    pinnedEngine:plan.engineRevision,
    ciHeadSha:process.env.GITHUB_SHA??null,
    sourceChoices,sourceSelected:sourceActive.map(e=>({
      printing:e.printing,seat:e.seat
    })),
    nativeStoreAccepted:bridge?.accepted??null,
    nativePhysicalActive:bridge?.physicallyPlacedActiveConfirmed??null,
    nextPublicPrompt:guard?.records?.[0]??null,
    decoderReached:guard?.originalNativeDecoderExecuted??null,
    ownerPositive:positive,validated:valid,
    qualifiedGames:0
  };
  save(receipt);
  return receipt;
}

test('32 preregistered authentic rank4 opening hands, two seats',()=>{
  const records=[];
  for(const seat of [0,1])
    for(let seed=20261120;seed<=20261135;seed++)
      records.push(attempt(seat,seed));
  assert.equal(records.length,32);
  const invalid=records.filter(x=>!x.validated);
  const positive=records.filter(x=>x.ownerPositive);
  console.log('AGENT50_RANK4_NATURAL32',JSON.stringify({
    attempts:records.length,invalid:invalid.map(x=>({
      seat:x.seat,seed:x.seed})),
    positiveCount:positive.length,
    positiveSeeds:positive.map(x=>({
      seat:x.seat,seed:x.seed,sourceChoices:x.sourceChoices
    })),
    qualifiedGames:0
  }));
  assert.equal(invalid.length,0);
  assert.ok(positive.length>=1,
    'No natural qualifying source hand across frozen seeds');
});
