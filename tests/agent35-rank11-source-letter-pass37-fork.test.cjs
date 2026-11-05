'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {VERSION,selectLetter,run,write}=
  require('../simulation/evaluation/agent35-rank11-source-letter-pass37-fork.cjs');
const SHA=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const registration={
  selectedOriginalId:'11:102:A:champion-reference',
  sourceTurn:8,originalSourceSeat:1,candidateSeat:0,
  sourceCardToPlay:'Professors Letter BKT',
  sourcePassRootOrdinal:37,
  originalSourceDealSha256:'source-deal',
  originalWholePhysicalDealSha256:'whole-deal'
};
const view={actorSeat:1,globalTurn:8,decisionKind:'owner-root',
  ownHand:['Guzma BUS','Professors Letter BKT','Float Stone BKT'],
  ownTurnResources:{itemPlayLocked:false,energyPlayedTurn:0},
  ownPublic:{publicTurnRestrictions:{itemPlayLocked:false}},
  opponentPublic:{}};
test('owner-only Letter needs right seat, held copy and unlocked Item',()=>{
  assert.equal(selectLetter(view,registration),1);
  for(const change of [
    x=>{x.actorSeat=0;},x=>{x.globalTurn=7;},
    x=>{x.decisionKind='prompt';},x=>{x.ownHand=[];},
    x=>{x.ownTurnResources.itemPlayLocked=true;},
    x=>{x.ownPublic.publicTurnRestrictions.itemPlayLocked=true;}
  ]){
    const mutated=structuredClone(view);
    change(mutated);
    assert.equal(selectLetter(mutated,registration),null);
  }
});
function fixture(){
  const roots=Array.from({length:48},(_,actionOrdinal)=>({
    actionOrdinal,turnBefore:8,playerSlot:1,action:'ResolvePromptAction'
  }));
  const orig=roots.slice(0,37);
  roots[37]={actionOrdinal:37,turnBefore:8,playerSlot:1,
    action:'PlayCardAction',card:"Professor's Letter"};
  roots[38]={actionOrdinal:38,turnBefore:8,playerSlot:1,
    action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt'};
  const reg={...registration,beforePassRootPrefixLedgerSha256:SHA(orig)};
  const rows=Array.from({length:8},(_,i)=>({trial:{
    id:i===0?reg.selectedOriginalId:'fixture-'+i},
    sourceDealFingerprint:i===0?reg.originalSourceDealSha256:'other',
    fullPhysicalDealFingerprint:i===0?
      reg.originalWholePhysicalDealSha256:'other',
    status:'root-cap-censored',rootActionLedger:i===0?roots:[]}));
  const observed={result:{
    manifest:{observedTwinleafGitCommit:'fixture-pinned',
      version:'selected-v5'},
    rawDevelopment:{rows}},audit:{selectedCount:1,
      proposedAction:'PlayCardAction',actorSnapshot:view}};
  const withMock=fn=>{fn();return observed;};
  return {reg,rows,withMock};
}
function execute(a){return run({registration:a.reg,
  withLetterFork:a.withMock,runner:()=>{},
  headless:{},SimpleTacticsAi:class{},PlayCardAction:class{}});}
test('native root custody and genuine prompt are counted, zero wins',()=>{
  const a=fixture();
  const r=execute(a);
  assert.equal(r.schema,VERSION);
  assert.equal(r.attemptedNativeOriginalRows,8);
  assert.equal(r.originalPreForkSourceRootTapeMatched,true);
  assert.equal(r.sourceOwnerPass37Reached,true);
  assert.equal(r.sourceOwnerCardAcceptedByNativeStore,true);
  assert.equal(r.sourceFollowthroughPrompts.length,1);
  assert.equal(r.competitiveGamesQualified,0);
  a.rows[0].rootActionLedger[37].card='Other';
  assert.equal(execute(a).sourceOwnerCardAcceptedByNativeStore,false);
});
test('changed original source physical deals are hard vetoes',()=>{
  for(const mutate of [
    a=>{a.rows[0].sourceDealFingerprint='tampered';},
    a=>{a.rows[0].fullPhysicalDealFingerprint='tampered';},
    a=>{a.rows.pop();}
  ]){
    const a=fixture();mutate(a);assert.throws(()=>execute(a));
  }
});
test('receipt writer uses exclusive lock and atomic rename',()=>{
  const r=execute(fixture());
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-letter-'));
  const file=path.join(temp,'native.json');
  try{
    write(file,r);
    assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).competitiveGamesQualified,0);
    const fd=fs.openSync(file+'.lock','wx');
    try{assert.throws(()=>write(file,r));}
    finally{fs.closeSync(fd);fs.unlinkSync(file+'.lock');}
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
