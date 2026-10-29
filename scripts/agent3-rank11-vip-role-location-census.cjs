'use strict';
const assert=require('node:assert/strict');
const {combination}=require('./agent3-rank11-vip-k1-combinatorics.cjs');

/**
 * Exact rank11 source first-eight hand/Prize/remaining-deck role census.
 * Seven opening, six Prize, one first-turn draw. Conditions on Basic-valid 7.
 * @returns {{valid:bigint,qualified:bigint,roleSeen:object}}
 */
function exactRoleLocationProfile(){
  const categories=[['vip',4],['trubbish',2],['garbodor',2],
    ['mega',3],['otherBasic',6],['other',43]];
  let states=new Map([['0:0:0:0:0:0:0:0:0',1n]]);
  for(const [name,n] of categories){
    const next=new Map();
    for(const [key,ways] of states){
      const [H,P,D,B,V,T,U,M,G]=key.split(':').map(Number);
      for(let h=0;h<=Math.min(n,7-H);h++)
        for(let p=0;p<=Math.min(n-h,6-P);p++)
          for(let d=0;d<=Math.min(n-h-p,1-D);d++){
            const out=[H+h,P+p,D+d,
              Number(Boolean(B||(['trubbish','mega','otherBasic'].includes(name)&&h>0))),
              Number(Boolean(V||(name==='vip'&&h+d>0))),
              Number(Boolean(T||(name==='trubbish'&&h+d>0))),
              Number(Boolean(U||(name==='trubbish'&&n-h-p-d>0))),
              Number(Boolean(M||(name==='mega'&&h+d>0))),
              Number(Boolean(G||(name==='garbodor'&&p<n)))].join(':');
            const multiplicity=ways*combination(n,h)*combination(n-h,p)*
              combination(n-h-p,d);
            next.set(out,(next.get(out)??0n)+multiplicity);
          }
    }
    states=next;
  }
  let valid=0n,qualified=0n;
  const roleSeen={neither:0n,megaOnly:0n,trubbishOnly:0n,both:0n};
  for(const [key,ways] of states){
    const [H,P,D,B,V,T,U,M,G]=key.split(':').map(Number);
    if(H!==7||P!==6||D!==1||!B)continue;
    valid+=ways;
    if(!V||!U||!G)continue;
    qualified+=ways;
    roleSeen[T?(M?'both':'trubbishOnly'):(M?'megaOnly':'neither')]+=ways;
  }
  assert.equal(qualified,
    Object.values(roleSeen).reduce((sum,n)=>sum+n,0n));
  return {valid,qualified,roleSeen,
    conditionalAmongVipWindows:Object.fromEntries(
      Object.entries(roleSeen).map(([name,n])=>[name,Number(n)/Number(qualified)]))};
}
if(require.main===module){
  process.stdout.write(JSON.stringify(exactRoleLocationProfile(),
    (key,value)=>typeof value==='bigint'?value.toString():value,null,2)+'\n');
}
module.exports={exactRoleLocationProfile};
