'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicPaidPivot,join}=
  require('../simulation/evaluation/agent42-general-paid-retreat-root-audit.cjs');
const SRC='Shadow Rider Calyrex VMAX CRE';
const TGT='Latias ex SSP',P='Psychic Energy MEE';
const zone=(pokemon,energy)=>({
  pokemon,energies:Array(energy).fill(P),tools:[]
});
function setup(seat=1,target=TGT){
  const event={
    rootActionOrdinal:131,action:'RetreatAction',storeAccepted:true,
    playerSlot:seat,declared:{benchIndex:1},
    publicBoardChanges:[
      {seat,position:'active',index:0,
        before:zone(SRC,2),after:zone(target,3)},
      {seat,position:'bench',index:1,
        before:zone(target,3),after:zone(SRC,0)}
    ]
  };
  const row={
    trial:{id:'1:600:A:new-moon-lockbreaker-v1'},
    rootActionLedger:[{actionOrdinal:131,playerSlot:seat,
      action:'RetreatAction',turnBefore:22}],
    nativeAcceptedTargetSidecar:{events:[event]},
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:132,turnBefore:22,attackName:'Eon Blade',
      settledPromptChain:true,settlementCrossesClockReset:false,
      prizesBefore:[6,1],prizesAfter:[6,0]
    }]},
    finished:true,winner:seat,finalPrizes:seat===1?[6,0]:[0,6]
  };
  if(seat===0){
    row.sourceAttackSettlement.attacks[0].prizesBefore=[1,6];
    row.sourceAttackSettlement.attacks[0].prizesAfter=[0,6];
  }
  return {event,row};
}
for(const seat of [0,1]){
  test('real paid VMAX to Latias with settled final attack, seat '+seat,()=>{
    const {event,row}=setup(seat);
    assert.equal(publicPaidPivot(event,seat).targetPrinting,TGT);
    const r=join(row,seat);
    assert.equal(r.nativePublicPaidPivotCount,1);
    assert.equal(r.pivotWithSettledAttackCount,1);
    assert.equal(r.pivotWithPrizeCount,1);
    assert.equal(r.pivotWithNativeTerminalSourceWin,1);
    assert.equal(r.evidence[0].nextSettledSourceAttackName,'Eon Blade');
    assert.equal(r.evidence[0].sourcePrizesAfter,0);
    assert.equal(r.independentPrivatePhysicalObjectPaymentConfirmed,false);
    assert.equal(r.paperQualifiedGames,0);
  });
}
test('VMAX to VMAX prior original source root remains admitted',()=>{
  const {event,row}=setup(1,SRC);
  row.sourceAttackSettlement.attacks[0].attackName='Max Geist';
  assert.equal(publicPaidPivot(event,1).targetPrinting,SRC);
  assert.equal(join(row,1).nativePublicPaidPivotCount,1);
});
test('speculative accepted sidecar without real root gives zero',()=>{
  const {row}=setup();
  row.rootActionLedger=[];
  assert.equal(join(row,1).nativePublicPaidPivotCount,0);
});
test('unpayable one-Energy, free Tool and failure to promote veto',()=>{
  const a=setup();
  a.event.publicBoardChanges[0].before.energies=[P];
  assert.equal(join(a.row,1).nativePublicPaidPivotCount,0);
  const b=setup();
  b.event.publicBoardChanges[0].before.tools=['Float Stone BKT'];
  assert.equal(join(b.row,1).nativePublicPaidPivotCount,0);
  const c=setup();
  c.event.publicBoardChanges[0].after.pokemon=SRC;
  assert.equal(join(c.row,1).nativePublicPaidPivotCount,0);
  const d=setup();
  d.event.publicBoardChanges[1].after.energies=[P];
  assert.equal(join(d.row,1).nativePublicPaidPivotCount,0);
});
test('no settled attack gives no fabricated Prize or terminal attack evidence',()=>{
  const {row}=setup();
  row.sourceAttackSettlement.attacks[0].settledPromptChain=false;
  const r=join(row,1);
  assert.equal(r.nativePublicPaidPivotCount,1);
  assert.equal(r.pivotWithSettledAttackCount,0);
  assert.equal(r.pivotWithPrizeCount,0);
});
test('duplicated sidecar cannot provide unique real root proof',()=>{
  const {event,row}=setup();
  row.nativeAcceptedTargetSidecar.events=[event,event];
  assert.equal(join(row,1).nativePublicPaidPivotCount,0);
});
