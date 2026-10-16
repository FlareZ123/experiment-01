'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {loadDefaultCampaign} = require('../../scripts/aichi-comparison-campaign.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root, name));
/** @param {unknown} value */
const digest = value => crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @param {object} player */
function prizeView(player) {
  return player.prizes.map((slot, index) => ({
    index, faceDown: slot.isSecret,
    cardNames: slot.cards.map(card => card.fullName)
  }));
}

/**
 * Capture only the source game's original Store; speculative bot Stores
 * must not contribute a false count of played Hisuian Heavy Ball.
 * Uses exact original actions, reducers and prompts, with no injected cards.
 * @param {object} request Headless source-deal request.
 */
function traceHisuianSource(request) {
  initializeCards();
  const {Store} = engine('game/store/store');
  const {HisuianHeavyBall} = engine(
    'sets/09-sword-and-shield/set-astral-radiance/hisuian-heavy-ball'
  );
  const originalDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  const originalReduce = Object.getOwnPropertyDescriptor(HisuianHeavyBall.prototype, 'reduceEffect');
  assert.ok(originalDispatch?.value && originalReduce?.value);
  let liveStore = null;
  let nonliveBallReducers = 0;
  const decisions = [];

  Store.prototype.dispatch = function auditedDispatch(action, ...rest) {
    if (!liveStore && action?.constructor?.name === 'AddPlayerAction') liveStore = this;
    const session = this === liveStore &&
      action?.constructor?.name === 'ResolvePromptAction' ?
      decisions.find(entry => entry.promptId === action.id && !entry.resolved) : null;
    const before = session ? prizeView(session.player) : null;
    const answer = session ? (Array.isArray(action.result) ?
      action.result.map(card => card.fullName ?? null) : action.result) : null;
    const outcome = originalDispatch.value.call(this, action, ...rest);
    if (session) {
      session.resolved = true;
      session.selection = answer;
      session.prizesBeforeResolution = before;
      session.prizesAfterResolution = prizeView(session.player);
      session.ballInDiscard = session.player.discard.cards.includes(session.card);
      session.ballInPrizes = session.player.prizes.some(slot =>
        slot.cards.includes(session.card));
    }
    return outcome;
  };

  HisuianHeavyBall.prototype.reduceEffect = function auditedBall(store, state, effect) {
    const isThisBall = effect?.trainerCard === this && effect?.player;
    if (isThisBall && store !== liveStore) nonliveBallReducers++;
    const result = originalReduce.value.call(this, store, state, effect);
    if (isThisBall && store === liveStore) {
      const prompt = state.prompts.find(p =>
        p.result === undefined && p.constructor.name === 'ChooseCardsPrompt');
      assert.ok(prompt, 'Live Heavy Ball must schedule its Basic Prize selection');
      decisions.push({
        turn:state.turn,
        playerSeat:state.players.indexOf(effect.player),
        promptId:prompt.id,
        player:effect.player,
        card:this,
        prizesDuringChoice:prizeView(effect.player),
        resolved:false
      });
    }
    return result;
  };

  let result;
  try {
    result = runMatch(request);
  } finally {
    Object.defineProperty(HisuianHeavyBall.prototype, 'reduceEffect', originalReduce);
    Object.defineProperty(Store.prototype, 'dispatch', originalDispatch);
  }
  const portableDecisions = decisions.map(({player, card, ...entry}) => entry);
  return {
    result, sourceBallPlays:decisions.length, nonliveBallReducers,
    sourceBallDecisions:portableDecisions,
    evidenceDigest:digest(portableDecisions),
    allBallPromptsResolved:decisions.every(entry => entry.resolved)
  };
}

/**
 * Fixed, genuine Aichi source rank 1 versus rank 10, physical candidate B.
 * This is a fidelity diagnostic and is not a new qualified competitive game.
 */
function main() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'), {
      allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true
    }
  );
  const byRank = new Map(field.decks.map(deck => [deck.rank, deck]));
  const candidate = byRank.get(1);
  const opponent = byRank.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  const schedule = loadDefaultCampaign('decorrelated-slots-v3');
  const trial = schedule.trials.find(t => t.phase === 'pilot' &&
    t.rank === 10 && t.candidateId === 'champion-reference' &&
    t.repeat === 0 && t.candidateEngineSlot === 'B');
  assert.equal(trial?.seed, 4246551499);
  const common = {
    deckA:opponent.cardIds, deckB:candidate.cardIds,
    seed:trial.seed, maxActions:350, label:trial.trialId,
    strictPromptValidation:true, forestSealSearchCorrection:true,
    supporterDecisionCorrection:true, doubleDragonRecovery:true,
    isolatePolicyRandomness:true, captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1, postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const original = traceHisuianSource(common);
  const corrected = traceHisuianSource({
    ...common, hisuianHeavyBallPrizeShuffleCorrection:true
  });
  const repeated = traceHisuianSource(common);
  assert.deepEqual(repeated, original,
    'Source-run and audit must be unchanged after opt-in correction');
  assert.equal(original.allBallPromptsResolved, true);
  assert.equal(corrected.allBallPromptsResolved, true);

  const brief = trace => ({
    sourceBallPlays:trace.sourceBallPlays,
    nonliveBallReducers:trace.nonliveBallReducers,
    evidenceDigest:trace.evidenceDigest,
    sourceBallDecisions:trace.sourceBallDecisions,
    winner:trace.result.winner,
    gameActions:trace.result.actions,
    turns:trace.result.turns,
    prizesRemaining:trace.result.prizesRemaining,
    returnDigest:digest(trace.result)
  });
  return {
    schema:'source-aichi-rank10-heavyball-prize-audit-v1',
    label:'diagnostic source game, NOT qualified for competitive inference',
    source:{rankCandidate:1,rankOpponent:10,seed:trial.seed,
      physicalCandidateSeat:'B',candidateActuallyFirst:true,
      deckHashes:original.result.deckHashes},
    pinnedSourceEngine:original.result.engine,
    optInPaperShuffleEnabledOnlyInCorrectedArm:true,
    unchangedOriginalAfterCorrection:true,
    original:brief(original), corrected:brief(corrected),
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}
module.exports = {prizeView, traceHisuianSource, main};
