'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTrainerTypes}=require('./agent3-jellicent-field-exposure.cjs');

const VERSION='agent18-original29-valid-basic-first8-held-supporter-v1';
const FAMILIES=Object.freeze(["Lillie's Determination",'Marnie','Iono','Guzma','Carmine']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0&&Number.isSafeInteger(k)&&k>=0);
  if(k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}

/**
 * Conditional on a Basic in the opening h-card hand, probability of holding
 * >=1 selected Supporter by the ordinary first-turn draw. Six randomly dealt
 * hidden Prizes after the opening do not alter this draw's marginal printing.
 * Physical holding is neither legal Supporter play nor tactical usefulness.
 * @param {number} N Deck size (60 for paper Expanded).
 * @param {number} b Number of Basic Pokemon printings.
 * @param {number} s Number of selected Supporter printings.
 * @param {number} [h] Opening hand size.
 */
function exactConditionalHeld(N,b,s,h=7){
  for(const x of [N,b,s,h])assert.ok(Number.isSafeInteger(x)&&x>=0);
  assert.ok(N>h&&h>0&&b>0&&b+s<=N);
  const valid=(choose(N,h)-choose(N-b,h))*BigInt(N-h);
  const missing=(choose(N-s,h)-choose(N-b-s,h))*
    BigInt(Math.max(0,N-s-h));
  assert.ok(valid>0n&&missing>=0n&&missing<=valid);
  const good=valid-missing,div=gcd(good,valid);
  return {numerator:String(good/div),denominator:String(valid/div),
    probability:Number(good)/Number(valid)};
}

/** @param {string} name @returns {string} */
function normalized(name){return name.replaceAll('◇','♢');}

/**
 * Build a fail-closed exact set/number/name Basic classifier from the
 * repository's supplied historical English printings. Promotional source
 * set aliases SMP and XYP require SM/XY prefixed printed numbers.
 * @param {string} root Repository root.
 * @param {object[]} slots Original Pokemon rows with printing identity.
 * @returns {Map<string,boolean>}
 */
function sourceBasicPrintingIndex(root,slots){
  const sets=JSON.parse(fs.readFileSync(path.join(root,'resources/sets/en.json'),'utf8'));
  const ids=new Map();
  for(const set of sets){
    if(!set.ptcgoCode)continue;
    if(!ids.has(set.ptcgoCode))ids.set(set.ptcgoCode,[]);
    ids.get(set.ptcgoCode).push(set.id);
  }
  ids.set('SMP',['smp']);ids.set('XYP',['xyp']);
  const cache=new Map(),result=new Map();
  for(const slot of slots){
    assert.equal(slot.category,'Pokémon');
    const {set,number}=slot.printing;
    const key=JSON.stringify([set,String(number),slot.name]);
    if(result.has(key))continue;
    const choices=ids.get(set);
    assert.ok(choices?.length,'Unknown source set '+set);
    const num=(set==='SMP'?'SM':set==='XYP'?'XY':'')+number;
    const hits=[];
    for(const id of choices){
      if(!cache.has(id))cache.set(id,JSON.parse(fs.readFileSync(
        path.join(root,'resources/cards/en',id+'.json'),'utf8')));
      hits.push(...cache.get(id).filter(c=>
        String(c.number)===String(num)&&
        normalized(c.name)===normalized(slot.name)));
    }
    assert.equal(hits.length,1,'Unresolved or ambiguous source Pokemon '+
      set+' '+number+' '+slot.name);
    result.set(key,hits[0].subtypes.includes('Basic'));
  }
  return result;
}

/**
 * Read only 29 authenticated original lists. Preserve missing 23/25/28.
 * @param {object} original Source 60-card manifest.
 * @param {Map<string,string>} trainerTypes Public printed card metadata.
 * @param {Map<string,boolean>} isBasic Exact set/number/name classification.
 */
function original29HeldFirst8(original,trainerTypes,isBasic){
  const ranks=new Set();
  const rows=original.decks.map(deck=>{
    assert.ok(!ranks.has(deck.rank));ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    let b=0,s=0,f=0;
    const printedSupporters=[];
    for(const card of deck.cards){
      if(card.category==='Pokémon'){
        const key=JSON.stringify([card.printing.set,
          String(card.printing.number),card.name]);
        assert.ok(isBasic.has(key),'Unresolved source Pokemon '+key);
        if(isBasic.get(key))b+=card.count;
      }else if(card.category==='Trainer'){
        const subtype=trainerTypes.get(card.name);
        assert.ok(subtype,'Unclassified printed Trainer '+card.name);
        if(subtype==='Supporter'){
          s+=card.count;
          printedSupporters.push({name:card.name,count:card.count});
          if(FAMILIES.includes(card.name))f+=card.count;
        }
      }
    }
    return {rank:deck.rank,archetype:deck.archetype,basicCopies:b,
      allSupporterCopies:s,fiveFamilyCopies:f,printedSupporters,
      heldAny:exactConditionalHeld(60,b,s),
      heldFive:exactConditionalHeld(60,b,f)};
  }).sort((a,b)=>a.rank-b.rank);
  const missing=original.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b);
  assert.equal(rows.length,29);
  assert.deepEqual(missing,[23,25,28]);
  assert.equal(new Set([...ranks,...missing]).size,32);
  return {schema:VERSION,source:original.source,rows,
    authenticatedDecks:29,missingRanks:missing,competitiveQualifiedGames:0,
    caveat:'Only exact held-card prior before decisions, conditional on Basic-valid opening. No legal action, prompt, policy, full match, or win-rate inference.'};
}

/** @returns {object} */
function main(){
  const root=path.resolve(__dirname,'..');
  const original=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const slots=original.decks.flatMap(deck=>deck.cards.filter(c=>c.category==='Pokémon'));
  const basics=sourceBasicPrintingIndex(root,slots);
  const types=loadTrainerTypes(path.join(root,'resources/cards/en'));
  const report=original29HeldFirst8(original,types,basics);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module)main();
module.exports={VERSION,FAMILIES,choose,exactConditionalHeld,
  sourceBasicPrintingIndex,original29HeldFirst8,main};
