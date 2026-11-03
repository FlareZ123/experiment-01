'use strict';

const { choose } = require('./agent11-thorns-first-volt-access.cjs');

/**
 * Enumerate one natural Trainers' Mail top-four rescue on the original
 * four-Iron-Thorns opening. All Prizes and eight-card hands are physical.
 * Trainer's Mail may find a deck G&H; a Tag Call when G&H remains in deck;
 * or a missing Thunder Mountain directly if DCE is already held.
 * Both first-Mail and all-held-Mail optional sequential peeks are measured.
 * On a missed top-four peek the player may select no Trainer, shuffle, then
 * try another held Mail. Each independent redraw again samples a 46-card deck.
 * No extra draw, mulligan bonus, or other search is modeled.
 *
 * @param {1|3} d Double Colorless Energy copies
 * @param {2|3|4} mailCopies Trainers' Mail copies
 * @returns {{denominator:bigint,base:bigint,mailRescue:bigint,total:bigint,allHeldMailNumerator:bigint,allHeldMailDenominator:bigint,allHeldMailRescueNumerator:bigint}}
 */
function singleMailAccess(d, mailCopies) {
  const rest = 51 - d - mailCopies;
  const topFourWays = choose(46, 4);
  const maxPeekScale = topFourWays ** BigInt(mailCopies - 1);
  const fullPeekScale = topFourWays ** BigInt(mailCopies);
  let denominator = 0n;
  let base = 0n;
  let mailRescue = 0n;
  let allHeldMailRescueNumerator = 0n;
  for (let b = 1; b <= 4; b++) {
    const startWeight = b === 1 ? 7n : 8n;
    for (let tag = 0; tag <= 2; tag++) {
      for (let gh = 0; gh <= 2; gh++) {
        for (let mountain = 0; mountain <= 1; mountain++) {
          for (let energy = 0; energy <= d; energy++) {
            for (let mail = 0; mail <= mailCopies; mail++) {
              const otherHand = 8 - b - tag - gh - mountain - energy - mail;
              if (otherHand < 0 || otherHand > rest) continue;
              const handWays = startWeight * choose(4,b) * choose(2,tag)
                * choose(2,gh) * choose(1,mountain) * choose(d,energy)
                * choose(mailCopies,mail) * choose(rest,otherHand);
              const otherRemaining = 4-b + mailCopies-mail + rest-otherHand;
              for (let pt = 0; pt <= 2-tag; pt++) {
                for (let pg = 0; pg <= 2-gh; pg++) {
                  for (let pm = 0; pm <= 1-mountain; pm++) {
                    for (let pe = 0; pe <= d-energy; pe++) {
                      const otherPrize = 6 - pt - pg - pm - pe;
                      if (otherPrize < 0 || otherPrize > otherRemaining) continue;
                      const ways = handWays * choose(2-tag,pt) * choose(2-gh,pg)
                        * choose(1-mountain,pm) * choose(d-energy,pe)
                        * choose(otherRemaining,otherPrize);
                      denominator += ways * topFourWays;
                      const mountainAvailable = mountain > 0 || pm === 0;
                      const energyAvailable = energy > 0 || d-energy-pe > 0;
                      if (!mountainAvailable || !energyAvailable) continue;
                      const ghDeck = 2-gh-pg;
                      const tagDeck = 2-tag-pt;
                      const ready = (mountain > 0 && energy > 0)
                        || gh > 0 || (tag > 0 && ghDeck > 0);
                      if (ready) {
                        base += ways * topFourWays;
                        continue;
                      }
                      if (mail === 0) continue;
                      const goodTopCards = (ghDeck > 0 ? ghDeck + tagDeck : 0)
                        + (energy > 0 && mountain === 0 ? 1-pm : 0);
                      const misses = choose(46-goodTopCards, 4);
                      mailRescue += ways * (topFourWays - misses);
                      allHeldMailRescueNumerator += ways * (
                        fullPeekScale - misses ** BigInt(mail) *
                        topFourWays ** BigInt(mailCopies - mail)
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return {
    denominator, base, mailRescue, total:base+mailRescue,
    allHeldMailNumerator: base * maxPeekScale + allHeldMailRescueNumerator,
    allHeldMailDenominator: denominator * maxPeekScale,
    allHeldMailRescueNumerator
  };
}

module.exports = { singleMailAccess };
