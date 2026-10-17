'use strict';

/**
 * Exact, source-count-constrained visibility of Stealthy Hood and existing
 * Adventure Bag in a legal seven-card New Moon opener plus the first normal
 * draw. The opponent's optional mulligan bonus draws are excluded.
 *
 * This computes card access, never a playable attack or paper-rule proof.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n<0 ||
      k<0 || k>n) return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++) {
    result=result*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/** @param {bigint} a @param {bigint} b @returns {{numerator:bigint,denominator:bigint}} */
function fraction(a,b) {
  if(b<=0n || a<0n || a>b)throw new RangeError('Invalid probability fraction');
  const d=gcd(a,b);
  return {numerator:a/d,denominator:b/d};
}

/**
 * Direct visibility of k specified non-Basic cards in first seven plus
 * the mandatory first-turn draw, conditional on at least one of 17 Basics
 * in the starting seven. Six Prize cards are exchangeable and do not
 * alter the marginal distribution of the eighth physical card.
 *
 * @param {number} k Target non-Basic count
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function direct(k) {
  if(!Number.isInteger(k)||k<0||k>43)throw new RangeError('k must be in [0,43]');
  const total=60,basics=17,opening=7,unseen=total-opening;
  let legal=0n,absent=0n;
  for(let b=1;b<=opening;b++) {
    legal+=choose(basics,b)*choose(total-basics,opening-b)*BigInt(unseen);
    absent+=choose(basics,b)*choose(total-basics-k,opening-b)*
      BigInt(unseen-k);
  }
  return fraction(legal-absent,legal);
}

/** @returns {{numerator:bigint,denominator:bigint}} */
function hoodWithAdventureBag() {
  // 2 Hoods + 1 Adventure Bag, all non-Basic.
  // For Bag seen but no Hood seen, both unseen Hoods would have to
  // occupy the six Prizes to defeat Bag's restricted deck search.
  const two=direct(2);
  const three=direct(3);
  const prizedBoth=fraction(choose(6,2),choose(52,2));
  const numerator=two.numerator*three.denominator*prizedBoth.denominator+
    (three.numerator*two.denominator-two.numerator*three.denominator)*
      (prizedBoth.denominator-prizedBoth.numerator);
  const denominator=two.denominator*three.denominator*prizedBoth.denominator;
  return fraction(numerator,denominator);
}

/** @param {{numerator:bigint,denominator:bigint}} value */
function show(value) {
  return {exact:value.numerator+'/'+value.denominator,
    probability:Number(value.numerator)/Number(value.denominator)};
}

function run() {
  return {
    schema:'new-moon-stealthy-hood-bag-legal-seven-then-one-draw-v1',
    assumptions:{
      deckSize:60,startingHand:7,basicPokemon:17,prizeCount:6,
      turnDraws:1,hoodCopies:2,adventureBagCopies:1,
      bonusMulliganDraws:0,legalHandCondition:'at least one Basic in opening seven'
    },
    directOne:show(direct(1)), directTwo:show(direct(2)),
    directThree:show(direct(3)), directFour:show(direct(4)),
    hoodWithExistingAdventureBag:show(hoodWithAdventureBag()),
    interpretation:'Hood or its existing Adventure Bag is physically accessible with a nonprized Hood to search; this ignores Item lock, Tool slot contention, discard costs, attacked Pokemon availability and legal turn sequencing.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={choose,direct,hoodWithAdventureBag,run};
