"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {C,COUNTS,PROFILES,findPaidLine,countPaidOpenings}=require('./agent5-adp-paid-opening.cjs');
function vector(entries){const a=Array(12).fill(0);for(const [key,count] of Object.entries(entries))a[C[key]]=count;return a;}
function availability(fields){return {adp:false,gh:false,dde:false,...fields};}

test('source inventory partition and prior first-eight optimistic screen agree',()=>{
  assert.equal(COUNTS.reduce((a,b)=>a+b),60);
  const out=countPaidOpenings();
  assert.equal(String(out.denominator),'250397245379590400');
  assert.equal(String(out.numerators.mechanical),'95104706171618399');
  for(let i=1;i<PROFILES.length;i++)
    assert.ok(out.numerators[PROFILES[i]]<=out.numerators.mechanical);
  assert.ok(out.numerators.dragons<out.numerators.dragonsEnergy);
  assert.ok(out.numerators.dragonsEnergy<out.numerators.dragonsEnergyCompressor);
});

test('printed Tag Call can pay once to find both ADP and Guzma & Hala',()=>{
  const initial=vector({basic:1,switch:1,tag:1,dragon:2,other:2});
  const seen=vector({basic:1,switch:1,tag:1,dragon:2,other:3});
  const expected={adpVia:'tag',ghVia:'tag',discards:2};
  assert.deepEqual(findPaidLine(initial,seen,availability({adp:true,gh:true,dde:true}),'dragons'),expected);
  assert.equal(findPaidLine(initial,seen,availability({adp:false,gh:true,dde:true}),'mechanical'),null);
});

test('Guzma & Hala mandatory two-card payment changes a safe-discard screen',()=>{
  const initial=vector({adp:1,gh:1,dragon:1,other:4});
  const seen=vector({adp:1,gh:1,dragon:1,other:5});
  assert.ok(findPaidLine(initial,seen,availability({dde:true}),'mechanical'));
  assert.equal(findPaidLine(initial,seen,availability({dde:true}),'dragons'),null);
  const seenTwoDragons=vector({adp:1,gh:1,dragon:2,other:4});
  assert.ok(findPaidLine(initial,seenTwoDragons,availability({dde:true}),'dragons'));
});

test('Ultra Ball and Guzma & Hala must fund four actual card discards',()=>{
  const initial=vector({basic:1,switch:1,ultra:1,gh:1,dragon:2,other:1});
  const seen=vector({basic:1,switch:1,ultra:1,gh:1,dragon:2,other:2});
  const available=availability({adp:true,dde:true});
  assert.equal(findPaidLine(initial,seen,available,'dragons'),null);
  assert.deepEqual(findPaidLine(initial,seen,available,'mechanical'),
    {adpVia:'ultra',ghVia:'held',discards:4});
  const moreSafe=vector({basic:1,switch:1,ultra:1,gh:1,dragon:2,basicEnergy:2});
  assert.ok(findPaidLine(initial,moreSafe,available,'dragonsEnergy'));
});

test('no legal initial Basic, missing Switch, and missing deck Energy are vetoes',()=>{
  const initial=vector({tag:1,dragon:2,other:4});
  const seen=vector({tag:1,dragon:2,other:5});
  assert.equal(findPaidLine(initial,seen,availability({adp:true,gh:true,dde:true}),'mechanical'),null);
  const otherStart=vector({basic:1,tag:1,dragon:2,other:3});
  const otherSeen=vector({basic:1,tag:1,dragon:2,other:4});
  assert.equal(findPaidLine(otherStart,otherSeen,availability({adp:true,gh:true,dde:true}),'mechanical'),null);
  const adpStart=vector({adp:1,gh:1,dragon:3,other:2});
  const adpSeen=vector({adp:1,gh:1,dragon:3,other:3});
  assert.equal(findPaidLine(adpStart,adpSeen,availability({adp:true,gh:true,dde:false}),'mechanical'),null);
});

/** Independent physical-card proof: hand first, prize pair next, draw last. */
function* combinations(a,k,start=0,prefix=[]){
  if(k===0){yield prefix;return;}
  for(let i=start;i<=a.length-k;i++)yield* combinations(a,k-1,i+1,[...prefix,a[i]]);
}
test('exact hypergeometric tally equals exhaustive labeled physical-card deals on toy deck',()=>{
  const toy=[1,2,1,1,1,1,1,1,2,0,0,1];
  const deck=toy.flatMap((count,i)=>Array(count).fill(i));
  const expected=countPaidOpenings(toy,{handSize:4,prizeCount:2});
  const got=Object.fromEntries(PROFILES.map(p=>[p,0n]));
  let denom=0n;
  for(const handIds of combinations(deck.map((_,i)=>i),4)){
    const initial=Array(12).fill(0);
    for(const id of handIds)initial[deck[id]]++;
    if(!initial[C.adp]&&!initial[C.basic])continue;
    const rest=deck.map((_,i)=>i).filter(i=>!handIds.includes(i));
    for(const prizes of combinations(rest,2)){
      const postPrize=rest.filter(i=>!prizes.includes(i));
      for(const draw of postPrize){
        denom++;
        const seen=[...initial];seen[deck[draw]]++;
        const inDeck=postPrize.filter(i=>i!==draw).map(i=>deck[i]);
        const available={adp:inDeck.includes(C.adp),gh:inDeck.includes(C.gh),
          dde:inDeck.includes(C.dde)};
        for(const profile of PROFILES)
          if(findPaidLine(initial,seen,available,profile))got[profile]++;
      }
    }
  }
  assert.equal(denom,expected.denominator);
  for(const p of PROFILES)assert.equal(got[p],expected.numerators[p],p);
});

test('each category comes from the immutable printed v2 candidate inventory',()=>{
  const deck=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
  const named={
    'sm12-156':'adp',
    'swsh12-135':'basic','sm2-60':'basic','swsh3-104':'basic',
    'sv1-194':'switch','sm12-206':'tag','swsh1-179':'quick',
    'swsh9-150':'ultra','sm12-193':'gh','xy6-97':'dde',
    'xy2-69':'dragon','sv6-130':'dragon','sv6pt5-46':'dragon',
    'zsv10pt5-70':'dragon','swsh11-136':'dragon','sv2-153':'dragon',
    'swsh12pt5-152':'basicEnergy','swsh12pt5-153':'basicEnergy',
    'xy4-92':'compressor'
  };
  const byCategory=Array(12).fill(0);
  for(const card of deck.cards){
    const category=named[card.id]??'other';
    byCategory[C[category]]+=card.count;
  }
  assert.deepEqual(byCategory,COUNTS);
  assert.equal(deck.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
});
