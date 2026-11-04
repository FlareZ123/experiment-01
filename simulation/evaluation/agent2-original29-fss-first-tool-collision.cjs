'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent2-original29-first-tool-fss-collision-exact-v1';
const ROOT=path.resolve(__dirname,'../..');
const SCALE=420n; // divisible by every positive count of first-seven held Tools

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let v=1n;
  for(let j=1;j<=Math.min(k,n-k);j++)
    v=v*BigInt(n-Math.min(k,n-k)+j)/BigInt(j);
  return v;
}

/**
 * Authenticated English-transcription lookup. Require the exact print name,
 * set and number; never silently substitute another variant.
 * @param {object} row Original roster entry.
 * @param {object} context Card database and set metadata.
 * @returns {object} Exact card record.
 */
function printedCard(row,context){
  const set=row.printing?.set,number=String(row.printing?.number);
  assert.equal(row.printing?.language,'en');
  const prefixes=set==='SMP'?['smp-SM']:
    set==='XYP'?['xyp-XY']:
      context.sets.filter(s=>s.ptcgoCode===set).map(s=>s.id+'-');
  assert.ok(prefixes.length>0,'Unknown source set '+set);
  const found=[];
  for(const prefix of prefixes){
    const setId=prefix.slice(0,prefix.indexOf('-'));
    let cards=context.cache.get(setId);
    if(!cards){
      cards=JSON.parse(fs.readFileSync(path.join(context.root,
        'resources/cards/en',setId+'.json'),'utf8'));
      context.cache.set(setId,cards);
    }
    const id=prefix+number;
    found.push(...cards.filter(card=>card.id===id&&card.name.replaceAll('♢','◇')===
      row.name.replaceAll('♢','◇')));
  }
  assert.equal(found.length,1,'Unresolved original source printing '+row.name+
    ' '+set+' '+number);
  return found[0];
}

/**
 * Build the complete printed Tool-name vocabulary from the bundled card pool.
 * This avoids treating non-Tool historical promo Trainers as unresolved cards.
 * @param {string} root Repository root.
 * @returns {Set<string>}
 */
function toolNameIndex(root){
  const folder=path.join(root,'resources/cards/en'),names=new Set();
  for(const file of fs.readdirSync(folder).filter(f=>f.endsWith('.json'))){
    const cards=JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));
    for(const card of cards)if(card.supertype==='Trainer'&&
      card.subtypes?.includes('Pokémon Tool'))
      names.add(card.name.replaceAll('♢','◇'));
  }
  return names;
}

/**
 * Count physically disjoint opening-seven categories.
 * A Pokémon V is a Basic with V subtype in this exact database; VMAX and
 * VSTAR are evolutions and must not be counted as opening Basics.
 * @param {object} deck Authenticated original printed-60 entry.
 * @param {object} context Exact English card database.
 */
function printedOpeningCounts(deck,context){
  let fss=0,otherTool=0,basic=0,vBasic=0;
  const otherToolNames=[];
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  for(const row of deck.cards){
    if(row.category==='Energy'||(row.category==='Trainer'&&
      !context.toolNames.has(row.name.replaceAll('♢','◇'))))continue;
    const card=printedCard(row,context);
    if(row.category==='Pokémon'){
      assert.equal(card.supertype,'Pokémon');
      if(card.subtypes.includes('Basic')){
        basic+=row.count;
        if(card.subtypes.includes('V'))vBasic+=row.count;
      }
    }else{
      assert.equal(card.supertype,'Trainer');
      if(card.subtypes.includes('Pokémon Tool')){
        if(row.name==='Forest Seal Stone')fss+=row.count;
        else{
          otherTool+=row.count;
          otherToolNames.push([row.name,row.count]);
        }
      }
    }
  }
  return {rank:deck.rank,fss,otherTool,basic,vBasic,
    nonVBasic:basic-vBasic,otherToolNames};
}

/**
 * Exact combinatorics over an ordered seven, conditioned on at least one
 * Basic. The earliest held Tool is FSS if its physical hand position occurs
 * before every other held Tool. The no-V subset also requires at least one
 * non-V Basic and no V Basic in the seven.
 *
 * The native SelectStoneRecipient predicate is intentionally NOT treated
 * as a game win/played action. Search, later draws, target value and Store
 * acceptance are all outside this physical-opportunity count.
 *
 * @param {{fss:number,otherTool:number,basic:number,vBasic:number}} counts
 * @returns {object} Numerator/denominator and conditional percentages.
 */
function exactOpeningCollision(counts){
  const {fss,otherTool,basic,vBasic}=counts;
  for(const n of [fss,otherTool,basic,vBasic])
    assert.ok(Number.isSafeInteger(n)&&n>=0&&n<=60);
  assert.ok(vBasic<=basic&&fss+otherTool+basic<=60);
  const total=choose(60,7),valid=total-choose(60-basic,7);
  let any=0n,noV=0n;
  const rest=60-fss-otherTool-basic,nonV=basic-vBasic;
  for(let f=1;f<=Math.min(fss,7);f++)
    for(let t=1;t<=Math.min(otherTool,7-f);t++){
      const remaining=7-f-t;
      const factor=choose(fss,f)*choose(otherTool,t)*
        BigInt(f)*SCALE/BigInt(f+t);
      any+=factor*(choose(60-fss-otherTool,remaining)-choose(rest,remaining));
      for(let b=1;b<=Math.min(nonV,remaining);b++)
        noV+=factor*choose(nonV,b)*choose(rest,remaining-b);
    }
  const d=valid*SCALE;
  return {scale:SCALE.toString(),allOrderedSevenDenominator:total.toString(),
    validInitialSevenCount:valid.toString(),
    firstFssAndOtherToolScaledNumerator:any.toString(),
    noVFirstFssOtherToolScaledNumerator:noV.toString(),
    conditionalAny:valid>0n?Number(any)/Number(d):null,
    conditionalNoV:valid>0n?Number(noV)/Number(d):null};
}

/** @returns {object[]} Source-specific, original printed-60 inventory analysis. */
function analyzeOriginal29(){
  const roster=require('../../results/aichi-2026/full-decklists.json');
  const sets=require('../../resources/sets/en.json');
  assert.equal(roster.decks.length,29);
  const context={root:ROOT,sets,cache:new Map(),
    toolNames:toolNameIndex(ROOT)};
  const rows=roster.decks.map(deck=>{
    const counts=deck.cards.some(c=>c.name==='Forest Seal Stone')?
      printedOpeningCounts(deck,context):{rank:deck.rank,fss:0,otherTool:0,
        basic:0,vBasic:0,nonVBasic:0,otherToolNames:[]};
    return {...counts,probabilities:exactOpeningCollision(counts)};
  });
  return {version:VERSION,source:'results/aichi-2026/full-decklists.json',
    totalAuthenticatedSourceDecks:rows.length,
    fssWithAlternativeToolRanks:rows.filter(x=>x.fss>0&&x.otherTool>0)
      .map(x=>x.rank),
    equalSourceWeightConditionalNoV:rows.reduce((n,x)=>
      n+(x.probabilities.conditionalNoV??0),0)/rows.length,
    rows};
}
if(require.main===module)process.stdout.write(
  JSON.stringify(analyzeOriginal29(),null,2)+'\n');
module.exports={VERSION,choose,printedCard,toolNameIndex,printedOpeningCounts,
  exactOpeningCollision,analyzeOriginal29};