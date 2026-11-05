"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {PROFILES}=require('./agent5-adp-paid-opening.cjs');
const {C,COUNTS,findPaidLine,countWonderTagBridge}=require('./agent5-adp-wondertag-paid-opening.cjs');
function vec(x){const a=Array(13).fill(0);for(const [k,n] of Object.entries(x))a[C[k]]=n;return a;}
const avail=(x)=>({adp:false,gh:false,dde:false,lele:false,...x});

test('disabling Lele exactly recovers independent previous twelve-class physical enumerator',()=>{
  const o=countWonderTagBridge();
  const prior={mechanical:'95104706171618399',dragons:'50143475645198960',
    dragonsEnergy:'66636672290404688',dragonsEnergyCompressor:'75395103067442776'};
  assert.equal(String(o.denominator),'250397245379590400');
  for(const p of PROFILES){
    assert.equal(String(o.numerators[p].without),prior[p]);
    assert.ok(o.numerators[p].with>=o.numerators[p].without);
  }
  assert.equal(String(o.numerators.mechanical.with-o.numerators.mechanical.without),
    '14437066943290064');
  const routeExpected={mechanical:['3536590342988192','6177411469951558','4723065130350314'],
    dragons:['482508131135856','142787891332546','9270805069900'],
    dragonsEnergy:['1616290806528944','1333433291052434','313203525552060'],
    dragonsEnergyCompressor:['2186769357307712','2431070066309608','832910860708080']};
  for(const p of PROFILES){
    const x=Object.values(o.extraBy[p]);
    assert.deepEqual(x.map(v=>String(v)),routeExpected[p]);
    assert.equal(x.reduce((a,b)=>a+b,0n),
      o.numerators[p].with-o.numerators[p].without);
  }
});

test('Lele held behind ADP can actually pay a two-card Guzma and Hala',()=>{
  const initial=vec({adp:1,lele:1,dragon:2,other:3});
  const seen=vec({adp:1,lele:1,dragon:2,other:4});
  const a=avail({gh:true,dde:true});
  assert.equal(findPaidLine(initial,seen,a,'dragons',false),null);
  assert.deepEqual(findPaidLine(initial,seen,a,'dragons',true),
    {adpVia:'active',ghVia:'leleHeld',discards:2});
});

test('Lele as sole opening Basic is already Active and cannot trigger Wonder Tag',()=>{
  const initial=vec({lele:1,switch:1,quick:1,dragon:2,other:2});
  const seen=vec({lele:1,switch:1,quick:1,dragon:2,other:3});
  const a=avail({adp:true,gh:true,dde:true});
  assert.equal(findPaidLine(initial,seen,a,'mechanical',true),null);
});

test('starting another Basic preserves held Lele and can rescue an ADP Quick Ball route',()=>{
  const initial=vec({basic:1,lele:1,switch:1,quick:1,dragon:3});
  const seen=vec({basic:1,lele:1,switch:1,quick:1,dragon:3,other:1});
  const a=avail({adp:true,gh:true,dde:true});
  assert.equal(findPaidLine(initial,seen,a,'dragons',false),null);
  assert.deepEqual(findPaidLine(initial,seen,a,'dragons',true),
    {adpVia:'quick',ghVia:'leleHeld',discards:3});
});

test('Quick Ball can retrieve an unprized Lele before bench-play and Wonder Tag',()=>{
  const initial=vec({adp:1,quick:1,dragon:3,other:2});
  const seen=vec({adp:1,quick:1,dragon:3,other:3});
  const a=avail({gh:true,dde:true,lele:true});
  assert.deepEqual(findPaidLine(initial,seen,a,'dragons',true),
    {adpVia:'active',ghVia:'leleQuick',discards:3});
  assert.equal(findPaidLine(initial,seen,a,'dragons',false),null);
  assert.equal(findPaidLine(initial,seen,{...a,lele:false},'dragons',true),null);
});

test('one Quick Ball cannot pay for two independent search targets',()=>{
  const initial=vec({basic:1,switch:1,quick:1,dragon:4});
  const seen=vec({basic:1,switch:1,quick:1,dragon:4,other:1});
  assert.equal(findPaidLine(initial,seen,
    avail({adp:true,lele:true,gh:true,dde:true}),'mechanical',true),null);
  const twoQuickInitial=vec({basic:1,switch:1,quick:2,dragon:3});
  const twoQuickSeen=vec({basic:1,switch:1,quick:2,dragon:4});
  assert.deepEqual(findPaidLine(twoQuickInitial,twoQuickSeen,
    avail({adp:true,lele:true,gh:true,dde:true}),'dragons',true),
    {adpVia:'quick',ghVia:'leleQuick',discards:4});
});

/** Independent labeled physical cards, with actual hand/Prize/draw ordering. */
function* combinations(a,k,start=0,prefix=[]){
  if(k===0){yield prefix;return;}
  for(let i=start;i<=a.length-k;i++)yield* combinations(a,k-1,i+1,[...prefix,a[i]]);
}
test('Wonder Tag four profiles agree with independent physical toy exhaustive census',()=>{
  const toy=[1,1,1,1,1,1,1,1,1,2,0,0,2];
  const cards=toy.flatMap((n,i)=>Array(n).fill(i));
  const exact=countWonderTagBridge(toy,{handSize:4,prizeCount:2});
  const brute=Object.fromEntries(PROFILES.map(p=>[p,{without:0n,with:0n}]));
  let total=0n;
  const all=cards.map((_,i)=>i);
  for(const handIds of combinations(all,4)){
    const hand=Array(13).fill(0);
    for(const i of handIds)hand[cards[i]]++;
    if(!hand[C.adp]&&!hand[C.basic]&&!hand[C.lele])continue;
    const rest=all.filter(i=>!handIds.includes(i));
    for(const prizes of combinations(rest,2)){
      const remaining=rest.filter(i=>!prizes.includes(i));
      for(const draw of remaining){
        total++;
        const seen=[...hand];seen[cards[draw]]++;
        const deck=remaining.filter(i=>i!==draw).map(i=>cards[i]);
        const available={adp:deck.includes(C.adp),gh:deck.includes(C.gh),
          dde:deck.includes(C.dde),lele:deck.includes(C.lele)};
        for(const p of PROFILES){
          if(findPaidLine(hand,seen,available,p,false))brute[p].without++;
          if(findPaidLine(hand,seen,available,p,true))brute[p].with++;
        }
      }
    }
  }
  assert.equal(total,exact.denominator);
  for(const p of PROFILES)assert.deepEqual(brute[p],exact.numerators[p],p);
});

test('Lele is a unique Basic in the immutable v2 source split',()=>{
  assert.equal(COUNTS.reduce((a,b)=>a+b,0),60);
  assert.equal(COUNTS[C.lele],1);
  assert.equal(COUNTS[C.basic],4);
});
