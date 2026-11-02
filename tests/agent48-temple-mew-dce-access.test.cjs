'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,conditionalSeenTargets,auditOriginalRank5}=
  require('../scripts/agent48-temple-mew-dce-access.cjs');

const pokemon=[
  ['Mew V','FST','113',4],['Mew VMAX','FST','114',3],
  ['Genesect V','FST','185',4],['Dedenne-GX','UNB','57',1],
  ['Crobat V','DAA','104',1],["Lillie's Clefairy ex",'JTG','56',1]
].map(([name,set,number,count])=>({category:'Pokémon',name,count,
  printing:{set,number,language:'en'}}));
const fixture=()=>({decks:[{rank:5,cards:[...pokemon.map(card=>({...card,printing:{...card.printing}})),
  {category:'Energy',name:'Double Colorless Energy',count:4,
    printing:{set:'SUM',number:'136',language:'en'}},
  {category:'Trainer',name:'Other',count:42,
    printing:{set:'X',number:'1',language:'en'}}]}]});

test('binomial coefficients have exact zero out-of-range and known values',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(60,61),0n);
  assert.equal(choose(7,-1),0n);
  assert.equal(choose(7,3),35n);
});

test('exact source-count screen matches six first-7 plus draw fractions',()=>{
  const report=auditOriginalRank5(fixture());
  assert.equal(report.basicCount,11);
  assert.equal(report.doubleColorlessCopies,4);
  const expected=[
    [[113768556n,300306336n],[16475052n,300306336n]],
    [[6775884588n,15916235808n],[1165058268n,15916235808n]],
    [[194453701728n,413822131008n],[38707754448n,413822131008n]]
  ];
  for(const [i,row] of report.ordinaryDraws.entries()){
    assert.deepEqual([row.atLeastOne.favorable,row.atLeastOne.possible],expected[i][0]);
    assert.deepEqual([row.atLeastTwo.favorable,row.atLeastTwo.possible],expected[i][1]);
  }
  assert.equal(report.competitiveQualifiedGames,0);
});

test('exact printed source counts reject invented Energy and Basics',()=>{
  const wrong=fixture();
  wrong.decks[0].cards.at(-2).count=3;
  wrong.decks[0].cards.at(-1).count=43;
  assert.throws(()=>auditOriginalRank5(wrong),/count|DCE|Original rank5/i);
  const wrongPokemon=fixture();
  wrongPokemon.decks[0].cards[0].printing.number='999';
  assert.throws(()=>auditOriginalRank5(wrongPokemon),/source Pokémon printing/);
});

/** Independently enumerate a small real opening + prize + normal-draw experiment. */
function combinations(values,k){
  if(k===0)return [[]];
  if(values.length<k)return [];
  return values.flatMap((value,i)=>
    combinations(values.slice(i+1),k-1).map(rest=>[value,...rest]));
}

test('mini-deck brute force with a Prize card agrees with marginal formula',()=>{
  const cards=['B','B','T','T','O','O','O'];
  let favorable=0,total=0;
  for(const opening of combinations([...cards.keys()],3)){
    if(!opening.some(i=>cards[i]==='B'))continue;
    const unseen=cards.map((_,i)=>i).filter(i=>!opening.includes(i));
    for(const prize of unseen){
      for(const draw of unseen.filter(i=>i!==prize)){
        total++;
        if([...opening,draw].filter(i=>cards[i]==='T').length>=2)
          favorable++;
      }
    }
  }
  const math=conditionalSeenTargets({basicCount:2,targetCount:2,
    minimumTargets:2,ordinaryDraws:1,deckSize:7,openingSize:3});
  assert.equal(BigInt(favorable)*math.possible,
    BigInt(total)*math.favorable);
});
