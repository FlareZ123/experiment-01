'use strict';

const assert = require('node:assert/strict');

/**
 * @typedef {{name:string,fullName:string,evolvesFrom?:string}} Card
 * @typedef {{getPokemonCard:()=>Card|null}} Slot
 *
 * Owner-only, K1 search-target objective. Once a first-turn Battle VIP Pass
 * opens a real owner-deck ChooseCardsPrompt, its cards are legally inspectable
 * by that owner. Choose a native-valid pair that improves actual access to
 * Evolution lines in the owner's hand and searchable deck.
 *
 * This does not know the opponent's deck or hidden hand, and does not claim
 * all Evolution lines are strategically desirable. Requires the caller's
 * native prompt validator to reject non-Basics and illegal quantities.
 *
 * @param {{active:Slot,bench:Slot[],hand:{cards:Card[]}}} own
 * @param {{cards:{cards:Card[]},validate:(choice:Card[],state:object)=>boolean}} prompt
 * @param {object} state Actual native State, passed only to prompt.validate.
 * @returns {Card[]} Exact native card object references (0, 1, or 2).
 */
function chooseOwnerEvolutionVipBasics(own,prompt,state){
  assert.ok(own?.active && Array.isArray(own?.bench));
  const free=own.bench.filter(slot=>!slot.getPokemonCard()).length;
  if(free===0)return [];
  const inPlay=new Set([own.active,...own.bench]
    .map(slot=>slot.getPokemonCard()?.name).filter(Boolean));
  const available=[...own.hand.cards,...prompt.cards.cards];
  const evolvesByName=new Map();
  for(const card of available){
    if(!card.evolvesFrom)continue;
    const evolve=card.evolvesFrom;
    const current=evolvesByName.get(evolve)??0;
    evolvesByName.set(evolve,Math.min(2,current+1));
  }
  const evolutionInHand=new Set(own.hand.cards
    .map(card=>card.evolvesFrom).filter(Boolean));
  const candidates=prompt.cards.cards.slice().sort((a,b)=>
    a.fullName.localeCompare(b.fullName));
  const cardScore=card=>
    100*(evolvesByName.get(card.name)??0)+
    50*Number(evolutionInHand.has(card.name))+
    10*Number(!inPlay.has(card.name));
  const score=cards=>cards.reduce((sum,card)=>sum+cardScore(card),0)+
    2*Number(cards.length===2 && cards[0].name!==cards[1].name);
  let selected=[],best=-Infinity;
  const consider=choice=>{
    if(!prompt.validate(choice,state))return;
    const value=score(choice);
    if(value>best){best=value;selected=choice;}
  };
  if(free>=2){
    for(let i=0;i<candidates.length;i++){
      for(let j=i+1;j<candidates.length;j++){
        consider([candidates[i],candidates[j]]);
      }
    }
  }
  for(const card of candidates)consider([card]);
  return selected;
}

module.exports={chooseOwnerEvolutionVipBasics};
