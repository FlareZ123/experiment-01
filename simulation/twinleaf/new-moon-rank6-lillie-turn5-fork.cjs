'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');

const SERVER=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const load=relative=>require(path.join(SERVER,relative));
const RANK=6, SEAT=1, SEED=3730588627;
const LILLIE="Lillie's Determination M1L";

/**
 * Opt-in counterfactual using only the acting player's own hand and public board.
 * Change exactly one real source decision; preserve the pinned policy thereafter.
 * The historical control response used turn-ending Camping Gear instead.
 *
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,interventions:object[]}}
 */
function withOpponentTurn5Lillie(execute,preferCaptureEnergy=false) {
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {GamePhase}=load('game/store/state/state');
  const proto=SimpleTacticsAi.prototype;
  const prior=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  const original=proto.decodeNextAction;
  assert.equal(typeof original,'function');
  const interventions=[];
  function forcedTurn5Lillie(state) {
    const id=this.client.id;
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(preferCaptureEnergy && interventions.length===1 && id===101 &&
       state.activePlayer===0 && state.turn===5 && !pending) {
      const player=state.players.find(p=>p.id===id);
      const index=player.hand.cards.findIndex(card=>card.fullName==='Capture Energy RCL');
      if(index>=0 && player.active.energies.cards.length===0 &&
          player.bench.every(slot=>!slot.getPokemonCard())) {
        interventions.push({turn:5,seat:0,kind:'force-Capture-Energy-over-Speed-Lightning',
          sourceOwnHand:player.hand.cards.map(card=>card.fullName),
          activePrinting:player.active.getPokemonCard()?.fullName,
          benchOccupiedBefore:0});
        return new PlayCardAction(id,index,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        });
      }
    }
    if(id===101 && state.activePlayer===0 &&
        state.turn===5 && state.phase===GamePhase.PLAYER_TURN &&
        !pending && interventions.length===0) {
      const player=state.players.find(p=>p.id===id);
      const candidate=state.players.find(p=>p.id===202);
      assert.ok(player && candidate);
      assert.equal(player.active.getPokemonCard()?.fullName,'Iron Thorns ex TWM');
      assert.equal(candidate.active.getPokemonCard()?.fullName,
        'Gengar & Mimikyu-GX TEU');
      const index=player.hand.cards.findIndex(card=>card.fullName===LILLIE);
      assert.ok(index>=0,'Source turn5 Lillie printing unexpectedly absent');
      assert.equal(player.prizes.filter(prize=>prize.cards.length).length,6);
      assert.notEqual(player.supporterTurn,state.turn,'Opponent Supporter already spent');
      const sourceHand=player.hand.cards.map(card=>card.fullName);
      assert.equal(sourceHand.filter(card=>card===LILLIE).length,1);
      interventions.push({
        turn:state.turn,seat:state.activePlayer,actingId:id,
        kind:'force-visible-Lillie-instead-of-Camping-Gear',
        sourceOwnHand:sourceHand,
        opponentPrizesRemaining:6,
        knownOpponentBoard:{
          active:player.active.getPokemonCard()?.fullName,
          attachedEnergy:player.active.energies.cards.map(c=>c.fullName),
          occupiedBench:player.bench.filter(slot=>slot.getPokemonCard()).length
        },
        effectExpected:'shuffle hand then draw eight, provided paper rule and pinned engine agree',
        doesNotInspect:'hidden opponent/deck/prize identities before intervention'
      });
      return new PlayCardAction(id,index);
    }
    return original.call(this,state);
  }
  Object.defineProperty(proto,'decodeNextAction',{
    configurable:true,writable:true,value:forcedTurn5Lillie
  });
  try {
    return {result:execute(),interventions};
  } finally {
    if(proto.decodeNextAction!==forcedTurn5Lillie) {
      throw new Error('Opponent fork lost bot prototype ownership');
    }
    if(prior)Object.defineProperty(proto,'decodeNextAction',prior);
    else delete proto.decodeNextAction;
  }
}

/** @param {object} game @param {number} turn @param {number} seat */
function turnActions(game,turn,seat) {
  return game.decisionTrace.filter(a=>a.turnBefore===turn && a.playerSlot===seat)
    .map(row=>({
      actionOrdinal:row.actionOrdinal,action:row.action,
      ...(row.card ? {card:row.card}:{}),
      ...(row.attack ? {attack:row.attack}:{}),
      ...(row.cardSelection ? {
        selectedPrintings:row.cardSelection.selectedCards,
        sourceZone:row.cardSelection.sourceZone
      }:{}),
      ...(row.decisionHandBefore ? {
        ownHandBefore:row.decisionHandBefore.ownHandPrintings
      }:{})
    }));
}

/** @param {object} game */
function observedOutcome(game) {
  const candidateTurn6=game.copycatTurnStartEvidence.find(t=>t.turn===6);
  return {
    finished:game.finished,winner:game.winner,
    actions:game.actions,turns:game.turns,prizesRemaining:game.prizesRemaining,
    firstTurnSlot:game.firstTurnSlot,verifiedByDrawLog:game.verifiedByDrawLog,
    sourceOpponentTurn5:turnActions(game,5,0),
    candidateTurn6Public: candidateTurn6 ? {
      opponentActive:candidateTurn6.board[0].active?.name??null,
      opponentBench:candidateTurn6.board[0].bench.map(card=>card.name),
      opponentHandSize:candidateTurn6.opponentHandSize,
      candidateActive:candidateTurn6.board[1].active?.name??null,
      candidatePrizes:candidateTurn6.prizeCounts[1]
    } : null,
    sourceOpponentPlayedCards:game.cardsPlayedBySeat[0],
    candidateAttacks:game.attackTrace.filter(a=>a.seat===1)
      .map(a=>({turn:a.turn,attack:a.attack})),
    terminalTransition:game.terminalTransition,
    qualifiedForCompetitiveInference:false
  };
}

function run() {
  initializeCards();
  const opponent=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(x=>x.rank===RANK);
  assert.equal(opponent?.status,'ready');
  const source=pairedCandidateSlots().source;
  const arm=()=>runArm(source,opponent.cards,SEAT,SEED,350,true,true);
  const baseline=arm();
  const forced=withOpponentTurn5Lillie(arm);
  const forcedCapture=withOpponentTurn5Lillie(arm,true);
  const restored=arm();
  assert.deepEqual(baseline,restored,
    'Scoped policy fork failed restoration/noninterference full-game replay');
  assert.equal(forced.interventions.length,1,'Expected exact one turn5 Lillie fork');
  assert.equal(forcedCapture.interventions.length,2,
    'Expected Lillie then Capture Energy, both in the real source hand');
  assert.deepEqual(baseline.deckHashes,forced.result.deckHashes);
  assert.deepEqual(baseline.deckHashes,forcedCapture.result.deckHashes);
  assert.equal(baseline.firstTurnSlot,0);
  assert.equal(forced.result.firstTurnSlot,0);
  assert.equal(baseline.verifiedByDrawLog,true);
  assert.equal(forced.result.verifiedByDrawLog,true);
  const early=game=>game.decisionTrace
    .filter(row=>row.turnBefore<5);
  assert.deepEqual(early(baseline),early(forced.result),
    'Pre-fork turn1-4 physical source decisions should be identical');
  assert.deepEqual(early(baseline),early(forcedCapture.result),
    'Pre-fork turn1-4 state must be physically identical in Capture branch');
  const actual=turnActions(forced.result,5,0);
  assert.ok(actual.some(action=>action.action==='PlayCardAction' &&
    action.card==="Lillie's Determination"),
    'The forced live Store PlayCardAction was not recorded as actual Lillie');
  assert.ok(turnActions(baseline,5,0).some(action=>
    action.action==='PlayCardAction' && action.card==='Camping Gear'),
    'Archived source comparator no longer plays Camping Gear');
  return {
    schema:'new-moon-rank6-opponent-turn5-source-Lillie-and-Capture-counterfork-v2',
    sourceRank:RANK,candidatePhysicalSeat:SEAT,seed:SEED,
    sourceInventoryHashes:baseline.deckHashes,
    evidenceKind:'same-physical-source seeded opponent-policy counterfactual',
    assertionScope:'original physical deal, identical all pre-fork actions, exact one on-hand Lillie alternative, prototype fully restored and replay identical',
    intervention:forced.interventions[0],
    baseline:observedOutcome(baseline),
    forcedLillie:observedOutcome(forced.result),
    forcedLillieAndCapture:{
      interventions:forcedCapture.interventions,
      ...observedOutcome(forcedCapture.result)
    },
    stage:'Only bounded source decision policy fork, not independently qualified playing strength',
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withOpponentTurn5Lillie,turnActions,observedOutcome,run};
