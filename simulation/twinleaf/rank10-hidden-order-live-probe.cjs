'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards,seededRandom}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');
const {stateGraphFingerprint}=
  require('./rank10-live-decision-noninterference.cjs');
const {assertVendorCloneCompatibleSource,normalizeDeepClonePrototypes}=
  require('./normalize-deep-clone.cjs');

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
      return actionSignature(newBot().decodeNextAction(world));
    } finally {
      Math.random=randomBefore;
    }
  };
  const physicalOrder=evaluate(base);
  const reversedOrder=evaluate(reverse);
  const post=stateGraphFingerprint(state);
  assert.deepEqual(post,pre,'Counterfactual lookahead changed live Store State');
  return {
    actorId,deckCards:before.length,
    physicalOrder,reversedOrder,
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
 * @param {{turn:number,seat:number,makeRandom:()=>()=>number,rootActionOrdinal?:number,readRootDispatchCount?:()=>number,readOwnerDeckSearches?:()=>object}} target
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
    const observed=compareHiddenDeckOrders(
      state,this.client.id,
      ()=>{
        const bot=new Ai({id:parent.client.id},parent.tactics[0].options,parent.deck);
        // Use the saved pre-interception method on each independent bot.
        // Calling its inherited method would recursively reenter this hook.
        bot.decodeNextAction=descriptor.value.bind(bot);
        return bot;
      },
      cloneState,target.makeRandom);
    const actual=descriptor.value.call(this,state);
    events.push({...observed,turn:state.turn,seat:state.activePlayer,
      rootActionOrdinal:target.rootActionOrdinal??null,
      ownerDeckSearchWitness:target.readOwnerDeckSearches?.()??null,
      originalSourceAction:actionSignature(actual)});
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
 * @param {(getOrdinal:()=>number,getOwnerDeckSearches:()=>object)=>T} work
 * @returns {T}
 */
function withRootDispatchCounter(Store,work) {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(descriptor && typeof descriptor.value==='function');
  let root=null,count=0;
  const observedPromptIds=new Set(),ownerDeckSearches=[];
  const wrapped=function(...args) {
    if(root===null && args[0]?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root)count++;
    const result=descriptor.value.apply(this,args);
    if(this===root) {
      const state=this.state,owner=state?.players?.[1];
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
  }));}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

/** Source-dealt, frozen-seat exploratory sensitivity measurement. */
function auditRank10HiddenOrder(rootActionOrdinal) {
  assert.ok(rootActionOrdinal===undefined || rootActionOrdinal===215,
    'Only archived decisive root ordinal 215 is admitted');
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
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
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
  const makeTarget=getOrdinal=>({
    turn:rootActionOrdinal===undefined?27:28,
    seat:1,makeRandom:()=>seededRandom(20261017),
    rootActionOrdinal,readRootDispatchCount:getOrdinal
  });
  const observed=rootActionOrdinal===undefined?
    withRootHiddenOrderProbe(
      SimpleTacticsAi,()=>runMatch(common),cloneState,makeTarget(undefined)):
    withRootDispatchCounter(
      require(path.join(output,'game/store/store')).Store,
      (getOrdinal,getOwnerDeckSearches)=>withRootHiddenOrderProbe(
        SimpleTacticsAi,()=>runMatch(common),cloneState,
        {...makeTarget(getOrdinal),readOwnerDeckSearches:getOwnerDeckSearches}));
  assert.deepEqual(observed.result,control,
    'Read-only hidden-order counterfactual changed physical source match');
  assert.equal(observed.events.length,1,
    'Expected one champion-B source root decision at designated source gate');
  if(rootActionOrdinal===215) {
    assert.equal(observed.events[0].originalSourceAction?.type,'RetreatAction',
      'Archived source ordinal 215 must be an authentic Retreat proposal');
  }
  return {
    study:rootActionOrdinal===undefined?
      'rank10-source-turn27-hidden-order-sensitivity':
      'rank10-source-ordinal215-hidden-order-sensitivity',
    pinnedTrialId:trials[0].trialId,
    seed:trials[0].seed,
    candidatePhysicalSeat:1,
    root:observed.events[0],
    matchedUninstrumentedMatch:true,
    qualifiedForCompetitiveInference:false,
    limitations:[
      'K1 deck membership and remembered top order are not attested',
      'Only one reversed physical order and one equal-seeded policy RNG',
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
  withRootHiddenOrderProbe,withRootDispatchCounter,auditRank10HiddenOrder};
