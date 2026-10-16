'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {analyze,SUPPORTERS}=require('../scripts/iron-thorns-discard-sensitivity.cjs');
const decks=JSON.parse(fs.readFileSync(path.join(__dirname,'../results/aichi-2026/full-decklists.json'),'utf8'))
  .decks.filter(d=>[6,24,29].includes(d.rank));

test('independent ordered deals approximate the exact discard policies',()=>{
  for(const deck of decks){
    const source=deck.cards.flatMap(c=>Array(c.count).fill(c.name));
    let state=20261016+deck.rank;
    const random=()=>{state=(state*48271)%2147483647;return state/2147483647;};
    const hit=[0,0,0,0];
    let valid=0;
    for(let trial=0;trial<130000;trial++){
      const cards=[...source];
      for(let i=59;i>0;i--){
        const j=Math.floor(random()*(i+1));
        [cards[i],cards[j]]=[cards[j],cards[i]];
      }
      const initial=cards.slice(0,7);
      if(!initial.includes('Iron Thorns ex'))continue;
      valid++;
      const hand=[...initial,cards[13]];
      const deckCards=cards.slice(14);
      const held=n=>hand.includes(n);
      const available=n=>held(n)||deckCards.includes(n);
      const direct=held('Thunder Mountain ♢')&&held('Double Colorless Energy');
      const tag=!held('Guzma & Hala')&&held('Tag Call');
      const supporter=held('Guzma & Hala')||(tag&&deckCards.includes('Guzma & Hala'));
      if(!available('Thunder Mountain ♢')||!available('Double Colorless Energy')||(!direct&&!supporter))continue;
      if(direct)hit[0]++;
      if(held('Double Colorless Energy')){hit[1]++;hit[2]++;hit[3]++;continue;}
      const rest=[...hand];
      rest.splice(rest.indexOf('Iron Thorns ex'),1);
      if(held('Guzma & Hala'))rest.splice(rest.indexOf('Guzma & Hala'),1);
      if(tag)rest.splice(rest.indexOf('Tag Call'),1);
      const kept=rest.filter(n=>n!=='Iron Thorns ex'&&n!=='Thunder Mountain ♢'&&n!=='Double Colorless Energy');
      const counts=new Map();
      for(const n of kept)counts.set(n,(counts.get(n)||0)+1);
      let duplicate=0,spent=0;
      for(const [name,c] of counts){duplicate+=c-1;spent+=SUPPORTERS.has(name)?c:c-1;}
      if(duplicate>=2)hit[1]++;
      if(spent>=2)hit[2]++;
      if(kept.length>=2)hit[3]++;
    }
    const exact=analyze(deck);
    const keys=['directInHand','duplicateOnly','supporterSpent','unrestricted'];
    for(let i=0;i<keys.length;i++){
      assert.ok(Math.abs(hit[i]/valid-exact[keys[i]])<0.007,
        String(deck.rank)+': '+keys[i]);
    }
  }
});
