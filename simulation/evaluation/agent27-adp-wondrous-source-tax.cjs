'use strict';

const assert = require('node:assert/strict');
const sourceField = require('../../results/aichi-2026/full-decklists.json');
const candidate = require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const teamUp = require('../../resources/cards/en/sm9.json');
const guardians = require('../../resources/cards/en/sm2.json');
const cosmic = require('../../resources/cards/en/sm12.json');
const dragonEnergy = require('../../resources/cards/en/xy6.json');
const {choose} = require('./agent5-adp-paid-opening.cjs');

const ORIGINAL_RANKS = Object.freeze([6, 24, 29]);
const CANDIDATE_BASIC_COUNT = 7;
const VIRIDIAN_COUNT = 2;

/**
 * Verify all claimed printing identities, exact deck counts and card text
 * directly against the registered original 60s and bundled English corpus.
 * This identifies a conditional card-text restriction, not stadium frequency.
 * @returns {{sourceRanks:number[],sourceWondrousCopies:number[],
 * candidateViridian:number,candidateFieldBlower:number}}
 */
function verifyPrintedSource() {
  const card = (cards,id) => {
    const x=cards.find(c=>c.id===id);
    assert.ok(x, 'Missing source printing ' + id);
    return x;
  };
  const wondrous=card(teamUp,'sm9-158');
  assert.ok(wondrous.subtypes.includes('Stadium'));
  assert.ok(wondrous.subtypes.includes('Prism Star'));
  assert.match(wondrous.rules.join(' '),/attacks of non-Fairy Pokémon.*cost Colorless more/);
  assert.match(wondrous.rules.join(' '),
    /plays an Item or Supporter.*prevent all effects.*Stadium/);
  const viridian=card(teamUp,'sm9-156');
  assert.ok(viridian.subtypes.includes('Stadium'));
  assert.match(viridian.rules.join(' '),/Discard this card if another Stadium card comes into play/);
  const blower=card(guardians,'sm2-125');
  assert.ok(blower.subtypes.includes('Item'));
  assert.match(blower.rules.join(' '),/Stadium cards in play.*discard/);
  const adp=card(cosmic,'sm12-156');
  assert.ok(adp.types.includes('Dragon'));
  const gx=adp.attacks.find(a=>a.name==='Altered Creation-GX');
  assert.deepEqual(gx.cost,['Metal']);
  assert.match(gx.text,/at least 1 extra Water Energy attached.*in addition to this attack's cost/);
  const dde=card(dragonEnergy,'xy6-97');
  assert.match(dde.rules.join(' '),/provides every type of Energy.*provides only 2 Energy at a time/);
  for(const rank of ORIGINAL_RANKS) {
    const source=sourceField.decks.find(d=>d.rank===rank);
    assert.ok(source,'Missing original rank '+rank);
    assert.equal(source.cards.reduce((s,c)=>s+c.count,0),60);
    const stadium=source.cards.filter(x=>
      x.name.startsWith('Wondrous Labyrinth') &&
      x.printing?.set==='TEU' && String(x.printing?.number)==='158');
    assert.equal(stadium.length,1);
    assert.equal(stadium[0].count,1);
  }
  const counts=new Map(candidate.cards.map(x=>[x.id,x.count]));
  assert.equal(candidate.cards.reduce((s,c)=>s+c.count,0),60);
  assert.equal(counts.get('sm12-156'),2);
  assert.equal(counts.get('swsh12-135'),3);
  assert.equal(counts.get('sm2-60'),1);
  assert.equal(counts.get('swsh3-104'),1);
  assert.equal(counts.get('sm9-156'),VIRIDIAN_COUNT);
  assert.equal(counts.get('sm2-125'),2);
  assert.equal(counts.get('xy6-97'),4);
  return {sourceRanks:[...ORIGINAL_RANKS],sourceWondrousCopies:[1,1,1],
    candidateViridian:VIRIDIAN_COUNT,candidateFieldBlower:2};
}

/**
 * Deterministic conditional Energy-units screen for the paper GX attack.
 * The caller must separately prove actual attachments, card actions, timing,
 * optional extra-Energy identity, and whether Wondrous is genuinely in play.
 * Here, an attached DDE supplies exactly 2 units of all types on Dragon ADP.
 *
 * @param {object} state
 * @param {boolean} state.wondrousActive
 * @param {boolean} state.viridianPlayed
 * @param {boolean} state.fieldBlowerPlayed
 * @param {boolean} state.ddeAttached
 * @param {number} [state.extraAttachedEnergyUnits]
 * @returns {object}
 */
function conditionalAdpGxUnits({
  wondrousActive,viridianPlayed,fieldBlowerPlayed,ddeAttached,
  extraAttachedEnergyUnits=0
}) {
  for(const flag of [wondrousActive,viridianPlayed,fieldBlowerPlayed,ddeAttached])
    assert.equal(typeof flag,'boolean');
  assert.ok(Number.isSafeInteger(extraAttachedEnergyUnits)&&
    extraAttachedEnergyUnits>=0);
  const stadiumTaxStillActive=wondrousActive&&!viridianPlayed;
  const unitsToAnnounceGX=1+Number(stadiumTaxStillActive);
  const unitsForExtraWater=1;
  const availableEnergyUnits=Number(ddeAttached)*2+extraAttachedEnergyUnits;
  return {
    stadiumTaxStillActive,
    itemFieldBlowerCannotClearWondrous:stadiumTaxStillActive&&fieldBlowerPlayed,
    unitsToAnnounceGX,unitsForExtraWater,
    unitsForEnhancedGX:unitsToAnnounceGX+unitsForExtraWater,
    availableEnergyUnits,
    baseGXUnitPayable:ddeAttached&&availableEnergyUnits>=unitsToAnnounceGX,
    enhancedGXUnitPayable:ddeAttached&&
      availableEnergyUnits>=unitsToAnnounceGX+unitsForExtraWater,
    dependsOnUnverifiedAdditionalAttachments:extraAttachedEnergyUnits>0,
    outcomeType:'conditional-paper-card-text-energy-unit-screen',
    competitiveGamesQualified:0
  };
}

/**
 * If both printed Viridian Forest cards are in six face-down Prizes, no
 * Viridian replacement can originate from the opening hand or deck search.
 * Compute exactly conditional on a seven-Basic valid first-seven. We assume
 * original v2 physically contains seven starting Basics, two Viridian, 60.
 * This is NOT P(Wondrous active) nor P(no paid ADP GX route).
 *
 * @returns {{numerator:bigint,denominator:bigint,probability:number}}
 */
function exactDoubleViridianPrized() {
  const n=60,H=7,P=6,B=CANDIDATE_BASIC_COUNT,V=VIRIDIAN_COUNT;
  const valid=choose(n,H)-choose(n-B,H);
  const noViridianValid=choose(n-V,H)-choose(n-V-B,H);
  const numerator=noViridianValid*choose(P,V);
  const denominator=valid*choose(n-H,V);
  return {numerator,denominator,probability:Number(numerator)/Number(denominator)};
}

function main() {
  return {
    source:verifyPrintedSource(),
    noWondrous:conditionalAdpGxUnits({wondrousActive:false,
      viridianPlayed:false,fieldBlowerPlayed:false,ddeAttached:true}),
    lockedOneDDE:conditionalAdpGxUnits({wondrousActive:true,
      viridianPlayed:false,fieldBlowerPlayed:true,ddeAttached:true}),
    replacedByViridian:conditionalAdpGxUnits({wondrousActive:true,
      viridianPlayed:true,fieldBlowerPlayed:false,ddeAttached:true}),
    bothViridianInPrizesProbability:exactDoubleViridianPrized().probability,
    caveat:'Wondrous presence/turn timing, optional stadium access, Supporter/payment contention, hand, Bench, and any extra attachment require actual source-state evidence',
    competitiveGamesQualified:0
  };
}
module.exports={ORIGINAL_RANKS,CANDIDATE_BASIC_COUNT,VIRIDIAN_COUNT,
  verifyPrintedSource,conditionalAdpGxUnits,exactDoubleViridianPrized,main};
if(require.main===module) console.log(JSON.stringify(main(),null,2));
