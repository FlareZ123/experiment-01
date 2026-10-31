'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,exactCohold,sourceRankCohold}=require(
  '../scripts/agent25-thorns-triple-denial-access.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');

test('BigInt binomial and impossible category',()=>{
  assert.equal(choose(60,0),1n);
  assert.equal(choose(5,2),10n);
  assert.equal(choose(5,6),0n);
  assert.equal(exactCohold({deckSize:60,opening:7,basicCount:4,
    requiredCounts:[4,2,0],draws:1}).numerator,0n);
});

test('authentic source prints and double versus triple coholding',()=>{
  for(const rank of [6,24,29]){
    const a=sourceRankCohold(manifest,rank,1);
    assert.equal(a.plumeriaAndFlare.fraction,'820454/9643095');
    assert.equal(a.counts.basic,4);
    assert.equal(a.counts.plumeria,4);
    assert.equal(a.counts.flare,2);
    assert.equal(a.competitiveGameQualified,false);
    if(rank===24){
      assert.equal(a.counts.hammer,0);
      assert.equal(a.plumeriaFlareAndHammer.probability,0);
    }else{
      assert.equal(a.counts.hammer,4);
      assert.equal(a.plumeriaFlareAndHammer.fraction,'2052896/73012005');
    }
  }
});

test('original source fractions after up to two ordinary draws',()=>{
  const expected=['3720/214291','2052896/73012005','6165774/147646499'];
  expected.forEach((fraction,draws)=>{
    assert.equal(sourceRankCohold(manifest,6,draws)
      .plumeriaFlareAndHammer.fraction,fraction);
  });
});

function* picks(n,k,start=0,prefix=[]) {
  if(k===0){yield prefix;return;}
  for(let i=start;i<=n-k;i++)yield* picks(n,k-1,i+1,[...prefix,i]);
}

test('independent exhaustive labelled-card enumeration',()=>{
  for(const k of [0,1,2]){
    const cards=['B','B','P','P','F','H','H','X','X','X','X','X'];
    let valid=0,success=0;
    for(const opening of picks(cards.length,3)){
      if(!opening.some(i=>cards[i]==='B'))continue;
      const rest=cards.map((_,i)=>i).filter(i=>!opening.includes(i));
      for(const after of picks(rest.length,k)){
        const known=[...opening,...after.map(i=>rest[i])].map(i=>cards[i]);
        valid++;
        if(['P','F','H'].every(t=>known.includes(t)))success++;
      }
    }
    const q=exactCohold({deckSize:12,opening:3,basicCount:2,
      requiredCounts:[2,1,2],draws:k});
    assert.equal(q.numerator,BigInt(success));
    assert.equal(q.denominator,BigInt(valid));
  }
});

test('refuses missing source rank or changed original Hammer printing count',()=>{
  assert.throws(()=>sourceRankCohold(manifest,25,1));
  const altered=JSON.parse(JSON.stringify(manifest));
  altered.decks.find(d=>d.rank===6).cards.find(c=>c.name==='Crushing Hammer').count=3;
  assert.throws(()=>sourceRankCohold(altered,6,1));
});
