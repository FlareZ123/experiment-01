'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {cardReference,analyze,main,printedKey,EVENT_DATE}=
  require('../scripts/agent24-spiritomb-ace-source-census.cjs');

const ORIGINAL=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));

test('exact LTR87 card text and event-bounded eligible printed ACE names',()=>{
  const ref=cardReference();
  assert.deepEqual(ref.spiritomb,{
    id:'bw11-87',name:'Spiritomb',ability:'Sealing Scream',
    text:"Each player can't play any ACE SPEC cards from his or her hand.",
    hp:80,type:'Darkness',subtypes:['Basic']
  });
  assert.deepEqual(ref.genesect,{
    id:'sv6pt5-40',name:'Genesect',ability:'ACE Nullifier',
    text:"If this Pokémon has a Pokémon Tool attached, your opponent can't play any ACE SPEC cards from their hand.",
    hp:110,type:'Metal',subtypes:['Basic']
  });
  assert.equal(EVENT_DATE,'2026/05/10');
  assert.equal(ref.exact.has('TWM::163::Secret Box'),true);
  assert.equal(ref.exact.has('TWM::165::Unfair Stamp'),true);
  assert.equal(ref.exact.has('SSP::182::Megaton Blower'),true);
  assert.equal(ref.exact.has('TEF::157::Prime Catcher'),true);
});
test('29 original exact printed source decks all contain one physically registered ACE SPEC',()=>{
  const r=main();
  assert.equal(r.analyzedOriginalDecks,29);
  assert.equal(r.registeredPlacements,32);
  assert.deepEqual(r.unresolvedRanks.map(Number),[23,25,28]);
  assert.equal(r.aceHoldingOriginalDecks,29);
  assert.equal(r.exactlyOneVerifiedAceInEveryKnownOriginal,true);
  assert.equal(r.verifiedAceCopies,29);
  assert.equal(r.knownOriginalSpiritombCopies,0);
  assert.equal(r.rows.length,29);
  assert.ok(r.rows.every(row=>row.aceCopies===1&&
    row.aceCards.length===1&&row.aceCards[0].count===1&&
    row.unverifiedPrints.length===0));
  assert.deepEqual(r.byAceName,{
    'Unfair Stamp':1,'Grand Tree':3,
    'Scoop Up Cyclone':1,'Secret Box':10,
    'Megaton Blower':10,'Prime Catcher':3,
    'Dowsing Machine':1
  });
  assert.equal(r.opponentAcePlayActionsVerified,0);
  assert.equal(r.nativeCardImplementationVerified,false);
  assert.equal(r.competitiveQualifiedGames,0);
  assert.equal(r.winRateCertified,false);
});
test('same-name altered printed ID cannot masquerade as original ACE SPEC',()=>{
  const changed=structuredClone(ORIGINAL);
  const card=changed.decks.find(x=>x.rank===1).cards.find(c=>
    c.name==='Unfair Stamp');
  assert.equal(printedKey(card),'TWM::165::Unfair Stamp');
  card.printing.number='164';
  const out=analyze(changed,cardReference());
  assert.equal(out.exactlyOneVerifiedAceInEveryKnownOriginal,false);
  assert.equal(out.aceHoldingOriginalDecks,28);
  assert.deepEqual(out.rows.find(x=>x.rank===1).unverifiedPrints,
    ['TWM::164::Unfair Stamp']);
  assert.equal(out.competitiveQualifiedGames,0);
});
test('source sixty and duplicate rank checks reject invalid census inputs',()=>{
  const missing=structuredClone(ORIGINAL);
  missing.decks[0].cards[0].count--;
  assert.throws(()=>analyze(missing,cardReference()),/Malformed original source 60/);
  const duplicates=structuredClone(ORIGINAL);
  duplicates.decks[1].rank=duplicates.decks[0].rank;
  assert.throws(()=>analyze(duplicates,cardReference()));
});
