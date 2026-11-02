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

/**
 * Adds one Tapu Lele-GX GRI60 (Wonder Tag searches Supporter from deck)
 * and the one Battle Compressor PHF92 + three VS Seeker PHF109 route.
 * The original Apex v0 has exactly these four connector cards. Suppressed
 * Basic Abilities invalidate Wonder Tag; Item lock invalidates Compressor
 * and VS Seeker. Both restrictions are intentionally omitted from these
 * permissive hand/Prize screens and must be applied before game use.
 *
 * Path priority is mutually exclusive and physical:
 *  1. Wally already held; 2. Lele held, Wally survives Prize in deck;
 *  3. Compressor+VS held, Wally survives Prize in deck.
 * Grimer held avoids tutor; otherwise one Mysterious Treasure/Quick Ball
 * is needed and an unprized Grimer must be searchable.
 *
 * @param {number} wally
 * @returns {{wally:number,basicValid:number,unconditional:object,conditional:object}}
 */
function wallyConnectorRoute(wally){
  assert.ok(Number.isInteger(wally) && wally>=0 && wally<=4);
  const get=id=>apex.cards.find(c=>c.cardId===id)?.count??0;
  assert.equal(get('sm2-60'),1); // physical Tapu Lele-GX GRI60
  assert.equal(get('xy4-92'),1); // physical Battle Compressor PHF92
  assert.equal(get('xy4-109'),3); // physical VS Seeker PHF109
  const n=[1,2,2,wally,1,1,3,7,60-(1+2+2+wally+1+1+3+7)];
  const prefix=Array(8).fill(0);
  const results={
    held_direct:0,held_grimer_tutor:0,
    lele_direct:0,lele_grimer_tutor:0,
    compressor_direct:0,compressor_grimer_tutor:0
  };
  const denominator=C(60,8), prizeDenom=C(52,6);
  /** @param {number[]} remaining */
  function survive(remaining){
    let out=0;
    // inclusion-exclusion for each required category:
    // at least one of each remains after six Prizes and searches.
    for(let mask=0;mask<(1<<remaining.length);mask++){
      let k=0,bits=0;
      for(let j=0;j<remaining.length;j++){
        if((mask>>j)&1){k+=remaining[j];bits++;}
      }
      out+=(bits%2?-1:1)*C(52-k,6-k)/prizeDenom;
    }
    return out;
  }
  /** @param {number} i @param {number} left @param {number} possibilities */
  function enumerate(i,left,possibilities){
    if(i<8){
      for(let x=0;x<=Math.min(n[i],left);x++){
        prefix[i]=x;
        enumerate(i+1,left-x,possibilities*C(n[i],x));
      }
      return;
    }
    if(left<0 || left>n[8])return;
    const [budew,grimer,muk,wallyHeld,lele,compressor,vsSeeker,tutors]=prefix;
    if(budew!==1 || muk===2 || (grimer===0 && !tutors))return;
    const mass=possibilities*C(n[8],left)/denominator*7/8;
    let path,remaining=[2-muk];
    if(wallyHeld)path='held';
    else if(lele){path='lele';remaining.push(wally-wallyHeld);}
    else if(compressor&&vsSeeker){path='compressor';remaining.push(wally-wallyHeld);}
    else return;
    if(grimer===0)remaining.push(2);
    const suffix=grimer?'direct':'grimer_tutor';
    results[path+'_'+suffix]+=mass*survive(remaining);
  }
  enumerate(0,8,1);
  const basicValid=1-C(48,7)/C(60,7);
  return {wally,basicValid,unconditional:results,
    conditional:Object.fromEntries(Object.entries(results)
      .map(([k,v])=>[k,v/basicValid]))};
}

for (const [w,held,lele,compressor,total] of [
  [1,0.010700951999879162,0.008567289437568318,0.002090782056933673,0.021359023494381155],
  [2,0.020396570990798244,0.00866661980326338,0.002148628214462922,0.031211819008524553],
  [3,0.029164015322330643,0.007904559111050334,0.001991339663593221,0.03905991409697421],
  [4,0.03707590575225337,0.007124194766447887,0.0018241589328581195,0.04602425945155939]
]){
  const x=wallyConnectorRoute(w);
  const sum=(prefix)=>Object.entries(x.conditional)
    .filter(([k])=>k.startsWith(prefix)).reduce((s,[,v])=>s+v,0);
  const a=sum('held'),b=sum('lele'),c=sum('compressor');
  assert.ok(Math.abs(a-held)<1e-12,'held Wally '+w);
  assert.ok(Math.abs(b-lele)<1e-12,'Lele route '+w);
  assert.ok(Math.abs(c-compressor)<1e-12,'Compressor+VS route '+w);
  assert.ok(Math.abs(a+b+c-total)<1e-12,'total Wally connectors '+w);
  console.log('Wally='+w,'Base '+(100*a).toFixed(8)+'%',
    'Lele addition '+(100*b).toFixed(8)+'%',
    'Compressor+VS addition '+(100*c).toFixed(8)+'%',
    'Full conditional '+(100*(a+b+c)).toFixed(8)+'%');
}
console.log('PASS: exact extra Wally connector states including double/three-way Prize survival.');

module.exports={wallyRoute,wallyConnectorRoute,C};
