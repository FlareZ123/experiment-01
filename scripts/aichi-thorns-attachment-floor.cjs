'use strict';

const assert = require('node:assert/strict');
const {choose, fraction} = require('./aichi-rank6-energy-prize-frontier.cjs');

/**
 * Minimum ordinary hand attachments that could eventually fund Volt Cyclone,
 * ignoring where initially unprized cards actually are, Stadium/search access,
 * evolving turns, opposing effects and discard/recovery.
 * @param {{thunderAvailable:boolean,dceAvailable:boolean,
 *   lightningUnits:number,colorlessUnits:number}} resources
 * @returns {1|2|3|null} null if none of these cost routes are supplied.
 */
function minimumAttachments(resources) {
  const {thunderAvailable,dceAvailable,lightningUnits,colorlessUnits} = resources;
  if (thunderAvailable) {
    if (dceAvailable) return 1;
    return lightningUnits + colorlessUnits >= 2 ? 2 : null;
  }
  if (!lightningUnits) return null;
  if (dceAvailable) return 2;
  return lightningUnits + colorlessUnits >= 3 ? 3 : null;
}

/**
 * Exhaustive exact source-count Prize classes, with independent first-seven
 * legal-Basic conditioning. A route is a physical energy-count floor, never
 * an actual in-game attack, playable hand or win probability.
 * @param {object} source Exact published 60-card Aichi source row.
 * @returns {object} Four outcome classes by minimum hand attachments.
 */
function attachmentFloorByPrizes(source) {
  assert.ok([6,24,29].includes(source.rank));
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  const count = name => source.cards
    .filter(c=>c.name===name).reduce((n,c)=>n+c.count,0);
  const m = count('Double Colorless Energy');
  const c = count('Capture Energy') + count('Spiky Energy');
  assert.equal(count('Iron Thorns ex'),4);
  assert.equal(source.cards.filter(x=>x.category==='Pokémon')
    .reduce((n,x)=>n+x.count,0),4);
  assert.equal(count('Thunder Mountain ♢'),1);
  assert.equal(count('Speed Lightning Energy'),4);
  assert.equal(m,source.rank===24?3:1);
  assert.equal(c,4-m);
  assert.equal(count('Capture Energy'),source.rank===24?1:2);
  assert.equal(count('Spiky Energy'),source.rank===24?0:1);
  assert.equal(source.cards.filter(x=>x.category==='Energy')
    .reduce((n,x)=>n+x.count,0),8);

  const subsets={'1':0n,'2':0n,'3':0n,unavailable:0n};
  const legal={'1':0n,'2':0n,'3':0n,unavailable:0n};
  for(let t=0;t<=1;t++)for(let d=0;d<=m;d++)
  for(let l=0;l<=4;l++)for(let colorless=0;colorless<=c;colorless++)
  for(let basics=0;basics<=4;basics++){
    const other=6-t-d-l-colorless-basics;
    const combinations=choose(1,t)*choose(m,d)*choose(4,l)*
      choose(c,colorless)*choose(4,basics)*choose(47,other);
    if(!combinations)continue;
    const floor=minimumAttachments({
      thunderAvailable:t===0,dceAvailable:d<m,
      lightningUnits:4-l,colorlessUnits:c-colorless
    });
    const key=floor===null?'unavailable':String(floor);
    const legalHands=choose(54,7)-choose(50+basics,7);
    subsets[key]+=combinations;
    legal[key]+=combinations*legalHands;
  }
  const totalSubsets=Object.values(subsets).reduce((a,b)=>a+b,0n);
  const totalLegal=Object.values(legal).reduce((a,b)=>a+b,0n);
  assert.equal(totalSubsets,choose(60,6));
  assert.equal(totalLegal,(choose(60,7)-choose(56,7))*choose(53,6));
  assert.equal(subsets.unavailable,55n);
  return {
    model:'three-thorns-initial-prizes-attachment-floor-v1',
    rank:source.rank,dceCopies:m,
    unconditional:Object.fromEntries(Object.entries(subsets)
      .map(([k,v])=>[k,fraction(v,totalSubsets)])),
    conditionedOnBasicValidFirstSeven:Object.fromEntries(Object.entries(legal)
      .map(([k,v])=>[k,fraction(v,totalLegal)])),
    caveat:'Minimum physical hand-attachment count only. No available hand, turn timing, Stadium search, opponent, discard or game simulation.'
  };
}

module.exports={minimumAttachments,attachmentFloorByPrizes};
if(require.main===module){
  const {decks}=require('../results/aichi-2026/full-decklists.json');
  process.stdout.write(JSON.stringify([6,24,29].map(rank=>
    attachmentFloorByPrizes(decks.find(x=>x.rank===rank))),null,2)+'\n');
}
