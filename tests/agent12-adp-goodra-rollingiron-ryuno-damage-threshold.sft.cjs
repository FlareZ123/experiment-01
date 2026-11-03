'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const CARD_ROOT=path.join(ROOT,'resources/cards/en');
const ROSTER=path.join(ROOT,'results/aichi-2026/full-decklists.json');
const MIRROR_RANKS=[10,14,18,21,32];

/** @param {string} filename @param {string} id @returns {object} */
function exactCard(filename,id){
  const data=JSON.parse(fs.readFileSync(path.join(CARD_ROOT,filename),'utf8'));
  const matches=data.filter(card=>card.id===id);
  assert.equal(matches.length,1,'exact print not found: '+id);
  return matches[0];
}

/** @param {object} card @param {string} name @returns {object} */
function attack(card,name){
  const matches=card.attacks.filter(row=>row.name===name);
  assert.equal(matches.length,1,'attack identity not unique: '+name);
  return matches[0];
}

/** @returns {object} */
function run(){
  const roster=JSON.parse(fs.readFileSync(ROSTER,'utf8'));
  assert.equal(roster.decks.length,29);
  for(const deck of roster.decks){
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  }
  const reg=exactCard('swsh12.json','swsh12-136');
  const donor=exactCard('swsh11.json','swsh11-136');
  const old=exactCard('xy2.json','xy2-69');
  const proposed=exactCard('me2pt5.json','me2pt5-152');
  const adp=exactCard('sm12.json','sm12-156');
  assert.equal(reg.hp,'280');
  assert.ok(reg.types.includes('Dragon'));
  assert.match(attack(reg,'Apex Dragon').text,/Choose an attack from a Dragon Pokémon in your discard pile and use it as this attack/);
  assert.ok(donor.types.includes('Dragon'));
  const rolling=attack(donor,'Rolling Iron');
  assert.equal(rolling.damage,'200');
  assert.match(rolling.text,/During your opponent's next turn, this Pokémon takes 80 less damage from attacks/);
  assert.match(rolling.text,/after applying Weakness and Resistance/);
  assert.equal(attack(old,'Wild Blaze').damage,'300');
  assert.equal(attack(proposed,'Ryuno Glide').damage,'330');
  assert.ok(old.types.includes('Dragon'));
  assert.ok(proposed.types.includes('Dragon'));
  assert.match(attack(adp,'Altered Creation-GX').text,/attacks do 30 more damage/);
  assert.match(attack(adp,'Altered Creation-GX').text,/Knocked Out by damage from those attacks, take 1 more Prize/);
  assert.equal(reg.rules.length,1);
  assert.match(reg.rules[0],/2 Prize cards/);
  const actual=roster.decks.filter(deck=>
    deck.cards.some(c=>c.name==='Regidrago VSTAR'&&c.count===3)&&
    deck.cards.some(c=>c.name==='Hisuian Goodra VSTAR'&&c.count===1));
  const ranks=actual.map(deck=>deck.rank).sort((a,b)=>a-b);
  assert.deepEqual(ranks,MIRROR_RANKS);
  const sourceDetails=actual.map(deck=>({
    rank:deck.rank,
    goodra:deck.cards.filter(c=>c.name==='Hisuian Goodra VSTAR').map(c=>c.printing),
    regidrago:deck.cards.filter(c=>c.name==='Regidrago VSTAR').map(c=>c.printing),
    dde:deck.cards.filter(c=>c.name==='Double Dragon Energy').map(c=>c.count)[0]??0
  }));
  for(const source of sourceDetails){
    assert.deepEqual(source.goodra,[{set:'LOR',number:'136',language:'en'}]);
    assert.deepEqual(source.regidrago,[{set:'SIT',number:'136',language:'en'}]);
    assert.ok(source.dde===3||source.dde===4);
  }
  const boost=30,shield=80,hp=Number(reg.hp);
  const oldNet=Number(attack(old,'Wild Blaze').damage)+boost-shield;
  const newNet=Number(attack(proposed,'Ryuno Glide').damage)+boost-shield;
  assert.equal(oldNet,250);
  assert.equal(newNet,280);
  assert.ok(oldNet<hp&&newNet>=hp);
  console.log(JSON.stringify({
    type:'paper-conditional-copied-Rolling-Iron-defended-Regidrago-VSTAR',
    originalRanks:ranks,sourceDetails,referenceManifestCount:roster.decks.length,
    hp,defendingEffect:rolling.text,enhancedAdpBoost:boost,
    attackDamage:{wildBlaze:300,ryunoGlide:330},
    netDamage:{wildBlaze:oldNet,ryunoGlide:newNet},
    extraPrizesIfRyunoDamageKO:3,
    caveat:'Conditional hand/board/attack-effect argument, not native Store encounter or competitive outcome'
  },null,2));
  return {ranks,oldNet,newNet};
}
if(require.main===module)run();
module.exports={exactCard,attack,run};
