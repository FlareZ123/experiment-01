'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { runMatch, initializeCards } = require('../twinleaf/headless.cjs');
const { planAichi } = require('./aichi-pilot.cjs');
const { deriveSlotSeeds } = require('../../scripts/aichi-decorrelated-seeds.cjs');
const { trainerPrintCatalog } =
  require('../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
const { withSelectedSourceStadium, digestResult } =
  require('./agent7-original6v9-stadium-selected-retrospective.cjs');
const REGISTRATION =
  require('../../results/aichi-2026/registrations/agent7-original5v11-skyfield-pass-retro-20261103.json');
const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));

/**
 * Third original-source paper Stadium replacement case: preserving native
 * setup/deal and genuine default bot choices except for one public own-hand
 * Stadium action at the single preregistered original rank5 Pass.
 */
function run() {
  const fixture = REGISTRATION.sourceFixture;
  const source = planAichi(5, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const deckA = source.candidate.cards;
  const deckB = source.opponents.find(row => row.rank === 11)?.cards;
  assert.equal(deckA?.length, 60);
  assert.equal(deckB?.length, 60);
  const seeds = deriveSlotSeeds(20261113, 'pilot', 5, 0);
  assert.equal(seeds.A, REGISTRATION.seedPlan.seed);
  const manager = initializeCards();

  const { Store } = native('game/store/store');
  const { SimpleTacticsAi } = native('simple-bot/simple-tactics-ai');
  const { GamePhase } = native('game/store/state/state');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const { TrainerCard } = native('game/store/card/trainer-card');
  const { TrainerType } = native('game/store/card/card-types');
  const { ActionEnumerator } = native('advanced-bot/action-enumerator');
  const catalog = trainerPrintCatalog(manager.getAllCards(), {
    TrainerCard, TrainerType
  });

  const request = {
    deckA, deckB, seed: seeds.A, maxActions: 90,
    strictPromptValidation: true, isolatePolicyRandomness: true,
    captureDecisionTrace: true, captureInitialFullPhysicalDeal: true,
    label: 'agent7-original5v11-skyfield-selected-A'
  };
  const attempt = (arm, task) => {
    try {
      return { arm, status: 'executed', result: task() };
    } catch (error) {
      return { arm, status: 'native-error',
        error: String(error?.stack ?? error) };
    }
  };
  const control = attempt('native-control', () => runMatch(request));
  const selected = attempt('single-owner-skyfield-after-pass', () =>
    withSelectedSourceStadium(() => runMatch(request), {
      Store, SimpleTacticsAi, GamePhase, PlayCardAction,
      PlayerType, SlotType, ActionEnumerator, catalog, fixture
    }));
  const repeated = attempt('native-control-repeat', () => runMatch(request));
  const first = control.result;
  const selectedGame = selected.result?.result;
  const replay = repeated.result;
  const fingerprints = [first, selectedGame, replay].map(game =>
    game?.initialFullPhysicalDealFingerprint?.digestSha256 ?? null);
  const digest = game => game ? digestResult(game) : null;
  const row = {
    fixture,
    unchanged60: true,
    source: { ranks: [5, 11], seed: seeds.A },
    armStatus: {
      control: control.status, selected: selected.status,
      repeat: repeated.status,
      errors: [control, selected, repeated].filter(x=>x.error).map(x=>({
        arm:x.arm,error:x.error
      }))
    },
    originalSourcePhysicalDealEqual:
      fingerprints[0] === fixture.previousSourcePhysicalDealSha256,
    allThreePhysicalDealsEqual:
      fingerprints.every(value => value !== null && value === fingerprints[0]),
    nativeControlRepeatedIdentically:
      digest(first) !== null && digest(first) === digest(replay),
    physicalDealSha256: fingerprints,
    nativeTraceSha256: [digest(first), digest(selectedGame), digest(replay)],
    nativeSelectedRoots: selected.result?.audit?.selectedRoots ?? null,
    nativeSelectedStore: selected.result?.audit?.selectedNativeStore ?? null,
    selectedAudit: selected.result?.audit ?? null,
    controlTrace: first?.rootActionLedger ?? null,
    selectedTrace: selectedGame?.rootActionLedger ?? null,
    controlDecisionTrace: first?.decisionTrace ?? null,
    selectedDecisionTrace: selectedGame?.decisionTrace ?? null,
    controlOutcome: first ? {
      finished:first.finished,winner:first.winner,actions:first.actions
    } : null,
    selectedOutcome: selectedGame ? {
      finished:selectedGame.finished,winner:selectedGame.winner,
      actions:selectedGame.actions
    } : null,
    qualifiedGameWins:0
  };
  const output = {
    schema: REGISTRATION.schema,
    registration: REGISTRATION,
    originalPhysicalGroups: 1,
    totalNativeAttempts: 3,
    nativeErrors: row.armStatus.errors.length,
    fullPhysicalDealMatched: row.allThreePhysicalDealsEqual,
    originalSourceDealMatched: row.originalSourcePhysicalDealEqual,
    nativeControlParity: row.nativeControlRepeatedIdentically,
    selectedRootCount: row.nativeSelectedRoots,
    acceptedSelectedStoreCount: row.nativeSelectedStore === 'accepted' ? 1 : 0,
    competitiveQualifiedGames:0,
    row
  };
  return output;
}

if (require.main === module) {
  const output = run();
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  process.stderr.write('AGENT7_ORIGINAL5V11_SKYFIELD_ACTIVATION ' +
    JSON.stringify({
      rank5SourcePhysicalMatched: output.originalSourceDealMatched,
      tripleDealMatched: output.fullPhysicalDealMatched,
      repeatedNativeControlMatched: output.nativeControlParity,
      errors: output.nativeErrors,
      selectedRootCount: output.selectedRootCount,
      accepted: output.acceptedSelectedStoreCount,
      firstTargetRoot:
        output.row.selectedAudit?.observedTargetNativeRoots?.[0] ?? null
    }) + '\n');
  if (!output.fullPhysicalDealMatched || !output.nativeControlParity ||
      !output.originalSourceDealMatched || output.nativeErrors > 0) {
    process.exitCode = 1;
  }
}

module.exports = { run };
