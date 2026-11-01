'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {countBasics}=require('./aichi-field-mulligan-census.cjs');
const {choose,ways,combinationsOfCategories}=require(
  './aichi-rank6-tagcall-firstdraw-access.cjs');

const VERSION='agent6-source-original-two-target-k0-card-location-v1';
const TARGETS=new Map([
  [2,['Bellelba & Brycen-Man']],
  [6,['Cynthia & Caitlin']],
  [15,[]],
  [24,['Cynthia & Caitlin','Bellelba & Brycen-Man']],
  [29,['Cynthia & Caitlin']]
]);

/**
 * Exact physical-card placement with six disjoint categories:
 * Basic, Tag Call, Guzma & Hala, other TAG TEAM Supporters,
 * Thunder Mountain, and everything else. Uses only original 60 printed
 * inventory; no opponent/owner hidden identities enter actor policy.
 * @param {number[]} n Verified nonnegative six-category original counts.
 * @returns {Record<string,bigint>} Exact physical opening seven, six Prizes,
 *  and one first ordinary draw event counts.
 */
function countTwoTargetLocations(n){
  assert.equal(n.length,6);
  assert.ok(n.every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.equal(n.reduce((a,b)=>a+b,0),60);
  const out={valid:0n,tagHeld:0n,tagNoHala:0n,ghDeck:0n,
    ghDeckThunderUnprized:0n,fullExtraSearchable:0n};
  for(const hand of combinationsOfCategories(n,7)){
    if(hand[0]===0)continue;
    const hw=ways(n,hand);
    const unhand=n.map((v,i)=>v-hand[i]);
    for(const prized of combinationsOfCategories(unhand,6)){
      const pw=ways(unhand,prized);
      const deck=unhand.map((v,i)=>v-prized[i]);
      for(let drawn=0;drawn<6;drawn++){
        if(deck[drawn]===0)continue;
        const weight=hw*pw*BigInt(deck[drawn]);
        out.valid+=weight;
        if(hand[1]+Number(drawn===1)===0)continue;
        out.tagHeld+=weight;
        if(hand[2]+Number(drawn===2)>0)continue;
        out.tagNoHala+=weight;
        if(prized[2]===n[2])continue;
        out.ghDeck+=weight;
        if(prized[4]>0)continue;
        out.ghDeckThunderUnprized+=weight;
        const extraAfterDraw=deck[3]-Number(drawn===3);
        if(extraAfterDraw>0)out.fullExtraSearchable+=weight;
      }
    }
  }
  const expected=(choose(60,7)-choose(60-n[0],7))*
    choose(53,6)*47n;
  assert.equal(out.valid,expected);
  assert.ok(out.fullExtraSearchable<=out.ghDeckThunderUnprized);
  return out;
}

/** @param {object} source Original published 60 with complete printings. */
function sourceParameters(source){
  const count=name=>source.cards.filter(c=>c.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  assert.equal(source.cards.reduce((s,c)=>s+c.count,0),60);
  const basic=countBasics(source);
  const tag=count('Tag Call');
  const gh=count('Guzma & Hala');
  const secondary=TARGETS.get(source.rank);
  assert.ok(secondary,'This rank is outside the fixed 5-source objective');
  const extra=secondary.reduce((s,name)=>s+count(name),0);
  const thunder=count('Thunder Mountain ♢');
  const remaining=60-basic-tag-gh-extra-thunder;
  assert.ok(remaining>=0);
  const values=[basic,tag,gh,extra,thunder,remaining];
  return {rank:source.rank,archetype:source.archetype,
    secondaryNames:secondary,basicCount:basic,
    categoryCounts:values};
}

/** @param {object} manifest Source-verified 29-60 manifest. */
function census(manifest){
  assert.equal(manifest.decks.length,29);
  assert.deepEqual(manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  const rows=[];
  for(const rank of TARGETS.keys()){
    const source=manifest.decks.find(x=>x.rank===rank);
    assert.ok(source,'Missing original source rank '+rank);
    const params=sourceParameters(source);
    const counts=countTwoTargetLocations(params.categoryCounts);
    const rate=n=>100*Number(n)/Number(counts.valid);
    rows.push({...params,
      exactCounts:Object.fromEntries(Object.entries(counts)
        .map(([k,v])=>[k,String(v)])),
      percentages:Object.fromEntries(Object.entries(counts)
        .filter(([k])=>k!=='valid').map(([k,v])=>[k,rate(v)])),
      conditionalBothTargetAndThunderGivenTagNoHalaPercent:
        100*Number(counts.fullExtraSearchable)/Number(counts.tagNoHala)});
  }
  return {version:VERSION,scope:'pure physical accessibility before Item and Supporter action resolution',
    originalSourceCount:29,qualifiedCompetitiveGames:0,rows};
}

if(require.main===module){
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  process.stdout.write(JSON.stringify(census(manifest),null,2)+'\n');
}
module.exports={VERSION,TARGETS,countTwoTargetLocations,sourceParameters,census};
