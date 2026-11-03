'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  LETTER, DARKNESS, ownPrintedDeckLowerBound,
  certifyRank11LetterTwoDarkness
} = require('../simulation/twinleaf/agent10-rank11-letter-k0-source-target.cjs');

const OTHER = 'Other card X';
const original = [
  ...Array(8).fill(DARKNESS), ...Array(4).fill(LETTER),
  ...Array(48).fill(OTHER)
];

function view(overrides = {}) {
  return {
    decisionKind: 'owner-root', actorSeat: 0, globalTurn: 1,
    ownHand: [LETTER, OTHER],
    ownPublic: {
      active: {evolutionPrintings: [OTHER], energies: [], tools: []},
      bench: [null, null, null, null, null],
      discard: [], lostZone: [], resolvingSupporter: [],
      stadium: [], deckCount: 44, prizeCount: 6,
      publicTurnRestrictions: {itemPlayLocked: false}
    },
    opponentPublic: {
      hiddenHand: ['OPPONENT_SECRET'], prizeIdentities: ['HIDDEN']
    },
    ownTurnResources: {itemPlayLocked: false},
    ...overrides
  };
}

test('eight original Darkness less six possible Prizes certifies two in deck', () => {
  const v = view();
  const b = ownPrintedDeckLowerBound(v, original, DARKNESS);
  assert.equal(b.originalCopies, 8);
  assert.equal(b.visibleOutsideDeckCopies, 0);
  assert.equal(b.guaranteedDeckCopies, 2);
  assert.equal(b.exactDeckOrPrizeIdentityConsulted, false);
  for (const seat of [0, 1]) {
    const c = certifyRank11LetterTwoDarkness({...v, actorSeat: seat}, original);
    assert.equal(c.guaranteedTwoTargets, true);
    assert.equal(c.targetBound.guaranteedDeckCopies, 2);
    assert.equal(c.strategicallyPreferred, false);
  }
});

test('one Darkness in owner hand or attached leaves only one guaranteed target', () => {
  const hand = view({ownHand: [LETTER, DARKNESS]});
  assert.equal(ownPrintedDeckLowerBound(hand, original, DARKNESS)
    .guaranteedDeckCopies, 1);
  assert.equal(certifyRank11LetterTwoDarkness(hand, original), null);
  const field = view();
  field.ownPublic.active.energies.push(DARKNESS);
  assert.equal(certifyRank11LetterTwoDarkness(field, original), null);
});

test('all owner-visible zones consume matching source copies', () => {
  const names = ['discard', 'lostZone', 'resolvingSupporter', 'stadium'];
  for (const name of names) {
    const v = view();
    v.ownPublic[name].push(DARKNESS);
    assert.equal(certifyRank11LetterTwoDarkness(v, original), null);
  }
  const v = view();
  v.ownPublic.bench[0] = {
    evolutionPrintings: [], energies: [DARKNESS], tools: []
  };
  assert.equal(certifyRank11LetterTwoDarkness(v, original), null);
});

test('missing Letter, Item locks and insufficient deck prevent certificate', () => {
  const missing = view({ownHand: [OTHER]});
  assert.equal(certifyRank11LetterTwoDarkness(missing, original), null);
  const locked = view();
  locked.ownTurnResources.itemPlayLocked = true;
  assert.equal(certifyRank11LetterTwoDarkness(locked, original), null);
  const publicLocked = view();
  publicLocked.ownPublic.publicTurnRestrictions.itemPlayLocked = true;
  assert.equal(certifyRank11LetterTwoDarkness(publicLocked, original), null);
  const shortDeck = view();
  shortDeck.ownPublic.deckCount = 1;
  assert.equal(certifyRank11LetterTwoDarkness(shortDeck, original), null);
});

test('mismatched original list or overvisible target is never certified', () => {
  const seven = [...original.slice(0, 7), OTHER, ...original.slice(8)];
  assert.equal(certifyRank11LetterTwoDarkness(view(), seven), null);
  const field = view();
  field.ownPublic.discard = Array(9).fill(DARKNESS);
  const b = ownPrintedDeckLowerBound(field, original, DARKNESS);
  assert.equal(b.physicallyConsistent, false);
  assert.equal(b.guaranteedDeckCopies, 0);
  assert.equal(certifyRank11LetterTwoDarkness(field, original), null);
});

test('unknown opponent hand or Prize identity never changes the bound', () => {
  const a = view();
  const b = view({opponentPublic: {
    hiddenHand: ['OTHER_PRIVATE_DATA'], prizeIdentities: ['OTHER_PRIZE']
  }});
  Object.defineProperty(b, 'opponentDeck', {
    get() { throw new Error('Opponent deck must not be accessed'); }
  });
  assert.deepEqual(certifyRank11LetterTwoDarkness(a, original),
    certifyRank11LetterTwoDarkness(b, original));
});

test('K0 bound remains safe when previously played owner turns are observed', () => {
  const a = view({globalTurn: 3});
  assert.equal(certifyRank11LetterTwoDarkness(a, original)
    .targetBound.guaranteedDeckCopies, 2);
  assert.equal(certifyRank11LetterTwoDarkness(a, original)
    .alternativeActionsCompared, false);
});

test('authentic original rank11 inventory supplies the asserted 8 plus 4 prints', () => {
  const field = require('../results/aichi-2026/full-decklists.json');
  const originalRank11 = field.decks.find(deck => deck.rank === 11);
  assert.equal(originalRank11.player, 'Wataru Yano');
  const full = originalRank11.cards.flatMap(card =>
    Array(card.count).fill(card.name === "Professor's Letter" &&
      card.printing.set === 'BKT' ? LETTER :
      card.name + ' ' + card.printing.set));
  assert.equal(full.length, 60);
  assert.equal(full.filter(p => p === DARKNESS).length, 8);
  assert.equal(full.filter(p => p === LETTER).length, 4);
  const proof = certifyRank11LetterTwoDarkness(view(), full);
  assert.equal(proof.guaranteedTwoTargets, true);
  assert.equal(proof.sourceInventoryAuthenticationRequired, true);
});

test('an impossible target lower bound greater than deck size is unresolved', () => {
  const v = view();
  v.ownPublic.deckCount = 1;
  const bound = ownPrintedDeckLowerBound(v, original, DARKNESS);
  assert.equal(bound.physicallyConsistent, false);
  assert.equal(bound.guaranteedDeckCopies, 0);
  assert.equal(certifyRank11LetterTwoDarkness(v, original), null);
});
