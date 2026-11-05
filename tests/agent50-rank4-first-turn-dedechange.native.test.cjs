'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withGoFirstChoice}=require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerEntryPriorityOpening}=
  require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withOwnerOpeningStoreReceipt}=
  require('../simulation/twinleaf/agent50-owner-opening-store-receipt.cjs');
const {VERSION,withOwnerFirstTurnDedechange}=
  require('../simulation/twinleaf/agent50-owner-firstturn-dedechange.cjs');
const {withActorOnlySelectPrompt,chooseActorSelectPrompt}=
  require('../simulation/twinleaf/agent8-actor-only-select-prompt.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const rank6Lock=process.env.AGENT50_RANK4_DEDECHANGE_RANK6_LOCK==='true';
const selectV2=rank6Lock||process.env.AGENT50_RANK4_DEDECHANGE_SELECT_V2==='true';
const registration=rank6Lock?
  'results/methodology/registrations/agent50-rank4-dedechange-versus-rank6-iron-thorns-v3-20261105.md':selectV2?
  'results/methodology/registrations/agent50-rank4-first-turn-dedechange-select-v2-20261105.md':
  'results/methodology/registrations/agent50-rank4-first-turn-dedechange-native-v1-20261105.md';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
assert.equal(plan.engineRevision,PIN);
const source=plan.opponents.find(x=>x.rank===4);
assert.equal(source?.status,'ready');
const rank6=plan.opponents.find(x=>x.rank===6);
assert.equal(rank6?.status,'ready');
const reference=rank6Lock?rank6.cards:plan.candidate.cards;
const frozen=[
  {seat:0,seed:20261123},
  {seat:1,seed:20261125},
  {seat:1,seed:20261129},
  {seat:1,seed:20261132}
];

/**
 * Apply only the pre-existing detached owner SelectPrompt adapter in v2.
 * Record owner-visible choices across any later fail-closed boundary.
 * @template T
 * @param {()=>T} run
 * @param {object[]} events
 * @returns {T|object}
 */
function withOptionalNativeSelect(run,events){
  if(!selectV2)return run();
  return withActorOnlySelectPrompt(run,{
    choose(input){
      const answer=chooseActorSelectPrompt(input);
      events.push({
        actorSeat:input.actor.actorSeat,
        globalTurn:input.actor.globalTurn,
        phase:input.actor.phase,
        message:input.prompt.message??null,
        offeredOptions:input.prompt.values.length,
        chosenOptionIndex:answer.optionIndex
      });
      return answer;
    }
  });
}

/** @param {{seat:number,seed:number}} trial @returns {object} */
function attempt({seat,seed}){
  let thrown=null,returned=false;
  let inner=null;
  const actorSelectIntents=[];
  try{
    inner=withNativeRawStateFallbackQuarantine(()=>
      withOwnerSetupConfirm(()=>
        withOptionalNativeSelect(()=>withGoFirstChoice(
          seat===0?[true,false]:[false,true],()=>
            withOwnerPublicAcknowledgements(()=>
              withOwnerEntryPriorityOpening(()=>
                withOwnerOpeningStoreReceipt(()=>
                  withOwnerFirstTurnDedechange(()=>runMatch({
                    deckA:seat===0?source.cards:reference,
                    deckB:seat===1?source.cards:reference,
                    seed,maxActions:80,captureNativeAbortEvidence:true
                  }),{sourceSeat:seat}),{sourceSeat:seat})
                )
              )
            )
        ,actorSelectIntents))
      ,{maxRecords:8});
    returned=true;
  }catch(e){
    thrown=e;
  }
  const guard=thrown?.nativeRawStateFallbackQuarantine??null;
  const setup=thrown?.ownerOpeningStoreReceiptAudit??null;
  const hook=thrown?.agent50FirstTurnDedechangeAudit??null;
  return {
    schema:VERSION,variant:rank6Lock?'rank6-thorns-lock-v3':selectV2?'native-select-v2':'entry-v1',
    referenceRank:rank6Lock?6:1,
    registration,actorSelectIntents,
    sourceRank:4,seat,seed,pinnedEngine:PIN,
    source60Sha256:createHash('sha256')
      .update(JSON.stringify(source.cards)).digest('hex'),
    candidate60Sha256:createHash('sha256')
      .update(JSON.stringify(reference)).digest('hex'),
    sourceCoinChoice:seat===0?[true,false]:[false,true],
    finishedWithoutError:returned,
    error:thrown?{
      code:thrown.code??null,name:thrown.name??null,
      message:String(thrown.message??thrown).slice(0,400)
    }:null,
    ownerFirstTurnHook:hook,
    setupNativeStore:setup?.events??null,
    ownerFallback:guard?{
      rawStateCalls:guard.rawStateFallbackCalls,
      originalNativeDecoderExecuted:guard.originalNativeDecoderExecuted,
      records:guard.records
    }:null,
    noCompleteGameClaim:true,qualifiedCompetitiveGames:0
  };
}

/** @param {object} row */
function save(row){
  const dir=process.env.AGENT50_RANK4_DEDECHANGE_OUTPUT;
  if(!dir)return;
  fs.mkdirSync(dir,{recursive:true});
  const name='rank4-dedechange-seat'+row.seat+'-seed'+row.seed+'.json';
  const file=path.resolve(dir,name);
  const body=JSON.stringify(row,null,2)+'\n';
  writeAtomicLocked(file,body);
  const sha=createHash('sha256').update(body).digest('hex');
  writeAtomicLocked(file+'.sha256',sha+'  '+name+'\n');
}

test('four frozen original rank4 owner Dedechange native in-turn attempts',()=>{
  const rows=frozen.map(item=>{
    const row=attempt(item);
    save(row);
    return row;
  });
  const summary={
    schema:VERSION,variant:rank6Lock?'rank6-thorns-lock-v3':selectV2?'native-select-v2':'entry-v1',
    registered:rows.length,actorSelectIntents:rows.map(x=>x.actorSelectIntents),
    sourceSetupPhysicallyVerified:rows.filter(r=>
      r.setupNativeStore?.length===1&&
      r.setupNativeStore[0].mandatoryInitialPlacementCompleted).length,
    sourceRootOffers:rows.map(r=>
      r.ownerFirstTurnHook?.sourceTurnRootsSeen??null),
    proposedOwnerPlays:rows.map(r=>
      r.ownerFirstTurnHook?.proposedDedenneRoots??null),
    physicallyBenched:rows.map(r=>
      r.ownerFirstTurnHook?.nativePlayedDedenne??null),
    confirmedAbilities:rows.map(r=>
      r.ownerFirstTurnHook?.confirmedDedechange??null),
    settledDraws:rows.map(r=>
      r.ownerFirstTurnHook?.settledPhysicalDedechangeDraws??null),
    failures:rows.map(r=>({
      seat:r.seat,seed:r.seed,error:r.error,
      fallback:r.ownerFallback?.records?.[0]??null,
      abilityEvents:r.ownerFirstTurnHook?.abilityEvents??null
    })),qualifiedCompetitiveGames:0
  };
  console.log('AGENT50_RANK4_NATIVE_FIRSTTURN_DEDECHANGE',JSON.stringify(summary));
  assert.equal(rows.length,4);
  assert.ok(rows.every(r=>r.ownerFirstTurnHook),
    'No registered trial may omit its owner in-turn policy audit');
  assert.ok(rows.every(r=>r.ownerFallback?.originalNativeDecoderExecuted===false),
    'Unsafe original native State decoder must remain quarantined');
  assert.ok(rows.every(r=>r.qualifiedCompetitiveGames===0));
  if(selectV2)assert.ok(rows.some(r=>r.actorSelectIntents.length>0),
    'A frozen v2 arm should encounter a native owner SelectPrompt');
});
