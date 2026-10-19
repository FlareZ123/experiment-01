'use strict';

const { choose } = require('./ditto-direct-path-frontier.cjs');

/**
 * Exact restricted physical-route frontier for 30C Ditto:
 * 4 Ditto, 4 Tag Call, 4 Guzma & Hala, target Stage-2 copies,
 * Double Colorless copies, Glimwood copies, Stealthy Hood copies,
 * other Basic copies, and filler to total 60.
 *
 * The initial 7 must have a Ditto; six Prizes are then placed; the
 * eighth observed card is the natural first draw going second.
 *
 * The event requires G&H already among the eight or Tag Call among
 * the eight with G&H still in the deck; a Stage-2 target in deck
 * after the draw; and each of DCE/Glimwood/Hood somewhere other
 * than the six Prizes. This is a resource-visibility upper bound,
 * not an executable game policy or a statement about win rate.
 *
 * @param {{otherBasics:number,targetCopies:number,energyCopies:number,stadiumCopies:number,toolCopies:number}} settings
 * @returns {{legalOpening:number,resourceVisibility:number,idealOneReroll:number}}
 */
function dittoResourceFrontier(settings) {
  const { otherBasics, targetCopies, energyCopies, stadiumCopies, toolCopies } = settings;
  const sizes = [4, 4, 4, targetCopies, energyCopies, stadiumCopies, toolCopies, otherBasics];
  if (sizes.some(n => !Number.isInteger(n) || n < 0) ||
      targetCopies < 1 || targetCopies > 4 ||
      energyCopies < 1 || energyCopies > 4 ||
      stadiumCopies < 1 || stadiumCopies > 4 ||
      toolCopies < 1 || toolCopies > 4 ||
      otherBasics > 48 ||
      sizes.reduce((a, n) => a + n, 0) > 60) {
    throw new RangeError('Invalid disjoint copy counts for 60-card Expanded list');
  }
  sizes.push(60 - sizes.reduce((a, n) => a + n, 0));
  const initial = Array(9).fill(0);
  const prized = Array(9).fill(0);
  const handDenominator = choose(60, 7);
  const prizeDenominator = choose(53, 6);
  let favorableCombinations = 0;

  /** @param {number} classIndex @param {number} slotsLeft @param {number} ways @param {number} handWays */
  function assignPrizes(classIndex, slotsLeft, ways, handWays) {
    if (classIndex === 8) {
      const left = sizes[8] - initial[8];
      if (slotsLeft > left) return;
      prized[8] = slotsLeft;
      const totalWays = handWays * ways * choose(left, slotsLeft);
      const remaining = sizes.map((n, i) => n - initial[i] - prized[i]);

      // No Stage 2 left to search after setup, or an entire resource
      // category resides among inaccessible face-down Prize cards.
      if (remaining[3] === 0 ||
          sizes[4] === prized[4] ||
          sizes[5] === prized[5] ||
          sizes[6] === prized[6]) return;

      let favorableOrdinaryDraws = 0;
      for (let drawClass = 0; drawClass < 9; drawClass += 1) {
        const drawWeight = remaining[drawClass];
        if (!drawWeight ||
            remaining[3] - Number(drawClass === 3) < 1) continue;

        const supporterSeen = initial[2] > 0 || drawClass === 2;
        const tagSeen = initial[1] > 0 || drawClass === 1;
        const supporterInDeck = remaining[2] - Number(drawClass === 2) > 0;
        if (supporterSeen || (tagSeen && supporterInDeck)) {
          favorableOrdinaryDraws += drawWeight;
        }
      }
      favorableCombinations += totalWays * favorableOrdinaryDraws;
      return;
    }
    const available = sizes[classIndex] - initial[classIndex];
    for (let amount = 0; amount <= Math.min(slotsLeft, available); amount += 1) {
      prized[classIndex] = amount;
      assignPrizes(
        classIndex + 1, slotsLeft - amount,
        ways * choose(available, amount), handWays
      );
    }
  }

  /** @param {number} classIndex @param {number} slotsLeft @param {number} ways */
  function assignOpening(classIndex, slotsLeft, ways) {
    if (classIndex === 8) {
      if (slotsLeft > sizes[8] || initial[0] < 1) return;
      initial[8] = slotsLeft;
      assignPrizes(0, 6, 1, ways * choose(sizes[8], slotsLeft));
      return;
    }
    for (let amount = 0; amount <= Math.min(slotsLeft, sizes[classIndex]); amount += 1) {
      initial[classIndex] = amount;
      assignOpening(classIndex + 1, slotsLeft - amount,
        ways * choose(sizes[classIndex], amount));
    }
  }

  assignOpening(0, 7, 1);
  const legalOpening = 1 - choose(56 - otherBasics, 7) / handDenominator;
  const resourceVisibility = favorableCombinations /
    (handDenominator * prizeDenominator * 47 * legalOpening);
  return {
    legalOpening,
    resourceVisibility,
    idealOneReroll: resourceVisibility * 0.75
  };
}

module.exports = { dittoResourceFrontier };
