'use strict';
const assert=require('node:assert/strict');
const {decks}=require('../results/aichi-2026/full-decklists.json');

const VERSION='agent49-rank13-dual-search-connector-opening-v2';
const BASIC_OTHER=[
  'Kyurem SFA','Latias ex SSP','Tapu Lele-GX GRI',
  'Dedenne-GX UNB','Squawkabilly ex PAL','Budew ASC','Dialga-GX UPR'
];
const DONORS=['Salamence ex JTG','Dragapult ex TWM','Noivern ex PAL'];
const V='Regidrago V SIT';
const Q='Quick Ball FST',T='Mysterious Treasure FLI';

/** @param {number} n @param {number} k @returns {bigint} */
function binom(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0)throw Error('integer n/k');
  if(k<0||k>n)return 0n;
  const j=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=j;i++)result=result*BigInt(n-j+i)/BigInt(i);
  return result;
}

/**
 * Count seven-card opening multisets: no V, a non-V Basic, a donor,
 * both independently held search-Item families and arbitrary other cards.
 * All cards are physically distinct; combinations are without replacement.
 * @param {{n:number,a:number,v:number,d:number,q:number,t:number,r:number}} groups
 * @param {number} handSize
 * @param {number} minDonors At least this many distinct Dragon donor cards.
 * @returns {bigint}
 */
function dualConnectorHands(groups,handSize,minDonors=1){
  const {n,a,v,d,q,t,r}=groups;
  assert.equal(a+v+d+q+t+r,n);
  let count=0n;
  for(let ai=1;ai<=a;ai++)
    for(let di=minDonors;di<=d;di++)
      for(let qi=1;qi<=q;qi++)
        for(let ti=1;ti<=t;ti++){
          const ri=handSize-ai-di-qi-ti;
          if(ri>=0&&ri<=r)
            count+=binom(a,ai)*binom(d,di)*binom(q,qi)*
              binom(t,ti)*binom(r,ri);
        }
  return count;
}

/** Independent calibration: one named donor, either Item, other Basic, no V. */
function singleDonorEitherConnector(groups,handSize){
  const {n,a,v,d,q,t,r}=groups;
  assert.equal(a+v+d+q+t+r,n);
  let count=0n;
  for(let ai=1;ai<=a;ai++)
    for(let qi=0;qi<=q;qi++)
      for(let ti=0;ti<=t;ti++){
        const ri=handSize-ai-1-qi-ti;
        if(qi+ti>0&&ri>=0&&ri<=r)
          count+=binom(a,ai)*BigInt(d)*binom(q,qi)*
            binom(t,ti)*binom(r,ri);
      }
  return count;
}

/** @returns {object} Exact original source rank13 combination statistics. */
function analyze(){
  const source=decks.find(row=>row.rank===13);
  assert.ok(source);
  const counts=new Map(source.cards.map(row=>
    [row.name+' '+row.printing.set,row.count]));
  const count=name=>counts.get(name)??0;
  const a=BASIC_OTHER.reduce((sum,name)=>sum+count(name),0);
  const v=count(V),d=DONORS.reduce((sum,name)=>sum+count(name),0);
  const q=count(Q),t=count(T);
  const n=source.cards.reduce((sum,row)=>sum+row.count,0);
  const groups={n,a,v,d,q,t,r:n-a-v-d-q-t};
  assert.deepEqual(groups,{n:60,a:7,v:4,d:3,q:3,t:4,r:39});
  for(const name of ['Shelgon','Drakloak','Noibat']){
    assert.equal(source.cards.some(row=>row.name===name),false);
  }
  const total=binom(n,7);
  const valid=total-binom(n-a-v,7);
  const countDual=dualConnectorHands(groups,7);
  const countDualTwoDonors=dualConnectorHands(groups,7,2);
  const salmonGroups={n:60,a,v,d:count('Salamence ex JTG'),
    q,t,r:60-a-v-count('Salamence ex JTG')-q-t};
  const salmonEither=singleDonorEitherConnector(salmonGroups,7);
  const allVPrizedGivenNoV=Number(binom(49,2))/Number(binom(53,6));
  return {
    version:VERSION,rank:13,originalSource:true,groups,
    unopenedSevenHands:total.toString(),
    validBasicHands:valid.toString(),
    dualItemDonorNoVHands:countDual.toString(),
    dualFractionOfValidBasicOpeners:Number(countDual)/Number(valid),
    dualItemTwoDonorsNoVHands:countDualTwoDonors.toString(),
    dualTwoDonorsFractionOfValidBasicOpeners:
      Number(countDualTwoDonors)/Number(valid),
    originalSalamenceEitherItemNoVHands:salmonEither.toString(),
    originalSalamenceEitherItemFraction:Number(salmonEither)/Number(valid),
    allFourVPrizedConditionalNoVSeven:allVPrizedGivenNoV,
    interpretation:'Only opener coholding, not selected actions, deck search hits, strategic preference, simulation wins or actual opponent response.',
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(analyze(),null,2)+'\n');
module.exports={VERSION,BASIC_OTHER,DONORS,binom,dualConnectorHands,
  singleDonorEitherConnector,analyze};
