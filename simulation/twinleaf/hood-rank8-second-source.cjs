'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

const SOURCE_RANK = 8;
const PHYSICAL_CANDIDATE_SLOT = 1;
const SEED_BASE = 20261016;
const MAX_SEEDS = 16;
const PREFLIGHT_ACTIONS = 40;

/** @param {unknown} value @returns {string} */
function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Select the first candidate-second seed based exclusively on the engine's
 * observed starting order. Preflight winner and gameplay are never consulted.
 * Unexpected missing proofs fail closed.
 * @param {(seed:number)=>object} preflight
 * @param {number} [maxSeeds]
 * @returns {{seed:number, ordinal:number, probes:object[]}}
 */
function selectFirstSecondSeed(preflight, maxSeeds = MAX_SEEDS) {
  assert.ok(Number.isInteger(maxSeeds) && maxSeeds >= 1 && maxSeeds <= 32,
    'Seed preflight budget must be in [1,32]');
  const probes = [];
  for (let ordinal = 1; ordinal <= maxSeeds; ordinal += 1) {
    const seed = deriveSlotSeeds(SEED_BASE,'pilot',SOURCE_RANK,ordinal).B;
    const game = preflight(seed);
    assert.ok(game && game.seed === seed && game.verifiedByDrawLog === true &&
      [0, 1].includes(game.firstTurnSlot) &&
      game.firstTurnPlayerId === (game.firstTurnSlot === 0 ? 101 : 202) &&
      game.firstDrawLogName === (game.firstTurnSlot === 0 ? 'research-A' : 'research-B'),
      'Preflight lacks validated draw-log start order for seed ' + seed);
    probes.push({seed, firstTurnSlot:game.firstTurnSlot,
      candidateActualTurn:game.firstTurnSlot === PHYSICAL_CANDIDATE_SLOT ?
        'first' : 'second'});
    if (game.firstTurnSlot !== PHYSICAL_CANDIDATE_SLOT) {
      return {seed, ordinal, probes};
    }
  }
  throw new Error('No candidate-second seed found within predeclared search budget');
}

/** @param {object} game @returns {object} */
function summarizeGame(game) {
  const played = game.cardsPlayedBySeat ?? [];
  const actions = Array.isArray(game.decisionTrace) ? game.decisionTrace : [];
  const important = actions.filter(e => e.action === 'AttackAction' ||
    e.action === 'RetreatAction' ||
    (e.action === 'PlayCardAction' &&
      /Stealthy Hood|Garbodor|Trubbish|Float Stone|Forest Seal Stone|Field Blower|Megaton Blower|Faba|Temple of Sinnoh|Shadow Rider Calyrex VMAX|Mega Absol ex|Dark Patch|Boost Shake/i.test(e.card || '')) ||
    (e.action === 'UseAbilityAction' && /Underworld Door|Garbotoxin|Dark Asset|Climactic Gate/i.test(e.ability || '')));
  return {
    finished:game.finished, winnerPhysicalSlot:game.winner,
    candidateOutcome:game.finished !== true ? 'unfinished' :
      game.winner === 3 ? 'draw' :
        game.winner === PHYSICAL_CANDIDATE_SLOT ? 'candidate' : 'opponent',
    engineGameTurns:game.turns, rootActions:game.actions,
    firstTurnSlot:game.firstTurnSlot, verifiedByDrawLog:game.verifiedByDrawLog,
    prizeCountsAtStop:game.prizesRemaining,
    cardsPlayedCandidate:played[PHYSICAL_CANDIDATE_SLOT] || {},
    cardsPlayedOpponent:played[1-PHYSICAL_CANDIDATE_SLOT] || {},
    attackCounts:game.attackTrace?.reduce((a,x) => {
      a[x.seat] += 1; return a;
    },[0,0]) || null,
    keyChronology:important.map(e => ({ordinal:e.actionOrdinal,turn:e.turnBefore,
      playerSlot:e.playerSlot,action:e.action,card:e.card || null,
      attack:e.attack || null,ability:e.ability || null,
      prizesAfter:e.prizesAfter || null})),
    engine:game.engine,policy:game.policy,
    effectiveRngProtocol:game.randomnessProtocol,
    rules:game.rules
  };
}

/**
 * Fixed experiment: source rank8 and frozen Hood v1, candidate in physical B.
 * Seed selection uses only actual starting order, never the outcome.
 */
function main() {
  const {planAichi} = require('../evaluation/aichi-pilot.cjs');
  const {runMatch,initializeCards} = require('./headless.cjs');
  const candidate = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const {decks} = require('../../results/aichi-2026/full-decklists.json');
  const source = decks.find(deck => deck.rank === SOURCE_RANK);
  assert.ok(source && candidate.cards.reduce((n,c)=>n+c.count,0) === 60);
  const plan = planAichi(candidate,{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(deck=>deck.rank === SOURCE_RANK);
  assert.ok(plan.candidate.cards && opponent?.status === 'ready' &&
    opponent.cards,'Exact fixed printings are unresolved in the pinned engine');
  const deckA = opponent.cards;
  const deckB = plan.candidate.cards;
  const request = {
    deckA,deckB,strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  initializeCards();
  const preflight = selectFirstSecondSeed(seed => runMatch({
    ...request,seed,maxActions:PREFLIGHT_ACTIONS,
    label:'agent15-rank8-turn-order-preflight'
  }));
  const match = runMatch({...request,seed:preflight.seed,maxActions:800,
    captureDecisionTrace:true,label:'agent15-rank8-hood-v1-natural-second'});
  assert.ok(match.seed === preflight.seed && match.verifiedByDrawLog === true &&
    match.firstTurnSlot === 0,
    'Full-game starting order must match source preflight');
  return {
    schema:'agent15-rank8-hood-natural-second-v1',
    sourceRevision:process.env.GITHUB_SHA || 'local-unpinned',
    frozenCandidates:[{
      id:'hood-shield-v1',canonicalDeckDigest:digest(candidate.cards),
      resolvedEngineDeckDigest:digest(deckB)
    }],
    opponent:{rank:SOURCE_RANK,player:source.player,
      canonicalDeckDigest:digest(source.cards),
      resolvedEngineDeckDigest:digest(deckA)},
    sourceResolution:{candidate:plan.candidate.substitutions,
      opponent:opponent.substitutions},
    physicalCandidateSlot:'B',actualCandidateTurn:'second',
    predeclaredSeedRule:{seedBase:SEED_BASE,sourceProtocol:'decorrelated-slots-v3',
      rank:SOURCE_RANK,physicalSlot:'B',firstRepeat:1,lastRepeat:MAX_SEEDS,
      maxOffsets:MAX_SEEDS,selectionKey:'draw-log-verified-firstTurnSlot-only',
      preflightMaxActions:PREFLIGHT_ACTIONS},
    seedSelection:preflight,
    game:summarizeGame(match),
    competitivePolicyQualified:false,simulatorSafetyQualified:false,
    qualifiedForWinRateInference:false,
    limitations:[
      'A seed chosen for start order alone is one diagnostic deal, not an independent matchup sample',
      'Generic Twinleaf policies remain weak and simulator cloning has unqualified semantics',
      'The candidate has no Hood-specific tactic; plays are descriptive observations only',
      'Rule tests of source interactions, opponent decisions and response continuation are incomplete'
    ]
  };
}

if(require.main === module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={selectFirstSecondSeed,summarizeGame,digest,main};
