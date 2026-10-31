'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {stateGraphFingerprint}=
  require('../twinleaf/rank10-live-decision-noninterference.cjs');
const {
  actionSignature,compareHiddenDeckOrders
}=require('../twinleaf/rank10-hidden-order-live-probe.cjs');

/**
 * Compare a candidate detached root with a genuine pinned Store root. A
 * pinned State may itself contain temporary source-instance prototypes from
 * vendor Simulator cloning. The tested normalizer changes those prototypes
 * back to their stable class prototypes; requiring raw class names to match
 * would therefore reject valid canonicalization. The descriptor/alias graph
 * must still match completely after that class normalization is justified
 * by stableClassPrototype's own-shadowing checks.
 *
 * @param {object} original Real pinned Store State.
 * @param {object} captured Detached State snapshot.
 * @returns {object} Redacted structural comparison, no card identities.
 */
function verifyCapturedNativeRoot(original,captured) {
  const sourceFingerprint=stateGraphFingerprint(original);
  const snapshotFingerprint=stateGraphFingerprint(captured);
  const rawGraphMatched=isDeepStrictEqual(sourceFingerprint,
    snapshotFingerprint);
  const {firstNativeCloneStructureDifference:firstDiff}=
    require('../twinleaf/native-clone-structure-diff.cjs');
  const firstRawDifference=rawGraphMatched?null:firstDiff(original,captured);
  const canonical=firstDiff(original,captured,{
    canonicalClassPrototypes:true
  });
  if(!canonical.matched) {
    throw new Error('Captured replay root differs from genuine physical State: '+
      JSON.stringify({
        originalDigest:sourceFingerprint.digest,
        clonedDigest:snapshotFingerprint.digest,
        firstDescriptorDifference:firstRawDifference,
        firstCanonicalDifference:canonical
      }));
  }
  return {
    rawGraphMatched,canonicalGraphMatched:true,
    originalDigest:sourceFingerprint.digest,
    clonedDigest:snapshotFingerprint.digest,
    firstRawDifference,
    method:'class-prototypes-canonicalized-after-shadowing-audit'
  };
}

/**
 * Snapshot the complete actual SimpleBotOptions at the owner-decision
 * boundary, while preserving tactic/resolver constructor references. The
 * pinned engine uses class constructors in these two arrays and plain data
 * for scores/arbiter. A shallow copy keeps mutable nested score weights
 * shared with the live bot and between hypothetical worlds.
 *
 * @param {object} options Actual pinned bot options plus chosen constructors.
 * @returns {object} Detached mutable option data; constructor identities kept.
 */
function cloneBotOptions(options) {
  assert.ok(options&&typeof options==='object');
  assert.ok(Array.isArray(options.tactics));
  assert.ok(Array.isArray(options.promptResolvers));
  const copy={};
  for(const [name,value] of Object.entries(options)) {
    if(name==='tactics'||name==='promptResolvers') continue;
    copy[name]=structuredClone(value);
  }
  copy.tactics=options.tactics.slice();
  copy.promptResolvers=options.promptResolvers.slice();
  return copy;
}

/**
 * Test a reconstructed bot's proposed PlayCard action only in an independently
 * cloned pinned Store after the authentic game has ended. Preserve the raw
 * numeric board target and acting owner's resource state. A returned dispatch
 * does not alone prove final effect settlement or legality in paper Expanded.
 *
 * @param {object} snapshot Complete genuine native root State.
 * @param {{type:string,data:string}} signature Reconstructed fresh action.
 * @param {(state:object)=>object} clone Detached source State copier.
 * @param {{Store:Function,PlayCardAction:Function,makeRandom?:()=>()=>number}} deps
 * @returns {object}
 */
function probeFreshPlayCardInClonedStore(snapshot,signature,clone,deps) {
  assert.equal(signature.type,'PlayCardAction');
  const data=JSON.parse(signature.data);
  assert.ok(Number.isSafeInteger(data.id));
  assert.ok(Number.isSafeInteger(data.handIndex)&&data.handIndex>=0);
  const prior=stateGraphFingerprint(snapshot);
  const detached=new deps.Store({onStateChange(){}});
  detached.state=clone(snapshot);
  const owner=detached.state.players.find(p=>p.id===data.id);
  assert.ok(owner,'Fresh action owner must exist on the source root');
  const handAtRoot=owner.hand.cards.map(card=>card.fullName);
  const beforeHand=handAtRoot.length;
  const energyPlayedTurn=owner.energyPlayedTurn??null;
  const supporterTurn=owner.supporterTurn??null;
  let returned=false,rejection=null;
  const previousRandom=Math.random;
  Math.random=deps.makeRandom?deps.makeRandom():()=>0.5;
  try {
    const action=new deps.PlayCardAction(data.id,data.handIndex,data.target);
    detached.dispatch(action);
    returned=true;
  } catch(error) {
    rejection=String(error?.stack||error);
  } finally {
    Math.random=previousRandom;
  }
  assert.deepEqual(stateGraphFingerprint(snapshot),prior,
    'Fresh cloned Store proposal mutated the historical State');
  return {
    proposedHandIndex:data.handIndex,
    proposedCardPrinting:handAtRoot[data.handIndex]??null,
    proposedTarget:data.target??null,
    handSizeBefore:beforeHand,
    handSizeAfter:detached.state.players.find(p=>p.id===data.id)?.hand.cards.length??null,
    energyPlayedTurn,supporterTurn,
    dispatchReturnedWithoutThrow:returned,
    ...(rejection?{dispatchRejection:rejection}:{}),
    originalStoreUnchanged:true,
    caveat:'Hypothetical clone-only one-step Store dispatch; unresolved prompts and paper legality remain unqualified'
  };
}

/**
 * Capture a single actual source-dealt candidate decision under *all* common
 * outer policy hooks, preserving the real Store action. Compare the
 * counterfactual unseen deck orders only after the match and all reversible
 * gameplay hooks have finished. In particular, the New Moon Field Blower
 * wrapper installs decodeNextAction inside the common policy; a normal outer
 * prototype wrapper would be overwritten and silently collect no root.
 *
 * No speculative tactic call may take place while the live engine is running.
 *
 * @template T
 * @param {Function} BotClass Pinned SimpleTacticsAi.
 * @param {()=>T} execute Existing authentic game runner.
 * @param {(state:object)=>object} cloneDetached Whole-State detached clone.
 * @param {{turn:number,seat:number,makeRandom:()=>()=>number,firstFiniteScoredRoot?:boolean,probeFreshStoreLegality?:boolean,nativeTapeSameWorld?:boolean,nativeTapeHiddenOpponentHandContrast?:boolean}} target
 * @param {{headless?:object,compare?:Function,signature?:Function}} [dependencies]
 * @returns {{result:T,events:object[]}}
 */
function withPostgameRootOrderProbe(
  BotClass,execute,cloneDetached,target,dependencies={}
) {
  assert.equal(typeof execute,'function');
  assert.equal(typeof cloneDetached,'function');
  assert.ok(target&&Number.isSafeInteger(target.turn)&&target.turn>=1);
  assert.ok([0,1].includes(target.seat));
  assert.equal(typeof target.makeRandom,'function');
  assert.ok(target.nativeTapeSameWorld!==true||
    target.firstFiniteScoredRoot!==true||target.nativeTapeFirstFiniteScore===true,
  'Finite-scored native tape requires explicit paired mode');
  assert.ok(target.nativeTapeHiddenOrderContrast!==true||
    target.nativeTapeSameWorld===true,
    'Hidden-order contrast requires genuine native same-world tape');
  assert.ok(target.nativeTapeHiddenOpponentHandContrast!==true||
    target.nativeTapeSameWorld===true,
    'Opponent hidden-hand contrast requires genuine native same-world tape');
  assert.ok(target.nativeTapeBoundedOpponentHiddenHand!==true||
    target.nativeTapeHiddenOpponentHandContrast===true,
    'Bounded opponent contrast requires native opponent-hand tape mode');
  assert.ok(target.nativeTapeBoundedDoubleExchange!==true||
    target.nativeTapeBoundedOpponentHiddenHand===true,
    'Two-card swaps require bounded native opponent-hand mode');
  assert.ok(target.nativeTapeHandPrizeContrast!==true||
    (target.nativeTapeBoundedOpponentHiddenHand===true&&
      target.nativeTapeBoundedDoubleExchange!==true),
    'Face-down Prize swaps require bounded single-card native tape mode');
  const headless=dependencies.headless??require('../twinleaf/headless.cjs');
  const compare=dependencies.compare??compareHiddenDeckOrders;
  const signature=dependencies.signature??actionSignature;
  const originalRunMatch=headless.runMatch;
  assert.equal(typeof originalRunMatch,'function');
  const actorId=target.seat===0?101:202;
  let captured=null;
  let innerRunCalls=0;

  function wrappedRunMatch(request) {
    innerRunCalls++;
    // Observe after the source and common-candidate hooks are installed.
    const descriptor=Object.getOwnPropertyDescriptor(
      BotClass.prototype,'decodeNextAction');
    assert.ok(descriptor&&typeof descriptor.value==='function');
    function observeActualAction(state) {
      const eligible=!captured&&
        (target.firstFiniteScoredRoot===true?
          state.turn>=target.turn:state.turn===target.turn)&&
        state.activePlayer===target.seat&&
        state.prompts.every(prompt=>prompt.result!==undefined)&&
        this.client?.id===actorId;
      if(!eligible)return descriptor.value.call(this,state);
      if(target.firstFiniteScoredRoot===true) {
        // Profile the actual owner's evaluations read-only. Capture a full
        // physical State only on the first generic tactic evaluation, before
        // its speculative score can run; preserve the Store decision.
        let attemptCount=0,finiteScoreCount=0,pending=null;
        const nativeTrace=[];
        const nativeTacticObservation={steps:[],rngCalls:0,
          traceEngineRandomSites:target.nativeTapeFirstFiniteScore===true,
          traceSimulationZones:target.nativeTapeFirstFiniteScore===true};
        const decisionStartFingerprint=(target.nativeScoreTrace===true||target.nativeTapeFirstFiniteScore===true)?
          stateGraphFingerprint(state):null;
        const restorations=[];
        const ownerBot=this;
        // Snapshot at decode entry, before tactic proposals mutate the Store.
        let nativeEntry=null;
        if(target.nativeTapeFirstFiniteScore===true) {
          const before=stateGraphFingerprint(state);
          try {
            const source=cloneDetached(state);
            const fidelity=verifyCapturedNativeRoot(state,source);
            const common=this.tactics?.[0]?.options;
            assert.ok(common&&this.tactics.every(t=>t.options===common));
            assert.ok(this.resolvers.every(r=>r.options===common));
            const options=cloneBotOptions({...common,
              tactics:this.tactics.map(t=>t.constructor),
              promptResolvers:this.resolvers.map(r=>r.constructor)});
            assert.deepEqual(stateGraphFingerprint(state),before);
            nativeEntry={state:source,options,
              sourceCaptureFidelity:fidelity,captureError:null};
          } catch(error) {
            nativeEntry={state:null,options:null,
              sourceCaptureFidelity:null,
              captureError:String(error?.stack||error)};
          }
        }
        const captureAtScore=()=>{
          if(pending)return;
          let snapshot=null,options=null,captureError=null;
          let sourceCaptureFidelity=null;
          try {
            const before=stateGraphFingerprint(state);
            snapshot=cloneDetached(state);
            sourceCaptureFidelity=verifyCapturedNativeRoot(state,snapshot);
            const commonOptions=ownerBot.tactics?.[0]?.options;
            assert.ok(commonOptions&&typeof commonOptions==='object');
            assert.ok(ownerBot.tactics.every(t=>t.options===commonOptions));
            assert.ok(ownerBot.resolvers.every(r=>r.options===commonOptions));
            options=cloneBotOptions({...commonOptions,
              tactics:ownerBot.tactics.map(t=>t.constructor),
              promptResolvers:ownerBot.resolvers.map(r=>r.constructor)});
            assert.deepEqual(stateGraphFingerprint(state),before,
              'First finite-score root observer changed live State');
          } catch(error) {
            captureError=String(error?.stack||error);
          }
          const owner=state.players.find(player=>player.id===actorId);
          pending={state:snapshot,options,captureError,
            sourceCaptureFidelity,
            ...(decisionStartFingerprint?{
              sourceStateChangedBeforeFirstScore:
                decisionStartFingerprint.digest!==
                  stateGraphFingerprint(state).digest,
              sourceStartGraphDigest:decisionStartFingerprint.digest,
              firstScoreSourceGraphDigest:stateGraphFingerprint(state).digest
            }:{}),
            ownerRootVisible:{
              turn:state.turn,
              ownHandPrintings:owner?.hand?.cards?.map(card=>
                card.fullName??null)??null,
              ownActivePrinting:owner?.active?.getPokemonCard?.()?.fullName??null,
              energyPlayedTurn:owner?.energyPlayedTurn??null,
              supporterPlayedTurn:owner?.supporterTurn??null,
              stadiumPlayedTurn:owner?.stadiumPlayedTurn??null
            }};
        };
        try {
          for(const tactic of new Set(this.tactics)) {
            if(typeof tactic.evaluateAction!=='function')continue;
            const own=Object.getOwnPropertyDescriptor(tactic,'evaluateAction');
            const evaluate=tactic.evaluateAction;
            Object.defineProperty(tactic,'evaluateAction',{
              configurable:true,enumerable:own?.enumerable??false,writable:true,
              value:function (...args){
                captureAtScore();
                const score=evaluate.apply(this,args);
                attemptCount++;
                if(Number.isFinite(score))finiteScoreCount++;
                if(target.nativeScoreTrace===true)nativeTrace.push({
                  tactic:this.constructor.name,
                  actionType:args[2]?.constructor?.name??null,
                  actionSignature:args[2]===undefined?
                    null:JSON.stringify(args[2]),
                  score:Number.isFinite(score)?score:null,
                  undefinedScore:score===undefined
                });
                return score;
              }
            });
            restorations.push(()=>{
              if(own)Object.defineProperty(tactic,'evaluateAction',own);
              else delete tactic.evaluateAction;
            });
          }
          const taped=target.nativeTapeFirstFiniteScore===true?
            require('../twinleaf/native-policy-tactic-sequence.cjs')
              .observeNativePolicyTacticSequence(this,()=>
                require('../twinleaf/native-policy-random-tape.cjs')
                  .recordPolicyRandomTape(()=>
                    descriptor.value.call(this,state)),
                nativeTacticObservation):null;
          const action=taped?taped.result:descriptor.value.call(this,state);
          if(finiteScoreCount>0) {
            captured={...pending,...(nativeEntry??{}),
              captureError:nativeEntry?.captureError??pending?.captureError??null,
              nativeRealPolicyTape:taped?.tape??null,
              nativeTacticSequence:nativeTacticObservation,
              realAction:signature(action),
              chosenRootTurn:state.turn,
              actualScorerAttempts:attemptCount,
              actualFiniteScores:finiteScoreCount,
              ...(target.nativeScoreTrace===true?{
                actualNativeScoreTrace:nativeTrace
              }:{})};
          }
          return action;
        } finally {
          for(const restore of restorations.reverse())restore();
        }
      }
      // Snapshot the complete physical decision root. The bot's tactic and
      // resolver constructor arrays may be spliced back out of global defs
      // after the match; freeze their identities *now* for detached replay.
      let snapshot=null;
      let options=null;
      let captureError=null;
      let sourceCaptureFidelity=null;
      try {
        const sourceBefore=stateGraphFingerprint(state);
        snapshot=cloneDetached(state);
        sourceCaptureFidelity=verifyCapturedNativeRoot(state,snapshot);
        const commonOptions=this.tactics?.[0]?.options;
        assert.ok(commonOptions&&typeof commonOptions==='object',
          'Pinned tactic option source is missing');
        assert.ok(this.tactics.every(t=>t.options===commonOptions),
          'Live tactic options differ; one reconstructed config is incomplete');
        assert.ok(this.resolvers.every(r=>r.options===commonOptions),
          'Live resolver options differ; one reconstructed config is incomplete');
        options=cloneBotOptions({...commonOptions,
          tactics:this.tactics.map(tactic=>tactic.constructor),
          promptResolvers:this.resolvers.map(resolver=>resolver.constructor)});
        assert.deepEqual(stateGraphFingerprint(state),sourceBefore,
          'Detached root capture mutated the actual Store State graph');
      } catch(error) {
        captureError=String(error?.stack||error);
      }
      // Record only the genuine native decision, not a newly seeded bot.
      // Sampling the existing source Math.random preserves the owner's
      // authentic advanced policy stream and original selected Store action.
      const taped=target.nativeTapeSameWorld===true?
        require('../twinleaf/native-policy-random-tape.cjs')
          .recordPolicyRandomTape(()=>descriptor.value.call(this,state)):null;
      const action=taped?taped.result:descriptor.value.call(this,state);
      captured={state:snapshot,options,realAction:signature(action),
        nativeRealPolicyTape:taped?.tape??null,captureError,
        sourceCaptureFidelity};
      return action;
    }
    Object.defineProperty(BotClass.prototype,'decodeNextAction',{
      ...descriptor,value:observeActualAction
    });
    try{return originalRunMatch(request);}
    finally{
      const preserved=BotClass.prototype.decodeNextAction===observeActualAction;
      Object.defineProperty(BotClass.prototype,'decodeNextAction',descriptor);
      assert.ok(preserved,
        'Candidate policy replaced the innermost read-only observer');
    }
  }
  headless.runMatch=wrappedRunMatch;
  let result;
  try {result=execute();}
  finally{
    const preserved=headless.runMatch===wrappedRunMatch;
    headless.runMatch=originalRunMatch;
    assert.ok(preserved,
      'The headless runner changed during the observational test');
  }
  assert.equal(innerRunCalls,1,'Expected one physical match per trial');
  // After the live match: copy the returned game-row evidence before any
  // captured tactic constructor can append to a historical closure's log.
  // The runner returns only JSON-like evidence, not Card object instances.
  const frozenResult=structuredClone(result);
  if(!captured)return {result:frozenResult,events:[]};
  if(captured.captureError){
    return {result:frozenResult,events:[{
      originalSourceAction:captured.realAction,
      baselineActionMatchedActual:false,liveStatePreserved:false,
      auditError:captured.captureError
    }]};
  }
  if(target.nativeTapeSameWorld===true) {
    // This first-stage gate replays only the same physical world. No altered
    // hidden state may be inspected until source action, replay RNG and the
    // detached physical root all agree with this authentic selection.
    try {
      const {verifyNativeSameWorldTapeParity}=
        require('../twinleaf/native-same-world-tape-parity.cjs');
      const applyPolicy=dependencies.replayPolicy??
        require('./agent41-bilateral-common-policy.cjs')
          .withBilateralCommonCandidatePolicy;
      const replayTacticObservation={steps:[],rngCalls:0,
          traceEngineRandomSites:target.nativeTapeFirstFiniteScore===true,
          traceSimulationZones:target.nativeTapeFirstFiniteScore===true};
      const policyReplay=world=>applyPolicy(target.seat,()=>{
        const bot=new BotClass({id:actorId},
          cloneBotOptions(captured.options),null);
        return target.nativeTapeFirstFiniteScore===true?
          require('../twinleaf/native-policy-tactic-sequence.cjs')
            .observeNativePolicyTacticSequence(bot,
              ()=>bot.decodeNextAction(world),replayTacticObservation):
          bot.decodeNextAction(world);
      }).result;
      const parity=verifyNativeSameWorldTapeParity({
        root:captured.state,
        actualAction:captured.realAction,
        tape:captured.nativeRealPolicyTape,
        cloneState:cloneDetached,
        replayDecision:policyReplay,
        actionSignature:value=>value&&typeof value.type==='string'&&
          typeof value.data==='string'?value:signature(value),
        fingerprint:state=>stateGraphFingerprint(state).digest
      });
      const sameWorldTacticObservation=structuredClone(replayTacticObservation);
      let hiddenContrast=null;
      if(target.nativeTapeHiddenOrderContrast===true) {
        if(parity.sameWorldDecisionParityQualified) {
          const {compareNativeHiddenDeckOrder}=
            require('../twinleaf/native-tape-hidden-order-contrast.cjs');
          const actorView=dependencies.actorView??
            require('../twinleaf/actor-observation-contract.cjs')
              .actorObservation;
          hiddenContrast=compareNativeHiddenDeckOrder({
            parity,root:captured.state,seat:target.seat,
            tape:captured.nativeRealPolicyTape,
            cloneState:cloneDetached,replayDecision:policyReplay,
            actionSignature:value=>value&&typeof value.type==='string'&&
              typeof value.data==='string'?value:signature(value),
            fingerprint:state=>stateGraphFingerprint(state).digest,
            actorView
          });
        } else hiddenContrast={
          contrastExecutable:false,
          error:'Genuine same-world native tape parity failed first',
          informationSetLeakQualified:false
        };
      }
      let hiddenOpponentHandContrast=null;
      if(target.nativeTapeHiddenOpponentHandContrast===true){
        if(parity.sameWorldDecisionParityQualified){
          const compareNativeOpponentHiddenHand=
            target.nativeTapeBoundedOpponentHiddenHand===true?
              args=>require('../twinleaf/agent23-native-tape-bounded-opponent-hand.cjs')
                .compareNativeOpponentHiddenHandBounded(args,{
                  swapSize:target.nativeTapeBoundedDoubleExchange===true?2:1,
                  targetZone:target.nativeTapeHandPrizeContrast===true?
                    'prizes':'deck'
                }):
              require('../twinleaf/native-tape-opponent-hidden-hand-contrast.cjs')
                .compareNativeOpponentHiddenHand;
          const actorView=dependencies.actorView??
            require('../twinleaf/actor-observation-contract.cjs')
              .actorObservation;
          hiddenOpponentHandContrast=compareNativeOpponentHiddenHand({
            parity,root:captured.state,seat:target.seat,
            tape:captured.nativeRealPolicyTape,
            cloneState:cloneDetached,replayDecision:policyReplay,
            actionSignature:value=>value&&typeof value.type==='string'&&
              typeof value.data==='string'?value:signature(value),
            fingerprint:state=>stateGraphFingerprint(state).digest,
            actorView
          });
        }else hiddenOpponentHandContrast={
          contrastExecutable:false,
          error:'Genuine same-world native tape parity failed first',
          informationSetLeakQualified:false
        };
      }
      return {result:frozenResult,events:[{
        nativeSameWorldTape:parity,
        nativeTacticSource:target.nativeTapeFirstFiniteScore===true?
          captured.nativeTacticSequence:null,
        nativeTacticReplay:target.nativeTapeFirstFiniteScore===true?
          sameWorldTacticObservation:null,
        sourceCaptureFidelity:captured.sourceCaptureFidelity,
        ownerRootVisible:captured.ownerRootVisible??null,
        ...(target.nativeTapeFirstFiniteScore===true?{
          nativeTapeScoredRootTurn:captured.chosenRootTurn,
          nativeTapeFiniteScores:captured.actualFiniteScores,
          sourceStateChangedBeforeFirstScore:
            captured.sourceStateChangedBeforeFirstScore??null
        }:{}),
        ...(hiddenContrast?{nativeHiddenOrderContrast:hiddenContrast}:{}),
        ...(hiddenOpponentHandContrast?{
          nativeOpponentHiddenHandContrast:hiddenOpponentHandContrast
        }:{}),
        originalSourceAction:captured.realAction,
        baselineActionMatchedActual:parity.sameWorldDecisionParityQualified,
        liveStatePreserved:parity.sourceRootUnchanged &&
          (hiddenContrast?.sourceRootUnchanged!==false) &&
          (hiddenOpponentHandContrast?.sourceRootUnchanged!==false),
        actionSensitiveToHiddenDeckOrder:
          hiddenContrast?.contrastExecutable===true?
            hiddenContrast.selectedActionChanged:null,
        actionSensitiveToOpponentHiddenHand:
          hiddenOpponentHandContrast?.contrastExecutable===true?
            hiddenOpponentHandContrast.selectedActionChanged:null,
        counterfactualCompared:hiddenContrast?.contrastExecutable===true||
          hiddenOpponentHandContrast?.contrastExecutable===true,
        comparedAfterRealGameFinished:true,
        sourceMatchExecutions:innerRunCalls,
        replayCommonPolicy:true,
        qualification:hiddenOpponentHandContrast?
          'exploratory-tape-opponent-hidden-hand-with-unverified-reveal-history':
          hiddenContrast?
          'exploratory-tape-order-contrast-with-unverified-K0-K1-known-top':
          'same-physical-world-parity-only; no hidden-world comparison'
      }]};
    } catch(error) {
      return {result:frozenResult,events:[{
        originalSourceAction:captured.realAction,
        baselineActionMatchedActual:false,
        liveStatePreserved:false,
        counterfactualCompared:false,
        auditError:String(error?.stack||error)
      }]};
    }
  }
  let comparison;
  try {
    const detachedBot=()=>new BotClass(
      {id:actorId},cloneBotOptions(captured.options),null);
    const applyPolicy=dependencies.replayPolicy??
      require('./agent41-bilateral-common-policy.cjs')
        .withBilateralCommonCandidatePolicy;
    const isolatedWorld=target.isolateReplayPolicyPerWorld===true?
      evaluate=>applyPolicy(target.seat,evaluate).result:null;
    // World policy hooks must be installed BEFORE bot construction. The
    // injected Star Alchemy tactic is part of its constructor-time tactic list.
    const compareWorlds=()=>compare(
      captured.state,actorId,detachedBot,cloneDetached,target.makeRandom,
      isolatedWorld
    );
    // The actual game has Field Blower, Stone-recipient and Star Alchemy
    // adapters around the bot. An unwrapped fresh bot is a different policy.
    // Apply identical adapters only to detached postgame counterfactuals.
    if(target.replayCommonPolicy===true &&
        target.isolateReplayPolicyPerWorld!==true) {
      comparison=applyPolicy(target.seat,compareWorlds).result;
    } else {
      comparison=compareWorlds();
    }
  } catch(error) {
    return {result:frozenResult,events:[{
      originalSourceAction:captured.realAction,
      baselineActionMatchedActual:false,liveStatePreserved:true,
      auditError:String(error?.stack||error)
    }]};
  }
  let freshPlayCardStoreProbe=null;
  if(target.probeFreshStoreLegality===true &&
    !isDeepStrictEqual(comparison.physicalOrder,captured.realAction) &&
    comparison.physicalOrder?.type==='PlayCardAction') {
    try {
      const path=require('node:path');
      const output=path.resolve(__dirname,
        '../../vendor/twinleaf/ptcg-server/output');
      const {Store}=require(path.join(output,'game/store/store'));
      const {PlayCardAction}=
        require(path.join(output,'game/store/actions/play-card-action'));
      freshPlayCardStoreProbe=probeFreshPlayCardInClonedStore(
        captured.state,comparison.physicalOrder,cloneDetached,
        {Store,PlayCardAction,makeRandom:target.makeRandom});
    } catch(error) {
      freshPlayCardStoreProbe={auditError:String(error?.stack||error)};
    }
  }
  return {result:frozenResult,events:[{
    ...comparison,
    ...(freshPlayCardStoreProbe?{freshPlayCardStoreProbe}:{}),
    originalSourceAction:captured.realAction,
    baselineActionMatchedActual:isDeepStrictEqual(
      comparison.physicalOrder,captured.realAction),
    sourceDecisionSensitivityInterpretable:isDeepStrictEqual(
      comparison.physicalOrder,captured.realAction),
    sourceMatchExecutions:innerRunCalls,
    ...(target.firstFiniteScoredRoot===true?{
      chosenRootTurn:captured.chosenRootTurn,
      actualScorerAttempts:captured.actualScorerAttempts,
      actualFiniteScores:captured.actualFiniteScores,
      ...(target.nativeScoreTrace===true?{
        actualNativeScoreTrace:captured.actualNativeScoreTrace??[],
        sourceStateChangedBeforeFirstScore:
          captured.sourceStateChangedBeforeFirstScore??null,
        sourceStartGraphDigest:captured.sourceStartGraphDigest??null,
        firstScoreSourceGraphDigest:captured.firstScoreSourceGraphDigest??null
      }:{}),
      ownerRootVisible:captured.ownerRootVisible
    }:{}),
    replayCommonPolicy:target.replayCommonPolicy===true,
    isolatedReplayPolicyPerWorld:target.isolateReplayPolicyPerWorld===true,
    comparedAfterRealGameFinished:true
  }]};
}

module.exports={cloneBotOptions,probeFreshPlayCardInClonedStore,
  verifyCapturedNativeRoot,withPostgameRootOrderProbe};
