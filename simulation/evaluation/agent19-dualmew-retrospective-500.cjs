'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const base=require('./agent19-dual-mew-original-opportunity.cjs');
const reg=require('../../results/aichi-2026/registrations/agent19-dualmew-retrospective-500-action-20261102.json');
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** Retrospective extension of all 16 earlier physical source deals. */
function run(){
  initializeCards();
  const cards=base.decks();
  const rows=base.schedule().map(t=>base.attempt(t,cards,reg.maxActions));
  return {schema:reg.schema,retrospective:true,enginePin:reg.enginePin,
    originalRank5Digest:digest(cards.mew),
    originalRank3Digest:digest(cards.others[3]),
    originalRank7Digest:digest(cards.others[7]),
    rows,summary:base.summarize(rows),qualifiedGames:0,
    caveat:'Same seeds selected after knowing 200-action outcomes. Longer horizon tests censor sensitivity only.'};
}
function save(data){
  const target=path.resolve(__dirname,'../../agent19-dualmew-retro500.json');
  const fd=fs.openSync(target+'.lock','wx');
  try{const tmp=target+'.tmp';
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n');
    fs.renameSync(tmp,target);
  }finally{fs.closeSync(fd);fs.unlinkSync(target+'.lock');}
}
if(require.main===module)save(run());
module.exports={run};
