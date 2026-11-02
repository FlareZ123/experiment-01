'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {choose:C}=require('./agent33-rank29-beach-camping-prize-access.cjs');
const VERSION='agent33-rank29-firstturn-tagcall-ghala-v1';
/** Exact first-own-turn going-second physical location, never a game prediction. */
function evaluateCounts(c){
  const {basic,tag,supporter,dce,thunder}=c;
  assert.equal(basic,4);assert.equal(dce,1);assert.equal(thunder,1);
  assert.ok(tag>=1&&tag<=4&&supporter>=1&&supporter<=4);
  const cap=[basic,tag,supporter,1,1,58-basic-tag-supporter];
  const prize=C(52,6);
  let denominator=0n,held=0n,tagRoute=0n,direct=0n,union=0n;
  for(let b=1;b<=basic;b++)for(let t=0;t<=tag;t++)
  for(let h=0;h<=supporter;h++)for(let d=0;d<=1;d++)
  for(let m=0;m<=1;m++){
    const o=7-b-t-h-d-m;
    if(o<0||o>cap[5])continue;
    const hand=[b,t,h,d,m,o];
    const w7=hand.reduce((n,k,i)=>n*C(cap[i],k),1n);
    const rem=cap.map((n,i)=>n-hand[i]);
    for(let i=0;i<6;i++){
      if(rem[i]===0)continue;
      const seen=hand.slice();seen[i]++;
      const [,tags,gh,dceHeld,thunderHeld]=seen;
      const w=w7*BigInt(rem[i]),missing=2-dceHeld-thunderHeld;
      const okResources=C(52-missing,6);
      const a=gh>0?okResources:0n;
      const z=gh===0&&tags>0
        ?okResources-C(52-missing-supporter,6-supporter):0n;
      const conn=a+z,allHeld=dceHeld===1&&thunderHeld===1;
      const free=allHeld?prize:0n;
      denominator+=w*prize;held+=w*a;tagRoute+=w*z;direct+=w*free;
      union+=w*(conn+free-(allHeld?conn:0n));
    }
  }
  assert.equal(denominator,(C(60,7)-C(56,7))*53n*prize);
  const rate=n=>Number(n)/Number(denominator);
  return {version:VERSION,rank:29,sourceCounts:{...c},
    connectorResourceAvailabilityGivenLegalOpening:rate(held+tagRoute),
    heldGuzmaHalaPathGivenLegalOpening:rate(held),
    tagCallSearchPathOnlyGivenLegalOpening:rate(tagRoute),
    directBothResourcesHeldGivenLegalOpening:rate(direct),
    unionOfConnectorAndDirectGivenLegalOpening:rate(union),
    denominator:String(denominator),connectorNumerator:String(held+tagRoute),
    heldSupporterNumerator:String(held),tagSearchNumerator:String(tagRoute),
    directNumerator:String(direct),unionNumerator:String(union),
    qualifiedGames:0};
}
function evaluate(source){
 const deck=source.decks.find(x=>x.rank===29);
 assert.ok(deck,'Missing rank29 original printed sixty');
 const count=n=>deck.cards.find(x=>x.name===n)?.count??0;
 const c={basic:deck.cards.filter(x=>x.category==='Pokémon').reduce((n,x)=>n+x.count,0),
  tag:count('Tag Call'),supporter:count('Guzma & Hala'),
  dce:count('Double Colorless Energy'),thunder:count('Thunder Mountain ♢')};
 assert.deepEqual({total:deck.cards.reduce((n,x)=>n+x.count,0),...c},
  {total:60,basic:4,tag:2,supporter:2,dce:1,thunder:1});
 return evaluateCounts(c);
}
function run(){
 return evaluate(JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json'),'utf8')));
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={evaluateCounts,evaluate,run,VERSION};
