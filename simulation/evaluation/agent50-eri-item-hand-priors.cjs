'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent50-eri-original-field-item-fivehand-prior-v1';
const ROOT=path.resolve(__dirname,'../..');
const PROMO_CODES={BWP:'bwp',SMP:'smp',XYP:'xyp'};

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||n<0||k<0||
     k>n)return 0;
  let result=1;
  for(let i=1;i<=k;i++)result=result*(n-k+i)/i;
  return result;
}

/**
 * Exact baseline hypergeometric Item exposure in a uniformly random hand.
 * This does not model Item expenditure, Supporter sequencing, Prizes or turn
 * clock. Eri's live hand-size trigger needs a state-dependent posterior.
 * @param {number} itemCount Full-60 printed Item count.
 * @param {number} handSize Hand size drawn from an untouched original 60.
 * @param {number} [total] Full deck size.
 * @returns {{pAny:number,pTwoOrMore:number,expectedDiscardCap2:number}}
 */
function itemHandPrior(itemCount,handSize,total=60){
  assert.ok(Number.isSafeInteger(total)&&total>0);
  assert.ok(Number.isSafeInteger(itemCount)&&itemCount>=0&&
    itemCount<=total);
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=0&&handSize<=total);
  const denominator=choose(total,handSize);
  const pZero=choose(total-itemCount,handSize)/denominator;
  const pOne=itemCount*
    choose(total-itemCount,handSize-1)/denominator;
  return {pAny:1-pZero,pTwoOrMore:1-pZero-pOne,
    expectedDiscardCap2:2-2*pZero-pOne};
}

/**
 * Use the exact English set and printed card number when available.
 * A name-consistent subtype fallback across different English releases
 * is explicitly weaker than exact-print proof. Never invent subtype.
 * @param {string} root
 * @returns {{byExact:Map<string,object[]>,byName:Map<string,Set<string>>}}
 */
function buildCardSubtypeIndex(root=ROOT){
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  const byExact=new Map(),byName=new Map();
  for(const set of sets){
    const code=set.ptcgoCode??Object.keys(PROMO_CODES).find(k=>
      PROMO_CODES[k]===set.id);
    const cardFile=path.join(root,'resources/cards/en',set.id+'.json');
    if(!fs.existsSync(cardFile)||!code)continue;
    for(const c of JSON.parse(fs.readFileSync(cardFile,'utf8'))){
      if(c.supertype!=='Trainer')continue;
      // Older Tool metadata can contain BOTH Item and Pokémon Tool.
      // The paper rulebook explicitly treats such printings as Tools.
      const subtypes=Array.isArray(c.subtypes)?c.subtypes:[];
      const subtype=subtypes.includes('Pokémon Tool')?['Pokémon Tool']:
        subtypes.filter(x=>['Item','Supporter','Stadium'].includes(x));
      if(subtype.length!==1)continue;
      const exactKey=code+'|'+String(c.number).replace(/^0+(?=\d)/,'')+
        '|'+c.name;
      if(!byExact.has(exactKey))byExact.set(exactKey,[]);
      byExact.get(exactKey).push({subtype:subtype[0],setId:set.id});
      if(!byName.has(c.name))byName.set(c.name,new Set());
      byName.get(c.name).add(subtype[0]);
    }
  }
  return {byExact,byName};
}

/** @param {object} row @param {object} index @returns {object} */
function trainerSubtype(row,index){
  assert.equal(row.category,'Trainer');
  const name=row.name,code=row.printing?.set;
  const number=String(row.printing?.number??'')
    .replace(/^0+(?=\d)/,'');
  const exact=index.byExact.get(code+'|'+number+'|'+name)??[];
  const exactKinds=new Set(exact.map(x=>x.subtype));
  if(exactKinds.size===1)return {subtype:[...exactKinds][0],basis:'exact'};
  const nameKinds=index.byName.get(name)??new Set();
  if(nameKinds.size===1)return {subtype:[...nameKinds][0],
    basis:'name-uniform-fallback'};
  return {subtype:null,basis:exactKinds.size>1?
    'conflicting-exact-printings':nameKinds.size>1?
      'conflicting-name-printings':'not-in-English-card-pool'};
}

/**
 * Classify the actual authenticated 29 original 60s. Preserve every
 * unclassified card separately; lower/upper bounds use only known
 * classification rather than mistaking all Trainers for Items.
 */
function analyzeOriginalField(root=ROOT){
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const index=buildCardSubtypeIndex(root);
  const rows=roster.decks.map(deck=>{
    const sum=deck.cards.reduce((n,c)=>n+c.count,0);
    assert.equal(sum,60,'Invalid original 60 at rank '+deck.rank);
    const counts={Item:0,Supporter:0,Stadium:0,'Pokémon Tool':0};
    let unclassified=0;
    const fallbacks=[],unknown=[];
    for(const card of deck.cards.filter(c=>c.category==='Trainer')){
      const match=trainerSubtype(card,index);
      if(match.subtype)counts[match.subtype]+=card.count;
      else{
        unclassified+=card.count;
        unknown.push({name:card.name,set:card.printing?.set,
          number:card.printing?.number,count:card.count,
          reason:match.basis});
      }
      if(match.basis==='name-uniform-fallback')fallbacks.push({
        name:card.name,count:card.count,set:card.printing?.set});
    }
    return {rank:deck.rank,archetype:deck.archetype,
      trainerSubtypes:counts,unknownTrainerCopies:unclassified,
      fallbackCount:fallbacks.reduce((n,c)=>n+c.count,0),
      fallbackPrintings:fallbacks,unknown,
      itemCopiesLower:counts.Item,itemCopiesUpper:counts.Item+unclassified,
      fiveCardLower:itemHandPrior(counts.Item,5),
      fiveCardUpper:itemHandPrior(counts.Item+unclassified,5)};
  });
  return {version:VERSION,fieldCount:rows.length,
    missingOriginalRanks:[23,25,28],
    printedCardDatabase:'resources/cards/en',
    distinction:'uniform untouched 60 five-card prior; not actual Eri revealed game hand',
    rows};
}

if(require.main===module){
  const result=analyzeOriginalField();
  const summary={
    version:result.version,fieldCount:result.fieldCount,
    missingOriginalRanks:result.missingOriginalRanks,
    allExactOrUniformlyNamed:result.rows.every(row=>
      row.unknownTrainerCopies===0),
    unknownRankCounts:result.rows.filter(row=>row.unknownTrainerCopies)
      .map(row=>({rank:row.rank,unknown:row.unknown})),
    itemRanks:result.rows.map(row=>({
      rank:row.rank,itemCopiesLower:row.itemCopiesLower,
      itemCopiesUpper:row.itemCopiesUpper,
      pAny:row.fiveCardLower.pAny,
      pTwoOrMore:row.fiveCardLower.pTwoOrMore,
      expectedDiscardCap2:row.fiveCardLower.expectedDiscardCap2,
      fallbackCount:row.fallbackCount
    }))
  };
  process.stdout.write('ERI_FIELD_ITEM_PRIOR '+JSON.stringify(summary)+'\n');
}

module.exports={VERSION,choose,itemHandPrior,buildCardSubtypeIndex,
  trainerSubtype,analyzeOriginalField};
