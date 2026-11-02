'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {frozenSchedule,commonSymmetricPolicy}=
  require('./agent7-rank8-vip-box-native-prospective.cjs');
const {withRank8AuthenticK0Observer}=
  require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
const {withPaperPromptContractPortfolio,VERSION:PAPER_VERSION}=
  require('../twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {secretBoxPaymentNegative}=
  require('../twinleaf/agent4-secret-box-paper-payment-hook.cjs');

const VERSION='agent4-rank8-retrospective-source-vip-box-v11-cost-contrast-v1';
const POSITIVE_INDICES=Object.freeze([683,694,756]);
const ROOT=path.resolve(__dirname,'../..');

/**
 * One real live Store and paper source-marked Secret Box prompt, observed
 * without modifying chosen actions. Keep concealed source hand identities
 * out of receipts. Guarded arm may veto before this observer sees an answer.
 *
 * @template T
 * @param {Function} Store Native Store constructor
 * @param {0|1} sourceSeat Original source physical seat
 * @param {()=>T} run
 * @returns {{result:T,audit:object}}
 */
function withSourceBoxPaymentObserver(Store,sourceSeat,run){
  assert.equal(typeof run,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const audit={liveStores:0,sourceOwnedPrompts:0,otherPrompts:0,
    sourceAccepted:0,sourceRejected:0,
    paperInvalidNativeAccepted:0,observations:[]};
  let live=null;
  function dispatch(action,...args){
    if(!live&&action?.constructor?.name==='AddPlayerAction'){
      live=this;audit.liveStores++;
    }
    const prompt=live===this&&
      action?.constructor?.name==='ResolvePromptAction'?
      this.state?.prompts?.find(p=>
        p.id===action.id&&p.result===undefined):null;
    const qualifies=prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt?.sourceCard?.fullName==='Secret Box TWM'&&
      prompt?.message==='CHOOSE_CARD_TO_DISCARD';
    if(!qualifies)return descriptor.value.call(this,action,...args);
    const owner=this.state.players.find(p=>p.id===prompt.playerId);
    const sourceOwned=owner===this.state.players[sourceSeat];
    const reason=secretBoxPaymentNegative(prompt,action.result,owner);
    let thrown=null,result;
    try {result=descriptor.value.call(this,action,...args);}
    catch(error){thrown=error;}
    const accepted=thrown===null&&prompt.result!==undefined;
    audit[sourceOwned?'sourceOwnedPrompts':'otherPrompts']++;
    if(sourceOwned){
      if(accepted)audit.sourceAccepted++;else audit.sourceRejected++;
      if(accepted&&reason!==null)audit.paperInvalidNativeAccepted++;
    }
    audit.observations.push({sourceOwned,selectedCount:
      Array.isArray(action.result)?action.result.length:null,
      physicalPaymentValid:reason===null,paperNegativeReason:reason,
      nativeAccepted:accepted,
      nativeError:thrown?String(thrown.message??thrown):null});
    if(thrown)throw thrown;
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

/**
 * Retrospectively selected by Agent7's completed 128-pair original-source
 * report. Does NOT form new prospective or independent field evidence.
 * Contrast exactly the same VIP-first policy with shared v11 paper cost
 * adapter disabled/enabled under the same initial physical source seed.
 */
function run(){
  assert.match(PAPER_VERSION,/v11-secret-box-physical-payment$/);
  const selected=frozenSchedule().filter(r=>
    POSITIVE_INDICES.includes(Number(r.trial.split(':').at(-1))));
  assert.equal(selected.length,3);
  assert.deepEqual(selected.map(r=>Number(r.trial.split(':').at(-1))),
    [...POSITIVE_INDICES]);
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(d=>d.rank===8);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  initializeCards();
  const {Store}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const rows=[];
  for(const t of selected){
    const arms=[];
    for(const guarded of [false,true]){
      const request={
        deckA:t.sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:t.sourceSeat===1?source.cards:plan.candidate.cards,
        seed:t.seed,maxActions:120,
        strictPromptValidation:true,forestSealSearchCorrection:true,
        doubleDragonRecovery:true,supporterDecisionCorrection:true,
        isolatePolicyRandomness:true,
        leleEntryAbilityLockCorrection:true,
        radiantGateLockCorrection:true,entryDrawLockCorrection:true,
        captureDecisionTrace:true,
        label:'agent4-rank8-retrospective-v11-'+t.trial+'-'+
          (guarded?'guarded':'control')
      };
      const record={guarded,status:null,error:null,sourceK0:null,
        paperAudit:null,rawPaymentAudit:null,sourceBoxRoots:[],
        sourceShakeRoots:[],sourceVipRoots:[],sourceBoxPolicy:null,
        sourceVipPolicy:null,sourceActualFirst:null,
        initialDeckHashes:null,firstTurnSlot:null,
        rootLedgerDigest:null,actions:null,finished:null};
      try{
        const observed=withRank8AuthenticK0Observer(Store,t.sourceSeat,()=>
          withSourceBoxPaymentObserver(Store,t.sourceSeat,()=>{
            const doMatch=()=>commonSymmetricPolicy(()=>
              runMatch(request),true,true);
            return guarded?
              withPaperPromptContractPortfolio(doMatch,{
                requireLiveStore:true,
                currentTrialId:()=>t.trial+':paper-v11'
              }):{result:doMatch(),audit:null};
          }));
        const {result:paper, audit:watch}=observed.result;
        const played=paper.result;
        const game=played.result;
        record.status='COMPLETED_NATIVE_ATTEMPT';
        record.sourceK0=observed.sourceK0;
        record.paperAudit=paper.audit;
        record.rawPaymentAudit=watch;
        record.initialDeckHashes=game.deckHashes;
        record.firstTurnSlot=game.firstTurnSlot;
        record.sourceActualFirst=game.firstTurnSlot===t.sourceSeat;
        record.actions=game.actions;
        record.finished=game.finished;
        const roots=game.rootActionLedger??[];
        for(const [key,name] of [
          ['sourceBoxRoots','Secret Box'],
          ['sourceShakeRoots','Boost Shake'],
          ['sourceVipRoots','Battle VIP Pass']
        ])record[key]=roots.filter(x=>x.playerSlot===t.sourceSeat&&
          x.action==='PlayCardAction'&&x.card===name&&
          x.pendingPrompt===null).map(x=>({
          ordinal:x.actionOrdinal,turn:x.turnBefore,card:x.card
        }));
        record.sourceBoxPolicy=played.audit?.box?.offers?.
          filter(x=>x.seat===t.sourceSeat).length??null;
        record.sourceVipPolicy=played.vipAudit?.offers?.
          filter(x=>x.seat===t.sourceSeat).length??null;
      }catch(error){
        record.status='NATIVE_ABORT';
        record.error=String(error?.message??error);
        record.paperAbortAudit=error?.agent41UnifiedPaperPromptPortfolio??
          error?.cause?.agent41UnifiedPaperPromptPortfolio??null;
      }
      arms.push(record);
    }
    const [control,treatment]=arms;
    const comparable=control.status==='COMPLETED_NATIVE_ATTEMPT'&&
      treatment.status==='COMPLETED_NATIVE_ATTEMPT';
    if(comparable){
      assert.deepEqual(control.sourceK0,treatment.sourceK0,
        'Same source prechoice K0 must match after v11 toggle');
      assert.deepEqual(control.initialDeckHashes,treatment.initialDeckHashes,
        'Same complete source physical deal must match after v11 toggle');
      assert.equal(control.firstTurnSlot,treatment.firstTurnSlot,
        'Identical underlying seed must produce same starter');
    }
    rows.push({trial:t.trial,sourceSeat:t.sourceSeat,seed:t.seed,
      sameInitialDealCertified:comparable,
      sourceK0SameWhenCertified:comparable,
      control,treatment});
  }
  return {schema:VERSION,evidence:'retrospective-paper-cost-diagnostic',
    sourceRank:8,sourceOriginal60:true,
    positiveIndices:[...POSITIVE_INDICES],
    originalProspectiveSchedule:'agent7-rank8-vip-box-native-prospective-20261102',
    originalRunId:41454932782,
    enginePin:plan.engineRevision,
    candidateId:'hood-shadow-rider-original-60',
    sourcePrintedSixtyDigest:source.deckHash??null,
    sourcePolicy:'same-owner-visible-canonical-plus-native-vip-first-box-shake',
    onlyPaperDifference:'default-off v11 Secret Box physical three-card payment veto',
    commonPaperPortfolioVersion:PAPER_VERSION,
    trials:rows.length,nativeAttempts:rows.length*2,
    sourceSeatCounts:{0:rows.filter(x=>x.sourceSeat===0).length,
      1:rows.filter(x=>x.sourceSeat===1).length},
    paperInvalidOriginalSourcePaymentsAccepted:rows.reduce((n,r)=>
      n+(r.control.rawPaymentAudit?.paperInvalidNativeAccepted??0),0),
    v11VetoedSourceOrOtherPayments:rows.reduce((n,r)=>
      n+(r.treatment.paperAudit?.vetoedBeforeDispatch??0),0),
    rows,competitiveQualifiedGames:0,
    interpretation:'Retrospectively selected only three exposed source deals. Neither independent prospective source rate nor qualified game or real win rate.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,POSITIVE_INDICES,withSourceBoxPaymentObserver,run};
