'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {reportCoverage,prismAlias}=require(
  '../../simulation/twinleaf/card-coverage.cjs');

const file=path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json');

test('audit authenticated original source printed-name versus pinned fullName alias defects',()=>{
  const published=JSON.parse(fs.readFileSync(file,'utf8'));
  const covered=reportCoverage(published);
  assert.equal(covered.decks.length,29);
  const rows=[];
  for(const deck of covered.decks){
    const source=published.decks.find(s=>s.rank===deck.rank);
    for(let i=0;i<deck.rows.length;i++){
      const item=source.cards[i];
      const row=deck.rows[i];
      if(!['exact','exact-alias'].includes(row.status))continue;
      const expected=prismAlias(item.name)+' '+item.printing.set;
      const actual=row.exact[0].fullName;
      if(actual===expected)continue;
      rows.push({rank:deck.rank,printedName:item.name,
        set:item.printing.set,number:item.printing.number,
        expected,registered:actual,copies:item.count});
    }
  }
  const unique=[...new Map(rows.map(x=>[
    x.printedName+' '+x.set+' '+x.number,x])).values()];
  assert.ok(unique.some(x=>x.expected==='Grand Tree SCR'&&
    x.registered==='Great Tree SCR'),'Known pinned defect must be surfaced');
  console.log('AGENT18_ORIGINAL_SOURCE_FULLNAME_CENSUS',
    JSON.stringify({sourceDecks:covered.decks.length,
      printedRows:covered.requestedPrintingRows,
      differingRows:rows.length,uniquePrintings:unique.length,
      fullAnomalies:unique
    }));
});
