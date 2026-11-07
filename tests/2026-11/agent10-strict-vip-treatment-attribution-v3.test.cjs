'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,VIP_NAME,VIP_PRINTING,ROOT_ORDINAL_PROTOCOL,
  strictVipTreatmentAttribution
}=require('../../simulation/evaluation/agent10-strict-vip-treatment-attribution-v3.cjs');

function root(actionOrdinal,action,playerSlot=0,turnBefore=1,extra={}){
  return {
    actionOrdinal,turnBefore,turnAfter:turnBefore,playerSlot,action,
    pendingPrompt:null,
    initiatingRootActionOrdinal:action==='ResolvePromptAction'?
      null:actionOrdinal,
    ...extra
  };
}
function itemEvent(itemRootOrdinal,seat=0,turn=1,extra={}){
  return {
    kind:'vip-item',seat,turn,printing:VIP_PRINTING,
    accepted:true,itemRootOrdinal,...extra
  };
}
function searchEvent(itemRootOrdinal,searchRootOrdinal,seat=0,turn=1,extra={}){
  return {
    kind:'vip-search',seat,turn,itemRootOrdinal,searchRootOrdinal,
    printings:['Pikachu FST'],accepted:true,nativeBenchConfirmed:true,
    benchBefore:0,benchAfter:1,deckBefore:10,deckAfter:9,...extra
  };
}
function audit(examples,extra={}){
  return {
    policyRecorded:true,nativeStoreSeen:true,
    rootOrdinalProtocol:ROOT_ORDINAL_PROTOCOL,
    rootOrdinalInitialized:true,
    dispatchRootCount:2,unresolvedOwnerSearches:0,
    acceptedItems:1,rejectedItems:0,
    acceptedSearches:1,rejectedSearches:0,
    examples,...extra
  };
}
function fixture(){
  const control=[root(0,'PassTurnAction')];
  const treatment=[
    root(0,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(1,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
    })
  ];
  return {
    controlLedger:control,controlRootActionCount:1,controlCompleted:true,
    treatmentLedger:treatment,treatmentRootActionCount:2,treatmentCompleted:true,
    vipAudit:audit([itemEvent(0),searchEvent(0,1)])
  };
}
function run(f){
  return strictVipTreatmentAttribution(f);
}

test('version identifies explicit root-ordinal treatment attribution',()=>{
  assert.equal(VERSION,'agent10-strict-vip-treatment-attribution-v3-explicit-root-ordinals');
});

test('exact Pass to VIP root and its ordinal-linked physical search are attributed',()=>{
  const result=run(fixture());
  assert.equal(result.attributed,true);
  assert.equal(result.divergenceIndex,0);
  assert.equal(result.seat,0);
  assert.equal(result.turn,1);
  assert.deepEqual(result.physicalSearch,{
    itemEventIndex:0,searchEventIndex:1,itemRootOrdinal:0,
    searchRootOrdinal:1,seat:0,turn:1,selectedBasicCount:1,
    benchIncrease:1,deckDecrease:1
  });
});

test('unlogged natural VIP roots before and after the intervention do not invalidate exact attribution',()=>{
  const naturalSeat1=[
    root(0,'PlayCardAction',1,1,{card:VIP_NAME}),
    root(1,'ResolvePromptAction',1,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
    })
  ];
  const control=[
    ...naturalSeat1,
    root(2,'PassTurnAction',0,1)
  ];
  const treatment=[
    ...naturalSeat1,
    root(2,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(3,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:2
    }),
    root(4,'PlayCardAction',1,2,{card:VIP_NAME}),
    root(5,'ResolvePromptAction',1,2,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootAction:4
    })
  ];
  const f={
    controlLedger:control,controlRootActionCount:3,
    treatmentLedger:treatment,treatmentRootActionCount:6,
    vipAudit:audit([itemEvent(2,0,1),searchEvent(2,3,0,1)],{
      dispatchRootCount:6
    })
  };
  assert.equal(run(f).attributed,true);
});

test('a natural first-divergent VIP root without an intervention event is not attributed',()=>{
  const f=fixture();
  f.vipAudit.examples=[];
  f.vipAudit.acceptedItems=0;
  f.vipAudit.acceptedSearches=0;
  assert.equal(run(f).attributed,false);
});

test('both independent headless root counts are mandatory',()=>{
  const f=fixture();
  f.controlRootActionCount=null;
  assert.equal(run(f).reason,'independent-root-count-or-ledger-mismatch');
  const g=fixture();
  g.treatmentRootActionCount=null;
  assert.equal(run(g).reason,'independent-root-count-or-ledger-mismatch');
});

test('independent count must equal each selected root ledger length',()=>{
  const f=fixture();
  f.treatmentRootActionCount=3;
  assert.equal(run(f).reason,'independent-root-count-or-ledger-mismatch');
});

test('hook dispatch counter must match the independent treatment count',()=>{
  const f=fixture();
  f.vipAudit.dispatchRootCount=1;
  assert.equal(run(f).reason,'vip-hook-root-ordinal-counter-mismatch');
});

test('missing or uninitialized hook ordinal protocol fails closed',()=>{
  const f=fixture();
  f.vipAudit.rootOrdinalInitialized=false;
  assert.equal(run(f).reason,'vip-hook-root-ordinal-counter-mismatch');
  const g=fixture();
  g.vipAudit.rootOrdinalProtocol='unknown';
  assert.equal(run(g).reason,'vip-hook-root-ordinal-counter-mismatch');
});

test('item event must point to the exact first divergent root',()=>{
  const f=fixture();
  f.vipAudit.examples[0].itemRootOrdinal=1;
  f.vipAudit.dispatchRootCount=2;
  assert.equal(run(f).attributed,false);
});

test('search event must point to the exact item root and exact prompt root',()=>{
  const f=fixture();
  f.vipAudit.examples[1].searchRootOrdinal=0;
  assert.equal(run(f).attributed,false);
  const g=fixture();
  g.vipAudit.examples[1].itemRootOrdinal=1;
  assert.equal(run(g).attributed,false);
});

test('prompt lineage must identify the exact VIP item root',()=>{
  const f=fixture();
  f.treatmentLedger[1].initiatingRootActionOrdinal=1;
  assert.equal(run(f).attributed,false);
});

test('search root must be a ChooseCardsPrompt resolution',()=>{
  const f=fixture();
  f.treatmentLedger[1].pendingPrompt='ConfirmPrompt';
  assert.equal(run(f).attributed,false);
});

test('the item event must precede its search event',()=>{
  const f=fixture();
  f.vipAudit.examples.reverse();
  assert.equal(run(f).attributed,false);
});

test('wrong exact physical VIP printing fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples[0].printing='Battle VIP Pass BCR';
  assert.equal(run(f).attributed,false);
});

test('wrong event owner or turn fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples[0].seat=1;
  assert.equal(run(f).attributed,false);
  const g=fixture();
  g.vipAudit.examples[1].turn=2;
  assert.equal(run(g).attributed,false);
});

test('physical Bench and deck settlement must be exact',()=>{
  const f=fixture();
  f.vipAudit.examples[1].nativeBenchConfirmed=false;
  assert.equal(run(f).attributed,false);
  const g=fixture();
  g.vipAudit.examples[1].deckAfter=10;
  assert.equal(run(g).attributed,false);
  const h=fixture();
  h.vipAudit.examples[1].benchAfter=2;
  assert.equal(run(h).attributed,false);
});

test('a target VIP event without a completed search fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples=[itemEvent(0)];
  f.vipAudit.acceptedSearches=0;
  assert.equal(run(f).attributed,false);
});

test('duplicate item or search event identities fail closed',()=>{
  const f=fixture();
  f.vipAudit.examples.push(itemEvent(0));
  f.vipAudit.acceptedItems=2;
  assert.equal(run(f).reason,'vip-item-search-pair-incomplete');
  const g=fixture();
  g.vipAudit.examples.push(searchEvent(0,1));
  g.vipAudit.acceptedSearches=2;
  assert.equal(run(g).reason,'vip-item-search-pair-incomplete');
});


test('capped or aborted control/treatment matches cannot be attributed',()=>{
  const f=fixture();
  f.controlCompleted=false;
  assert.equal(run(f).reason,'incomplete-or-aborted-match');
  const g=fixture();
  g.treatmentCompleted=false;
  assert.equal(run(g).reason,'incomplete-or-aborted-match');
});

test('every accepted VIP item needs exactly one settled search and no unresolved owner search',()=>{
  const f=fixture();
  f.vipAudit.unresolvedOwnerSearches=1;
  assert.equal(run(f).reason,'vip-item-search-pair-incomplete');
  const g=fixture();
  delete g.vipAudit.unresolvedOwnerSearches;
  assert.equal(run(g).reason,'vip-item-search-pair-incomplete');
  const h=fixture();
  h.vipAudit.examples=[itemEvent(0)];
  h.vipAudit.acceptedSearches=0;
  assert.equal(run(h).reason,'vip-item-search-pair-incomplete');
});

test('event archive completeness is checked against hook counters',()=>{
  const f=fixture();
  f.vipAudit.acceptedItems=2;
  assert.equal(run(f).reason,'vip-intervention-event-archive-incomplete');
});

test('rejected intervention events cannot certify a successful item',()=>{
  const f=fixture();
  f.vipAudit.examples[0].accepted=false;
  f.vipAudit.rejectedItems=1;
  f.vipAudit.acceptedItems=0;
  assert.equal(run(f).attributed,false);
});

test('invalid root ordinals and missing divergence fail closed',()=>{
  const f=fixture();
  f.treatmentLedger[1].actionOrdinal=2;
  assert.equal(run(f).reason,'independent-root-count-or-ledger-mismatch');
  const g=fixture();
  g.controlLedger=g.treatmentLedger;
  g.controlRootActionCount=g.treatmentRootActionCount;
  assert.equal(run(g).reason,'missing-ledger-or-no-treatment-divergence');
});

test('first control root must be PassTurnAction and treatment root must be VIP',()=>{
  const f=fixture();
  f.controlLedger[0].action='PlayCardAction';
  f.controlLedger[0].card='Battle Compressor';
  assert.equal(run(f).reason,'control-root-is-not-pass');
  const g=fixture();
  g.treatmentLedger[0].card='Battle Compressor';
  assert.equal(run(g).reason,'accepted-vip-event-root-join-invalid');
});

test('the first divergent roots must retain the same physical seat and turn',()=>{
  const f=fixture();
  f.treatmentLedger[0].playerSlot=1;
  f.vipAudit.examples[0].seat=1;
  f.vipAudit.examples[1].seat=1;
  f.treatmentLedger[1].playerSlot=1;
  assert.equal(run(f).attributed,false);
});


test('Agent41 native row 9:205 ignores unlogged natural seat-1 VIP root ordinal 22',()=>{
  const control=Array.from({length:23},(_,i)=>root(i,'NoopAction',0,1));
  const treatment=Array.from({length:23},(_,i)=>root(i,'NoopAction',0,1));
  control[5]=root(5,'PassTurnAction',0,1);
  treatment[5]=root(5,'PlayCardAction',0,1,{card:'Battle Compressor'});
  for(const ledger of [control,treatment]){
    ledger[13]=root(13,'PlayCardAction',0,1,{card:VIP_NAME});
    ledger[14]=root(14,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:13
    });
    ledger[22]=root(22,'PlayCardAction',1,2,{card:VIP_NAME});
  }
  const f={
    controlLedger:control,controlRootActionCount:23,controlCompleted:true,
    treatmentLedger:treatment,treatmentRootActionCount:23,treatmentCompleted:true,
    vipAudit:audit([itemEvent(13,0,1),searchEvent(13,14,0,1)],{
      dispatchRootCount:23
    })
  };
  const naturalRoot=control[22];
  assert.equal(naturalRoot.playerSlot,1);
  assert.equal(naturalRoot.turnBefore,2);
  assert.equal(f.vipAudit.examples.some(event=>
    event.kind==='vip-item'&&event.itemRootOrdinal===22),false);
  const result=run(f);
  assert.equal(result.attributed,false);
  assert.equal(result.reason,'treatment-root-is-not-vip-play');
});

test('event roots must be unique and point to accepted native actions',()=>{
  const f=fixture();
  f.vipAudit.examples[0].itemRootOrdinal=4;
  assert.equal(run(f).reason,'accepted-vip-event-root-join-invalid');
});
