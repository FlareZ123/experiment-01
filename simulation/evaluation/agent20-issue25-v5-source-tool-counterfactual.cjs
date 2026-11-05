'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation,publicPlayer,printing}=
  require('../twinleaf/actor-observation-contract.cjs');
const {
  actorToolPrintingCatalog,enumerateActorToolCandidates
}=require('../twinleaf/agent18-actor-tool-candidate-frontier.cjs');
const {buildNativeOwnerToolCandidateAction}=
  require('../twinleaf/agent18-native-tool-play-action.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');

const REGISTRATION=require('../../results/aichi-2026/registrations/agent20-v5-tool-attachment-counterfactual-20261105.json');
const VERSION='agent20-issue25-v5-retrospective-source-tool-physical-causal-test-v1';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Replace precisely one actual source-owner Pass with a zero-discard native
 * Tool attachment, provided the owner-visible current state has the registered
 * hash. The other seven native games and all other decisions are untouched.
 * This intentionally SOURCE-SPECIFIC mechanistic treatment is never an
 * opponent policy or a prospective field-strength experiment.
 *
 * @template T
 * @param {()=>T} next
 * @param {{headless?:object,SimpleTacticsAi?:Function,Store?:Function,
 *   types?:object,catalog?:Set<string>,registration?:object,
 *   observe?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRegisteredSourceToolCounterfactual(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??require(
    path.join(output,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(
    path.join(output,'game/store/store')).Store;
  const types=deps.types??(()=>{
    const {PlayCardAction,PlayerType,SlotType}=require(path.join(
      output,'game/store/actions/play-card-action'));
    return {PlayCardAction,PlayerType,SlotType};
  })();
  const tools=deps.catalog??(()=>{
    const cardTypes=require(path.join(output,'game/store/card/card-types'));
    return actorToolPrintingCatalog(headless.initializeCards().getAllCards(),{
      TrainerCard:require(path.join(output,
        'game/store/card/trainer-card')).TrainerCard,
      TrainerType:cardTypes.TrainerType
    });
  })();
  assert.ok(tools instanceof Set);
  const observe=deps.observe??actorObservation;
  const publicView=deps.publicView??publicPlayer;
  const printCard=deps.printing??printing;
  const registration=deps.registration??REGISTRATION;
  assert.equal(registration.targets?.length,2);
  const previousMatch=headless.runMatch;
  assert.equal(typeof previousMatch,'function');
  const attempts=[];

  function wrappedMatch(request){
    const target=registration.targets.find(t=>
      typeof request?.label==='string'&&request.label.endsWith(t.id));
    if(!target)return previousMatch(request);
    const aiProto=SimpleTacticsAi.prototype,storeProto=Store.prototype;
    const priorDecode=Object.getOwnPropertyDescriptor(
      aiProto,'decodeNextAction');
    const priorDispatch=Object.getOwnPropertyDescriptor(
      storeProto,'dispatch');
    assert.equal(typeof priorDecode?.value,'function');
    assert.equal(typeof priorDispatch?.value,'function');
    const tagged=new WeakMap();
    const record={
      id:target.id,sourceSeat:target.sourceSeat,globalTurn:target.globalTurn,
      originalRootWasPass:false,ownerViewFingerprint:null,
      registeredOwnerViewMatched:false,
      nativeToolActionConstructed:false,printedTool:target.toolPrinting,
      nativeToolActionAccepted:false,nativeToolError:null,
      ownerHandBefore:null,ownerHandAfter:null,
      ownerActiveToolsBefore:null,ownerActiveToolsAfter:null,
      physicalToolAttached:false,handCopyConsumed:false,
      otherPlayerPrivateZonesInspected:false,
      treatmentScope:'retrospective-exact-source-Pass-only',
      qualifiedGames:0
    };
    let intervened=false;
    function decoded(state,...args){
      const seat=target.sourceSeat,owner=state?.players?.[seat];
      const correctRoot=!intervened&&state?.activePlayer===seat&&
        state?.turn===target.globalTurn&&
        owner?.id===this.client?.id&&
        !state.prompts?.some(p=>p.result===undefined);
      const before=correctRoot?observe(state,seat):null;
      const original=priorDecode.value.call(this,state,...args);
      if(!before||original?.constructor?.name!=='PassTurnAction')
        return original;
      record.originalRootWasPass=true;
      assert.equal(before.decisionKind,'owner-root');
      const actualHash=hash(before);
      record.ownerViewFingerprint=actualHash;
      record.registeredOwnerViewMatched=
        actualHash===target.expectedOwnerVisibleSha256;
      if(!record.registeredOwnerViewMatched)return original;
      const candidate=enumerateActorToolCandidates(before,tools)
        .find(c=>c.printing===target.toolPrinting&&
          c.slot===target.targetSlot&&c.index===target.targetIndex);
      if(!candidate)return original;
      const replacement=buildNativeOwnerToolCandidateAction(
        before,{toolPrintings:tools},candidate,owner.id,types);
      intervened=true;
      record.nativeToolActionConstructed=true;
      tagged.set(replacement,record);
      return replacement;
    }
    function dispatched(action,...args){
      const taggedRecord=tagged.get(action);
      if(!taggedRecord)return priorDispatch.value.call(this,action,...args);
      const owner=this.state.players[target.sourceSeat];
      const before=publicView(owner);
      taggedRecord.ownerHandBefore=owner.hand.cards.map(printCard);
      taggedRecord.ownerActiveToolsBefore=before.active?.tools??null;
      try{
        const result=priorDispatch.value.call(this,action,...args);
        const afterPlayer=this.state.players[target.sourceSeat];
        const after=publicView(afterPlayer);
        taggedRecord.ownerHandAfter=afterPlayer.hand.cards.map(printCard);
        taggedRecord.ownerActiveToolsAfter=after.active?.tools??null;
        taggedRecord.nativeToolActionAccepted=true;
        taggedRecord.physicalToolAttached=
          !taggedRecord.ownerActiveToolsBefore.includes(target.toolPrinting)&&
          taggedRecord.ownerActiveToolsAfter.includes(target.toolPrinting);
        const count=cards=>cards.filter(x=>
          x===target.toolPrinting).length;
        taggedRecord.handCopyConsumed=
          count(taggedRecord.ownerHandBefore)-
          count(taggedRecord.ownerHandAfter)===1;
        return result;
      }catch(error){
        taggedRecord.nativeToolError=
          String(error?.message??error).slice(0,250);
        throw error;
      }
    }
    Object.defineProperty(aiProto,'decodeNextAction',{
      ...priorDecode,value:decoded
    });
    Object.defineProperty(storeProto,'dispatch',{
      ...priorDispatch,value:dispatched
    });
    try{
      return previousMatch(request);
    }finally{
      assert.strictEqual(aiProto.decodeNextAction,decoded);
      assert.strictEqual(storeProto.dispatch,dispatched);
      Object.defineProperty(storeProto,'dispatch',priorDispatch);
      Object.defineProperty(aiProto,'decodeNextAction',priorDecode);
      attempts.push(record);
    }
  }

  headless.runMatch=wrappedMatch;
  try{
    return {result:next(),audit:{
      version:VERSION,attempts,originalNativeAttemptCount:8,
      selectedTreatmentRoots:registration.targets.map(t=>t.id),
      ownerVisibleOnly:true,sourceIndependentPolicy:false,
      gamesQualified:0
    }};
  }finally{
    assert.strictEqual(headless.runMatch,wrappedMatch);
    headless.runMatch=previousMatch;
  }
}

/**
 * Combine native Store receipts with the frozen full physical initial deals
 * and the exact historic accepted-Store prefix at each treated root.
 * @param {object} native Selected eight original v5 attempts
 * @param {object} intervention Live treatment receipts
 * @param {object} [registration]
 * @returns {object}
 */
function joinRegisteredToolCounterfactual(
  native,intervention,registration=REGISTRATION
){
  const rows=native?.rawDevelopment?.rows??[];
  assert.equal(rows.length,registration.originalFrozenAttemptCount);
  const byId=new Map(rows.map(r=>[r.trial?.id??r.id,r]));
  assert.equal(byId.size,rows.length);
  const cases=registration.targets.map(target=>{
    const row=byId.get(target.id);
    assert.ok(row,'Missing original source registration');
    const receipt=intervention.attempts.find(r=>r.id===target.id);
    assert.ok(receipt,'Native source Tool treatment did not execute');
    const roots=row.rootActionLedger??[];
    const root=roots[target.passRootOrdinal]??null;
    const preDecisionPublicPrefixMatched=hash(roots.slice(
      0,target.passRootOrdinal))===
        target.originalPreDecisionPublicRootPrefixSha256;
    const actualRootActionSelected=
      root?.playerSlot===target.sourceSeat&&
      root?.turnBefore===target.globalTurn&&
      root?.action==='PlayCardAction'&&
      root?.card===target.toolPrinting.split(' ').slice(0,-1).join(' ');
    const after=roots.slice(target.passRootOrdinal+1);
    const firstActualOpponentRoot=after.find(r=>
      r.playerSlot===target.candidateSeat&&
      r.action!=='ResolvePromptAction')??null;
    const followedByOpponentDecision=firstActualOpponentRoot!==null;
    const sourceDealMatched=row.sourceDealFingerprint===
      target.expectedSourcePhysicalDealSha256;
    const fullDealMatched=row.fullPhysicalDealFingerprint===
      target.expectedFullPhysicalDealSha256;
    return {
      id:target.id,sourceSeat:target.sourceSeat,
      candidateSeat:target.candidateSeat,
      printedTool:target.toolPrinting,
      nativeDisposition:row.status??null,
      sourceDealMatched,fullDealMatched,
      preDecisionPublicPrefixMatched,
      ownerViewMatched:receipt.registeredOwnerViewMatched,
      printedOwnerPassObserved:receipt.originalRootWasPass,
      actualRootActionSelected,
      nativeToolActionAccepted:receipt.nativeToolActionAccepted,
      physicalToolAttached:receipt.physicalToolAttached,
      handCopyConsumed:receipt.handCopyConsumed,
      ownerActiveToolsBefore:receipt.ownerActiveToolsBefore,
      ownerActiveToolsAfter:receipt.ownerActiveToolsAfter,
      ownerHandBefore:receipt.ownerHandBefore,
      ownerHandAfter:receipt.ownerHandAfter,
      firstActualOpponentRoot,
      followedByOpponentDecision,
      nativeToolError:receipt.nativeToolError,
      nativeFirstReplyEffectPayoffCertified:false,
      independentCompetitivePolicyCertified:false,
      qualifiedGames:0
    };
  });
  return {
    schema:VERSION,
    provenance:registration.schema,
    cases,
    allOriginalRegistrationsRetained:byId.size===8,
    exactPreInterventionPhysicalStartsAndPrefix:cases.every(c=>
      c.sourceDealMatched&&c.fullDealMatched&&
      c.preDecisionPublicPrefixMatched&&c.ownerViewMatched),
    attachedToolsWithNativePayment:cases.every(c=>
      c.actualRootActionSelected&&c.nativeToolActionAccepted&&
      c.physicalToolAttached&&c.handCopyConsumed),
    opposingRootObserved:cases.every(c=>c.followedByOpponentDecision),
    nativeStatuses:rows.map(r=>({
      id:r.trial?.id??r.id,
      status:r.status??null,
      acceptedRootCount:r.rootActionLedger?.length??null
    })),
    selectionAfterSeeingHistoricalPasses:true,
    competitiveGamesQualified:0,
    nominatedDecklist:null,
    demonstratedFullFieldWinRate:null
  };
}

/**
 * Eight original v5 attempts, identical non-target policy and engine revision,
 * with precisely two previously seen historical source Pass interventions.
 * @param {{observer?:Function,selectedRunner?:Function}} [deps]
 * @returns {object}
 */
function runOriginalV5SourceToolCounterfactual(deps={}){
  const adapter=deps.observer??withRegisteredSourceToolCounterfactual;
  const observed=adapter(()=>(
    deps.selectedRunner??(()=>runStewardInnermostPrizeV5({
      runner:options=>runDevelopment({
        ...options,ownerGenericTrainerFrontier:true
      })
    }))
  )());
  return joinRegisteredToolCounterfactual(
    observed.result,observed.audit);
}

module.exports={
  VERSION,REGISTRATION,withRegisteredSourceToolCounterfactual,
  joinRegisteredToolCounterfactual,runOriginalV5SourceToolCounterfactual
};
