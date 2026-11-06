'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {normalizeName,choose,stadiumNames,distinctStadiumOpening}=
  require('./agent26-field-stadium-multi-name-census.cjs');

const ROOT=path.resolve(__dirname,'..');
const ROSTER=path.join(ROOT,'results/aichi-2026/full-decklists.json');
const SETS=path.join(ROOT,'resources/sets/en.json');
const ARCHIVE=path.join(ROOT,'resources/cards/en');
const PROMOS=Object.freeze({
  BWP:{id:'bwp',prefix:'BW'},
  SMP:{id:'smp',prefix:'SM'},
  XYP:{id:'xyp',prefix:'XY'}
});
const VERSION='agent26-conditional-basic-stadium-seven-v1';

/**
 * Compute exactly the probability of seeing at least two Stadium names
 * among the original seven cards, GIVEN at least one printed Basic Pokémon
 * in those seven. Basic is classified by exact English archive printing.
 * Alternative pregame Stage startup effects are outside this abstraction.
 * @param {number[]} distinctCounts Positive counts by Stadium name
 * @param {number} printedBasics Number of printed Basic Pokémon in the sixty.
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function conditionalBasicStadiumSeven(distinctCounts,printedBasics){
  assert.ok(Number.isSafeInteger(printedBasics)&&
    printedBasics>=0&&printedBasics<=60);
  assert.ok(Array.isArray(distinctCounts)&&
    distinctCounts.every(n=>Number.isSafeInteger(n)&&n>0));
  assert.ok(distinctCounts.reduce((s,n)=>s+n,0)+printedBasics<=60,
    'Stadiums and Basics occupy disjoint cards');
  const unrestricted=distinctStadiumOpening(distinctCounts);
  const noBasicPool=60-printedBasics;
  const totalStadium=distinctCounts.reduce((s,n)=>s+n,0);
  const nonStadiumNoBasic=noBasicPool-totalStadium;
  let zeroOrOne=choose(nonStadiumNoBasic,7);
  for(const n of distinctCounts)
    zeroOrOne+=choose(nonStadiumNoBasic+n,7)-
      choose(nonStadiumNoBasic,7);
  const atLeastTwoNoBasic=choose(noBasicPool,7)-zeroOrOne;
  const denominator=choose(60,7)-choose(noBasicPool,7);
  if(denominator===0n)return {numerator:0n,denominator:0n};
  return {
    numerator:unrestricted.numerator-atLeastTwoNoBasic,
    denominator
  };
}

/**
 * Resolve exact source Pokémon printing to its Basic/Stage subtype from the
 * supplied English archive. Every Aichi registered Pokémon print is covered
 * in Agent42's source/archive census; missing/ambiguous prints fail closed.
 * @param {object} source One original printed-card roster row.
 * @param {object[]} sets Checked-in set metadata with ptcgoCode.
 * @param {(setId:string)=>object[]} getCards Source-independent archive reader.
 * @returns {boolean}
 */
function sourcePokemonIsPrintedBasic(source,sets,getCards){
  assert.equal(source.category,'Pokémon');
  const print=source.printing;
  const promo=PROMOS[print.set];
  const setIds=promo?[promo.id]:
    sets.filter(s=>s.ptcgoCode===print.set).map(s=>s.id);
  const number=promo?promo.prefix+String(print.number):
    String(print.number);
  const found=setIds.flatMap(id=>getCards(id).filter(c=>
    c.number===number));
  assert.equal(found.length,1,'unresolved exact Pokémon print '+source.name+
    ' '+print.set+' '+print.number);
  assert.equal(found[0].name,source.name,
    'printed Pokémon identity mismatch '+source.name);
  assert.equal(found[0].supertype,'Pokémon');
  assert.ok(Array.isArray(found[0].subtypes));
  return found[0].subtypes.includes('Basic');
}

/**
 * Evaluate a real authenticated roster. No opponent/hand/Prizes are sampled.
 * @param {object} roster Complete available original deck names/counts.
 * @param {object[]} sets Exact set-code metadata.
 * @param {(setId:string)=>object[]} readCards Card archive reader.
 * @param {Set<string>} allStadiumNames Derived Stadium name metadata.
 * @returns {object}
 */
function evaluateConditionalRoster(roster,sets,readCards,allStadiumNames){
  assert.ok(Array.isArray(roster.decks));
  const cached=new Map();
  const get=id=>{
    if(!cached.has(id))cached.set(id,readCards(id));
    return cached.get(id);
  };
  const rows=[];
  for(const deck of roster.decks){
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    let basics=0;
    for(const c of deck.cards.filter(c=>c.category==='Pokémon')){
      if(sourcePokemonIsPrintedBasic(c,sets,get))basics+=c.count;
    }
    const stadiumCounts=new Map();
    for(const c of deck.cards.filter(c=>c.category==='Trainer')){
      const name=normalizeName(c.name);
      if(allStadiumNames.has(name))
        stadiumCounts.set(name,(stadiumCounts.get(name)??0)+c.count);
    }
    const counts=[...stadiumCounts.values()];
    const raw=distinctStadiumOpening(counts);
    const condition=conditionalBasicStadiumSeven(counts,basics);
    rows.push({
      rank:deck.rank,archetype:deck.archetype,
      printedBasicPokemonCount:basics,
      distinctStadiumNames:stadiumCounts.size,
      unconditionedNumerator:String(raw.numerator),
      unconditionedDenominator:String(raw.denominator),
      conditionalNumerator:String(condition.numerator),
      conditionalDenominator:String(condition.denominator),
      conditionalPercent:condition.denominator===0n?null:
        Number(condition.numerator)*100/Number(condition.denominator)
    });
  }
  rows.sort((a,b)=>a.rank-b.rank);
  return {
    version:VERSION,authenticatedDeckCount:rows.length,
    eventDefinition:'opening seven has two Stadium names given >=1 printed Basic Pokémon',
    sumOfPerDeckConditionalPercents:
      rows.reduce((sum,x)=>sum+(x.conditionalPercent??0),0),
    unweightedConditionalMeanPercent:
      rows.reduce((sum,x)=>sum+(x.conditionalPercent??0),0)/rows.length,
    rows
  };
}
function run(){
  const roster=JSON.parse(fs.readFileSync(ROSTER,'utf8'));
  const sets=JSON.parse(fs.readFileSync(SETS,'utf8'));
  const readSet=id=>JSON.parse(fs.readFileSync(
    path.join(ARCHIVE,id+'.json'),'utf8'));
  return evaluateConditionalRoster(
    roster,sets,readSet,stadiumNames(ARCHIVE));
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={VERSION,conditionalBasicStadiumSeven,
  sourcePokemonIsPrintedBasic,evaluateConditionalRoster,run};
