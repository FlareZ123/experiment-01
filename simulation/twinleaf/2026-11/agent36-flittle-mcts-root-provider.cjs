'use strict';

const assert=require('node:assert/strict');
const {
  createTwinleafDeterminizationSampler,
  createPublicDecklistPriorProvider,
  normalizeKnowledge
}=require('./agent5-twinleaf-belief-input.cjs');
const {
  createTwinleafMcts,
  flittleActionKey,
  expectedFlittleActionKeys,
  flittleNativeActionToIntent
}=require('./agent5-twinleaf-mcts-adapter.cjs');
const {actorObservation}=require('../actor-observation-contract.cjs');

const FLITTLE='Flittle SVI';
const PSYCHIC='Psychic Energy SVE';
const ENVELOPE_ID='flittle-basic-psychic-v1';
const RULES_PROFILE_PREFIX='twinleaf-default-rules-flittle-v1';
// One-action root-dispatch smoke test only. It does not search an opponent reply.
const PILOT_BUDGET=Object.freeze({
  iterations:16,
  maxPlies:1,
  maxDecisionMs:250,
  seed:20261113
});
const TEST_DECKLIST=Object.freeze({
  id:ENVELOPE_ID,
  cards:Object.freeze([FLITTLE,...Array(59).fill(PSYCHIC)])
});

function assertRegisteredFlittleDecklist(decklist,label) {
  assert.ok(decklist&&typeof decklist.id==='string'&&decklist.id.length>0,
    (label??'Registered decklist')+' requires a stable ID');
  assert.ok(Array.isArray(decklist.cards),
    (label??'Registered decklist')+' requires a card array');
  assert.equal(decklist.cards.length,60,
    (label??'Registered decklist')+' must contain exactly 60 cards');
  assert.deepEqual(decklist.cards.slice().sort(),TEST_DECKLIST.cards.slice().sort(),
    (label??'Registered decklist')+' differs from the one-Flittle/59-Psychic fixture');
  return {id:decklist.id,cards:decklist.cards.slice()};
}

function prizeCount(state,seat) {
  return state.players[seat].prizes.reduce(
    (sum,slot)=>sum+(slot.cards?.length??0),0
  );
}

function hasPendingPrompt(state) {
  return (state.prompts??[]).some(prompt=>prompt.result===undefined);
}

/**
 * The registered test deck has one Flittle, forced Active, and 59 Basic
 * Psychic Energy. Prize identities are inferred from that closed list and
 * the publicly established Active; this function reads Prize cardinality
 * only, never face-down Prize card faces.
 */
function knowledgeBySeat(state,seat) {
  assert.ok(seat===0||seat===1);
  const count=prizeCount(state,seat);
  const knownPrizePrintings=count===0?[]:[{printing:PSYCHIC,copies:count}];
  return {
    verified:true,
    mode:'K1',
    knownPrizePrintings,
    knownTopDeck:[],
    knownBottomDeck:[],
    knownBottomDeckOrder:false,
    ownerK1Snapshot:{
      epoch:0,
      exactMembershipKnown:true,
      knownPrintings:knownPrizePrintings.map(row=>({...row}))
    }
  };
}

function observe(state,seat) {
  const ledger=knowledgeBySeat(state,seat);
  return actorObservation(state,seat,{
    ownerK1Snapshot:ledger.ownerK1Snapshot
  });
}

function assertPublicPokemon(view,energyCount,maxDamage=10) {
  assert.ok(view&&typeof view==='object');
  assert.equal(view.printing,FLITTLE);
  // Twinleaf's public PokemonCardList.cards projection includes attached
  // Energy. energies is a second projection of those same physical cards.
  assert.deepEqual(view.evolutionPrintings,
    [FLITTLE,...Array(energyCount).fill(PSYCHIC)]);
  assert.deepEqual(view.energies,Array(energyCount).fill(PSYCHIC));
  assert.deepEqual(view.tools,[]);
  assert.equal(view.hp,30);
  assert.ok(Number.isInteger(view.damage)&&view.damage>=0&&
    view.damage<=maxDamage);
  assert.deepEqual(view.specialConditions,[]);
  assert.equal(view.attacks.length,1);
  assert.equal(view.attacks[0].name,'Ram');
  assert.deepEqual(view.attacks[0].cost,['Psychic']);
  assert.equal(view.attacks[0].damage,10);
  const restrictions=view.publicRestrictions??{};
  assert.equal(restrictions.cannotAttackNextTurn,false);
  assert.deepEqual(restrictions.cannotUseAttacksNextTurn,[]);
  assert.equal(restrictions.blockedAttackNameNextTurn,null);
  assert.equal(restrictions.blockedAttackNameUntilLeavesActive,null);
  assert.equal(restrictions.onlyAllowedAttackNameNextTurn,null);
  assert.equal(restrictions.attackCostIncreaseNextTurn,0);
  assert.equal(restrictions.attackCostIncreaseWhileActive,0);
}

function assertPublicPlayerZones(view) {
  assert.equal(view.bench.length,5);
  assert.ok(view.bench.every(slot=>slot===null));
  assert.deepEqual(view.stadium,[]);
  assert.deepEqual(view.discard,[]);
  assert.deepEqual(view.lostZone,[]);
  assert.deepEqual(view.resolvingSupporter,[]);
  assert.equal(view.prizeCount,6);
  const restrictions=view.publicTurnRestrictions??{};
  assert.equal(restrictions.energyPlayLocked,false);
  assert.equal(restrictions.attackLockTurnsRemaining,0);
  assert.ok(restrictions.attackMaxEnergy===null||
    restrictions.attackMaxEnergy===undefined);
  assert.equal(restrictions.attackMaxEnergyTurnsRemaining,0);
  assert.deepEqual(restrictions.ignoreAttackCostCardTypes,[]);
  assert.equal(restrictions.ignoreAttackCostTurnsRemaining,0);
  assert.equal(restrictions.specialEnergyPlayLocked,false);
}

function assertVerifiedK1Ledgers(state,actorSeat,view) {
  for(const physicalSeat of [0,1]) {
    const ledger=knowledgeBySeat(state,physicalSeat);
    const normalized=normalizeKnowledge(
      ledger,ledger.ownerK1Snapshot,prizeCount(state,physicalSeat));
    assert.equal(normalized.exactPrizeMembership,true);
    assert.deepEqual(normalized.knownPrizeCards,Array(6).fill(PSYCHIC),
      'The one-Flittle/59-Psychic fixture must retain six known Psychic Prizes');
  }
  const actorLedger=knowledgeBySeat(state,actorSeat);
  assert.deepEqual(view.ownerK1,actorLedger.ownerK1Snapshot,
    'Actor observation and the acting seat K1 ledger must agree');
}

function assertFlittleStateEnvelope(state,seat,view,native) {
  assert.ok(state&&state.players?.length===2);
  assert.ok(seat===0||seat===1);
  assert.equal(state.activePlayer,seat);
  assert.equal(state.phase,native.GamePhase.PLAYER_TURN);
  assert.equal(hasPendingPrompt(state),false);
  assert.ok(Number.isSafeInteger(state.turn)&&state.turn>=3);
  assert.ok(view&&view.actorSeat===seat);
  assert.equal(view.decisionKind,'owner-root');
  assert.equal(view.globalTurn,state.turn);
  assert.equal(view.ownTurnResources.energyPlayedTurn,
    state.players[seat].energyPlayedTurn);

  // Freeze the exact default Rules profile. No first-turn attack exception,
  // unlimited attachment, or omitted first-turn draw is permitted.
  assert.equal(state.rules.attackFirstTurn,false);
  assert.equal(state.rules.unlimitedEnergyAttachments,false);
  assert.equal(state.rules.firstTurnDrawCard,true);

  const publicBySeat=[null,null];
  publicBySeat[seat]=view.ownPublic;
  publicBySeat[1-seat]=view.opponentPublic;

  for(const physicalSeat of [0,1]) {
    const player=state.players[physicalSeat];
    const publicView=publicBySeat[physicalSeat];
    assert.ok(player.active&&player.active.getPokemonCard());
    const pokemon=player.active.getPokemonCard();
    assert.equal(pokemon.fullName,FLITTLE);
    assert.equal(pokemon.powers.length,0);
    assert.equal(pokemon.attacks.length,1);
    assert.equal(pokemon.attacks[0].name,'Ram');
    assert.equal(pokemon.attacks[0].text??'','');
    assert.equal(pokemon.retreat.length,0);

    const energies=player.active.energies?.cards??[];
    assert.ok(energies.length===1||energies.length===2);
    assert.ok(energies.every(card=>
      card.fullName===PSYCHIC&&card.energyType===native.EnergyType.BASIC));
    assert.equal(player.active.cards.length,1+energies.length);
    assert.ok(player.active.cards.every(card=>
      card.fullName===FLITTLE||card.fullName===PSYCHIC));
    assert.deepEqual(player.active.tools??[],[]);
    assert.deepEqual(player.active.specialConditions??[],[]);
    assert.ok(Number.isInteger(player.active.damage)&&
      player.active.damage>=0&&player.active.damage<=10);

    // A two-Energy state is reachable only immediately after the active
    // player attaches. After Ram/Pass timing resolves, the next active seat
    // has one Energy and the previous actor's attachment clock is in the past.
    if(energies.length===2) {
      assert.equal(state.activePlayer,physicalSeat);
      assert.equal(player.energyPlayedTurn,state.turn);
    } else {
      assert.ok(Number.isSafeInteger(player.energyPlayedTurn)&&
        player.energyPlayedTurn<state.turn);
    }

    assertPublicPokemon(publicView.active,energies.length,10);
    assertPublicPlayerZones(publicView);
    assert.equal(prizeCount(state,physicalSeat),6);
    if(physicalSeat===seat) {
      assert.ok(Array.isArray(view.ownHand));
      assert.deepEqual(view.ownHand,player.hand.cards.map(card=>card.fullName));
      assert.ok(view.ownHand.every(printing=>printing===PSYCHIC));
      assert.equal(view.ownPublic.handCount,view.ownHand.length);
      assert.equal(view.ownTurnResources.energyPlayLocked,false);
    }
  }

  // The active seat must not already have attacked in this turn. Inactive
  // players may have attacked immediately before the turn transition.
  assert.equal(state.players[seat].active.attacksThisTurn??0,0);
  assertVerifiedK1Ledgers(state,seat,view);
  return true;
}

/**
 * Root-only conditions are stricter than the post-action state validator:
 * both players have one Energy from an earlier turn, no damage, and the
 * acting player still has an attachment available.
 */
function assertFlittleRootEnvelope(state,seat,view,native) {
  assertFlittleStateEnvelope(state,seat,view,native);
  assert.ok(view.globalTurn>=3);
  assert.ok(view.ownTurnResources.energyPlayedTurn<view.globalTurn);
  for(const physicalSeat of [0,1]) {
    const player=state.players[physicalSeat];
    assert.equal(player.active.energies.cards.length,1);
    assert.equal(player.active.damage,0);
    assert.ok(player.energyPlayedTurn<state.turn);
  }
  assert.ok(view.ownHand.includes(PSYCHIC),
    'The certified root must contain a playable Psychic Energy');
  return true;
}

function actionKey(action,deps) {
  return flittleActionKey(action,deps);
}

function assertFlittleActionFrontier(actions,state,seat,view,deps) {
  assert.ok(Array.isArray(actions));
  const keys=actions.map(action=>flittleActionKey(action,deps)).sort();
  const expected=expectedFlittleActionKeys(view,deps);
  assert.deepEqual(keys,expected,
    'Native Flittle root frontier differs from actor-observation-derived actions');
  assert.equal(keys.length,3,
    'Certified Flittle root must contain attach/Ram/pass');
  const attach=actions.find(action=>action instanceof deps.PlayCardAction);
  const attack=actions.find(action=>action instanceof deps.AttackAction);
  const pass=actions.find(action=>action instanceof deps.PassTurnAction);
  assert.ok(attach&&attack&&pass);
  assert.equal(attack.name,'Ram');
  assert.equal(attach.target?.player,deps.PlayerType.BOTTOM_PLAYER);
  assert.equal(attach.target?.slot,deps.SlotType.ACTIVE);
  assert.equal(attach.target?.index,0);
  assert.equal(state.players[seat].hand.cards[attach.handIndex]?.fullName,PSYCHIC);
  return keys;
}

function mapActionToIntent(action,state,seat,deps) {
  return flittleNativeActionToIntent(action,state,seat,deps);
}

function sameBudget(actual) {
  return actual&&actual.iterations===PILOT_BUDGET.iterations&&
    actual.maxPlies===PILOT_BUDGET.maxPlies&&
    actual.maxDecisionMs===PILOT_BUDGET.maxDecisionMs&&
    actual.seed===PILOT_BUDGET.seed;
}

function buildFlittleSearchDependencies({
  bindings,actorSeat,ownDecklistId,simulatorOptions,sampleDeterminization,
  assertApplicabilityEnvelope,rulesProfileId
}) {
  assert.ok(bindings&&typeof bindings==='object');
  assert.ok(actorSeat===0||actorSeat===1);
  assert.ok(typeof ownDecklistId==='string'&&ownDecklistId.length>0);
  assert.equal(typeof sampleDeterminization,'function');
  assert.equal(typeof sampleDeterminization.knowledgeBySeat,'function');
  assert.ok(sampleDeterminization.metadataByState instanceof WeakMap);
  assert.equal(typeof assertApplicabilityEnvelope,'function');
  assert.ok(typeof rulesProfileId==='string'&&rulesProfileId.length>0);
  return {
    ActionEnumerator:bindings.ActionEnumerator,
    Simulator:bindings.Simulator,
    WaitPrompt:bindings.WaitPrompt,
    ResolvePromptAction:bindings.ResolvePromptAction,
    GameError:bindings.GameError,
    actorObservation,
    GamePhase:bindings.GamePhase,
    BotFlipMode:bindings.BotFlipMode,
    BotShuffleMode:bindings.BotShuffleMode,
    simulatorOptions,
    sampleDeterminization,
    evaluateObservation:()=>0,
    winnerSeat:()=>null,
    PlayCardAction:bindings.PlayCardAction,
    AttackAction:bindings.AttackAction,
    PassTurnAction:bindings.PassTurnAction,
    PlayerType:bindings.PlayerType,
    SlotType:bindings.SlotType,
    EnergyCard:bindings.EnergyCard,
    EnergyType:bindings.EnergyType,
    assertApplicabilityEnvelope,
    applicabilityEnvelopeId:ENVELOPE_ID,
    rulesProfileId,
    metadataByState:sampleDeterminization.metadataByState,
    ownDecklistSeat:actorSeat,
    ownDecklistId
  };
}

function loadTwinleafBindings(native) {
  const root='../../../vendor/twinleaf/ptcg-server/output/';
  const {ActionEnumerator}=require(root+'advanced-bot/action-enumerator');
  const {Simulator}=require(root+'game/bots/simulator');
  const {BotFlipMode,BotShuffleMode}=require(root+'game/bots/bot-arbiter');
  const {PlayerType,SlotType}=require(root+'game');
  const {WaitPrompt}=require(root+'game/store/prompts/wait-prompt');
  const {ResolvePromptAction}=require(root+'game/store/actions/resolve-prompt-action');
  const {GameError}=require(root+'game/game-error');
  const {PlayCardAction}=require(root+'game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction}=require(root+'game/store/actions/game-actions');
  const {EnergyCard}=require(root+'game/store/card/energy-card');
  const {EnergyType}=require(root+'game/store/card/card-types');
  const {Flittle}=require(root+'sets/10-scarlet-and-violet/set-scarlet-and-violet/flittle');
  const {PsychicEnergy}=require(root+'sets/10-scarlet-and-violet/set-scarlet-and-violet-energy/psychic-energy');
  return {
    ActionEnumerator,Simulator,BotFlipMode,BotShuffleMode,PlayerType,SlotType,
    WaitPrompt,ResolvePromptAction,GameError,PlayCardAction,AttackAction,
    PassTurnAction,EnergyCard,EnergyType,Flittle,PsychicEnergy,
    GamePhase:native.GamePhase
  };
}

function createFlittleMctsRuntime({native,candidateSeat,enginePin,
  candidateDecklist,opponentDecklist,bindings:providedBindings}) {
  assert.ok(native&&native.GamePhase&&native.CardManager);
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.ok(typeof enginePin==='string'&&/^[0-9a-f]{40}$/i.test(enginePin));
  assert.equal(native.cardPoolInitialization?.enginePin,enginePin);
  const registeredCandidateDecklist=assertRegisteredFlittleDecklist(
    candidateDecklist,'Candidate fixture decklist');
  const registeredOpponentDecklist=assertRegisteredFlittleDecklist(
    opponentDecklist,'Opponent fixture decklist');
  const bindings=providedBindings??loadTwinleafBindings(native);
  const simulatorOptions=Object.freeze({
    flipMode:bindings.BotFlipMode.RANDOM,
    shuffleMode:bindings.BotShuffleMode.RANDOM
  });
  assert.equal(simulatorOptions.flipMode,bindings.BotFlipMode.RANDOM);
  assert.equal(simulatorOptions.shuffleMode,bindings.BotShuffleMode.RANDOM);

  const searchedSeats=new Set();
  const events=[];
  const failures=[];
  const observedLedgerSeats=new Set();
  const trackedKnowledgeBySeat=(state,seat)=>{
    observedLedgerSeats.add(seat);
    return knowledgeBySeat(state,seat);
  };
  const decklistForSeat=createPublicDecklistPriorProvider({
    ownDecklist:registeredCandidateDecklist,
    opponentPrior:[registeredOpponentDecklist]
  });
  const sampleDeterminization=createTwinleafDeterminizationSampler({
    actorObservation,
    cloneState:state=>new bindings.Simulator(
      state,simulatorOptions).store.state,
    knowledgeBySeat:trackedKnowledgeBySeat,
    decklistForSeat,
    createCard:printing=>{
      if(printing===FLITTLE)return new bindings.Flittle();
      if(printing===PSYCHIC)return new bindings.PsychicEnergy();
      throw new Error('Unsupported hidden printing in certified Flittle deck');
    }
  });
  const rulesProfileId=RULES_PROFILE_PREFIX+'-'+enginePin;
  const assertApplicabilityEnvelope=(state,seat,view)=>
    assertFlittleStateEnvelope(state,seat,view,{
      ...native,EnergyType:bindings.EnergyType
    });

  function rootIntentProvider({actorSeat,rootOptions,budget,runSearch}) {
    if(actorSeat!==candidateSeat||searchedSeats.has(actorSeat))
      return {status:'abstained',reason:'outside-applicability-envelope'};
    if(!sameBudget(budget)||!sameBudget(rootOptions?.rootIntentBudget))
      return {status:'abstained',reason:'native-search-budget-mismatch'};
    const result=runSearch();
    return result?.status==='selected'?
      {status:'selected',intent:result.intent,audit:result.audit}:
      {status:'abstained',reason:result?.reason??'low-confidence'};
  }

  function createRootSearchCapability({state,actorSeat,view,budget}) {
    let called=false;
    return function runSearch() {
      if(called)return {status:'abstained',reason:'outside-applicability-envelope'};
      called=true;
      if(actorSeat!==candidateSeat||searchedSeats.has(actorSeat)||!sameBudget(budget))
        return {status:'abstained',reason:'native-search-budget-mismatch'};
      try {
        assertFlittleRootEnvelope(state,actorSeat,view,{
          ...native,EnergyType:bindings.EnergyType
        });
        const rawEnumerator=new bindings.ActionEnumerator();
        const player=state.players[actorSeat];
        const rootActions=rawEnumerator.enumerate(state,player,player.id);
        const rootDeps={...bindings};
        const rootActionKeys=assertFlittleActionFrontier(
          rootActions,state,actorSeat,view,rootDeps
        );

        const frontierRecorder={calls:0,frontiers:[]};
        class CertifiedActionEnumerator extends bindings.ActionEnumerator {
          enumerate(searchState,searchPlayer,playerId) {
            const seat=searchState.players.indexOf(searchPlayer);
            assert.ok(seat===0||seat===1);
            const ownerView=observe(searchState,seat);
            assertFlittleRootEnvelope(searchState,seat,ownerView,{
              ...native,EnergyType:bindings.EnergyType
            });
            const candidates=super.enumerate(searchState,searchPlayer,playerId);
            const keys=assertFlittleActionFrontier(
              candidates,searchState,seat,ownerView,rootDeps
            );
            frontierRecorder.calls++;
            frontierRecorder.frontiers.push(keys);
            return candidates;
          }
        }

        const searchDependencies=buildFlittleSearchDependencies({
          bindings,actorSeat,ownDecklistId:registeredCandidateDecklist.id,
          simulatorOptions,sampleDeterminization,
          assertApplicabilityEnvelope,rulesProfileId
        });
        const certifiedSearch=createTwinleafMcts({
          ...searchDependencies,
          ActionEnumerator:CertifiedActionEnumerator
        },{
          iterations:budget.iterations,
          maxPlies:budget.maxPlies,
          maxDecisionMs:budget.maxDecisionMs,
          cPuct:1.4,
          seed:budget.seed
        });
        const selected=certifiedSearch.search(state,actorSeat);
        assert.equal(selected.audit.iterations,budget.iterations);
        assert.equal(selected.audit.completedIterations,budget.iterations);
        assert.equal(selected.audit.maxPlies,budget.maxPlies);
        assert.equal(selected.audit.maxDecisionMs,budget.maxDecisionMs);
        assert.equal(selected.audit.seed,budget.seed);
        assert.equal(selected.audit.timeoutStatus,'completed');
        assert.ok(selected.audit.elapsedMs>=0&&
          selected.audit.elapsedMs<budget.maxDecisionMs);
        assert.equal(selected.audit.rootActionCount,rootActionKeys.length);
        assert.ok(frontierRecorder.calls>=budget.iterations);
        assert.ok(frontierRecorder.frontiers.length>0);
        assert.ok(frontierRecorder.frontiers.every(keys=>
          JSON.stringify(keys)===JSON.stringify(rootActionKeys)
        ));
        assert.ok(observedLedgerSeats.has(0)&&observedLedgerSeats.has(1));

        const intent=mapActionToIntent(selected.action,state,actorSeat,searchDependencies);
        assert.ok(intent,'Selected native action did not map to a bounded neutral intent');
        searchedSeats.add(actorSeat);
        const audit={
          ...selected.audit,
          enginePin,
          physicalSeat:actorSeat,
          rulesProfileId,
          rootActionKeys,
          candidateDecklistId:registeredCandidateDecklist.id,
          opponentDecklistId:registeredOpponentDecklist.id,
          bothRegisteredDecklistsMatchFixture:true,
          knowledgeModes:['K1','K1'],
          scope:'one-root-decision-dispatch-smoke-test',
          fixtureOnly:true,
          competitiveGameQualified:false
        };
        events.push({
          actorSeat,
          globalTurn:view.globalTurn,
          enginePin,
          budget:{...budget},
          candidateDecklistId:registeredCandidateDecklist.id,
          opponentDecklistId:registeredOpponentDecklist.id,
          scope:'one-root-decision-dispatch-smoke-test',
          fixtureOnly:true,
          competitiveGameQualified:false,
          intent,
          audit
        });
        return {status:'selected',intent,audit};
      } catch(error) {
        failures.push({
          actorSeat,
          code:error?.code??error?.name??'MCTS_PILOT_FAILURE',
          message:String(error?.message??error).slice(0,240)
        });
        return {
          status:'abstained',
          reason:/budget|time/i.test(String(error?.message??''))?
            'budget-exhausted':'outside-applicability-envelope'
        };
      }
    };
  }

  return Object.freeze({
    budget:PILOT_BUDGET,
    decklist:registeredCandidateDecklist,
    opponentDecklist:registeredOpponentDecklist,
    scope:'one-root-decision-dispatch-smoke-test',
    fixtureOnly:true,
    competitiveGameQualified:false,
    observe,
    knowledgeBySeat:trackedKnowledgeBySeat,
    rootIntentProvider,
    createRootSearchCapability,
    events,
    failures
  });
}

module.exports={
  FLITTLE,
  PSYCHIC,
  ENVELOPE_ID,
  PILOT_BUDGET,
  TEST_DECKLIST,
  knowledgeBySeat,
  assertRegisteredFlittleDecklist,
  observe,
  actionKey,
  assertPublicPokemon,
  assertFlittleStateEnvelope,
  assertFlittleRootEnvelope,
  assertFlittleActionFrontier,
  mapActionToIntent,
  sameBudget,
  buildFlittleSearchDependencies,
  loadTwinleafBindings,
  createFlittleMctsRuntime
};
