'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { runMatch } = require('../twinleaf/headless.cjs');
const { resolveManifest } = require('../twinleaf/resolve-field.cjs');
const { evaluatePlan } = require('./field-benchmark.cjs');

const MANIFEST_PATH = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');

/** @param {unknown} value Reproducible manifest or source-deck identity. */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Use the shared, engine-validated printing resolver instead of inventing a
 * second card mapping. Hook and approximation permissions are opt-in.
 *
 * @param {number|object} candidate Source rank or a fixed custom 60-card manifest entry.
 * @param {object} options Explicit resolver permissions.
 * @returns {object} Field plan accepted by the separate match evaluator.
 */
function planAichi(candidate = 1, options = {}) {
  const source = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const custom = typeof candidate === 'object' && candidate !== null;
  const candidateRank = custom ? 0 : candidate;
  const candidateSource = custom ? { ...candidate, rank: candidateRank } :
    source.decks.find(deck => deck.rank === candidateRank);
  if (!candidateSource) throw new Error('No published candidate at rank ' + candidateRank);
  const manifest = custom ? {
    ...source, decks: [...source.decks, candidateSource]
  } : source;
  const permissions = {
    allowEquivalentBasicEnergies: options.allowEquivalentBasicEnergies === true,
    allowBasicEnergyMirrorPrintings: options.allowBasicEnergyMirrorPrintings === true,
    allowJapanesePromoHooks: options.allowJapanesePromoHooks === true
  };
  const imported = resolveManifest(manifest, permissions);
  const candidateEngine = imported.decks.find(deck => deck.rank === candidateRank);
  const opponentByRank = new Map(imported.decks.filter(deck => deck.rank >= 1 && deck.rank <= 32)
    .map(deck => [deck.rank, deck]));
  const convert = deck => ({
    cards: deck.playableUnderEngine ? deck.cardIds : null,
    unresolved: deck.unresolved.length ? deck.unresolved :
      deck.playableUnderEngine ? [] : [{
        reason: 'failed-engine-deck-validation', rank: deck.rank
      }],
    substitutions: deck.modifications
  });
  const candidateResolved = convert(candidateEngine);
  const opponents = [];
  for (let rank = 1; rank <= 32; rank += 1) {
    const d = opponentByRank.get(rank);
    if (!d) {
      opponents.push({ rank, status: 'missing-published-list', cards: null });
    } else {
      const resolved = convert(d);
      opponents.push({
        rank, player: d.player, archetype: d.archetype,
        status: resolved.cards ? 'ready' : 'unresolved-printings',
        ...resolved
      });
    }
  }
  return {
    source: source.source, engineRevision: imported.engineRevision,
    manifestDigest: digest(source), candidateRank: custom ? null : candidateRank,
    candidateLabel: custom ? candidate.label || 'fixed custom deck' : candidateSource.player,
    candidateDigest: digest(candidateSource.cards.map(c => ({
      name: c.name, count: c.count, printing: c.printing
    })).sort((a, b) => (a.name + a.printing.set + a.printing.number)
      .localeCompare(b.name + b.printing.set + b.printing.number))),
    printEquivalencePolicy: permissions,
    candidate: candidateResolved, opponents,
    sourceDeckCount: source.decks.length,
    sharedResolver: 'simulation/twinleaf/resolve-field.cjs'
  };
}

/** @param {ReturnType<typeof planAichi>} plan Provenance-bearing evaluation plan. */
function summarisePlan(plan) {
  return {
    source: plan.source, engineRevision: plan.engineRevision,
    manifestDigest: plan.manifestDigest,
    candidateRank: plan.candidateRank, candidateLabel: plan.candidateLabel,
    candidateDigest: plan.candidateDigest,
    sharedResolver: plan.sharedResolver,
    printEquivalencePolicy: plan.printEquivalencePolicy,
    candidateResolved: plan.candidate.cards !== null,
    candidateSubstitutions: plan.candidate.substitutions,
    candidateUnresolved: plan.candidate.unresolved,
    readyRanks: plan.opponents.filter(d => d.status === 'ready').map(d => d.rank),
    unavailableSourceRanks: plan.opponents.filter(d => d.status === 'missing-published-list')
      .map(d => d.rank),
    blockedRanks: plan.opponents.filter(d => d.status === 'unresolved-printings')
      .map(d => ({
        rank: d.rank, player: d.player, archetype: d.archetype,
        modifications: d.substitutions,
        unresolved: d.unresolved
      })),
    semanticSupportVerified: false,
    paperLegalityVerified: false,
    actualFirstTurnBalanceVerified: false
  };
}

/**
 * A bounded engine/policy feasibility pilot. This is not win-rate evidence.
 * @param {{candidate?:number|object,gamesPerSeat?:number,seedBase?:number,
 *   maxActions?:number,selectedRanks?:number[],allowEquivalentBasicEnergies?:boolean,
 *   allowBasicEnergyMirrorPrintings?:boolean,allowJapanesePromoHooks?:boolean}} options
 */
function runAichiPilot(options = {}) {
  const plan = planAichi(options.candidate ?? 1, options);
  const report = evaluatePlan(plan, {
    runMatch, gamesPerSeat: options.gamesPerSeat ?? 1,
    seedBase: options.seedBase ?? 20261015,
    maxActions: options.maxActions ?? 600,
    selectedRanks: options.selectedRanks
  });
  return { plan: summarisePlan(plan), evaluation: report };
}

if (require.main === module) {
  const strict = summarisePlan(planAichi());
  const permitted = summarisePlan(planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  }));
  console.log(JSON.stringify({ strict, permitted }, null, 2));
}

module.exports = { planAichi, summarisePlan, runAichiPilot };
