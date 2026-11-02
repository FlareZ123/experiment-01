'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceTrainerPlaysFromNativeRow,auditSourceTrainerPlays}=
  require('../scripts/agent9-rank5-original-trainer-source-plays.cjs');

function attempt(mode,i){
  const sourceSeat=i%2;
  const rootActionLedger=[
    {playerSlot:sourceSeat,action:'PlayCardAction'},
    {playerSlot:sourceSeat,action:'PlayCardAction'},
    {playerSlot:1-sourceSeat,action:'PlayCardAction'}
  ];
  const make=(seat,name)=>({storeAccepted:true,playerSlot:seat,
    action:'PlayCardAction',declared:{ownerHandPrinting:name}});
  const nativeAcceptedTargetSidecar={events:[
    make(sourceSeat,'Mew V FST'),
    make(sourceSeat,'Double Colorless Energy SUM'),
    make(1-sourceSeat,'Fog Crystal CRE')
  ]};
  return {trial:{rank:5,id:mode+':'+i},rawNativeRow:{sourceSeat,
    rootActionCount:3,actionCount:3,rootActionLedger,
    nativeAcceptedTargetSidecar}};
}

function fixture(family){
  const names=family==='v31'?['frozenV2Control','integratedV3']:
    ['integratedV3Control','integratedV3FusionMobility'];
  const count=family==='v31'?8:4;
  return {attempted:16,requestedNativeAttempts:8,
    modes:Object.fromEntries(names.map(name=>[name,{
      attempts:Array.from({length:count},(_,i)=>attempt(name,i))
    }]))};
}

test('complete sidecar confirms physical Pokemon and Energy and opponent Trainer',()=>{
  const v=sourceTrainerPlaysFromNativeRow(attempt('m',0).rawNativeRow);
  assert.equal(v.totalSourcePlayCards,2);
  assert.equal(v.sourceClassCounts.pokemon,1);
  assert.equal(v.sourceClassCounts.energy,1);
  assert.equal(v.sourceClassCounts.unknown,0);
  assert.equal(v.candidateAcceptedFogCrystal,1);
});

test('both experiment archives fully reconcile all planned native attempts',()=>{
  for(const [name,arms] of [['v31',16],['fusionMobility',8]]){
    const a=auditSourceTrainerPlays(fixture(name),name);
    assert.equal(a.archivedAttempts,arms);
    assert.equal(a.observedSourcePlayCards,arms*2);
    assert.equal(a.observedSourceUnclassified,0);
    assert.equal(a.observedSourceTrainerPlays,0);
    assert.equal(a.candidateFogCrystalAccepted,arms);
    assert.equal(a.competitiveQualifiedGames,0);
  }
});

test('unrecognized physically played printing cannot silently become Trainer zero',()=>{
  const a=fixture('v31');
  a.modes.integratedV3.attempts[0].rawNativeRow
    .nativeAcceptedTargetSidecar.events[0].declared.ownerHandPrinting=
    'Ultra Ball BRS';
  assert.throws(()=>auditSourceTrainerPlays(a,'v31'),
    /Unknown original-source/);
});

test('missing or mismatched actual native action ledger fails closed',()=>{
  const a=fixture('fusionMobility');
  a.modes.integratedV3Control.attempts[1].rawNativeRow
    .nativeAcceptedTargetSidecar.events.shift();
  assert.throws(()=>auditSourceTrainerPlays(a,'fusionMobility'));
});
