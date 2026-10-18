'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {audit,validate}=require('./aichi_lock_matrix.cjs');

/** Exact printing identity; selected possible responses, not guaranteed outs. */
const RESPONSES={
 fieldBlower:[['Field Blower','GRI','125']],
 lostVacuum:[['Lost Vacuum','LOR','162']],
 pokemonRanger:[['Pokémon Ranger','STS','104']],
 stealthyHood:[['Stealthy Hood','UNB','186']],
 cancelingCologne:[['Canceling Cologne','ASR','136']],
 escapeRope:[['Escape Rope','BST','125']]
};
const GROUPS={
 itemToolRemoval:['fieldBlower','lostVacuum'],
 attackEffectReset:['pokemonRanger'],
 shieldTool:['stealthyHood'],
 activeNullifier:['cancelingCologne'],
 bilateralActiveSwitch:['escapeRope'],
 anySelectedResponse:Object.keys(RESPONSES)
};

/** @param {object} deck @param {string[][]} targets @returns {number} */
function countPrintings(deck,targets){
 return deck.cards.reduce((sum,c)=>sum+(targets.some(([name,set,num])=>
  c.name===name&&c.printing.set===set&&String(c.printing.number)===num)?c.count:0),0);
}

/** @param {object} source @returns {object} Printed presence only. */
function analyse(source){
 assert.equal(source.total_placements,32);
 assert.equal(source.published_deck_count,source.decks.length);
 const lock=audit(source.decks);
 validate(lock);
 const threats=new Map(source.decks.map(d=>[d.rank,[]]));
 for(const entry of lock.entries)for(const hit of entry.matches)
  threats.get(hit.rank).push({name:entry.name,print:entry.set+'/'+entry.number,
   kind:entry.kind,activation:entry.activation,copies:hit.copies});
 const seen=new Set();
 const rows=source.decks.map(deck=>{
  assert.ok(!seen.has(deck.rank)&&deck.rank>=1&&deck.rank<=32);
  seen.add(deck.rank);
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  const counts=Object.fromEntries(Object.entries(RESPONSES).map(
   ([id,prints])=>[id,countPrintings(deck,prints)]));
  return {rank:deck.rank,archetype:deck.archetype,locks:threats.get(deck.rank),
   counts,groups:Object.fromEntries(Object.entries(GROUPS).map(
    ([id,parts])=>[id,parts.some(p=>counts[p]>0)]))};
 }).sort((a,b)=>a.rank-b.rank);
 const missing=source.missing_full_lists.map(r=>r.rank).sort((a,b)=>a-b);
 assert.equal(rows.length+missing.length,32);
 assert.ok(missing.every(rank=>!seen.has(rank)));
 const summarise=(key,predicate)=>{const selected=rows.filter(predicate);
  return {decks:selected.length,ranks:selected.map(row=>row.rank),
   ...(key?{copies:selected.reduce((s,row)=>s+row.counts[key],0)}:{})};};
 return {
  schema:'aichi-printing-lock-response-crosswalk-v2',
  published:rows.length,missing,knownLockDecks:lock.placementsWithKnownLock,
  lockDefinitions:lock.entries.map(({name,set,number,kind,activation,decks,slots})=>
   ({name,set,number,kind,activation,decks,slots})),
  responses:Object.fromEntries(Object.keys(RESPONSES).map(id=>
   [id,summarise(id,row=>row.counts[id]>0)])),
  groups:Object.fromEntries(Object.keys(GROUPS).map(id=>
   [id,summarise(null,row=>row.groups[id])])),
  rows,
  caveat:'Printed exposure only. Item locks block Item removal. Ranger clears attack effects. Active spot, turn costs and other responses are not modeled.'
 };
}
if(require.main===module){
 const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
 process.stdout.write(JSON.stringify(analyse(source),null,2)+'\n');
}
module.exports={RESPONSES,GROUPS,countPrintings,analyse};
