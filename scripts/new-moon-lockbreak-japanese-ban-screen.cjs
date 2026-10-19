'use strict';

const assert=require('node:assert/strict');
const candidate=require('../results/als/new-moon-lockbreak-japanese-print-60.json');
const source=require('../results/als/new-moon-official-japanese-print-60.json');
const bans=require('../results/legality/japan-expanded-aichi-2026.json');
const {validateJapanesePrintCandidate}=require('./new-moon-lockbreak-japanese-provenance.cjs');

/** Check dated, explicitly listed name and printing collisions. */
function check(entries,rules){
  const contacts=[];
  for(const card of entries){
    for(const rule of rules.banned_identities){
      if(rule.english_name!==card.name_en)continue;
      const kind=rule.selector.type;
      if(kind==='trainer_name'||kind==='pokemon_name')
        throw Error('Whole card name restricted: '+card.name_en);
      assert.ok(kind==='ability'||kind==='attack');
      assert.notEqual(card.japanese_set,rule.japanese_printing,
        'Specifically restricted Japanese set: '+card.name_en);
      contacts.push({name:card.name_en,selected:card.japanese_set,
        restricted:rule.japanese_printing,trait:rule.selector.value});
    }
  }
  return contacts;
}

/** Validate source derivation before applying date-specific rules. */
function audit(proposal=candidate,original=source,dated=bans){
  const fixed=validateJapanesePrintCandidate(proposal,original);
  assert.equal(proposal.target_event_date,dated.valid_for_event);
  const matches=check(proposal.entries,dated);
  return {eventDate:dated.valid_for_event,japanesePrintDigest:fixed.sha256,
    printedCards:fixed.total,listedNameContacts:matches,
    restrictedPrintCollisions:0,fullPaperLegalityCertified:false,
    competitiveGamesQualified:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
module.exports={check,audit};
