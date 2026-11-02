'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {choose}=require('./aichi-opening-basics.cjs');

const VERSION='agent9-rank5-vip-crobat-genesect-exact-partition-v1';
const ROOT=path.resolve(__dirname,'..');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n){const t=a%b;a=b;b=t;}
  return a;
}

/**
 * Count k-subsets of n cards after ensuring at least one of each
 * remaining critical group survives. A missing group means zero.
 * @param {number} n
 * @param {number} k
 * @param {[number,number,number]} requiredCount Mew V, Genesect V, Mew VMAX.
 * @returns {bigint}
 */
function preserveGroups(n,k,requiredCount){
  if(requiredCount.some(x=>x<1))return 0n;
  let total=0n;
  for(let mask=0;mask<8;mask++){
    let removed=0,bits=0;
    for(let j=0;j<3;j++)if(mask&(1<<j)){
      removed+=requiredCount[j];
      bits++;
    }
    const ways=removed>k?0n:choose(n-removed,k-removed);
    total+=bits%2===0?ways:-ways;
  }
  return total;
}

/**
 * Exact random physical distribution:
 * (1) seven-card starting hand contains >=1 Mew V and no other Basic;
 * (2) set six uniformly random Prizes from the remaining 53 cards;
 * (3) draw one ordinary first-turn card;
 * (4) condition on at least one Battle VIP Pass in the first 8 hand cards;
 * (5) count only episodes where the postdraw owner deck retains >=1 each:
 *     Mew V, Mew VMAX, Crobat V and Genesect V.
 *
 * Presumes no opponent bonus/mulligan, prior owner search, Bench plays,
 * resource lock or alternative turn action. This is a conditional, first
 * owner-opportunity card-location model, never a match-win estimate.
 * @returns {object}
 */
function run(){
  const source=require(path.join(ROOT,'results/aichi-2026/full-decklists.json'))
    .decks.find(d=>d.rank===5);
  assert.equal(source?.archetype,'Mew Genesect');
  const count=name=>source.cards.find(c=>c.name===name)?.count??0;
  const [mew,vip,crobat,genesect,dedenne,clefairy,vmax]=[
    'Mew V','Battle VIP Pass','Crobat V','Genesect V',
    'Dedenne-GX',"Lillie's Clefairy ex",'Mew VMAX'].map(count);
  assert.deepEqual([mew,vip,crobat,genesect,dedenne,clefairy,vmax],
    [4,3,1,4,1,1,3]);
  assert.deepEqual(new Set(source.cards.filter(c=>c.category==='Pokémon')
    .map(c=>c.name)),new Set(['Mew V','Crobat V','Genesect V',
      'Dedenne-GX',"Lillie's Clefairy ex",'Mew VMAX']));
  assert.equal(source.cards.reduce((sum,c)=>sum+c.count,0),60);
  const other=60-mew-vip-crobat-genesect-dedenne-clefairy-vmax;
  assert.equal(other,43);

  // After the opening seven, any six Prize cards and then one draw are
  // jointly sampled from the remaining 53 cards. An already held VIP may
  // coexist with any of the 47 possible draws. Otherwise exactly one of
  // the three VIP cards must be the draw, leaving 52 prize-eligible cards.
  const complete=choose(60,7)*choose(53,6)*47n;
  let forcedMewOpening=0n,conditioned=0n,collision=0n;
  for(let m=1;m<=mew;m++){
    for(let v=0;v<=vip;v++){
      for(let x=0;x<=vmax;x++){
        const o=7-m-v-x;
        if(o<0||o>other)continue;
        const opener=choose(mew,m)*choose(vip,v)*
          choose(vmax,x)*choose(other,o);
        forcedMewOpening+=opener*choose(53,6)*47n;
        const needs=[mew-m,genesect,vmax-x];
        if(v>0){
          conditioned+=opener*choose(53,6)*47n;
          // Exclude the singleton Crobat from the seven post-opening
          // removals. Each seven-set corresponds to seven choices of
          // which removed card was the distinguished first-turn draw.
          collision+=opener*7n*preserveGroups(52,7,needs);
        }else{
          conditioned+=opener*BigInt(vip)*choose(52,6);
          // The first draw must be one of the three VIP cards and the
          // six Prizes must exclude Crobat and the distinguished VIP.
          collision+=opener*BigInt(vip)*preserveGroups(51,6,needs);
        }
      }
    }
  }
  assert.ok(collision>0n&&collision<conditioned&&conditioned<forcedMewOpening);
  const divisor=gcd(collision,conditioned);
  return {
    version:VERSION,sourceRank:5,originalSourceCount:29,
    sourcePrintings:{mew,vip,crobat,genesect,dedenne,clefairy,vmax,other},
    sampleSpace:{
      setupSeven:'Mew V is the only Basic species in opening seven; one Mew V becomes Active',
      prizeCount:6,firstTurnDraws:1,
      holdingVipByFirstTurn:true,
      criticalAllRetained:['Mew V','Mew VMAX','Crobat V','Genesect V']
    },
    probabilityForcedMewOnlyOpening:
      Number(forcedMewOpening)/Number(complete),
    probabilityJointForcedMewOpeningAndHeldVipByFirstTurn:
      Number(conditioned)/Number(complete),
    conditionalGenericVipTargetCollision:{
      numerator:(collision/divisor).toString(),
      denominator:(conditioned/divisor).toString(),
      probability:Number(collision)/Number(conditioned)
    },
    claim:'Card-location and generic-ranking opportunity only, not actual owner behavior or competitive game strength',
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,preserveGroups,run};
