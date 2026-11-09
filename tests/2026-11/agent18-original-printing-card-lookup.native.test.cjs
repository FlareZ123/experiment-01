'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {
  getExactOriginalPrinting
}=require('../../simulation/twinleaf/2026-11/agent18-original-printing-card-lookup.cjs');

const file=path.resolve(__dirname,
  '../../results/methodology/data/agent18-original-source-fullname-census-20261109.json');

test('all 22 authenticated cross-name original printings resolve without aliasing or collapsing reprints',()=>{
  const receipt=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(receipt.sourceDecks,29);
  assert.equal(receipt.uniquePrintings,22);
  const manager=initializeCards();
  const rows=[];
  for(const source of receipt.fullAnomalies){
    const actual=getExactOriginalPrinting(manager,{
      name:source.printedName,
      printing:{set:source.set,number:source.number}
    });
    assert.equal(actual.nativeId,source.registered);
    assert.equal(actual.card.fullName,source.registered);
    assert.equal(actual.card.set,source.set);
    assert.equal(String(actual.card.setNumber),String(source.number));
    rows.push({printing:source.printedName+' '+source.set+' #'+source.number,
      nativeId:actual.nativeId});
  }
  assert.equal(rows.length,22);
  const bwp28=getExactOriginalPrinting(manager,{
    name:'Tropical Beach',printing:{set:'BWP',number:'28'}});
  const bwp50=getExactOriginalPrinting(manager,{
    name:'Tropical Beach',printing:{set:'BWP',number:'50'}});
  assert.notEqual(bwp28.nativeId,bwp50.nativeId);
  assert.equal(bwp50.nativeId,'Tropical Beach BWP 50');
  assert.equal(bwp28.card.name,bwp50.card.name);
  assert.equal(bwp28.card.set,bwp50.card.set);
  assert.throws(()=>getExactOriginalPrinting(manager,{
    name:'Electrike',printing:{set:'PRC',number:'60'}
  }),/exactly one match.*found 2/);
  console.log('AGENT18_EXACT_SOURCE_PRINT_LOOKUP',JSON.stringify({
    sourceDecks:receipt.sourceDecks,
    verifiedDiscrepantPrintings:rows.length,
    nativeGrandTree:rows.find(r=>r.printing==='Grand Tree SCR #136')?.nativeId,
    tropicalBeachPrint28:bwp28.nativeId,
    tropicalBeachPrint50:bwp50.nativeId,
    ambiguousElectrikePRC60Rejected:true,
    alteredNativeCardObjects:false,
    qualifiedPaperGames:0
  }));
});
