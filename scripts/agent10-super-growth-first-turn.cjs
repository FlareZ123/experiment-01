'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent10-sentinel-supergrowth-first-turn-reachability-v1';
const ROOT=path.resolve(__dirname,'..');
const SOURCE='results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.psv';
const CHALLENGER='results/aichi-2026/candidate-supergrowth-sentinel-v0.psv';
const ROWLET='Rowlet & Alolan Exeggutor-GX';
const TM='Technical Machine: Evolution';
const HALA='Guzma & Hala';
const TAG='Tag Call';
const BASIC=new Set([
  'Budew','Buneary','Bunnelby','Fan Rotom','Girafarig',
  'Lillipup','Oddish','Pidgey','Relicanth',ROWLET
]);

/** @param {string} p @returns {Map<string,number>} */
function loadDeck(p) {
  const text=fs.readFileSync(path.join(ROOT,p),'utf8');
  const counts=new Map();
  for(const line of text.split(/\r?\n/).filter(Boolean)){
    const fields=line.split('|');
    assert.equal(fields.length,5,'Malformed PSV: '+line);
    const [type,name,,number,countText]=fields;
    assert.ok(['Energy','Pokémon','Trainer'].includes(type));
    assert.ok(name&&number);
    const count=Number(countText);
    assert.ok(Number.isInteger(count)&&count>0&&count<=4,'Invalid count '+line);
    assert.ok(!counts.has(name),'Duplicate name '+name);
    counts.set(name,count);
  }
  assert.equal([...counts.values()].reduce((a,b)=>a+b,0),60);
  return counts;
}

/** @param {Map<string,number>} counts */
function makePhysicalDeck(counts) {
  return [...counts].flatMap(([name,count])=>Array(count).fill(name));
}

/** Deterministic, independent seeded reproducibility; never a physical-deal pairing across lists.
 * @param {number} seed @returns {()=>number}
 */
function xorshift32(seed) {
  let state=seed>>>0;
  assert.notEqual(state,0);
  return ()=>{
    state^=(state<<13);state^=state>>>17;state^=(state<<5);
    return state>>>0;
  };
}

/** Unbiased bounded index for Fisher-Yates. @param {()=>number} next @param {number} bound */
function indexBelow(next,bound){
  const range=0x100000000;
  const limit=range-(range%bound);
  let value;
  do{value=next();}while(value>=limit);
  return value%bound;
}

/** @param {string[]} cards @param {()=>number} next */
function shuffle(cards,next){
  for(let i=cards.length-1;i>0;i--){
    const j=indexBelow(next,i+1);
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
}

/** @param {string[]} items @returns {Map<string,number>} */
function counts(items){
  const map=new Map();
  for(const item of items)map.set(item,(map.get(item)??0)+1);
  return map;
}

/** @param {Map<string,number>} map @param {string} name */
function has(map,name){return (map.get(name)??0)>0;}

/** @param {Map<string,number>} map */
function size(map){return [...map.values()].reduce((a,b)=>a+b,0);}

/**
 * Legal initial seven, then six unseen Prize cards, then one ordinary going-second draw.
 * Priority of the chosen opening Active is fixed before viewing the Prize cards/draw.
 * @param {string[]} shuffled @param {'tm'|'super'} route
 */
function state(shuffled,route){
  const seven=shuffled.slice(0,7);
  if(!seven.some(name=>BASIC.has(name)))return null;
  const preferred=route==='tm'?'Bunnelby':ROWLET;
  const active=seven.includes(preferred)?preferred:
    seven.includes('Oddish')?'Oddish':seven.find(name=>BASIC.has(name));
  const hand=counts([...seven,shuffled[13]]);
  hand.set(active,hand.get(active)-1);
  return {active,hand,deck:counts(shuffled.slice(14))};
}

/** @param {ReturnType<typeof state>} s */
function superGrowth(s){
  const {active,hand,deck}=s;
  if(!has(deck,'Gloom')||!has(deck,'Vileplume'))return 'EVOLUTION_NOT_IN_DECK';
  const rowlet=active===ROWLET||has(hand,ROWLET);
  const oddish=active==='Oddish'||has(hand,'Oddish');
  const needStadium=!oddish&&!has(hand,'Artazon');
  const needJet=active!==ROWLET&&!has(hand,'Jet Energy');
  if(!rowlet&&(!has(hand,TAG)||!has(deck,ROWLET)))return 'NO_TAG_TEAM_ACCESS';
  if(!oddish&&(!has(deck,'Oddish')||
      !has(hand,'Artazon')&&!has(deck,'Artazon')))return 'NO_ODDISH_ACCESS';
  if(needJet&&!has(deck,'Jet Energy'))return 'NO_JET_ACCESS';
  const needHala=needStadium||needJet;
  if(needHala&&!has(hand,HALA)&&(!has(hand,TAG)||!has(deck,HALA)))
    return 'NO_SUPPORTER_ACCESS';
  const useTag=!rowlet||(needHala&&!has(hand,HALA));
  const protectedHeld=
    Number(active!==ROWLET&&has(hand,ROWLET))+
    Number(oddish&&active!=='Oddish'&&has(hand,'Oddish'))+
    Number(active!==ROWLET&&has(hand,'Jet Energy'))+
    Number(!oddish&&has(hand,'Artazon'));
  const uncommitted=size(hand)-Number(useTag)-
    Number(needHala&&has(hand,HALA))-protectedHeld;
  if(needJet&&uncommitted<2)return 'HALA_PAYMENT_UNAVAILABLE';
  return 'REACHABLE';
}

/** @param {ReturnType<typeof state>} s */
function tmBarrage(s){
  const {active,hand,deck}=s;
  if(!has(deck,'Gloom')||!has(deck,'Vileplume'))return 'EVOLUTION_NOT_IN_DECK';
  const bunny=active==='Bunnelby'||has(hand,'Bunnelby');
  const oddish=active==='Oddish'||has(hand,'Oddish');
  if(!bunny&&!oddish)return 'NO_BUNNY_OR_ODDISH';
  const needArtazon=!bunny||!oddish;
  if(needArtazon&&!has(hand,'Artazon')&&!has(deck,'Artazon'))
    return 'NO_ARTAZON';
  if(!bunny&&!has(deck,'Bunnelby'))return 'NO_BUNNY_IN_DECK';
  if(!oddish&&!has(deck,'Oddish'))return 'NO_ODDISH_IN_DECK';
  const heldTm=has(hand,TM);
  if(!heldTm&&!has(deck,TM))return 'NO_TM_IN_DECK';
  const heldEnergy=active==='Bunnelby'?
    ['Jet Energy','Capture Energy','Grass Energy'].some(n=>has(hand,n)):
    has(hand,'Jet Energy');
  const needEnergy=!heldEnergy;
  if(needEnergy&&!has(deck,'Jet Energy'))return 'NO_JET_IN_DECK';
  const needStadium=needArtazon&&!has(hand,'Artazon');
  const needTool=!heldTm;
  const needHala=needStadium||needTool||needEnergy;
  if(needHala&&!has(hand,HALA)&&(!has(hand,TAG)||!has(deck,HALA)))
    return 'NO_SUPPORTER_ACCESS';
  const useTag=needHala&&!has(hand,HALA);
  const protectedHeld=
    Number(active!=='Bunnelby'&&has(hand,'Bunnelby'))+
    Number(active!=='Oddish'&&has(hand,'Oddish'))+
    Number(needArtazon&&has(hand,'Artazon'))+
    Number(heldTm)+Number(heldEnergy);
  const uncommitted=size(hand)-Number(useTag)-
    Number(needHala&&has(hand,HALA))-protectedHeld;
  if(needHala&&(needTool||needEnergy)&&uncommitted<2)
    return 'HALA_PAYMENT_UNAVAILABLE';
  return 'REACHABLE';
}

/** @param {number} successes @param {number} trials */
function wilson95(successes,trials){
  const z=1.959963984540054,p=successes/trials,z2=z*z;
  const denominator=1+z2/trials;
  const midpoint=(p+z2/(2*trials))/denominator;
  const width=z*Math.sqrt((p*(1-p)+z2/(4*trials))/trials)/denominator;
  return [midpoint-width,midpoint+width];
}

/**
 * Opportunity model, not a playable decision policy or observed match.
 * @param {Map<string,number>} deck
 * @param {'tm'|'super'} route
 * @param {number} trials
 * @param {number} seed
 */
function simulate(deck,route,trials,seed){
  assert.ok(Number.isSafeInteger(trials)&&trials>0);
  const cards=makePhysicalDeck(deck);
  assert.equal(cards.length,60);
  const next=xorshift32(seed);
  const reasons={};
  let accepted=0,reachable=0;
  for(let i=0;i<trials;i++){
    shuffle(cards,next);
    const deal=state(cards,route);
    if(!deal)continue;
    accepted++;
    const reason=route==='tm'?tmBarrage(deal):superGrowth(deal);
    reasons[reason]=(reasons[reason]??0)+1;
    if(reason==='REACHABLE')reachable++;
  }
  assert.equal(Object.values(reasons).reduce((a,b)=>a+b,0),accepted);
  return {
    route,shuffles:trials,validSeven:accepted,reachable,
    legalOpeningFraction:accepted/trials,
    conditionalOpportunity:reachable/accepted,
    wilson95:wilson95(reachable,accepted),firstFailedPrerequisite:reasons,
    exclusions:['no opponent mulligan bonus cards','no optional draw or extra searches',
      'no opponent locks/interference','no human discard-value constraints',
      'no native Store/card action validation','no subsequent game outcome']
  };
}

/** @param {number} samples */
function run(samples=1000000){
  const original=loadDeck(SOURCE),challenger=loadDeck(CHALLENGER);
  const names=new Set([...original.keys(),...challenger.keys()]);
  const changes=[...names].map(name=>({
    name,delta:(challenger.get(name)??0)-(original.get(name)??0)
  })).filter(c=>c.delta!==0).sort((a,b)=>a.name.localeCompare(b.name));
  assert.deepEqual(changes,[
    {name:ROWLET,delta:2},{name:TM,delta:-2}
  ]);
  const baseline=simulate(original,'tm',samples,20261109);
  const treatment=simulate(challenger,'super',samples,20261110);
  return {
    version:VERSION,comparison:'separate independent shuffled complete 60s',
    baselinePrinted60:SOURCE,challengerPrinted60:CHALLENGER,
    confirmedTwoSlotReplacement:changes,
    baseline,treatment,
    differenceInConditionalOpportunity:
      treatment.conditionalOpportunity-baseline.conditionalOpportunity,
    competitiveQualifiedGames:0,
    disclaimer:'Two route-restricted favorable-state screens only. A feasible line is not a selected action, lock settlement, terminal result, or win. Baseline other routes and challenger secondary lines are intentionally excluded.'
  };
}

if(require.main===module){
  const samples=Number(process.env.AGENT10_SUPERGROWTH_SAMPLES??1000000);
  console.log(JSON.stringify(run(samples),null,2));
}
module.exports={VERSION,SOURCE,CHALLENGER,ROWLET,BASIC,loadDeck,makePhysicalDeck,
  shuffle,state,superGrowth,tmBarrage,wilson95,simulate,run};
