'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {object} event @returns {object} */
function decisionSignature(event) {
  return {
    turn:event.before.turn,
    activePlayer:event.before.activePlayer,
    action:event.action,
    argument:event.typedAction || event.promptReplayAction || null,
    beforeZone:event.zoneDigestBefore,
    afterZone:event.zoneDigestAfter
  };
}

/** @param {object[]} a @param {object[]} b @returns {object|null} */
function firstDecisionDifference(a,b) {
  const length=Math.max(a.length,b.length);
  for(let i=0;i<length;i++) {
    const left=a[i] ? decisionSignature(a[i]) : null;
    const right=b[i] ? decisionSignature(b[i]) : null;
    if(JSON.stringify(left)!==JSON.stringify(right))
      return {rootStep:i,control:left,corrected:right};
  }
  return null;
}

/**
 * Observe a single actual root action without reading a speculative Store.
 * The observer records only detached printing names and attached Energy.
 * @template T
 * @param {Function} Store
 * @param {()=>T} run
 * @param {number} wantedStep
 * @returns {{result:T,observed:object|null}}
 */
function withSourceRootPrintingAudit(Store,run,wantedStep) {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(descriptor && typeof descriptor.value==='function');
  let sourceStore=null,rootStep=-1,observed=null;
  /** @param {object} state @param {object} action */
  const snapshot=(state,action)=>{
    const owner=state.players.find(p=>p.id===action.id);
    /** @param {object} slot */
    const pokemon=slot=>({
      printing:slot.getPokemonCard()?.fullName || null,
      attachedEnergy:slot.energies.cards.map(c=>c.fullName)
    });
    return {
      turn:state.turn,actorId:action.id,
      playedPrinting:owner?.hand.cards[action.handIndex]?.fullName || null,
      target:action.target ? {
        player:action.target.player,
        slot:action.target.slot,
        index:action.target.index
      } : null,
      ownActive:owner ? pokemon(owner.active):null,
      ownBench:owner ? owner.bench.map(pokemon):[]
    };
  };
  const wrapped=function inspectedSourceDispatch(action,...args) {
    if(!sourceStore && action?.constructor?.name==='AddPlayerAction')
      sourceStore=this;
    if(this!==sourceStore)return descriptor.value.apply(this,[action,...args]);
    rootStep++;
    if(rootStep===wantedStep)
      observed={rootStep,action:action.constructor.name,
        before:snapshot(this.state,action)};
    const result=descriptor.value.apply(this,[action,...args]);
    if(rootStep===wantedStep) observed.after=snapshot(this.state,action);
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:wrapped});
  try{return {result:run(),observed}}finally{
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

/** @param {object} game @returns {object} */
function summary(game) {
  return {
    winner:game.winner,
    finished:game.finished,
    firstTurnSlot:game.firstTurnSlot,
    turns:game.turns,
    actions:game.actions,
    remainingPrizes:game.prizesRemaining,
    turn27Seen:(game.copycatTurnStartEvidence || []).some(x=>x.turn===27),
    doubleDragonDecisions:(game.decisionTrace || [])
      .filter(x=>x.card==='Double Dragon Energy')
      .slice(0,8)
      .map(x=>({turn:x.turnBefore,slot:x.playerSlot,action:x.action}))
  };
}

/**
 * Controlled same-source comparison of disabling DDE recovery versus the
 * current v4 hook. Disabled DDE is an independent control, not an assertion
 * that it reconstructs the historically committed v3 tactic.
 */
function main() {
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(x=>[x.rank,x]));
  const opponent=byRank.get(10),candidate=byRank.get(1);
  assert.ok(opponent?.playableUnderEngine && candidate?.playableUnderEngine);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const trials=plan.trials.filter(t=>t.phase==='pilot' &&
    t.rank===10 && t.candidateId==='champion-reference' &&
    t.repeat===0 && t.candidateEngineSlot==='B');
  assert.equal(trials.length,1);
  assert.equal(trials[0].seed,4246551499);
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const common={
    deckA:opponent.cardIds,deckB:candidate.cardIds,
    seed:trials[0].seed,maxActions:350,label:trials[0].trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureCopycatTurnStartSeat:1,
    postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const capture=doubleDragonRecovery=>{
    const audited=withSourceRootPrintingAudit(Store,
      ()=>withStoreDispatchTranscript(
        Store,()=>runMatch({...common,doubleDragonRecovery}),{
          liveStoreOnly:true,typedActionValues:true,
          promptReferenceActionValues:true,sourceZoneEveryDispatch:true
        }),15);
    return {...audited.result,turn2SourceAudit:audited.observed};
  };
  const noRecovery=capture(false);
  const currentV4=capture(true);
  const repeat=capture(false);
  assert.deepEqual(repeat.result,noRecovery.result,
    'No-DDE control summary changed after the current-v4 policy run');
  assert.deepEqual(repeat.actionTrace.map(decisionSignature),
    noRecovery.actionTrace.map(decisionSignature),
    'No-DDE control source actions changed after the current-v4 run');
  assert.equal(noRecovery.result.firstTurnSlot,1);
  assert.equal(currentV4.result.firstTurnSlot,1);
  return {
    kind:'rank10-double-dragon-policy-source-trajectory-differential',
    qualification:'diagnostic-only',
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    source:{opponentRank:10,candidateRank:1,
      seed:trials[0].seed,physicalCandidateSlot:'B',
      planDigest:plan.planDigest},
    comparison:{
      control:'DDE recovery disabled',
      experiment:require('./dde-attach-tactic.cjs').DDE_POLICY_VERSION,
      caveat:'DDE disabled is not a verified exact historical v3 replay'
    },
    noDdeControl:summary(noRecovery.result),
    currentV4:summary(currentV4.result),
    rootDispatchCounts:{
      control:noRecovery.actionTrace.length,
      v4:currentV4.actionTrace.length
    },
    firstChangedSourceRoot: firstDecisionDifference(
      noRecovery.actionTrace,currentV4.actionTrace),
    turn2PrintedAction: {
      control:noRecovery.turn2SourceAudit,
      v4:currentV4.turn2SourceAudit
    },
    repeatControlIdentical:true,
    limitations:[
      'Single source-dealt seed and engine seat',
      'Control suppresses DDE entirely; historical v3 may differ',
      'Root trajectory comparison cannot validate decision competence',
      'No independent paper-rule or simulator clone certification'
    ]
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={decisionSignature,firstDecisionDifference,main};
