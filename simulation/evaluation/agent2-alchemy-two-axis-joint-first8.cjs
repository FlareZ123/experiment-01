'use strict';
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){if(k<0||k>n)return 0n;const r=Math.min(k,n-k);let v=1n;for(let i=1;i<=r;i++)v=v*BigInt(n-r+i)/BigInt(i);return v;}
/**
 * Exact joint opening-eight and six-Prize card opportunities in the
 * registered Apex Alchemy 3 Shake / 3 Quick and 4 Shake / 2 Quick 60s.
 * @param {{shake:number,quick:number}} options
 * @returns {{basicValidInitialSeven:number,conditional:Record<string,number>,exactCounts:Record<string,string>,denominator:string}}
 */
function jointOpeningOpportunities({shake,quick}){
 if(!((shake===3&&quick===3)||(shake===4&&quick===2)))throw new RangeError('Unregistered swap');
 const population=[2,2,shake,4,quick,1,9,36], denominator=choose(60,8)*choose(52,6)*8n;
 const names=['valid','muk','budew','either','both','compatibleBoth','quickContendedBoth','mukOnly','budewOnly','neither','directGrimerMuk','searchedGrimerMuk','directBudew','searchedBudew'];
 /** @type {Record<string,bigint>} */
 const count=Object.fromEntries(names.map(k=>[k,0n])), seen=Array(8).fill(0);
 /** @param {bigint} p */
 function inspect(p){
  const [g,m,s,t,q,b,o]=seen,lg=2-g,lm=2-m,lb=1-b,rest=52-lg-lm-lb;
  for(let draw=0;draw<8;draw++){
   if(!seen[draw])continue;
   const startingBasics=g+b+o-([0,5,6].includes(draw)?1:0);
   if(startingBasics===0)continue;
   const nonGrimerStarter=b+o-([5,6].includes(draw)?1:0)>0;
   const ordered=p*BigInt(seen[draw]);
   for(let pg=0;pg<=lg;pg++)for(let pm=0;pm<=lm;pm++)for(let pb=0;pb<=lb;pb++){
    const pr=6-pg-pm-pb;if(pr<0||pr>rest)continue;
    const w=ordered*choose(lg,pg)*choose(lm,pm)*choose(lb,pb)*choose(rest,pr);
    const M=nonGrimerStarter&&s>0&&lm>pm&&(g>0||((t>0||q>0)&&lg>pg));
    const B=b>0||(q>0&&lb>pb);
    count.valid+=w;
    if(M){count.muk+=w;count[g>0?'directGrimerMuk':'searchedGrimerMuk']+=w;}
    if(B){count.budew+=w;count[b>0?'directBudew':'searchedBudew']+=w;}
    if(M||B)count.either+=w;
    if(M&&B){count.both+=w;const conflict=g===0&&t===0&&b===0&&q===1;count[conflict?'quickContendedBoth':'compatibleBoth']+=w;}
    else if(M)count.mukOnly+=w;
    else if(B)count.budewOnly+=w;
    else count.neither+=w;
   }
  }
 }
 /** @param {number} i @param {number} left @param {bigint} w */
 function walk(i,left,w){
  if(i===7){if(left<=population[i]){seen[i]=left;inspect(w*choose(population[i],left));}return;}
  for(let n=0;n<=Math.min(population[i],left);n++){seen[i]=n;walk(i+1,left-n,w*choose(population[i],n));}
 }
 walk(0,8,1n);
 return {basicValidInitialSeven:Number(count.valid)/Number(denominator),
  conditional:Object.fromEntries(names.filter(k=>k!=='valid').map(k=>[k,Number(count[k])/Number(count.valid)])),
  exactCounts:Object.fromEntries(names.map(k=>[k,count[k].toString()])),denominator:denominator.toString()};
}
if(require.main===module)process.stdout.write(JSON.stringify({v0:jointOpeningOpportunities({shake:3,quick:3}),v1:jointOpeningOpportunities({shake:4,quick:2})},null,2)+'\n');
module.exports={choose,jointOpeningOpportunities};
