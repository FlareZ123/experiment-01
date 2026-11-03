'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,publicRootSignature,firstPublicDivergence,
  auditTwelveArmArchive
}=require('../simulation/evaluation/agent13-rank5-quickball-raw-archive-audit.cjs');

function event(n,seat,action,card=null,turn=1){
  return {actionOrdinal:n,turnBefore:turn,playerSlot:seat,
    action,...(card===null?{}:{card})};
}

/** A complete 4 x 3 synthetic registered native archive. */
function fixture(){
  const ids=['champion-reference','new-moon-lockbreaker-v1',
    'champion-reference','new-moon-lockbreaker-v1'];
  const base=[],root=[],full=[];
  for(let i=0;i<4;i++){
    const seat=i<2?1:0;
    const ordinal=i<2?11:i===2?45:79;
    const turn=i<2?1:i===2?8:14;
    const common={
      trial:{id:'5:synthetic:'+i+':'+ids[i]},
      sourceSeat:seat,
      sourceDealFingerprint:'same-original-'+i,
      fullPhysicalDealFingerprint:'same-two-player-'+i,
      endReason:i%2===0?'engine-game-end':'action-limit',
      actionCount:100+i,
      sourceAttackSettlement:{settled:i},
      nativeQuickBallOwnerTransactions:{rows:[]}
    };
    const samePrefix=[event(0,seat,'PassTurnAction',null,turn)];
    const old={
      ...common,rootActionLedger:[...samePrefix,
        event(ordinal,seat,i<2?'PlayCardAction':'PassTurnAction',
          i<2?'Double Colorless Energy':null,turn)]
    };
    const paid={
      rootOrdinal:ordinal,seat,globalTurn:turn,
      paymentSelection:i<2?'Double Colorless Energy SUM':"Trainers' Mail ROS",
      paymentCopiesBefore:2,paymentCopiesAfter:1,
      searchedPrintings:['Genesect V FST'],
      nativePaymentChoiceAccepted:true,
      publicDiscardPostconditionVerified:false
    };
    const newer={
      ...common,trial:{...common.trial},rootActionLedger:[...samePrefix,
        event(ordinal,seat,'PlayCardAction','Quick Ball',turn)],
      nativeQuickBallOwnerTransactions:{rows:[paid]}
    };
    base.push(old);root.push(newer);full.push(newer);
  }
  const modes=[
    {id:'vip_only_control',native:{rows:base}},
    {id:'vip_plus_quickball_root',native:{rows:root}},
    {id:'vip_plus_quickball_full_owner_prompt',native:{rows:full}}
  ];
  return {
    schema:'agent13-rank5-vip-quickball-native-twelvearm-v1',
    attempts:12,registeredSourcePhysicalDeals:4,
    sourceOriginalPrinted60Sha256:'test-source',
    vendorRevision:'test-vendor',modes
  };
}

test('first divergence retains the exact source seat, ordinal and owner root',()=>{
  const a=[event(1,0,'PassTurnAction'),event(2,0,'PlayCardAction',
    'Double Colorless Energy')];
  const b=[event(1,0,'PassTurnAction'),event(2,0,'PlayCardAction',
    'Quick Ball')];
  assert.deepEqual(firstPublicDivergence(a,b),{
    matchedLeadingEvents:1,
    control:[2,1,0,'PlayCardAction','Double Colorless Energy',null,null],
    treatment:[2,1,0,'PlayCardAction','Quick Ball',null,null],
    sameFullPublicRootLedger:false
  });
  assert.deepEqual(publicRootSignature(event(1,1,'PassTurnAction')),
    [1,1,1,'PassTurnAction',null,null,null]);
});

test('prefix and equal ledgers distinguish no change from terminal truncation',()=>{
  const x=[event(1,0,'PassTurnAction')];
  assert.equal(firstPublicDivergence(x,x).sameFullPublicRootLedger,true);
  assert.deepEqual(firstPublicDivergence(x,[]),{
    matchedLeadingEvents:0,
    control:[1,1,0,'PassTurnAction',null,null,null],
    treatment:null,sameFullPublicRootLedger:false
  });
});

test('registered 4-physical-deal synthetic archive retains all donors and caps',()=>{
  const report=auditTwelveArmArchive(fixture());
  assert.equal(report.version,VERSION);
  assert.equal(report.registeredTrials,4);
  assert.equal(report.matchedFullPhysicalDeals,4);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.deepEqual(report.comparisons.map(x=>
    x.firstDifferentPublicRootEvent.treatment[0]),[11,11,45,79]);
  assert.deepEqual(report.comparisons.map(x=>
    x.sourceQuickBallNativePaymentEvents[0].paidPrinting),[
      'Double Colorless Energy SUM','Double Colorless Energy SUM',
      "Trainers' Mail ROS","Trainers' Mail ROS"
    ]);
  assert.deepEqual(report.comparisons.map(x=>x.controlNativeEndReason),[
    'engine-game-end','action-limit','engine-game-end','action-limit'
  ]);
  assert.ok(report.comparisons.every(x=>
    x.sourceQuickBallNativePaymentEvents[0].nativeAccepted));
  assert.ok(report.comparisons.every(x=>
    x.nativeCompetitiveQualification===false));
});

test('incompatible printed-source physical deal is rejected',()=>{
  const data=fixture();
  data.modes[2].native.rows[2].sourceDealFingerprint='different';
  assert.throws(()=>auditTwelveArmArchive(data),
    /same-physical-deal/);
});

test('matching source alone cannot hide a different candidate opening',()=>{
  const data=fixture();
  data.modes[2].native.rows[2].fullPhysicalDealFingerprint='other-candidate';
  assert.throws(()=>auditTwelveArmArchive(data),
    /same-physical-deal/);
});

test('archive admission fails on missing trial and incomplete counterpart',()=>{
  const data=fixture();
  data.modes[2].native.rows[1].trial.id='other';
  assert.throws(()=>auditTwelveArmArchive(data));
  const data2=fixture();
  data2.modes[2].native.rows.pop();
  assert.throws(()=>auditTwelveArmArchive(data2));
});
