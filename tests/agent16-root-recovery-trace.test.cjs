'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {traceAcceptedOwnerRootRecoveries,equivalentPrintedIntent,
  opportunityKey,matchingExplicitEnergyTarget}=require('../simulation/twinleaf/agent16-root-recovery-trace.cjs');

const special={kind:'attach-special-energy',printing:'Capture Energy RCL',
  handIndex:0,reason:'later-root-may-recover',
  nativePlayability:'unverified'};
const root=(seat,turn,kind,printing,alts=[],extra={})=>({
  seat,globalTurn:turn,kind,printing,alternatives:alts,
  accepted:true,nativePhysicalEffect:null,...extra
});

test('later native-accepted same-printing action is recorded as recovered',()=>{
  const rows=[
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    root(0,3,'attach-special-energy','Capture Energy RCL',[],{
      nativePhysicalEffect:'confirmed-public-effect'
    }),
    root(0,3,'attack','Get Lost'),
    root(1,4,'attack',null)
  ];
  const result=traceAcceptedOwnerRootRecoveries(rows);
  assert.equal(result.distinctDeferrableOffers,1);
  assert.equal(result.recoveredInSameTurn,1);
  assert.equal(result.recoveredPhysicalConfirmed,1);
  assert.equal(result.expiredAtTurnEnd,0);
  assert.equal(result.censoredAfterLastRoot,0);
  assert.equal(result.samples.recovered[0].originOrdinal,0);
  assert.equal(result.samples.recovered[0].selectedOrdinal,1);
});

test('terminal attack expires deferrable prior opportunity without claim of legality',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    root(0,3,'attack','Get Lost')
  ]);
  assert.equal(result.recoveredInSameTurn,0);
  assert.equal(result.expiredAtTurnEnd,1);
  assert.equal(result.qualification.originalAlternativeLegalityCertified,false);
});

test('pass immediately classifies an offered later option as turn-ending',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'pass',null,[{
      ...special,reason:'turn-ending-selection'
    }])
  ]);
  assert.equal(result.immediateTurnEnding,1);
  assert.equal(result.distinctDeferrableOffers,0);
  assert.equal(result.expiredAtTurnEnd,0);
});

test('Supporter/Energy quota alternatives are distinct from sequential recovery',()=>{
  const r=traceAcceptedOwnerRootRecoveries([
    root(0,3,'attach-basic-energy','Psychic Energy SVE',[
      {...special,reason:'same-turn-energy-attachment'}
    ]),
    root(0,3,'play-lowhand-lillie',"Lillie's Determination MEG",[
      {kind:'play-held-guzma-mobility',printing:'Guzma BUS',
        reason:'same-turn-supporter-quota'}
    ]),
    root(0,3,'attack','Get Lost')
  ]);
  assert.equal(r.immediateCompetingQuota,2);
  assert.equal(r.distinctDeferrableOffers,0);
});

test('new owner turn closes previous opportunity separately from terminal close',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    root(1,4,'pass',null),
    root(0,5,'attach-basic-energy','Psychic Energy SVE')
  ]);
  assert.equal(result.closedOnNextOwnerTurn,1);
  assert.equal(result.expiredAtTurnEnd,0);
  assert.equal(result.censoredAfterLastRoot,0);
});

test('incomplete final owner turn is censored, never classified as lost',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special])
  ]);
  assert.equal(result.censoredAfterLastRoot,1);
  assert.equal(result.closedOnNextOwnerTurn,0);
  assert.equal(result.expiredAtTurnEnd,0);
});

test('repeated identical offer is counted once until its turn ends',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    root(0,3,'evolve-pokemon','Another Evolution',[
      {...special,handIndex:1}
    ]),
    root(0,3,'attack','Get Lost')
  ]);
  assert.equal(result.repeatedOffers,1);
  assert.equal(result.distinctDeferrableOffers,1);
  assert.equal(result.expiredAtTurnEnd,1);
});

test('different printing and definite different target cannot be overmatched',()=>{
  assert.equal(equivalentPrintedIntent(special,{
    kind:'attach-special-energy',printing:'Spiky Energy JTG'
  }),false);
  assert.equal(equivalentPrintedIntent({
    ...special,slot:'bench',index:0
  },{
    kind:'attach-special-energy',printing:'Capture Energy RCL',
    slot:'bench',index:1
  }),false);
  assert.equal(equivalentPrintedIntent(special,{
    kind:'attach-special-energy',printing:'Capture Energy RCL'
  }),true);
  assert.notEqual(opportunityKey(special),
    opportunityKey({...special,printing:'Spiky Energy JTG'}));
});

test('rejected rather than native-accepted roots are never counted as recovered',()=>{
  assert.throws(()=>traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    {...root(0,3,'attach-special-energy','Capture Energy RCL'),
      accepted:false}
  ]),/Store-accepted owner roots/);
});

test('two physical seats retain correct turn-separated classifications',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    root(0,3,'attach-special-energy','Capture Energy RCL'),
    root(0,3,'attack','Get Lost'),
    root(1,4,'bench-basic','Other Basic',[special]),
    root(1,4,'attack','Opponent Attack')
  ]);
  assert.equal(result.distinctDeferrableOffers,2);
  assert.equal(result.recoveredInSameTurn,1);
  assert.equal(result.expiredAtTurnEnd,1);
});

test('physical clock rewind cannot manufacture same-turn recovery',()=>{
  assert.throws(()=>traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[special]),
    root(1,4,'attack','Opponent Attack'),
    root(0,3,'attach-special-energy','Capture Energy RCL')
  ]),/Split native clock resets/);
});


test('distinct attack names cannot recover or collapse into one opportunity',()=>{
  const getLost={kind:'attack',attackName:'Get Lost',
    reason:'later-root-may-recover'};
  const mindShock={...getLost,attackName:'Mind Shock'};
  assert.notEqual(opportunityKey(getLost),opportunityKey(mindShock));
  assert.equal(equivalentPrintedIntent(getLost,mindShock),false);
  assert.equal(equivalentPrintedIntent(getLost,{kind:'attack'}),false);
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[getLost,mindShock]),
    root(0,3,'attack',null,[],{attackName:'Mind Shock'})
  ]);
  assert.equal(result.distinctDeferrableOffers,2);
  assert.equal(result.recoveredInSameTurn,1);
  assert.equal(result.expiredAtTurnEnd,1);
});

test('a recipient missing in an accepted root never gains explicit-target credit',()=>{
  const target={...special,slot:'bench',index:1};
  const realized={kind:special.kind,printing:special.printing,
    nativePhysicalEffect:'confirmed-public-effect'};
  assert.equal(equivalentPrintedIntent(target,realized),true);
  assert.equal(matchingExplicitEnergyTarget(target,realized),false);
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[target]),
    root(0,3,realized.kind,realized.printing,[],realized),
    root(0,3,'pass',null)
  ]);
  assert.equal(result.recoveredInSameTurn,1);
  assert.equal(result.recoveredPhysicalConfirmed,1);
  assert.equal(result.recoveredExplicitEnergyTarget,0);
  assert.equal(result.recoveredExplicitEnergyTargetWithEffect,0);
  assert.equal(result.samples.recovered[0].physicalCopyIdentityVerified,false);
});

test('same explicit energy recipient plus settlement receives stronger evidence tier',()=>{
  const target={...special,slot:'bench',index:1};
  const accepted={slot:'bench',index:1,
    nativePhysicalEffect:'confirmed-public-effect'};
  assert.equal(matchingExplicitEnergyTarget(target,{
    kind:special.kind,printing:special.printing,...accepted}),true);
  assert.equal(matchingExplicitEnergyTarget(target,{
    kind:special.kind,printing:special.printing,...accepted,index:2}),false);
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Girafarig LOT',[target]),
    root(0,3,special.kind,special.printing,[],accepted),
    root(0,3,'pass',null)
  ]);
  assert.equal(result.recoveredExplicitEnergyTarget,1);
  assert.equal(result.recoveredExplicitEnergyTargetWithEffect,1);
  assert.equal(result.samples.recovered[0].explicitEnergyTargetMatch,true);
  assert.equal(result.qualification.explicitEnergyTargetDoesNotVerifyCardCopy,true);
});


test('genuine post-prompt native turn advance closes Boost Shake without Pass',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Trubbish BKP',[special]),
    root(0,3,'play-boost-shake','Boost Shake EVS',[],{
      nativeSettledTurnAfter:4
    }),
    root(1,4,'pass',null)
  ]);
  assert.equal(result.expiredAtTurnEnd,1);
  assert.equal(result.closedOnNextOwnerTurn,0);
  assert.equal(result.censoredAfterLastRoot,0);
  assert.equal(result.nativeAttestedTurnEnds,1);
  assert.equal(result.nativeAttestedNonattackTurnEnds,1);
  assert.equal(result.samples.expired[0].status,'turn-ended');
});

test('other printed terminal Trainer classes require post-settlement native evidence',()=>{
  for(const [kind,printing] of [
    ['play-camping-gear','Camping Gear BST'],
    ['play-palace-book','Palace Book SMP'],
    ['play-stevens-resolve',"Steven's Resolve CES"],
    ['use-tropical-beach','Tropical Beach BWP']
  ]){
    const result=traceAcceptedOwnerRootRecoveries([
      root(1,8,'bench-basic','Rotom V LOR',[special]),
      root(1,8,kind,printing,[],{nativeSettledTurnAfter:9}),
      root(0,9,'pass',null)
    ]);
    assert.equal(result.expiredAtTurnEnd,1,kind);
    assert.equal(result.nativeAttestedNonattackTurnEnds,1,kind);
  }
});

test('an accepted terminal-looking Item without post-prompt turn proof stays censored',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Trubbish BKP',[special]),
    root(0,3,'play-boost-shake','Boost Shake EVS')
  ]);
  assert.equal(result.expiredAtTurnEnd,0);
  assert.equal(result.nativeAttestedNonattackTurnEnds,0);
  assert.equal(result.censoredAfterLastRoot,1);
});

test('nonadvancing native state does not close owner turn or prevent later recovery',()=>{
  const result=traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Trubbish BKP',[special]),
    root(0,3,'play-quick-ball','Quick Ball SSH',[],{
      nativeSettledTurnAfter:3
    }),
    root(0,3,'attach-special-energy','Capture Energy RCL'),
    root(0,3,'pass',null)
  ]);
  assert.equal(result.recoveredInSameTurn,1);
  assert.equal(result.nativeAttestedTurnEnds,0);
});

test('invalid or contradictory native closure evidence fails closed',()=>{
  assert.throws(()=>traceAcceptedOwnerRootRecoveries([
    root(0,3,'bench-basic','Trubbish BKP',[],{
      nativeSettledTurnAfter:2
    })
  ]),/nondecreasing integer/);
  assert.throws(()=>traceAcceptedOwnerRootRecoveries([
    root(0,3,'play-palace-book','Palace Book SMP',[],{
      nativeSettledTurnAfter:4
    }),
    root(0,3,'bench-basic','Rotom V LOR')
  ]),/already-ended turn/);
});
