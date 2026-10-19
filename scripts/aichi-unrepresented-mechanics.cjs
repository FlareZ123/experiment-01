'use strict';

const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const TARGETS=Object.freeze([
  {rank:9,archetype:'Absol Electrode',mechanics:[
    {name:'Toedscruel',set:'PAR',number:'17',ability:'Slime Mold Colony'},
    {name:'Electrode-GX',set:'CES',number:'48',ability:'Extra Energy Bomb'},
    {name:'Mega Absol ex',set:'MEG',number:'86',attack:'Terminal Period'},
    {name:'Sableye V',set:'SSH',number:'120',attack:'Crazy Claws'}
  ]},
  {rank:15,archetype:'Lopunny Vileplume',mechanics:[
    {name:'Vileplume',set:'AOR',number:'3',ability:'Irritating Pollen'},
    {name:'Vileplume',set:'BUS',number:'6',ability:'Disgusting Pollen'},
    {name:'Mega Lopunny ex',set:'PFL',number:'84',attack:'Gale Thrust'},
    {name:'Mega Lopunny ex',set:'PFL',number:'84',attack:'Spiky Hopper'}
  ]},
  {rank:19,archetype:'Raging Bolt',mechanics:[
    {name:'Raging Bolt ex',set:'TEF',number:'123',attack:'Bellowing Thunder'},
    {name:"Professor Sada's Vitality",set:'PAR',number:'170',rulesText:'Basic Energy'},
    {name:'Arceus & Dialga & Palkia-GX',set:'CEC',number:'156',attack:'Altered Creation-GX'}
  ]},
  {rank:30,archetype:"Lillie's Clefairy",mechanics:[
    {name:"Lillie's Clefairy ex",set:'JTG',number:'56',ability:'Fairy Zone'},
    {name:"Lillie's Clefairy ex",set:'JTG',number:'56',attack:'Full Moon Rondo'},
    {name:'Wondrous Patch',set:'PFL',number:'94',rulesText:'Basic Psychic Energy'},
    {name:'Empoleon V',set:'BST',number:'40',ability:"Emperor's Eyes"}
  ]},
  {rank:31,archetype:'Dusknoir Chimecho',mechanics:[
    {name:'Dusclops',set:'PRE',number:'36',ability:'Cursed Blast'},
    {name:'Dusknoir',set:'PRE',number:'37',ability:'Cursed Blast'},
    {name:'Dusknoir',set:'BCR',number:'63',ability:'Sinister Hand'},
    {name:'Koffing',set:'CEC',number:'76',ability:'Blow-Away Bomb'},
    {name:'Chimecho',set:'CIN',number:'43',attack:'Bell of Silence'},
    {name:'Bloodmoon Ursaluna ex',set:'TWM',number:'141',ability:'Seasoned Skill'}
  ]}
]);

/** @returns {{manifest:object,sets:object[]}} Unmodified checked-in sources. */
function source(){
  return {
    manifest:JSON.parse(fs.readFileSync(path.join(root,
      'results/aichi-2026/full-decklists.json'),'utf8')),
    sets:JSON.parse(fs.readFileSync(path.join(root,'resources/sets/en.json'),'utf8'))
  };
}

/**
 * Read only the exact English-display source printing from the bundled card DB.
 * Existence in the DB is distinct from Japanese tournament legality or faithful
 * Twinleaf reducer support.
 * @param {object[]} sets
 * @param {object} printing
 * @returns {object}
 */
function printedCard(sets,printing){
  const matching=sets.filter(set=>set.ptcgoCode===printing.set);
  if(matching.length!==1)throw Error('Unresolved or ambiguous set code '+printing.set);
  const id=matching[0].id+'-'+printing.number;
  const filename=path.join(root,'resources/cards/en',matching[0].id+'.json');
  const card=JSON.parse(fs.readFileSync(filename,'utf8'))
    .find(item=>item.id===id);
  if(!card)throw Error('Missing exact card printing '+id);
  return card;
}

/**
 * An identity-preserving, printed-card audit. Each description has its actual
 * source count and literal card text; no inferred wins, legality or line reach.
 * @param {object} manifest
 * @param {object[]} sets
 * @param {object[]} [targets]
 * @returns {object}
 */
function audit(manifest,sets,targets=TARGETS){
  if(manifest.published_deck_count!==29 || manifest.decks?.length!==29)
    throw Error('Expected the 29 published Aichi full 60s');
  const rows=targets.map(target=>{
    const deck=manifest.decks.find(d=>d.rank===target.rank);
    if(!deck || deck.archetype!==target.archetype)
      throw Error('Missing exact source archetype at rank '+target.rank);
    const total=deck.cards.reduce((n,c)=>n+c.count,0);
    if(total!==60)throw Error('Invalid source card count at '+target.rank);
    const found=target.mechanics.map(item=>{
      const row=deck.cards.find(card=>card.name===item.name&&
        card.printing.set===item.set&&card.printing.number===item.number);
      if(!row?.count)throw Error('Source missing printing '+item.name+
        ' '+item.set+' '+item.number+' at rank '+target.rank);
      const card=printedCard(sets,row.printing);
      if(card.name!==item.name)throw Error('Bundled printing name mismatch');
      const mechanic=item.ability?
        card.abilities?.find(a=>a.name===item.ability):
        item.attack?card.attacks?.find(a=>a.name===item.attack):
        card.rules?.find(text=>text.includes(item.rulesText));
      if(!mechanic)throw Error('Source printing lacks specified mechanism '+item.name+
        ' '+(item.ability||item.attack||item.rulesText));
      return {
        printing:item.name+' '+item.set+' '+item.number,
        count:row.count,mechanic:item.ability||item.attack||item.rulesText,
        role:item.ability?'Ability':item.attack?'Attack':'Trainer effect',
        printedText:typeof mechanic==='string'?mechanic:mechanic.text,
        ...(item.attack?{printedDamage:mechanic.damage,
          energyCost:mechanic.cost}:{}),
        ...(item.ability?{isActiveOnly:/as long as this Pokémon is (?:your|in the) Active/i.test(mechanic.text)}:{})
      };
    });
    return {rank:target.rank,archetype:deck.archetype,
      sourcePlayer:deck.player,physicalCards:total,mechanics:found};
  });
  const raging=manifest.decks.find(d=>d.rank===19);
  const basicNames=new Set(['Lightning Energy','Fighting Energy','Darkness Energy']);
  const basicEnergy=raging.cards.reduce((n,c)=>
    n+(c.category==='Energy'&&basicNames.has(c.name)?c.count:0),0);
  return {
    scope:'Exact English-display printed-card audit; not an Expanded or Twinleaf certification',
    published:manifest.published_deck_count,
    sourceRanks:rows.map(row=>row.rank),
    rows,
    boundedPrintedArithmetic:{
      rank19PhysicalBasicEnergyCards:basicEnergy,
      rank19BellowingThunderFiveBasicDiscards:5*70,
      rank19MinDiscardsFor320HP:Math.ceil(320/70),
      rank30RondoAtTenCombinedBenched:20+20*10,
      rank30RondoAtSixteenCombinedBenched:20+20*16,
      rank30MinCombinedBenchedToReach320:Math.ceil((320-20)/20),
      rank9SableyeCrazyClawsAtSixCounters:10+60*6,
      rank15GaleThrustAfterBenchToActive:60+170
    },
    competitiveQualifiedGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(audit(...Object.values(source())),null,2)+'\n');
module.exports={TARGETS,source,printedCard,audit};
