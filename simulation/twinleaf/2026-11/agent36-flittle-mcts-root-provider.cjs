'use strict';

const assert=require('node:assert/strict');
const {
  createTwinleafDeterminizationSampler,
  createPublicDecklistPriorProvider,
  normalizeKnowledge
}=require('./agent5-twinleaf-belief-input.cjs');
const {createTwinleafMcts}=require('./agent5-twinleaf-mcts-adapter.cjs');
const {observationSha256}=require('./agent5-information-set-mcts.cjs');
const {actorObservation}=require('../actor-observation-contract.cjs');

const FLITTLE='Flittle SVI';
const PSYCHIC='Psychic Energy SVE';
const ENVELOPE_ID='flittle-basic-psychic-v1';
const PILOT_BUDGET=Object.freeze({
  iterations:16,
  maxPlies:1,
  maxDecisionMs:10000,
  seed:20261113
});
const TEST_DECKLIST=Object.freeze({
  id:ENVELOPE_ID,
  cards:Object.freeze([FLITTLE,...Array(59).fill(PSYCHIC)])
});
const EXPECTED_ACTION_COUNT=3;

function prizeCount(state,seat) {
  return state.players[seat].prizes.reduce(
    (sum,slot)=>sum+slot.cards.length,0
  );
}

function prizeCounts(state) {
  return [prizeCount(state,0),prizeCount(state,1)];
}

function hasPendingPrompt(state) {
  return (state.prompts??[]).some(prompt=>prompt.result===undefined);
}

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

function assertPublicPokemon(view,expectedDamageLimit=30) {
  assert.ok(view&&typeof view==='object');
  assert.equal(view.printing,FLITTLE);
  assert.deepEqual(view.evolutionPrintings,[FLITTLE]);
  assert.deepEqual(view.energies,[PSYCHIC]);
  assert.deepEqual(view.tools,[]);
  assert.equal(view.hp,30);
  assert.ok(Number.isInteger(view.damage)&&view.damage>=0&&
    view.damage<expectedDamageLimit);
  assert.deepEqual(view.specialConditions,[]);
  assert.equal(view.attacks.length,1);
  assert.equal(view.attacks[0].name,'Ram');
  assert.deepEqual(view.attacks[0].cost,['Psychic']);
  assert.equal(view.attacks[0].damage,10);
}

function assertFlittleRootEnvelope(state,seat,view,native) {
  assert.ok(state&&state.players?.length===2);
  assert.ok(seat===0||seat===1);
  assert.equal(state.activePlayer,seat);
  assert.equal(state.phase,native.GamePhase.PLAYER_TURN);
  assert.equal(hasPendingPrompt(state),false);
  assert.ok(view&&view.actorSeat===seat);
  assert.equal(view.decisionKind,'owner-root');
  assert.equal(view.globalTurn>1,true);
  assert.equal(view.activePlayer,seat);
  assert.equal(view.ownTurnResources.energyPlayedTurn<view.globalTurn,true);

  assertPublicPokemon(view.ownPublic.active);
  assertPublicPokemon(view.opponentPublic.active);
  assert.equal(view.ownPublic.bench.length,5);
  assert.equal(view.opponentPublic.bench.length,5);
  assert.ok(view.ownPublic.bench.every(slot=>slot===null));
  assert.ok(view.opponentPublic.bench.every(slot=>slot===null));
  assert.deepEqual(view.ownPublic.stadium,[]);
  assert.deepEqual(view.opponentPublic.stadium,[]);
  assert.deepEqual(view.ownPublic.discard,[]);
  assert.deepEqual(view.opponentPublic.discard,[]);
  assert.deepEqual(view.ownPublic.lostZone,[]);
  assert.deepEqual(view.opponentPublic.lostZone,[]);
  assert.deepEqual(view.ownPublic.resolvingSupporter,[]);
  assert.deepEqual(view.opponentPublic.resolvingSupporter,[]);
  assert.equal(view.ownPublic.prizeCount,6);
  assert.equal(view.opponentPublic.prizeCount,6);
  assert.equal(view.ownPublic.handCount,view.ownHand.length);
  assert.ok(view.ownHand.length>0);
  assert.ok(view.ownHand.every(printing=>printing===PSYCHIC));
  assert.equal(view.ownerK1?.exactMembershipKnown,true);
  assert.deepEqual(view.ownerK1?.knownPrintings,[
    {printing:PSYCHIC,copies:6}
  ]);

  const ownPlayer=state.players[seat];
  const opponentPlayer=state.players[1-seat];
  assert.ok(ownPlayer.active&&opponentPlayer.active);
  assert.equal(ownPlayer.active.getPokemonCard().fullName,FLITTLE);
  assert.equal(opponentPlayer.active.getPokemonCard().fullName,FLITTLE);
  assert.equal(ownPlayer.active.getPokemonCard().powers.length,0);
  assert.equal(opponentPlayer.active.getPokemonCard().powers.length,0);
  assert.equal(ownPlayer.active.getPokemonCard().attacks.length,1);
  assert.equal(ownPlayer.active.getPokemonCard().attacks[0].name,'Ram');
  assert.equal(ownPlayer.active.getPokemonCard().attacks[0].text??'', '');
  assert.equal(ownPlayer.active.getPokemonCard().retreat.length,0);
  assert.equal(opponentPlayer.active.getPokemonCard().retreat.length,0);
  assert.ok(ownPlayer.hand.cards.length>0);
  assert.ok(ownPlayer.hand.cards.every(card=>card.fullName===PSYCHIC));
  assert.equal(prizeCount(state,seat),6);
  assert.equal(prizeCount(state,1-seat),6);

  for(const physicalSeat of [0,1]) {
    const ledger=knowledgeBySeat(state,physicalSeat);
    const ownerView=observe(state,physicalSeat);
    normalizeKnowledge(ledger,ownerView.ownerK1,prizeCount(state,physicalSeat));
  }
  return true;
}

function actionKey(action) {
  const name=action?.constructor?.name;
  if(name==='PlayCardAction') {
    const target=action.target??{};
    return 'attach:'+action.handIndex+':'+target.player+':'+
      target.slot+':'+target.index;
  }
  if(name==='AttackAction') return 'attack:'+action.name;
  if(name==='PassTurnAction') return 'pass';
  throw new Error('Unsupported action in certified Flittle frontier: '+String(name));
}

function assertFlittleActionFrontier(actions,state,seat,PlayerType,SlotType) {
  assert.ok(Array.isArray(actions));
  assert.equal(actions.length,EXPECTED_ACTION_COUNT,
    'Certified Flittle root must have exactly three action representatives');
  const attach=actions.filter(action=>action.constructor?.name==='PlayCardAction');
  const attacks=actions.filter(action=>action.constructor?.name==='AttackAction');
  const passes=actions.filter(action=>action.constructor?.name==='PassTurnAction');
  assert.equal(attach.length,1);
  assert.equal(attacks.length,1);
  assert.equal(passes.length,1);
  assert.equal(attacks[0].name,'Ram');
  assert.equal(attach[0].target?.player,PlayerType.BOTTOM_PLAYER);
  assert.equal(attach[0].target?.slot,SlotType.ACTIVE);
  assert.equal(attach[0].target?.index,0);
  assert.equal(state.players[seat].hand.cards[attach[0].handIndex]?.fullName,PSYCHIC);
  assert.equal(new Set(actions.map(actionKey)).size,EXPECTED_ACTION_COUNT);
  return actions.map(actionKey).sort();
}

function validateNativeRootActions(state,seat,actions,Simulator,simulatorOptions,GamePhase) {
  const promptsBefore=state.prompts?.length??0;
  const prizesBefore=prizeCounts(state);
  for(const action of actions) {
    const simulator=new Simulator(state,simulatorOptions);
    simulator.dispatch(action);
    const next=simulator.store.state;
    assert.equal((next.prompts??[]).length,promptsBefore,
      'A certified root action unexpectedly created or removed a prompt');
    assert.deepEqual(prizeCounts(next),prizesBefore,
      'A certified root action unexpectedly changed Prize membership');
    assert.notEqual(next.phase,GamePhase.FINISHED,
      'A certified root action unexpectedly ended the game');
  }
}

function mapActionToIntent(action,state,seat,PlayerType,SlotType) {
  const name=action?.constructor?.name;
  if(name==='PlayCardAction') {
    assert.equal(action.target?.player,PlayerType.BOTTOM_PLAYER);
    assert.equal(action.target?.slot,SlotType.ACTIVE);
    assert.equal(action.target?.index,0);
    assert.equal(state.players[seat].hand.cards[action.handIndex]?.fullName,PSYCHIC);
    return {
      kind:'attach-basic-energy',
      handIndex:action.handIndex,
      slot:'active',
      index:0
    };
  }
  if(name==='AttackAction') {
    assert.equal(action.name,'Ram');
    return {kind:'attack',attackName:'Ram'};
  }
  if(name==='PassTurnAction') return {kind:'pass'};
  throw new Error('Cannot map unsupported native action to actor intent');
}

function sameBudget(actual) {
  return actual&&actual.iterations===PILOT_BUDGET.iterations&&
    actual.maxPlies===PILOT_BUDGET.maxPlies&&
    actual.maxDecisionMs===PILOT_BUDGET.maxDecisionMs&&
    actual.seed===PILOT_BUDGET.seed;
}

function createFlittleMctsRuntime({native,candidateSeat,enginePin}) {
  assert.ok(native&&native.GamePhase&&native.CardManager);
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.equal(native.cardPoolInitialization?.enginePin,enginePin);
  const ActionEnumerator=require('../../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator').ActionEnumerator;
  const Simulator=require('../../../vendor/twinleaf/ptcg-server/output/game/bots/simulator').Simulator;
  const {BotFlipMode,BotShuffleMode}=require('../../../vendor/twinleaf/ptcg-server/output/game/bots/bot-arbiter');
  const {PlayerType,SlotType}=require('../../../vendor/twinleaf/ptcg-server/output/game');
  const {Flittle}=require('../../../vendor/twinleaf/ptcg-server/output/sets/10-scarlet-and-violet/set-scarlet-and-violet/flittle');
  const {PsychicEnergy}=require('../../../vendor/twinleaf/ptcg-server/output/sets/10-scarlet-and-violet/set-scarlet-and-violet-energy/psychic-energy');

  const simulatorOptions=Object.freeze({
    flipMode:BotFlipMode.RANDOM,
    shuffleMode:BotShuffleMode.RANDOM
  });
  const searchedSeats=new Set();
  const events=[];
  const failures=[];
  const observedLedgerSeats=new Set();

  const trackedKnowledgeBySeat=(state,seat)=>{
    observedLedgerSeats.add(seat);
    return knowledgeBySeat(state,seat);
  };
  const decklistForSeat=createPublicDecklistPriorProvider({
    ownDecklist:TEST_DECKLIST,
    opponentPrior:[TEST_DECKLIST]
  });
  const sampleDeterminization=createTwinleafDeterminizationSampler({
    actorObservation,
    cloneState:state=>new Simulator(state,simulatorOptions).store.state,
    knowledgeBySeat:trackedKnowledgeBySeat,
    decklistForSeat,
    createCard:printing=>{
      if(printing===FLITTLE)return new Flittle();
      if(printing===PSYCHIC)return new PsychicEnergy();
      throw new Error('Unsupported hidden printing in certified Flittle deck');
    }
  });

  function rootIntentProvider({actorSeat,rootOptions,budget,runSearch}) {
    if(actorSeat!==candidateSeat||searchedSeats.has(actorSeat))
      return {status:'abstained',reason:'outside-applicability-envelope'};
    if(!sameBudget(budget)||!sameBudget(rootOptions?.rootIntentBudget))
      return {status:'abstained',reason:'outside-applicability-envelope'};
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
        return {status:'abstained',reason:'outside-applicability-envelope'};
      try {
        assertFlittleRootEnvelope(state,actorSeat,view,native);
        const rawEnumerator=new ActionEnumerator();
        const player=state.players[actorSeat];
        const actions=rawEnumerator.enumerate(state,player,player.id);
        const rootActionKeys=assertFlittleActionFrontier(
          actions,state,actorSeat,PlayerType,SlotType
        );
        validateNativeRootActions(
          state,actorSeat,actions,Simulator,simulatorOptions,native.GamePhase
        );

        let promptResolverCalls=0;
        const frontierRecorder={calls:0,frontiers:[]};
        class CertifiedActionEnumerator extends ActionEnumerator {
          enumerate(searchState,searchPlayer,playerId) {
            const seat=searchState.players.indexOf(searchPlayer);
            assert.ok(seat===0||seat===1);
            const ownerView=observe(searchState,seat);
            assertFlittleRootEnvelope(searchState,seat,ownerView,native);
            const candidates=super.enumerate(searchState,searchPlayer,playerId);
            const keys=assertFlittleActionFrontier(
              candidates,searchState,seat,PlayerType,SlotType
            );
            frontierRecorder.calls++;
            frontierRecorder.frontiers.push(keys);
            return candidates;
          }
        }

        const knowledgeSnapshot=(searchState,seat)=>
          trackedKnowledgeBySeat(searchState,seat).ownerK1Snapshot??null;
        const search=createTwinleafMcts({
          ActionEnumerator:CertifiedActionEnumerator,
          Simulator,
          actorObservation,
          GamePhase:native.GamePhase,
          BotFlipMode,
          BotShuffleMode,
          simulatorOptions,
          actionKey,
          sampleDeterminization,
          metadataByState:sampleDeterminization.metadataByState,
          knowledgeBySeat:trackedKnowledgeBySeat,
          knowledgeSnapshot,
          evaluateObservation:()=>0,
          actionPrior:()=>1,
          promptOwnerSeat:()=>{
            promptResolverCalls++;
            throw new Error('Unexpected prompt in certified prompt-free envelope');
          },
          promptResolverForSeat:()=>({
            resolvePrompt:()=>{
              promptResolverCalls++;
              throw new Error('Unexpected prompt in certified prompt-free envelope');
            }
          }),
          winnerSeat:()=>null,
          ownDecklistSeat:actorSeat,
          ownDecklistId:TEST_DECKLIST.id
        },{
          iterations:budget.iterations,
          maxPlies:budget.maxPlies,
          cPuct:1.4,
          seed:budget.seed
        });

        const started=Date.now();
        const selected=search.search(state,actorSeat);
        const elapsedMs=Date.now()-started;
        assert.ok(elapsedMs<=budget.maxDecisionMs,
          'Bounded MCTS decision exceeded its frozen wall-clock budget');
        assert.equal(selected.audit.iterations,budget.iterations);
        assert.equal(selected.audit.rootActions.length,EXPECTED_ACTION_COUNT);
        assert.ok(frontierRecorder.calls>=budget.iterations);
        assert.ok(frontierRecorder.frontiers.length>0);
        assert.ok(frontierRecorder.frontiers.every(keys=>
          JSON.stringify(keys)===JSON.stringify(rootActionKeys)
        ));
        assert.equal(promptResolverCalls,0);
        assert.ok(observedLedgerSeats.has(0)&&observedLedgerSeats.has(1));

        const rootObservation={
          ...observe(state,actorSeat),
          ownDecklistId:TEST_DECKLIST.id
        };
        const rootObservationSha256=observationSha256(rootObservation);
        assert.equal(selected.audit.rootObservationSha256,rootObservationSha256);
        const changedKnowledgeObservation={
          ...rootObservation,
          ownerK1:{
            ...rootObservation.ownerK1,
            epoch:rootObservation.ownerK1.epoch+1
          }
        };
        const ownerLedgerInInformationSetKey=
          observationSha256(changedKnowledgeObservation)!==rootObservationSha256;
        assert.equal(ownerLedgerInInformationSetKey,true);

        const intent=mapActionToIntent(
          selected.action,state,actorSeat,PlayerType,SlotType
        );
        searchedSeats.add(actorSeat);
        const audit={
          frontierComplete:true,
          bothSeatKnowledgeLedgersVerified:true,
          ownerLedgerInInformationSetKey:true,
          promptResolutionActorScoped:true,
          applicabilityEnvelopeId:ENVELOPE_ID,
          iterations:selected.audit.iterations,
          maxPlies:budget.maxPlies,
          seed:budget.seed,
          elapsedMs,
          rootActionCount:selected.audit.rootActions.length,
          rootObservationSha256,
          rootActionKeys,
          selectedActionKey:selected.actionKey,
          knowledgeModes:['K1','K1'],
          promptResolverCalls
        };
        events.push({
          actorSeat,
          globalTurn:view.globalTurn,
          enginePin,
          budget:{...budget},
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
    decklist:TEST_DECKLIST,
    observe,
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
  observe,
  actionKey,
  assertFlittleRootEnvelope,
  assertFlittleActionFrontier,
  validateNativeRootActions,
  mapActionToIntent,
  createFlittleMctsRuntime
};
