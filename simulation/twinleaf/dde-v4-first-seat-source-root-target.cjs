'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {observableDigest} = require('./dde-source-clone-seat-panel.cjs');

/**
 * Read only this player's own hand and public Pokemon/Energy configuration.
 * All recorded values are detached print names and structural action values.
 * @param {object} state
 * @param {number} actorId
 * @returns {object}
 */
function ownPosition(state, actorId) {
  const owner = state.players.find(player => player.id === actorId);
  assert.ok(owner, 'Missing source-action owner');
  const describe = (slot, zone, index) => ({
    zone, index,
    pokemon: slot?.getPokemonCard()?.fullName ?? null,
    energy: slot?.energies?.cards?.map(card => card.fullName) ?? []
  });
  return {
    turn: state.turn,
    actorId,
    active: describe(owner.active, 'active', 0),
    bench: owner.bench.map((slot, index) => describe(slot, 'bench', index))
  };
}

/**
 * Intercept the real source Store only. Capture physical Energy zones before
 * and after each actual DDE root dispatch, then two following root actions.
 * Unlike a speculative bot probe, this does not call Simulator or bot APIs.
 *
 * @template T
 * @param {Function} Store
 * @param {()=>T} execute
 * @returns {{result:T,records:object[]}}
 */
function withSourceDdeAttachmentTrace(Store, execute) {
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof descriptor?.value, 'function');
  let sourceStore = null;
  let rootStep = -1;
  const records = [];
  Store.prototype.dispatch = function observeSource(action, ...args) {
    if (!sourceStore && action?.constructor?.name === 'AddPlayerAction') {
      sourceStore = this;
    }
    if (this !== sourceStore) {
      return descriptor.value.apply(this, [action, ...args]);
    }
    rootStep++;
    const pending = records.filter(record =>
      rootStep > record.rootStep && rootStep <= record.rootStep + 2);
    const owner = this.state.players.find(player => player.id === action?.id);
    const printing = action?.constructor?.name === 'PlayCardAction'
      ? owner?.hand?.cards?.[action.handIndex]?.fullName ?? null
      : null;
    const candidate = printing === 'Double Dragon Energy ROS';
    const record = candidate ? {
      rootStep,
      before: {
        ...ownPosition(this.state, action.id),
        playedPrinting: printing,
        handIndex: action.handIndex,
        target: action.target ? {
          player: action.target.player,
          slot: action.target.slot,
          index: action.target.index
        } : null
      },
      after: null,
      followingRootActions: []
    } : null;
    const result = descriptor.value.apply(this, [action, ...args]);
    for (const earlier of pending) {
      earlier.followingRootActions.push({
        rootStep,
        action: action?.constructor?.name ?? null,
        actorId: action?.id ?? null,
        afterOwnPosition: ownPosition(this.state, earlier.before.actorId)
      });
    }
    if (record) {
      record.after = ownPosition(this.state, action.id);
      records.push(record);
    }
    return result;
  };
  try {
    return {result: execute(), records};
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', descriptor);
  }
}

/** One frozen source-first Regidrago match, matching Agent20's source suite. */
function main() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true}
  );
  const byRank = new Map(field.decks.map(deck => [deck.rank, deck]));
  const champion = byRank.get(1), regidrago = byRank.get(10);
  assert.ok(champion?.playableUnderEngine && regidrago?.playableUnderEngine);
  const request = {
    deckA: champion.cardIds,
    deckB: regidrago.cardIds,
    seed: 4246551499,
    label: 'rank10-DDE-v4-first-source-action-capability',
    maxActions: 350,
    doubleDragonRecovery: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true
  };
  initializeCards();
  const {Store} = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const control = runMatch(request);
  const audited = withSourceDdeAttachmentTrace(Store, () => runMatch(request));
  const controlDigest = observableDigest(control);
  const observedDigest = observableDigest(audited.result);
  assert.equal(controlDigest, observedDigest,
    'Real-source DDE read-only observer changed runner-visible gameplay');
  assert.equal(control.firstTurnSlot, 1);
  assert.equal(control.verifiedByDrawLog, true);
  assert.equal(control.cardsPlayedBySeat[1]['Double Dragon Energy'], 2);
  assert.equal(audited.records.length, 2,
    'Expected exactly the two already-established real DDE plays');
  return {
    kind: 'rank10-first-source-dde-physical-attachment-audit',
    qualification: 'diagnostic-only',
    source: {
      publishedRanksByEngineSeat: [1, 10],
      seed: request.seed,
      pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      hookSet: 'Agent20 simplified DoubleDragonAttachTactic-v4'
    },
    gameplayUnchangedByObserver: true,
    observableDigest: controlDigest,
    controlSummary: {
      finished: control.finished,
      winner: control.winner,
      turns: control.turns,
      actions: control.actions,
      prizesRemaining: control.prizesRemaining,
      firstTurnSlot: control.firstTurnSlot,
      candidateApexCount: control.attackTrace.filter(x =>
        x.seat === 1 && x.attack === 'Apex Dragon').length
    },
    records: audited.records,
    qualifiedForCompetitiveInference: false,
    sourceReplayMechanicsVerified: false,
    limitations: [
      'One seed and source-first slot with experimental generic opponent bot',
      'Real root pre/post snapshots show card placement, not strategic merit',
      'Two following source root actions only; no complete physical lifecycle',
      'Runner-observable digest equality is not full hidden Store graph proof',
      'No independent paper rule or competing-policy qualification'
    ]
  };
}

if (require.main === module)
  process.stdout.write('SOURCE_DDE_ATTACHMENT_AUDIT ' +
    JSON.stringify(main()) + '\n');

module.exports = {ownPosition, withSourceDdeAttachmentTrace, main};
