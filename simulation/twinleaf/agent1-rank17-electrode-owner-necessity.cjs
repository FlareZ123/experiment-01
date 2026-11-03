'use strict';
const assert = require('node:assert/strict');

const VERSION = 'agent1-rank17-electrode-bomb-owner-necessary-v1';
const ENERGY_PRINTINGS = Object.freeze([
  'Reversal Energy PAL',
  'Counter Energy CIN',
  'Unit Energy LPM UPR'
]);
const PRINTED_CARDS = 5;

// Exact native printings from the authenticated original rank17 source.
// Electrode-GX and Gengar & Mimikyu-GX are excluded as printed Pokémon-GX.
// Scarlet & Violet Pokémon ex are mechanically distinct from BW/XY Pokémon-EX.
// This includes the source Squawkabilly ex as a potential recipient; the
// real native Ability prompt must still confirm legality and settlement.
const SOURCE_ELIGIBLE_RECIPIENT_PRINTINGS = Object.freeze([
  'Unown AOR','Voltorb ROS','Pikachu XY','Alolan Raichu UNM',
  'Squawkabilly ex PAL','Marshadow UNB','Klefki SVI',
  'Ditto Prism Star LOT'
]);

/**
 * Check a source-rank-17 Extra Energy Bomb -> Alolan Raichu line against
 * only the acting player's detached public board and public discard.
 * This is a necessary-conditions classifier, never a legality oracle or
 * an action selector. A positive result still requires live Ability-lock,
 * target, transfer, self-KO, Prize and opponent-response verification.
 *
 * Reversal/Counter/Unit Energy may provide multiple Energy UNITS, but
 * each physical card counts once. Under general number-shortage and E-20
 * rules, attaching 1-4 when fewer than 5 exist still triggers self-KO.
 *
 * @param {object} view Actual actorObservation for a source owner root.
 * @returns {object} Detached diagnostic with explicit qualification veto.
 */
function rank17ElectrodeBombNecessity(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic;
  assert.ok(own && Array.isArray(own.bench) &&
    Array.isArray(own.discard), 'Missing physical owner-public zones');
  const slots = [
    {position: 'active', index: 0, pokemon: own.active},
    ...own.bench.map((pokemon, index) =>
      ({position: 'bench', index, pokemon}))
  ].filter(row => row.pokemon !== null && row.pokemon !== undefined);
  const electrodes = slots.filter(row =>
    row.pokemon.name === 'Electrode-GX' &&
    row.pokemon.printing === 'Electrode-GX CES' &&
    row.pokemon.abilities?.includes('Extra Energy Bomb'));
  const raichus = slots.filter(row =>
    row.pokemon.name === 'Alolan Raichu' &&
    row.pokemon.printing === 'Alolan Raichu UNM');
  const sourceRecipientPrintings = new Set(SOURCE_ELIGIBLE_RECIPIENT_PRINTINGS);
  const sourceEligibleRecipients = slots.filter(row =>
    sourceRecipientPrintings.has(row.pokemon.printing));
  const energySet = new Set(ENERGY_PRINTINGS);
  const availableEnergyCards = own.discard.filter(printing =>
    energySet.has(printing));
  const energyByPrinting = Object.fromEntries(ENERGY_PRINTINGS.map(
    printing => [printing, availableEnergyCards.filter(p => p === printing).length]));
  const blockers = [];
  if(electrodes.length === 0) blockers.push('no-source-electrode-gx-in-play');
  if(availableEnergyCards.length === 0)
    blockers.push('no-discarded-energy-card-for-effective-transfer');
  if(raichus.length === 0)
    blockers.push('no-source-alolan-raichu-unm-recipient-in-play');
  const generalBombBlockers = [];
  if(electrodes.length === 0)
    generalBombBlockers.push('no-source-electrode-gx-in-play');
  if(availableEnergyCards.length === 0)
    generalBombBlockers.push('no-source-discarded-energy-card');
  if(sourceEligibleRecipients.length === 0)
    generalBombBlockers.push('no-source-non-gx-ex-recipient-in-play');

  // Report plausible public locks for human/native follow-up. Their full
  // applicability depends on other card effects, so this does not claim
  // paper illegality from a simplified lock-name search.
  const publicPokemon = [
    own.active, ...own.bench, view.opponentPublic?.active,
    ...(view.opponentPublic?.bench ?? [])
  ].filter(Boolean);
  const visibleAbilitySuppressionClues = [];
  if(publicPokemon.some(p => p.abilities?.includes('Garbotoxin') &&
      p.tools?.length > 0))
    visibleAbilitySuppressionClues.push('tool-equipped-garbotoxin');
  if(view.opponentPublic?.active?.abilities?.includes('Bide Barricade'))
    visibleAbilitySuppressionClues.push('opposing-active-bide-barricade');
  if(view.opponentPublic?.active?.abilities?.includes('Neutralizing Gas'))
    visibleAbilitySuppressionClues.push('opposing-active-neutralizing-gas');
  const stadiums = [...(own.stadium ?? []),
    ...(view.opponentPublic?.stadium ?? [])];
  if(stadiums.some(p => p.startsWith('Path to the Peak ')))
    visibleAbilitySuppressionClues.push('path-to-the-peak');

  return {
    version: VERSION, actorSeat: view.actorSeat,
    globalTurn: view.globalTurn,
    targetLine: 'Electrode-GX CES48 Extra Energy Bomb -> Alolan Raichu UNM57',
    electrodePositions: electrodes.map(({position,index,pokemon}) =>
      ({position,index,printing:pokemon.printing})),
    raichuPositions: raichus.map(({position,index,pokemon}) =>
      ({position,index,printing:pokemon.printing})),
    generalBombSourceRecipientPositions:
      sourceEligibleRecipients.map(({position,index,pokemon}) =>
        ({position,index,printing:pokemon.printing})),
    generalBombNecessaryConditionsMet:generalBombBlockers.length === 0,
    generalBombPhysicalBlockers:generalBombBlockers,
    physicalDiscardEnergyCards: availableEnergyCards.length,
    printedNominalEnergyCards: PRINTED_CARDS,
    maxPhysicalCardsTransferable: Math.min(PRINTED_CARDS,availableEnergyCards.length),
    fullFiveCardFundingAvailable: availableEnergyCards.length >= PRINTED_CARDS,
    discardedEnergyByPrinting: energyByPrinting,
    physicalNecessaryConditionsMet: blockers.length === 0,
    physicalBlockers: blockers,
    visibleAbilitySuppressionClues,
    paperLegality: 'UNVERIFIED',
    sourceAbilityDispatch: 'NOT_ATTEMPTED',
    fivePhysicalCardTransfersVerified: false,
    selfKnockoutAndOpponentPrizeVerified: false,
    consequentialOpponentReplyVerified: false,
    competitiveGameQualified: false
  };
}

module.exports = { VERSION, ENERGY_PRINTINGS, PRINTED_CARDS,
  SOURCE_ELIGIBLE_RECIPIENT_PRINTINGS,
  rank17ElectrodeBombNecessity };
