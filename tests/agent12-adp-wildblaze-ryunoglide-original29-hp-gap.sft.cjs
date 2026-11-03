'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ROSTER = path.join(ROOT, 'results/aichi-2026/full-decklists.json');
const CARDS = path.join(ROOT, 'resources/cards/en');
const DRAGON_PRINTS = [
  {file:'xy2.json',id:'xy2-69',name:'Wild Blaze',expectedDamage:300},
  {file:'me2pt5.json',id:'me2pt5-152',name:'Ryuno Glide',expectedDamage:330}
];

/**
 * The supplied original opponent roster uses a glyph for Prism Star cards.
 * Card-pool names omit this separate deckbuilding-rule notation.
 * @param {string} name
 * @returns {string}
 */
function normalizedName(name) {
  return name.replace(/ ♢$/u, '');
}

/**
 * Read an exact physical card printing from the provided English card pool.
 * @param {string} file
 * @param {string} id
 * @returns {object}
 */
function exactCard(file,id) {
  const cards = JSON.parse(fs.readFileSync(path.join(CARDS,file),'utf8'));
  const matching = cards.filter(card => card.id === id);
  assert.equal(matching.length,1,'missing or duplicate physical printing '+id);
  return matching[0];
}

/** @returns {void} */
function main() {
  const roster=JSON.parse(fs.readFileSync(ROSTER,'utf8'));
  assert.equal(roster.decks.length,29,'do not silently admit an unauthenticated source');
  const byName=new Map();
  for(const filename of fs.readdirSync(CARDS).filter(x=>x.endsWith('.json'))){
    const cards=JSON.parse(fs.readFileSync(path.join(CARDS,filename),'utf8'));
    assert.ok(Array.isArray(cards),'invalid card file '+filename);
    for(const card of cards){
      if(card.supertype!=='Pokémon'||!/^[0-9]+$/.test(card.hp??''))continue;
      const name=normalizedName(card.name);
      const hp=Number(card.hp);
      const previous=byName.get(name);
      if(!previous||hp>previous.hp)byName.set(name,{hp,id:card.id});
    }
  }
  const originalNames=new Set();
  const ranksByName=new Map();
  for(const deck of roster.decks){
    assert.ok(Number.isInteger(deck.rank));
    const sum=deck.cards.reduce((acc,card)=>acc+card.count,0);
    assert.equal(sum,60,'original rank '+deck.rank+' is not sixty cards');
    for(const printing of deck.cards.filter(card=>card.category==='Pokémon')){
      const name=normalizedName(printing.name);
      originalNames.add(name);
      if(!ranksByName.has(name))ranksByName.set(name,[]);
      ranksByName.get(name).push(deck.rank);
    }
  }
  assert.equal(originalNames.size,92);
  const unresolved=[...originalNames].filter(name=>!byName.has(name));
  assert.deepEqual(unresolved,[],'cannot certify the complete original name pool');
  const hpGap=[...originalNames].map(name=>({
    name,hp:byName.get(name).hp
  })).filter(x=>x.hp>330&&x.hp<=360);
  assert.deepEqual(hpGap,[],
    'a listed original Pokemon name has an HP threshold where 360 helps over 330');
  const above360=[...originalNames].map(name=>({
    name,hp:byName.get(name).hp,
    ranks:[...new Set(ranksByName.get(name))].sort((a,b)=>a-b)
  })).filter(x=>x.hp>360).sort((a,b)=>b.hp-a.hp);
  assert.deepEqual(above360,[
    {name:'Mega Dragonite ex',hp:370,ranks:[14,20,32]}
  ]);
  const originalWithHighHP=roster.decks.filter(d=>d.cards.some(c=>
    c.category==='Pokémon'&&normalizedName(c.name)==='Mega Dragonite ex'
  ));
  for(const deck of originalWithHighHP){
    assert.equal(deck.cards.filter(c=>/^(Dratini|Dragonair)$/.test(c.name)).length,0,
      'the original may be able to evolve a Mega Dragonite normally');
  }
  const attacks=DRAGON_PRINTS.map(({file,id,name,expectedDamage})=>{
    const card=exactCard(file,id);
    assert.ok(card.types.includes('Dragon'));
    const printed=card.attacks.filter(attack=>attack.name===name);
    assert.equal(printed.length,1);
    assert.equal(Number(printed[0].damage),expectedDamage);
    return {
      id,attack:name,damage:expectedDamage,
      enhancedAdpDamage:expectedDamage+30,
      cost:printed[0].text
    };
  });
  assert.match(attacks[0].cost,/Discard the top 5 cards of your deck/);
  assert.match(attacks[1].cost,/Discard 2 Energy from this Pokémon/);
  const adp=exactCard('sm12.json','sm12-156');
  assert.ok(adp.attacks.some(attack=>attack.name==='Altered Creation-GX'&&
    /30 more damage/.test(attack.text)));
  console.log('Original authenticated decks:',roster.decks.length);
  console.log('Distinct normalized Pokemon names:',originalNames.size);
  console.log('Names with maximum English-card-pool HP 331 through 360:',hpGap);
  console.log('Names with maximum HP above 360:',JSON.stringify(above360));
  console.log('Original ranks listing Mega Dragonite:',originalWithHighHP.map(x=>x.rank));
  console.log('Compared copied Dragon attack printings:',JSON.stringify(attacks));
  console.log('PASS: 330 and 360 printed damage have identical unmodified full-HP KO thresholds over all original-29 Pokemon-name envelopes.');
  console.log('CAVEAT: this is a conservative name-level envelope; dynamic HP, protection, Resistance, Weakness, paper roles, other cards, and actual game play are unmodeled.');
}
if(require.main===module)main();
module.exports={normalizedName,exactCard,main};
