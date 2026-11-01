'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json');
const {censusFromRepository}=
  require('../scripts/agent30-roster-direct-energy-census.cjs');
const {originalFundingIndex,auditNativeOriginalEnergyRecipients,
  registeredRank30Rows}=
  require('../scripts/agent7-original-native-energy-recipient-feasibility.cjs');

const census=censusFromRepository();

/** A Store sidecar with two public recipient changes is ambiguous and cannot
 * establish which changed slot received the particular original Energy card.
 * @param {string} pokemon Native public printing
 * @param {string} printing Original source Energy display
 * @param {object} [options] Native synthetic receipt controls
 * @returns {object}
 */
function event(pokemon,printing,options={}){
  const position=options.position??'active';
  const change={seat:options.seat??1,position,index:0,
    before:{pokemon,energies:[]},
    after:{pokemon,energies:[printing]}};
  return {
    action:'PlayCardAction',actionOrdinal:options.ordinal??12,
    turnBefore:options.turn??3,
    playerSlot:options.playerSlot??1,
    storeAccepted:options.accepted??true,
    declared:{ownerHandPrinting:printing},
    publicBoardChanges:options.changes??[change]
  };
}
/** @param {object[]} events @param {number} rank */
function row(events,rank=30){
  return {trial:{id:rank+':fixture',rank},
    sourceSeat:1,sourceDealFingerprint:'synthetic-source-deal',
    nativeAcceptedTargetSidecar:{sha256:'test-target-sha',events}};
}

test('exact original rank30 printed-attack inventory identifies Crobat and Empoleon',()=>{
  const idx=originalFundingIndex(source,census.rows).get(30);
  assert.equal(idx.pokemon.get('Crobat V DAA')[0].status,'IMPOSSIBLE');
  assert.equal(idx.pokemon.get('Empoleon V BST')[0].status,'IMPOSSIBLE');
  assert.equal(idx.pokemon.get("Lillie's Clefairy ex JTG")[0].status,
    'POSSIBLE');
  assert.ok(idx.energy.has('Psychic Energy MEE'));
  assert.ok(idx.energy.has('Telepathic Psychic Energy POR'));
  assert.equal(idx.energy.size,2);
});

test('actual native source original-60 accepted Energy recipient is source-funded tri-state',()=>{
  const actual=[
    event('Crobat V DAA','Psychic Energy MEE'),
    event("Lillie's Clefairy ex JTG",'Psychic Energy MEE',
      {ordinal:13,position:'bench'}),
    event('Crobat V DAA','Psychic Energy MEE',
      {ordinal:14,changes:[]}),
    event('Crobat V DAA','Psychic Energy MEE',
      {ordinal:15,accepted:false}),
    event('Crobat V DAA','Psychic Energy MEE',
      {ordinal:16,playerSlot:0}),
    event('Crobat V DAA','Telepathic Psychic Energy M3',
      {ordinal:17}),
    event('Crobat V DAA','Energy Retrieval POR',
      {ordinal:18})
  ];
  const result=auditNativeOriginalEnergyRecipients(
    [row(actual)],source,census.rows);
  const s=result.summary;
  assert.equal(s.nativeGames,1);
  assert.equal(s.acceptedSourceEnergyPlays,3);
  assert.equal(s.settledUniqueTargets,2);
  assert.equal(s.noUniquePhysicalTarget,1);
  assert.equal(s.unverifiedSourceEnergyPrintings,1);
  assert.equal(s.byAttackFunding.IMPOSSIBLE,1);
  assert.equal(s.byAttackFunding.POSSIBLE,1);
  assert.equal(s.byRecipient['30|Crobat V DAA|active'],1);
  assert.equal(s.byRecipient["30|Lillie's Clefairy ex JTG|bench"],1);
  assert.deepEqual(result.receipts.map(r=>r.actionOrdinal),[12,13]);
  assert.equal(result.receipts[0].sourceDealFingerprint,
    'synthetic-source-deal');
});

test('no source exact printing, wrong owner, or two changed targets never guessed',()=>{
  const known=event('Crobat V DAA','Psychic Energy MEE',{ordinal:1,
    changes:[
      {seat:1,position:'active',index:0,
       before:{pokemon:'Crobat V DAA',energies:[]},
       after:{pokemon:'Crobat V DAA',energies:['Psychic Energy MEE']}},
      {seat:1,position:'bench',index:0,
       before:{pokemon:"Lillie's Clefairy ex JTG",energies:[]},
       after:{pokemon:"Lillie's Clefairy ex JTG",
        energies:['Psychic Energy MEE']}}
    ]});
  const unknown=event('Unknown Exact Print DAA','Psychic Energy MEE',
    {ordinal:2});
  const other=event('Crobat V DAA','Psychic Energy MEE',
    {ordinal:3,seat:0});
  const a=auditNativeOriginalEnergyRecipients(
    [row([known,unknown,other]),{trial:{rank:30},sourceSeat:1}],
    source,census.rows);
  assert.equal(a.summary.acceptedSourceEnergyPlays,3);
  assert.equal(a.summary.noUniquePhysicalTarget,2);
  assert.equal(a.summary.unknownSourceRecipient,1);
  assert.equal(a.summary.settledUniqueTargets,1);
  assert.equal(a.receipts[0].status,'SOURCE_RECIPIENT_UNRESOLVED');
});

test('missing actual sidecar is labeled, not silently claimed complete',()=>{
  const a=auditNativeOriginalEnergyRecipients(
    [{trial:{rank:30},sourceSeat:1}],source,census.rows);
  assert.equal(a.summary.nativeGames,1);
  assert.equal(a.summary.sourceArmsWithoutSidecar,1);
  assert.equal(a.summary.acceptedSourceEnergyPlays,0);
});

test('eight source-dealt rank30 groups remain sixteen games, one arm only',()=>{
  const sourceGroups=Array.from({length:8},(_,i)=>({
    control:{rows:[{seed:i,arm:'control'},{seed:i,arm:'control'}]},
    guarded:{rows:[{seed:i,arm:'guarded'},{seed:i,arm:'guarded'}]}
  }));
  const registered={registration:{rank:30,sourceGroups:8,
    pairedGames:16},complete:sourceGroups};
  const control=registeredRank30Rows(registered);
  const guarded=registeredRank30Rows(registered,'guarded');
  assert.equal(control.length,16);
  assert.equal(guarded.length,16);
  assert.ok(control.every(r=>r.arm==='control'));
  assert.ok(guarded.every(r=>r.arm==='guarded'));
  assert.throws(()=>registeredRank30Rows(registered,'both'));
});
