'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  publicPrizeTrainerPrerequisite
} = require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');

const fixture = JSON.parse(fs.readFileSync(path.resolve(
  __dirname,'../results/aichi-2026/fixtures/agent9-rank5-turn16-public-owner-offer-v1.json'
), 'utf8'));

/** @returns {object} Actual original-source owner and public opponent root. */
function originalOwnerView() {
  const owner = fixture.owner;
  return {
    decisionKind: 'owner-root',
    actorSeat: owner.seat,
    globalTurn: owner.turn,
    ownHand: owner.hand,
    ownPublic: {prizeCount: owner.prizesRemaining},
    opponentPublic: {prizeCount: owner.opponentPrizesRemaining}
  };
}

/** @param {string} printing @returns {boolean[]} Actual native offers for held copies. */
function nativeOffers(printing) {
  return fixture.nativeOffers
    .filter(row => row[0] === printing)
    .map(row => row[1]);
}

test('authentic original-source identity and full physical A/B/A equality', () => {
  assert.equal(fixture.schema, 'agent9-rank5-turn16-original-owner-public-fixture-v1');
  assert.equal(fixture.physical.seed, 465442104);
  assert.deepEqual(fixture.physical.rankBySeat, [11,5]);
  assert.equal(fixture.physical.matchedAllThree, true);
  assert.equal(fixture.physical.duplicateControlsEqual, true);
  assert.equal(fixture.physical.dealSha256,
    '27ca31d2d51f0dcb4513dbc7627c1e970d93440dfe30cda5b4cfa6ab4d0d4835');
  assert.equal(fixture.source.vendor,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(fixture.owner.rootActionOrdinal, 60);
  assert.equal(fixture.owner.hand.length, 14);
  assert.equal(fixture.owner.hand[9], 'Special Red Card M4');
  assert.equal(fixture.owner.hand[13], "Trainers' Mail ROS");
  assert.equal(fixture.owner.deckCount, 38);
});

test('Japanese M4-072 opponent-Prize necessity vetoes a native-offered dead Item', () => {
  assert.deepEqual(nativeOffers('Special Red Card M4'), [true]);
  const row = {handIndex:9,printing:'Special Red Card M4',type:'Item'};
  const result = publicPrizeTrainerPrerequisite(originalOwnerView(), row);
  assert.equal(result.knownPrintedPrerequisite, true);
  assert.equal(result.exactSourceCardId, 'jp/M4/72');
  assert.equal(result.observedOpponentPrizeCount, 6);
  assert.equal(result.blocked, true);
  assert.equal(result.paperPlayable, false);
  assert.equal(result.reason, 'public-prize-prerequisite-failed');
});

test('omitted owner Mail is actually Store accepted and live prompt settled', () => {
  assert.deepEqual(nativeOffers("Trainers' Mail ROS"), [false]);
  const receipt = fixture.treatment;
  assert.equal(receipt.printing, "Trainers' Mail ROS");
  assert.equal(receipt.handIndex, 13);
  assert.equal(receipt.storeAccepted, true);
  assert.equal(receipt.ownerPromptAccepted, true);
  assert.equal(receipt.cardSettledInHand, true);
  assert.equal(receipt.promptChosen, 'Float Stone BKT');
  assert.equal(receipt.eligibleOtherTrainerLowerBound, 17);
  assert.equal(fixture.control.ownerTurn18Card, 'Crobat V');
  assert.equal(receipt.ownerTurn18Root, 'PassTurnAction');
  assert.equal(receipt.opponentNextRoot, 'PassTurnAction');
  assert.equal(fixture.limits.paperGameQualified, false);
  assert.equal(fixture.limits.competitivelyQualifiedGames, 0);
});

test('Quick Ball hand-thinning alone cannot activate either draw engine', () => {
  assert.equal(fixture.owner.hand.filter(x => x === 'Quick Ball FST').length, 2);
  assert.equal(fixture.owner.bench.length,1);
  const firstBallBenchHand = fixture.owner.hand.length - 2 + 1 - 1;
  const secondBallBenchHand = firstBallBenchHand - 2 + 1 - 1;
  assert.equal(firstBallBenchHand, 12);
  assert.equal(secondBallBenchHand, 10);
  assert.ok(firstBallBenchHand > 2, 'Genesect V + Mew V Fusion Strike count');
  assert.ok(secondBallBenchHand > 6, 'Crobat V Dark Asset max hand');
});
