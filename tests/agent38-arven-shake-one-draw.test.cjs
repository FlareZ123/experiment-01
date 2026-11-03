'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/agent38-arven-shake-opening.cjs');
const {exactOneDrawCounts,analyzeOneDrawSixty}=
  require('../scripts/agent38-arven-shake-one-draw.cjs');

/**
 * Deliberately distinct ordered-sequence physical-card enumeration.
 * The initial three must contain any starting Basic (t or b); the fourth
 * visible card is the normal turn-one draw and the fifth selected is Prize.
 */
function physicalToyCensus(){
  const cards=['t','t','a','s','f','g','b','o'];
  const counts={denominator:0,valid:0,direct:0,arven:0,union:0,
    hybridArven:0,hybridUnion:0,benchNarrow:0,benchHybrid:0};
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)
    for(let k=j+1;k<8;k++){
      const seven=new Set([i,j,k]);
      const starting=[i,j,k].map(x=>cards[x]);
      for(let draw=0;draw<8;draw++){
        if(seven.has(draw))continue;
        const visible=[...starting,cards[draw]];
        for(let prize=0;prize<8;prize++){
          if(seven.has(prize)||prize===draw)continue;
          counts.denominator++;
          const valid=starting.some(x=>x==='t'||x==='b');
          if(!valid)continue;
          counts.valid++;
          const deck=cards.filter((_,index)=>
            !seven.has(index)&&index!==draw&&index!==prize);
          const has=x=>visible.includes(x);
          const retained=x=>deck.includes(x);
          const direct=has('t')&&has('s')&&has('f')&&retained('g');
          const arven=has('t')&&has('a')&&retained('s')&&
            retained('f')&&retained('g');
          counts.direct+=Number(direct);
          counts.arven+=Number(arven);
          counts.union+=Number(direct||arven);
          const hybrid=has('t')&&has('a')&&retained('g')&&
            (has('s')||retained('s'))&&(has('f')||retained('f'));
          counts.hybridArven+=Number(hybrid);
          counts.hybridUnion+=Number(direct||hybrid);
          // The first-three Active can be chosen as a non-Trubbish Basic,
          // or a second Trubbish observed by the first draw can be benched.
          const bench=starting.includes('b')||
            visible.filter(x=>x==='t').length>=2;
          counts.benchNarrow+=Number(bench&&(direct||arven));
          counts.benchHybrid+=Number(bench&&(direct||hybrid));
        }
      }
    }
  return counts;
}

function fullSixty(t,a,s,f,g,otherBasic){
  const defs=[
    ['Trubbish','FST','168',t,'Pokémon'],
    ['Arven','SVI','166',a,'Trainer'],
    ['Boost Shake','EVS','142',s,'Trainer'],
    ['Float Stone','BKT','137',f,'Trainer'],
    ['Garbodor','BKP','57',g,'Pokémon']
  ];
  const cards=defs.filter(x=>x[3]>0).map(([name,set,number,count,category])=>({
    name,count,category,printing:{set,number,language:'en'}
  }));
  cards.push({name:'Other Basic',count:otherBasic,category:'Pokémon',
    printing:{set:'SIT',number:'1',language:'en'}});
  cards.push({name:'Other Nonbasic',count:60-t-a-s-f-g-otherBasic,
    category:'Trainer',printing:{set:'SIT',number:'2',language:'en'}});
  return {cards};
}

test('8-card toy enumerator crosschecks all exact weighted counts',()=>{
  const model=exactOneDrawCounts({t:2,a:1,s:1,f:1,g:1,b:1,o:1,
    seenSize:4,prizes:1});
  const census=physicalToyCensus();
  assert.equal(model.denominator,String(census.denominator));
  assert.equal(model.validOpeningNumerator,String(census.valid));
  assert.equal(model.directNumerator,String(census.direct));
  assert.equal(model.arvenNumerator,String(census.arven));
  assert.equal(model.unionNumerator,String(census.union));
  assert.equal(model.hybridArvenNumerator,String(census.hybridArven));
  assert.equal(model.hybridUnionNumerator,String(census.hybridUnion));
  assert.equal(model.benchNarrowUnionNumerator,String(census.benchNarrow));
  assert.equal(model.benchHybridUnionNumerator,String(census.benchHybrid));
});

test('normal turn draw preserves exact valid opening seven denominator',()=>{
  const model=exactOneDrawCounts({t:3,a:3,s:3,f:4,g:2,b:9,o:36});
  const expected=1-Number(choose(48,7))/Number(choose(60,7));
  assert.ok(Math.abs(model.basicValidProbability-expected)<1e-12);
  assert.ok(model.unionConditionalValid>model.unionAndValidProbability);
});

test('authentic rank11 source inventory count structural exact first-turn opportunity',()=>{
  const old=analyzeOneDrawSixty(fullSixty(2,0,2,3,2,9),11);
  assert.ok(Math.abs(old.directConditionalValid-0.019383158701236063)<1e-13);
  assert.equal(old.arvenNumerator,'0');
  assert.equal(old.directNumerator,old.unionNumerator);
});

test('3 Arven plus 3 Trubbish / 3 Shake / 4 Stone exact first-turn opportunity',()=>{
  const x=analyzeOneDrawSixty(fullSixty(3,3,3,4,2,9),12);
  assert.equal(x.denominator,'416717869162795200');
  assert.equal(x.unionNumerator,'56256070550245168');
  assert.ok(Math.abs(x.unionConditionalValid-0.166797341462928)<1e-13);
  assert.ok(Math.abs(x.directConditionalValid-0.0488298479401126)<1e-13);
  assert.ok(x.unionAndValidProbability<x.directAndValidProbability+
    x.arvenAndValidProbability);
});

test('hybrid Arven searches only missing Item or Tool components',()=>{
  const x=analyzeOneDrawSixty(fullSixty(3,3,3,4,2,9),12);
  assert.equal(x.hybridUnionNumerator,'56512392832556911');
  assert.ok(Math.abs(x.hybridUnionConditionalValid-0.16755732833775108)<1e-13);
  assert.ok(x.hybridUnionConditionalValid>x.unionConditionalValid);
  assert.ok(x.hybridArvenConditionalValid>x.arvenConditionalValid);
  assert.ok(x.hybridUnionConditionalValid<
    x.directConditionalValid+x.hybridArvenConditionalValid);
});

test('naturally benched Trubbish distinguishes alternate starter from forced Active',()=>{
  const src=analyzeOneDrawSixty(fullSixty(2,0,2,3,2,9),11);
  const challenger=analyzeOneDrawSixty(fullSixty(3,3,3,4,2,9),12);
  assert.ok(Math.abs(src.benchHybridUnionConditionalValid-
    0.011779976746806699)<1e-13);
  assert.ok(Math.abs(challenger.benchHybridUnionConditionalValid-
    0.11496088007901561)<1e-13);
  assert.equal(challenger.benchHybridUnionNumerator,
    '38773084292118487');
  assert.ok(challenger.benchHybridUnionConditionalValid<
    challenger.hybridUnionConditionalValid);
});

test('missing or already Prized Garbodor cannot satisfy direct or Arven route',()=>{
  const bad=analyzeOneDrawSixty(fullSixty(3,3,3,4,0,9),12);
  assert.equal(bad.unionNumerator,'0');
});

test('malformed totals and impossible first-seven schema are rejected',()=>{
  assert.throws(()=>exactOneDrawCounts({t:1,a:1,s:1,f:1,g:1,b:1,o:1,
    seenSize:8,prizes:6}));
  assert.throws(()=>analyzeOneDrawSixty({cards:[]},12));
  assert.throws(()=>analyzeOneDrawSixty(fullSixty(3,3,3,4,2,9),2));
});
