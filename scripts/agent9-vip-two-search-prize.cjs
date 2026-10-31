'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {choose, percent, run: sourceCensus, FIELD_RANKS, openingCohold} =
  require('./agent9-crobat-vip-cohold.cjs');

const VERSION = 'agent9-vip-two-basics-prize-physical-window-v1';

/**
 * Conditional on a Basic-valid initial hand, count the exact probability of
 * retaining Crobat, holding VIP, fitting two searched Basics plus Crobat on
 * the five-slot Bench, and having two Basics left in the post-Prize deck.
 * The first ordinary draw is explicitly sampled after six Prize assignments.
 * No search, ability, mulligan bonus, opponent effect or strategic choice is
 * credited. Every printed card is an individually distinct physical card.
 * @param {{basicCount:number,vipCount:number,crobatCount:number,
 *  total?:number,opening?:number,prizes?:number}} args
 */
function prizeAwareTwoTargetWindow(args) {
  const {basicCount:B,vipCount:V,crobatCount:K,
    total=60,opening=7,prizes=6} = args;
  assert.ok([B,V,K,total,opening,prizes].every(Number.isSafeInteger));
  assert.ok(K>=1 && B>=K && V>=1 && B+V<=total &&
    opening>=1 && prizes>=0 && total-opening-prizes>=1);
  const other=total-B-V;
  const afterOpening=total-opening;
  const deckAfterPrize=afterOpening-prizes;
  const valid=choose(total,opening)-choose(total-B,opening);
  const denominator=valid*choose(afterOpening,prizes);
  let weighted=0n,first=0n,second=0n;
  for(let c=0;c<=K;c++)for(let v=0;v<=V;v++)for(let o=0;o<=B-K;o++){
    if(c+o<1)continue;
    const r=opening-c-v-o;
    const w=choose(K,c)*choose(V,v)*choose(B-K,o)*choose(other,r);
    if(w===0n)continue;
    const retained=c-(o===0?1:0);
    for(let pc=0;pc<=K-c;pc++)for(let pv=0;pv<=V-v;pv++){
      for(let po=0;po<=B-K-o;po++){
        const pr=prizes-pc-pv-po;
        const pw=choose(K-c,pc)*choose(V-v,pv)*
          choose(B-K-o,po)*choose(other-r,pr);
        if(pw===0n)continue;
        weighted+=w*pw;
        const leftC=K-c-pc,leftV=V-v-pv;
        const leftO=B-K-o-po,leftR=other-r-pr;
        assert.equal(leftC+leftV+leftO+leftR,deckAfterPrize);
        const basicsLeft=leftC+leftO;
        const benchFitsBefore=retained>=1&&c+o<=4;
        if(benchFitsBefore&&v>=1&&basicsLeft>=2)first+=w*pw;
        const drawCases=[
          {name:'C',amount:leftC},{name:'V',amount:leftV},
          {name:'O',amount:leftO},{name:'R',amount:leftR}
        ];
        for(const draw of drawCases){
          if(draw.amount===0)continue;
          const heldCrobat=retained+(draw.name==='C'?1:0);
          const heldVip=v+(draw.name==='V'?1:0);
          const basicsAfterDraw=basicsLeft-
            ((draw.name==='C'||draw.name==='O')?1:0);
          const benchFits=c+o<=(retained>=1?4:3);
          if(heldCrobat>=1&&heldVip>=1&&benchFits&&basicsAfterDraw>=2)
            second+=w*pw*BigInt(draw.amount);
        }
      }
    }
  }
  assert.equal(weighted,denominator,
    'Prize partitions must preserve every Basic-valid opening');
  return {
    goingFirst:{numerator:first,denominator},
    goingSecond:{numerator:second,
      denominator:denominator*BigInt(deckAfterPrize)}
  };
}

function run(root=path.resolve(__dirname,'..')){
  const inventories=sourceCensus(root,FIELD_RANKS).rows;
  const rows=inventories.map(row=>{
    const args={basicCount:row.basicCount,
      vipCount:row.vipCount,crobatCount:row.crobatCount};
    const full=prizeAwareTwoTargetWindow(args);
    const bench=openingCohold(args);
    const delta=(a,b)=>(100*(Number(a.numerator)/Number(a.denominator)-
      Number(b.numerator)/Number(b.denominator))).toFixed(12);
    return {rank:row.rank,archetype:row.archetype,...args,
      goingFirstPercent:percent(full.goingFirst),
      goingSecondPercent:percent(full.goingSecond),
      prizeFailureVersusBenchOnlyFirstPercentagePoints:
        delta(bench.benchEveryOtherBasicFirst,full.goingFirst),
      prizeFailureVersusBenchOnlySecondPercentagePoints:
        delta(bench.benchEveryOtherBasicSecond,full.goingSecond)};
  });
  return {version:VERSION,originalSourceCount:rows.length,rows,
    competitiveQualifiedGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,prizeAwareTwoTargetWindow,run};
