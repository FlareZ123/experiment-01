'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {comparePanel,REGISTRATION,BASELINE,VERSION}=
  require('../simulation/evaluation/agent3-issue25-native-trainer-aba-v10.cjs');

const root=path.resolve(__dirname,'..');
const registration=JSON.parse(fs.readFileSync(path.join(root,REGISTRATION),'utf8'));
const baseline=JSON.parse(fs.readFileSync(path.join(root,BASELINE),'utf8'));

/** @param {{changedTreatment?:boolean,divergedReplay?:boolean}} [options] */
function makeSynthetic(options={}){
  const b=new Map(baseline.baselineRecordedRows.map(x=>[x.id,x]));
  return registration.experimentalArms.map((mode,index)=>({
    armId:mode.id,
    attempts:registration.trialIds.map(id=>{
      const row=b.get(id);
      const nativePublicRootActions=[
        {actionOrdinal:0,turnBefore:1,turnAfter:2,playerSlot:row.actualSourceSeat,
          action:'PassTurnAction'}
      ];
      if(index===1&&options.changedTreatment&&id===registration.trialIds[0])
        nativePublicRootActions.push({
          actionOrdinal:1,turnBefore:2,turnAfter:2,
          playerSlot:row.actualSourceSeat,action:'PlayCardAction',
          card:'Trainers Mail ROS'
        });
      const publicRootSha=index===2&&options.divergedReplay&&
        id===registration.trialIds[0]?'0'.repeat(64):
        row.publicRootLedgerSha256;
      return {id,status:row.status,sourceSeat:row.actualSourceSeat,
        actualFirstPlayer:row.actualFirstPlayer,
        sourceDealFingerprint:row.sourceDealFingerprint,
        fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
        sourceDeckFingerprint:'a'.repeat(64),
        candidateDeckFingerprint:'b'.repeat(64),
        rawPublicRootSha256:publicRootSha,
        rootCount:row.nativeRootCount,
        sourceActions:{nonPassNonPrompt:index===1?1:0,attack:0},
        candidateActions:{attack:0},
        genericNativeFallback:index===1?{
          selectedNativeTrainerRoots:1,acceptedNativeTrainerRoots:1
        }:null,
        sourceTrainerFrontier:null,
        nativePublicRootActions
      };
    })
  }));
}

test('precommitted original 8x3 IDs and modes remain 24 attempts',()=>{
  assert.equal(registration.expectedGames,24);
  assert.deepEqual(registration.experimentalArms.map(x=>x.id),
    ['control','native-trainer-fallback','control-repeat']);
  assert.equal(new Set(registration.trialIds).size,8);
  assert.equal(VERSION,'agent3-issue25-generic-native-trainer-aba-v10');
});

test('frozen A/B/A controls match actual v6 full physical and public action SHA',()=>{
  const got=comparePanel(makeSynthetic(),registration,baseline);
  assert.equal(got.attemptsArchived,24);
  assert.equal(got.originalV6ControlReproducedGroups,8);
  assert.equal(got.repeatControlPublicRootReproducedGroups,8);
  assert.equal(got.physicalMatchGroups,8);
  assert.equal(got.firstPublicActionDifferences,0);
  assert.equal(got.independentCompetitiveGames,0);
  assert.equal(got.demonstrationOf99Point5Percent,false);
});

test('native accepted treatment change records first actual public fork without laundering win',()=>{
  const got=comparePanel(makeSynthetic({changedTreatment:true}),
    registration,baseline);
  assert.equal(got.firstPublicActionDifferences,1);
  assert.equal(got.groups[0].firstPublicActionDifference.index,1);
  assert.equal(got.groups[0].arms[1].genericNativeFallback
    .acceptedNativeTrainerRoots,1);
  assert.equal(got.originalSourceSelectedNonPassTotalTreatment,8);
  assert.equal(got.originalSourceSelectedNonPassTotalControl,0);
  assert.equal(got.independentCompetitiveGames,0);
});

test('a diverged control repetition fails equivalence despite equal physical deals',()=>{
  const got=comparePanel(makeSynthetic({divergedReplay:true}),
    registration,baseline);
  assert.equal(got.physicalMatchGroups,8);
  assert.equal(got.repeatControlPublicRootReproducedGroups,7);
  assert.equal(got.originalV6ControlReproducedGroups,8);
});

test('displaced original trial IDs and missing native arms fail closed',()=>{
  const x=makeSynthetic();
  x[1].attempts[3].id='FAKE';
  assert.throws(()=>comparePanel(x,registration,baseline));
  const y=makeSynthetic();
  y[0].attempts.pop();
  assert.throws(()=>comparePanel(y,registration,baseline));
  const z=makeSynthetic();
  z[2].armId='treatment';
  assert.throws(()=>comparePanel(z,registration,baseline));
});
