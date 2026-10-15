'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n Population. @param {number} k Selection size. */
function choose(n,k) {
  if (k < 0 || k > n) return 0;
  let result=1;
  for(let i=1;i<=k;i++) result=result*(n-k+i)/i;
  return result;
}

/**
 * Exact opening chances conditional on a valid (non-mulligan) hand.
 * @param {{deckSize:number,handSize:number,basics:number,budew:number,regidragoV:number}} p
 */
function openingProbabilities(p) {
  const {deckSize:N,handSize:h,basics:b,budew:u,regidragoV:r}=p;
  if (![N,h,b,u,r].every(Number.isInteger) || N < 1 || h < 1 ||
      h > 7 || h > N || b < 1 || b > N || u < 0 || r < 0 || u+r > b) {
    throw new Error('Invalid disjoint opening categories');
  }
  const total=choose(N,h),valid=total-choose(N-b,h);
  return {
    valid:valid/total,
    budew:(total-choose(N-u,h))/valid,
    forcedBudew:(choose(N-b+u,h)-choose(N-b,h))/valid,
    budewAndRegidragoV:(total-choose(N-u,h)-choose(N-r,h)+choose(N-u-r,h))/valid
  };
}

/** Source-printing-verified Budew and separately audited Basic counts. */
function auditPublishedBudew() {
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const audit=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/opening-hand-audit.json'),'utf8'));
  const byRank=new Map(audit.decks.map(d=>[d.rank,d]));
  return manifest.decks.flatMap(deck=>{
    const budew=deck.cards.filter(c=>c.name==='Budew' && c.printing.set==='ASC' &&
      String(c.printing.number)==='16').reduce((sum,c)=>sum+c.count,0);
    if (!budew) return [];
    const known=byRank.get(deck.rank);
    if (!known || known.unresolved_pokemon.length) {
      throw new Error('Unverified Basic count at rank '+deck.rank);
    }
    const basics=known.basic_count_known;
    const auditedBudew=known.basics.filter(c=>c.name==='Budew').reduce((sum,c)=>sum+c.count,0);
    const regidragoV=deck.cards.filter(c=>c.name==='Regidrago V').reduce((sum,c)=>sum+c.count,0);
    if (auditedBudew!==budew || basics<budew+regidragoV ||
        deck.cards.reduce((sum,c)=>sum+c.count,0)!==60) {
      throw new Error('Aichi source mismatch at rank '+deck.rank);
    }
    return [{rank:deck.rank,archetype:deck.archetype,basics,budewCopies:budew,regidragoV,
      ...openingProbabilities({deckSize:60,handSize:7,basics,budew,regidragoV})}];
  });
}

/** @param {number} x Probability. */
function pct(x) { return (x*100).toFixed(2)+'%'; }

/** @param {ReturnType<typeof auditPublishedBudew>} rows */
function markdownTable(rows) {
  return [
    '| Rank | Archetype | Basics | Budew | Opening Budew | Forced Budew-only Basic | Budew + Regidrago V |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map(r=>`| ${r.rank} | ${r.archetype} | ${r.basics} | ${r.budewCopies} | ${pct(r.budew)} | ${pct(r.forcedBudew)} | ${r.regidragoV?pct(r.budewAndRegidragoV):'N/A'} |`)
  ].join('\n');
}
if(require.main===module) console.log(markdownTable(auditPublishedBudew()));
module.exports={choose,openingProbabilities,auditPublishedBudew,markdownTable};
