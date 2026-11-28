"use strict";
/**
 * Static field counterplay screen for the proposed Regidrago
 * Megaton Blower -> Chaos Wheel / Dominating Echo line.
 * NOT a game simulator: no probabilities, access, board state, tempo,
 * player policy, attack availability, or win-rate claims.
 */
const fs=require("node:fs"),path=require("node:path");
const BASICS=new Set(["Grass Energy","Fire Energy","Water Energy",
"Lightning Energy","Psychic Energy","Fighting Energy","Darkness Energy",
"Metal Energy","Fairy Energy"]);
const COUNTERS={
 ranger:"Pokémon Ranger",electrode:"Electrode-GX",darkPatch:"Dark Patch",
 crispin:"Crispin",underworldDoor:"Shadow Rider Calyrex VMAX",
 raihan:"Raihan",maxElixir:"Max Elixir",welder:"Welder",
 gardenia:"Gardenia's Vigor",garbodor:"Garbodor",
 stealthyHood:"Stealthy Hood",toolJammer:"Tool Jammer",
 megatonBlower:"Megaton Blower",handheldFan:"Handheld Fan",
 plumeria:"Plumeria",flareGrunt:"Team Flare Grunt",faba:"Faba",
 crushingHammer:"Crushing Hammer",enhancedHammer:"Enhanced Hammer",
 lusamine:"Lusamine"
};
const count=cards=>cards.reduce((n,c)=>n+c.count,0);
function analyze(source){
 if(!source||!Array.isArray(source.decks)||!Array.isArray(source.missing_full_lists))
  throw Error("Invalid original source-list container");
 const ranks=new Set(),rows=[];
 for(const d of source.decks){
  if(!Number.isInteger(d.rank)||ranks.has(d.rank)||d.rank<1||d.rank>32)
   throw Error("Bad/duplicate source rank "+d.rank);
  ranks.add(d.rank);
  if(!Array.isArray(d.cards)||count(d.cards)!==60||d.cards.some(c=>!Number.isInteger(c.count)||c.count<=0))
   throw Error("Source list is not exactly 60 at rank "+d.rank);
  const energy=d.cards.filter(c=>c.category==="Energy");
  const unknown=energy.filter(c=>!BASICS.has(c.name)&&!/\bEnergy\b/.test(c.name));
  if(unknown.length)throw Error("Unrecognized Energy names at "+d.rank+": "+unknown.map(c=>c.name));
  const basics=energy.filter(c=>BASICS.has(c.name)),specials=energy.filter(c=>!BASICS.has(c.name));
  const n=name=>count(d.cards.filter(c=>c.name===name));
  const hasPrint=(name,set,number)=>d.cards.some(c=>c.name===name&&c.printing?.set===set&&String(c.printing?.number)===number);
  const itemLockPotential=hasPrint("Vileplume","AOR","3");
  const garbotoxinPotential=hasPrint("Garbodor","LTR","68")||hasPrint("Garbodor","BKP","57");
  const channels=Object.fromEntries(Object.entries(COUNTERS).map(([k,name])=>[k,n(name)]));
  const basicEnergy=count(basics),specialEnergy=count(specials);
  rows.push({
   rank:d.rank,player:d.player,archetype:d.archetype,basicEnergy,specialEnergy,
   energyTotal:basicEnergy+specialEnergy,
   basicTypes:basics.map(c=>({name:c.name,count:c.count})).sort((a,b)=>a.name.localeCompare(b.name)),
   specialTypes:specials.map(c=>({name:c.name,count:c.count})).sort((a,b)=>a.name.localeCompare(b.name)),
   channels,exclusivelySpecial:basicEnergy===0&&specialEnergy>0,
   hasRanger:channels.ranger>0,hasDiscardSpecialAccel:channels.electrode>0,
   // If AOR3 is live and unsuppressed, Megaton Blower (Item) is unplayable.
   itemLockPotential,
   // A printed Garbodor is a possible Tool-restart channel, not proof of a
   // deployed Garbotoxin (which needs the appropriate print and attached Tool).
   chaosVsEchoToolDelta:garbotoxinPotential
  });
 }
 const missing=source.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b);
 if(missing.some(n=>!Number.isInteger(n)||n<1||n>32||ranks.has(n))||
   new Set(missing).size!==missing.length||rows.length+missing.length!==32)
  throw Error("Source and missing ranks do not partition Top 32");
 rows.sort((a,b)=>a.rank-b.rank);
 const having=pred=>rows.filter(pred).map(r=>r.rank);
 return {schema:"agent1-apex-lock-counterplay-v1",source:source.source,
  sourceDeckCount:rows.length,missingRanks:missing,
  status:"printed-inventory opportunity screen only; no simulated or qualified games",
  summary:{
   allSpecialRanks:having(r=>r.exclusivelySpecial),
   allSpecialWithRanger:having(r=>r.exclusivelySpecial&&r.hasRanger),
   allSpecialWithElectrode:having(r=>r.exclusivelySpecial&&r.hasDiscardSpecialAccel),
   allSpecialWithoutNamedRangerElectrode:having(r=>r.exclusivelySpecial&&!r.hasRanger&&!r.hasDiscardSpecialAccel),
   allSpecialWithMegatonCounter:having(r=>r.exclusivelySpecial&&r.channels.megatonBlower>0),
   allSpecialWithPlumeriaCounter:having(r=>r.exclusivelySpecial&&r.channels.plumeria>0),
   garbodorToolRestartRanks:having(r=>r.chaosVsEchoToolDelta),
   megatonItemLockPotentialRanks:having(r=>r.itemLockPotential),
   rangerRanks:having(r=>r.hasRanger),
   electrodeRanks:having(r=>r.hasDiscardSpecialAccel),
   basicOnlyRanks:having(r=>r.basicEnergy>0&&r.specialEnergy===0),
   mixedEnergyRanks:having(r=>r.basicEnergy>0&&r.specialEnergy>0)
  },rows};
}
if(require.main===module){
 const root=path.resolve(__dirname,"../..");
 const input=process.argv[2]||path.join(root,"results/aichi-2026/full-decklists.json");
 process.stdout.write(JSON.stringify(analyze(JSON.parse(fs.readFileSync(input,"utf8"))),null,2)+"\n");
}
module.exports={analyze,BASICS,COUNTERS};