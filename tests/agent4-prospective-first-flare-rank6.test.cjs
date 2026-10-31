'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registeredFrame,groupRegisteredTrials,sourcePlumeriaTurnReceipt,contrast}=
  require('../scripts/agent4-prospective-first-flare-rank6.cjs');

test('31 October prospectively frozen eight real source seeds and paired lists',()=>{
  const {frame,trials}=registeredFrame();
  assert.equal(frame.scheduledOriginalGameArms,16);
  assert.equal(frame.scheduledCausalArms,32);
  assert.equal(trials.length,16);
  assert.equal(groupRegisteredTrials(trials).length,8);
  const seeds=new Set(trials.map(x=>x.seed));
  assert.equal(seeds.size,8);
  assert.deepEqual(new Set(trials.map(x=>x.rank)),new Set([6]));
  for(const seed of seeds){
    const paired=trials.filter(x=>x.seed===seed);
    assert.equal(paired.length,2);
    assert.equal(paired[0].candidateSlot,paired[1].candidateSlot);
    assert.deepEqual(new Set(paired.map(x=>x.candidateId)),
      new Set(['champion-reference','new-moon-lockbreaker-v1']));
  }
  assert.equal(frame.minimumOpponentActiveEnergy??2,2);
  assert.equal(frame.expectedQualification.competitiveQualifiedGames,0);
});

function row(ledger,sourceDeal='source-1'){
  return {
    sourceDeckFingerprint:'source-printed-60',
    candidateDeckFingerprint:'candidate-printed-60',
    fullPhysicalDealFingerprint:'full-physical-deal',
    sourceDealFingerprint:sourceDeal,
    actualStarterSeat:1,verifiedFirstTurn:true,
    sourceSeat:1,candidateSeat:0,
    rootActionLedger:ledger,
    rootActionLedgerSha256:'hash',
    finished:false
  };
}
function action(turn,slot,name,card){
  return {turnBefore:turn,turnAfter:turn,playerSlot:slot,
    action:name,card:card??undefined};
}
function makePair({change=true,accepted=true,sourceDeal='source-1'}={}){
  const prefix=[action(1,0,'PassTurnAction')];
  const a=[...prefix,action(15,1,'PlayCardAction','Plumeria'),
    action(15,1,'PassTurnAction'),action(16,0,'AttackAction')];
  const b=change?[...prefix,action(15,1,'PlayCardAction','Team Flare Grunt'),
    action(15,1,'PassTurnAction'),action(16,0,'AttackAction')]:a;
  const control={id:'6:0:A:champion-reference',sourceSeat:1,row:row(a),
    driverError:null};
  const treatment={id:control.id,sourceSeat:1,row:row(b,sourceDeal),
    forkAudit:{selectedFlareForks:Number(change),
      acceptedFlareForks:Number(change&&accepted),
      settledFlareEnergyRemovals:Number(change&&accepted),
      sameRootNativeContests:Number(change)},driverError:null};
  return {control,treatment};
}

test('native accepted original Plumeria -> first Flare action is a causal divergence',()=>{
  const {control,treatment}=makePair();
  const c=contrast(control,treatment);
  assert.equal(c.samePhysicalStart,true);
  assert.equal(c.firstDifferenceIndex,1);
  assert.equal(c.firstOriginal.card,'Plumeria');
  assert.equal(c.firstAlternate.card,'Team Flare Grunt');
  assert.equal(c.firstCausalContrast,true);
  assert.equal(c.nativeQualified,false);
});

test('no native opportunity preserves identical original full accepted ledger',()=>{
  const {control,treatment}=makePair({change:false});
  const c=contrast(control,treatment);
  assert.equal(c.firstDifferenceIndex,-1);
  assert.equal(c.firstCausalContrast,true);
});

test('unsettled alternate is not a causal accepted effect',()=>{
  const {control,treatment}=makePair({accepted:false});
  const c=contrast(control,treatment);
  assert.equal(c.firstCausalContrast,false);
});

test('changed initial source physical deal rejects seemingly matching chosen Supporter',()=>{
  const {control,treatment}=makePair({sourceDeal:'different-deal'});
  const c=contrast(control,treatment);
  assert.equal(c.samePhysicalStart,false);
  assert.equal(c.firstCausalContrast,false);
});


test('original Store physical payment plus Energy settlement certifies second denial',()=>{
  const native={physicallyAcceptedOwnerPayments:[{seat:0,turn:6,
    acceptedByOriginalStore:true,payment:[
      {handIndex:2,printing:'Crushing Hammer POR'},
      {handIndex:5,printing:'Lusamine CIN'}]}],
    log:[{kind:'plumeria-energy-settlement',seat:0,turn:6,
      accepted:true,printing:'Psychic Energy MEE',
      sourceHandDiscardCount:2}]};
  const wrapped={actorOnlyDecisionCoverage:{detailedComponentAudits:{
    ownerPlumeriaAfterPass:native}}};
  const good=sourcePlumeriaTurnReceipt(wrapped,0,6);
  assert.equal(good.fullySettled,true);
  assert.equal(good.payment.payment.length,2);
  assert.equal(sourcePlumeriaTurnReceipt(wrapped,1,6).fullySettled,false);
  assert.equal(sourcePlumeriaTurnReceipt(wrapped,0,7).fullySettled,false);
  const bad={actorOnlyDecisionCoverage:{detailedComponentAudits:{
    ownerPlumeriaAfterPass:{...native,log:[]}}}};
  assert.equal(sourcePlumeriaTurnReceipt(bad,0,6).fullySettled,false);
});

test('later printed Plumeria action alone cannot establish physical second denial',()=>{
  const pair=makePair();
  const r=contrast(pair.control,pair.treatment);
  assert.equal(r.secondOpposingEnergyDenialConfirmed,false);
});
