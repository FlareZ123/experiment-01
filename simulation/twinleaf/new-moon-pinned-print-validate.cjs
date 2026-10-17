'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const mapping=require('../../results/als/new-moon-perfection-english-map.json');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {DeckAnalyser}=require(path.join(output,'game/cards/deck-analyser'));
const {Format}=require(path.join(output,'game/store/card/card-types'));
/** Validate one exact 60 for engine experiments. Japanese printing proof is separate. */
function validate(){
  const manager=initializeCards(),ids=[],out=[];
  assert.equal(mapping.entries.length,33);
  for(const row of mapping.entries){
    const card=manager.getCardByName(row.twinleaf_full_name);
    assert.ok(card,'Engine print missing: '+row.name+' / '+row.twinleaf_full_name);
    assert.equal(card.fullName,row.twinleaf_full_name,'Wrong simulator printing');
    if(row.signature){
      const powers=(card.powers||[]).map(p=>p.name);
      const attacks=(card.attacks||[]).map(a=>a.name);
      assert.ok(powers.includes(row.signature)||attacks.includes(row.signature),
        'Wrong gameplay variant: '+row.name+' expected '+row.signature);
    }
    for(let i=0;i<row.count;i++)ids.push(card.fullName);
    out.push({source:row.name,engine:card.fullName,count:row.count,
      sourceSignature:row.signature});
  }
  assert.equal(ids.length,60);
  const engineLegal=new DeckAnalyser(ids).isValid(Format.EXPANDED);
  assert.equal(engineLegal,true,'Candidate invalid under pinned engine Expanded');
  return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceCode:mapping.source_code,engineDeckValid:engineLegal,
    printEquivalence:'English-selected mechanics equivalents, NOT Japanese source printing verification',
    cards:ids.length,uniqueRows:out.length,entries:out};
}
if(require.main===module)console.log(JSON.stringify(validate(),null,2));
module.exports={validate};
