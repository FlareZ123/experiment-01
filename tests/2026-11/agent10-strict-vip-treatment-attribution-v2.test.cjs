'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,VIP_NAME,VIP_PRINTING,strictVipTreatmentAttribution,
  firstTreatmentDifferenceIsVip,reconcileVipAudit
}=require('../../simulation/evaluation/agent10-strict-vip-treatment-attribution-v2.cjs');

function root(actionOrdinal,action,playerSlot=0,turnBefore=1,extra={}){
  return {
    actionOrdinal,turnBefore,turnAfter:turnBefore,playerSlot,action,
    pendingPrompt:null,
    initiatingRootActionOrdinal:action==='ResolvePromptAction'?
      null:actionOrdinal,
    ...extra
  };
}

function itemEvent(seat=0,turn=1){
  return {kind:'vip-item',seat,turn,printing:VIP_PRINTING,accepted:true};
}

function searchEvent(seat=0,turn=1,extra={}){
  return {
    kind:'vip-search',seat,turn,printings:['Pikachu FST'],
    accepted:true,nativeBenchConfirmed:true,
    benchBefore:0,benchAfter:1,deckBefore:10,deckAfter:9,
    ...extra
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
  const vipAudit={
    policyRecorded:true,rootActionCount:2,
    acceptedItems:1,rejectedItems:0,
    acceptedSearches:1,rejectedSearches:0,
    examples:[itemEvent(),searchEvent()]
  };
  return {control,treatment,vipAudit};
}

test('version identifies the root-linked strict attribution contract',()=>{
  assert.equal(VERSION,'agent10-strict-vip-treatment-attribution-v2');
});

test('exact Pass to VIP root plus its lineage-linked physical search is attributed',()=>{
  const f=fixture();
  const result=strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  );
  assert.equal(result.attributed,true);
  assert.equal(result.divergenceIndex,0);
  assert.equal(result.seat,0);
  assert.equal(result.turn,1);
  assert.deepEqual(result.physicalSearch,{
    itemEventIndex:0,searchEventIndex:1,seat:0,turn:1,
    itemRootOrdinal:0,searchRootOrdinal:1,selectedBasicCount:1
  });
});

test('boolean compatibility helper returns the strict attribution result',()=>{
  const f=fixture();
  assert.equal(firstTreatmentDifferenceIsVip(
    f.control,f.treatment,f.vipAudit
  ),true);
});

test('wrong-seat item receipt fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples[0].seat=1;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('wrong-turn item receipt fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples[0].turn=2;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('wrong physical VIP printing fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples[0].printing='Battle VIP Pass BCR';
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('missing accepted item receipt fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples=[searchEvent()];
  f.vipAudit.acceptedItems=0;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('missing accepted search receipt fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples=[itemEvent()];
  f.vipAudit.acceptedSearches=0;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('unconfirmed native Bench movement fails closed',()=>{
  const f=fixture();
  f.vipAudit.examples[1].nativeBenchConfirmed=false;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('search must have matching physical deck and Bench deltas',()=>{
  const f=fixture();
  f.vipAudit.examples[1].deckAfter=10;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('zero-card search cannot certify a physical VIP treatment',()=>{
  const f=fixture();
  f.vipAudit.examples[1]=searchEvent(0,1,{
    printings:[],benchAfter:0,deckAfter:10
  });
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('the accepted search event must follow its item event',()=>{
  const f=fixture();
  f.vipAudit.examples.reverse();
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('search root must be a ChooseCardsPrompt descended from the exact item root',()=>{
  const f=fixture();
  f.treatment[1].initiatingRootActionOrdinal=0;
  f.treatment[1].pendingPrompt='ConfirmPrompt';
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('duplicate ChooseCardsPrompt roots from one VIP item are ambiguous',()=>{
  const f=fixture();
  f.treatment.push(root(2,'ResolvePromptAction',0,1,{
    pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
  }));
  f.vipAudit.rootActionCount=3;
  assert.equal(reconcileVipAudit(f.treatment,f.vipAudit),null);
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('an earlier common VIP item and search cannot be reused for the later divergence',()=>{
  const control=[
    root(0,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(1,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
    }),
    root(2,'PassTurnAction',0,1)
  ];
  const treatment=[
    root(0,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(1,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
    }),
    root(2,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(3,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:2
    })
  ];
  const vipAudit={
    policyRecorded:true,rootActionCount:4,
    acceptedItems:2,rejectedItems:0,
    acceptedSearches:2,rejectedSearches:0,
    examples:[
      itemEvent(),searchEvent(),itemEvent(),searchEvent()
    ]
  };
  const result=strictVipTreatmentAttribution(control,treatment,vipAudit);
  assert.equal(result.attributed,true);
  assert.equal(result.divergenceIndex,2);
  assert.equal(result.physicalSearch.itemRootOrdinal,2);
  assert.equal(result.physicalSearch.searchRootOrdinal,3);
  assert.equal(result.physicalSearch.itemEventIndex,2);
  assert.equal(result.physicalSearch.searchEventIndex,3);
});

test('an earlier common VIP pair cannot rescue a later VIP root without its own search',()=>{
  const control=[
    root(0,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(1,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
    }),
    root(2,'PassTurnAction',0,1)
  ];
  const treatment=[
    root(0,'PlayCardAction',0,1,{card:VIP_NAME}),
    root(1,'ResolvePromptAction',0,1,{
      pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:0
    }),
    root(2,'PlayCardAction',0,1,{card:VIP_NAME})
  ];
  const vipAudit={
    policyRecorded:true,rootActionCount:3,
    acceptedItems:2,rejectedItems:0,
    acceptedSearches:1,rejectedSearches:0,
    examples:[itemEvent(),searchEvent(),itemEvent()]
  };
  assert.equal(strictVipTreatmentAttribution(
    control,treatment,vipAudit
  ).attributed,false);
});

test('a later VIP event cannot rescue an earlier unrelated root divergence',()=>{
  const f=fixture();
  f.treatment[0].card='Battle Compressor';
  f.treatment.push(root(2,'PlayCardAction',0,1,{card:VIP_NAME}));
  f.treatment.push(root(3,'ResolvePromptAction',0,1,{
    pendingPrompt:'ChooseCardsPrompt',initiatingRootActionOrdinal:2
  }));
  f.vipAudit.rootActionCount=4;
  f.vipAudit.acceptedItems=2;
  f.vipAudit.acceptedSearches=2;
  f.vipAudit.examples.push(itemEvent(),searchEvent());
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('first control root must be PassTurnAction',()=>{
  const f=fixture();
  f.control[0].action='PlayCardAction';
  f.control[0].card='Battle Compressor';
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('first changed root must retain the same physical seat and turn',()=>{
  const f=fixture();
  f.treatment[0].playerSlot=1;
  f.vipAudit.examples[0].seat=1;
  f.vipAudit.examples[1].seat=1;
  f.treatment[1].playerSlot=1;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('unchanged control and treatment ledgers fail closed',()=>{
  const f=fixture();
  assert.equal(strictVipTreatmentAttribution(
    f.treatment,f.treatment,f.vipAudit
  ).attributed,false);
});

test('truncated audit examples fail closed against event counters',()=>{
  const f=fixture();
  f.vipAudit.acceptedItems=2;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('root ledger count mismatch fails closed',()=>{
  const f=fixture();
  f.vipAudit.rootActionCount=3;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('root ordinal gaps fail closed',()=>{
  const f=fixture();
  f.treatment[1].actionOrdinal=2;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('the VIP item must occur in its actual first-turn window',()=>{
  const f=fixture();
  f.treatment[0].turnBefore=3;
  f.treatment[1].turnBefore=3;
  f.vipAudit.examples[0].turn=3;
  f.vipAudit.examples[1].turn=3;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('rejected item and search events fail closed',()=>{
  const f=fixture();
  f.vipAudit.examples[0].accepted=false;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
  const g=fixture();
  g.vipAudit.examples[1].accepted=false;
  assert.equal(strictVipTreatmentAttribution(
    g.control,g.treatment,g.vipAudit
  ).attributed,false);
});

test('unknown audit event kinds fail closed',()=>{
  const f=fixture();
  f.vipAudit.examples.push({kind:'other',accepted:true});
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});

test('unrecorded audit fails closed',()=>{
  const f=fixture();
  f.vipAudit.policyRecorded=false;
  assert.equal(strictVipTreatmentAttribution(
    f.control,f.treatment,f.vipAudit
  ).attributed,false);
});
