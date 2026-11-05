'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {VERSION,run,write}=
  require('../simulation/evaluation/agent49-rank11-first-letter-attack-root-observer.cjs');

const ID='11:102:A:champion-reference';
function fixture(attack=true){
  const roots=[
    {actionOrdinal:11,turnBefore:2,playerSlot:1,
      action:'PlayCardAction',card:"Professor's Letter"},
    {actionOrdinal:12,turnBefore:2,playerSlot:1,
      action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt'},
    {actionOrdinal:16,turnBefore:2,playerSlot:1,
      action:'PlayCardAction',card:'Darkness Energy'},
    ...(attack?[{actionOrdinal:17,turnBefore:2,playerSlot:1,
      action:'AttackAction',attack:'Call for Family'}]:[]),
    {actionOrdinal:18,turnBefore:2,playerSlot:0,
      action:'PassTurnAction'}
  ];
  const target={trial:{id:ID},rootActionLedger:roots,
    publicAttackTransitions:[],nativeAbortEvidence:{
      pendingPrompt:'ChooseCardsPrompt'},
    status:'engine-error'};
  const steward=()=>({rawDevelopment:{rows:[
    target,...Array.from({length:7},(_,i)=>({trial:{id:'other-'+i},
      rootActionLedger:[]}))]}});
  const oneLetter=({runner})=>{runner();return {};};
  const lateRun=({baseRun})=>{
    baseRun({registration:{selectedOriginalId:ID,originalSourceSeat:1,
      sourcePassRootOrdinal:11,sourceTurn:2}});
    return {originalPreForkSourceRootTapeMatched:true,
      sourceOwnerCardAcceptedByNativeStore:true,
      attemptedNativeOriginalRows:8,
      ownerLetterSearchAudit:{searchPromptsSettled:1,
        physicalDarknessToHand:2},
      originalSourceRowDisposition:'engine-error',
      allNativeArmDispositions:Array.from({length:8},(_,i)=>({
        id:'arm-'+i,status:i===4?'engine-error':null}))};
  };
  return {lateRun,oneLetter,steward};
}
test('source-only accepted attack root is a real observed action, not a guessed event',()=>{
  const result=run(fixture());
  assert.equal(result.schema,VERSION);
  assert.equal(result.nativeLetterPhysicalTwoDarkness,true);
  assert.deepEqual(result.sourceAttackCustody.nativeSourceTurnRootActions
    .map(x=>x.action),[
      'PlayCardAction','ResolvePromptAction','PlayCardAction','AttackAction'
    ]);
  assert.deepEqual(result.sourceAttackCustody.nativeSourceTurnRootActions
    .at(-1).attack,'Call for Family');
  assert.equal(result.sourceAttackCustody.abortPromptType,'ChooseCardsPrompt');
  assert.equal(result.sourceAttackCustody.opponentHiddenZoneRead,false);
  assert.equal(result.originalSourceQualifiedGames,0);
});
test('absence of native AttackAction is exposed, without inventing Call for Family',()=>{
  const r=run(fixture(false));
  assert.equal(r.sourceAttackCustody.nativeSourceTurnRootActions
    .some(x=>x.action==='AttackAction'),false);
});
test('lock and atomic research receipt writer',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent49-family-'));
  const f=path.join(dir,'receipt.json');
  try{
    const r=run(fixture());
    const digest=write(f,r);assert.ok(digest.bytes>0);
    const copy=JSON.parse(fs.readFileSync(f,'utf8'));
    assert.equal(copy.schema,VERSION);
    const fd=fs.openSync(f+'.lock','wx');
    try{assert.throws(()=>write(f,r));}
    finally{fs.closeSync(fd);fs.unlinkSync(f+'.lock');}
  }finally{fs.rmSync(dir,{force:true,recursive:true});}
});
