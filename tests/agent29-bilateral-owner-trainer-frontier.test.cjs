'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  VERSION,trainerFrontierSummary,withBilateralOwnerTrainerFrontier
}=require('../simulation/twinleaf/agent29-bilateral-owner-trainer-frontier.cjs');

function snapshot(){
  return {
    rootsOmittedDueToCap:2,nativePrintedTrainerClasses:918,
    k0GuaranteedVipPassCount:1,
    roots:[
      {seat:0,turn:3,chosen:{action:'PassTurnAction',trainer:null},
        guaranteedK0VipPassed:true,
        guaranteedK0FirstTurnVip:{printing:'Battle VIP Pass FST',
          minimumBasicStillInDeck:2},
        dispatch:'native-accepted',trainers:[
          {printing:'Battle Compressor PHF',type:'Item',
            publicBlocker:null,nativeEnumeratorOffered:true},
          {printing:'Boss\'s Orders PAL',type:'Supporter',
            publicBlocker:'supporter-already-consumed',
            nativeEnumeratorOffered:false}]},
      {seat:1,turn:4,chosen:{
        action:'PlayCardAction',trainer:{printing:'Ultra Ball SVI'}},
        dispatch:'native-accepted',trainers:[
          {printing:'Ultra Ball SVI',type:'Item',
            publicBlocker:null,nativeEnumeratorOffered:true},
          {printing:'Rare Candy SVI',type:'Item',
            publicBlocker:'public-item-lock',nativeEnumeratorOffered:false}]},
      {seat:1,turn:5,chosen:{action:'PassTurnAction',trainer:null},
        dispatch:'native-accepted',trainers:[]},
      {seat:0,turn:7,chosen:{
        action:'PlayCardAction',trainer:{printing:'Float Stone PLF'}},
        dispatch:'native-rejected',trainers:[
          {printing:'Float Stone PLF',type:'Tool',
            publicBlocker:null,nativeEnumeratorOffered:false}]}
    ]
  };
}

test('two-seat Trainer opportunity accounting separates held, generic-unblocked, offered and selected',()=>{
  const data=snapshot();
  const before=JSON.stringify(data);
  const s=trainerFrontierSummary(data);
  assert.equal(s.version,VERSION);
  assert.equal(s.readOnly,true);
  assert.equal(JSON.stringify(data),before);
  assert.equal(s.observedRootCount,4);
  assert.equal(s.rootsOmittedDueToCap,2);
  assert.equal(s.nativeCatalogPrintings,918);
  assert.equal(s.k0GuaranteedVipPasses,1);
  assert.deepEqual(s.k0FirstTurnVipExamples,[{
    seat:0,turn:3,
    certificate:{printing:'Battle VIP Pass FST',minimumBasicStillInDeck:2},
    actualAction:'PassTurnAction',nativeDispatch:'native-accepted'
  }]);
  assert.deepEqual(s.bySeat[0],{
    observedRoots:2,rootsHoldingTrainers:2,
    rootsWithUnblockedTrainer:2,acceptedPassWithUnblockedTrainer:1,
    nativeOfferedCopies:1,genericUnblockedCopies:2,
    selectedTrainerRootsAccepted:0,selectedTrainerRootsRejected:1,
    byType:{Item:1,Supporter:0,Stadium:0,Tool:1}
  });
  assert.deepEqual(s.bySeat[1],{
    observedRoots:2,rootsHoldingTrainers:1,
    rootsWithUnblockedTrainer:1,acceptedPassWithUnblockedTrainer:0,
    nativeOfferedCopies:1,genericUnblockedCopies:1,
    selectedTrainerRootsAccepted:1,selectedTrainerRootsRejected:0,
    byType:{Item:1,Supporter:0,Stadium:0,Tool:0}
  });
  assert.deepEqual(s.examples,[{
    seat:0,turn:3,heldUnblocked:[{
      printing:'Battle Compressor PHF',type:'Item',
      nativeEnumeratorOffered:true
    }],ownerPrivatePostgameOnly:true
  }]);
  assert.equal(s.rootLedgerSha256,
    createHash('sha256').update(JSON.stringify(data.roots)).digest('hex'));
  assert.equal(s.cardSpecificPaperPlayabilityVerified,false);
  assert.equal(s.discardAndTargetPaymentsVerified,false);
  assert.equal(s.independentCompetitiveGames,0);
});

test('native observer transport includes both physical seats and returns original game result',()=>{
  const original={native:'same',winner:null};
  const rows=snapshot();
  let called=0;
  const observed=withBilateralOwnerTrainerFrontier(()=>original,{
    maxRoots:40,
    observer:(run,deps)=>{
      called++;
      assert.deepEqual(deps.seats,[0,1]);
      assert.equal(deps.maxRoots,40);
      assert.equal(deps.typedNativeDep,42);
      assert.equal(deps.ownRegisteredSixties[0].length,60);
      assert.equal(deps.ownRegisteredSixties[1].length,60);
      return {result:run(),audit:rows};
    },
    nativeDeps:{typedNativeDep:42},
    ownRegisteredSixties:[Array(60).fill('First Sixty'),
      Array(60).fill('Second Sixty')]
  });
  assert.equal(called,1);
  assert.strictEqual(observed.result,original);
  assert.equal(observed.audit.transportVersion,VERSION);
  assert.deepEqual(observed.audit.summary.bySeat[0].byType,
    {Item:1,Supporter:0,Stadium:0,Tool:1});
  assert.equal(observed.audit.summary.independentCompetitiveGames,0);
});

test('invalid evidence and unbounded observer requests fail rather than silently certify',()=>{
  assert.throws(()=>trainerFrontierSummary({roots:[{seat:2,trainers:[]}]}));
  assert.throws(()=>trainerFrontierSummary({roots:null}));
  assert.throws(()=>withBilateralOwnerTrainerFrontier(()=>1,{
    maxRoots:4097,observer:()=>({result:1,audit:snapshot()}),
    nativeDeps:{}
  }));
  assert.throws(()=>withBilateralOwnerTrainerFrontier(()=>1,{
    maxRoots:0,observer:()=>({result:1,audit:snapshot()}),
    nativeDeps:{}
  }));
});
