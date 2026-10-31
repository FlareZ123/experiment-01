'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {inspectRank8K0BoxShake}=
  require('./agent44-rank8-box-k0-window.cjs');

const VERSION='agent44-rank8-authentic-source-k0-first-owner-root-v1';
const SCHEDULE_LABEL='agent44-original-rank8-preregistered-box-k0-20261030';
const COUNT=48;
const EXTENSION_START=48;
const EXTENSION_COUNT=208;
const MAX_ACTIONS=80;

/**
 * Deterministic schedule committed before any trial was run.
 * Seat alternation and hash-derived unsigned 32-bit seeds are fixed.
 * @param {number} [start]
 * @param {number} [count]
 * @returns {{trial:string,sourceSeat:0|1,seed:number}[]}
 */
function schedule(start=0,count=COUNT){
  assert.ok(Number.isSafeInteger(start)&&start>=0);
  assert.ok(Number.isSafeInteger(count)&&count>0);
  return Array.from({length:count},(_,offset)=>{
    const i=start+offset;
    return {
      trial:'rank8-original-box-k0:'+i,
      sourceSeat:i%2,
      seed:crypto.createHash('sha256')
        .update(SCHEDULE_LABEL+':'+i).digest().readUInt32BE(0)
    };
  });
}

/**
 * Capture just the first owner-root snapshot of a source rank8 first
 * player turn. Never read unknown deck contents, Prize identities, or
 * opposing concealed hand. Keep native Store untouched and return safely.
 * @param {object} state Genuine pinned Store state.
 * @param {0|1} sourceSeat Original-source physical seat.
 * @returns {object}
 */
function observedSourceK0(state,sourceSeat){
  const owner=state.players[sourceSeat];
  const bench=owner.bench.map(slot=>slot.getPokemonCard()?.name??null);
  const tools=owner.bench.map(slot=>slot.tools.map(card=>card.name));
  const view={
    handNames:owner.hand.cards.map(card=>card.name),
    activeName:owner.active.getPokemonCard()?.name??null,
    benchNames:bench,benchTools:tools,
    itemLocked:owner.cannotPlayItemCards===true,
    toolLocked:owner.cannotPlayToolCards===true
  };
  return {
    turn:state.turn,
    sourceSeat,
    ownerHandPrintings:owner.hand.cards.map(card=>card.fullName),
    visibleActive:owner.active.getPokemonCard()?.fullName??null,
    visibleBench:bench,
    visibleAttachedTools:tools,
    ownDeckCount:owner.deck.cards.length,
    ownPrizeCount:owner.prizes.reduce((total,slot)=>
      total+slot.cards.length,0),
    offeredWindow:inspectRank8K0BoxShake(view)
  };
}

/**
 * Noninterfering Store dispatch wrapper, restricted to first authenticated
 * live AddPlayerAction Store. Captures the K0 state at first natural source
 * owner action before dispatch, then restores the original descriptor.
 *
 * @template T
 * @param {Function} Store Genuine native Store class.
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @param {object} [options] Dependency injection for a pure fake Store test.
 * @returns {{result:T,sourceK0:object|null,liveRootObserved:boolean}}
 */
function withRank8AuthenticK0Observer(Store,sourceSeat,execute,options={}){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const GamePhase=options.GamePhase??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/state/state')).GamePhase;
  let live=null,sourceK0=null,liveRootObserved=false;
  function observer(...args){
    const action=args[0];
    if(live===null&&action?.constructor?.name==='AddPlayerAction')
      live=this;
    if(this===live&&sourceK0===null){
      const state=this.state;
      if(state.players?.length===2 &&
         state.activePlayer===sourceSeat&&
         state.phase===GamePhase.PLAYER_TURN&&
         !state.prompts?.some(p=>p.result===undefined)){
        sourceK0=observedSourceK0(state,sourceSeat);
        liveRootObserved=true;
      }
    }
    return original.value.apply(this,args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:observer});
  try {
    const result=execute();
    return {result,sourceK0,liveRootObserved};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

/** @param {object} game */
function gameSummary(game){
  return {
    firstTurnSlot:game.firstTurnSlot,
    sourceDeckHashes:game.deckHashes,
    actions:game.actions,
    finished:game.finished,
    verifiedByDrawLog:game.verifiedByDrawLog
  };
}

/**
 * Screen all predeclared original rank8 source deals under an unmodified AI.
 * Reports every failed, capped and missing-root row. This is neither a Box
 * decision policy nor a competitively valid matched game.
 */
function run({startIndex=0,count=COUNT}={}){
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(deck=>deck.rank===8);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const rows=schedule(startIndex,count);
  assert.equal(new Set(rows.map(r=>r.seed)).size,rows.length);
  const digest=crypto.createHash('sha256')
    .update(JSON.stringify(rows)).digest('hex');
  const trials=[];
  const controlBySeat={0:0,1:0};
  for(const row of rows){
    const request={
      deckA:row.sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:row.sourceSeat===1?source.cards:plan.candidate.cards,
      seed:row.seed,maxActions:MAX_ACTIONS,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true,
      captureDecisionTrace:true,label:row.trial
    };
    try {
      const observed=withRank8AuthenticK0Observer(Store,row.sourceSeat,
        ()=>runMatch(request));
      const game=observed.result;
      const record={
        ...row,
        sourceActualFirst:game.firstTurnSlot===row.sourceSeat,
        sourceK0:observed.sourceK0,
        liveRootObserved:observed.liveRootObserved,
        game:gameSummary(game),
        noOpFullDecisionTraceParity:null,error:null
      };
      if(observed.sourceK0!==null&&
         !observed.sourceK0.offeredWindow.anyK0Window&&
         controlBySeat[row.sourceSeat]<2){
        const control=runMatch(request);
        assert.deepEqual(game.deckHashes,control.deckHashes,
          'Control deck fingerprint differs');
        assert.equal(game.firstTurnSlot,control.firstTurnSlot,
          'Control physical first-turn orientation differs');
        assert.deepEqual(game.decisionTrace,control.decisionTrace,
          'Read-only Store observer altered native root decisions');
        record.noOpFullDecisionTraceParity=true;
        controlBySeat[row.sourceSeat]++;
      }
      trials.push(record);
    }catch(failure){
      trials.push({...row,sourceActualFirst:null,
        sourceK0:null,liveRootObserved:false,game:null,
        noOpFullDecisionTraceParity:null,error:{
          name:failure.name??null,message:String(failure.message??failure)
        }});
    }
  }
  const countFlag=field=>trials.filter(row=>
    row.sourceK0?.offeredWindow?.[field]===true).length;
  return {
    schema:VERSION,
    sourceRank:8,originalSource60:true,candidateId:'hood-shadow-rider',
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    engineRevision:plan.engineRevision,
    scheduleLabel:SCHEDULE_LABEL,scheduleDigest:digest,
    startIndex,count,
    maxActions:MAX_ACTIONS,trialCount:rows.length,
    actualSourceStarts:{
      first:trials.filter(t=>t.sourceActualFirst===true).length,
      second:trials.filter(t=>t.sourceActualFirst===false).length
    },
    observedOwnerK0:trials.filter(t=>t.liveRootObserved).length,
    observedCardFunnel:{
      heldBox:trials.filter(t=>t.sourceK0?.offeredWindow.boxHeld).length,
      heldShake:trials.filter(t=>t.sourceK0?.offeredWindow.shakeHeld).length,
      heldBoxWithoutShake:trials.filter(t=>t.sourceK0?.offeredWindow.boxHeld&&
        !t.sourceK0.offeredWindow.shakeHeld).length,
      heldBoxWithTrubbishAccessible:trials.filter(t=>
        t.sourceK0?.offeredWindow.boxHeld&&
        (t.sourceK0.offeredWindow.inPlayTrubbish||
          t.sourceK0.offeredWindow.trubbishHeld||
          t.sourceK0.offeredWindow.availableItems.length>0)).length,
      heldBoxWithThreePhysicalDiscards:trials.filter(t=>
        t.sourceK0?.offeredWindow.boxThreePhysicalDiscardCapacity).length,
      handSizeHistogram:Object.fromEntries([...new Set(trials
        .filter(t=>t.sourceK0)
        .map(t=>t.sourceK0.ownerHandPrintings.length))]
        .sort((a,b)=>a-b).map(size=>[size,trials.filter(t=>
          t.sourceK0?.ownerHandPrintings.length===size).length]))
    },
    exposed:{
      boxFetchShakeK0:countFlag('boxFetchShake'),
      boxFetchShakeNeedsPostBoxAuxiliaryPayment:
        countFlag('boxFetchShakePotentialAuxiliaryPayment'),
      anyStrictOrConditionalPostBoxAuxiliary:
        countFlag('anyK0OrConditionalAuxiliaryWindow'),
      boxHeldShakeK0:countFlag('boxHeldShake'),
      directShakeK0:countFlag('directShake'),
      anyK0Window:countFlag('anyK0Window')
    },
    failedTrials:trials.filter(t=>t.error).length,
    noOpControlsPassed:trials.filter(t=>t.noOpFullDecisionTraceParity).length,
    trials,
    competitiveQualifiedGames:0,
    caveat:'A read-only original pinned Store K0 source-hand snapshot. No card-deck/Prize truth is accessible to the observer. No action was changed; all search availability, competing uses, discards beyond raw physical capacity, payment acceptances, opponent play and completed games remain unverified.'
  };
}

if(require.main===module){
  const expanded=process.env.AGENT44_RANK8_K0_EXTENSION==='true';
  const result=expanded?run({startIndex:EXTENSION_START,
    count:EXTENSION_COUNT}):run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,SCHEDULE_LABEL,COUNT,EXTENSION_START,
  EXTENSION_COUNT,MAX_ACTIONS,schedule,
  observedSourceK0,withRank8AuthenticK0Observer,run};
