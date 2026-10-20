'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,fraction}=
  require('./aichi-rank15-dual-lock-prize-ceiling.cjs');

/**
 * Category order: Basic Pokémon, Basic Psychic Energy, other Psychic-providing
 * Energy, Fog Crystal, other cards. Categories are mutually exclusive.
 * @typedef {[number,number,number,number,number]} Inventory
 */

/**
 * Enumerate all five-category draws without materializing any card identities.
 * @param {number} total Requested cards.
 * @param {Inventory} caps Available category counts.
 * @param {(counts:Inventory)=>void} visit Complete allocation callback.
 */
function allocations(total,caps,visit){
  const output=[0,0,0,0,0];
  function recurse(i,left){
    if(i===caps.length){
      if(left===0)visit(output.slice());
      return;
    }
    for(let k=0;k<=Math.min(left,caps[i]);k++){
      output[i]=k;
      recurse(i+1,left-k);
    }
  }
  recurse(0,total);
}

/** @param {Inventory} pool @param {Inventory} taken @returns {Inventory} */
function subtract(pool,taken){
  return pool.map((n,i)=>n-taken[i]);
}

/** @param {Inventory} pool @param {Inventory} taken @returns {bigint} */
function ways(pool,taken){
  return pool.reduce((weight,n,i)=>weight*choose(n,taken[i]),1n);
}

/**
 * Exhaustive physical-deal census: hand seven, face-down six Prize cards,
 * then one through three ordinary player draws.
 *
 * "Available" counts direct Psychic-providing Energy in hand plus up to one
 * unprized Basic Psychic Energy still in deck per held Fog Crystal. It assumes
 * every held Fog can be played and devoted to Energy, and completely ignores
 * Item lock, Supporter turns, manual attachments, alternate search, damage,
 * opponent denials, and actual deck strategy. Thus these values are neither
 * win rates nor global bounds on playable Energy or attack probability.
 *
 * @param {Inventory} inventory 60-card mutually exclusive categories.
 * @param {number} draws Number of regular draws after opening and Prizes.
 * @returns {object} Exact counts and reduced rational resource probabilities.
 */
function fogEnergyOpportunity(inventory,draws){
  assert.ok(Array.isArray(inventory)&&inventory.length===5&&
    inventory.every(n=>Number.isInteger(n)&&n>=0));
  assert.equal(inventory.reduce((s,n)=>s+n,0),60);
  assert.ok(Number.isInteger(draws)&&draws>=1&&draws<=3);
  const successes=[0n,0n,0n,0n,0n];
  let legalWeight=0n;
  allocations(7,inventory,hand=>{
    if(hand[0]===0)return;
    const handWeight=ways(inventory,hand);
    const afterHand=subtract(inventory,hand);
    allocations(6,afterHand,prizes=>{
      const prizeWeight=handWeight*ways(afterHand,prizes);
      const afterPrizes=subtract(afterHand,prizes);
      allocations(draws,afterPrizes,drawn=>{
        const weight=prizeWeight*ways(afterPrizes,drawn);
        legalWeight+=weight;
        const directlySeen=hand[1]+hand[2]+drawn[1]+drawn[2];
        const heldFog=hand[3]+drawn[3];
        const deckPsychic=afterPrizes[1]-drawn[1];
        const reachable=directlySeen+Math.min(heldFog,deckPsychic);
        for(let threshold=1;threshold<=4;threshold++){
          if(reachable>=threshold)successes[threshold]+=weight;
        }
      });
    });
  });
  const expectedWeight=
    (choose(60,7)-choose(60-inventory[0],7))*
    choose(53,6)*choose(47,draws);
  assert.equal(legalWeight,expectedWeight,
    'Exhaustive legal-opening and Prize/draw allocation must conserve weight');
  return {
    schema:'aichi-restricted-fog-energy-source-access-v1',
    inventory:inventory.slice(),draws,legalOpening:true,
    numPrizes:6,accessRoute:'direct Energy or Fog Crystal for Basic Psychic only',
    thresholds:Object.fromEntries([1,2,3,4].map(threshold=>[
      String(threshold),fraction(successes[threshold],legalWeight)])),
    interpretation:'Restricted hypothetical inventory access; no real game or qualified win'
  };
}

/**
 * Bind the model to both unchanged printed candidate lists in this repo.
 * Basic status is independently verified for the source champion through the
 * bundled card-pool helper and for the proxy through its two Stage-1 Dusclops.
 * @param {string} root Repository root.
 * @returns {object} Restricted first-three-draw resource table.
 */
function fromCandidateManifests(root=path.resolve(__dirname,'..')){
  const field=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=field.decks.find(d=>d.rank===1);
  assert.ok(champion);
  const championCopies=(name)=>champion.cards.filter(x=>x.name===name)
    .reduce((s,x)=>s+x.count,0);
  assert.equal(champion.cards.reduce((s,x)=>s+x.count,0),60);
  // The reference 60 has exactly four Stage-1 Shadow Rider VMAX cards.
  // Every other listed Pokémon is a printed Basic. Explicit source counts
  // avoid resolving Limitless SMP promo set aliases through another helper.
  const championPokemon=champion.cards.filter(x=>x.category==='Pokémon')
    .reduce((s,x)=>s+x.count,0);
  assert.equal(championCopies('Shadow Rider Calyrex VMAX'),4);
  assert.equal(championPokemon,18);
  const championBasic=championPokemon-4;
  assert.equal(championBasic,14);
  assert.equal(championCopies('Psychic Energy'),11);
  assert.equal(championCopies('Fog Crystal'),4);

  const proxy=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  assert.equal(proxy.schema,'new-moon-lockbreak-English-mechanical-proxy-v1');
  assert.equal(proxy.counts.total,60);
  assert.equal(proxy.counts['Pokémon'],19);
  const proxyCopies=(name)=>proxy.entries.filter(x=>x.name_en===name)
    .reduce((s,x)=>s+x.count,0);
  assert.equal(proxyCopies('Dusclops'),2);
  const proxyBasic=proxy.counts['Pokémon']-proxyCopies('Dusclops');
  assert.equal(proxyBasic,17);
  assert.equal(proxyCopies('Basic Psychic Energy'),3);
  assert.equal(proxyCopies('Telepathic Psychic Energy'),3);
  assert.equal(proxyCopies('Fog Crystal'),4);

  const source=[championBasic,11,0,4,60-championBasic-11-4];
  const newMoon=[proxyBasic,3,3,4,60-proxyBasic-3-3-4];
  const tables={
    rank1Champion:{inventory:source,byDraw:{}},
    newMoonLockbreaker:{inventory:newMoon,byDraw:{}}
  };
  for(const draws of [1,2,3]){
    tables.rank1Champion.byDraw[draws]=fogEnergyOpportunity(source,draws);
    tables.newMoonLockbreaker.byDraw[draws]=
      fogEnergyOpportunity(newMoon,draws);
  }
  return {
    schema:'aichi-two-fixed-candidates-fog-energy-comparison-v1',
    sourceRank:1,candidateCount:2,cardsPerDeck:60,
    scope:'Restricted Energy plus Fog cards after Basic-valid opening, six Prizes, first three ordinary draws',
    countsQualifiedCompetitiveWins:0,tables
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(fromCandidateManifests(),null,2)+'\n');
}
module.exports={allocations,subtract,ways,fogEnergyOpportunity,
  fromCandidateManifests};
