"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {analyze,KNOWN,EVOS}=require("../../scripts/2026-11/agent1-aichi-basic-only-axe-opportunity.cjs");
const original=JSON.parse(fs.readFileSync(path.join(__dirname,
 "../../results/aichi-2026/full-decklists.json"),"utf8"));
const clone=()=>JSON.parse(JSON.stringify(original));
test("exact original Aichi 29-and-3 partition, all names recognized",()=>{
 const r=analyze(original);
 assert.equal(r.sourceDeckCount,29);
 assert.deepEqual(r.missingRanks,[23,25,28]);
 assert.equal(KNOWN.size,92);assert.equal(EVOS.size,22);
 assert.equal(r.rows.length,29);
 for(const x of r.rows)assert.equal(x.basicCopies+x.evolutionCopies,x.pokemonCopies);
});
test("all source Pokemon at eight ranks are Basic, without guessed missing ranks",()=>{
 const r=analyze(original);
 assert.deepEqual(r.basicOnlyRanks,[3,6,7,19,24,26,29,30]);
 for(const rank of r.basicOnlyRanks)assert.equal(r.rows.find(x=>x.rank===rank).evolutionCopies,0);
});
test("rank 6,24,29 are 4x only Iron Thorns ex, all Basic",()=>{
 for(const rank of [6,24,29]){
  const d=original.decks.find(x=>x.rank===rank);
  assert.deepEqual(d.cards.filter(c=>c.category==="Pokémon").map(c=>[c.name,c.count]),[["Iron Thorns ex",4]]);
  const row=analyze(original).rows.find(x=>x.rank===rank);
  assert.equal(row.basicCopies,4);assert.equal(row.evolutionCopies,0);
 }
});
test("Paldea Evolved Safeguard Mimikyu appears at Basic-only stall ranks 3 and 7",()=>{
 const r=analyze(original);
 assert.deepEqual(r.rows.filter(x=>x.everySourcePokemonBasic&&x.damageOnlySafeguardMimikyu).map(x=>x.rank),[3,7]);
});
test("Handheld Fan and Spiky Energy channels are actual original counts",()=>{
 const r=analyze(original);
 const m=new Map(r.rows.map(x=>[x.rank,[x.fanCopies,x.spikyEnergyCopies]]));
 assert.deepEqual(m.get(6),[1,1]);
 assert.deepEqual(m.get(24),[2,0]);
 assert.deepEqual(m.get(29),[1,1]);
});
test("Mega Absol and Mega Kangaskhan prints are Basic; Mega Dragonite and Lopunny evolve",()=>{
 assert.equal(KNOWN.has("Mega Absol ex"),true);
 assert.equal(KNOWN.has("Mega Kangaskhan ex"),true);
 assert.equal(EVOS.has("Mega Absol ex"),false);
 assert.equal(EVOS.has("Mega Kangaskhan ex"),false);
 assert.equal(EVOS.has("Mega Dragonite ex"),true);
 assert.equal(EVOS.has("Mega Lopunny ex"),true);
});
test("adding a real evolution to a Basic-only rank destroys all-Basic certification",()=>{
 const a=clone(),d=a.decks.find(x=>x.rank===26);
 d.cards.find(c=>c.name==="Meloetta ex").count--;
 d.cards.push({category:"Pokémon",count:1,name:"Alolan Raichu"});
 assert.equal(analyze(a).basicOnlyRanks.includes(26),false);
 assert.equal(analyze(a).basicOnlyRanks.length,7);
});
test("unknown Pokemon and bad inventory fail closed, never assume Basic",()=>{
 const a=clone(),d=a.decks.find(x=>x.rank===6);
 d.cards[0].name="Unknown Mega Z";
 assert.throws(()=>analyze(a),/Unknown Pokémon stage/);
 const b=clone();b.decks[0].cards[0].count++;
 assert.throws(()=>analyze(b),/Not 60/);
});
test("duplicate rank, duplicate missing rank, overlapping known/missing rejected",()=>{
 const a=clone();a.decks[1].rank=1;
 assert.throws(()=>analyze(a),/Duplicate rank/);
 const b=clone();b.missing_full_lists[1].rank=23;
 assert.throws(()=>analyze(b),/Bad Top32 partition/);
 const c=clone();c.missing_full_lists[1].rank=2;
 assert.throws(()=>analyze(c),/Bad Top32 partition/);
});
