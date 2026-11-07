'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {auditPair}=require('../simulation/evaluation/agent35-v9-powerglass-prize-pair-audit.cjs');

const sourceDeal='a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317';
const fullDeal='94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7';

/** Build a synthetic native-archive shape, not a new game or synthetic win. */
function fixture(){
  const common=Array.from({length:98},(_,ordinal)=>({
    actionOrdinal:ordinal,playerSlot:ordinal%2,
    action:'ResolvePromptAction',pendingPrompt:'WaitPrompt'
  }));
  const native=(length,status,finished,winner,prizes)=>{
    const ledger=[...common];
    for(let ordinal=98;ordinal<length;ordinal++)
      ledger.push({actionOrdinal:ordinal,playerSlot:1,action:'PassTurnAction'});
    return {
      id:'11:1000:B:new-moon-lockbreaker-v1',
      sourceSeat:0,candidateSeat:1,actualFirstPlayerSeat:0,
      sourceDealFingerprint:sourceDeal,fullPhysicalDealFingerprint:fullDeal,
      sourceDeckFingerprint:'printed source60',candidateDeckFingerprint:'printed candidate60',
      rootActionLedger:ledger,rootActionCount:length,
      status,finished,winner,finalPrizes:prizes
    };
  };
  const control=native(186,'native-terminal-unqualified',true,0,[0,6]);
  const treatment=native(260,'root-cap-unqualified',false,null,[4,5]);
  const action=(ordinal,playerSlot,name,extra={})=>{
    treatment.rootActionLedger[ordinal]={
      actionOrdinal:ordinal,playerSlot,action:name,...extra
    };
  };
  action(98,1,'PlayCardAction',{card:'Powerglass'});
  action(100,1,'ResolvePromptAction',{pendingPrompt:'AttachEnergyPrompt'});
  action(103,0,'AttackAction',{attack:'Super Poison Breath'});
  action(107,1,'AttackAction',{attack:'Hidden Power'});
  action(109,1,'ResolvePromptAction',{pendingPrompt:'AttachEnergyPrompt'});
  action(110,1,'ResolvePromptAction',{pendingPrompt:'ChoosePrizePrompt'});
  action(111,0,'ResolvePromptAction',{pendingPrompt:'ChoosePokemonPrompt'});
  action(118,1,'AttackAction',{attack:'Hidden Power'});
  treatment.candidateAttackSettlement={attacks:[{
    actionOrdinal:107,settledPromptChain:true,
    nextSourceSameEpochProven:true,prizesBefore:[5,6],prizesAfter:[5,5],
    publicBoardBefore:[{active:{printing:'Trubbish FST',damage:60}},{}],
    publicBoardAfter:[
      {active:{printing:'Tapu Lele-GX GRI'}},
      {active:{printing:'Unown AOR',energyCards:['Psychic','Psychic'],
        toolCards:['Powerglass']}}
    ]
  }]};
  return [
    {nativeAttempt:control},
    {nativeAttempt:treatment,nativeAdapterAudit:{agent35Powerglass:{
      rootAccepted:1,rootRejected:0,promptAccepted:2,attachedFromDiscard:2,
      opponentConcealedRead:false,ownerDeckIdentityRead:false
    }}}
  ];
}

test('native pair evidence has same physical deal and authentic one-prize ledger',()=>{
  const [control,treatment]=fixture();
  const report=auditPair(control,treatment);
  assert.equal(report.firstIdenticalNativeRoots,98);
  assert.deepEqual(report.candidatePrizesBeforeAfterKO,[6,5]);
  assert.equal(report.physicallyAcceptedBasicEnergyTransfers,2);
  assert.equal(report.confirmedMatchupWins,0);
  assert.equal(report.rootCapWithoutWinner,true);
});
test('modified previous native root or full original physical deal is rejected',()=>{
  const [a,b]=fixture();
  b.nativeAttempt.rootActionLedger[97].action='PlayCardAction';
  assert.throws(()=>auditPair(a,b));
  b.nativeAttempt.rootActionLedger[97].action='ResolvePromptAction';
  b.nativeAttempt.fullPhysicalDealFingerprint='wrong-deal';
  assert.throws(()=>auditPair(a,b));
});
test('native Prize requires settled one-prize KO and correct promotion',()=>{
  const [a,b]=fixture();
  const ko=b.nativeAttempt.candidateAttackSettlement.attacks[0];
  ko.prizesAfter=[5,6];
  assert.throws(()=>auditPair(a,b));
  ko.prizesAfter=[5,5];
  ko.publicBoardAfter[0].active.printing='Trubbish FST';
  assert.throws(()=>auditPair(a,b));
});
test('accepted Tool and owner Basic transfers are evidence, not suggestions',()=>{
  const [a,b]=fixture();
  b.nativeAdapterAudit.agent35Powerglass.attachedFromDiscard=1;
  assert.throws(()=>auditPair(a,b));
  b.nativeAdapterAudit.agent35Powerglass.attachedFromDiscard=2;
  b.nativeAdapterAudit.agent35Powerglass.opponentConcealedRead=true;
  assert.throws(()=>auditPair(a,b));
});
test('root cap is not interpreted as a native or paper-game win',()=>{
  const [a,b]=fixture();
  b.nativeAttempt.finished=true;
  assert.throws(()=>auditPair(a,b));
  b.nativeAttempt.finished=false;
  b.nativeAttempt.winner=1;
  assert.throws(()=>auditPair(a,b));
});
