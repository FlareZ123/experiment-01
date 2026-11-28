'use strict';
// Read-only source-to-policy coverage inventory for the original Aichi 2026
// Regidrago lists. Usage: node results/aichi-2026/2026-11/
// agent26-regidrago-source-dragon-inventory.cjs
// Requires only checked-in resources and Node; no native Twinleaf or game.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
function json(...segments){return JSON.parse(fs.readFileSync(path.join(root,...segments),'utf8'));}
function main(){
  const field=json('results','aichi-2026','full-decklists.json');
  const sets=json('resources','sets','en.json');
  const policyText=fs.readFileSync(path.join(root,'simulation','evaluation',
    '2026-11','agent46-two-profile-candidate-policy.cjs'),'utf8');
  const start=policyText.indexOf('const APEX_PAYLOADS=[');
  const end=policyText.indexOf('];',start);
  if(start<0||end<start)throw Error('APEX_PAYLOADS source block unavailable');
  const modeled=new Set();
  for(const match of policyText.slice(start,end).matchAll(
      /\['([^']+)','([^']+)',\s*\d+\]/g)){
    modeled.add(match[1]); 
  }
  if(!modeled.size)throw Error('Apex source payload parser found zero rows');
  const sourceLists=field.decks.filter(deck=>/Regidrago/i.test(deck.archetype));
  const readCard=(item)=>{
    const variants=sets.filter(s=>s.ptcgoCode===item.printing.set);
    for(const s of variants){
      const filename=path.join(root,'resources','cards','en',s.id+'.json');
      if(!fs.existsSync(filename))continue;
      const card=json('resources','cards','en',s.id+'.json')
        .find(c=>String(c.number)===String(item.printing.number)&&c.name===item.name);
      if(card)return card;
    }
    throw Error('Missing exact print '+item.name+' '+item.printing.set+' '+item.printing.number);
  };
  const dragon=new Map();
  for(const deck of sourceLists)for(const item of deck.cards){
    if(item.category!=='Pokémon')continue;
    const card=readCard(item);
    if(!card.types?.includes('Dragon'))continue;
    const display=item.name+' '+item.printing.set;
    const key=card.id;
    const row=dragon.get(key)||{
      printing:display,id:key,sourceRanks:[],sourceCopies:0,
      attacks:(card.attacks||[]).map(a=>({name:a.name,damage:a.damage??'',
        text:a.text??''})),modeled:modeled.has(display),
      hasPrintedDamage:(card.attacks||[]).some(a=>
        /\d/.test(a.damage??'')||/does \d+ damage/i.test(a.text??''))
    };
    row.sourceRanks.push(deck.rank);row.sourceCopies+=item.count;
    dragon.set(key,row);
  }
  const rows=[...dragon.values()].sort((a,b)=>a.printing.localeCompare(b.printing));
  const missingDirect=rows.filter(row=>row.hasPrintedDamage&&!row.modeled);
  const summary={
    schema:'agent26-published-regidrago-dragon-payload-source-inventory-v1',
    sourceFieldCount:field.decks.length,sourceRegidragoRanks:sourceLists.map(d=>d.rank),
    sourceDragonPrintings:rows.length,modeledDamagingPrintings:
      rows.filter(row=>row.hasPrintedDamage&&row.modeled).length,
    missingDirect:missingDirect.map(r=>r.printing),
    entries:rows.map(row=>({
      printing:row.printing,id:row.id,sourceRanks:row.sourceRanks,
      copiesAcrossLists:row.sourceCopies,
      attackNames:row.attacks.map(a=>a.name),
      hasPrintedDamage:row.hasPrintedDamage,modelHasPayload:row.modeled
    }))
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  if(missingDirect.length)process.exitCode=1;
}
if(require.main===module)main();
module.exports={main};
