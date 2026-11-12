'use strict';

const CATEGORY_COUNTS = Object.freeze({
  // Exact 60-card counts from results/als/new-moon-lockbreak-60-candidate.md.
  gengar: 1,
  psychicEnergy: 6,
  fogCrystal: 4,
  otherBasics: 16,
  other: 33,
});
if (Object.values(CATEGORY_COUNTS).reduce((sum, count) => sum + count, 0) !== 60) {
  throw new Error('Candidate category counts must sum to exactly 60');
}
if (CATEGORY_COUNTS.gengar + CATEGORY_COUNTS.otherBasics !== 17) {
  throw new Error('Candidate opening-basic count must be exactly 17');
}

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  if (k === 0 || k === n) return 1n;
  let out = 1n;
  const m = Math.min(k, n - k);
  for (let i = 1; i <= m; i += 1) {
    out = (out * BigInt(n - m + i)) / BigInt(i);
  }
  return out;
}

function falling(n, r) {
  if (r < 0 || r > n) return 0n;
  let out = 1n;
  for (let i = 0; i < r; i += 1) out *= BigInt(n - i);
  return out;
}

function factorial(n) {
  let out = 1n;
  for (let i = 2; i <= n; i += 1) out *= BigInt(i);
  return out;
}

function multinomial(total, counts) {
  let out = factorial(total);
  for (const count of counts) out /= factorial(count);
  return out;
}

function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

function reduceFraction(numerator, denominator) {
  const d = gcd(numerator, denominator);
  return { numerator: (numerator / d).toString(), denominator: (denominator / d).toString() };
}

function percent(fraction) {
  return 100 * Number(BigInt(fraction.numerator)) / Number(BigInt(fraction.denominator));
}

function analyzeGengarHorrorHouseAccess({ draws = 1, allowFogCrystal = true } = {}) {
  if (![1, 2].includes(draws)) throw new RangeError('draws must be 1 or 2');
  const keys = Object.keys(CATEGORY_COUNTS);
  const N = CATEGORY_COUNTS;
  const total = choose(60, 6) * choose(54, 7) * falling(47, draws);
  let favorable = 0n;

  // Gengar is fixed in the seven-card opening hand (and therefore can be
  // selected as the starting Active). The six Prize cards are sampled first.
  for (let pE = 0; pE <= N.psychicEnergy; pE += 1) {
    for (let pF = 0; pF <= N.fogCrystal; pF += 1) {
      for (let pB = 0; pB <= N.otherBasics; pB += 1) {
        const pO = 6 - pE - pF - pB;
        if (pO < 0 || pO > N.other) continue;
        const prize = { psychicEnergy: pE, fogCrystal: pF, otherBasics: pB, other: pO };
        let prizeWays = 1n;
        for (const key of Object.keys(prize)) prizeWays *= choose(N[key], prize[key]);
        if (prizeWays === 0n) continue;
        const afterPrizes = Object.fromEntries(keys.map((key) => [key, N[key] - (key === 'gengar' ? 0 : prize[key])]));

        // Gengar occupies one of the seven opening-hand slots; choose the other six.
        for (let hE = 0; hE <= afterPrizes.psychicEnergy; hE += 1) {
          for (let hF = 0; hF <= afterPrizes.fogCrystal; hF += 1) {
            for (let hB = 0; hB <= afterPrizes.otherBasics; hB += 1) {
              const hO = 6 - hE - hF - hB;
              if (hO < 0 || hO > afterPrizes.other) continue;
              const hand = { psychicEnergy: hE, fogCrystal: hF, otherBasics: hB, other: hO };
              let handWays = 1n;
              for (const key of Object.keys(hand)) handWays *= choose(afterPrizes[key], hand[key]);
              if (handWays === 0n) continue;
              const remaining = Object.fromEntries(keys.map((key) => [key, afterPrizes[key] - (key === 'gengar' ? 1 : hand[key])]));

              // Count ordered draw sequences by category. This preserves exact
              // without-replacement probabilities for both one and two draws.
              for (let dE = 0; dE <= draws; dE += 1) {
                for (let dF = 0; dF <= draws - dE; dF += 1) {
                  for (let dB = 0; dB <= draws - dE - dF; dB += 1) {
                    const dO = draws - dE - dF - dB;
                    const draw = { psychicEnergy: dE, fogCrystal: dF, otherBasics: dB, other: dO };
                    let drawWays = 1n;
                    for (const key of Object.keys(draw)) drawWays *= falling(remaining[key], draw[key]);
                    drawWays *= multinomial(draws, Object.values(draw));
                    if (drawWays === 0n) continue;

                    const energySeen = hE + dE > 0;
                    const fogSeen = hF + dF > 0;
                    const energyRemainsOutsidePrizes = pE < N.psychicEnergy;
                    const energyAccessible = energySeen || (allowFogCrystal && fogSeen && energyRemainsOutsidePrizes);
                    if (energyAccessible) favorable += prizeWays * handWays * drawWays;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Gengar is a Basic, so its presence makes the opening seven legal.
  const legalSevenHands = choose(60, 7) - choose(43, 7);
  const conditionalNumerator = favorable * choose(60, 7);
  const conditionalDenominator = total * legalSevenHands;
  const probability = reduceFraction(conditionalNumerator, conditionalDenominator);

  return {
    draws,
    allowFogCrystal,
    condition: 'Gengar & Mimikyu-GX is in the opening seven and can be selected Active; at least one Psychic Energy is in hand/draw or (if allowed) searchable with Fog Crystal. Gengar search and switching into a later-drawn Gengar are excluded.',
    favorableSequences: favorable.toString(),
    totalSequences: total.toString(),
    legalSevenHands: legalSevenHands.toString(),
    probability,
    percent: percent(probability),
  };
}

function gengarInOpeningGivenLegalSeven() {
  const numerator = choose(59, 6);
  const denominator = choose(60, 7) - choose(43, 7);
  return reduceFraction(numerator, denominator);
}

module.exports = { analyzeGengarHorrorHouseAccess, gengarInOpeningGivenLegalSeven };

if (require.main === module) {
  const report = {
    gengarInOpeningGivenLegalSeven: gengarInOpeningGivenLegalSeven(),
    firstTurnSecondPlayerAbilityLockOnly: analyzeGengarHorrorHouseAccess({ draws: 1, allowFogCrystal: true }),
    firstTurnSecondPlayerItemLock: analyzeGengarHorrorHouseAccess({ draws: 1, allowFogCrystal: false }),
    secondTurnAbilityLockOnly: analyzeGengarHorrorHouseAccess({ draws: 2, allowFogCrystal: true }),
    secondTurnItemLock: analyzeGengarHorrorHouseAccess({ draws: 2, allowFogCrystal: false }),
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
