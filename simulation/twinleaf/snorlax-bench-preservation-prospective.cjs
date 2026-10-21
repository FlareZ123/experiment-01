'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch} = require('./headless.cjs');

// Registered without inspecting the outcomes of these deals. Do not alter
// after dispatch: preserve failed, capped, and non-Snorlax starts.
const SOURCE_RANKS = Object.freeze([3, 7]);
const SEED_BASE = 2026102119;
const REPEATS = 3;
const ACTION_CAP = 100;
const ENGINE_SHA = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PERMISSIONS = Object.freeze({
  allowEquivalentBasicEnergies: true,
  allowBasicEnergyMirrorPrintings: true,
  allowJapanesePromoHooks: true
});

/** @returns {{rank:number,sourceSeat:0|1,repeat:number,seed:number}[]} */
function schedule() {
  const rows = [];
  for (const rank of SOURCE_RANKS) {
    for (const sourceSeat of [0, 1]) {
      for (let repeat = 0; repeat < REPEATS; repeat++) {
        const seeds = deriveSlotSeeds(SEED_BASE, 'pilot', rank, repeat);
        rows.push({rank, sourceSeat, repeat, seed: seeds[sourceSeat === 0 ? 'B' : 'A']});
      }
    }
  }
  return rows;
}

/** @param {unknown} value @returns {string} */
function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Compare only observed native root actions and public card/attack identities.
 * A difference does not demonstrate a causal effect without an actual
 * policy opportunity; prompt decisions are separately audited.
 * @param {object[]} a
 * @param {object[]} b
 * @returns {object|null}
 */
function firstRootDifference(a, b) {
  const publicFields = row => ({
    turnBefore: row.turnBefore,
    playerSlot: row.playerSlot,
    action: row.action,
    pendingPrompt: row.pendingPrompt,
    card: row.card ?? null,
    ability: row.ability ?? null,
    attack: row.attack ?? null
  });
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const left = a[i] ? publicFields(a[i]) : null;
    const right = b[i] ? publicFields(b[i]) : null;
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      return {ordinal: i, ordinary: left, preserve: right};
    }
  }
  return null;
}

/**
 * @param {object} game Genuine headless Store game record.
 * @param {0|1} sourceSeat Physical original-source seat.
 * @returns {object} Failure-censor-safe mechanical outcome.
 */
function summarize(game, sourceSeat) {
  const initial = game.initialBoardAtFirstTurn?.players?.[sourceSeat] ?? null;
  const soloAtFirstTurn = initial?.active === 'Snorlax PGO' &&
    Array.isArray(initial.bench) && initial.bench.length === 0;
  return {
    firstTurnSlot: game.firstTurnSlot,
    firstTurnDrawVerified: game.verifiedByDrawLog,
    sourceFirstTurnBoard: initial,
    soloAtFirstTurn,
    setupEvents: game.snorlaxSoloOpeningEvents ?? [],
    nativeSetupResponses: game.rootSoloSetupSelections ?? [],
    rootActionLedger: game.rootActionLedger ?? [],
    rootActionSHA256: digest(game.rootActionLedger ?? []),
    sourcePlayed: game.cardsPlayedBySeat?.[sourceSeat] ?? {},
    sourceActions: game.actionsBySeat?.[sourceSeat] ?? {},
    challengerActions: game.actionsBySeat?.[1 - sourceSeat] ?? {},
    nativeAttackDeclarations: game.attackDeclarationTrace ?? [],
    finalPublicBoard: game.finalPublicBoard ?? null,
    finished: game.finished,
    engineWinner: game.winner,
    actions: game.actions,
    turns: game.turns,
    endReason: game.endReason,
    prizesRemaining: game.prizesRemaining,
    deckHashes: game.deckHashes,
    rules: game.rules,
    competitiveGameQualified: false
  };
}

/** @returns {object} All 12 physical deal designs and both actual root streams. */
function run() {
  const plan = planAichi(1, PERMISSIONS);
  assert.equal(plan.engineRevision, ENGINE_SHA);
  assert.equal(plan.candidate.cards.length, 60);
  const rows = [];
  for (const trial of schedule()) {
    const source = plan.opponents.find(o => o.rank === trial.rank);
    assert.equal(source?.status, 'ready');
    assert.equal(source.cards.length, 60);
    const deckA = trial.sourceSeat === 0 ? source.cards : plan.candidate.cards;
    const deckB = trial.sourceSeat === 1 ? source.cards : plan.candidate.cards;
    const expectedDeckHashes = [digest(deckA), digest(deckB)];
    const arms = {};
    for (const preserve of [false, true]) {
      const key = preserve ? 'preserve' : 'ordinary';
      try {
        const game = runMatch({
          deckA, deckB, seed: trial.seed, maxActions: ACTION_CAP,
          isolatePolicyRandomness: true,
          strictPromptValidation: true,
          captureDecisionTrace: true,
          captureStartingBoard: true,
          captureFinalPublicBoard: true,
          snorlaxRetreatStartCorrection: true,
          snorlaxSoloOpeningSeat: trial.sourceSeat,
          snorlaxSoloDeclineOptionalBench: true,
          snorlaxSoloPreserveBench: preserve,
          label: 'rank' + trial.rank + '-solo-bench-' + key
        });
        assert.deepEqual(game.deckHashes, expectedDeckHashes);
        arms[key] = {ok: true, ...summarize(game, trial.sourceSeat)};
      } catch (error) {
        arms[key] = {
          ok: false,
          error: String(error?.stack || error),
          competitiveGameQualified: false
        };
      }
    }
    const both = arms.ordinary.ok && arms.preserve.ok;
    rows.push({
      ...trial, expectedDeckHashes,
      sourceDeckPrintingCount: source.cards.length,
      bothCompletedBoundedAttempt: both,
      startingBoardsIdentical: both ?
        JSON.stringify(arms.ordinary.sourceFirstTurnBoard) ===
        JSON.stringify(arms.preserve.sourceFirstTurnBoard) : null,
      firstRootDifference: both ? firstRootDifference(
        arms.ordinary.rootActionLedger, arms.preserve.rootActionLedger) : null,
      arms,
      competitiveGameQualified: false
    });
  }
  return {
    schema: 'agent19-solo-snorlax-bench-preservation-prospective-v1',
    label: 'Development-policy fidelity probe, never a competitive game sample',
    fieldManifestDigest: plan.manifestDigest,
    challengerDeckDigest: plan.candidateDigest,
    candidateRank: 1,
    sourceRanks: SOURCE_RANKS,
    engineRevision: ENGINE_SHA,
    seedBase: SEED_BASE,
    seedDerivation: 'decorrelated-slots-v3',
    repeats: REPEATS,
    actionCap: ACTION_CAP,
    physicalDealDesigns: rows.length,
    boundedAttempts: rows.length * 2,
    qualifiedCompetitiveGames: 0,
    rows
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = {schedule, digest, summarize, firstRootDifference, run};
