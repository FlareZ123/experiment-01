'use strict';
const assert=require('node:assert/strict');
const {chooseOwnerEvolutionVipBasics}=
  require('./agent3-owner-evolution-vip-search.cjs');

/**
 * Rank11 Aichi Absol/Garbodor first-turn VIP owner-only search scorer.
 * The opened native owner-deck prompt is the only deck identity source.
 * @param {object} own
 * @param {object} prompt
 * @param {object} state Native validator only.
 * @returns {object[]}
 */
function chooseRank11CoreVipBasics(own,prompt,state){
  assert.ok(Array.isArray(own.hand.cards));
  const open=own.bench.filter(slot=>!slot.getPokemonCard()).length;
  if(open===0)return [];
  const known=[...own.hand.cards,...prompt.cards.cards];
  const hasGarbodor=known.some(card=>card.name==='Garbodor');
  const roles=hasGarbodor?['Trubbish','Mega Absol ex']:['Mega Absol ex'];
  const owned=new Set([
    ...[own.active,...own.bench].map(slot=>slot.getPokemonCard()?.name),
    ...own.hand.cards.map(card=>card.name)
  ].filter(Boolean));
  const missing=roles.filter(name=>!owned.has(name));
  if(!missing.some(name=>prompt.cards.cards.some(card=>card.name===name)))
    return chooseOwnerEvolutionVipBasics(own,prompt,state);
  const cards=prompt.cards.cards.slice().sort((a,b)=>
    a.fullName.localeCompare(b.fullName));
  const choices=cards.map(card=>[card]);
  if(open>1)for(let i=0;i<cards.length;i++)
    for(let j=i+1;j<cards.length;j++)choices.push([cards[i],cards[j]]);
  let best=[],bestScore=-Infinity;
  for(const choice of choices){
    if(!prompt.validate(choice,state))continue;
    const selected=new Set(choice.map(card=>card.name));
    const gained=missing.filter(name=>selected.has(name)).length;
    const evolutions=choice.filter(card=>known.some(e=>
      e.evolvesFrom===card.name)).length;
    const score=gained*1000+selected.size*20+evolutions*10+choice.length;
    if(score>bestScore){bestScore=score;best=choice;}
  }
  return best.length?best:chooseOwnerEvolutionVipBasics(own,prompt,state);
}
module.exports={chooseRank11CoreVipBasics};
