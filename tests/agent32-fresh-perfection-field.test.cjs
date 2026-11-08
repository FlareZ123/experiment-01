'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  trials,digest,summarizeRow,comparePairs
} = require('../simulation/evaluation/agent32-fresh-perfection-field.cjs');

/** @param {string} id @param {object} [extra] */
function arm(id, extra={}) {
  return {
    id,rank:11,candidateSeat:0,sourceSeat:1,
    fullPhysicalDealFingerprint:{digestSha256:'full-fixed'},
    sourceDealFingerprint:{digestSha256:'source-fixed'},
    status:'native-terminal',winner:1,finished:true,rootActions:99,
    rootActionLedger:[{action:'PlayCardAction'},{action:'PassTurnAction'}],
    nativeLedgerDigest:'baseline',
    remainingPrizes:[6,0],
    acceptedPerfectionRootIntents:0,
    nativeCopiedAttackPromptAccepted:0,
    copiedAttackSelections:[],
    ...extra
  };
}

/** Build a complete synthetic 16-group panel, changing one registered treatment. */
function pairFor(id, override={}) {
  const control=trials().map(t=>arm(t.id,{
    rank:t.rank,
    candidateSeat:t.candidateSlot==='A'?0:1,
    sourceSeat:t.candidateSlot==='A'?1:0
  }));
  const treatment=control.map(a=>({
    ...a,...(a.id===id?override:{})
  }));
  return comparePairs(control,treatment).find(pair=>pair.id===id);
}

test('fresh field registration fixes sixteen unique physical seed-seat groups with both orientations',()=>{
  const rows=trials();
  assert.equal(rows.length,16);
  assert.deepEqual([...new Set(rows.map(x=>x.rank))].sort((a,b)=>a-b),
    [1,3,5,6,9,11,13,26]);
  assert.equal(rows.filter(x=>x.candidateSlot==='A').length,8);
  assert.equal(rows.filter(x=>x.candidateSlot==='B').length,8);
  assert.equal(new Set(rows.map(x=>x.seed)).size,16);
  assert.equal(new Set(rows.map(x=>x.id)).size,16);
});

test('same physical deal and genuine complete native terminal can witness candidate win conversion',()=>{
  const id='11:22:A:new-moon-lockbreaker-v1';
  const pair=pairFor(id,{winner:0,rootActions:65,
      rootActionLedger:[{action:'PlayCardAction'},{action:'UseAbilityAction'}],
      acceptedPerfectionRootIntents:1,
      nativeCopiedAttackPromptAccepted:1});
  assert.equal(pair.physicallyMatched,true);
  assert.equal(pair.firstDifference.ordinal,1);
  assert.equal(pair.control.candidateNativeWinner,false);
  assert.equal(pair.paidPerfection.candidateNativeWinner,true);
  assert.equal(pair.nativeResultReversed,true);
});

test('a root cap never counts as a native win even if its winner field is misleading',()=>{
  const id='11:22:A:new-moon-lockbreaker-v1';
  const pair=pairFor(id,{
    status:'root-cap',winner:0,finished:false,rootActions:260
  });
  assert.equal(pair.paidPerfection.candidateNativeWinner,false);
  assert.equal(pair.nativeResultReversed,false);
});

test('distinct physical source deals are retained but cannot pass pairing',()=>{
  const id='11:22:A:new-moon-lockbreaker-v1';
  const pair=pairFor(id,{
    sourceDealFingerprint:{digestSha256:'different'}
  });
  assert.equal(pair.physicallyMatched,false);
  assert.equal(pair.matchedFull,true);
  assert.equal(pair.matchedSource,false);
});

test('engine error remains explicit and cannot be promoted to a candidate win',()=>{
  const id='11:22:A:new-moon-lockbreaker-v1';
  const pair=pairFor(id,{
    status:'engine-error',winner:0,finished:false
  });
  assert.equal(pair.paidPerfection.candidateNativeWinner,false);
  assert.equal(pair.nativeResultReversed,false);
});

test('row summaries retain native Perfection action receipts',()=>{
  const row=summarizeRow({
    trial:trials()[0],finished:true,winner:0,
    finalPrizes:[0,6],fullPhysicalDealFingerprint:'full',
    sourceDealFingerprint:'source',
    rootActionLedger:[{action:'UseAbilityAction',name:'Perfection'}],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{typedIntentCounts:{perfection:1}},
      chooseAttack:{accepted:1,selections:[{attack:'Poltergeist'}]}
    }}
  },true);
  assert.equal(row.acceptedPerfectionRootIntents,1);
  assert.equal(row.nativeCopiedAttackPromptAccepted,1);
  assert.equal(row.copiedAttackSelections[0].attack,'Poltergeist');
  assert.equal(row.status,'native-terminal');
  assert.equal(row.nativeLedgerDigest,digest(row.rootActionLedger));
});
