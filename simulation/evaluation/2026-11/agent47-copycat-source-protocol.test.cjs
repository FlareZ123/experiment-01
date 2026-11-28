'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  EVENT_RECEIPT_VERSION,validatePublicEventReceipt,
  sourceCopycatEligible,expectedSourceCopycatChoices,
  eventAttackSignature
}=require('./agent49-policy-protocol.cjs');

const row=(attackName,sourcePrinting='Regidrago VSTAR SIT',extra={})=>({
  turn:3,sourcePrinting,attackName,gxAttack:false,
  copycatAttack:false,...extra
});
const apex=row('Apex Dragon','Regidrago VSTAR SIT',{copycatAttack:true});
const foul=row('Foul Play','Zoroark BREAK BKT',{copycatAttack:true});
const mimikyu=row('Copycat','Mimikyu GRI 58',{copycatAttack:true});
const gx=row('Pale Moon-GX','Trevenant & Dusknoir-GX SMP',{gxAttack:true});

function view(withCopycat=true){
  return {actorSeat:0,globalTurn:4,ownPublic:{
    active:withCopycat?{name:'Mimikyu',printing:'Mimikyu GRI 58',
      attacks:[{name:'Copycat'}]}:
      {name:'Mimikyu',printing:'Mimikyu GRI 58',attacks:[]},
    bench:[]
  }};
}
function receipt(attacks,choices,withCopycat=true){
  return {
    version:EVENT_RECEIPT_VERSION,
    actorSeat:0,turn:4,
    ownerActive:{printing:'Mimikyu GRI 58',
      movedFromBenchToActiveThisTurn:null,knownAbilityUse:[]},
    ownerBench:[],
    priorOpponentTurnKO:{any:null,byAttack:null},
    opponentLastTurnAttack:null,
    opponentLastTurnTurn:3,
    opponentLastTurnAttacks:attacks,
    opponentCopycatChoices:choices,
    mimikyuCopycatCompatible:withCopycat&&choices.length>0
  };
}
function admit(attacks,choices,withCopycat=true){
  return validatePublicEventReceipt(
    receipt(attacks,choices,withCopycat),view(withCopycat));
}
function deny(attacks,choices,pattern,withCopycat=true){
  assert.throws(()=>admit(attacks,choices,withCopycat),pattern);
}

test('source-approved non-GX Regidrago Apex accepts copycatAttack true',()=>{
  assert.equal(sourceCopycatEligible(apex),true);
  assert.deepEqual(expectedSourceCopycatChoices([apex]),[apex]);
  assert.doesNotThrow(()=>admit([apex],[apex]));
});
test('source-approved non-GX Zoroark Foul Play accepts copycatAttack true',()=>{
  assert.equal(sourceCopycatEligible(foul),true);
  assert.doesNotThrow(()=>admit([foul],[foul]));
});
test('Mimikyu own Copycat cannot be copied even with false GX',()=>{
  assert.equal(sourceCopycatEligible(mimikyu),false);
  assert.doesNotThrow(()=>admit([mimikyu],[]));
  deny([mimikyu],[mimikyu],/INELIGIBLE_COPYCAT_ATTACK/);
});
test('GX source is excluded from Mimikyu Copycat choices',()=>{
  assert.equal(sourceCopycatEligible(gx),false);
  assert.doesNotThrow(()=>admit([gx],[]));
  deny([gx],[gx],/INELIGIBLE_COPYCAT_ATTACK/);
});
test('false GX flag on printed -GX name is rejected even if not offered',()=>{
  const corrupted={...gx,gxAttack:false};
  deny([corrupted],[],/MISCLASSIFIED_PRINTED_GX_ATTACK/);
});
test('last non-GX attack wins even if older GX existed on same turn',()=>{
  assert.doesNotThrow(()=>admit([gx,apex],[apex]));
  deny([gx,apex],[],/COPYCAT_CHOICES_NOT_LATEST_ELIGIBLE_SOURCE/);
});
test('no previous attack means known-empty offered choices',()=>{
  assert.doesNotThrow(()=>admit([],[]));
});
test('non-Mimikyu active cannot be reported as Copycat-compatible',()=>{
  assert.doesNotThrow(()=>admit([apex],[apex],false));
  const r=receipt([apex],[apex],false);
  r.mimikyuCopycatCompatible=true;
  assert.throws(()=>validatePublicEventReceipt(r,view(false)),
    /BAD_COPYCAT_COMPATIBILITY/);
});
test('copy choice source identity must match a stamped history row',()=>{
  deny([apex],[{...apex,sourcePrinting:'Zoroark BREAK BKT'}],
    /COPYCAT_CHOICE_NOT_IN_HISTORY/);
});
test('misordered source choices are rejected, not re-sorted',()=>{
  const a=row('Burrow','Bunnelby PRC 121',
    {barragePairIndex:0,barragePairRole:'first'});
  const b=row('Rototiller','Bunnelby PRC 121',
    {barragePairIndex:0,barragePairRole:'second'});
  assert.deepEqual(expectedSourceCopycatChoices([a,b]),[a,b]);
  assert.doesNotThrow(()=>admit([a,b],[a,b]));
  deny([a,b],[b,a],/COPYCAT_CHOICES_NOT_LATEST_ELIGIBLE_SOURCE/);
});
test('single eligible Barrage choice is permitted if other attack was GX',()=>{
  const first=row('Burrow','Bunnelby PRC 121',
    {barragePairIndex:3,barragePairRole:'first'});
  const second=row('Tingly Return-GX','Bunnelby PRC 121',
    {gxAttack:true,barragePairIndex:3,barragePairRole:'second'});
  assert.deepEqual(expectedSourceCopycatChoices([first,second]),[first]);
  assert.doesNotThrow(()=>admit([first,second],[first]));
  deny([first,second],[first,second],/INELIGIBLE_COPYCAT_ATTACK/);
});
test('invalid Barrage role and source mismatch fail without partial choices',()=>{
  const a=row('Burrow','Bunnelby PRC 121',
    {barragePairIndex:1,barragePairRole:'first'});
  const sameRole=row('Rototiller','Bunnelby PRC 121',
    {barragePairIndex:1,barragePairRole:'first'});
  deny([a,sameRole],[],/BAD_COPYCAT_BARRAGE_PAIR/);
  const other=row('Rototiller','Regidrago VSTAR SIT',
    {barragePairIndex:1,barragePairRole:'second'});
  deny([a,other],[],/BAD_COPYCAT_BARRAGE_PAIR/);
});
test('earlier valid Barrage is superseded by a later normal attack',()=>{
  const a=row('Burrow','Bunnelby PRC 121',
    {barragePairIndex:0,barragePairRole:'first'});
  const b=row('Rototiller','Bunnelby PRC 121',
    {barragePairIndex:0,barragePairRole:'second'});
  assert.deepEqual(expectedSourceCopycatChoices([a,b,apex]),[apex]);
  assert.doesNotThrow(()=>admit([a,b,apex],[apex]));
  deny([a,b,apex],[a,b],/COPYCAT_CHOICES_NOT_LATEST_ELIGIBLE_SOURCE/);
});
test('last GX outranks earlier ordinary attack: no stale non-GX retrieval',()=>{
  assert.deepEqual(expectedSourceCopycatChoices([apex,gx]),[]);
  assert.doesNotThrow(()=>admit([apex,gx],[]));
  deny([apex,gx],[apex],/COPYCAT_CHOICES_NOT_LATEST_ELIGIBLE_SOURCE/);
});
test('two identical choices are forbidden, even if source holds same action',()=>{
  deny([apex],[apex,apex],/DUPLICATE_COPYCAT_CHOICE/);
});
test('null unknown Copycat choices remain unknown, not inferred',()=>{
  const x=receipt(null,[],true);
  x.opponentLastTurnTurn=null;
  x.opponentCopycatChoices=null;
  x.mimikyuCopycatCompatible=null;
  assert.doesNotThrow(()=>validatePublicEventReceipt(x,view()));
});
test('event signatures preserve barrage sequence and bool metadata',()=>{
  assert.notEqual(eventAttackSignature(apex),eventAttackSignature(foul));
});
