'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {attestBilateralRootClaims:rawAttest}=
  require('../simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs');

// Existing synthetic fixtures enumerate pre-action turns only. Construct
// the normal contiguous Store after-action turn for each synthetic root.
// Adversarial epoch-boundary tests below call rawAttest on unmodified data.
function attest(row,ledger,seat){
  const native=ledger.map((root,i)=>({
    ...root,turnAfter:ledger[i+1]?.turnBefore??root.turnBefore
  }));
  return rawAttest(row,native,seat);
}

/** Source seat 0 plays turn 1; candidate seat 1 responds on turn 2. */
function fixture(){
  const ledger=[
    {actionOrdinal:0,turnBefore:1,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,turnBefore:1,playerSlot:0,action:'ResolvePromptAction'},
    {actionOrdinal:2,turnBefore:2,playerSlot:1,action:'PlayCardAction'},
    {actionOrdinal:3,turnBefore:2,playerSlot:1,action:'AttackAction',
      attack:'Timeless-GX'},
    {actionOrdinal:4,turnBefore:3,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:5,turnBefore:3,playerSlot:0,action:'PassTurnAction'}
  ];
  const row={
    rootActionCount:ledger.length,actualStarterSeat:0,
    sourcePressure:{rootActionOrdinal:0,turnBefore:1,
      completionOrdinal:1,completionTurnBefore:1,
      accepted:true,effectVerified:true,traceAuthenticated:true},
    candidateReply:{rootActionOrdinal:2,turnBefore:2,
      observed:true,legal:true,traceAuthenticated:true},
    sourceContinuation:{rootActionOrdinal:4,turnBefore:3,
      observed:true,legal:true,traceAuthenticated:true}
  };
  return {ledger,row};
}

test('actual ordered Store root chain authenticates only its action claims',()=>{
  const {ledger,row}=fixture(),r=attest(row,ledger,1);
  assert.equal(r.checkedRoots,6);
  assert.equal(r.rootClaimsAuthenticated,true);
  assert.equal(r.sourceFirstTurnPressureAuthenticated,true);
  assert.equal(r.effectAndPaperFidelityAuthenticated,false);
  assert.equal(r.hiddenPolicyInformationSetAuthenticated,false);
  assert.ok(Object.isFrozen(r));
});

test('printed positive booleans cannot hide a wrong physical actor',()=>{
  const {ledger,row}=fixture();
  row.candidateReply.rootActionOrdinal=1;
  const r=attest(row,ledger,1);
  assert.equal(r.candidateReply,false);
  assert.equal(r.rootClaimsAuthenticated,false);
  assert.equal(r.sourceFirstTurnPressureAuthenticated,false);
});

test('unowned source prompt closure is authenticated by native initiating root',()=>{
  const {ledger,row}=fixture();
  // Real headless ShuffleDeckPrompt can resolve with physical actor -1.
  ledger[1].playerSlot=-1;
  ledger[1].initiatingRootActionOrdinal=0;
  let r=attest(row,ledger,1);
  assert.equal(r.pressureCompletion,true);
  assert.equal(r.rootClaimsAuthenticated,true);
  ledger[1].initiatingRootActionOrdinal=null;
  r=attest(row,ledger,1);
  assert.equal(r.pressureCompletion,false);
  assert.equal(r.rootClaimsAuthenticated,false);
});

test('defender prompt closure must descend from source-owned initiator',()=>{
  const {ledger,row}=fixture();
  ledger[1].playerSlot=1;
  ledger[1].initiatingRootActionOrdinal=0;
  let r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,true);
  ledger[0].playerSlot=1;
  r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,false);
  // An unrelated candidate-owned root cannot launder the closure.
  ledger[0].playerSlot=0;
  ledger[1].initiatingRootActionOrdinal=2;
  r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,false);
});

test('wrong turn and wrong source continuation fail without inventing an attack',()=>{
  const {ledger,row}=fixture();
  row.sourcePressure.completionTurnBefore=2;
  let r=attest(row,ledger,1);
  assert.equal(r.pressureCompletion,false);
  assert.equal(r.rootClaimsAuthenticated,false);
  row.sourcePressure.completionTurnBefore=1;
  row.sourceContinuation.rootActionOrdinal=3;
  r=attest(row,ledger,1);
  assert.equal(r.sourceContinuation,false);
  assert.equal(r.rootClaimsAuthenticated,false);
});

test('ledger must be contiguous and include every successful root',()=>{
  const {ledger,row}=fixture();
  assert.throws(()=>attest(row,ledger.slice(0,-1),1),
    /every successful Store root/);
  ledger[3].actionOrdinal=5;
  assert.throws(()=>attest(row,ledger,1),
    /consecutive root ordinal/);
});

test('forged native root transcript with reversed or skipped game turns rejects',()=>{
  const {ledger,row}=fixture();
  ledger[5].turnBefore=2;
  assert.throws(()=>attest(row,ledger,1),
    /replay reset needs epoch attestation/);
  ledger[5].turnBefore=5;
  ledger[4].turnBefore=5;
  assert.throws(()=>attest(row,ledger,1),
    /cannot skip or reverse global turns/);
});

test('an extra candidate turn needs its own native grant and next-turn roots',()=>{
  const {ledger,row}=fixture();
  ledger.splice(4,0,
    {actionOrdinal:4,turnBefore:3,playerSlot:1,action:'PassTurnAction'});
  ledger[5].actionOrdinal=5;
  ledger[5].turnBefore=4;
  ledger[6].actionOrdinal=6;
  ledger[6].turnBefore=4;
  row.rootActionCount=7;
  row.sourceContinuation.rootActionOrdinal=5;
  row.sourceContinuation.turnBefore=4;
  let r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,false);
  row.candidateBonusTurn={
    grantRootActionOrdinal:3,grantTurnBefore:2,
    completionOrdinal:3,completionTurnBefore:2,
    nextOwnRootActionOrdinal:4,nextOwnTurnBefore:3
  };
  r=attest(row,ledger,1);
  assert.equal(r.bonusTurnRootChain,true);
  assert.equal(r.rootClaimsAuthenticated,true);
  // Owner/turn order alone cannot authenticate an extra-turn attack grant.
  for(const nonAttack of ['PlayCardAction','PassTurnAction',
    'ResolvePromptAction']){
    ledger[3].action=nonAttack;
    const forged=attest(row,ledger,1);
    assert.equal(forged.bonusTurnRootChain,false,nonAttack);
    assert.equal(forged.rootClaimsAuthenticated,false,nonAttack);
  }
  ledger[3].action='AttackAction';
  ledger[3].attack='Claw of Darkness';
  assert.equal(attest(row,ledger,1).bonusTurnRootChain,false,
    'A genuine ordinary attack cannot authenticate a Timeless-GX turn');
  ledger[3].attack='Timeless-GX';
  row.candidateBonusTurn.grantRootActionOrdinal=2;
  row.candidateBonusTurn.completionOrdinal=2;
  assert.equal(attest(row,ledger,1).rootClaimsAuthenticated,false,
    'A candidate Trainer root cannot be relabeled as Timeless-GX');
  row.candidateBonusTurn.grantRootActionOrdinal=3;
  row.candidateBonusTurn.completionOrdinal=3;
  ledger[4].playerSlot=0;
  assert.equal(attest(row,ledger,1).bonusTurnRootChain,false);
});

test('bonus attack completion allows a rooted unowned prompt, not unrelated roots',()=>{
  const {ledger,row}=fixture();
  ledger.splice(4,0,
    {actionOrdinal:4,turnBefore:2,playerSlot:-1,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:3},
    {actionOrdinal:5,turnBefore:3,playerSlot:1,action:'PassTurnAction'});
  ledger[6].actionOrdinal=6;
  ledger[6].turnBefore=4;
  ledger[7].actionOrdinal=7;
  ledger[7].turnBefore=4;
  row.rootActionCount=8;
  row.sourceContinuation.rootActionOrdinal=6;
  row.sourceContinuation.turnBefore=4;
  row.candidateBonusTurn={
    grantRootActionOrdinal:3,grantTurnBefore:2,
    completionOrdinal:4,completionTurnBefore:2,
    nextOwnRootActionOrdinal:5,nextOwnTurnBefore:3
  };
  assert.equal(attest(row,ledger,1).rootClaimsAuthenticated,true);
  // Delegated or unowned prompt closure is accepted only with native origin.
  ledger[4].initiatingRootActionOrdinal=2;
  assert.equal(attest(row,ledger,1).rootClaimsAuthenticated,false);
  ledger[4].initiatingRootActionOrdinal=3;
  ledger[4].action='PlayCardAction';
  assert.equal(attest(row,ledger,1).rootClaimsAuthenticated,false);
  ledger[4].action='ResolvePromptAction';
  ledger[4].playerSlot=0;
  assert.equal(attest(row,ledger,1).rootClaimsAuthenticated,true,
    'Defender-owned prompt can close a genuinely initiated attack');
});

test('source-first designation follows real start and source seat',()=>{
  const {ledger,row}=fixture();
  row.actualStarterSeat=1;
  const r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,true);
  assert.equal(r.sourceFirstTurnPressureAuthenticated,false);
});

test('supplying a raw trace never certifies lock effects or paper rules',()=>{
  const {ledger,row}=fixture();
  row.paperRuleAuditPassed=true;
  row.sourcePressure.effectVerified=true;
  row.fullPolicyInformationSetAuditPassed=true;
  const r=attest(row,ledger,1);
  assert.equal(r.rootClaimsAuthenticated,true);
  assert.equal(r.effectAndPaperFidelityAuthenticated,false);
  assert.equal(r.hiddenPolicyInformationSetAuthenticated,false);
});

test('native before-after continuity refuses forged and replay-spliced roots',()=>{
  const {ledger,row}=fixture();
  const native=ledger.map((root,i)=>({
    ...root,turnAfter:ledger[i+1]?.turnBefore??root.turnBefore
  }));
  assert.equal(rawAttest(row,native,1).rootClaimsAuthenticated,true);

  const missing=structuredClone(native);
  delete missing[1].turnAfter;
  assert.throws(()=>rawAttest(row,missing,1),
    /Native Store turnAfter required/);

  const replay=structuredClone(native);
  replay[1].turnAfter=0;
  assert.throws(()=>rawAttest(row,replay,1),
    /replay reset needs epoch attestation/);

  const splice=structuredClone(native);
  splice[1].turnAfter=3;
  assert.throws(()=>rawAttest(row,splice,1),
    /before\/after turn continuity/);
});
