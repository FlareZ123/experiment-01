'use strict';
/** Source-card presence only. Effect usability is state-dependent.
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number}>}>}} source
 * @returns {object}
 */
function census(source) {
  if (!Array.isArray(source?.decks)) throw new Error('Missing source decks');
  const byRank = new Map();
  for (const deck of source.decks) {
    if (!Number.isInteger(deck.rank) || deck.rank < 1 || deck.rank > 32 ||
        byRank.has(deck.rank) || !Array.isArray(deck.cards)) throw new Error('Invalid deck');
    const names = new Map();
    let total = 0;
    for (const c of deck.cards) {
      if (!c || typeof c.name !== 'string' || !c.name || !Number.isInteger(c.count) || c.count < 1) {
        throw new Error('Invalid card');
      }
      total += c.count;
      names.set(c.name, (names.get(c.name) || 0) + c.count);
    }
    if (total !== 60) throw new Error('Non-60-card inventory');
    byRank.set(deck.rank, names);
  }
  const ranks = [...byRank.keys()].sort((a,b)=>a-b);
  const has = (r,n) => (byRank.get(r).get(n) || 0) > 0;
  const names = ['Guzma','VS Seeker','Escape Rope','Prime Catcher',
    'Jet Energy','Penny','Scoop Up Cyclone','Float Stone','U-Turn Board','Latias ex'];
  const cards = Object.fromEntries(names.map(name => [name, {
    ranks: ranks.filter(r=>has(r,name)),
    copies: ranks.reduce((sum,r)=>sum+(byRank.get(r).get(name)||0),0)
  }]));
  return {
    ranks, missingRanks:Array.from({length:32},(_,i)=>i+1).filter(r=>!byRank.has(r)),
    cards,
    withGuzmaOrRope:ranks.filter(r=>has(r,'Guzma')||has(r,'Escape Rope')),
    withoutGuzma:ranks.filter(r=>!has(r,'Guzma')),
    guzmaWithoutRopeOrPrime:ranks.filter(r=>has(r,'Guzma') &&
      !has(r,'Escape Rope')&&!has(r,'Prime Catcher')),
    withNamedNonGustPositioning:ranks.filter(r=>['Escape Rope','Jet Energy',
      'Penny','Scoop Up Cyclone'].some(name=>has(r,name)))
  };
}
module.exports = { census };
