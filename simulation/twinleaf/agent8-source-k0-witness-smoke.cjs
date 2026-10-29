'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceK0OpportunityWitness}=require('./agent8-source-k0-opportunity-witness.cjs');
function smoke(){
 const plan=planAichi(1,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 const source=plan.opponents.find(x=>x.rank===11);
 const witness=withSourceK0OpportunityWitness(11,0,()=>runMatch({
  deckA:source.cards,deckB:plan.candidate.cards,seed:235261702,
  maxActions:120,strictPromptValidation:true
 }));
 assert.ok(witness.audit);
 return {audit:witness.audit,qualified:false};
}
if(require.main===module)console.log(JSON.stringify(smoke(),null,2));
module.exports={smoke};
