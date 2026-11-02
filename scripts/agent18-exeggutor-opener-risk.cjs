'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0 && Number.isSafeInteger(k) && k >= 0);
  if (k > n) return 0n;
  let r = 1n;
  for (let j = 1; j <= Math.min(k, n-k); j++) r = r * BigInt(n-j+1) / BigInt(j);
  return r;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {while (b) [a,b] = [b,a%b]; return a;}

/**
 * A valid opening with at least one Basic, but every held Basic belongs to
 * a designated fragile subtype, so its selection as Active is unavoidable.
 * No opponent actions, bonus draws, Benching or card effects are modeled.
 * @param {number} n Deck size.
 * @param {number} basics All Basic Pokemon copies.
 * @param {number} fragile Physically fragile Basic copies.
 * @param {number} hand Opening hand cards.
 * @returns {{fraction:string,probability:number,numerator:string,denominator:string}}
 */
function onlyFragileBasicsConditional(n, basics, fragile, hand=7) {
  assert.ok([n,basics,fragile,hand].every(Number.isSafeInteger));
  assert.ok(n>hand && basics>0 && fragile>0 && fragile<=basics);
  const nonBasics=n-basics;
  const good=choose(nonBasics+fragile,hand)-choose(nonBasics,hand);
  const valid=choose(n,hand)-choose(nonBasics,hand);
  assert.ok(good>0n && valid>=good);
  const d=gcd(good,valid);
  return {fraction:String(good/d)+'/'+String(valid/d),
    probability:Number(good)/Number(valid),
    numerator:String(good/d),denominator:String(valid/d)};
}

/** @param {object} original Source rank-2 original 60. @param {object} candidate Frozen challenger JSON. */
function validateExactSwap(original,candidate) {
  assert.equal(original.rank,2);
  assert.equal(candidate.sourceDeckRank,2);
  const counts = list => {
    const m = new Map();
    for (const c of list) {
      assert.ok(Number.isInteger(c.count) && c.count>0);
      const k=[c.category,c.printing.set,String(c.printing.number),c.name].join('|');
      assert.ok(!m.has(k),'duplicate printing row '+k);
      m.set(k,c.count);
    }
    return m;
  };
  const originalRows=counts(original.cards), candidateRows=counts(candidate.cards);
  const expected=new Map(originalRows);
  expected.delete('Pokémon|CEC|174|Lillipup');
  expected.delete('Pokémon|SUM|104|Herdier');
  expected.delete('Pokémon|BCR|122|Stoutland');
  expected.set('Pokémon|PLF|4|Exeggcute',1);
  expected.set('Pokémon|MEG|4|Exeggcute',1);
  expected.set('Pokémon|PLF|5|Exeggutor',2);
  expected.set('Energy|PAL|190|Jet Energy',3);
  assert.deepEqual([...candidateRows].sort(),[...expected].sort());
  assert.equal([...candidateRows.values()].reduce((a,b)=>a+b),60);
  assert.equal([...originalRows.values()].reduce((a,b)=>a+b),60);
  const category=c=>candidate.cards.filter(x=>x.category===c).reduce((n,x)=>n+x.count,0);
  assert.deepEqual([category('Pokémon'),category('Trainer'),category('Energy')],[25,28,7]);
  return true;
}

/** @returns {object} */
function main() {
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const original=manifest.decks.find(d=>d.rank===2);
  const candidate=JSON.parse(fs.readFileSync(path.join(root,'results/als/agent18-exeggutor-vileplume-source-v1.json'),'utf8'));
  validateExactSwap(original,candidate);
  const pool=(set,id)=>JSON.parse(fs.readFileSync(path.join(root,'resources/cards/en',set+'.json'),'utf8')).find(c=>c.id===id);
  const prop=pool('bw9','bw9-4'),normal=pool('me1','me1-4'),lock=pool('bw9','bw9-5');
  assert.equal(prop.hp,'30'); assert.equal(normal.hp,'60'); assert.equal(lock.hp,'100');
  assert.ok(prop.abilities.some(a=>a.name==='Propagation'));
  assert.ok(lock.attacks.some(a=>a.name==='Blockade' && a.cost.length===1 &&
    a.cost[0]==='Colorless' && /can't play any Supporter cards/.test(a.text)));
  const before=onlyFragileBasicsConditional(60,14,1);
  const after=onlyFragileBasicsConditional(60,14,2);
  return {schema:'agent18-exeggutor-source-swap-opening-risk-v1',
    sourceRank:2,validOpeningBasicCopies:14,
    oldThirtyHpBasicCopies:1,newThirtyHpBasicCopies:2,
    original:before,challenger:after,
    deltaPercentagePoints:(after.probability-before.probability)*100,
    originalExactSource60PreservedExceptDeclaredChanges:true,
    competitiveQualifiedGames:0,
    caveat:'Initial 7 conditional on a valid Basic opener, forced 30-HP Active only. No causal donk, actual attack lock, trainer effect, prize, outcome or matchup rate.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={choose,gcd,onlyFragileBasicsConditional,validateExactSwap,main};
