'use strict';

const {choose,fraction,plus,minus,times,over,format}=
  require('./attack-tool-removal-access.cjs');

/** @typedef {{numerator:bigint,denominator:bigint}} Fraction */
/**
 * Valid first-seven event for a 60-card list with exactly n Basic Pokémon.
 * @param {number} basics
 * @returns {Fraction}
 */
function openingValid(basics) {
  return minus(fraction(1),fraction(choose(60-basics,7),choose(60,7)));
}

/**
 * Joint probability of a Basic-valid opening seven and seeing none of a
 * designated m-card NON-BASIC set among starting seven plus mandatory draw.
 * Six random Prizes are implicitly integrated by initial exchangeability.
 * @param {number} basics
 * @param {number} m
 * @returns {Fraction}
 */
function legalWithNoneSeen(basics,m) {
  return times(fraction(choose(60-m,8),choose(60,8)),
    minus(fraction(1),fraction(choose(60-m-basics,7),choose(60-m,7))));
}

/**
 * Conditional first-eight probability of at least one of m non-Basic cards.
 * @param {number} basics
 * @param {number} m
 * @returns {Fraction}
 */
function seenGivenOpening(basics,m) {
  return over(minus(openingValid(basics),
    legalWithNoneSeen(basics,m)),openingValid(basics));
}

/**
 * Conditional joint probability of one singleton Supporter removal and
 * at least one of four Stadium cards in first eight, with 17 Basic Pokémon.
 * Both target groups are disjoint and exclusively non-Basic.
 * @returns {Fraction}
 */
function fabaAndStadium() {
  const v=openingValid(17);
  const numerator=plus(minus(minus(v,
    legalWithNoneSeen(17,1)),legalWithNoneSeen(17,4)),
    legalWithNoneSeen(17,5));
  return over(numerator,v);
}

/**
 * Two-Blower vs one-Blower-and-one-Faba direct-visibility comparison
 * after a valid opening seven and one mandatory draw.
 * @returns {object}
 */
function toolSupporterOpportunities() {
  const one=seenGivenOpening(17,1),either=seenGivenOpening(17,2);
  return {
    fieldBlowerOriginal: either,
    fabaSingle: one,
    blowerSingle: one,
    fabaOrBlower: either,
    both: minus(plus(one,one),either),
    fabaAndStadium: fabaAndStadium()
  };
}
if(require.main===module) {
  for(const [k,v] of Object.entries(toolSupporterOpportunities()))
    process.stdout.write(k+': '+format(v)+'\n');
}
module.exports={openingValid,legalWithNoneSeen,seenGivenOpening,
  fabaAndStadium,toolSupporterOpportunities};
