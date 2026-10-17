'use strict';

const assert = require('node:assert/strict');
const {bonusExactly, bonusAtLeast} = require('./aichi_bonus_draws.cjs');

/** @param {number} n @param {number} k */
function combination(n, k) {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let i = 1; i <= Math.min(k, n-k); i++) c *= (n-i+1)/i;
  return c;
}

/**
 * Probability conditional on a legal initial opening: a designated Basic
 * starter is in the opening hand, and at least one of every disjoint non-Basic
 * resource group is in the initial hand plus a specified later visible window.
 * Six random Prizes can be marginalised by exchangeability. Later cards do
 * not retroactively alter the chosen starting Active Pokémon.
 *
 * @param {{size:number,hand:number,basics:number,starters:number,groups:number[],later:number}} x
 */
function jointDirect(x) {
  const {size:n,hand:h,basics:b,starters:m,groups,later:d} = x;
  assert.ok([n,h,b,m,d,...groups].every(Number.isInteger));
  assert.ok(n>0 && h>0 && h<=n && b>=m && m>=1 && b<=n &&
    d>=0 && d<=n-h && groups.every(v=>v>=0) &&
    groups.reduce((a,v)=>a+v,0)<=n-b);
  const valid = 1-combination(n-b,h)/combination(n,h);
  let probability = 0;
  for (let mask=0;mask<2**groups.length;mask++) {
    let missing=0, selected=0;
    for (let i=0;i<groups.length;i++) if (mask & (2**i)) {
      missing += groups[i];
      selected++;
    }
    if (n-missing < h+d) continue;
    const missVisible = combination(n-missing,h+d)/combination(n,h+d);
    const starterOpening = 1-combination(n-missing-m,h)/combination(n-missing,h);
    probability += (selected%2 ? -1 : 1)*missVisible*starterOpening;
  }
  return probability/valid;
}

/**
 * Exact average over dual-player mulligan bonus-offer counts. The candidate
 * takes every bonus; any tail offering >= maximum physical draw capacity is
 * collapsed to that maximum. This is a visibility proxy, not a game policy.
 *
 * @param {{size:number,hand:number,prizes:number,basics:number,starters:number,groups:number[],opponentBasics:number}} x
 */
function ironThornsDirect(x) {
  const {size:n,hand:h,prizes,basics:b,opponentBasics:a} = x;
  assert.ok(Number.isInteger(prizes) && prizes>=0 && h+prizes<n);
  assert.ok(Number.isInteger(a) && a>=1 && a<=n);
  const denom = combination(n,h);
  const pOwn = combination(n-b,h)/denom;
  const pOpp = combination(n-a,h)/denom;
  const maxLater = n-h-prizes;
  const firstDraw = jointDirect({...x,later:1});
  let withBonuses = 0;
  for (let k=0;k<maxLater;k++) {
    withBonuses += bonusExactly(pOpp,pOwn,k)*jointDirect({...x,later:k+1});
  }
  withBonuses += bonusAtLeast(pOpp,pOwn,maxLater)*
    jointDirect({...x,later:maxLater});
  return {firstDraw,withAllBonuses:withBonuses};
}

/** Require source manifests only when producing the source-anchored report. */
function main() {
  const manifest = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
  const field = require('../results/aichi-2026/full-decklists.json');
  const count = name => manifest.entries.filter(e=>e.name_en===name)
    .reduce((n,e)=>n+e.count,0);
  assert.equal(manifest.counts.total,60);
  assert.equal(manifest.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  const basics = 17; // Audited source, unchanged across all four Trainer substitutions.
  const starters=count('Mewtwo & Mew-GX');
  const cologne=count('Canceling Cologne');
  const energy=count('Telepathic Psychic Energy')+count('Basic Psychic Energy');
  const powerglass=count('Powerglass');
  assert.deepEqual([starters,cologne,energy,powerglass],[2,2,6,2]);
  for (const rank of [6,24,29]) {
    const opponent=field.decks.find(d=>d.rank===rank);
    assert.ok(opponent);
    assert.deepEqual(opponent.cards.filter(c=>c.category==='Pokémon')
      .map(c=>[c.name,c.count]),[['Iron Thorns ex',4]]);
  }
  const parameters={size:60,hand:7,prizes:6,basics,starters,opponentBasics:4};
  return {
    schema:'new-moon-thorns-direct-starter-resource-joint-v1',
    fixedListHash:manifest.canonical_id_count_sha256,
    benchmarkRanks:[6,24,29],
    assumptions:'Valid initial seven; Mewtwo & Mew-GX physically present as selectable initial Active; disjoint non-Basic resource categories; all optional opponent mulligan bonuses taken; then first mandatory draw; six Prizes randomly marginalised.',
    risks:'Structural card visibility only. This does not establish legal Item use, attack payload access, the right attachments, Powerglass discard fuel, Perfection activation, successful Horror House-GX or win rate.',
    starterOnly:jointDirect({...parameters,groups:[],later:0}),
    starterAndCologne:ironThornsDirect({...parameters,groups:[cologne]}),
    starterCologneEnergy:ironThornsDirect({...parameters,groups:[cologne,energy]}),
    starterCologneEnergyPowerglass:ironThornsDirect({...parameters,groups:[cologne,energy,powerglass]})
  };
}

if (require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={combination,jointDirect,ironThornsDirect,main};
