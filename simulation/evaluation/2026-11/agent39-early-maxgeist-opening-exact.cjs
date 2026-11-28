'use strict';
/*
 * Exact *restricted* turn-two Max Geist opening enumeration for fixed
 * Shadow Rider lists. No search except optional FSS -> Dimension Valley.
 * Seven-card mulligan conditioned, six hidden Prizes, own T1/T2 draws.
 */
const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
function fraction(n,d){
  if(d<=0n||n<0n)throw Error('invalid probability');
  const g=gcd(n,d);
  return {numerator:String(n/g),denominator:String(d/g)};
}
function numeric(f){return Number(f.numerator)/Number(f.denominator);}
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k))throw Error('noninteger binomial');
  if(k<0||n<k)return 0n;
  let x=1n;
  for(let j=1;j<=Math.min(k,n-k);j++)x=x*BigInt(n-j+1)/BigInt(j);
  return x;
}
function evaluate({
  v=4,vmax=4,psychic=11,dimensionValley=1,
  forestSealStone=1,startingBasics=14
}={}){
  const n=60,hand=7,prizes=6;
  // [V, VMAX, Psychic, Dimension Valley, Forest Seal Stone,
  //  other starting Basic, all remaining cards].
  const c=[v,vmax,psychic,dimensionValley,forestSealStone,
    startingBasics-v,n-(startingBasics+vmax+psychic+dimensionValley+forestSealStone)];
  if(c.some(x=>!Number.isSafeInteger(x)||x<0)||
      c.reduce((a,b)=>a+b,0)!==60||v<1)throw Error('invalid 60-card profile');
  const unseenAfterNine=n-hand-2; // 51, including 6 Prizes
  const prizeWays=choose(unseenAfterNine,prizes);
  const total=choose(n,hand)*BigInt(n-hand)*BigInt(n-hand-1);
  let valid=0n,direct=0n,searchT2=0n,searchT1=0n,profiles=0;
  function enumerate(i,left,initial,w){
    if(i===c.length-1){
      if(left>c[i])return;
      const seven=initial.concat(left);
      if(seven[0]+seven[5]===0)return; // actual starting Basic required
      const copies=w*choose(c[i],left);
      profiles++;
      for(let first=0;first<c.length;first++){
        const waysFirst=c[first]-seven[first];
        if(!waysFirst)continue;
        const eight=seven.slice();eight[first]++;
        for(let second=0;second<c.length;second++){
          const waysSecond=c[second]-eight[second];
          if(!waysSecond)continue;
          const nine=eight.slice();nine[second]++;
          const weight=copies*BigInt(waysFirst)*BigInt(waysSecond);
          valid+=weight;
          // V in initial seven can be put Active at setup. Attach exactly
          // one of two distinct hand Psychic on each of first two turns.
          const ready=seven[0]>=1&&eight[2]>=1&&nine[2]>=2&&nine[1]>=1;
          if(!ready)continue;
          if(nine[3]>=1){direct+=weight;continue;}
          if(nine[4]<1)continue;
          const unseenStadium=c[3]-nine[3];
          // all unseen Dimension Valley copies are Prized in
          // choose(51-k,6-k) out of choose(51,6) assignments.
          const possible=prizeWays-
            choose(unseenAfterNine-unseenStadium,prizes-unseenStadium);
          searchT2+=weight*possible;
          if(eight[4]>=1)searchT1+=weight*possible;
        }
      }
      return;
    }
    const rest=c.slice(i+1).reduce((a,b)=>a+b,0);
    for(let k=Math.max(0,left-rest);k<=Math.min(left,c[i]);k++)
      enumerate(i+1,left-k,initial.concat(k),w*choose(c[i],k));
  }
  enumerate(0,7,[],1n);
  if(valid===0n)throw Error('no valid opening');
  const pValid=fraction(valid,total);
  const pDirect=fraction(direct,valid);
  const pT2=fraction(direct*prizeWays+searchT2,valid*prizeWays);
  const pT1=fraction(direct*prizeWays+searchT1,valid*prizeWays);
  return {
    input:{v,vmax,psychic,dimensionValley,forestSealStone,startingBasics},
    eligibleInitialSevenProfiles:profiles,
    validOpeningSeven:pValid,directDimension:pDirect,
    dimensionOrForestT2:pT2,dimensionOrForestT1:pT1,
    percentages:{
      validOpeningSeven:100*numeric(pValid),
      directDimension:100*numeric(pDirect),
      dimensionOrForestT2:100*numeric(pT2),
      dimensionOrForestT1:100*numeric(pT1)
    }
  };
}
module.exports={evaluate,choose};
if(require.main===module){
  const profiles=[
    {},{v:3},{dimensionValley:2},{forestSealStone:2},
    {psychic:12},{dimensionValley:3},{dimensionValley:2,forestSealStone:2}
  ];
  console.log(JSON.stringify(profiles.map(evaluate),null,2));
}
