'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {shadowMistPassStratum,rank6SpecialEnergyGate}=
  require('../simulation/evaluation/agent49-issue25-shadow-mist-pass.cjs');
const ids=['6:100:A:champion-reference','6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference','11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference','11:103:B:new-moon-lockbreaker-v1'];
const roster={decks:[{rank:6,cards:[
  ['Speed Lightning Energy','RCL',4],['Capture Energy','RCL',2],
  ['Spiky Energy','JTG',1],['Double Colorless Energy','SUM',1]
].map(([name,set,count])=>({
  name,category:'Energy',count,printing:{set}
}))}]};
function archive(){
  const attempts=ids.map((id,i)=>{
    const seat=id.split(':')[2]==='A'?1:0;
    const publicRootActions=i===0?[
      {actionOrdinal:0,turnBefore:2,playerSlot:1-seat,
        action:'AttackAction',attack:'Shadow Mist'},
      {actionOrdinal:1,turnBefore:3,playerSlot:seat,action:'PassTurnAction'},
      {actionOrdinal:2,turnBefore:4,playerSlot:1-seat,
        action:'AttackAction',attack:'Shadow Mist'},
      {actionOrdinal:3,turnBefore:5,playerSlot:seat,action:'PassTurnAction'}
    ]:i===4?[
      {actionOrdinal:0,turnBefore:2,playerSlot:1-seat,
        action:'AttackAction',attack:'Shadow Mist'},
      {actionOrdinal:1,turnBefore:3,playerSlot:seat,action:'PassTurnAction'}
    ]:[];
    return {id,actualRawTrialId:id,
      originalSourceSeat:i===5?null:seat,
      publicRootActions,publicRootActionCount:publicRootActions.length,
      nativeRootActionCount:publicRootActions.length,
      publicRootActionsTruncated:false,publicRootLedgerDigestConsistent:true};
  });
  return {schema:'agent1-issue25-joined-v4-public-execution-receipt-v1',
    registration:{expectedIds:ids,exactJoinedByTrialId:true},attempts};
}
test('all source rank6 Energy copies are print-verified Special',()=>{
  assert.equal(rank6SpecialEnergyGate(roster),true);
  const altered=structuredClone(roster);
  altered.decks[0].cards[0].count=3;
  assert.throws(()=>rank6SpecialEnergyGate(altered));
});
test('only original rank6 following-Shadow-Mist passes are exposed',()=>{
  const r=shadowMistPassStratum(archive(),roster);
  assert.equal(r.originalSourcePassCount,3);
  assert.equal(r.conditionalAllEnergyHandLockWindows.length,2);
  assert.deepEqual(r.conditionalAllEnergyHandLockWindows.map(x=>x.passTurn),[3,5]);
  assert.equal(r.competitiveGamesQualified,0);
  assert.equal(r.ownerOpportunityDenominatorCertified,false);
});
test('incomplete ledger fails closed',()=>{
  const r=archive();r.attempts[0].publicRootActionsTruncated=true;
  assert.throws(()=>shadowMistPassStratum(r,roster));
});
