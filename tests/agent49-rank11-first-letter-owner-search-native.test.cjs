'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {VERSION,run,write}=
  require('../simulation/evaluation/agent49-rank11-first-letter-owner-search-native.cjs');
const source=require('../results/aichi-2026/registrations/agent49-rank11-first-letter-pass11-20261105.json');

function sourceResult(){
  return {
    registrationId:source.selectedOriginalId,
    originalBaselineSchema:
      'agent35-rank11-source-professor-letter-pass37-fork-v1',
    attemptedNativeOriginalRows:8,
    sourceDealMatched:true,entirePhysicalDealMatched:true,
    originalPreForkSourceRootTapeMatched:true,
    sourceOwnerCardAcceptedByNativeStore:true,
    nativeRootAtSelectedOrdinal:{actionOrdinal:11,turnBefore:2,playerSlot:1},
    sourceOwnerPreDecisionSnapshot:{
      actorSeat:1,globalTurn:2,decisionKind:'owner-root',
      ownHand:['Professors Letter BKT'],
      ownTurnResources:{itemPlayLocked:false},
      ownPublic:{active:{evolutionPrintings:[],energies:[],tools:[]},
        bench:[],prizeCount:6,discard:[],lostZone:[],
        resolvingSupporter:[],stadium:[],
        publicTurnRestrictions:{itemPlayLocked:false}}
    },
    ownerLetterSearchAudit:{
      legitimateOwnerDeckPrompts:1,searchChoicesSubmitted:1,
      searchPromptsSettled:1,physicalDarknessToHand:2,physicalFailures:0
    },
    sourceFollowthroughPrompts:[],
    sameTurnRealOwnerDarknessEnergyPlayRoots:[],
    originalSourceRowDisposition:'root-cap-censored',
    sourceDecoderFailure:null,
    originalSourceAcceptedRoots:48,
    allNativeArmDispositions:Array.from({length:8},(_,i)=>({
      id:'arm'+i,status:'root-cap-censored'
    }))
  };
}
test('settled genuine owner two-Energy prompt is distinguished from subsequent attachment',()=>{
  const result=run({runLate:()=>sourceResult()});
  assert.equal(result.schema,VERSION);
  assert.equal(result.nativeSourceTwoDarknessTransferred,true);
  assert.equal(result.actualSourceDarknessEnergyPlayRoots.length,0);
  assert.equal(result.physicallyQualifiedGames,0);
  const bad=sourceResult();bad.ownerLetterSearchAudit.searchPromptsSettled=0;
  assert.equal(run({runLate:()=>bad}).nativeSourceTwoDarknessTransferred,false);
});
test('original source physical custody, Item receipt and paper target gates are mandatory',()=>{
  for(const mutation of [
    r=>{r.originalPreForkSourceRootTapeMatched=false;},
    r=>{r.sourceOwnerCardAcceptedByNativeStore=false;},
    r=>{r.nativeRootAtSelectedOrdinal.actionOrdinal=37;},
    r=>{r.sourceOwnerPreDecisionSnapshot.ownTurnResources.itemPlayLocked=true;}
  ]){
    const trial=sourceResult();mutation(trial);
    assert.throws(()=>run({runLate:()=>trial}));
  }
});
test('lock and rename protect complete native research receipt',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent49-letter-search-'));
  const file=path.join(dir,'result.json');
  try{
    const r=run({runLate:()=>sourceResult()});
    const saved=write(file,r);assert.ok(saved.bytes>0);
    assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).physicallyQualifiedGames,0);
    const fd=fs.openSync(file+'.lock','wx');
    try{assert.throws(()=>write(file,r));}
    finally{fs.closeSync(fd);fs.unlinkSync(file+'.lock');}
  }finally{fs.rmSync(dir,{force:true,recursive:true});}
});
