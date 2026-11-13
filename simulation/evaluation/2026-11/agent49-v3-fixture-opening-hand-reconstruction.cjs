'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chooseQuickBallRootIntent } =
  require('../../twinleaf/agent8-actor-quick-ball-frontier.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const FIXTURE = Object.freeze({
  candidatePath: 'results/aichi-2026/candidate-hood-shadow-rider.json',
  fieldPath: 'results/aichi-2026/full-decklists.json',
  candidateGitBlobSha: '24ace2d6feb9ce5d9056bcf271827cfe31b7357b',
  fieldGitBlobSha: 'ae773f6201d7aa69d31914dbfee66f3fba692200',
  candidatePrinted60Sha256: '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924',
  opponentPrinted60Sha256: '159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090',
  engineCommit: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  seed: 'agent36-v3-fixture-hood-rank1-20261112-01',
  candidateSeat: 0,
  opponentSeat: 1,
  actualFirstPlayerSeat: 1,
  candidateChoseFirst: false,
  openingHandSize: 7
});

function gitBlobSha(bytes) {
  const value = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return crypto.createHash('sha1')
    .update(Buffer.from(`blob ${value.length}\0`, 'utf8'))
    .update(value)
    .digest('hex');
}

function printed60Fingerprint(deck) {
  assert.ok(deck && Array.isArray(deck.cards));
  const rows = deck.cards.map(row => [
    row.category,
    row.name,
    row.count,
    row.printing && row.printing.set !== undefined ? row.printing.set : null,
    row.printing && row.printing.number !== undefined ? String(row.printing.number) : null,
    row.printing && row.printing.language !== undefined ? row.printing.language : null
  ]);
  rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return crypto.createHash('sha256').update(JSON.stringify(rows), 'utf8').digest('hex');
}

function normalizeSeed32(seed) {
  if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) return seed >>> 0;
  assert.ok(typeof seed === 'string' && seed.trim().length > 0);
  return crypto.createHash('sha256').update(seed, 'utf8').digest().readUInt32LE(0);
}

function seededRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function deckPermutation(length, random) {
  const order = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

// These are the two exact proxy mappings in the frozen V3 runner.
function engineProxyPrintingForSourceRow(row) {
  const source = row.printing;
  if (row.name === 'Night Stretcher' && source.set === 'ASC' &&
      String(source.number) === '196') {
    return { ...source, set: 'SFA', number: '61' };
  }
  if (row.name === 'Psychic Energy' && source.set === 'MEE' &&
      String(source.number) === '13') {
    return { ...source, set: 'SVE', number: '5' };
  }
  return source;
}

function expandPrintedDeck(deck) {
  assert.ok(deck && Array.isArray(deck.cards));
  const cards = [];
  for (const row of deck.cards) {
    assert.ok(row && Number.isSafeInteger(row.count) && row.count > 0);
    const engine = engineProxyPrintingForSourceRow(row);
    // Twinleaf Card.fullName is name + set; set number remains separate metadata.
    const card = Object.freeze({
      fullName: `${row.name} ${engine.set}`,
      name: row.name,
      category: row.category,
      sourcePrinting: {
        set: row.printing.set,
        number: String(row.printing.number),
        language: row.printing.language
      },
      enginePrinting: {
        set: engine.set,
        number: String(engine.number)
      }
    });
    for (let i = 0; i < row.count; i++) cards.push(card);
  }
  assert.equal(cards.length, 60, 'fixture deck must expand to exactly 60 cards');
  return cards;
}

// Both frozen fixture lists contain only Basic Pokémon plus Shadow Rider VMAX.
// This narrow classifier is not intended for arbitrary decks or legality checks.
function isBasicForFrozenFixture(card) {
  return card.category === 'Pokémon' && card.name !== 'Shadow Rider Calyrex VMAX';
}

function serializableCard(card) {
  return {
    fullName: card.fullName,
    sourcePrinting: card.sourcePrinting,
    enginePrinting: card.enginePrinting
  };
}

function countsByFullName(cards) {
  const counts = new Map();
  for (const card of cards) counts.set(card.fullName, (counts.get(card.fullName) ?? 0) + 1);
  return [...counts.entries()].map(([fullName, count]) => ({ fullName, count }));
}

function reconstructFixture({ repositoryRoot = ROOT } = {}) {
  const candidateBytes = fs.readFileSync(path.join(repositoryRoot, FIXTURE.candidatePath));
  const fieldBytes = fs.readFileSync(path.join(repositoryRoot, FIXTURE.fieldPath));
  assert.equal(gitBlobSha(candidateBytes), FIXTURE.candidateGitBlobSha,
    'candidate printed-60 source blob differs from the frozen V3 fixture');
  assert.equal(gitBlobSha(fieldBytes), FIXTURE.fieldGitBlobSha,
    'Aichi source field blob differs from the frozen V3 fixture');

  const candidateDeck = JSON.parse(candidateBytes.toString('utf8'));
  const field = JSON.parse(fieldBytes.toString('utf8'));
  const opponentDeck = field.decks.find(deck => deck.rank === 1);
  assert.ok(opponentDeck, 'authenticated rank-1 source list is required');
  assert.equal(printed60Fingerprint(candidateDeck), FIXTURE.candidatePrinted60Sha256);
  assert.equal(printed60Fingerprint(opponentDeck), FIXTURE.opponentPrinted60Sha256);

  const candidate = expandPrintedDeck(candidateDeck);
  const opponent = expandPrintedDeck(opponentDeck);
  const seed32 = normalizeSeed32(FIXTURE.seed);
  assert.equal(seed32, 4065045654, 'fixture seed derivation changed');

  const random = seededRandom(seed32);
  let physicalRandomCalls = 0;
  const physicalRandom = () => {
    physicalRandomCalls++;
    return random();
  };

  // setupGame asks who begins before issuing both ShuffleDeckPrompts in seat order.
  const coinFlipResult = physicalRandom() < 0.5;
  const coinFlipWinnerSeat = coinFlipResult ? 0 : 1;
  const shuffledBySeat = [];
  for (const seat of [0, 1]) {
    const deck = seat === FIXTURE.candidateSeat ? candidate : opponent;
    const order = deckPermutation(deck.length, physicalRandom);
    shuffledBySeat[seat] = order.map(index => deck[index]);
  }

  const candidateOpening = shuffledBySeat[FIXTURE.candidateSeat]
    .slice(0, FIXTURE.openingHandSize);
  const opponentOpening = shuffledBySeat[FIXTURE.opponentSeat]
    .slice(0, FIXTURE.openingHandSize);
  const candidateBasics = candidateOpening.filter(isBasicForFrozenFixture);
  const opponentHasBasic = opponentOpening.some(isBasicForFrozenFixture);
  assert.ok(candidateBasics.length > 0, 'candidate opening hand requires a Basic');
  assert.ok(opponentHasBasic, 'rank-1 opening hand requires a Basic; otherwise mulligan reshuffles alter the trace');
  assert.equal(physicalRandomCalls, 119, 'one coin flip plus two 60-card Fisher-Yates shuffles');

  // The fixture report records that the coin winner (candidate seat 0) chose
  // second. Keep that observed choice separate from the RNG-derived coin result.
  assert.equal(coinFlipWinnerSeat, FIXTURE.candidateSeat);
  assert.equal(FIXTURE.candidateChoseFirst, false);
  assert.equal(FIXTURE.actualFirstPlayerSeat, FIXTURE.opponentSeat);

  // Only one Basic is in the candidate's opening hand, so the starting-Pokémon
  // prompt cannot create a second Bench Pokémon. Remove that Active from the
  // owner hand before evaluating the existing actor-only Quick Ball helper.
  assert.equal(candidateBasics.length, 1);
  const activeIndex = candidateOpening.findIndex(isBasicForFrozenFixture);
  const startingPokemon = candidateOpening[activeIndex];
  assert.equal(startingPokemon.fullName, 'Shadow Rider Calyrex V CRE');
  const postSetupHand = candidateOpening.filter((_, index) => index !== activeIndex);

  const actorView = {
    decisionKind: 'owner-root',
    ownHand: postSetupHand.map(card => card.fullName),
    ownPublic: {
      active: { name: 'Shadow Rider Calyrex V', printing: startingPokemon.fullName },
      bench: [null, null, null, null, null],
      deckCount: 53,
      publicTurnRestrictions: { itemPlayLocked: false }
    },
    ownTurnResources: {
      itemPlayLocked: false,
      pokemonPlayLocked: false
    }
  };
  const quickBallRootIntent = chooseQuickBallRootIntent(actorView);
  assert.deepEqual(quickBallRootIntent, {
    kind: 'play-quick-ball',
    handIndex: 3,
    printing: 'Quick Ball FST'
  }, 'the existing Quick Ball root frontier should accept this exact owner hand when opted in');

  const candidateDeckTopAfterOpening = shuffledBySeat[FIXTURE.candidateSeat]
    .slice(FIXTURE.openingHandSize, FIXTURE.openingHandSize + 3);

  return {
    schema: 'agent49-v3-fixture-opening-hand-reconstruction-v1',
    fixtureOnly: true,
    admissionEligible: false,
    competitiveGameQualified: false,
    engineCommit: FIXTURE.engineCommit,
    seed: FIXTURE.seed,
    seed32,
    physicalRandomProtocol: 'xorshift32-physical-and-seat-policy-streams-v1',
    physicalRandomCalls,
    coinFlipResult,
    coinFlipWinnerSeat,
    candidateChoseFirst: FIXTURE.candidateChoseFirst,
    candidateSeat: FIXTURE.candidateSeat,
    opponentSeat: FIXTURE.opponentSeat,
    actualFirstPlayerSeat: FIXTURE.actualFirstPlayerSeat,
    candidateDeckGitBlobSha: FIXTURE.candidateGitBlobSha,
    fieldGitBlobSha: FIXTURE.fieldGitBlobSha,
    candidatePrinted60Sha256: FIXTURE.candidatePrinted60Sha256,
    opponentPrinted60Sha256: FIXTURE.opponentPrinted60Sha256,
    candidateOpeningHand: candidateOpening.map(serializableCard),
    candidateOpeningCounts: countsByFullName(candidateOpening),
    candidateOpeningBasicCount: candidateBasics.length,
    opponentOpeningHadBasic: opponentHasBasic,
    noMulliganRequired: candidateBasics.length > 0 && opponentHasBasic,
    candidateStartingPokemon: serializableCard(startingPokemon),
    candidatePostSetupHand: postSetupHand.map(serializableCard),
    candidateDeckTopAfterOpening: candidateDeckTopAfterOpening.map(serializableCard),
    quickBallRoot: {
      fixtureEnabled: false,
      enablingOption: 'quickBallRoot',
      existingFrontierIntent: quickBallRootIntent,
      duplicatePsychicEnergyPaymentCandidates: postSetupHand.filter(card =>
        card.fullName === 'Psychic Energy SVE').length,
      requiresOwnerBoundNativePaymentAndSearchContinuation: true
    },
    drawInterpretation:
      'The listed cards are the exact candidate deck order immediately after the opening seven. Later natural draws are not asserted: opponent actions can shuffle or otherwise change the candidate deck.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(reconstructFixture(), null, 2) + '\n');
}

module.exports = {
  FIXTURE,
  normalizeSeed32,
  seededRandom,
  deckPermutation,
  expandPrintedDeck,
  isBasicForFrozenFixture,
  reconstructFixture
};
