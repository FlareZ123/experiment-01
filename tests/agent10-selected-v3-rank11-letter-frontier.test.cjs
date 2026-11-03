'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {analyze,VERSION}=
  require('../scripts/agent10-selected-v3-rank11-letter-frontier.cjs');

const LETTER='Professors Letter BKT';
const other=['Float Stone BKT','Battle VIP Pass FST','Muscle Band XY',
  'Carmine TWM','Marnie SSH','Float Stone BKT'];
const all=[LETTER,...other];

function fakeRow(candidateId,seat,deal,hasLetter){
  const printings=hasLetter?all:['Dark Patch ASR',...other];
  const r={
    ordinal:0,seat,turn:1,trainers:printings.map((printing,handIndex)=>({
      handIndex,printing,nativeEnumeratorOffered:true,
      publicBlocker:null
    })),
    chosen:{action:'PassTurnAction'},
    ownerPaperNecessity:{rows:printings.map((printing,handIndex)=>({
      printing,handIndex,paperPlayable:null,necessaryBlockers:[]
    }))}
  };
  return {
    trial:{rank:11,id:'11:'+deal+':'+candidateId,candidateId},
    sourceActuallyFirst:true,sourceSeat:seat,actualStarterSeat:seat,
    sourceDealFingerprint:deal,
    sourceFirstOwnedAffordances:{firstOwnHand:{handSize:7}},
    actorOnlyDecisionCoverage:{ownerTrainerFrontierAudit:{roots:[r]}},
    rootActionLedger:[{playerSlot:seat,action:'PassTurnAction'}]
  };
}

function fixture(){
  return {
    schema:'agent4-selected-v3-paper-owner-floatstone-source-a-b-a-v1',
    modes:[{id:'selected-v3-paper-plus-funded-mobility',
      fullNative:{rows:[
        fakeRow('champion-reference',1,'deal-A',true),
        fakeRow('new-moon-lockbreaker-v1',1,'deal-A',true),
        fakeRow('champion-reference',0,'deal-B',false),
        fakeRow('new-moon-lockbreaker-v1',0,'deal-B',false)
      ]}}]
  };
}

test('paired physical openings yield one Letter-dealt source group, with no legal-play upgrade',()=>{
  const a=analyze(fixture());
  assert.equal(a.schema,VERSION);
  assert.equal(a.exactOriginalPhysicalSourceDeals,2);
  assert.equal(a.pairedCandidateContexts,4);
  assert.equal(a.initialSourceHandsFullyTrainer,4);
  assert.equal(a.openingSourceDealsWithLetter,1);
  assert.equal(a.openingLetterEnergyMinimumInDeckGivenAllSevenTrainers,2);
  assert.equal(a.repeatedLetterHeldCopyObservations,2);
  assert.equal(a.repeatedLetterNativeOfferedCopyObservations,2);
  assert.equal(a.repeatedLetterNecessaryNegativeCopyObservations,0);
  assert.equal(a.sourceSelectedLetterRoots,0);
  assert.equal(a.sourcePassRootObservationsHoldingLetter,2);
  assert.equal(a.completePaperLegalityCertified,false);
  assert.equal(a.actualPaidLetterEffectWitness,false);
  assert.equal(a.competitivelyQualifiedGames,0);
  assert.deepEqual(a.cases.map(x=>x.firstRoot.letterHeld),
    [true,true,false,false]);
});

test('missing source-root custody and physical deal mismatch fail closed',()=>{
  const a=fixture();
  a.modes[0].fullNative.rows[1].sourceDealFingerprint='deal-C';
  assert.throws(()=>analyze(a),/Two independent/);
  const b=fixture();
  b.modes[0].fullNative.rows[0].actorOnlyDecisionCoverage
    .ownerTrainerFrontierAudit.roots[0].trainers.pop();
  assert.throws(()=>analyze(b),/All seven physical/);
});

test('wrong source seat or nonopening turn is not silently counted',()=>{
  const a=fixture();
  a.modes[0].fullNative.rows[0].actualStarterSeat=0;
  assert.throws(()=>analyze(a));
  const b=fixture();
  b.modes[0].fullNative.rows[0].actorOnlyDecisionCoverage
    .ownerTrainerFrontierAudit.roots[0].turn=3;
  assert.throws(()=>analyze(b));
});
