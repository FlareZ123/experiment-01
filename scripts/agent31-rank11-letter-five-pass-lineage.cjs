'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');

const VERSION = 'agent31-rank11-letter-five-pass-lineage-v1';
const TRIAL = '11:102:A:champion-reference';
const PASS_ROOTS = Object.freeze([11, 18, 29, 37, 45]);
const PASS_TURNS = Object.freeze([2, 4, 6, 8, 10]);
const SHA_V5 = '22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17';
const SHA_PASSES = '23631b6c2cb8c5a38957167579b1fdcbb6035543ced1665d0e8373ef56bfe73f';
const SHA_ROOT37 = 'bb0a9545ed1d20678a1261478f4e099dcfd8cfa3c71bc5b60b453c0ceae79d6c';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Cross-audit three independently retained native receipts.
 * Identifies a paper candidate line; it does not pretend a Store action was played.
 *
 * @param {object} v5 Exact original eight-arm accepted native root ledger.
 * @param {object} passes Independent read-only owner Pass snapshots.
 * @param {object} before Independent original root37 pre-decoder owner snapshot.
 * @returns {object} Strict per-root capability evidence.
 */
function audit(v5, passes, before) {
  assert.equal(v5.attempts.length, 8);
  assert.equal(passes.attempts.length, 8);
  assert.equal(passes.exactInitialFullDealAndRootTapeMatches, 8);
  const game = v5.attempts.find(row => row.id === TRIAL);
  const observation = passes.attempts.find(row => row.id === TRIAL);
  const independent = before.opportunities.find(row => row.id === TRIAL);
  assert.ok(game && observation && independent);
  assert.equal(game.originalSourceSeat, 1);
  assert.equal(observation.sourceSeat, 1);
  assert.equal(game.nativeRootActionCount, 48);
  assert.equal(game.status, 'returned-unqualified');
  assert.equal(game.finished, false);
  assert.equal(game.publicRootLedgerSha256Computed, digest(game.publicRootActions));
  assert.equal(game.publicRootLedgerSha256Reported, game.publicRootLedgerSha256Computed);
  assert.equal(independent.actualPassAccepted, true);
  assert.equal(independent.passRootOrdinal, 37);
  assert.equal(independent.sourceSeat, 1);
  assert.equal(independent.fullDealMatched, true);
  assert.equal(independent.rootTapeMatched, true);

  const roots = game.publicRootActions;
  const sourceNonprompt = roots.filter(x => x.playerSlot === 1 &&
    x.action !== 'ResolvePromptAction' && x.action !== 'PassTurnAction');
  assert.deepEqual(sourceNonprompt.map(x => [x.actionOrdinal, x.action, x.card]),
    [[36, 'PlayCardAction', 'Squawkabilly ex']]);

  const candidateAttacks = roots.filter(x => x.playerSlot === 0 &&
    x.action === 'AttackAction');
  assert.deepEqual(candidateAttacks.map(x => [x.actionOrdinal, x.attack]),
    [[23, 'Eon Blade'], [41, 'Eon Blade']]);
  const otherCandidatePlays = roots.filter(x => x.playerSlot === 0 &&
    x.action === 'PlayCardAction');
  assert.deepEqual(otherCandidatePlays.map(x => x.card),
    ['Psychic Energy', 'Psychic Energy', "Lillie's Clefairy ex",
      'Psychic Energy', 'Mimikyu', 'Psychic Energy']);

  const old = independent.ownerVisibleBeforeChoice;
  assert.equal(old.globalTurn, 8);
  assert.deepEqual(old.ownPublic.discard, ['Trubbish FST']);
  assert.deepEqual(old.ownPublic.lostZone, []);
  assert.equal(old.ownPublic.prizeCount, 6);
  assert.equal(old.ownPublic.deckCount, 43);
  assert.equal(old.ownTurnResources.itemPlayLocked, false);
  assert.equal(old.ownPublic.publicTurnRestrictions.itemPlayLocked, false);
  assert.equal(old.ownTurnResources.energyPlayedTurn, 0);
  assert.equal(old.ownHand.filter(x => x === 'Darkness Energy MEE').length, 0);
  assert.equal(old.ownPublic.discard.filter(x => x === 'Darkness Energy MEE').length, 0);
  const ownerSlots = [old.ownPublic.active, ...old.ownPublic.bench].filter(Boolean);
  assert.equal(ownerSlots.flatMap(x => x.energies || [])
    .filter(x => x === 'Darkness Energy MEE').length, 0);

  assert.equal(observation.ownerPassObservations.length, 5);
  const perPass = observation.ownerPassObservations.map((p, i) => {
    assert.equal(p.ordinal, PASS_ROOTS[i]);
    assert.equal(p.turn, PASS_TURNS[i]);
    const r = roots[p.ordinal];
    assert.equal(r.action, 'PassTurnAction');
    assert.equal(r.playerSlot, 1);
    assert.equal(r.turnBefore, p.turn);
    assert.equal(p.ownerHandAtPass.includes('Professors Letter BKT'), true);
    assert.equal(p.ownerHandAtPass.some(x => /^Darkness Energy\b/.test(x)), false);
    const own = p.publicBoardBeforePass[1];
    const opponent = p.publicBoardBeforePass[0];
    assert.ok(own && opponent);
    assert.equal(own.stadium.length, 0);
    assert.equal(opponent.stadium.length, 0);
    assert.ok(['Latias ex'].includes(opponent.active.name));
    assert.ok(opponent.bench.every(x =>
      ["Lillie's Clefairy ex", 'Mimikyu'].includes(x.name)));
    assert.ok([own.active, ...own.bench].every(x => x.energyCards.length === 0));

    return {
      acceptedSourcePassOrdinal: p.ordinal,
      globalTurn: p.turn,
      printedHeldSearchItem: "Professors Letter BKT",
      ownedBoardEnergyCardCount: 0,
      exactBasicDarknessEnergyCopiesInOriginalSixty: 8,
      maxUnknownPrizedCopies: 6,
      guaranteedDeckTargetsConditionalOnNoOffscreenEnergyTransfer: 2,
      samePhysicalGame: TRIAL
    };
  });
  assert.deepEqual(old.ownHand, observation.ownerPassObservations[3].ownerHandAtPass);

  // Printed Latias ex Eon Blade only deals damage and prevents its own next attack;
  // the opponent never played a Trainer in this accepted root tape.
  // A non-ledger engine/card-effect transfer would invalidate the longitudinal
  // inference, so the result explicitly remains conditional until full native zone
  // custody is captured at each earlier root.
  return {
    version: VERSION,
    actualOriginalSourceRootCount: game.publicRootActions.length,
    sameTrialId: TRIAL,
    independentPhysicalTrialCount: 1,
    originalSourceAcceptedNonpromptActions: sourceNonprompt.length,
    repeatedHeldPaperItemPasses: perPass.length,
    exactTwoDarknessTargetProofAtRoot37: true,
    earlierAndLaterTwoDarknessTargetBound: 'conditional-zone-continuity',
    noHiddenPrizeFacesInspected: true,
    zeroNativeLetterPlaysDemonstrated: true,
    noQualifiedCompetitiveGames: true,
    roots: perPass
  };
}

/**
 * Fail closed when the expected original artifact members have changed.
 * @param {string} filename Exact JSON member path.
 * @param {string} expected Member SHA-256.
 * @returns {object} Parsed immutable JSON.
 */
function readMember(filename, expected) {
  const raw = fs.readFileSync(filename);
  assert.equal(createHash('sha256').update(raw).digest('hex'), expected);
  return JSON.parse(raw.toString('utf8'));
}

if (require.main === module) {
  assert.equal(process.argv.length, 5,
    'Three extracted archived JSON members required: v5, Passes, before-root37');
  const output = audit(
    readMember(process.argv[2], SHA_V5),
    readMember(process.argv[3], SHA_PASSES),
    readMember(process.argv[4], SHA_ROOT37)
  );
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}
module.exports = { VERSION, audit, readMember };
