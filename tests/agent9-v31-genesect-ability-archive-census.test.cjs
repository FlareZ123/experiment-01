'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {isAcceptedGenesectBench,censusArchivedGenesectAbility}=
  require('../scripts/agent9-v31-genesect-ability-archive-census.cjs');

function sampleArchive(){
  const make=mode=>Array.from({length:8},(_,i)=>{
    const sourceSeat=i%2;
    const events=[{storeAccepted:true,action:'PlayCardAction',
      playerSlot:sourceSeat,actionOrdinal:1,
      declared:{ownerHandPrinting:'Genesect V FST'},
      publicBoardChanges:[{seat:sourceSeat,position:'bench',
        before:{pokemon:null},after:{pokemon:'Genesect V FST'}}]}];
    const rootActionLedger=[
      {action:'PlayCardAction',playerSlot:sourceSeat},
      {action:'PassTurnAction',playerSlot:1-sourceSeat}];
    return {trial:{rank:5,id:mode+':'+i},rawNativeRow:{sourceSeat,
      rootActionCount:2,actionCount:2,rootActionLedger,
      nativeAcceptedTargetSidecar:{events},finished:false}};
  });
  return {
    schema:'agent13-integrated-rank5-v31-corrected-root-release-v1',
    attempted:16,enginePin:'a9905a76',modes:{
      frozenV2Control:{attempts:make('v2')},
      integratedV3:{attempts:make('v3')}
    }
  };
}

test('source Genesect requires native acceptance, correct seat and public Bench movement',()=>{
  const valid=sampleArchive().modes.frozenV2Control.attempts[0]
    .rawNativeRow.nativeAcceptedTargetSidecar.events[0];
  assert.equal(isAcceptedGenesectBench(valid,0),true);
  assert.equal(isAcceptedGenesectBench(valid,1),false);
  assert.equal(isAcceptedGenesectBench({...valid,storeAccepted:false},0),false);
  assert.equal(isAcceptedGenesectBench({...valid,
    declared:{ownerHandPrinting:'Crobat V DAA'}},0),false);
  assert.equal(isAcceptedGenesectBench({...valid,publicBoardChanges:[]},0),false);
});

test('eight source arms in both modes preserve ability, attack and Bench provenance',()=>{
  const archive=sampleArchive();
  const r=censusArchivedGenesectAbility(archive);
  assert.equal(r.all16NativeAttemptsCovered,true);
  assert.equal(r.competitiveQualifiedGames,0);
  for(const mode of ['frozenV2Control','integratedV3']){
    assert.equal(r.modes[mode].attempts,8);
    assert.equal(r.modes[mode].sourceAcceptedGenesectHandBenchPlays,8);
    assert.equal(r.modes[mode].sourceAcceptedUseAbilityAction,0);
    assert.equal(r.modes[mode].sourceRootActionsInspected,8);
    assert.equal(r.modes[mode].rootsInspected,16);
  }
  archive.modes.integratedV3.attempts[0].rawNativeRow.rootActionLedger[1]=
    {action:'UseAbilityAction',playerSlot:1};
  const changed=censusArchivedGenesectAbility(archive);
  assert.equal(changed.modes.integratedV3.bothSeatsAcceptedUseAbilityAction,1);
  assert.equal(changed.modes.integratedV3.sourceAcceptedUseAbilityAction,0);
  assert.equal(changed.modes.frozenV2Control.bothSeatsAcceptedUseAbilityAction,0);
});

test('incomplete native ledger or duplicate original arm fails closed',()=>{
  const archive=sampleArchive();
  archive.modes.integratedV3.attempts[0].rawNativeRow.rootActionCount=1;
  assert.throws(()=>censusArchivedGenesectAbility(archive));
  const other=sampleArchive();
  other.modes.frozenV2Control.attempts[1].trial.id=
    other.modes.frozenV2Control.attempts[0].trial.id;
  assert.throws(()=>censusArchivedGenesectAbility(other));
});
