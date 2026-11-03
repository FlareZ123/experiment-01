'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {attackerLockFirstEight}=
  require('../simulation/evaluation/agent2-alchemy-attacker-lock-joint-first8.cjs');

/** @param {number} seed @returns {()=>number} */
function random(seed){
  let x=seed>>>0;
  return ()=>{ x=(Math.imul(1664525,x)+1013904223)>>>0; return x/4294967296; };
}

/**
 * Shuffle distinct physical slots, place seven in initial hand, six as face
 * down Prizes, and draw the next card. Independent positional Monte Carlo
 * check of the exact finite-population enumerator. No decisions or cost
 * payments are simulated.
 * @param {{shake:number,quick:number,seed:number,trials:number}} cfg
 * @returns {{valid:number,muk:number,positioned:number,broad:number,budewOnlyUnpositioned:number}}
 */
function simulate({shake,quick,seed,trials}){
  const pop=[2,2,shake,4,quick,1,4,5,36];
  const deck=pop.flatMap((n,k)=>Array(n).fill(k));
  assert.equal(deck.length,60);
  const rng=random(seed);
  const tallies={valid:0,muk:0,positioned:0,broad:0,budewOnlyUnpositioned:0};
  const isBasic=x=>x===0||x===5||x===6||x===7;
  for(let round=0;round<trials;round++){
    for(let i=59;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    const seven=deck.slice(0,7);
    if(!seven.some(isBasic))continue;
    tallies.valid++;
    const first8=seven.concat(deck[13]);
    const cnt=k=>first8.filter(x=>x===k).length;
    const g=cnt(0),m=cnt(1),s=cnt(2),t=cnt(3),q=cnt(4),
      b=cnt(5),v=cnt(6);
    const prizes=deck.slice(7,13);
    const remaining=k=>pop[k]-cnt(k)-prizes.filter(x=>x===k).length;
    const otherStarter=seven.some(x=>x===5||x===6||x===7);
    const conn=t+q;
    const muk=otherStarter&&s>0&&remaining(1)>0&&
      (g>0||(conn>0&&remaining(0)>0));
    const regi=v>0||(conn>0&&remaining(6)>0);
    const mReg=muk&&regi&&(g>0||v>0||conn>=2);
    const bReg=(b>0||(q>0&&remaining(5)>0))&&regi&&
      (b>0||v>0||(q>0&&conn>=2));
    const bActiveReg=seven.includes(5)&&regi;
    const broad=mReg||bReg,positioned=mReg||bActiveReg;
    tallies.muk+=Number(mReg);
    tallies.positioned+=Number(positioned);
    tallies.broad+=Number(broad);
    tallies.budewOnlyUnpositioned+=Number(broad&&!positioned);
  }
  return tallies;
}

test('independent physical first-seven, six-Prize, next-draw sample validates geometry reversal',()=>{
  const sampleCount=200000;
  const outcomes=[];
  for(const cfg of [
    {shake:3,quick:3,seed:20261102,trials:sampleCount},
    {shake:4,quick:2,seed:20261103,trials:sampleCount}
  ]){
    const expected=attackerLockFirstEight(cfg).conditional;
    const out=simulate(cfg);
    for(const [key,metric] of [
      ['muk','mukWithRegidrago'],
      ['positioned','positionedEitherLockWithRegidrago'],
      ['broad','eitherLockWithRegidrago'],
      ['budewOnlyUnpositioned','unpositionedBudewOnlyAccessWithRegidrago']
    ]){
      const observed=out[key]/out.valid;
      assert.ok(Math.abs(observed-expected[metric])<0.004,
        key+' physical sample versus exact model '+observed+' versus '+expected[metric]);
    }
    outcomes.push({label:cfg.shake===3?'v0':'v1',valid:out.valid,
      positionallyPossible:out.positioned/out.valid,
      broadButBudewUnpositioned:out.budewOnlyUnpositioned/out.valid});
  }
  assert.ok(outcomes[0].positionallyPossible<outcomes[1].positionallyPossible,
    'Observed independently sampled positioned ordering reversed');
  console.log('Independent physical deal geometry',JSON.stringify(outcomes));
});
