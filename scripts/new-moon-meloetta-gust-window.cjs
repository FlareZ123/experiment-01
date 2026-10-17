'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {choose,mulliganProbability}=require('./aichi_opening_audit.cjs');
const {loneBasicProbability,noExtraBasic}=require('./aichi_solo_start.cjs');
const {fixedWindow}=require('./aichi-meloetta-stone-pad-bridge.cjs');
const {assess}=require('./new-moon-meloetta-solo-stress.cjs');

/**
 * Exactly three designated non-Basic Items in Meloetta's 60:
 * Cologne, Escape Rope, Counter Catcher. Mandatory first draw follows
 * six inaccessible random Prizes and k elected opponent-mulligan bonuses.
 * @param {number} ownBasics Number of source rank26 Basic Pokémon.
 * @param {number} k Bonus draws accepted before mandatory draw, 0..46.
 * @returns {number}
 */
function directThreeItems(ownBasics,k) {
  if(!Number.isInteger(ownBasics)||ownBasics<1||ownBasics>57||
     !Number.isInteger(k)||k<0||k>46) {
    throw new RangeError('Invalid three-Item opening capacity');
  }
  const valid=choose(60,7)-choose(60-ownBasics,7);
  const missOpening=(choose(57,7)-choose(57-ownBasics,7))/valid;
  const missedDraws=choose(50,1+k)/choose(53,1+k);
  return 1-missOpening*missedDraws;
}

/**
 * Both sides' mutually exclusive mulligan rewards, separated into:
 * lone initial Klefki (no other Benched Basic) or initial Klefki and Bench.
 * This assumes all available other Basics are Benched at setup. Klefki
 * starting Active is a possible deliberate choice only when initially held.
 *
 * @param {string} root Repository root.
 * @returns {object}
 */
function gustWindow(root) {
  const src=assess(root);
  if(src.challengerBasics!==17||src.opponentBasics!==12) {
    throw new Error('Source Basic counts changed');
  }
  const deck=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'))
    .decks.find(d=>d.rank===26);
  const targets=['Canceling Cologne','Escape Rope','Counter Catcher'];
  for(const name of targets) {
    if(deck.cards.filter(c=>c.name===name).reduce((n,c)=>n+c.count,0)!==1)
      throw new Error('Source rank26 non-Basic one-of changed: '+name);
  }
  const pD=mulliganProbability(src.challengerBasics);
  const pA=mulliganProbability(src.opponentBasics);
  const q0=(1-pD)*(1-pA)/(1-pD*pA);
  const kInitial=7/60/(1-pD);
  const kSole7=loneBasicProbability(src.challengerBasics)/src.challengerBasics;
  const sum={initialKlefki:0,soleKlefki:0,klefkiWithBench:0,
    soleKlefkiDirectCologne:0,klefkiWithBenchDirectAnyThree:0};
  let mass=0;
  /** @param {number} weight @param {number} defenderBonus @param {number} attackerBonus */
  function step(weight,defenderBonus,attackerBonus) {
    const solo=kSole7*noExtraBasic(src.challengerBasics,Math.min(defenderBonus,47));
    const bench=kInitial-solo;
    mass+=weight;
    sum.initialKlefki+=weight*kInitial;
    sum.soleKlefki+=weight*solo;
    sum.klefkiWithBench+=weight*bench;
    sum.soleKlefkiDirectCologne+=weight*solo*
      fixedWindow(src.opponentBasics,Math.min(attackerBonus,46)).direct;
    sum.klefkiWithBenchDirectAnyThree+=weight*bench*
      directThreeItems(src.opponentBasics,Math.min(attackerBonus,46));
  }
  step(q0,0,0);
  for(let k=1;k<47;k++) {
    step(q0*pA**k,k,0);
    step(q0*pD**k,0,k);
  }
  step(q0*pA**47/(1-pA),47,0);
  step(q0*pD**47/(1-pD),0,46);
  if(Math.abs(mass-1)>1e-12||
     Math.abs(sum.soleKlefki-
       src.afterAllUsableOpponentMulliganBonuses.challengerSoloKlefki)>1e-12) {
    throw new Error('Mulligan branch partition or source comparison failed');
  }
  return {
    schema:'source-locked-newmoon-klefki-bench-gust-window-v1',
    challengerHash:src.challengerHash,
    sourceRank26OneOfItems:targets,
    assumption:'If held in opening seven, defender selects Klefki Active and Benches all other Basics obtained during setup.',
    qualifiedForCompetitiveInference:false,
    ...sum,
    conditionalThreeItemVisibilityGivenKlefkiWithBench:
      sum.klefkiWithBenchDirectAnyThree/sum.klefkiWithBench,
    conditionalCologneVisibilityGivenSoleKlefki:
      sum.soleKlefkiDirectCologne/sum.soleKlefki,
    inference:'Printed-item visibility and possible gust targets only. Counter Catcher requires Prize deficit created by self-KOs. Escape Rope requires opposing Bench. Active choice, item play, first-turn status and actual donk are unmodeled.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(gustWindow(path.resolve(__dirname,'..')),null,2)+'\n');
module.exports={directThreeItems,gustWindow};
