'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compare,candidatePassEpisodes}=
  require('../simulation/evaluation/agent35-v9-lillie-pair-audit.cjs');

/** @param {boolean} variant */
function fixture(variant){
  const base=Array.from({length:93},(_,n)=>({
    actionOrdinal:n,action:'ResolvePromptAction',
    playerSlot:n%2,turnBefore:Math.floor(n/7)
  }));
  const root=variant?
    {actionOrdinal:93,action:'PlayCardAction',card:"Lillie's Determination",
      playerSlot:1,turnBefore:14}:
    {actionOrdinal:93,action:'PassTurnAction',playerSlot:1,turnBefore:14};
  const later=variant?[{actionOrdinal:95,action:'ResolvePromptAction',
    pendingPrompt:'ShuffleDeckPrompt',initiatingRootActionOrdinal:93,playerSlot:1}]:[];
  const ledger=[...base,root,...later];
  const passes=variant?[]:[{actorSeat:1,actionOrdinal:93,turn:14,
    ownerHandAtChosenPass:["Lillie's Determination M1L"],
    publicBoardBeforePass:[{},{
      active:{printing:'Unown AOR',energyCards:[]},bench:[]
    }]}];
  return {
    nativeAttempt:{
      id:'fixed',sourceSeat:0,candidateSeat:1,actualFirstPlayerSeat:0,
      sourceDeckFingerprint:'source60',candidateDeckFingerprint:'candidate60',
      sourceDealFingerprint:'sourceDeal',fullPhysicalDealFingerprint:'fullDeal',
      status:'native-terminal-unqualified',finished:true,winner:0,
      rootActionLedger:ledger,rootActionCount:ledger.length,turns:40,
      finalPrizes:[0,5],nativeAllOwnerPassFrontier:{receipts:passes}
    },
    nativeAdapterAudit:{
      agent7LillieAfterPass:variant?{
        acceptedLillieRoots:1,rejectedLillieRoots:0,
        rootEvents:[{seat:1,globalTurn:14,sourceAction:'PassTurnAction',
          chosenPrinting:"Lillie's Determination M1L",StoreAccepted:true}]
      }:null
    }
  };
}

test('93 identical roots, Store-accepted printed Lillie and physical shuffle',()=>{
  const report=compare(fixture(false),fixture(true));
  assert.equal(report.identicalAcceptedPrefixLength,93);
  assert.equal(report.nativeLillieAccepted,true);
  assert.equal(report.noCompetitivelyQualifiedGames,true);
  assert.equal(report.baseline.candidatePassEpisodes[0].ownEnergyAttached,0);
});
test('reject a modified predecessor or changed physical source deal',()=>{
  const a=fixture(false),b=fixture(true);
  b.nativeAttempt.rootActionLedger[92].turnBefore=99;
  assert.throws(()=>compare(a,b));
  b.nativeAttempt.rootActionLedger[92].turnBefore=13;
  b.nativeAttempt.sourceDealFingerprint='other';
  assert.throws(()=>compare(a,b));
});
test('reject a suggestion that never settled a native physical shuffle',()=>{
  const a=fixture(false),b=fixture(true);
  b.nativeAdapterAudit.agent7LillieAfterPass.acceptedLillieRoots=0;
  assert.throws(()=>compare(a,b));
  b.nativeAdapterAudit.agent7LillieAfterPass.acceptedLillieRoots=1;
  b.nativeAttempt.rootActionLedger.pop();
  b.nativeAttempt.rootActionCount--;
  assert.throws(()=>compare(a,b));
});
test('privacy-minimized pass report counts own attached Energy',()=>{
  const a=fixture(false).nativeAttempt;
  a.nativeAllOwnerPassFrontier.receipts[0].publicBoardBeforePass[1].bench=[
    {printing:'Duskull VIV',energyCards:['Psychic Energy']}
  ];
  const episodes=candidatePassEpisodes(a);
  assert.equal(episodes[0].ownEnergyAttached,1);
  assert.equal(episodes[0].ownerHandCount,1);
  assert.equal(Object.hasOwn(episodes[0],'ownerHandAtChosenPass'),false);
});
