'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {MEWTWO,GENGAR,shouldSeekPayload} =
  require('./new-moon-compressor-payload-policy.cjs');

const OUTPUT = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Describe only visible/owned resources at an actual player decision.
 * Opponent's hand/deck, owner deck identities and face-down Prizes are
 * intentionally never inspected.
 *
 * @param {object} state Real current pinned Store state.
 * @param {object} player Owner player, found from the active bot identity.
 * @param {number} phase Pinned PLAYER_TURN enum.
 * @returns {object}
 */
function ownerCompressorOpportunity(state,player,phase) {
  const hand=player.hand.cards;
  const ownedPokemon=slot=>slot?.getPokemonCard()?.fullName??null;
  const bench=player.bench.map(ownedPokemon);
  const active=ownedPokemon(player.active);
  const heldCompressor=hand.filter(c=>c?.name==='Battle Compressor').length;
  const gengarDiscard=player.discard.cards.some(c=>c?.fullName===GENGAR);
  const gengarBench=bench.includes(GENGAR);
  const heldPowerglass=hand.filter(c=>c?.fullName==='Powerglass SFA').length;
  const basicPsychic=card=>card?.name==='Psychic Energy';
  const ownDiscardBasicPsychic=player.discard.cards.filter(basicPsychic).length;
  // These are the owner's own hand or already public zones. Never read any
  // unrevealed deck identities or face-down Prize cards to infer inventory.
  const ownHandBasicPsychic=hand.filter(basicPsychic).length;
  const ownBenchBasicPsychic=player.bench.reduce((n,slot)=>
    n+(slot.energies?.cards??[]).filter(basicPsychic).length,0);
  const ownLostZoneBasicPsychic=(player.lostzone?.cards??[])
    .filter(basicPsychic).length;
  return {
    turn:state.turn,
    handCompressorCount:heldCompressor,
    activePokemon:active,
    mewtwoActive:active===MEWTWO,
    mewtwoBenched:bench.includes(MEWTWO),
    gengarDiscardKnown:gengarDiscard,
    gengarBenched:gengarBench,
    itemLockVisible:player.cannotPlayItemCards===true,
    ownDeckCardsRemaining:player.deck.cards.length,
    // Actual owner discard is publicly visible; no deck/Prize identities read.
    heldPowerglassCount:heldPowerglass,
    activePowerglassEquipped:
      player.active.tools?.some(c=>c?.fullName==='Powerglass SFA')===true,
    ownerDiscardBasicPsychicCount:ownDiscardBasicPsychic,
    ownerHandBasicPsychicCount:ownHandBasicPsychic,
    ownerBenchBasicPsychicCount:ownBenchBasicPsychic,
    ownerLostZoneBasicPsychicCount:ownLostZoneBasicPsychic,
    ownerActiveEnergyPrintings:
      (player.active.energies?.cards??[]).map(c=>c.fullName),
    ownerActiveDamage:player.active.damage??null,
    activeOnlyEligible:shouldSeekPayload(state,player,phase),
    anyTurnEligible:shouldSeekPayload(state,player,phase,
      {maxGlobalTurn:Number.POSITIVE_INFINITY}),
    activeOrBenchEligible:shouldSeekPayload(state,player,phase,
      {allowBenchedMewtwo:true})
  };
}

/**
 * Summarize decision-root exposure without counting repeated states in a
 * single turn as independent deal opportunities.
 *
 * @param {object[]} events Read-only actual owner decisions.
 * @returns {object}
 */
function summarizeOpportunity(events) {
  const distinct=field=>new Set(events.filter(row=>row[field])
    .map(row=>row.turn)).size;
  return {
    observedOwnerRootDecisions:events.length,
    observedOwnTurns:new Set(events.map(row=>row.turn)).size,
    heldCompressorDecisionRoots:events.filter(row=>row.handCompressorCount>0).length,
    heldCompressorTurns:new Set(events.filter(row=>
      row.handCompressorCount>0).map(row=>row.turn)).size,
    mewtwoActiveTurns:distinct('mewtwoActive'),
    mewtwoBenchedTurns:distinct('mewtwoBenched'),
    activeOnlyEligibleTurns:distinct('activeOnlyEligible'),
    anyTurnEligibleTurns:distinct('anyTurnEligible'),
    activeOrBenchEligibleTurns:distinct('activeOrBenchEligible'),
    benchExtensionOnlyTurns:new Set(events.filter(row=>
      row.activeOrBenchEligible&&!row.activeOnlyEligible).map(row=>row.turn)).size,
    ownerOnlyVisibleData:true,
    scope:'All actor-controlled normal-turn root decisions; repeated roots per turn are not independent samples'
  };
}

/**
 * Reversible observation-only bot decoder wrapper. It returns the exact
 * original proposed action and never modifies state, policy or prompts.
 * Captures the actor's normal-turn decisions, excluding prompt-only roots.
 *
 * @template T
 * @param {0|1} candidateSeat Physical seat.
 * @param {()=>T} execute Synchronous original runner.
 * @returns {{result:T,audit:object}}
 */
function withOwnerCompressorOpportunityAudit(candidateSeat,execute) {
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.equal(typeof execute,'function');
  const engine=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const ownerId=candidateSeat===0?101:202;
  const events=[];
  function observeBeforeDecision(state) {
    const actor=state.players.find(player=>player.id===this.client?.id);
    if (actor?.id===ownerId &&
        state.activePlayer===candidateSeat &&
        state.phase===GamePhase.PLAYER_TURN &&
        !state.prompts.some(prompt=>prompt.result===undefined)) {
      events.push(ownerCompressorOpportunity(state,actor,GamePhase.PLAYER_TURN));
    }
    return original.call(this,state);
  }
  SimpleTacticsAi.prototype.decodeNextAction=observeBeforeDecision;
  try {
    const result=execute();
    return {result,audit:{
      version:'agent5-owner-compressor-opportunity-readonly-v1',
      candidateSeat,
      ...summarizeOpportunity(events),
      events
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,
      observeBeforeDecision);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={ownerCompressorOpportunity,summarizeOpportunity,
  withOwnerCompressorOpportunityAudit};
