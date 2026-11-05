'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const VERSION = 'agent17-skyliner-postpivot-pass-hand-bound-v1';
const TARGET = Object.freeze({
  seed: 3792360798,
  rank3Seat: 0,
  mode: 'bilateral-skyliner-free-retreat',
  turns: [59, 61, 63, 65, 67]
});

/**
 * Pure lower bound on Trainer cards still held at a Pass.
 * An accepted play at zero-based hand index i establishes at least i+1 cards
 * immediately before the play. If the next voluntary root is Pass and the
 * play was one non-Trainer, at least i cards remain, of which at most N-1
 * can be non-Trainers when the full printed 60 has N non-Trainers.
 *
 * @param {object} archived Registered native A/B/A archive.
 * @param {object} manifest Original historical source inventory.
 * @returns {object} Source-locked conservative proof, not card playability.
 */
function auditSkylinerPostpivotPass(archived, manifest) {
  const source = manifest.decks.find(deck => deck.rank === 3);
  assert.ok(source, 'Original rank3 source list required');
  const category = source.category_counts;
  const total = source.cards.reduce((sum, card) => sum + card.count, 0);
  assert.equal(total, 60, 'Source inventory must be complete');
  const nonTrainers = category['Pokémon'] + category.Energy;
  assert.equal(nonTrainers, source.cards
    .filter(card => card.category !== 'Trainer')
    .reduce((sum, card) => sum + card.count, 0));

  const candidate = archived.rawArms.filter(arm =>
    arm.seed === TARGET.seed && arm.rank3Seat === TARGET.rank3Seat &&
    arm.mode === TARGET.mode);
  assert.equal(candidate.length, 1, 'Exactly one frozen positive B arm');
  const arm = candidate[0];
  assert.equal(arm.status, 'native-terminal');
  const ledger = arm.rootActionLedger;
  const sidecar = arm.nativeAcceptedTargetSidecar;
  assert.ok(Array.isArray(ledger), 'Original root ledger absent');
  assert.ok(Array.isArray(sidecar?.events), 'Store target sidecar absent');
  assert.equal(sidecar.rootOrdinalLinked, true);

  const replies = TARGET.turns.map(turn => {
    const pass = ledger.filter(row => row.turnBefore === turn &&
      row.playerSlot === TARGET.rank3Seat && row.action === 'PassTurnAction');
    assert.equal(pass.length, 1, 'Exactly one original rank3 Pass at ' + turn);
    const actions = ledger.filter(row => row.turnBefore === turn &&
      row.playerSlot === TARGET.rank3Seat &&
      row.action !== 'ResolvePromptAction' &&
      row.actionOrdinal < pass[0].actionOrdinal);
    // A card-index witness is admitted only when a single card play
    // immediately precedes the Pass.
    if (actions.length === 0) {
      return {turn, passRoot:pass[0].actionOrdinal,
        affordableAlternative:'not independently verified',
        handIndexWitness:null, minimumTrainersAtPass:null};
    }
    assert.equal(actions.length, 1, 'Ambiguous roots before Pass on ' + turn);
    const played = actions[0];
    assert.equal(played.action, 'PlayCardAction',
      'Unsupported preceding root at ' + turn);
    const linked = sidecar.events.filter(event =>
      event.rootActionOrdinal === played.actionOrdinal &&
      event.playerSlot === TARGET.rank3Seat &&
      event.action === 'PlayCardAction');
    assert.equal(linked.length, 1, 'No unique owner-hand play evidence at ' + turn);
    const event = linked[0];
    assert.equal(event.storeAccepted, true,
      'Unaccepted card cannot establish hand witness at ' + turn);
    const handIndex = event.declared?.handIndex;
    assert.ok(Number.isSafeInteger(handIndex) && handIndex >= 0);
    const printing = event.declared?.ownerHandPrinting;
    assert.equal(typeof printing, 'string');
    const sourceCard = source.cards.find(card =>
      printing === card.name + ' ' + card.printing.set ||
      printing.startsWith(card.name + ' ' + card.printing.set + ' '));
    assert.ok(sourceCard, 'Playing unregistered original print: ' + printing);
    assert.notEqual(sourceCard.category, 'Trainer',
      'Only a non-Trainer play is proven at ' + turn);
    const intermediate = ledger.filter(row =>
      row.actionOrdinal > played.actionOrdinal &&
      row.actionOrdinal < pass[0].actionOrdinal);
    assert.equal(intermediate.length, 0,
      'Could not preserve immediate hand cardinality at ' + turn);

    const minimumHandBefore = handIndex + 1;
    const minimumHandAtPass = minimumHandBefore - 1;
    const maximumNonTrainersAtPass = nonTrainers - 1;
    const minimumTrainersAtPass = Math.max(0,
      minimumHandAtPass - maximumNonTrainersAtPass);
    return {
      turn,passRoot:pass[0].actionOrdinal,
      playedRoot:played.actionOrdinal,
      sourcePrinting:printing,
      zeroBasedHandIndex:handIndex,
      minimumHandBefore,minimumHandAtPass,
      maximumNonTrainersAtPass,minimumTrainersAtPass,
      affordableAlternative:'not independently verified'
    };
  });

  const nightWatchRoots = ledger.filter(row =>
    row.playerSlot === arm.rank1Seat && row.action === 'AttackAction' &&
    row.attack === 'Night Watch' &&
    row.turnBefore >= 58 && row.turnBefore <= 68);
  const nightWatchChoicePrompts = ledger.filter(row =>
    row.action === 'ResolvePromptAction' &&
    row.pendingPrompt === 'ChooseCardsPrompt' &&
    nightWatchRoots.some(attack =>
      attack.actionOrdinal === row.initiatingRootActionOrdinal));

  return {
    version:VERSION,seed:TARGET.seed,rank3Seat:TARGET.rank3Seat,
    rank1Seat:arm.rank1Seat,armId:arm.id,
    archiveNativeStatus:arm.status,archiveNativeWinner:arm.winner,
    originalSourceNonTrainerCards:nonTrainers,
    originalSourceTrainerCards:category.Trainer,
    nativeNightWatchAttackRoots:nightWatchRoots.map(row => row.actionOrdinal),
    nativeNightWatchHandChoicePromptCount:nightWatchChoicePrompts.length,
    passReplies:replies,
    certifiedMinimumTrainerTurns:replies.filter(r =>
      r.minimumTrainersAtPass !== null).length,
    actualTrainerPlayabilityCertified:false,
    competitiveGamesQualified:0,
    limitation:'Store-accepted hand index bounds category count only; ' +
      'not the exact hand, playable options, target access, quotas, locks, ' +
      'paper-cost validity, or opponent policy optimality.'
  };
}

if (require.main === module) {
  const input = process.argv[2];
  assert.ok(input, 'Supply downloaded original A/B/A JSON artifact');
  const contents = fs.readFileSync(input);
  const archived = JSON.parse(contents.toString('utf8'));
  const manifest = require(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'));
  const result = auditSkylinerPostpivotPass(archived, manifest);
  result.artifactJsonSha256 = createHash('sha256').update(contents).digest('hex');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = {VERSION,TARGET,auditSkylinerPostpivotPass};
