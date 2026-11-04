'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareConservativeSourceSupporters,VERSION}=
  require('../simulation/evaluation/agent20-issue25-v16-bilateral-conservative-supporter.cjs');
const schema='agent20-issue25-v14-verified-native-owner-prize-zone-counts';

function make(changed=false){
  const ids=['6:100:A:champion-reference',
    '6:100:A:new-moon-lockbreaker-v1',
    '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1',
    '11:102:A:champion-reference','11:102:A:new-moon-lockbreaker-v1',
    '11:103:B:champion-reference','11:103:B:new-moon-lockbreaker-v1'];
  const dispositions=ids.map(id=>({
    id,originalSourceSeat:id.includes(':B:')?0:1,
    sourceDealFingerprint:id+'-source',fullPhysicalDealFingerprint:id+'-full',
    status:'returned-unqualified'
  }));
  const raws=ids.map((id,i)=>({
    trial:{id},
    rootActionLedger:[
      {actionOrdinal:0,playerSlot:0,action:'WaitPrompt'},
      {actionOrdinal:1,playerSlot:1,action:i===4&&changed?'PlayCardAction':'PassTurnAction',
        card:i===4&&changed?'Iono':null}
    ]
  }));
  return {out:{schema,allEightAttemptDispositions:dispositions,
      samePhysicalSourceDeals:8},raws};
}
test('pair first native source Pass to actual changed new Supporter action',()=>{
  const a=make(),b=make(true);
  const result=compareConservativeSourceSupporters(
    a.out,b.out,a.raws,b.raws);
  assert.equal(result.schema,VERSION);
  assert.equal(result.sourceAndCompletePhysicalDealsMatched,true);
  assert.equal(result.changedNativeRootsInRows,1);
  const target=result.rows.find(r=>r.id==='11:102:A:champion-reference');
  assert.equal(target.firstDivergenceActedByOriginalSource,true);
  assert.equal(target.initialCommonRootCount,1);
  assert.equal(target.firstBaselineNativeRoot.action,'PassTurnAction');
  assert.equal(target.firstTreatmentNativeRoot.card,'Iono');
  assert.equal(result.qualifiedGames,0);
});
test('all unchanged Action objects remain same ledger',()=>{
  const a=make(),b=make();
  const result=compareConservativeSourceSupporters(
    a.out,b.out,a.raws,b.raws);
  assert.equal(result.changedNativeRootsInRows,0);
  assert.equal(result.rows.every(x=>x.sameWholeNativeLedger),true);
});
