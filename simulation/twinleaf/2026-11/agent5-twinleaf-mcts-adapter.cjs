'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {createInformationSetMcts,seededRandom}=require('./agent5-information-set-mcts.cjs');
const {normalizeKnowledge}=require('./agent5-twinleaf-belief-input.cjs');

const FLITTLE_ENVELOPE_ID='flittle-basic-psychic-v1';
const UPSTREAM_ACTION_CAP=8;
const PILOT_MAX_ITERATIONS=32;
const PILOT_MAX_PLIES=4;
const PILOT_MAX_DECISION_MS=250;

function withRandom(random,fn) {
  const previous=Math.random;
  Math.random=random;
  try{return fn();}
  finally{Math.random=previous;}
}

function deepFreeze(value) {
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  for(const child of Object.values(value))deepFreeze(child);
  return Object.freeze(value);
}

function canonicalRows(rows,label) {
  assert.ok(Array.isArray(rows),label+' must be an array');
  return rows.map(row=>{
    assert.ok(typeof row?.printing==='string'&&row.printing.length>0);
    assert.ok(Number.isSafeInteger(row.copies)&&row.copies>0);
    return {printing:row.printing,copies:row.copies};
  }).sort((a,b)=>a.printing.localeCompare(b.printing));
}

function canonicalOwnerLedger(knowledge,prizeCount) {
  assert.ok(knowledge&&knowledge.verified===true,
    'Each physical seat requires a verified information-state ledger');
  assert.ok(['K0','K1','PARTIAL'].includes(knowledge.mode),
    'Knowledge mode must be K0, K1 or PARTIAL');
  const knownTopDeck=knowledge.knownTopDeck??[];
  const knownBottomDeck=knowledge.knownBottomDeck??[];
  assert.ok(Array.isArray(knownTopDeck)&&Array.isArray(knownBottomDeck));
  for(const card of [...knownTopDeck,...knownBottomDeck])
    assert.ok(typeof card==='string'&&card.length>0,'Known deck card is invalid');
  const knownBottomDeckOrder=knowledge.knownBottomDeckOrder===true;
  const ownerK1Snapshot=knowledge.ownerK1Snapshot??null;
  const snapshot=ownerK1Snapshot===null?null:{
    epoch:ownerK1Snapshot.epoch,
    exactMembershipKnown:ownerK1Snapshot.exactMembershipKnown,
    knownPrintings:ownerK1Snapshot.knownPrintings===null?null:
      canonicalRows(ownerK1Snapshot.knownPrintings,'Owner K1 knownPrintings'),
    invalidationReason:ownerK1Snapshot.invalidationReason??null
  };
  const knownPrizePrintings=canonicalRows(
    knowledge.knownPrizePrintings??[],'Known Prize printings');
  const normalizedKnowledge={
    ...knowledge,
    knownTopDeck:knownTopDeck.slice(),
    knownBottomDeck:knownBottomDeck.slice(),
    knownBottomDeckOrder,
    knownPrizePrintings
  };
  normalizeKnowledge(normalizedKnowledge,snapshot,prizeCount);
  const projection={
    verified:true,
    mode:knowledge.mode,
    knownTopDeck:knownTopDeck.slice(),
    knownBottomDeck:knownBottomDeckOrder?
      knownBottomDeck.slice():knownBottomDeck.slice().sort(),
    knownBottomDeckOrder,
    knownPrizePrintings,
    ownerK1Snapshot:snapshot
  };
  return deepFreeze(projection);
}

function defaultStateFingerprint(state) {
  const serialized=JSON.stringify(state,(key,value)=>
    key==='logs'?undefined:value);
  assert.equal(typeof serialized,'string',
    'Twinleaf State could not be fingerprinted for no-op rejection');
  return createHash('sha256').update(serialized).digest('hex');
}

function flittleActionKey(action,deps) {
  if(action instanceof deps.PlayCardAction) {
    return 'PLAY_CARD_ACTION:'+action.handIndex+':'+action.target.player+':'+
      action.target.slot+':'+action.target.index;
  }
  if(action instanceof deps.AttackAction)
    return 'ATTACK_ACTION:'+action.name;
  if(action instanceof deps.PassTurnAction)return 'PASS_TURN';
  throw new Error('ActionEnumerator returned an action outside the Flittle envelope');
}

function expectedFlittleActionKeys(view,deps) {
  assert.ok(view&&view.actorSeat>=0&&view.actorSeat<=1);
  const keys=[];
  const resources=view.ownTurnResources??{};
  const active=view.ownPublic?.active;
  const energyIndex=view.ownHand.indexOf('Psychic Energy SVE');
  if(energyIndex>=0&&resources.energyPlayedTurn<view.globalTurn&&
      resources.energyPlayLocked!==true&&
      view.ownPublic?.publicTurnRestrictions?.energyPlayLocked!==true) {
    keys.push('PLAY_CARD_ACTION:'+energyIndex+':'+
      deps.PlayerType.BOTTOM_PLAYER+':'+deps.SlotType.ACTIVE+':0');
  }
  const restrictions=active?.publicRestrictions??{};
  const playerRestrictions=view.ownPublic?.publicTurnRestrictions??{};
  const conditions=active?.specialConditions??[];
  const canAttack=active?.printing==='Flittle SVI'&&
    active.energies?.includes('Psychic Energy SVE')===true&&
    active.attacks?.some(attack=>attack.name==='Ram')===true&&
    (resources.attacksThisTurn??0)===0&&view.globalTurn>1&&
    conditions.length===0&&
    restrictions.cannotAttackNextTurn!==true&&
    !(restrictions.cannotUseAttacksNextTurn??[]).includes('Ram')&&
    restrictions.blockedAttackNameNextTurn!=='Ram'&&
    restrictions.blockedAttackNameUntilLeavesActive!=='Ram'&&
    (restrictions.onlyAllowedAttackNameNextTurn===null||
      restrictions.onlyAllowedAttackNameNextTurn==='Ram')&&
    (playerRestrictions.attackLockTurnsRemaining??0)===0&&
    (playerRestrictions.attackMaxEnergy===null||
      playerRestrictions.attackMaxEnergy===undefined);
  if(canAttack)keys.push('ATTACK_ACTION:Ram');
  keys.push('PASS_TURN');
  return keys.sort();
}

function flittleNativeActionToIntent(action,state,seat,deps) {
  assert.ok(state?.players?.[seat],'Native intent translation requires the acting seat');
  const source='agent5-flittle-basic-psychic-v1';
  if(action instanceof deps.PlayCardAction) {
    const target=action.target;
    const card=state.players[seat].hand.cards[action.handIndex];
    if(target?.player!==deps.PlayerType.BOTTOM_PLAYER||
       target?.slot!==deps.SlotType.ACTIVE||target?.index!==0||
       !(card instanceof deps.EnergyCard)||
       card.energyType!==deps.EnergyType.BASIC||
       card.fullName!=='Psychic Energy SVE')return null;
    return {kind:'attach-basic-energy',handIndex:action.handIndex,
      slot:'active',index:0,source};
  }
  if(action instanceof deps.AttackAction&&action.name==='Ram')
    return {kind:'attack',attackName:'Ram',source};
  if(action instanceof deps.PassTurnAction)
    return {kind:'pass',reason:'mcts-root-pass',source};
  return null;
}

function createTwinleafInformationSetSearch(deps,options={}) {
  const required=[
    'ActionEnumerator','Simulator','WaitPrompt','ResolvePromptAction','GameError',
    'actorObservation','GamePhase','BotFlipMode','BotShuffleMode',
    'simulatorOptions','sampleDeterminization','evaluateObservation',
    'winnerSeat','PlayCardAction','AttackAction','PassTurnAction',
    'PlayerType','SlotType','EnergyCard','EnergyType',
    'assertApplicabilityEnvelope','rulesProfileId'
  ];
  for(const name of required)
    assert.ok(deps[name],'Missing Twinleaf adapter dependency: '+name);
  assert.equal(deps.simulatorOptions.flipMode,deps.BotFlipMode.RANDOM,
    'Search simulations must use random coin flips, not Twinleaf defaults');
  assert.equal(deps.simulatorOptions.shuffleMode,deps.BotShuffleMode.RANDOM,
    'Search simulations must use random deck shuffles, not Twinleaf defaults');
  assert.equal(deps.applicabilityEnvelopeId,FLITTLE_ENVELOPE_ID,
    'Only the explicitly registered Flittle applicability envelope is admitted');
  assert.equal(typeof deps.assertApplicabilityEnvelope,'function');
  assert.equal(typeof deps.rulesProfileId,'string');
  assert.ok(deps.rulesProfileId.length>0);
  const knowledgeBySeat=deps.knowledgeBySeat??deps.sampleDeterminization.knowledgeBySeat;
  assert.equal(typeof knowledgeBySeat,'function',
    'The exact sampler knowledgeBySeat provider is required for observation keys');
  if(deps.knowledgeBySeat)
    assert.equal(deps.knowledgeBySeat,deps.sampleDeterminization.knowledgeBySeat,
      'Observation and determinization must use the identical knowledge provider');
  const metadataByState=deps.metadataByState??deps.sampleDeterminization.metadataByState;
  if(deps.metadataByState&&deps.sampleDeterminization.metadataByState)
    assert.equal(deps.metadataByState,deps.sampleDeterminization.metadataByState,
      'Observation and determinization must share one state metadata map');
  if(metadataByState) {
    assert.ok(deps.ownDecklistSeat===0||deps.ownDecklistSeat===1,
      'Decklist-aware observations require the bot physical seat');
    assert.ok(typeof deps.ownDecklistId==='string'&&deps.ownDecklistId.length>0,
      'Decklist-aware observations require the bot own decklist ID');
  }
  const enumerator=new deps.ActionEnumerator();
  const maxPromptResolutions=options.maxPromptResolutions??64;
  const stateFingerprint=deps.stateFingerprint??defaultStateFingerprint;
  const actionKey=deps.actionKey??(action=>flittleActionKey(action,deps));
  const expectedActionKeys=deps.expectedActionKeys??
    (view=>expectedFlittleActionKeys(view,deps));
  assert.equal(typeof stateFingerprint,'function');
  assert.equal(typeof actionKey,'function');
  assert.equal(typeof expectedActionKeys,'function');
  assert.equal(typeof deps.sampleDeterminization.refreshMetadata,'function',
    'Determinization must refresh per-seat private ledgers after transitions');
  const certification={
    frontierChecks:0,ledgerChecks:0,rootLedgerChecks:0,
    rootLedgerPreservationChecks:0,ownerLedgerKeyChecks:0,
    waitPromptResolutions:0,maxRawActionCount:0,maxAcceptedActionCount:0,
    envelopeChecks:0
  };

  function checkDeadline(context,stage) {
    context?.checkDeadline?.('adapter-'+stage);
  }
  function stable(state) {
    return !(state.prompts??[]).some(prompt=>prompt.result===undefined);
  }
  function activeSeat(state) {
    const seat=state.activePlayer;
    assert.ok(seat===0||seat===1,
      'Twinleaf activePlayer is not a physical seat index');
    return seat;
  }
  function prizeCount(state,seat) {
    return state.players[seat].prizes.reduce(
      (sum,slot)=>sum+(slot.cards?.length??0),0);
  }
  function verifyBothLedgers(state,context) {
    assert.ok(state?.players?.length===2);
    assert.ok(metadataByState?.has(state),
      'Both seat-private ledgers exist only for a sampled State');
    const ledgers=[0,1].map(seat=>
      canonicalOwnerLedger(knowledgeBySeat(state,seat,context),prizeCount(state,seat)));
    certification.ledgerChecks++;
    return ledgers;
  }
  function verifyRootLedger(state,seat,context) {
    assert.equal(seat,context?.rootSeat,
      'The undeterminized State may be observed only by the root actor');
    const ledger=canonicalOwnerLedger(
      knowledgeBySeat(state,seat,context),prizeCount(state,seat));
    certification.rootLedgerChecks++;
    return ledger;
  }
  function observe(state,seat,context) {
    checkDeadline(context,'observation-start');
    const sampled=metadataByState?.has(state);
    const ownerLedger=sampled?
      verifyBothLedgers(state,context)[seat]:
      verifyRootLedger(state,seat,context);
    const base=deps.actorObservation(state,seat,{
      ownerK1Snapshot:ownerLedger.ownerK1Snapshot
    });
    assert.equal(base.actorSeat,seat,'Actor observation belongs to a different physical seat');
    assert.deepEqual(base.ownerK1,ownerLedger.ownerK1Snapshot,
      'Actor observation omitted or changed the owner K1 snapshot');
    const ownTurnResources={
      ...(base.ownTurnResources??{}),
      attacksThisTurn:state.players[seat].active?.attacksThisTurn??0
    };
    const sampledMetadata=metadataByState?.get(state);
    const ownDecklistId=sampledMetadata?.decklistIds?.[seat]??
      (seat===deps.ownDecklistSeat?deps.ownDecklistId:null);
    const observation={
      ...base,ownTurnResources,ownerKnowledgeLedger:ownerLedger,
      rulesProfileId:deps.rulesProfileId,
      ...(ownDecklistId===null||ownDecklistId===undefined?{}:{ownDecklistId})
    };
    certification.ownerLedgerKeyChecks++;
    checkDeadline(context,'observation-complete');
    return deepFreeze(observation);
  }
  function copyMetadata(fromState,toState) {
    if(!metadataByState?.has(fromState))return;
    assert.equal(deps.sampleDeterminization.refreshMetadata(fromState,toState),true,
      'Sampled-state transition lost its private-ledger refresh capability');
  }
  function assertEnvelope(state,seat,context) {
    checkDeadline(context,'envelope-start');
    assert.equal(state.phase,deps.GamePhase.PLAYER_TURN,
      'Flittle MCTS may act only in PLAYER_TURN');
    assert.equal(stable(state),true,
      'Flittle MCTS applicability envelope requires a stable state');
    const view=observe(state,seat,context);
    assert.equal(deps.assertApplicabilityEnvelope(state,seat,view),true,
      'State is outside the registered Flittle applicability envelope');
    certification.envelopeChecks++;
    checkDeadline(context,'envelope-complete');
    return view;
  }
  function assertSuccessorEnvelope(state,context) {
    const seat=activeSeat(state);
    if(metadataByState?.has(state)||seat===context?.rootSeat)
      return assertEnvelope(state,seat,context);
    // Root-frontier validation begins from an undeterminized State. If a
    // candidate passes turn, do not observe the opponent's private ledger
    // before the search has sampled that opponent's information set.
    checkDeadline(context,'root-only-successor-start');
    assert.equal(stable(state),true,
      'Undeterminized root successor must resolve prompts before sampling');
    verifyRootLedger(state,context?.rootSeat,context);
    checkDeadline(context,'root-only-successor-complete');
    return null;
  }
  function resolvePrompts(simulator,random,context) {
    let count=0;
    while(!stable(simulator.store.state)) {
      checkDeadline(context,'prompt-resolution');
      assert.ok(count++<maxPromptResolutions,
        'Prompt resolution exceeded the safety bound');
      const state=simulator.store.state;
      const prompt=state.prompts.find(item=>item.result===undefined);
      if(!(prompt instanceof deps.WaitPrompt)) {
        const error=new Error('Unsupported policy/card-effect prompt in Flittle MCTS envelope: '+
          (prompt?.constructor?.name??'unknown'));
        error.code='MCTS_UNSUPPORTED_PROMPT';
        throw error;
      }
      const before=stateFingerprint(state);
      withRandom(random,()=>simulator.dispatch(
        new deps.ResolvePromptAction(prompt.id,null)));
      const next=simulator.store.state;
      assert.notEqual(stateFingerprint(next),before,
        'Neutral WaitPrompt resolution produced no state transition');
      certification.waitPromptResolutions++;
    }
    return simulator.store.state;
  }
  function validateCandidate(state,seat,action,index,context) {
    checkDeadline(context,'candidate-validation-start');
    const validationRandom=seededRandom(
      (((options.seed??9)>>>0)^Math.imul(index+1,0x9e3779b9))>>>0);
    const simulator=withRandom(validationRandom,()=>
      new deps.Simulator(state,deps.simulatorOptions));
    copyMetadata(state,simulator.store.state);
    const before=stateFingerprint(simulator.store.state);
    try {
      withRandom(validationRandom,()=>simulator.dispatch(action));
    } catch(error) {
      if(error instanceof deps.GameError)return false;
      throw error;
    }
    resolvePrompts(simulator,validationRandom,context);
    const next=simulator.store.state;
    const after=stateFingerprint(next);
    if(before===after)return false;
    copyMetadata(state,next);
    assertSuccessorEnvelope(next,context);
    checkDeadline(context,'candidate-validation-complete');
    return true;
  }

  function enumerateActions(state,seat,context) {
    checkDeadline(context,'enumeration-start');
    assert.equal(activeSeat(state),seat);
    const view=assertEnvelope(state,seat,context);
    const rawActions=enumerator.enumerate(state,state.players[seat],state.players[seat].id);
    assert.ok(Array.isArray(rawActions),'ActionEnumerator did not return an array');
    certification.maxRawActionCount=Math.max(
      certification.maxRawActionCount,rawActions.length);
    // Every pinned action category has an eight-candidate cap. A total
    // frontier below eight proves no category reached that cap; at or above
    // eight, this adapter refuses to claim completeness.
    assert.ok(rawActions.length<UPSTREAM_ACTION_CAP,
      'Upstream ActionEnumerator may have truncated a candidate category');
    const rawKeys=rawActions.map(actionKey);
    assert.equal(new Set(rawKeys).size,rawKeys.length,
      'ActionEnumerator returned duplicate semantic action keys');
    const accepted=[];
    for(let index=0;index<rawActions.length;index++) {
      checkDeadline(context,'candidate-validation-loop');
      if(validateCandidate(state,seat,rawActions[index],index,context))
        accepted.push(rawActions[index]);
    }
    const actualKeys=accepted.map(actionKey).sort();
    const expected=expectedActionKeys(view,seat);
    assert.ok(Array.isArray(expected)&&expected.every(key=>
      typeof key==='string'&&key.length>0),
      'Expected Flittle frontier must be an array of semantic action keys');
    assert.equal(new Set(expected).size,expected.length,
      'Expected Flittle frontier contains duplicate action keys');
    assert.deepEqual(actualKeys,expected.slice().sort(),
      'Simulator-filtered native frontier differs from the complete Flittle action set');
    certification.frontierChecks++;
    certification.maxAcceptedActionCount=Math.max(
      certification.maxAcceptedActionCount,accepted.length);
    checkDeadline(context,'enumeration-complete');
    return accepted;
  }

  const adapter={
    observe,
    activeSeat,
    enumerateActions,
    actionKey,
    applyAction(state,action,random,context) {
      checkDeadline(context,'transition-start');
      const seat=activeSeat(state);
      assertEnvelope(state,seat,context);
      const simulator=withRandom(random,()=>
        new deps.Simulator(state,deps.simulatorOptions));
      copyMetadata(state,simulator.store.state);
      const before=stateFingerprint(simulator.store.state);
      withRandom(random,()=>simulator.dispatch(action));
      resolvePrompts(simulator,random,context);
      const next=simulator.store.state;
      assert.notEqual(stateFingerprint(next),before,
        'Selected native action produced no game-state transition');
      copyMetadata(state,next);
      assertSuccessorEnvelope(next,context);
      checkDeadline(context,'transition-complete');
      return next;
    },
    sampleDeterminization(state,seat,random,context) {
      checkDeadline(context,'determinization-start');
      const before=verifyRootLedger(state,seat,context);
      const sampled=deps.sampleDeterminization(state,seat,random);
      assert.ok(sampled&&sampled!==state,
        'Determinization must return a detached Twinleaf State');
      const after=verifyBothLedgers(sampled,context);
      assert.deepEqual(after[seat],before,
        'Sampling changed the root actor private ledger');
      certification.rootLedgerPreservationChecks++;
      assertEnvelope(sampled,activeSeat(sampled),context);
      checkDeadline(context,'determinization-complete');
      return sampled;
    },
    isTerminal(state) {
      return state.phase===deps.GamePhase.FINISHED;
    },
    terminalValue(state,seat) {
      const winner=deps.winnerSeat(state);
      if(winner===null||winner===undefined)return 0;
      return winner===seat?1:-1;
    },
    evaluateObservation:deps.evaluateObservation,
    actionPrior:deps.actionPrior,
    isStable:stable,
    resetCertification() {
      for(const key of Object.keys(certification))certification[key]=0;
    },
    certificationAudit() {
      return {
        frontierComplete:certification.frontierChecks>0,
        bothSeatKnowledgeLedgersVerified:certification.ledgerChecks>0,
        rootLedgerPreserved:certification.rootLedgerPreservationChecks>0,
        ownerLedgerInInformationSetKey:certification.ownerLedgerKeyChecks>0,
        promptResolutionActorScoped:true,
        applicabilityEnvelopeId:FLITTLE_ENVELOPE_ID,
        frontierChecks:certification.frontierChecks,
        envelopeChecks:certification.envelopeChecks,
        ledgerChecks:certification.ledgerChecks,
        rootLedgerChecks:certification.rootLedgerChecks,
        rootLedgerPreservationChecks:certification.rootLedgerPreservationChecks,
        ownerLedgerKeyChecks:certification.ownerLedgerKeyChecks,
        waitPromptResolutions:certification.waitPromptResolutions,
        maxRawActionCount:certification.maxRawActionCount,
        maxAcceptedActionCount:certification.maxAcceptedActionCount,
        rulesProfileId:deps.rulesProfileId
      };
    }
  };
  return Object.freeze(adapter);
}

function createTwinleafMcts(deps,options={}) {
  const iterations=options.iterations??PILOT_MAX_ITERATIONS;
  const maxPlies=options.maxPlies??PILOT_MAX_PLIES;
  const maxDecisionMs=options.maxDecisionMs??PILOT_MAX_DECISION_MS;
  const cPuct=options.cPuct??1.4;
  const seed=options.seed??9;
  assert.ok(Number.isSafeInteger(iterations)&&iterations>0&&
    iterations<=PILOT_MAX_ITERATIONS,
    'Flittle pilot iteration budget exceeds the registered ceiling');
  assert.ok(Number.isSafeInteger(maxPlies)&&maxPlies>0&&
    maxPlies<=PILOT_MAX_PLIES,
    'Flittle pilot action-ply budget exceeds the registered ceiling');
  assert.ok(Number.isFinite(maxDecisionMs)&&maxDecisionMs>0&&
    maxDecisionMs<=PILOT_MAX_DECISION_MS,
    'Flittle pilot decision-time budget exceeds the registered ceiling');
  assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
  const adapter=createTwinleafInformationSetSearch(deps,options);
  const {resetCertification,certificationAudit,...searchDependencies}=adapter;
  const search=createInformationSetMcts({
    ...searchDependencies,
    iterations,maxPlies,cPuct,seed,maxDecisionMs,
    ...(options.now?{now:options.now}:{}),
    ...(options.opponentActionPolicy?{
      opponentActionPolicy:options.opponentActionPolicy,
      opponentPolicyId:options.opponentPolicyId
    }:{})
  });
  return Object.freeze({
    search(rootState,rootSeat) {
      resetCertification();
      const result=search.search(rootState,rootSeat);
      return {
        ...result,
        audit:{...result.audit,...certificationAudit()}
      };
    }
  });
}

module.exports={
  FLITTLE_ENVELOPE_ID,
  createTwinleafInformationSetSearch,
  createTwinleafMcts,
  flittleActionKey,
  expectedFlittleActionKeys,
  flittleNativeActionToIntent
};
