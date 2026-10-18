'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {isDeepStrictEqual}=require('node:util');
const {captureTacticScores,compareTacticScores}=require('./tactic-score-trace.cjs');
const {runMatch,initializeCards,seededRandom}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');
const {stateGraphFingerprint}=
  require('./rank10-live-decision-noninterference.cjs');
const {assertVendorCloneCompatibleSource,normalizeDeepClonePrototypes}=
  require('./normalize-deep-clone.cjs');
const {swapHiddenPrize}=require('./prize-membership-live-probe.cjs');
const {sourceZoneSnapshot,zoneSnapshotDigest}=require('./source-zone-checkpoint.cjs');
const {observableState,hash:sourceStateDigest}=require('./source-state-continuity.cjs');

/** @param {object|null|undefined} action */
function actionSignature(action) {
  return action?{
    type:action.constructor.name,
    data:JSON.stringify(action)
  }:null;
}

/**
 * Compare one decision made on independently detached State copies. Only the
 * acting player's unknown deck permutation differs. This is a sensitivity
 * probe, not an assertion that K1 or a remembered-top-card condition holds.
 *
 * @param {object} state Real physical State, read only.
 * @param {number} actorId Acting player's ID.
 * @param {()=>object} newBot Builds an independent bot for one world.
 * @param {(state:object)=>object} cloneState Detaches every mutable source Card.
 * @param {()=>()=>number} makeRandom Fresh equal-seeded policy PRNG.
 * @returns {object} Nonprivate comparison record.
 */
function compareHiddenDeckOrders(state,actorId,newBot,cloneState,makeRandom) {
  const realPlayer=state.players.find(p=>p.id===actorId);
  assert.ok(realPlayer,'Source world has no acting player');
  const pre=stateGraphFingerprint(state);
  const base=cloneState(state),reverse=cloneState(state);
  assert.notStrictEqual(base,state);
  assert.notStrictEqual(reverse,state);
  const player=reverse.players.find(p=>p.id===actorId);
  assert.ok(player);
  const before=player.deck.cards.map(c=>[c.fullName,c.id]);
  assert.ok(before.length>=2,'Counterfactual requires two deck cards');
  player.deck.cards.reverse();
  assert.deepEqual(player.deck.cards.map(c=>[c.fullName,c.id]).reverse(),before);
  const evaluate=world=>{
    const randomBefore=Math.random;
    Math.random=makeRandom();
    try {
      const bot=newBot();
      const scored=captureTacticScores(bot,()=>bot.decodeNextAction(world));
      return {action:actionSignature(scored.result),scores:scored.trace};
    } finally {
      Math.random=randomBefore;
    }
  };
  const physical=evaluate(base),reversed=evaluate(reverse);
  const physicalOrder=physical.action,reversedOrder=reversed.action;
  const post=stateGraphFingerprint(state);
  assert.deepEqual(post,pre,'Counterfactual lookahead changed live Store State');
  return {
    actorId,deckCards:before.length,
    physicalOrder,reversedOrder,
    tacticScoreComparison:compareTacticScores(physical.scores,reversed.scores),
    actionSensitiveToHiddenDeckOrder:
      JSON.stringify(physicalOrder)!==JSON.stringify(reversedOrder),
    liveStatePreserved:true,
    rootStateDigest:pre.digest,
    knownDeckMembershipVerified:false,
    knownDeckTopOrderVerified:false,
    qualification:'exploratory-deck-order-sensitivity-only'
  };
}

/**
 * Intercept one genuine root policy call while keeping probe randomness and
 * all cloned game objects independent from the live match. The actual action
 * is computed normally after the probe.
 * @template T
 * @param {Function} Ai
 * @param {()=>T} work
 * @param {(state:object)=>object} cloneState
 * @param {{turn:number,seat:number,makeRandom:()=>()=>number,rootActionOrdinal?:number,readRootDispatchCount?:()=>number,readOwnerDeckSearches?:()=>object,probePrizeMembership?:boolean}} target
 */
function withRootHiddenOrderProbe(Ai,work,cloneState,target) {
  const descriptor=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  assert.ok(descriptor&&typeof descriptor.value==='function');
  const events=[];
  function wrapped(state) {
    const take=events.length===0&&state.turn===target.turn&&
      state.activePlayer===target.seat&&
      state.prompts.every(p=>p.result!==undefined)&&
      (target.rootActionOrdinal===undefined ||
        target.readRootDispatchCount?.()===target.rootActionOrdinal);
    if(!take)return descriptor.value.call(this,state);
    const parent=this;
    const freshBot=()=>{
      const bot=new Ai({id:parent.client.id},parent.tactics[0].options,parent.deck);
      // Always bypass the root interception on independent detached bots.
      bot.decodeNextAction=descriptor.value.bind(bot);
      return bot;
    };
    const observed=compareHiddenDeckOrders(
      state,this.client.id,freshBot,cloneState,target.makeRandom);
    const prizeMembership=target.probePrizeMembership===true?
      swapHiddenPrize(state,this.client.id,cloneState,world=>{
        const previous=Math.random;
        Math.random=target.makeRandom();
        try{return actionSignature(freshBot().decodeNextAction(world))}
        finally{Math.random=previous}
      },stateGraphFingerprint):null;
    const sourceHand=state.players.find(p=>p.id===this.client.id)
      ?.hand?.cards?.map(card=>card.fullName)??[];
    const actual=descriptor.value.call(this,state);
    const actualAction=actionSignature(actual);
    // A freshly constructed detached bot may not reproduce the live bot's
    // hidden internal state or policy RNG. Distinguish its paired-world
    // sensitivity from sensitivity of the *actual* source decision.
    const baselineActionMatchedActual=isDeepStrictEqual(
      observed.physicalOrder,actualAction);
    const playedPrinting=actual?.constructor?.name==='PlayCardAction'?
      sourceHand[actual.handIndex]??null:null;
    events.push({...observed,...(prizeMembership?{prizeMembership}:{}),
      turn:state.turn,seat:state.activePlayer,
      originalSourcePlayedPrinting:playedPrinting,
      rootActionOrdinal:target.rootActionOrdinal??null,
      ownerDeckSearchWitness:target.readOwnerDeckSearches?.()??null,
      baselineActionMatchedActual,
      sourceDecisionSensitivityInterpretable:baselineActionMatchedActual,
      originalSourceAction:actualAction});
    return actual;
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...descriptor,value:wrapped
  });
  try{return {result:work(),events};}
  finally{Object.defineProperty(Ai.prototype,'decodeNextAction',descriptor);}
}

/**
 * Track only dispatched actions on the authentic root Store, ignoring
 * speculative Simulator stores. Counter includes both player registration
 * actions, matching the rank-10 source-ordinal replay protocol.
 * @template T
 * @param {Function} Store
 * @param {(getOrdinal:()=>number,getOwnerDeckSearches:()=>object,getBoundary:()=>object|null)=>T} work
 * @param {0|1} [ownerSeat] Seat whose actual whole-deck search is observed.
 * @param {number|null} [wantedBoundary] Zero-based root Store action step.
 * @returns {T}
 */
function withRootDispatchCounter(Store,work,ownerSeat=1,wantedBoundary=null,boundaryDigest=null,historyDigest=null) {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(descriptor && typeof descriptor.value==='function');
  let root=null,count=0,boundary=null;
  const observedPromptIds=new Set(),ownerDeckSearches=[];
  const wrapped=function(...args) {
    if(root===null && args[0]?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root && count===wantedBoundary){
      const state=this.state;
      boundary={
        rootStep:count,turn:state.turn,activePlayer:state.activePlayer,
        dispatchedAction:args[0]?.constructor?.name??null,
        ...(boundaryDigest?{zoneDigestBefore:boundaryDigest(state)}:{}),
        ...(historyDigest?{continuityDigestBefore:historyDigest(state)}:{}),
        unresolvedPromptTypes:state.prompts
          .filter(prompt=>prompt.result===undefined)
          .map(prompt=>prompt.constructor.name)
      };
    }
    if(this===root)count++;
    const result=descriptor.value.apply(this,args);
    if(this===root) {
      const state=this.state,owner=state?.players?.[ownerSeat];
      if(owner) for(const prompt of state.prompts) {
        if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
            prompt.playerId===owner.id &&
            prompt.result===undefined && prompt.cards===owner.deck &&
            !observedPromptIds.has(prompt.id)) {
          observedPromptIds.add(prompt.id);
          ownerDeckSearches.push({ordinal:count,turn:state.turn});
        }
      }
    }
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:wrapped});
  try{return work(()=>count,()=>({
    observedWholeOwnerDeckSearches:ownerDeckSearches.length,
    first:ownerDeckSearches[0]??null,
    last:ownerDeckSearches.at(-1)??null
  }),()=>boundary,()=>root?.state??null);}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

/**
 * Historical root 215 requires the v3 Double Dragon tactic AND the
 * turn-27 Copycat/Apex/Timeless intervention. The unmodified v3 control
 * takes a different path and reaches a turn-29 PlayCard at root 215.
 * New turn-2 research keeps the current v4 profile.
 * @param {number|undefined} rootActionOrdinal
 * @returns {{doubleDragonRecovery:boolean,doubleDragonArchiveV3:boolean}}
 */
function sourcePolicyForOrdinal(rootActionOrdinal) {
  assert.ok(rootActionOrdinal===undefined || rootActionOrdinal===215,
    'Only archived decisive root ordinal 215 is admitted');
  return {
    doubleDragonRecovery:true,
    doubleDragonArchiveV3:rootActionOrdinal===215,
    ...(rootActionOrdinal===215 ? {
      mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:1,
      mimikyuTurn27SetupSeat:1
    } : {})
  };
}

/** Source-dealt, frozen-seat exploratory sensitivity measurement. */
function auditRank10HiddenOrder(rootActionOrdinal) {
  const policy=sourcePolicyForOrdinal(rootActionOrdinal);
  initializeCards();
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,
      allowJapanesePromoHooks:true
    });
  const decks=new Map(field.decks.map(d=>[d.rank,d]));
  const rank1=decks.get(1),rank10=decks.get(10);
  assert.ok(rank1?.playableUnderEngine&&rank10?.playableUnderEngine);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const trials=plan.trials.filter(t=>t.phase==='pilot'&&t.rank===10&&
    t.repeat===0&&t.candidateId==='champion-reference'&&
    t.candidateEngineSlot==='B');
  assert.equal(trials.length,1);
  assert.equal(trials[0].seed,4246551499);
  const common={
    deckA:rank10.cardIds,deckB:rank1.cardIds,
    seed:trials[0].seed,maxActions:350,label:trials[0].trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,...policy,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=
    require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {deepClone}=require(path.join(output,'utils'));
  const cloneState=state=>{
    assertVendorCloneCompatibleSource(state);
    return normalizeDeepClonePrototypes(state,deepClone(state));
  };
  const control=runMatch(common);
  const archival=rootActionOrdinal===215;
  // Current v4 root15 is the real turn2 Double Dragon attachment.
  // The historical Timeless setup branch targets turn28 root215; archival
  // Double Dragon alone instead reaches the control's turn29 PlayCard.
  const ordinal=archival?215:15,actorSeat=archival?1:0;
  const makeTarget=getOrdinal=>({
    turn:archival?28:2,
    seat:actorSeat,makeRandom:()=>seededRandom(20261017),
    rootActionOrdinal:ordinal,readRootDispatchCount:getOrdinal,
    probePrizeMembership:!archival
  });
  const observed=withRootDispatchCounter(
    require(path.join(output,'game/store/store')).Store,
    (getOrdinal,getOwnerDeckSearches,getBoundary)=>{
      const run=withRootHiddenOrderProbe(
        SimpleTacticsAi,()=>runMatch(common),cloneState,
        {...makeTarget(getOrdinal),readOwnerDeckSearches:getOwnerDeckSearches});
      return {...run,sourceOrdinalBoundary:getBoundary()};
    },
    actorSeat,ordinal,state=>zoneSnapshotDigest(sourceZoneSnapshot(state)),
    state=>sourceStateDigest(observableState(state)));
  assert.deepEqual(observed.result,control,
    'Read-only hidden-order counterfactual changed physical source match');
  assert.ok(observed.events.length<=1,
    'A single rooted hidden-order probe must not run more than once');
  if(observed.events.length===0) {
    assert.ok(archival,'Current-v4 root 15 must be exposed on frozen source');
    return {
      study:'rank10-archive-v3-root215-non-exposure',
      pinnedTrialId:trials[0].trialId,seed:trials[0].seed,
      candidatePhysicalSeat:1,observedActorSeat:1,
      observedRootActionOrdinal:215,
      doubleDragonPolicy:'historical-v3-archive',
      exposed:false,root:null,
      completedSource:{
        finished:control.finished,turns:control.turns,
        actions:control.actions,winner:control.winner
      },
      matchedUninstrumentedMatch:true,
      sourceOrdinalBoundary:observed.sourceOrdinalBoundary,
      qualifiedForCompetitiveInference:false,
      conclusion:'Reconstructed v3 root215 had no observed AI decode callback',
      limitations:[
        'No hidden-order comparison was executed at root 215',
        'Replay prefix identity was not established',
        'This historical-policy non-exposure is not a current-v4 policy result'
      ]
    };
  }
  assert.equal(observed.events[0].baselineActionMatchedActual,true,
    'Detached baseline policy does not reproduce actual root source action');
  assert.equal(observed.events[0].originalSourceAction?.type,
    archival?'RetreatAction':'PlayCardAction',
    'Restored historical turn28 must propose Retreat, not a control-line PlayCard');
  if(archival) assert.equal(observed.sourceOrdinalBoundary.zoneDigestBefore,
    '5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d');
  if(archival) assert.equal(observed.sourceOrdinalBoundary.continuityDigestBefore,
    '0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548');
  if(!archival)
    assert.equal(observed.events[0].originalSourcePlayedPrinting,
      'Double Dragon Energy ROS',
      'Current-v4 root 15 must be the observed source DDE attachment');
  return {
    study:archival?
      'rank10-reconstructed-v3-source-ordinal215-hidden-order-sensitivity':
      'rank10-current-v4-source-root15-hidden-order-sensitivity',
    pinnedTrialId:trials[0].trialId,
    seed:trials[0].seed,
    candidatePhysicalSeat:1,
    observedActorSeat:actorSeat,
    observedRootActionOrdinal:ordinal,
    doubleDragonPolicy:policy.doubleDragonArchiveV3?
      'historical-v3-archive':'current-v4',
    sourceArm:archival?'v3-timeless-turn27-intervention':'v4-original-control',
    exposed:true,root:observed.events[0],
    sourceOrdinalBoundary:observed.sourceOrdinalBoundary,
    sourceZoneFingerprintSchema:'source-zone-and-turn-flags-v1',
    matchedUninstrumentedMatch:true,
    sourceTerminal:{winner:control.winner,turns:control.turns,
      actions:control.actions,prizesRemaining:control.prizesRemaining},
    qualifiedForCompetitiveInference:false,
    limitations:[
      'K1 deck membership and remembered top order are not attested',
      'Only one reversed physical order and one equal-seeded policy RNG',
      'Detached baseline parity is checked at this root decision only',
      'Copied policy state may not represent a human-strength player',
      'Complete paper-rule and prompt-closure correctness remain open'
    ]
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(
    auditRank10HiddenOrder(process.argv[2]==='ordinal215'?215:undefined),
    null,2)+'\n');
module.exports={actionSignature,compareHiddenDeckOrders,
  withRootHiddenOrderProbe,withRootDispatchCounter,
  sourcePolicyForOrdinal,auditRank10HiddenOrder};
