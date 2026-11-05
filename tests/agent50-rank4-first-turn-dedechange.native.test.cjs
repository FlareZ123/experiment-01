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
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
assert.equal(plan.engineRevision,PIN);
const source=plan.opponents.find(x=>x.rank===4);
assert.equal(source?.status,'ready');
const frozen=[
  {seat:0,seed:20261123},
  {seat:1,seed:20261125},
  {seat:1,seed:20261129},
  {seat:1,seed:20261132}
];

/** @param {{seat:number,seed:number}} trial @returns {object} */
function attempt({seat,seed}){
  let thrown=null,returned=false;
  let inner=null;
  try{
    inner=withNativeRawStateFallbackQuarantine(()=>
      withOwnerSetupConfirm(()=>
        withGoFirstChoice(
          seat===0?[true,false]:[false,true],()=>
            withOwnerPublicAcknowledgements(()=>
              withOwnerEntryPriorityOpening(()=>
                withOwnerOpeningStoreReceipt(()=>
                  withOwnerFirstTurnDedechange(()=>runMatch({
                    deckA:seat===0?source.cards:plan.candidate.cards,
                    deckB:seat===1?source.cards:plan.candidate.cards,
                    seed,maxActions:80,captureNativeAbortEvidence:true
                  }),{sourceSeat:seat}),{sourceSeat:seat})
                )
              )
            )
        )
      ,{maxRecords:8});
    returned=true;
  }catch(e){
    thrown=e;
  }
  const guard=thrown?.nativeRawStateFallbackQuarantine??null;
  const setup=thrown?.ownerOpeningStoreReceiptAudit??null;
  const hook=thrown?.agent50FirstTurnDedechangeAudit??null;
  return {
    schema:VERSION,
    registration:'results/methodology/registrations/agent50-rank4-first-turn-dedechange-native-v1-20261105.md',
    sourceRank:4,seat,seed,pinnedEngine:PIN,
    source60Sha256:createHash('sha256')
      .update(JSON.stringify(source.cards)).digest('hex'),
    candidate60Sha256:createHash('sha256')
      .update(JSON.stringify(plan.candidate.cards)).digest('hex'),
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
    schema:VERSION,registered:rows.length,
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
});
