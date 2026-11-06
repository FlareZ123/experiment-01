'use strict';

const assert=require('node:assert/strict');
const {decks}=require('../../results/aichi-2026/full-decklists.json');
const {choose}=require('./agent18-rank6-held-stadium-energy-bypass.cjs');

const ORIGINAL_IRON_THORNS_RANKS=Object.freeze([6,24,29]);
const GROUPS=Object.freeze({
  basic:{name:'Iron Thorns ex',set:'TWM'},
  guzma:{name:'Guzma',set:'BUS'},
  hala:{name:'Guzma & Hala',set:'CEC'},
  tag:{name:'Tag Call',set:'CEC'},
  mail:{name:"Trainers' Mail",set:'ROS'},
  thunder:{name:'Thunder Mountain ♢',set:'LOT'},
  dce:{name:'Double Colorless Energy',set:'SUM'}
});

/**
 * Recover actual source-printed names/counts from the committed source roster.
 * This is an opening resource model, not source printing legality certification.
 * @param {6|24|29} rank
 * @returns {object}
 */
function groupOriginalSixty(rank){
  assert.ok(ORIGINAL_IRON_THORNS_RANKS.includes(rank));
  const deck=decks.find(d=>d.rank===rank);
  assert.ok(deck&&Array.isArray(deck.cards));
  assert.equal(deck.cards.reduce((a,c)=>a+c.count,0),60);
  const counts={};
  for(const [group,match] of Object.entries(GROUPS)){
    counts[group]=deck.cards.filter(row=>
      row.name===match.name&&row.printing?.set===match.set)
      .reduce((a,row)=>a+row.count,0);
  }
  assert.equal(counts.basic,4);
  assert.equal(deck.cards.filter(row=>row.category==='Pokémon')
    .reduce((a,c)=>a+c.count,0),counts.basic);
  assert.equal(counts.thunder,1);
  assert.ok(counts.dce>0);
  const selected=Object.values(counts).reduce((a,n)=>a+n,0);
  counts.other=60-selected;
  assert.ok(counts.other>=0);
  return {rank,player:deck.player,archetype:deck.archetype,...counts};
}

/** @param {bigint} a @param {bigint} b */
function gcd(a,b){
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/**
 * Both singleton Thunder Mountain and >=1 DCE are held across a legal
 * Basic-containing initial seven and one going-second natural draw.
 * No held G&H, Tag Call or Trainers' Mail may be present.
 *
 * For a fixed unordered observed eight-card set with b Basic Pokémon,
 * exactly 8 choices of the final card are compatible with a legal initial7
 * when b>=2; only 7 choices qualify when b=1 (the Basic cannot be last).
 * Six face-down Prize cards, distributed between seven and eighth, vanish
 * under exact marginalization. This is a finite-population count.
 *
 * @param {6|24|29} rank
 * @param {{requireGuzma?:boolean,exactlyOneBasic?:boolean}} [options]
 * @returns {{rank:number,numerator:bigint,denominator:bigint,
 *   percentage:number,favorable:bigint,
 *   requireGuzma:boolean,exactlyOneBasic:boolean,counts:object}}
 */
function directlyHeldThornsResources(rank,options={}){
  const {requireGuzma=false,exactlyOneBasic=false}=options;
  const counts=groupOriginalSixty(rank);
  const denominator=(choose(60,7)-choose(60-counts.basic,7))*53n;
  let favorable=0n;
  for(let b=1;b<=counts.basic;b++){
    if(exactlyOneBasic&&b!==1)continue;
    for(let d=1;d<=counts.dce;d++){
      for(let g=Number(requireGuzma);g<=counts.guzma;g++){
        const other=8-b-1-d-g;
        const sets=choose(counts.basic,b)*choose(counts.dce,d)*
          choose(counts.guzma,g)*choose(counts.other,other);
        favorable+=sets*BigInt(b===1?7:8);
      }
    }
  }
  assert.ok(favorable>0n&&favorable<=denominator);
  const factor=gcd(favorable,denominator);
  return {
    rank,numerator:favorable/factor,denominator:denominator/factor,
    percentage:100*Number(favorable)/Number(denominator),
    favorable,requireGuzma,exactlyOneBasic,counts
  };
}

module.exports={
  ORIGINAL_IRON_THORNS_RANKS,GROUPS,groupOriginalSixty,
  directlyHeldThornsResources
};
