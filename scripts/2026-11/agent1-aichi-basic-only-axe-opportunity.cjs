"use strict";
/*
 * Original 29 Aichi source 60s: fixed name-stage dictionary derived from
 * resources/cards/en. The two ♢ names in Japanese-source transliteration
 * match Basic English ◇ prints sm8-154 / sm9-51.
 * This does not simulate turns, energy, immunities, or games.
 */
const fs=require("node:fs"),path=require("node:path");
const NAMES=("Alolan Raichu|Arceus & Dialga & Palkia-GX|Articuno-GX|Bloodmoon Ursaluna ex|Budew|Buneary|Bunnelby|Chimecho|Crobat V|Dedenne-GX|Dialga-GX|Ditto ♢|Dragapult ex|Dusclops|Dusknoir|Duskull|Eldegoss V|Electrike|Electrode-GX|Empoleon V|Exeggcute|Fan Rotom|Fezandipiti ex|Flutter Mane|Galarian Moltres V|Galarian Stunfisk|Garbodor|Genesect V|Gengar & Mimikyu-GX|Girafarig|Gloom|Herdier|Hisuian Goodra VSTAR|Ho-Oh-EX|Iron Thorns ex|Jirachi|Klefki|Koffing|Koraidon ex|Kyurem|Latias ex|Lillie's Clefairy ex|Lillipup|Marshadow|Mega Absol ex|Mega Dragonite ex|Mega Kangaskhan ex|Mega Lopunny ex|Meloetta ex|Mew V|Mew VMAX|Mimikyu|Minior|Mr. Mime|Noivern ex|Oddish|Oranguru V|Oricorio-GX|Pidgeot ex|Pidgeotto|Pidgey|Pikachu|Radiant Alakazam|Radiant Eternatus|Raging Bolt ex|Regidrago V|Regidrago VSTAR|Regirock|Relicanth|Rotom V|Sableye V|Salamence ex|Sandy Shocks ex|Shadow Rider Calyrex V|Shadow Rider Calyrex VMAX|Snorlax|Squawkabilly ex|Stoutland|Sudowoodo|Tapu Koko ♢|Tapu Lele-GX|Tatsugiri|Toedscool|Toedscruel|Trevenant & Dusknoir-GX|Trubbish|Unown|Vikavolt V|Vileplume|Vileplume-GX|Voltorb|Wobbuffet").split("|");
const EVOS=new Set(["Alolan Raichu","Dragapult ex","Dusclops","Dusknoir","Electrode-GX","Garbodor","Gloom","Herdier","Hisuian Goodra VSTAR","Mega Dragonite ex","Mega Lopunny ex","Mew VMAX","Noivern ex","Pidgeot ex","Pidgeotto","Regidrago VSTAR","Salamence ex","Shadow Rider Calyrex VMAX","Stoutland","Toedscruel","Vileplume","Vileplume-GX"]);
const KNOWN=new Set(NAMES);
if(KNOWN.size!==92||EVOS.size!==22||[...EVOS].some(n=>!KNOWN.has(n)))
 throw Error("Stage map drift");
function analyze(src){
 if(!Array.isArray(src?.decks)||!Array.isArray(src?.missing_full_lists))throw Error("Missing field");
 const used=new Set(),rows=[];
 for(const d of src.decks){
  if(!Number.isInteger(d.rank)||d.rank<1||d.rank>32||used.has(d.rank))throw Error("Duplicate rank");
  used.add(d.rank);
  if(d.cards.reduce((n,c)=>n+c.count,0)!==60)throw Error("Not 60 at rank "+d.rank);
  const p=d.cards.filter(c=>c.category==="Pokémon");
  if(!p.length||p.some(c=>!KNOWN.has(c.name)))throw Error("Unknown Pokémon stage at "+d.rank);
  const basic=p.filter(c=>!EVOS.has(c.name)),evol=p.filter(c=>EVOS.has(c.name));
  const n=c=>c.reduce((a,x)=>a+x.count,0);
  rows.push({rank:d.rank,archetype:d.archetype,pokemonCopies:n(p),
   basicCopies:n(basic),evolutionCopies:n(evol),
   everySourcePokemonBasic:evol.length===0,
   damageOnlySafeguardMimikyu:p.some(c=>c.name==="Mimikyu"&&
     c.printing?.set==="PAL"&&String(c.printing?.number)==="97"),
   fanCopies:n(d.cards.filter(c=>c.name==="Handheld Fan")),
   spikyEnergyCopies:n(d.cards.filter(c=>c.name==="Spiky Energy"))});
 }
 const missing=src.missing_full_lists.map(x=>x.rank);
 if(used.size+missing.length!==32||new Set(missing).size!==missing.length||
  missing.some(n=>!Number.isInteger(n)||n<1||n>32||used.has(n)))
  throw Error("Bad Top32 partition");
 rows.sort((a,b)=>a.rank-b.rank);
 return {schema:"agent1-basic-only-axe-opportunity-v1",
  caveat:"Printed Pokémon stage only; not actual Active, donor access, effect immunity, or win rate",
  sourceDeckCount:rows.length,missingRanks:missing.slice().sort((a,b)=>a-b),
  basicOnlyRanks:rows.filter(x=>x.everySourcePokemonBasic).map(x=>x.rank),rows};
}
if(require.main===module){
 const f=process.argv[2]||path.resolve(__dirname,"../../results/aichi-2026/full-decklists.json");
 process.stdout.write(JSON.stringify(analyze(JSON.parse(fs.readFileSync(f,"utf8"))),null,2)+"\n");
}
module.exports={analyze,KNOWN,EVOS};
