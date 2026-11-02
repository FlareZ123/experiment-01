'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {firstTurnWallyLocation,originalRank5Profile,run}=
  require('../scripts/agent48-rank5-temple-wally-first-attack.cjs');

const basicCards=[
  ['Mew V','FST','113',4],['Mew VMAX','FST','114',3],
  ['Genesect V','FST','185',4],['Dedenne-GX','UNB','57',1],
  ['Crobat V','DAA','104',1], ["Lillie's Clefairy ex",'JTG','56',1]
].map(([name,set,number,count])=>({category:'Pokémon',name,count,
  printing:{set,number,language:'en'}}));
/** Actual original rank5 printed resource counts with unrelated Trainers combined. */
function fixture(){
  const row=(category,name,set,number,count)=>({category,name,count,
    printing:{set,number,language:'en'}});
  return {decks:[{rank:5,cards:[
    ...basicCards.map(x=>({...x,printing:{...x.printing}})),
    row('Energy','Double Colorless Energy','SUM','136',4),
    row('Trainer','Wally','ROS','94',1),
    row('Trainer','Sky Field','ROS','89',2),
    row('Trainer','Path to the Peak','CRE','148',2),
    row('Trainer','Other','X','1',37)
  ]}]};
}

test('frozen rank5 original printed 60 gives exact Basic-valid profile',()=>{
  assert.deepEqual(originalRank5Profile(fixture()),{
    groups:[4,4,1,4,4,3,40],openingSize:7,prizeCount:6,basicCount:11
  });
  const bad=fixture();
  const stadium=bad.decks[0].cards.find(x=>x.name==='Path to the Peak');
  stadium.printing.number='999';
  assert.throws(()=>originalRank5Profile(bad),/original source printed resource/);
});

test('first-turn direct Wally source with and without Temple needs exact same sample',()=>{
  const a=run(fixture());
  const baseline=a.withoutTemple;
  const temple=a.withActiveTempleRequiringDirectStadiumResponse;
  assert.equal(a.competitivelyQualifiedGames,0);
  assert.deepEqual([baseline.prePrizeFavorable,baseline.prePrizePossible],
    [119567264n,15916235808n]);
  assert.deepEqual([temple.prePrizeFavorable,temple.prePrizePossible],
    [33667872n,15916235808n]);
  assert.deepEqual([baseline.favorable,baseline.possible],
    [2422742283847872n,324031005021884160n]);
  assert.deepEqual([temple.favorable,temple.possible],
    [682999473381120n,324031005021884160n]);
  assert.ok(baseline.favorable>temple.favorable);
});

/** @param {number[]} arr @param {number} k @returns {number[][]} */
function subsets(arr,k){
  if(k===0)return [[]];
  const out=[];
  for(let i=0;i<=arr.length-k;i++)
    for(const tail of subsets(arr.slice(i+1),k-1))out.push([arr[i],...tail]);
  return out;
}

test('independent miniature physical cards, valid start, draw, Prize enumeration',()=>{
  const groupCounts=[2,1,1,1,1,2,4],openingSize=5,prizeCount=2,basicCount=3;
  const groups=groupCounts.flatMap((n,i)=>Array(n).fill(i));
  const all=[...groups.keys()];
  let sample=0n,baseline=0n,temple=0n;
  for(const opening of subsets(all,openingSize)){
    const seen=new Set(opening);
    const valid=opening.some(i=>groups[i]===0||groups[i]===1);
    if(!valid)continue;
    const unseen=all.filter(i=>!seen.has(i));
    for(const drawn of unseen){
      const rest=unseen.filter(i=>i!==drawn);
      for(const prizes of subsets(rest,prizeCount)){
        sample++;
        const has=grp=>[...opening,drawn].some(i=>groups[i]===grp);
        if(!opening.some(i=>groups[i]===0)||
          !has(1)||!has(2)||!has(3))continue;
        const vmaxInDeck=rest.some(i=>groups[i]===5&&!prizes.includes(i));
        if(!vmaxInDeck)continue;
        baseline++;
        if(has(4))temple++;
      }
    }
  }
  const profile={groups:groupCounts,openingSize,prizeCount,basicCount};
  const resultNormal=firstTurnWallyLocation(profile,false);
  const resultTemple=firstTurnWallyLocation(profile,true);
  assert.equal(resultNormal.possible,sample);
  assert.equal(resultTemple.possible,sample);
  assert.equal(resultNormal.favorable,baseline);
  assert.equal(resultTemple.favorable,temple);
});
