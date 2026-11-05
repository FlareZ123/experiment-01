'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent32-source-special-energy-exposure.cjs');
const {routeGivenHand}=require('./agent32-rank6-thunder-dce-resource-gate.cjs');
const VERSION='agent32-rank6-five-dci-tiers-mulligan-v1';
const TIERS=Object.freeze([0,7,19,30,38]);
const PATHS=Object.freeze(['direct','heldGuzmaHala','viaTagCall']);

/**
 * Evaluate one paid-resource tier on 8+m grouped observed source cards.
 * Exchangeability weights the first seven containing a Basic correctly.
 * @param {number} permitted Eligible source discard copies, out of 50.
 * @param {number} m Source-elected bonus cards after a Basic-valid seven.
 */
function stratum(permitted,m){
  assert.ok(Number.isSafeInteger(permitted)&&permitted>=0&&permitted<=50);
  assert.ok(Number.isSafeInteger(m)&&m>=0&&m<=46);
  const n=8+m;
  const denominator=choose(60,n)*
    (1-choose(56,7)/choose(60,7));
  const result={direct:0,heldGuzmaHala:0,viaTagCall:0};
  for(let b=1;b<=Math.min(4,n);b++){
    const validSeven=1-choose(n-b,7)/choose(n,7);
    for(let g=0;g<=2;g++)
      for(let t=0;t<=2;t++)
        for(let s=0;s<=1;s++)
          for(let d=0;d<=1;d++){
            const taken=b+g+t+s+d;
            const lo=Math.max(0,n-taken-(50-permitted));
            const hi=Math.min(permitted,n-taken);
            for(let trash=lo;trash<=hi;trash++){
              const other=n-taken-trash;
              if(other<0||other>50-permitted)continue;
              if(d===0&&trash<2)continue;
              const mode=s&&d?'direct':g?'heldGuzmaHala':
                t?'viaTagCall':null;
              if(!mode)continue;
              const prizeSafe=routeGivenHand([b,g,t,s,d,trash+other],
                60-n,6,2);
              const ways=choose(4,b)*choose(2,g)*choose(2,t)*
                choose(1,s)*choose(1,d)*choose(permitted,trash)*
                choose(50-permitted,other);
              result[mode]+=ways*validSeven*prizeSafe/denominator;
            }
          }
  }
  return result;
}

/**
 * Sum the geometric, simultaneous-mulligan-corrected source bonus mixture.
 * The omitted tail is an unconditional upper bound for every tier.
 * @param {number} permitted Static eligible discard copies.
 * @param {number} opponentBasics Fixed contender 60-card Basic count.
 * @param {number} [maxBonus=30] Number of positive bonuses enumerated.
 */
function evaluate(permitted,opponentBasics,maxBonus=30){
  assert.ok(Number.isSafeInteger(opponentBasics)&&
    opponentBasics>0&&opponentBasics<=60);
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0&&maxBonus<=46);
  const qs=choose(56,7)/choose(60,7);
  const qc=choose(60-opponentBasics,7)/choose(60,7);
  const p=qc*(1-qs)/(1-qs*qc);
  const byPath={direct:0,heldGuzmaHala:0,viaTagCall:0};
  const add=(mass,row)=>PATHS.forEach(k=>byPath[k]+=mass*row[k]);
  add(1-p,stratum(permitted,0));
  for(let m=1;m<=maxBonus;m++)
    add(p*(1-qc)*qc**(m-1),stratum(permitted,m));
  const lower=PATHS.reduce((sum,k)=>sum+byPath[k],0);
  const tail=p*qc**maxBonus;
  return {permitted,opponentBasics,byPath,lower,upper:lower+tail,tail,
    competitivelyQualifiedGames:0};
}

function main(){
  const roster=require('../../results/aichi-2026/full-decklists.json');
  const base=require('../twinleaf/rank6-expanded-opening-coverage.cjs')
    .rank6Groups(roster);
  assert.equal(roster.published_deck_count,29);
  assert.deepEqual([base.thorns,base.thunder,base.dce,
    base.guzmaHala,base.tagCall,base.discards,base.other],
    [4,1,1,2,2,7,43]);
  return {version:VERSION,sourceRank:6,baselineSourceGroups:base,
    staticDiscardTierCounts:TIERS,rows:TIERS.map(permitted=>{
      const vsSeven=evaluate(permitted,7);
      const vsFourteen=evaluate(permitted,14);
      return {permitted,vsSeven,vsFourteen,
        sevenMinusFourteen:vsSeven.lower-vsFourteen.lower};
    }),scope:'Static discard-acceptance assumptions; original source fixed, source Basic-valid initial seven, full elected opponent mulligan bonus, one normal draw and six Prizes. No actual policy, attack or win claim.',
    competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,TIERS,PATHS,stratum,evaluate,main};
