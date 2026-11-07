'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  choose,readCardIndex,printedPokemon,inspectDeck
}=require('./aichi-forced-active-opener.cjs');

/*
 * Intentionally short, card-text-verified registry of Active-position
 * suppressors of Meloetta ex BLK44 Debut Performance during source's
 * first turn going first. Other effects are not assumed ineffective;
 * this registry does not claim exhaustiveness beyond audited printings.
 */
const DENIAL_PRINTS=Object.freeze({
  'sv1-96':{name:'Klefki',ability:'Mischievous Lock',marker:'Basic Pokémon'},
  'sv6-77':{name:'Iron Thorns ex',ability:'Initialization',marker:'Rule Box'}
});

/**
 * The opponent's initial seven, before opponent mulligan bonus draws,
 * may contain an active-ready blocker. The source's first attack can
 * still escape the blocker with Canceling Cologne or another effect.
 * @param {object} card Exact printed Pokémon.
 * @param {object} melo Exact printed source Meloetta.
 * @returns {boolean}
 */
function deniesMeloetta(card,melo){
  const registered=DENIAL_PRINTS[card.id];
  if(!registered)return false;
  if(!card.subtypes.includes('Basic')||!melo.subtypes.includes('Basic')||
      !melo.subtypes.includes('ex')||melo.subtypes.includes('Future'))
    return false;
  const ability=card.abilities?.find(a=>a.name===registered.ability);
  if(card.name!==registered.name||!ability?.text.includes(registered.marker)||
      !/Active Spot/.test(ability.text)||!/have no Abilities/.test(ability.text))
    throw Error('Registered source-text denominator changed: '+card.id);
  if(card.id==='sv1-96')
    assert.match(ability.text,/except for Mischievous Lock/);
  if(card.id==='sv6-77')
    assert.match(ability.text,/except for Future Pokémon/);
  return true;
}

/**
 * Read a fixed printed 60 with the existing conservative HP/Basic
 * admission, then compute exact initial seven hand events.
 * @param {object} deck Fixed 60.
 * @param {object} index English card index.
 * @param {object} sourceMelo Printed source Meloetta.
 * @returns {object}
 */
function openingDenialResources(deck,index,sourceMelo){
  const general=inspectDeck(deck,index);
  if(general.status!=='exact-conditional-opening')
    return {status:'setup-denial-unresolved',reason:general};
  const B=general.basics;
  let L=0;
  const printingCounts=[];
  for(const row of deck.cards.filter(c=>c.category==='Pokémon')){
    const card=printedPokemon(row,index);
    if(deniesMeloetta(card,sourceMelo)){
      L+=row.count;
      printingCounts.push({name:card.name,id:card.id,count:row.count,
        ability:card.abilities.find(a=>a.name===DENIAL_PRINTS[card.id].ability).name});
    }
  }
  const denom=BigInt(general.legalHands);
  const favorableForced=BigInt(L)*choose(60-B,6);
  const favorableAvailable=choose(60,7)-choose(60-L,7);
  assert.ok(favorableAvailable>=favorableForced);
  return {status:'exact-first-seven-resource-only',
    basics:B,denialCopies:L,printings:printingCounts,
    forcedDenialActive:{numerator:String(favorableForced),
      denominator:String(denom),probability:Number(favorableForced)/Number(denom)},
    availabilityToChooseDenialActive:{numerator:String(favorableAvailable),
      denominator:String(denom),probability:Number(favorableAvailable)/Number(denom)},
    conditionalSoleBasic:general.exactlyOneBasicProbability};
}

/**
 * Evaluate all 29 published original 60s and six unchanged fixed candidates.
 * The condition is ranked source26 first-turn Meloetta ex Debut Performance.
 * @param {string} root repository root
 * @returns {object}
 */
function fieldDenialResources(root){
  const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
  const roster=read('results/aichi-2026/full-decklists.json');
  const index=readCardIndex(root);
  const rank26=roster.decks.find(x=>x.rank===26);
  const mel=printedPokemon(rank26.cards.find(c=>c.name==='Meloetta ex'),index);
  assert.equal(mel?.id,'zsv10pt5-44');
  assert.ok(mel.abilities?.some(a=>a.name==='Debut Performance'&&
    /If you go first/.test(a.text)&&/first turn/.test(a.text)));

  const namedCandidates=[
    ['Champion',roster.decks.find(x=>x.rank===1)],
    ['Hood Shield',read('results/aichi-2026/candidate-hood-shadow-rider.json')],
    ['Temple Shadow Rider',read('results/aichi-2026/candidate-temple-shadow-rider.json')],
    ['Apex Alchemy',read('results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json')],
    ['Sentinel Lopunny',read('results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json')]
  ];
  const nm=read('results/als/new-moon-lockbreak-english-proxy-60.json');
  namedCandidates.push(['New Moon Lockbreaker',{
    cards:nm.entries.map(c=>({category:c.type,name:c.name_en,count:c.count,
      english_proxy_card_id:c.english_proxy_card_id}))
  }]);

  const originals=roster.decks.map(deck=>({
    rank:deck.rank,archetype:deck.archetype,
    ...openingDenialResources(deck,index,mel)
  }));
  const candidates=namedCandidates.map(([name,deck])=>({
    name,...openingDenialResources(deck,index,mel)
  }));
  return {schema:'agent1-rank26-debut-performance-active-denial-seven-v1',
    sourceRank:26,sourceMeloetta:'Meloetta ex BLK 44',
    definition:'Only source-text-verified Active Klefki SVI96 or Iron Thorns ex TWM77; resource events before optional setup compensation, card effects or response.',
    admittedOriginals:originals.filter(x=>
      x.status==='exact-first-seven-resource-only').length,
    admittedCandidates:candidates.filter(x=>
      x.status==='exact-first-seven-resource-only').length,
    originalMissingRanks:roster.missing_full_lists.map(x=>x.rank),
    originals,candidates,competitiveGamesQualified:0,
    winRateEstimate:null};
}

module.exports={DENIAL_PRINTS,deniesMeloetta,
  openingDenialResources,fieldDenialResources};
