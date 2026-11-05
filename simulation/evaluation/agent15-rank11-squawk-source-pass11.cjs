'use strict';

const assert = require('node:assert/strict');
const {ROOT} = require('./agent15-rank11-quickball-source-pass11.cjs');

const VERSION = 'agent15-rank11-firstturn-squawk-source-pass11-v1';

/**
 * Exact probability of observing >=1 card from a finite special group
 * during a uniformly shuffled draw without replacement.
 * @param {number} population Remaining unknown-card population.
 * @param {number} targets Special-group cards in that population.
 * @param {number} cardsDrawn Number drawn before other plays.
 * @returns {number} Hypergeometric at-least-one probability.
 */
function hitProbability(population, targets, cardsDrawn) {
  assert.ok(Number.isSafeInteger(population) && population > 0);
  assert.ok(Number.isSafeInteger(targets) &&
    targets >= 0 && targets <= population);
  assert.ok(Number.isSafeInteger(cardsDrawn) &&
    cardsDrawn >= 0 && cardsDrawn <= population);
  let miss=1;
  for (let i=0;i<cardsDrawn;i++)
    miss *= (population-targets-i)/(population-i);
  return 1-Math.max(0,miss);
}

/**
 * This certificate only shows an unused first-own-turn source Ability's
 * printed eligibility and exact resource cost. The frozen native policy
 * passed instead. Hidden effects and Store implementation remain unaudited.
 * @param {object} original Authenticated original-rank11 full 60.
 * @param {object[]} pal Paldea Evolved print-specific card data.
 * @returns {object} Paper opportunity, not simulated strategic payoff.
 */
function certify(original, pal) {
  assert.equal(original.rank,11);
  assert.equal(original.cards.reduce((n,c)=>n+c.count,0),60);
  const owned=original.cards.find(c=>c.name==='Squawkabilly ex' &&
    c.printing.set==='PAL' && c.printing.number==='169');
  assert.equal(owned?.count,1);
  const printed=pal.find(c=>c.id==='sv2-169');
  assert.equal(printed?.name,'Squawkabilly ex');
  assert.ok(printed?.subtypes?.includes('Basic'));
  const ability=printed.abilities.find(a=>a.name==='Squawk and Seize');
  assert.match(ability?.text??'',/Once during your first turn/);
  assert.match(ability?.text??'',/discard your hand and draw 6 cards/);
  assert.equal(ROOT.id,'11:103:B:champion-reference');
  assert.equal(ROOT.seat,0);
  assert.equal(ROOT.turn,2);
  assert.equal(ROOT.firstPlayer,1);
  assert.equal(ROOT.passOrdinal,11);
  assert.ok(ROOT.boardPokemon.includes('Squawkabilly ex'));
  assert.deepEqual(ROOT.priorOwnerNonPrompt,
    [{ordinal:10,action:'PlayCardAction',card:'Darkness Energy'}]);
  assert.equal(ROOT.hand.length,4);
  assert.ok(ROOT.hand.includes('Garbodor BKP'));
  assert.ok(ROOT.hand.includes('Quick Ball FST'));
  assert.ok(ROOT.hand.includes('Dark Patch ASR'));
  assert.ok(ROOT.hand.includes('VS Seeker PHF'));
  const energy=original.cards.filter(c=>c.name==='Darkness Energy' &&
    c.category==='Energy').reduce((n,c)=>n+c.count,0);
  assert.equal(energy,8);
  assert.deepEqual(ROOT.attachedEnergy,['Darkness Energy']);
  const sixPrizes=6;
  const energyNotInKnownOwnerZones=energy-ROOT.attachedEnergy.length;
  const deckSize=60-sixPrizes-ROOT.hand.length-
    ROOT.boardPokemon.length-ROOT.attachedEnergy.length;
  assert.equal(deckSize,46);
  assert.equal(energyNotInKnownOwnerZones,7);
  const minimumEnergy=energyNotInKnownOwnerZones-sixPrizes;
  assert.equal(minimumEnergy,1);
  return {
    version:VERSION,sourceRegistration:ROOT.id,
    actualGlobalTurn:2,firstOwnerTurn:true,originalSourceSeat:0,
    archivedOwnerAction:'PassTurnAction',
    originalHand:ROOT.hand,
    activatedAbilityObserved:false,
    abilityPayment:'Discard all four current owner hand cards',
    handCardsStrategicallyProtected:[
      'VS Seeker PHF','Quick Ball FST','Dark Patch ASR','Garbodor BKP'
    ],
    printedOptionalDrawCount:6,
    energyAttachmentSpentBeforeOpportunity:true,
    unknownPrizes:sixPrizes,
    actualDeckCardCountIfNoOmittedZoneTransfers:deckSize,
    minimumDarknessEnergyInDeckByPrizeExclusion:minimumEnergy,
    lowerEnergyHitAmongSixIfNoDeckManipulation:
      hitProbability(deckSize,minimumEnergy,6),
    k0UnseenDeckAndPrizes:deckSize+sixPrizes,
    k0UnseenDarknessEnergy:energyNotInKnownOwnerZones,
    k0EnergyHitAmongSixIfUniformUnseenPermutation:
      hitProbability(deckSize+sixPrizes,energyNotInKnownOwnerZones,6),
    paperOpportunity:
      'Conditional: first owner turn, own Squawkabilly ex in play and unused Squawk and Seize, no visible ability lock; requires discard of entire four-card hand',
    importantLimitation:
      'No native Squawk and Seize Store play or draw, no card-quality assessment, no better-play assertion, no source attack, no opponent reply and no qualified competitive outcome.',
    qualifiedCompetitiveGames:0
  };
}

module.exports = {VERSION,hitProbability,certify};
