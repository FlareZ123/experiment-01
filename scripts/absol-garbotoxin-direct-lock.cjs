'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {choose,loadBasicIndex,audit}=require('./aichi_opening_audit.cjs');

/**
 * Exact conditional natural opener probability for the narrow Garbotoxin line:
 * valid Basic-containing opening seven, one first-turn draw, and six Prizes.
 * Requires a Trubbish, a first-turn evolution enabler and Float Stone among
 * the first seven plus first-turn draw, and a Garbodor still in the deck.
 * Excludes search cards and optional opponent-mulligan bonus draws.
 *
 * @param {{basics:number,trubbish:number,enablers:number,floatStone:number,garbodor:number}} x
 * @returns {number}
 */
function directGarbotoxinProbability(x) {
  const {basics,trubbish,enablers,floatStone,garbodor}=x;
  const slots=[trubbish,enablers,floatStone,garbodor,
    basics-trubbish,60-basics-enablers-floatStone-garbodor];
  if(slots.some(n=>!Number.isInteger(n)||n<0) ||
      slots.reduce((a,b)=>a+b,0)!==60 ||
      basics<1 || basics>60) throw new RangeError('Invalid disjoint deck counts');
  const valid7=1-choose(60-basics,7)/choose(60,7);
  if(valid7===0)return 0;
  const selected=Array(slots.length).fill(0);
  let favorable=0;
  /**
   * Enumerate category counts in the first seven, then the eighth draw.
   * Marginalizing over a randomly selected Prize six gives an exact result.
   * @param {number} category
   * @param {number} remaining
   * @param {number} ways
   */
  function walk(category,remaining,ways) {
    if(category<slots.length) {
      const n=slots[category];
      for(let k=0;k<=Math.min(n,remaining);k++) {
        selected[category]=k;
        walk(category+1,remaining-k,ways*choose(n,k));
      }
      return;
    }
    if(remaining!==0||selected[0]+selected[4]===0)return;
    for(let j=0;j<slots.length;j++) {
      const available=slots[j]-selected[j];
      if(available<=0)continue;
      const hasTrubbish=selected[0]+Number(j===0)>0;
      const hasEnabler=selected[1]+Number(j===1)>0;
      const hasTool=selected[2]+Number(j===2)>0;
      if(!hasTrubbish||!hasEnabler||!hasTool)continue;
      const garbodorUnseen=garbodor-selected[3]-Number(j===3);
      if(garbodorUnseen<=0)continue;
      // After the first seven and the subsequent first-turn draw, 52 cards
      // remain: six Prize cards and 46 deck cards. Exclude all-prized targets.
      const allPrized=choose(52-garbodorUnseen,6-garbodorUnseen)/choose(52,6);
      favorable+=ways*(available/53)*(1-allPrized);
    }
  }
  walk(0,7,1);
  return favorable/choose(60,7)/valid7;
}

/** @param {object} deck @param {string} name @returns {number} */
function countCard(deck,name) {
  return deck.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
}

/**
 * Use the exact published rank-specific card quantities and the same
 * source-card Basic index as the established Aichi opening audit.
 * @param {object} manifest
 * @param {Map<string,boolean|null>} basicIndex
 * @returns {object[]}
 */
function buildRows(manifest,basicIndex) {
  const openings=new Map(audit(manifest.decks,basicIndex)
    .map(x=>[x.rank,x.basicCount]));
  const chosen=manifest.decks.filter(d=>d.archetype==='Absol Garbodor');
  if(chosen.length!==4||chosen.map(d=>d.rank).join(',')!=='8,11,16,22')
    throw new Error('Four published Absol Garbodor source ranks changed');
  return chosen.map(deck=>{
    const counts={
      basics:openings.get(deck.rank),
      trubbish:countCard(deck,'Trubbish'),
      garbodor:countCard(deck,'Garbodor'),
      floatStone:countCard(deck,'Float Stone'),
      boostShake:countCard(deck,'Boost Shake'),
      wally:countCard(deck,'Wally')
    };
    return {
      rank:deck.rank,player:deck.player,archetype:deck.archetype,
      ...counts,
      firstTurnGoingFirst:directGarbotoxinProbability({
        ...counts,enablers:counts.boostShake
      }),
      firstTurnGoingSecond:directGarbotoxinProbability({
        ...counts,enablers:counts.boostShake+counts.wally
      })
    };
  });
}

/** @returns {object} */
function main() {
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(
    root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const basics=loadBasicIndex(path.join(root,'resources/cards/en'));
  return {
    kind:'absol-garbotoxin-first-turn-natural-three-part-access',
    source:'results/aichi-2026/full-decklists.json',
    categories:'Trubbish + Float Stone + (Boost Shake or legal Wally)',
    conditioning:'Initial seven contains a Basic; one first-turn draw; six Prize cards',
    guarantee:'Only an uncontested, correctly sequenced potential Garbotoxin setup',
    excluded:'Search, opponent mulligan bonus cards, opposing locks, decisions and other evolution paths',
    qualifiedForCompetitiveInference:false,
    rows:buildRows(manifest,basics)
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={directGarbotoxinProbability,countCard,buildRows,main};
