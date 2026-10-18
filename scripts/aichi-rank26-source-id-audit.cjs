'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const manifestPath=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');

/**
 * Print the *position-derived* exact registered Dedenne-GX source instance.
 * This deliberately avoids a guessed English engine fullName prefix.
 * @returns {object}
 */
function audit(){
  const source=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const registered=source.decks.find(entry=>entry.rank===26);
  assert.ok(registered);
  const index=registered.cards.findIndex(row=>row.name==='Dedenne-GX');
  assert.ok(index>=0);
  const row=registered.cards[index];
  assert.equal(row.count,1);
  const before=registered.cards.slice(0,index)
    .reduce((sum,entry)=>sum+entry.count,0);
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  assert.equal(plan.candidate.cards.length,60);
  const engineName=plan.candidate.cards[before];
  assert.equal(typeof engineName,'string');
  const card=initializeCards().getCardByName(engineName);
  assert.ok(card);
  assert.equal(card.name,'Dedenne-GX');
  assert.equal(String(card.set).toUpperCase(),row.printing.set);
  assert.equal(String(card.setNumber),row.printing.number);
  return {schema:'rank26-source-position-card-identity-v1',
    sourceRank:26,registered:row,cardOrdinal:before,
    resolvedFullName:engineName,
    engine:{name:card.name,set:card.set,number:card.setNumber},
    source60Count:plan.candidate.cards.length,
    identityValid:true,
    scope:'Card-ID resolver identity check, not attack semantics or paper legality'};
}

if(require.main===module)process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
module.exports={audit};
