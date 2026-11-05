"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {PROFILES}=require('./agent5-adp-paid-opening.cjs');
const {C,COUNTS}=require('./agent5-adp-wondertag-paid-opening.cjs');
const {SCALE,greedySetups,deliberateSetup,payableUnderSetup,
  comparePaidSetupPolicies}=require('./agent5-adp-setup-paid-policy.cjs');
function vec(fields){const a=Array(13).fill(0);for(const [key,n] of Object.entries(fields))a[C[key]]=n;return a;}
const avail=(fields)=>({adp:false,gh:false,dde:false,lele:false,...fields});

test('all repeated-Basic shuffles are equal weight and conserve physical mass',()=>{
  const hand=vec({adp:2,basic:4,lele:1});
  const setups=greedySetups(hand);
  assert.equal(setups.length,105);
  assert.equal(setups.reduce((a,b)=>a+b.weight,0n),SCALE);
  assert.equal(setups.filter(s=>s.active==='adp').reduce((a,b)=>a+b.weight,0n),120n);
  assert.equal(setups.filter(s=>s.active==='basic').reduce((a,b)=>a+b.weight,0n),240n);
  assert.equal(setups.filter(s=>s.active==='lele').reduce((a,b)=>a+b.weight,0n),60n);
  for(const s of setups){assert.equal(s.placed,6);assert.equal(s.bench,5);}
});

test('same initial source can preserve Lele in hand deliberately or burn its setup trigger',()=>{
  const hand=vec({adp:1,lele:1,dragon:2,other:3});
  const seen=vec({adp:1,lele:1,dragon:2,other:4});
  const a=avail({gh:true,dde:true});
  const deliberate=deliberateSetup(hand);
  const greedy=greedySetups(hand)[0];
  assert.deepEqual(payableUnderSetup(hand,seen,a,'dragons',true,deliberate),
    {adpVia:'active',ghVia:'leleHeld',discards:2});
  assert.equal(payableUnderSetup(hand,seen,a,'dragons',true,greedy),null);
});

test('greedy Active other Basic still allows Switch to an ADP already prebenched',()=>{
  const hand=vec({adp:1,basic:1,switch:1,dde:1,other:3});
  const seen=vec({adp:1,basic:1,switch:1,dde:1,other:4});
  const greedy=greedySetups(hand).find(z=>z.active==='basic');
  assert.equal(greedy.adpOnBench,true);
  assert.deepEqual(payableUnderSetup(hand,seen,avail({}),'mechanical',false,greedy),
    {adpVia:'bench',ghVia:'none',discards:0});
});

test('full setup Bench blocks drawn Lele trigger and new ADP placement',()=>{
  const first=vec({adp:1,basic:5,other:1});
  const seen=vec({adp:1,basic:5,lele:1,other:1});
  const greedy=greedySetups(first).find(z=>z.active==='adp');
  assert.equal(greedy.bench,5);
  assert.equal(payableUnderSetup(first,seen,avail({gh:true,dde:true}),
    'mechanical',true,greedy),null);
  const second=vec({basic:6,switch:1});
  const secondSeen=vec({basic:6,switch:1,dde:1});
  const greedy2=greedySetups(second)[0];
  assert.equal(payableUnderSetup(second,secondSeen,avail({adp:true}),
    'mechanical',false,greedy2),null);
});

test('four DCI profiles recover earlier deliberate physical numerators exactly',()=>{
  assert.deepEqual(COUNTS,[2,4,1,2,4,3,4,3,4,6,7,4,16]);
  const out=comparePaidSetupPolicies();
  assert.equal(String(out.denominatorScaled),'105166843059427968000');
  assert.equal(out.handsVisited,29358);
  assert.equal(out.sequenceVisits,56192);
  const original={mechanical:['95104706171618399','109541773114908463'],
    dragons:['50143475645198960','50778042472737262'],
    dragonsEnergy:['66636672290404688','69899599913538126'],
    dragonsEnergyCompressor:['75395103067442776','80845853351768176']};
  for(const p of PROFILES){
    const z=out.numerators[p];
    assert.equal(z.deliberateWithout/SCALE,BigInt(original[p][0]));
    assert.equal(z.deliberateWith/SCALE,BigInt(original[p][1]));
    assert.ok(z.greedyWith<z.deliberateWith);
    assert.ok(z.greedyWithout<z.deliberateWithout);
    assert.ok(z.greedyWith>=z.greedyWithout);
  }
  assert.equal(String(out.numerators.mechanical.greedyWith),'38545739191004798620');
  assert.equal(String(out.numerators.mechanical.greedyWithout),'34560260839843165140');
});

function* combinations(a,k,start=0,prefix=[]){
  if(!k){yield prefix;return;}
  for(let i=start;i<=a.length-k;i++)yield* combinations(a,k-1,i+1,[...prefix,a[i]]);
}
function* permutations(a,start=0){
  if(start===a.length){yield [...a];return;}
  for(let i=start;i<a.length;i++){
    [a[start],a[i]]=[a[i],a[start]];
    yield* permutations(a,start+1);
    [a[start],a[i]]=[a[i],a[start]];
  }
}
/** Separate individual physical-card identity and ordered-hand enumeration. */
test('greedy physical-Basic order and full-zone toy census match exact permutation weighting',()=>{
  const toy=vec({adp:1,basic:1,lele:1,switch:1,tag:1,quick:1,
    gh:1,dde:1,dragon:1,other:1});
  const physical=toy.flatMap((n,i)=>Array(n).fill(i));
  const all=physical.map((_,i)=>i);
  const exact=comparePaidSetupPolicies(toy,{handSize:4,prizeCount:2});
  const brute=Object.fromEntries(PROFILES.map(p=>[p,{deliberateWith:0n,
    deliberateWithout:0n,greedyWith:0n,greedyWithout:0n}]));
  let total=0n;
  for(const handIds of combinations(all,4)){
    const hand=Array(13).fill(0);
    for(const i of handIds)hand[physical[i]]++;
    const priority=deliberateSetup(hand);
    if(!priority)continue;
    const rest=all.filter(i=>!handIds.includes(i));
    for(const ordered of permutations([...handIds])){
      const basicsInOrder=ordered.map(i=>physical[i]).filter(i=>
        i===C.adp||i===C.basic||i===C.lele);
      const placed=basicsInOrder.slice(0,6);
      const bench=basicsInOrder.slice(1,6);
      const greedy={active:placed[0]===C.adp?'adp':
        placed[0]===C.basic?'basic':'lele',bench:bench.length,
        placed:placed.length,adpPlaced:placed.filter(i=>i===C.adp).length,
        lelePlaced:placed.filter(i=>i===C.lele).length,
        adpOnBench:bench.includes(C.adp)};
      for(const prize of combinations(rest,2)){
        const nonPrize=rest.filter(i=>!prize.includes(i));
        for(const draw of nonPrize){
          total++;
          const seen=[...hand];seen[physical[draw]]++;
          const deck=nonPrize.filter(i=>i!==draw).map(i=>physical[i]);
          const present={adp:deck.includes(C.adp),gh:deck.includes(C.gh),
            dde:deck.includes(C.dde),lele:deck.includes(C.lele)};
          for(const p of PROFILES){
            for(const entry of [['deliberateWith',priority,true],
              ['deliberateWithout',priority,false],['greedyWith',greedy,true],
              ['greedyWithout',greedy,false]]){
              if(payableUnderSetup(hand,seen,present,p,entry[2],entry[1]))
                brute[p][entry[0]]++;
            }
          }
        }
      }
    }
  }
  assert.equal(total*SCALE,exact.denominatorScaled*24n);
  for(const p of PROFILES){
    for(const k of Object.keys(brute[p])){
      assert.equal(brute[p][k]*SCALE,exact.numerators[p][k]*24n,
        p+':'+k);
    }
  }
});
