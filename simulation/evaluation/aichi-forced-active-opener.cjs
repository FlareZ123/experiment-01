'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const HP_THRESHOLDS=Object.freeze([60,70,90,120,160,200]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/**
 * Exact conditional probability of a forced Active with HP at most a cutoff.
 * The initial hand is a uniformly sampled seven-card subset, conditioned
 * on at least one Basic Pokémon. Its one Basic is necessarily the Active.
 * Prizes and optional opponent mulligan bonus draws happen after this choice.
 * @param {number} total Physical deck size, 60 for Expanded.
 * @param {number[]} basicHp HP for each physical Basic copy.
 * @param {number[]} [thresholds] Inclusive HP cutoffs.
 * @returns {object}
 */
function exactForcedOpening(total,basicHp,thresholds=HP_THRESHOLDS){
  assert.ok(Number.isSafeInteger(total)&&total>=7);
  assert.ok(Array.isArray(basicHp)&&basicHp.length>0&&
    basicHp.length<=total&&basicHp.every(x=>Number.isSafeInteger(x)&&x>0));
  assert.ok(Array.isArray(thresholds)&&thresholds.every(x=>
    Number.isSafeInteger(x)&&x>0));
  const B=basicHp.length,totalHands=choose(total,7);
  const legal=totalHands-choose(total-B,7);
  const oneFactor=choose(total-B,6);
  return {total,basics:B,legalHands:legal.toString(),
    totalHands:totalHands.toString(),
    mulliganProbability:1-Number(legal)/Number(totalHands),
    exactlyOneBasicProbability:Number(BigInt(B)*oneFactor)/Number(legal),
    hpTiers:thresholds.map(h=>{
      const low=basicHp.filter(x=>x<=h).length;
      return {hpAtMost:h,lowHpBasicCopies:low,
        exactNumerator:(BigInt(low)*oneFactor).toString(),
        exactDenominator:legal.toString(),
        conditionalForcedActive:Number(BigInt(low)*oneFactor)/Number(legal)};
    })};
}

/**
 * Exact English-print lookup; no substitution across art/text variants.
 * @param {string} root Repository root with supplied card resource files.
 * @returns {object}
 */
function readCardIndex(root){
  const sets=JSON.parse(fs.readFileSync(path.join(root,'resources/sets/en.json'),'utf8'));
  const byCode=new Map();
  for(const set of sets){
    for(const rawCode of [set.ptcgoCode,set.id]){
      if(typeof rawCode!=='string'||!rawCode)continue;
      const code=rawCode.toUpperCase();
      if(!byCode.has(code))byCode.set(code,new Set());
      byCode.get(code).add(set.id);
    }
  }
  const byId=new Map(),dir=path.join(root,'resources/cards/en');
  for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
    const data=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
    for(const card of data)byId.set(card.id,card);
  }
  return {byId,byCode};
}

/**
 * Public roster uses U+2662 (♢), whereas the local Pokemon card database
 * encodes the same Prism Star glyph as U+25C7 (◇). This limited alias is
 * allowed only for a card whose actual subtype is precisely Prism Star.
 * @param {object} card Actual printed card.
 * @param {string} label Tournament roster name.
 * @returns {boolean}
 */
function printedNameMatches(card,label){
  return card?.name===label ||
    (card?.subtypes?.includes('Prism Star')===true &&
      typeof label==='string'&&
      card.name.replaceAll('◇','♢')===label);
}

/**
 * Resolve the exact printed Pokémon card and name, rejecting ambiguities.
 * @param {object} entry Deck Pokémon with printed locator.
 * @param {object} index Card index.
 * @returns {object|null}
 */
function printedPokemon(entry,index){
  const direct=entry.cardId??entry.english_proxy_card_id;
  if(typeof direct==='string'){
    const c=index.byId.get(direct);
    return c?.supertype==='Pokémon'&&printedNameMatches(c,entry.name)?c:null;
  }
  const code=entry.printing?.set?.toUpperCase();
  const ids=index.byCode.get(code);
  if(!ids)return null;
  const number=String(entry.printing.number);
  const numbers=new Set([number]);
  if(code==='SMP'&&/^\d+$/.test(number))numbers.add('SM'+number);
  if(code==='XYP'&&/^\d+$/.test(number))numbers.add('XY'+number);
  if(code==='BWP'&&/^\d+$/.test(number))numbers.add('BW'+number);
  const matches=[];
  for(const id of ids)for(const n of numbers){
    const c=index.byId.get(id+'-'+n);
    if(c?.supertype==='Pokémon'&&printedNameMatches(c,entry.name))matches.push(c);
  }
  return matches.length===1?matches[0]:null;
}

/**
 * Fail closed when any Pokémon printing is unresolved.
 * @param {object} deck Fixed complete printed 60.
 * @param {object} index Card index.
 * @returns {object}
 */
function inspectDeck(deck,index){
  assert.ok(Array.isArray(deck.cards));
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  const missing=[],specialSetup=[],hp=[];
  for(const entry of deck.cards.filter(c=>c.category==='Pokémon')){
    assert.ok(Number.isSafeInteger(entry.count)&&entry.count>=1&&entry.count<=4);
    const c=printedPokemon(entry,index);
    if(!c){missing.push({name:entry.name,locator:entry.printing??entry.cardId??null});continue;}
    if(!c.subtypes?.includes('Basic') &&
        c.abilities?.some(ability=>
          /setting up to play|setting up the game|at the start of the game/i
            .test(String(ability.text??'')))){
      // Advanced Player's Rulebook I.A and II.A allow printed exceptions:
      // e.g. MEG Cinderace may start Active despite its Evolution stage.
      // A Basic-only forced-Active denominator would be misleading.
      specialSetup.push({name:c.name,id:c.id});
    }
    if(c.subtypes?.includes('Basic')){
      const n=Number(c.hp);
      if(!Number.isSafeInteger(n)||n<=0){
        missing.push({name:entry.name,locator:c.id,issue:'unverified-hp'});
      } else hp.push(...Array(entry.count).fill(n));
    }
  }
  if(missing.length)return {status:'unresolved-printings',missing};
  if(specialSetup.length)return {status:'special-setup-unmodeled',specialSetup};
  return {status:'exact-conditional-opening',...exactForcedOpening(60,hp)};
}

/**
 * Study all archived original full 60s and six distinct candidate entries.
 * Uses mechanical English proxy printings, without verifying contemporary
 * Japanese art provenance or claiming simulated wins.
 * @param {string} root Repository root.
 * @returns {object}
 */
function studyField(root){
  const load=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
  const roster=load('results/aichi-2026/full-decklists.json');
  const cand=[
    ['Champion',roster.decks.find(d=>d.rank===1)],
    ['Hood Shield',load('results/aichi-2026/candidate-hood-shadow-rider.json')],
    ['Temple Shadow Rider',load('results/aichi-2026/candidate-temple-shadow-rider.json')],
    ['Apex Alchemy',load('results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json')],
    ['Sentinel Lopunny',load('results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json')]
  ];
  const nm=load('results/als/new-moon-lockbreak-english-proxy-60.json');
  cand.push(['New Moon Lockbreaker',{cards:nm.entries.map(c=>({
    category:c.type,count:c.count,name:c.name_en,
    cardId:c.english_proxy_card_id
  }))}]);
  const index=readCardIndex(root);
  const originals=roster.decks.map(deck=>({
    rank:deck.rank,archetype:deck.archetype,...inspectDeck(deck,index)}));
  const candidates=cand.map(([name,deck])=>({name,...inspectDeck(deck,index)}));
  return {schema:'aichi-forced-active-opening-conditional-v1',
    source:roster.source,originalCount:roster.decks.length,
    absentRanks:roster.missing_full_lists.map(x=>x.rank),
    originals,candidates,
    admittedOriginals:originals.filter(x=>
      x.status==='exact-conditional-opening').length,
    admittedCandidates:candidates.filter(x=>
      x.status==='exact-conditional-opening').length,
    paperQualifiedGames:0,winRateEstimate:null};
}

module.exports={HP_THRESHOLDS,choose,exactForcedOpening,
  readCardIndex,printedNameMatches,printedPokemon,inspectDeck,studyField};
