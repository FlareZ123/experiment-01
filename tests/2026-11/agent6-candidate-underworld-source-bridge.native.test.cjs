'use strict';

/*
 * Review-only, no-game, pinned Store vertical slice:
 * authentic unchanged Hood Shield 60 versus authentic Aichi rank-1 60;
 * actual legal native Underworld Door and competing manual hand Energy root;
 * certified pre-digest source printings -> strict actor protocol -> exact
 * PR95 candidate worker -> same native Store prompt/attachment/draw settlement.
 *
 * This file is intentionally not in any auto-trigger or match runner.
 * It must be compiled/executed in the pinned Twinleaf native environment.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const candidateDeck=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const field=require('../../results/aichi-2026/full-decklists.json');
const candidateWorker=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {createValidationRandomScope,seededRandom}=
  require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');
const {resolvePrintedDeck,printed60Fingerprint}=
  require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const {createCertifiedV3RoleAdapters}=
  require('../../simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs');
const rootHost=require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const promptHost=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {installPromptProvenanceHook}=
  require('../../simulation/evaluation/2026-11/agent36-prompt-provenance.cjs');
const {publicEventReceipt}=
  require('../../simulation/twinleaf/agent8-public-event-receipt.cjs');
const {actorObservation}=
  require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PR94_BRIDGE_BLOB='3686489bfb60a1cefefb9387f141e20ed37f9cab';
const PR95_WORKER_BLOB='bd08b9bdb6207d8950027584f7524bb3336eb047';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=module=>require(path.join(output,module));
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const opponentDeck=field.decks.find(row=>row.rank===1);
assert.ok(opponentDeck,'Unchanged exact Aichi rank-1 source 60 must exist');

function nativeBindings(){
  const card=native('game/store/card/card-types');
  const play=native('game/store/actions/play-card-action');
  return {
    ActionEnumerator:native('advanced-bot/action-enumerator').ActionEnumerator,
    Store:native('game/store/store').Store,
    Simulator:native('game/bots/simulator').Simulator,
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    TrainerCard:native('game/store/card/trainer-card').TrainerCard,
    PlayerType:play.PlayerType,SlotType:play.SlotType,
    TrainerType:card.TrainerType,CardType:card.CardType,
    EnergyType:card.EnergyType,SuperType:card.SuperType,
    StateUtils:native('game/store/state-utils').StateUtils,
    CheckPokemonTypeEffect:native('game/store/effects/check-effects').CheckPokemonTypeEffect,
    GameError:native('game/game-error').GameError,
    ResolvePromptAction
  };
}

let nextPhysicalId=970000;
function buildPhysical60(manager,source,label){
  const resolved=resolvePrintedDeck(source,manager.getAllCards(),{label});
  assert.equal(resolved.total,60);
  const cards=resolved.fullNames.map(name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing native resolved physical card '+name);
    card.id=nextPhysicalId++;
    return card;
  });
  return {resolved,cards};
}

function occupyFull60(player,physical,role){
  const remaining=physical.cards.slice();
  const take=predicate=>{
    const i=remaining.findIndex(predicate);
    assert.ok(i>=0,'Original source 60 lacks a required physical card');
    return remaining.splice(i,1)[0];
  };
  player.active.cards.length=0;
  player.active.energies.cards.length=0;
  player.active.damage=0;
  player.hand.cards.length=0;
  player.deck.cards.length=0;
  for(const bench of player.bench){
    bench.cards.length=0;
    bench.energies.cards.length=0;
    bench.damage=0;
  }
  for(const prize of player.prizes)prize.cards.length=0;
  if(role==='candidate'){
    player.active.cards.push(take(c=>c.fullName==='Shadow Rider Calyrex V CRE'));
    player.active.cards.push(take(c=>c.fullName==='Shadow Rider Calyrex VMAX CRE'));
    player.bench[0].cards.push(take(c=>c.fullName==='Shadow Rider Calyrex V CRE'));
    player.bench[1].cards.push(take(c=>c.fullName==='Mimikyu GRI'));
    // Five already-attached Psychic means the candidate worker does not
    // rank another MANUAL Active VMAX attachment above accelerating a Bench V.
    // Its legal manual Bench alternative remains offered for real arbitration.
    for(let i=0;i<5;i++){
      const energy=take(c=>c.name==='Psychic Energy');
      player.active.cards.push(energy);
      player.active.energies.cards.push(energy);
    }
    player.hand.cards.push(take(c=>c.name==='Psychic Energy'));
  }else{
    player.active.cards.push(take(c=>c.fullName==='Shadow Rider Calyrex V CRE'));
    player.bench[0].cards.push(take(c=>c.fullName==='Shadow Rider Calyrex V CRE'));
    player.hand.cards.push(...remaining.splice(0,7));
  }
  for(const prize of player.prizes){
    const card=remaining.pop();
    assert.ok(card);
    prize.cards.push(card);
  }
  player.deck.cards.push(...remaining);
  const seen=[
    ...player.active.cards,...player.bench.flatMap(s=>s.cards),
    ...player.hand.cards,...player.deck.cards,
    ...player.prizes.flatMap(s=>s.cards)
  ];
  assert.equal(seen.length,60,'physical source multiset must remain exactly 60');
  assert.deepEqual(seen.map(c=>c.fullName).sort(),
    physical.resolved.fullNames.slice().sort(),
    'no source 60 membership substitution permitted');
  assert.equal(new Set(seen.map(c=>c.id)).size,60,
    'every physical source card must occupy exactly one zone');
}

function scene(seat){
  const x=stage(seat);
  const manager=initializeCards();
  const owner=buildPhysical60(manager,candidateDeck,'Hood Shield source original 60');
  const adversary=buildPhysical60(manager,opponentDeck,'Aichi rank-1 original source 60');
  occupyFull60(x.owner,owner,'candidate');
  occupyFull60(x.opponent,adversary,'opponent');
  x.state.turn=5;
  x.state.activePlayer=seat;
  x.state.phase=x.GamePhase.PLAYER_TURN;
  const dependencies=nativeBindings();
  const adapters=createCertifiedV3RoleAdapters({
    native:{...dependencies,observe:actorObservation},
    protocol,candidateSeat:seat,opponentSeat:1-seat,
    candidateSourceDeck:candidateDeck,
    opponentSourceDeck:opponentDeck,
    candidateNativeOrdered60:owner.resolved.fullNames,
    opponentNativeOrdered60:adversary.resolved.fullNames,
    actionFrontier:rootHost,promptProjection:promptHost,
    eventReceipt:publicEventReceipt
  });
  return {...x,owner60:owner,opponent60:adversary,dependencies,adapters};
}

function checkedDecision(worker,request,init,sequence,seenRequestIds){
  const admitted=protocol.validateRequest(request,init,sequence,seenRequestIds);
  const result=worker.decideWithAudit(request);
  protocol.validateDecision(result.decision,request.prompt,admitted.actionTokens);
  protocol.validatePolicyAudit(result.policyAudit,request,result.decision,
    candidateWorker.POLICY_VERSION);
  return result;
}

for(const seat of [0,1]){
  test('native Hood Underworld root -> strict prompt -> physical Energy+draw; seat '+seat,()=>{
    const restorePaper=installUnderworldDoorPsychicRecipientHook();
    try{
    const x=scene(seat);
    const {store,state,owner,adapters,dependencies}=x;
    // The production host revalidates a worker token in a detached native
    // Simulator under an isolated deterministic RNG, before the physical
    // Store dispatch. Exercise that same boundary rather than hand-dispatch.
    const withValidationRandom=createValidationRandomScope({
      ambientRandom:Math.random,physicalRandom:seededRandom(0x37b451c0+seat)
    });
    const initial=adapters.native.observe(state,seat);
    assert.ok(Object.isFrozen(initial),'pre-digest actor view must be frozen');
    assert.equal(initial.ownPublic.active.printing,
      'Shadow Rider Calyrex VMAX CRE 75');
    assert.deepEqual(initial.ownHand,['Psychic Energy MEE 13']);
    assert.equal(initial.opponentPublic.active.printing,'Shadow Rider Calyrex V CRE 74');
    assert.equal(initial.opponentPublic.prizeSlots.some(s=>s.printing!==undefined),false);
    const root=withValidationRandom(()=>
      adapters.actionFrontier.buildNativeActionFrontier({
        state,actorSeat:seat,native:dependencies
      }));
    const available=root.actionFrontier.items;
    const ability=available.filter(item=>item.kind==='use-ability'&&
      item.actorPrinting==='Shadow Rider Calyrex VMAX CRE 75'&&
      item.publicMetadata?.abilityName==='Underworld Door');
    const competing=available.filter(item=>item.kind==='play-card'&&
      item.actorPrinting==='Psychic Energy MEE 13'&&
      item.publicMetadata?.targetZone==='bench'&&
      item.publicMetadata?.targetSeat==='actor');
    assert.equal(ability.length,1,'first native blocker: Underworld Door legal root absent');
    assert.ok(competing.length>=1,'first native blocker: genuine manual Bench Energy alternative absent');
    const init={role:'candidate',seat,
      policyVersion:candidateWorker.POLICY_VERSION,config:{}};
    const worker=candidateWorker.createPolicy(init);
    const seenRequestIds=new Set();
    const rootReq={
      schema:protocol.REQUEST_SCHEMA,type:'decision',
      requestId:'agent6-actual-door-root-'+seat,sequence:0,
      role:'candidate',seat,observationSchema:protocol.OBSERVATION_SCHEMA,
      observation:initial,prompt:null,
      publicEventReceipt:adapters.eventReceipt(state,seat),
      actionFrontier:root.actionFrontier
    };
    const rootDecision=checkedDecision(worker,rootReq,init,0,seenRequestIds);
    assert.deepEqual(rootDecision.decision,
      {kind:'select-action',token:ability[0].token},
      'candidate worker must prefer genuine accelerating Door over manual Bench attachment');
    const actionValidationEvidence={};
    const physicalAction=rootHost.dispatchSelectedNativeAction({
      store,frontier:root,token:rootDecision.decision.token,
      state,actorSeat:seat,native:dependencies,withValidationRandom,
      dispatch:false,validationEvidence:actionValidationEvidence
    });
    assert.equal(actionValidationEvidence.selectedActionValidated,true);
    assert.equal(actionValidationEvidence.fullOriginalStoreStateUnchanged,true);
    assert.equal(actionValidationEvidence.nativeValidationStoreMode,'cloned-store');
    assert.strictEqual(physicalAction,root.actionByToken.get(ability[0].token),
      'no invented action: worker token resolves to original host physical Action');
    const handEnergy=owner.hand.cards[0];
    const beforeDeck=owner.deck.cards.length;
    const beforeHand=owner.hand.cards.length;
    const beforeBenchVEnergy=owner.bench[0].energies.cards.length;
    const beforeTurn=state.turn;
    const beforeEnergyStamp=owner.energyPlayedTurn;
    const hook=installPromptProvenanceHook(store);
    let projectedPrompt=null,chosenPromptToken=null,promptCount=0;
    let promptDecisionAudit=null,promptNativeValidation=null;
    try{
      store.dispatch(physicalAction);
      for(let i=0;i<32;i++){
        const pending=state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        if(pending.constructor.name==='WaitPrompt'){
          store.dispatch(new ResolvePromptAction(pending.id,null));
          continue;
        }
        assert.equal(pending.constructor.name,'AttachEnergyPrompt',
          'first native blocker: unexpected discretionary prompt after Door');
        assert.equal(promptCount++,0,'Underworld Door should require one assignment prompt');
        const projected=adapters.promptProjection.projectPrompt({
          prompt:pending,state,actorSeat:seat,native:dependencies,
          store,provenanceHook:hook
        });
        assert.equal(projected.hostOnly,false);
        const actorView=adapters.native.observe(state,seat);
        const req={
          schema:protocol.REQUEST_SCHEMA,type:'decision',
          requestId:'agent6-actual-door-prompt-'+seat,sequence:1,
          role:'candidate',seat,observationSchema:protocol.OBSERVATION_SCHEMA,
          observation:actorView,prompt:projected.promptProjection,
          publicEventReceipt:adapters.eventReceipt(state,seat),
          actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}
        };
        assert.equal(req.prompt.source.sourcePrinting,
          'Shadow Rider Calyrex VMAX CRE 75');
        assert.equal(req.prompt.publicMetadata.selectionType,'energy-attachment');
        const actualEnergyChoices=req.prompt.choices.filter(choice=>choice.kind==='energy');
        assert.ok(actualEnergyChoices.length>=1,
          'native Underworld Door must offer at least one actual Psychic Energy assignment');
        assert.ok(actualEnergyChoices.every(choice=>
          choice.printing==='Psychic Energy MEE 13'));
        assert.ok(req.prompt.choices.filter(choice=>choice.kind!=='energy')
          .every(choice=>choice.kind==='cancel'),
          'optional native cancellation is permitted, fabricated prompt choice is not');
        const answer=checkedDecision(worker,req,init,1,seenRequestIds);
        promptDecisionAudit=answer.policyAudit;
        assert.equal(answer.decision.kind,'select-choice');
        const chosen=req.prompt.choices.find(c=>c.token===answer.decision.token);
        assert.equal(chosen?.publicMetadata?.benchIndex,0,
          'source V should be preferred recipient against Shadow Rider mirror');
        assert.ok(projected.choiceByToken.has(answer.decision.token),
          'worker choice token must refer to original physical native result');
        const prompted=promptHost.dispatchPromptChoice({
          store,prompt:pending,state,actorSeat:seat,
          projection:projected,decision:answer.decision,
          native:{ResolvePromptAction,Store:dependencies.Store},
          withValidationRandom,dispatch:true
        });
        promptNativeValidation=prompted.validationReceipt;
        assert.equal(promptNativeValidation?.nativeValidationStoreMode,'cloned-store');
        assert.equal(promptNativeValidation?.fullOriginalStoreStateUnchanged,true);
        assert.equal(promptNativeValidation?.clonedPromptResolved,true);
        projectedPrompt=req.prompt;
        chosenPromptToken=answer.decision.token;
      }
      assert.equal(promptCount,1,'actual Store must resolve one energy assignment');
      assert.equal(state.prompts.some(p=>p.result===undefined),false,
        'native root/prompt chain must be fully settled');
      assert.strictEqual(owner.bench[0].energies.cards[0],handEnergy,
        'the original held Psychic Energy must physically move to intended Bench V');
      assert.equal(owner.hand.cards.includes(handEnergy),false);
      assert.equal(owner.deck.cards.length,beforeDeck-2,
        'Underworld Door should physically draw two cards');
      assert.equal(owner.hand.cards.length,2,
        'one Energy spent from hand, two physical cards drawn');
      assert.equal(owner.energyPlayedTurn,beforeEnergyStamp,
        'ordinary hand Energy attachment remains unused');
      assert.equal(state.turn,beforeTurn,
        'Ability and associated mandatory prompt must not finish turn');
      assert.equal(state.activePlayer,seat);
      const post=withValidationRandom(()=>
        adapters.actionFrontier.buildNativeActionFrontier({
          state,actorSeat:seat,native:dependencies
        }));
      assert.equal(post.actionFrontier.items.some(a=>
        a.kind==='use-ability'&&
        a.actorPrinting==='Shadow Rider Calyrex VMAX CRE 75'&&
        a.publicMetadata?.abilityName==='Underworld Door'),false,
        'negative control: the spent same-source Ability is no longer native-legal');
      // The required negative is a *decision*, not just an absent frontier
      // item. Pass the post-attachment real physical frontier through the
      // exact same source/strict protocol and worker. An alternate action or
      // typed abstention is acceptable; repeating the spent Door is not.
      const postReq={
        schema:protocol.REQUEST_SCHEMA,type:'decision',
        requestId:'agent6-actual-door-post-'+seat,sequence:2,
        role:'candidate',seat,observationSchema:protocol.OBSERVATION_SCHEMA,
        observation:adapters.native.observe(state,seat),prompt:null,
        publicEventReceipt:adapters.eventReceipt(state,seat),
        actionFrontier:post.actionFrontier
      };
      const postResult=checkedDecision(worker,postReq,init,2,seenRequestIds);
      const postDecision=postResult.decision;
      assert.ok(['select-action','abstain'].includes(postDecision.kind),
        'spent Door must cause a strict worker alternate root or typed abstention');
      if(postDecision.kind==='select-action'){
        const selectedAfter=post.actionFrontier.items.find(item=>
          item.token===postDecision.token);
        assert.ok(selectedAfter,'post ability decision must have a real offered token');
        assert.notEqual(selectedAfter.publicMetadata?.abilityName,'Underworld Door',
          'worker must not retry an already consumed same-source Ability');
      }
      const receipt={
        kind:'agent6-pinned-store-underworld-no-game',
        seat,enginePin:PIN,branchWorkerBlob:PR95_WORKER_BLOB,
        bridgeBlob:PR94_BRIDGE_BLOB,
        exactTestSha256:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
        checkoutHead:process.env.GITHUB_SHA??'local-unrecorded',
        candidate60Sha256:printed60Fingerprint(candidateDeck),
        opponent60Sha256:printed60Fingerprint(opponentDeck),
        candidateSourceCards:60,opponentSourceCards:60,
        candidateOriginalSourceInventory:candidateDeck.cards.map(row=>({
          count:row.count,name:row.name,printing:row.printing
        })),
        opponentOriginalSourceInventory:opponentDeck.cards.map(row=>({
          count:row.count,name:row.name,printing:row.printing
        })),
        competingManualEnergyActions:competing.length,
        competingManualEnergyTokens:competing.map(item=>item.token),
        nativeLegalRootTokens:available.map(item=>({
          token:item.token,kind:item.kind,actorPrinting:item.actorPrinting??null
        })),
        actorProjection:{
          decisionKind:initial.decisionKind,active:initial.ownPublic.active?.printing,
          benched:initial.ownPublic.bench.map(slot=>slot?.printing??null),
          ownHand:initial.ownHand.slice(),
          opponentActive:initial.opponentPublic.active?.printing,
          ownPrizeSlotCount:initial.ownPublic.prizeSlots.length,
          opponentPrizeSlotCount:initial.opponentPublic.prizeSlots.length
        },
        rootNativeValidation:{
          selectedActionValidated:actionValidationEvidence.selectedActionValidated,
          mode:actionValidationEvidence.nativeValidationStoreMode,
          originalStoreUnchanged:actionValidationEvidence.fullOriginalStoreStateUnchanged
        },
        promptNativeValidation:{
          mode:promptNativeValidation?.nativeValidationStoreMode,
          originalStoreUnchanged:promptNativeValidation?.fullOriginalStoreStateUnchanged,
          clonedPromptResolved:promptNativeValidation?.clonedPromptResolved
        },
        strictRootDecision:{
          kind:rootDecision.decision.kind,selectedTokens:rootDecision.policyAudit.selectedTokens,
          auditRule:rootDecision.policyAudit.selectionRuleCode,
          tieBreak:rootDecision.policyAudit.tieBreakCode
        },
        selectedRootToken:rootDecision.decision.token,
        selectedPromptToken:chosenPromptToken,
        promptType:projectedPrompt?.promptType,
        promptSource:projectedPrompt?.source??null,
        promptChoices:projectedPrompt?.choices??[],
        strictPromptDecision:{
          selectedTokens:promptDecisionAudit?.selectedTokens??[],
          auditRule:promptDecisionAudit?.selectionRuleCode??null,
          tieBreak:promptDecisionAudit?.tieBreakCode??null
        },
        postDoorDecisionKind:postDecision.kind,
        postDoorAuditRule:postResult.policyAudit.selectionRuleCode,
        postDoorSelectedToken:postDecision.kind==='select-action'?postDecision.token:null,
        postDoorRemainingLegal:false,
        drawnCards:beforeDeck-owner.deck.cards.length,
        physicalDelta:{
          deckBefore:beforeDeck,deckAfter:owner.deck.cards.length,
          handBefore:beforeHand,handAfter:owner.hand.cards.length,
          benchVEnergyBefore:beforeBenchVEnergy,
          benchVEnergyAfter:owner.bench[0].energies.cards.length,
          turnBefore:beforeTurn,turnAfter:state.turn
        },
        manualEnergyStampPreserved:true,
        settledNative:true,
        gamesPlayed:0
      };
      assert.equal(createHash('sha256').update(JSON.stringify(receipt)).digest('hex').length,64);
      process.stdout.write('AGENT6_NATIVE_UNDERWORLD_NO_GAME '+JSON.stringify(receipt)+'\n');
    }finally{
      hook.restore();
      assert.equal(hook.restored,true);
    }
    }finally{
      restorePaper();
      assert.equal(restorePaper.isRestored,true);
    }
  });
}
