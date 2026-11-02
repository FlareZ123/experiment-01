'use strict';

/**
 * Exact counterfactual opening geometry for a going-second Wally (ROS 94)
 * evolving Benched Alolan Grimer into Alolan Muk, followed by Active Budew's
 * zero-Energy Itchy Pollen attack. This does not register a modified 60.
 *
 * Model: uniformly shuffled opening 7, six Prizes, one first-turn draw.
 * Keep actual Apex v0 counts for Budew (1), Grimer (2), Muk (2), basic
 * starters (12), and Grimer-tutoring Items (4 Mysterious Treasure, 3 Quick).
 * Sensitivity Wally 1..4 means replacing that many unspecified non-Basic
 * non-Grimer-tutor flex slots. It is NOT itself a physical deck proposal.
 * The player is going second. Ignore opponent disruption, extra draw,
 * the Item discard payment, Supporter retrieval, retreat/mobility, and
 * all real-game policy constraints unless explicitly required below.
 */
const assert = require('node:assert/strict');
const apex = require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');

/** @param {number} n @param {number} k @returns {number} */
function C(n,k) {
  if (k<0 || k>n) return 0;
  let y=1;
  for(let i=1;i<=Math.min(k,n-k);i++) y=y*(n-i+1)/i;
  return Math.round(y);
}

/** @param {number} wally @returns {object} */
function wallyRoute(wally) {
  assert.ok(Number.isInteger(wally) && wally>=0 && wally<=4);
  const count = id => apex.cards.find(c=>c.cardId===id)?.count ?? 0;
  const base={budew:count('me2pt5-16'),grimer:count('sm1-57'),
    muk:count('sm1-58'),tutors:count('sm6-113')+count('swsh8-237')};
  assert.deepEqual(base,{budew:1,grimer:2,muk:2,tutors:7});
  assert.equal(apex.total_cards,60);
  const physicalBasics=['me2pt5-16','sm1-57','swsh12-135','sm5-100',
    'sv6pt5-47','sv5-120','sm2-60','sv8-76'].reduce((s,id)=>s+count(id),0);
  assert.equal(physicalBasics,12);
  const n=[base.budew,base.grimer,base.muk,wally,base.tutors,
    60-base.budew-base.grimer-base.muk-wally-base.tutors];
  const denominator=C(60,8), prizesDenominator=C(52,6);
  const categories=Array(5).fill(0);
  let direct=0, tutorOnly=0;
  /**
   * @param {number} i
   * @param {number} left
   * @param {number} possibilities
   */
  function enumerate(i,left,possibilities){
    if(i<5){
      for(let x=0;x<=Math.min(left,n[i]);x++){
        categories[i]=x;
        enumerate(i+1,left-x,possibilities*C(n[i],x));
      }
      return;
    }
    if(left<0 || left>n[5])return;
    const [budew,grimer,muk,w,trainerTutor]=categories;
    if(!budew || !w || muk===base.muk)return;
    // Exactly one Budew is in the entire 60, must be opening Active.
    // It must occupy one of the first 7 positions, not the 8th draw.
    const mass=possibilities*C(n[5],left)/denominator*7/8;
    const mLeft=base.muk-muk;
    const allMukPrized=C(52-mLeft,6-mLeft)/prizesDenominator;
    if(grimer){
      // No need to play a Grimer search Item before Wally.
      direct+=mass*(1-allMukPrized);
    }else if(trainerTutor){
      // Every selected Item can search Grimer by printing, but must also
      // have a legal physically payable one-card discard and stay unlocked.
      const gLeft=base.grimer;
      const allGrimerPrized=C(52-gLeft,6-gLeft)/prizesDenominator;
      const bothAllPrized=C(52-mLeft-gLeft,6-mLeft-gLeft)/prizesDenominator;
      tutorOnly+=mass*(1-allMukPrized-allGrimerPrized+bothAllPrized);
    }
  }
  enumerate(0,8,1);
  const basicValid=1-C(48,7)/C(60,7);
  // Both events require the unique Budew in the actual opening seven;
  // therefore event => Basic-valid, and the division is legitimate.
  return {wally,direct,tutorOnly,combined:direct+tutorOnly,basicValid,
    directConditional:direct/basicValid,
    tutorConditional:tutorOnly/basicValid,
    combinedConditional:(direct+tutorOnly)/basicValid};
}

const expected=[
  [0,0,0],
  [1,0.0026431957770202564,0.00866085089224586],
  [2,0.005051274068315503,0.016508032188762831],
  [3,0.007241263823323539,0.02360399225496303],
  [4,0.009229252241267201,0.03000750694133129]
];
for(const [n,direct,combined] of expected){
  const x=wallyRoute(n);
  assert.ok(Math.abs(x.direct-direct)<1e-12, 'direct for Wally='+n);
  assert.ok(Math.abs(x.combined-combined)<1e-12,'tutor for Wally='+n);
  assert.ok(x.combined>=x.direct);
  console.log('Wally='+n,
    'direct actual-deal '+(100*x.direct).toFixed(9)+'%',
    'direct Basic-valid '+(100*x.directConditional).toFixed(9)+'%',
    'idealized Item access '+(100*x.combinedConditional).toFixed(9)+'%');
}
console.log('PASS: all five exact Wally-count sensitivities; zero games claimed.');
module.exports={wallyRoute,C};
