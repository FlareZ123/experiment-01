'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {paperOwnerLetterGate,run,write,VERSION}=
  require('../simulation/evaluation/agent49-rank11-first-letter-pass11.cjs');

const registration=require('../results/aichi-2026/registrations/agent49-rank11-first-letter-pass11-20261105.json');
const pokemon={evolutionPrintings:[],energies:[],tools:[]};
const owner=()=>({actorSeat:1,globalTurn:2,decisionKind:'owner-root',
  ownHand:['Professors Letter BKT','Guzma BUS'],
  ownTurnResources:{itemPlayLocked:false},
  ownPublic:{active:{...pokemon},bench:[{...pokemon},null],
    prizeCount:6,deckCount:44,discard:[],lostZone:[],
    resolvingSupporter:[],stadium:[],
    publicTurnRestrictions:{itemPlayLocked:false}}});
const item=()=>({registrationId:registration.selectedOriginalId,
  observedPinnedTwinleaf:registration.twinleafPin,
  attemptedNativeOriginalRows:8,sourceOwnerPass37Reached:true,
  sourceOwnerPreDecisionSnapshot:owner(),
  originalPreForkSourceRootTapeMatched:true,
  sourceDealMatched:true,entirePhysicalDealMatched:true,
  nativeRootAtSelectedOrdinal:{actionOrdinal:11,
    playerSlot:1,turnBefore:2,action:'PlayCardAction',card:"Professor's Letter"},
  sourceOwnerCardAcceptedByNativeStore:true,
  sourceFollowthroughPrompts:[],sameTurnRealOwnerDarknessEnergyPlayRoots:[],
  originalSourceRowDisposition:'engine-error',originalSourceAcceptedRoots:12,
  sourceDecoderFailure:{failureStage:'bot-decoder'},
  allNativeArmDispositions:Array.from({length:8},(_,i)=>({
    id:i===0?registration.selectedOriginalId:'other-'+i,
    status:i===0?'engine-error':null,acceptedRoots:i===0?12:48
  }))});
test('K0 first source Letter has guaranteed two Basic Darkness targets',()=>{
  const gate=paperOwnerLetterGate(owner());
  assert.equal(gate.guaranteedDarknessInDeck,2);
  assert.equal(gate.twoBasicDarknessTargetsGuaranteed,true);
  assert.equal(gate.paperItemUnlocked,true);
  const a=owner();a.ownPublic.discard.push('Darkness Energy MEE');
  assert.equal(paperOwnerLetterGate(a).twoBasicDarknessTargetsGuaranteed,false);
  const b=owner();b.ownTurnResources.itemPlayLocked=true;
  assert.equal(paperOwnerLetterGate(b).paperItemUnlocked,false);
  const c=owner();c.actorSeat=0;
  assert.throws(()=>paperOwnerLetterGate(c));
});
test('native source action is developmental and eight-arm-censored',()=>{
  const data=run({run:()=>item()});
  assert.equal(data.schema,VERSION);
  assert.equal(data.genuineNativeSourceLetterRootAccepted,true);
  assert.equal(data.ownerGate.twoBasicDarknessTargetsGuaranteed,true);
  assert.equal(data.sourceDisposition,'engine-error');
  assert.equal(data.allEightNativeStatuses.length,8);
  assert.equal(data.qualifiedCompetitiveGames,0);
  const bad=item();bad.originalPreForkSourceRootTapeMatched=false;
  assert.throws(()=>run({run:()=>bad}));
});
test('native receipts have exclusively locked atomic writes',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a49-letter-'));
  const output=path.join(dir,'receipt.json');
  try{
    const data=run({run:()=>item()});
    const receipt=write(output,data);
    assert.ok(receipt.bytes>0);
    assert.equal(JSON.parse(fs.readFileSync(output,'utf8')).qualifiedCompetitiveGames,0);
    const fd=fs.openSync(output+'.lock','wx');
    try{assert.throws(()=>write(output,data));}
    finally{fs.closeSync(fd);fs.unlinkSync(output+'.lock');}
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
