'use strict';
const assert=require('node:assert/strict');

// Exact original rank-6 60: Iron Thorns Basic, DCE, Tag Call, Plumeria,
// Speed Lightning, singleton Thunder Mountain and other cards.
const keys=['basic','dce','tag','plumeria','speed','thunder','other'];
const counts=[4,1,2,4,4,1,44];
const combination=(n,k)=>{
  if(k<0||k>n)return 0n;
  let r=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    r=r*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  return r;
};
const valid7=combination(60,7)-combination(56,7);

/**
 * Exact valid-seven source opening plus one first-turn draw, with six
 * independently shuffled Prizes. No opponent mulligan bonus.
 * @param {(x:Record<string,number>)=>boolean} test
 * @param {boolean} [thunderPrized]
 */
function count(test,thunderPrized=false){
  let numerator=0n;
  function visit(i,remaining,chosen,weight){
    if(i<counts.length){
      for(let n=0;n<=Math.min(remaining,counts[i]);n++){
        chosen[i]=n;
        visit(i+1,remaining-n,chosen,
          weight*combination(counts[i],n));
      }
      return;
    }
    if(remaining||!chosen[0]||(thunderPrized&&chosen[5]))return;
    for(let j=0;j<counts.length;j++){
      if(thunderPrized&&j===5)continue;
      const left=counts[j]-chosen[j];
      if(!left)continue;
      const final=Object.fromEntries(keys.map((k,index)=>
        [k,chosen[index]+Number(index===j)]));
      if(test(final))numerator+=weight*BigInt(left)*
        (thunderPrized?6n:1n);
    }
  }
  visit(0,7,[],1n);
  return {numerator,denominator:valid7*53n*(thunderPrized?52n:1n)};
}
const predicates={
  dce:x=>x.dce===1,
  speed:x=>x.speed>0,
  dceTag:x=>x.dce===1&&x.tag>0,
  dceSpeed:x=>x.dce===1&&x.speed>0,
  dceTagPlumeria2:x=>x.dce===1&&x.tag>0&&x.plumeria>=2
};
function run(){
  assert.equal(counts.reduce((a,b)=>a+b),60);
  const cases=Object.entries(predicates).map(([name,test])=>[name,count(test)]);
  cases.push(['dceTagPlumeria2ThunderPrized',
    count(predicates.dceTagPlumeria2,true)]);
  cases.push(['dceTagThunderPrized',count(predicates.dceTag,true)]);
  return {schema:'rank6-original-exact-first-turn-opening-v1',
    validSeven:valid7.toString(),allSeven:combination(60,7).toString(),
    assumptions:'First seven must contain Basic; one turn-start draw after six random Prizes; no opponent mulligan bonus draws',
    results:cases.map(([name,x])=>({name,
      numerator:x.numerator.toString(),
      denominator:x.denominator.toString(),
      percent:100*Number(x.numerator)/Number(x.denominator)})),
    qualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={combination,valid7,count,predicates,run};
