'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditSourceCopiedAttacks}=
  require('../simulation/evaluation/agent22-source-copy-choice-audit.cjs');

const attack=(ordinal,opts={})=>({
  actionOrdinal:ordinal,turnBefore:opts.turn??47,
  attackName:'Cross Fusion Strike',
  settledPromptChain:opts.settled??true,
  settlementCrossesClockReset:opts.crossEpoch??false});
const choice=(root,printing,attackName,actor=0)=>({
  actionOrdinal:root+1,playerSlot:actor,
  pendingPrompt:'ChooseAttackPrompt',
  initiatingRootActionOrdinal:root,
  attackChoice:{printing,attackName,attackIndex:0,sourceIndex:0}
});
function row(attacks,ledger){
  return {trial:{id:'5:1:B:champion-reference'},sourceSeat:0,
    sourceAttackSettlement:{attacks},rootActionLedger:ledger};
}

test('one actual Genesect source copy is counted separately from declarations',()=>{
  const r=auditSourceCopiedAttacks(row(
    [attack(11)],[choice(11,'Genesect V FST','Techno Blast')]));
  assert.equal(r.nativeCrossFusionDeclarations,1);
  assert.equal(r.selectedGenesectTechnoBlast,1);
  assert.equal(r.selectedMewEnergyMix,0);
  assert.equal(r.noRecordedAttackSelection,0);
  assert.equal(r.qualifiedCompetitiveGames,0);
  assert.equal(r.records[0].paperEffectAndDamageVerified,false);
});

test('Energy Mix and unresolved no-choice sources do not count as Techno Blast',()=>{
  const r=auditSourceCopiedAttacks(row([attack(11),attack(19)],
    [choice(11,'Mew V FST','Energy Mix')]));
  assert.equal(r.nativeCrossFusionDeclarations,2);
  assert.equal(r.selectedGenesectTechnoBlast,0);
  assert.equal(r.selectedMewEnergyMix,1);
  assert.equal(r.noRecordedAttackSelection,1);
  assert.equal(r.qualificationCounts.COPY_CHOICE_UNVERIFIED,1);
});

test('same ordinal but different prompt kind or origin is never a copied attack',()=>{
  const r=auditSourceCopiedAttacks(row([attack(11)],[
    {...choice(11,'Genesect V FST','Techno Blast'),
      pendingPrompt:'SelectCardsPrompt'},
    choice(19,'Genesect V FST','Techno Blast')
  ]));
  assert.equal(r.selectedGenesectTechnoBlast,0);
  assert.equal(r.noRecordedAttackSelection,1);
});

test('the same attack root with multiple prompts is explicitly ambiguous',()=>{
  const r=auditSourceCopiedAttacks(row([attack(11)],[
    choice(11,'Mew V FST','Energy Mix'),
    {...choice(11,'Genesect V FST','Techno Blast'),actionOrdinal:13}
  ]));
  assert.equal(r.qualificationCounts.AMBIGUOUS_MULTIPLE_CHOICES,1);
  assert.equal(r.selectedGenesectTechnoBlast,0);
});

test('unsettled cross-clock source copy cannot become certified choice',()=>{
  const r=auditSourceCopiedAttacks(row([
    attack(11,{crossEpoch:true}),
    attack(21,{settled:false})
  ],[
    choice(11,'Genesect V FST','Techno Blast'),
    choice(21,'Genesect V FST','Techno Blast')
  ]));
  assert.equal(r.qualificationCounts.SETTLEMENT_UNQUALIFIED,2);
  assert.equal(r.selectedGenesectTechnoBlast,0);
});

test('unknown selected copy is kept distinct from Techno Blast',()=>{
  const r=auditSourceCopiedAttacks(row([attack(11)],
    [choice(11,'Mew VMAX FST','Max Miracle')]));
  assert.equal(r.qualificationCounts.OTHER_COPY_SELECTED,1);
});

test('invalid runner shape cannot silently promote a source attack',()=>{
  assert.throws(()=>auditSourceCopiedAttacks(null));
  assert.throws(()=>auditSourceCopiedAttacks({rootActionLedger:[]}));
  assert.throws(()=>auditSourceCopiedAttacks({
    rootActionLedger:null,sourceAttackSettlement:{attacks:[]}}));
});

test('an unrelated named source attack is never classified as Cross Fusion',()=>{
  const r=auditSourceCopiedAttacks(row([{...attack(11),attackName:'Techno Blast'}],
    [choice(11,'Genesect V FST','Techno Blast')]));
  assert.equal(r.nativeCrossFusionDeclarations,0);
});
