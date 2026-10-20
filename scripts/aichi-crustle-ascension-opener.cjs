'use strict';

const assert = require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    value = (value * BigInt(n - Math.min(k, n - k) + i)) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function ratio(numerator, denominator) {
  assert.ok(denominator > 0n);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: String(numerator / divisor),
    denominator: String(denominator / divisor),
    decimal: Number(numerator) / Number(denominator)
  };
}

/**
 * Exact multivariate hypergeometric count before any optional mulligan bonus.
 * Opening hand of handSize is dealt before six Prizes. The subsequent draw
 * may be sampled before the Prizes by exchangeability. Dwebble must be in the
 * opening hand, Grass must occur in opening+draw, and at least one Crustle
 * must remain in the deck after the Prizes are set.
 *
 * Other Basic Pokémon (Mimikyu here) count toward legal openers but do not
 * satisfy the Dwebble requirement. Other contains all remaining printings.
 * This screens a resource combination, not an executed or legal attack.
 *
 * @param {{size:number,handSize:number,prizes:number,dwebble:number,otherBasics:number,grass:number,crustle:number}} spec
 */
function exactAscensionResourceScreen(spec) {
  const {size,handSize,prizes,dwebble,otherBasics,grass,crustle} = spec;
  for (const value of Object.values(spec)) assert.ok(Number.isSafeInteger(value) && value >= 0);
  assert.ok(size > handSize + prizes && handSize >= 1);
  const other = size - dwebble - otherBasics - grass - crustle;
  assert.ok(dwebble >= 1 && other >= 0);
  const slots = [dwebble,otherBasics,grass,crustle,other];
  const waysHand = choose(size,handSize);
  const prizePool = size - handSize - 1;
  const waysPrize = choose(prizePool,prizes);
  const drawSlots = size - handSize;
  const totalDeals = waysHand * BigInt(drawSlots) * waysPrize;
  const basicFreeHands = choose(size - dwebble - otherBasics,handSize);
  const validHandWays = waysHand - basicFreeHands;
  let favorable = 0n;
  for (let d = 1; d <= Math.min(dwebble,handSize); d++) {
    for (let m = 0; m <= Math.min(otherBasics,handSize-d); m++) {
      for (let g = 0; g <= Math.min(grass,handSize-d-m); g++) {
        for (let c = 0; c <= Math.min(crustle,handSize-d-m-g); c++) {
          const o = handSize-d-m-g-c;
          if (o > other) continue;
          const drawn = [d,m,g,c,o];
          const waysSpecificHand = slots.reduce((product,count,i) =>
            product * choose(count,drawn[i]),1n);
          for (let classIndex = 0; classIndex < slots.length; classIndex++) {
            const drawnEighth = slots[classIndex] - drawn[classIndex];
            if (drawnEighth === 0) continue;
            if (g === 0 && classIndex !== 2) continue;
            const unexposedCrustle = crustle-c-(classIndex === 3 ? 1 : 0);
            if (unexposedCrustle < 1) continue;
            const waysAllCrustlePrized = unexposedCrustle <= prizes ?
              choose(prizePool-unexposedCrustle,prizes-unexposedCrustle) : 0n;
            favorable += waysSpecificHand * BigInt(drawnEighth) *
              (waysPrize - waysAllCrustlePrized);
          }
        }
      }
    }
  }
  return {
    schema:'crustle-dwebble-grass-source-independent-exact-v1',
    spec,
    initialLegalHandProbability:ratio(validHandWays,waysHand),
    expectedInitialMulligans:ratio(basicFreeHands,validHandWays),
    directAscensionResourcesUnconditional:ratio(favorable,totalDeals),
    directAscensionResourcesGivenValidHand:ratio(favorable,
      validHandWays*BigInt(drawSlots)*waysPrize),
    unmodeled:[
      'actual starter seat and opponent setup',
      'opponent optional bonus cards and mulligan tempo',
      'Item/attack locks and opponent Stadium',
      'opponent active damage and board pressure',
      'subsequent Double Colorless Energy access and Temple conflict',
      'trainer use, policy, physical Japanese legality and clock'
    ]
  };
}

const candidateSpec = Object.freeze({
  size:60,handSize:7,prizes:6,dwebble:4,otherBasics:3,grass:5,crustle:4
});

if (require.main === module) {
  process.stdout.write(JSON.stringify(exactAscensionResourceScreen(candidateSpec),null,2)+'\n');
}
module.exports = {choose,ratio,exactAscensionResourceScreen,candidateSpec};
