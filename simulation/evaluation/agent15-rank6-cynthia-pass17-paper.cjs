'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent15-rank6-cynthia-source-pass17-paper-frontier-v1';
const SOURCE_ROOT = Object.freeze({
  nativeAttempt: '6:101:B:champion-reference',
  sourceSeat: 0, candidateSeat: 1,
  actualFirstPlayer: 1, sourceTurn: 2, rootOrdinal: 17,
  sourcePhysicalDealSha256:
    '04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae',
  fullPhysicalDealSha256:
    '73366340afa6309d501589f80cf3fd732aebb7d0088d38e510781365f8384861',
  archivedRootLedgerSha256:
    'd8921fcb1ab313e09c8523488f328769fc971e106b7cfd3aae8d7c0ba3dab222',
  archivedPassObserverJsonSha256:
    '23631b6c2cb8c5a38957167579b1fdcbb6035543ced1665d0e8373ef56bfe73f',
  ownerHandSha256:
    '318da907caf72a808cddeb3b10638e73279cd6e2f795597f1561b9e5d1bec155',
  ownerPublicBoardSha256:
    '08398682b420b2c4e0376007c4862ae3f994710c66d3859816a763235b3a8bd3',
  // Both names and their order are copied from the original read-only
  // owner observation. This list never includes the opponent's hidden hand.
  sourceHand: Object.freeze([
    'Tag Call CEC', 'Tool Jammer BST', "Team Rocket's Handiwork FCO",
    'Cynthia & Caitlin CEC', 'Sidney FST 241',
    'Captivating Poké Puff STS'
  ]),
  sourceBoard: Object.freeze({
    active: 'Iron Thorns ex',
    bench: Object.freeze(['Iron Thorns ex']),
    attachedEnergy: Object.freeze([]),
    currentStadium: null
  }),
  // The first 17 accepted root actions include setup prompts and only the
  // opponent's turn-1 Psychic Energy PlayCardAction and PassTurnAction.
  ownerNonPromptRootsBeforePass: Object.freeze([]),
  opponentNonPromptRootsBeforePass: Object.freeze([
    Object.freeze({ordinal: 13, action: 'PlayCardAction', card: 'Psychic Energy'}),
    Object.freeze({ordinal: 14, action: 'PassTurnAction'})
  ])
});

/**
 * Uniformly shuffled draw (without replacement), conditional on a known
 * number of remaining Energy cards. This does not model future card choices.
 *
 * @param {number} deckCount Known remaining-card count.
 * @param {number} energyCount Known guaranteed minimum Energy count.
 * @param {number} drawCount Number of cards to draw.
 * @returns {number} Lower bound on hitting at least one Energy.
 */
function energyHitLowerBound(deckCount, energyCount, drawCount) {
  assert.ok(Number.isSafeInteger(deckCount) && deckCount > 0);
  assert.ok(Number.isSafeInteger(energyCount) && energyCount >= 0 &&
    energyCount <= deckCount);
  assert.ok(Number.isSafeInteger(drawCount) && drawCount >= 0 &&
    drawCount <= deckCount);
  let probabilityNone = 1;
  for (let i = 0; i < drawCount; i++)
    probabilityNone *= (deckCount - energyCount - i) / (deckCount - i);
  return 1 - Math.max(0, probabilityNone);
}

/**
 * Pure paper-necessary-opportunity certificate. Caller must independently
 * verify that the archived prefix contains no owner discard / Lost Zone
 * movement and that no additional lock, quota, or rule-changing effect
 * prevents the Supporter. Does not issue an action or certify a native game.
 *
 * @param {object} sourceDeck Full 60 source object from printed inventory.
 * @param {object[]} cardText Exact set/card-number print objects.
 * @returns {object} Reproducible narrow owner-visible frontier.
 */
function certify(sourceDeck, cardText) {
  assert.equal(sourceDeck.rank, 6);
  assert.equal(sourceDeck.cards.reduce((n,c)=>n+c.count,0),60);
  const printed = sourceDeck.cards.find(c=>
    c.name==='Cynthia & Caitlin' && c.printing.set==='CEC' &&
    c.printing.number==='189');
  assert.equal(printed?.count,1);
  const cc = cardText.find(c=>c.id==='sm12-189');
  assert.equal(cc?.name,'Cynthia & Caitlin');
  assert.ok(cc.subtypes.includes('Supporter'));
  assert.ok(cc.rules.some(x=>/you may discard another card from your hand/i.test(x)));
  assert.ok(cc.rules.some(x=>/draw 3 cards/i.test(x)));
  assert.equal(SOURCE_ROOT.sourceHand.length,6);
  assert.equal(createHash('sha256').update(JSON.stringify(
    SOURCE_ROOT.sourceHand)).digest('hex'),SOURCE_ROOT.ownerHandSha256);
  assert.ok(SOURCE_ROOT.sourceHand.includes('Cynthia & Caitlin CEC'));
  assert.ok(SOURCE_ROOT.sourceHand.includes('Tool Jammer BST'));
  assert.equal(SOURCE_ROOT.ownerNonPromptRootsBeforePass.length,0);
  assert.equal(SOURCE_ROOT.actualFirstPlayer,1);
  assert.equal(SOURCE_ROOT.sourceTurn,2);
  const energyCount=sourceDeck.cards.filter(c=>c.category==='Energy')
    .reduce((sum,c)=>sum+c.count,0);
  const basics=sourceDeck.cards.filter(c=>c.category==='Pokémon')
    .reduce((sum,c)=>sum+c.count,0);
  assert.equal(energyCount,8);
  assert.equal(basics,4);
  assert.ok(sourceDeck.cards.filter(c=>c.category==='Pokémon')
    .every(c=>c.name==='Iron Thorns ex'));
  assert.equal(SOURCE_ROOT.sourceBoard.active,'Iron Thorns ex');
  assert.deepEqual(SOURCE_ROOT.sourceBoard.bench,['Iron Thorns ex']);
  assert.equal(SOURCE_ROOT.sourceBoard.attachedEnergy.length,0);
  const handEnergy=SOURCE_ROOT.sourceHand.filter(x=>/Energy/.test(x)).length;
  assert.equal(handEnergy,0);
  const prizeCount=6;
  const boardCardCount=1+SOURCE_ROOT.sourceBoard.bench.length;
  const remainingDeck=60-prizeCount-boardCardCount-
    SOURCE_ROOT.sourceHand.length;
  const lowerEnergy=energyCount-prizeCount-handEnergy-
    SOURCE_ROOT.sourceBoard.attachedEnergy.length;
  const unknownPool=remainingDeck+prizeCount;
  const printedSpeed=sourceDeck.cards.filter(c=>
    c.name==='Speed Lightning Energy')
    .reduce((total,c)=>total+c.count,0);
  assert.equal(printedSpeed,4);
  assert.equal(remainingDeck,46);
  assert.equal(lowerEnergy,2);
  return {
    version: VERSION,
    sourceRoot:SOURCE_ROOT.nativeAttempt,
    sourceTurn:SOURCE_ROOT.sourceTurn, sourcePhysicalSeat:0,
    sourceHandSha256:SOURCE_ROOT.ownerHandSha256,
    originalSourceDeckCount:60, originalSourceEnergyCount:8,
    sourceObservedHandCount:6, sourceObservedBoardPokemon:2,
    sixUnseenPrizeSlots:prizeCount,
    deckCardsByPublicConservationIfNoPriorCardZoneLoss:remainingDeck,
    guaranteedMinimumEnergyInDeckIfNoPriorCardZoneLoss:lowerEnergy,
    conditionalThreeCardEnergyHitLowerBound:
      energyHitLowerBound(remainingDeck,lowerEnergy,3),
    k0UnknownDeckPlusPrizePool:unknownPool,
    k0UnconditionalAnySpecialEnergyHitProbability:
      energyHitLowerBound(unknownPool,energyCount,3),
    k0UnconditionalSpeedLightningHitProbability:
      energyHitLowerBound(unknownPool,printedSpeed,3),
    k0DistributionAssumption:
      'Uniform uninspected prize/deck permutation conditional on the observed hand and in-play cards; no source search or selective sampling before this first owner turn',
    card:'Cynthia & Caitlin CEC 189',
    possibleAnotherCardToDiscard:'Tool Jammer BST',
    printedIndependentDiscardDraw3:true,
    sourcePassReached:17,
    sourcePriorNonPromptPlayCount:0,
    nativeStoreCynthiaPlayObserved:false,
    nativeDrawResolutionObserved:false,
    competitiveGamesQualified:0,
    paperLegalityVerdict:
      'CONDITIONAL-YES: turn-2 Supporter can discard another held card and draw 3, absent unobserved prohibitions',
    limits:'Only owner-visible printed-prerequisite and zone-count inference; full source deck/discard before pass, hidden-information isolation, native Store payment/prompt settlement, tactical preference and opponent reply require independent audit.'
  };
}

module.exports={VERSION,SOURCE_ROOT,energyHitLowerBound,certify};
