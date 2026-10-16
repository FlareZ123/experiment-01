'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./first-evolution-natural.cjs');
const {loadBasicIndex,normalizeName}=require('./aichi_opening_audit.cjs');

/**
 * Exact uniform-7 resource incidence of rank-31 Roxie + Koffing.
 * A Koffing can be preserved in hand at setup when another Basic is present,
 * including a second Koffing. This assumes a rational optional Bench choice;
 * no Supporter action, search, opponent, or Ability resolution is modeled.
 *
 * @param {{deckSize:number,handSize:number,basicCount:number,
 * koffingCount:number,roxieCount:number}} p
 */
function roxieKoffingOpening(p) {
  const {deckSize:N,handSize:h,basicCount:B,koffingCount:K,roxieCount:R}=p;
  if(![N,h,B,K,R].every(Number.isInteger) || N<1 || h<1 ||
      B<K || K<1 || R<1 || B+R>N || h>N) {
    throw new RangeError('Invalid rank31 resource partition');
  }
  const F=N-B-R,O=B-K,den=Number(choose(N,h));
  let both=0,retain=0,forced=0;
  for(let k=1;k<=K;k++) {
    for(let o=0;o<=O;o++) {
      for(let r=1;r<=R;r++) {
        const f=h-k-o-r;
        if(f<0 || f>F) continue;
        const weight=Number(
          choose(K,k)*choose(O,o)*choose(R,r)*choose(F,f)
        )/den;
        both+=weight;
        if(k+o>=2)retain+=weight;
        else forced+=weight;
      }
    }
  }
  const valid=1-Number(choose(N-B,h))/den;
  return {
    acceptedOpeningProbability:valid,
    bothGivenValid:both/valid,
    handPreservableGivenValid:retain/valid,
    forcedSoleKoffingGivenValid:forced/valid
  };
}

if(require.main===module){
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const rank=manifest.decks.find(d=>d.rank===31);
  if(!rank || rank.archetype!=='Dusknoir Chimecho') {
    throw new Error('Published rank31 source identity missing');
  }
  const stages=loadBasicIndex(path.join(root,'resources/cards/en'));
  const basicCount=rank.cards.filter(c=>c.category==='Pokémon' &&
    stages.get(normalizeName(c.name))===true).reduce((n,c)=>n+c.count,0);
  const copyCount=name=>rank.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
  const koffingCount=copyCount('Koffing'),roxieCount=copyCount('Roxie');
  const result=roxieKoffingOpening({
    deckSize:60,handSize:7,basicCount,koffingCount,roxieCount
  });
  process.stdout.write(JSON.stringify({
    rank:31,archetype:rank.archetype,basicCount,koffingCount,roxieCount,
    result
  })+'\n');
}
module.exports={roxieKoffingOpening};
