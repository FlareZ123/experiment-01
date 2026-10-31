'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {choose,openingCohold,run:sourceCensus}=
  require('./agent9-crobat-vip-cohold.cjs');

const VERSION='agent9-thorns-opponent-mulligan-vip-cohold-v1';

/** Exact direct-hand coholding after d offered non-search ordinary/bonus draws. */
function coholdAfterDraws({basicCount:B,vipCount:V,crobatCount:K,
  total=60,opening=7,draws:d}){
  assert.ok([B,V,K,total,opening,d].every(Number.isSafeInteger));
  assert.ok(K>=1&&B>=K&&V>=1&&B+V<=total&&
    opening>=1&&d>=0&&opening+d<=total);
  const remaining=total-opening;
  const D=choose(total,opening)-choose(total-B,opening);
  const N=choose(remaining,d);
  let success=0n;
  for(let c=0;c<=K;c++)for(let v=0;v<=V;v++)for(let o=0;o<=B-K;o++){
    if(c+o<1)continue;
    const w=choose(K,c)*choose(V,v)*choose(B-K,o)*
      choose(total-B-V,opening-c-v-o);
    if(w===0n)continue;
    const retained=c-(o===0?1:0);
    const leftC=K-c,leftV=V-v;
    let numerator;
    if(retained>=1&&v>=1)numerator=N;
    else if(retained>=1)numerator=N-choose(remaining-leftV,d);
    else if(v>=1)numerator=N-choose(remaining-leftC,d);
    else numerator=N-choose(remaining-leftC,d)-
      choose(remaining-leftV,d)+choose(remaining-leftC-leftV,d);
    success+=w*numerator;
  }
  return {numerator:success,denominator:D*N};
}

/** First-hand-valid owner receives M geometric opponent-mulligan choices. */
function geometricBonusExposure(sourceArgs,opponentBasicCount,maxMulligans=45){
  assert.ok(Number.isSafeInteger(opponentBasicCount)&&opponentBasicCount>=1);
  assert.ok(Number.isSafeInteger(maxMulligans)&&maxMulligans>=0&&
    maxMulligans+1<=53);
  const total=60,opening=7;
  const p=1-Number(choose(total-opponentBasicCount,opening))/
    Number(choose(total,opening));
  const q=1-p;
  let first=0,second=0;
  const samples=[];
  for(let m=0;m<=maxMulligans;m++){
    const w=p*Math.pow(q,m);
    const firstD=coholdAfterDraws({...sourceArgs,draws:m});
    const secondD=coholdAfterDraws({...sourceArgs,draws:m+1});
    const asP=f=>Number(f.numerator)/Number(f.denominator);
    first+=w*asP(firstD);
    second+=w*asP(secondD);
    if(m<=5)samples.push({bonusDraws:m,weight:w,
      coholdGoingFirst:asP(firstD),coholdGoingSecond:asP(secondD)});
  }
  return {opponentOpeningBasicSuccess:p,mulliganProbability:q,
    expectedMulligans:q/p,drawAllOfferedToBound:maxMulligans,
    truncationTailProbability:Math.pow(q,maxMulligans+1),
    coholdGoingFirst:first,coholdGoingSecond:second,samples};
}

function run(root=path.resolve(__dirname,'..')){
  const field=require(path.join(root,'results/aichi-2026/full-decklists.json'));
  const rank6=field.decks.find(d=>d.rank===6);
  assert.ok(rank6);
  const pokemon=rank6.cards.filter(c=>c.category==='Pokémon');
  assert.equal(pokemon.length,1);
  assert.equal(pokemon[0].name,'Iron Thorns ex');
  assert.equal(pokemon[0].count,4);
  assert.equal(pokemon[0].printing.set,'TWM');
  assert.equal(pokemon[0].printing.number,'77');
  const source=sourceCensus(root).rows.find(x=>x.rank===11);
  assert.ok(source);
  const args={basicCount:source.basicCount,vipCount:source.vipCount,
    crobatCount:source.crobatCount};
  const exact=geometricBonusExposure(args,4);
  const base=openingCohold(args);
  return {version:VERSION,sourceRank:11,opponentRank:6,
    sourceInventory:args,opponentBasicCount:4,coholdNoBonusGoingFirst:
    Number(base.goingFirst.numerator)/Number(base.goingFirst.denominator),
    coholdNoBonusGoingSecond:
    Number(base.goingSecond.numerator)/Number(base.goingSecond.denominator),
    ...exact,
    // Initialization disables Rule Box Abilities while Thorns is Active;
    // physically held cards alone do not create an Ability activation.
    darkAssetAvailabilityUnderUnbrokenInitialization:false,
    gameWinRateQualified:false};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,coholdAfterDraws,geometricBonusExposure,run};
