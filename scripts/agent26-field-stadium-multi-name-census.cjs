'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent26-field-stadium-multi-name-census-v1';
const CARDS=path.resolve(__dirname,'../resources/cards/en');
const ROSTER=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');

/** Normalize the two independently printed Prism Star diamond glyphs. */
function normalizeName(value){
  return value.normalize('NFKC').replace(/[♢◇]/gu,'◇');
}

/** Build Stadium identity from supplied card metadata, without guessing from names. */
function stadiumNames(directory=CARDS){
  const set=new Set();
  for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.json'))){
    const cards=JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));
    assert.ok(Array.isArray(cards),'expected card-set array: '+file);
    for(const card of cards){
      if(card.supertype==='Trainer'&&card.subtypes?.includes('Stadium'))
        set.add(normalizeName(card.name));
    }
  }
  return set;
}

/** Exact binomial coefficient for the complete 60-card deck. */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let j=1;j<=k;j++)
    result=result*BigInt(n-j+1)/BigInt(j);
  return result;
}

/**
 * Exact unconditional probability that the first seven drawn cards contain
 * at least two distinct Stadium names. This is NOT an action opportunity:
 * ignores mulligans, Prize cards, player choices and post-opening game play.
 * @param {number[]} counts Copies by distinct printed Stadium name.
 * @param {number} handSize Natural draw count, default opening seven.
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function distinctStadiumOpening(counts,handSize=7){
  assert.ok(Array.isArray(counts)&&counts.every(x=>Number.isSafeInteger(x)&&x>0));
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=0&&handSize<=60);
  const total=counts.reduce((a,b)=>a+b,0);
  assert.ok(total<=60);
  const nonStadium=60-total;
  const denominator=choose(60,handSize);
  let zeroOrOne=choose(nonStadium,handSize);
  for(const n of counts)
    zeroOrOne+=choose(nonStadium+n,handSize)-choose(nonStadium,handSize);
  return {numerator:denominator-zeroOrOne,denominator};
}

/**
 * Audit only the authenticated names/counts present in the supplied roster.
 * @param {object} roster Parsed original Aichi roster.
 * @param {Set<string>} catalogStadiumNames Stadium identities from card metadata.
 */
function analyzeRoster(roster,catalogStadiumNames){
  assert.ok(Array.isArray(roster.decks));
  assert.ok(catalogStadiumNames instanceof Set);
  const rows=roster.decks.map(deck=>{
    const total=deck.cards.reduce((sum,c)=>sum+c.count,0);
    assert.equal(total,60,'deck '+deck.rank+' must contain 60 cards');
    const byName=new Map();
    for(const card of deck.cards){
      if(card.category!=='Trainer')continue;
      const name=normalizeName(card.name);
      if(catalogStadiumNames.has(name))
        byName.set(name,(byName.get(name)??0)+card.count);
    }
    const stadium=[...byName].map(([name,count])=>({name,count}));
    const copies=stadium.map(c=>c.count);
    const opening=distinctStadiumOpening(copies);
    return {
      rank:deck.rank,archetype:deck.archetype,
      stadiumCopies:copies.reduce((a,b)=>a+b,0),
      distinctNames:stadium.length,
      stadiums:stadium.map(c=>({name:c.name,count:c.count})),
      opening7DifferentNamesNumerator:String(opening.numerator),
      opening7Denominator:String(opening.denominator),
      opening7DifferentNamesPercent:
        Number(opening.numerator)*100/Number(opening.denominator)
    };
  }).sort((a,b)=>a.rank-b.rank);
  return {
    version:VERSION,
    authenticatedDecks:rows.length,
    noStadiumDecks:rows.filter(r=>r.distinctNames===0).length,
    singleNameDecks:rows.filter(r=>r.distinctNames===1).length,
    multiNameDecks:rows.filter(r=>r.distinctNames>=2).length,
    unweightedMeanUnconditionalOpening7Percent:
      rows.reduce((sum,r)=>sum+r.opening7DifferentNamesPercent,0)/rows.length,
    rows
  };
}

if(require.main===module){
  const roster=JSON.parse(fs.readFileSync(ROSTER,'utf8'));
  process.stdout.write(JSON.stringify(
    analyzeRoster(roster,stadiumNames()),null,2)+'\n');
}

module.exports={VERSION,normalizeName,stadiumNames,choose,
  distinctStadiumOpening,analyzeRoster};
