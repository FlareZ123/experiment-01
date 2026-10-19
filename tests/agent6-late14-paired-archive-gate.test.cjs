'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyPairedLate14,ID}=
  require('../scripts/agent6-late14-paired-archive-gate.cjs');

/** @returns {{base:object,late:object}} Minimal four-arm mock maintaining provenance. */
function fixture(){
  const ids=['6:0:A:champion-reference','6:0:A:new-moon-lockbreaker-v1',
    '11:2:B:champion-reference',ID];
  const rows=ids.map((id,i)=>({
    trial:{id,seed:i,rank:i<2?6:11},
    sourceDealFingerprint:'source'+i,
    sourceFirstOwnHandSha256:'source-hand'+i,
    actualStarterSeat:i<2?0:1,candidateSeat:i<2?0:1,
    sourceSeat:i<2?1:0,verifiedFirstTurn:true,
    rootActionLedgerSha256:'root'+i,
    actionCount:260,finished:false,endReason:'action-limit',
    winner:null,attackDeclarations:{source:9,candidate:0}
  }));
  const later=structuredClone(rows);
  later[3].rootActionLedgerSha256='late-root';
  later[3].candidateBattleCompressorRoots=[{
    turn:11,ordinal:96,card:'Battle Compressor'
  }];
  later[3].candidateOwnDeckSelectionEvidence=[{
    turn:11,ordinal:97,parentRootOrdinal:96,
    selectedCards:['Gengar & Mimikyu-GX TEU','Trevenant & Dusknoir-GX SMP']
  }];
  later[3].candidateAttackDeclarationEvidence=[
    {turn:21,attackName:'Poltergeist'},
    {turn:23,attackName:'Poltergeist'}
  ];
  later[3].actionCount=164;
  later[3].finished=true;later[3].endReason='engine-game-end';
  later[3].winner=1;later[3].finalPrizes=[6,0];
  later[3].sourceAudit={completed:false};
  later[3].attackDeclarations={source:9,candidate:2};
  later[3].settledPublicAttackCount=11;
  later[3].firstSettledPublicAttack=[{},{}];
  return {
    base:{enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      rows,competitiveQualifiedGames:0},
    late:{enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      rows:later,ownerCompressorLate14OptIn:true,competitiveQualifiedGames:0}
  };
}

test('paired historical archive detects one late-owned donor and attack branch',()=>{
  const {base,late}=fixture();
  const x=classifyPairedLate14(base,late);
  assert.equal(x.unchangedRootArms,3);
  assert.equal(x.changedRootArms,1);
  assert.equal(x.donorPreparation.searchOrdinal,97);
  assert.equal(x.earliestAttackGlobalTurnLag,10);
  assert.equal(x.effectQualification.printedPoltergeistEffectVerified,false);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('fail closed on changed physical source hands and incompatible actor seat',()=>{
  const {base,late}=fixture();
  late.rows[3].sourceFirstOwnHandSha256='altered';
  assert.throws(()=>classifyPairedLate14(base,late),/source-hand/);
  late.rows[3].sourceFirstOwnHandSha256=base.rows[3].sourceFirstOwnHandSha256;
  late.rows[3].candidateSeat=0;
  assert.throws(()=>classifyPairedLate14(base,late));
});

test('absence of owner-donor root or declared attacks cannot count as conversion',()=>{
  const {base,late}=fixture();
  late.rows[3].candidateOwnDeckSelectionEvidence=[];
  assert.throws(()=>classifyPairedLate14(base,late),/No search selection/);
  late.rows[3].candidateOwnDeckSelectionEvidence=[
    {ordinal:97,parentRootOrdinal:96,selectedCards:['Gengar & Mimikyu-GX TEU']}];
  assert.throws(()=>classifyPairedLate14(base,late),/Missing donor/);
});
