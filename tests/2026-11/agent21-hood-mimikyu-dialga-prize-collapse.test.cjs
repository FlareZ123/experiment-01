'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,printedStats,measure,pair}=
  require('../../scripts/agent21-hood-mimikyu-dialga-prize-collapse.cjs');
const fs=require('node:fs'),path=require('node:path');
const src=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../../results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json'),
'utf8'));

test('current provisional fixed 60 printing counts; 14 actual Basics',()=>{
  assert.deepEqual(printedStats(src),{
    total:60,basicCount:14,
    mimikyuCopies:2,dialgaCopies:1,heavyBallCopies:1,gladionCopies:0});
});
test('exact binomial coefficient arithmetic and edge cases',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(10,0),1n);
  assert.equal(choose(10,11),0n);
  assert.equal(choose(0,0),1n);
});
test('current one versus hypothetical two Heavy Ball exact probabilities',()=>{
  const result=pair(printedStats(src));
  const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-12,
    'expected '+y+', got '+x);
  near(result.baseline.noOpenerCondition.probability,
    0.009581961918238025);
  near(result.baseline.validBasicOpener.probability,
    0.009398928974940789);
  near(result.doubled.noOpenerCondition.probability,
    0.0006734398825819665);
  near(result.doubled.validBasicOpener.probability,
    0.0006642948717788328);
  near(result.split.noOpenerCondition.probability,
    result.doubled.noOpenerCondition.probability);
  near(result.split.validBasicOpener.probability,
    result.doubled.validBasicOpener.probability);
  assert.ok(result.relativeValidOpenerRiskReduction>14);
  near(result.baseline.openingBasicValid.probability,
    result.doubled.openingBasicValid.probability);
});
test('zero/one/two/three Heavy Ball backup counts improve location risk',()=>{
  const opts={total:60,prizes:6,hand:7,basicCount:14,
    mimikyuCopies:2,dialgaCopies:1};
  const vals=[0,1,2,3].map(h=>
    measure({...opts,heavyBallCopies:h}).validBasicOpener.probability);
  for(let i=1;i<vals.length;i++)assert.ok(vals[i]<vals[i-1]);
  assert.ok(vals[0]>0.1&&vals[3]<0.0001);
});
function combinations(items,k){
  if(k===0)return [[]];
  const out=[];
  for(let i=0;i<=items.length-k;i++)
    for(const suffix of combinations(items.slice(i+1),k-1))
      out.push([items[i],...suffix]);
  return out;
}
function brute(opts){
  const cards=[];
  for(let i=0;i<opts.mimikyuCopies;i++)
    cards.push({id:'M'+i,group:'M',basic:true});
  for(let i=0;i<opts.dialgaCopies;i++)
    cards.push({id:'D'+i,group:'D',basic:true});
  for(let i=0;i<opts.heavyBallCopies;i++)
    cards.push({id:'H'+i,group:'H',basic:false});
  for(let i=0;i<(opts.gladionCopies??0);i++)
    cards.push({id:'G'+i,group:'G',basic:false});
  for(let i=cards.filter(c=>c.basic).length;i<opts.basicCount;i++)
    cards.push({id:'B'+i,group:'B',basic:true});
  while(cards.length<opts.total)
    cards.push({id:'N'+cards.length,group:'N',basic:false});
  let totalPrize=0,failPrize=0,valid=0,failValid=0;
  for(const prizes of combinations(cards,opts.prizes)){
    totalPrize++;
    const m=prizes.filter(c=>c.group==='M').length;
    const d=prizes.filter(c=>c.group==='D').length;
    const h=prizes.filter(c=>c.group==='H').length;
    const g=prizes.filter(c=>c.group==='G').length;
    const fail=Number(m===opts.mimikyuCopies)+
      Number(d===opts.dialgaCopies)>
        opts.heavyBallCopies-h+(opts.gladionCopies??0)-g;
    if(fail)failPrize++;
    const remaining=cards.filter(c=>!prizes.includes(c));
    for(const hand of combinations(remaining,opts.hand)){
      if(!hand.some(c=>c.basic))continue;
      valid++;
      if(fail)failValid++;
    }
  }
  return {simple:failPrize/totalPrize,conditional:failValid/valid};
}
test('independent exhaustive small-deck prize/hand enumeration matches model',()=>{
  for(const h of [0,1,2])for(const g of [0,1]){
    const opts={total:11,prizes:3,hand:3,basicCount:5,
      mimikyuCopies:2,dialgaCopies:1,heavyBallCopies:h,gladionCopies:g};
    const actual=measure(opts),control=brute(opts);
    assert.ok(Math.abs(actual.noOpenerCondition.probability-
      control.simple)<1e-12);
    assert.ok(Math.abs(actual.validBasicOpener.probability-
      control.conditional)<1e-12);
  }
});
test('changed source six/card count must fail rather than silently compare',()=>{
  const altered=JSON.parse(JSON.stringify(src));
  altered.cards.find(c=>c.name==='Mimikyu').count=1;
  assert.throws(()=>printedStats(altered),/Mimikyu2/);
});

test('multiple same-turn Gladion uses excluded by rule',()=>{
  assert.throws(()=>measure({gladionCopies:2}),/Two Supporters/);
});
