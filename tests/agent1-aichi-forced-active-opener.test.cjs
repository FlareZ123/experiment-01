'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {
  choose,exactForcedOpening,readCardIndex,printedPokemon,
  inspectDeck,studyField
}=require('../simulation/evaluation/aichi-forced-active-opener.cjs');

const ROOT=path.resolve(__dirname,'..');

test('exact combinatorics are integral and handle impossible subsets',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(3,4),0n);
  assert.equal(choose(7,0),1n);
  assert.equal(choose(6,-1),0n);
});

test('twelve-card exhaustive legal-seven enumeration matches rational model',()=>{
  const total=12,basicHp=[60,100,200];
  const expected=exactForcedOpening(total,basicHp,[60,100,200]);
  const counts=[0,0,0],denom=[0],all=[0];
  for(let bits=0;bits<(1<<total);bits++){
    if([...Array(total)].reduce((s,_,i)=>s+((bits>>i)&1),0)!==7)continue;
    all[0]++;
    const selected=basicHp.filter((_,i)=>bits&(1<<i));
    if(selected.length===0)continue;
    denom[0]++;
    if(selected.length===1){
      for(let i=0;i<3;i++)if(selected[0]<=[60,100,200][i])counts[i]++;
    }
  }
  assert.equal(expected.totalHands,String(all[0]));
  assert.equal(expected.legalHands,String(denom[0]));
  for(let i=0;i<3;i++){
    assert.equal(expected.hpTiers[i].exactNumerator,String(counts[i]));
    assert.equal(expected.hpTiers[i].exactDenominator,String(denom[0]));
    assert.equal(expected.hpTiers[i].conditionalForcedActive,counts[i]/denom[0]);
  }
});

test('real Basic subtype, exact printing and missing-locator cases are distinct',()=>{
  const idx=readCardIndex(ROOT);
  const basic=printedPokemon({name:'Unown',printing:{set:'AOR',number:'30'}},idx);
  assert.equal(basic.id,'xy7-30');
  assert.equal(basic.hp,'60');
  assert.equal(basic.subtypes.includes('Basic'),true);
  assert.equal(printedPokemon({name:'Unown',
    printing:{set:'AOR',number:'31'}},idx),null);
  assert.equal(printedPokemon({name:'Mewtwo & Mew-GX',
    english_proxy_card_id:'xy7-30'},idx),null);
  assert.equal(printedPokemon({name:'Trevenant & Dusknoir-GX',
    printing:{set:'SMP',number:'217'}},idx)?.id,'smp-SM217');
  const synthetic={cards:[
    {category:'Pokémon',count:4,name:'Unown',
      printing:{set:'AOR',number:'31'}},
    {category:'Trainer',count:56,name:'Synthetic non-Pokémon'}
  ]};
  assert.equal(inspectDeck(synthetic,idx).status,'unresolved-printings');
});

test('all twenty-nine preserved originals and six fixed study candidates are enumerated',()=>{
  const r=studyField(ROOT);
  assert.equal(r.originalCount,29);
  assert.deepEqual(r.absentRanks,[23,25,28]);
  assert.equal(r.originals.length,29);
  assert.equal(r.candidates.length,6);
  assert.equal(r.paperQualifiedGames,0);
  assert.equal(r.winRateEstimate,null);
  assert.equal(r.originals.some(x=>x.rank===25),false);
  assert.equal(r.candidates.some(x=>x.name==='New Moon Lockbreaker'),true);
  assert.equal(r.candidates.some(x=>x.name==='Apex Alchemy'),true);
  assert.equal(r.candidates.some(x=>x.name==='Sentinel Lopunny'),true);
  for(const row of [...r.originals,...r.candidates]){
    assert.ok(['exact-conditional-opening','unresolved-printings'].includes(row.status));
    if(row.status==='exact-conditional-opening'){
      assert.equal(row.total,60);
      assert.ok(row.basics>=1&&row.basics<=60);
      assert.ok(row.hpTiers.every(x=>x.conditionalForcedActive>=0&&
        x.conditionalForcedActive<=row.exactlyOneBasicProbability));
    }else assert.ok(row.missing.length>0);
  }
  console.log('AGENT1_AICHI_FORCED_SINGLE_BASIC_HP_MATRIX',JSON.stringify({
    schema:r.schema,originalCount:r.originalCount,
    source:r.source,missingRanks:r.absentRanks,
    admittedOriginals:r.admittedOriginals,
    admittedCandidates:r.admittedCandidates,
    originals:r.originals.map(row=>({
      rank:row.rank,status:row.status,basics:row.basics,
      mulliganProbability:row.mulliganProbability,
      soleBasic:row.exactlyOneBasicProbability,
      forcedHp90:row.hpTiers?.find(t=>t.hpAtMost===90)?.conditionalForcedActive,
      missing:row.missing
    })),
    candidates:r.candidates.map(row=>({
      name:row.name,status:row.status,basics:row.basics,
      mulliganProbability:row.mulliganProbability,
      soleBasic:row.exactlyOneBasicProbability,
      forcedHp90:row.hpTiers?.find(t=>t.hpAtMost===90)?.conditionalForcedActive,
      missing:row.missing
    })),
    paperQualifiedGames:r.paperQualifiedGames
  }));
});
