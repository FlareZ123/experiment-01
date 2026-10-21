'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditRow,auditArchive,digest}=
  require('../simulation/evaluation/agent33-archived-native-public-root-audit.cjs');

const h1='1'.repeat(64);
const h2='2'.repeat(64);
const h3='3'.repeat(64);
const h4='4'.repeat(64);

function fixture(){
  const roots=[
    {actionOrdinal:0,turnBefore:0,turnAfter:0,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'WaitPrompt',
      initiatingRootActionOrdinal:null},
    {actionOrdinal:1,turnBefore:0,turnAfter:1,playerSlot:1,
      action:'PassTurnAction',pendingPrompt:null,
      initiatingRootActionOrdinal:null}
  ];
  return {
    trial:{id:'rank6:source-first:diagnostic'},
    status:'development',
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    rootActionLedger:roots,
    rootActionCount:roots.length,
    rootActionLedgerSha256:digest(roots),
    suddenDeathClockResets:[],
    sourceDealFingerprint:h1,
    sourceDealEpochs:{
      recordedNativeRestarts:0,
      recordedOpeningDeals:1,
      allEpisodeOpeningsCaptured:true,
      deals:[{
        episodeIndex:0,sourceDealDigestSha256:h1,
        fullPhysicalDealDigestSha256:h2,initialPrizeCounts:[6,6]
      }]
    }
  };
}

test('simple full Store native public ledger and source fingerprint pass',()=>{
  const row=fixture();
  const audit=auditRow(row);
  assert.equal(audit.singleEpisode,true);
  assert.equal(audit.rootCount,2);
  assert.equal(audit.visibleSourceDealEpochs,1);
  assert.equal(audit.qualifiedCompetitiveGames,0);
});

test('actual reset marker plus a fresh second deal stays two episodes',()=>{
  const row=fixture();
  row.rootActionLedger=[
    {...row.rootActionLedger[0],turnAfter:1},
    {...row.rootActionLedger[1],turnBefore:1,turnAfter:0,
      action:'ResolvePromptAction',pendingPrompt:'WaitPrompt'},
    {...row.rootActionLedger[0],actionOrdinal:2}
  ];
  row.rootActionCount=3;
  row.rootActionLedgerSha256=digest(row.rootActionLedger);
  row.suddenDeathClockResets=[{
    actionOrdinal:1,fromTurn:1,toTurn:0,
    afterSuddenDeath:true,enteredSetup:true
  }];
  row.sourceDealEpochs={
    recordedNativeRestarts:1,recordedOpeningDeals:2,
    allEpisodeOpeningsCaptured:true,
    deals:[
      {episodeIndex:0,sourceDealDigestSha256:h1,
        fullPhysicalDealDigestSha256:h2,initialPrizeCounts:[6,6]},
      {episodeIndex:1,sourceDealDigestSha256:h3,
        fullPhysicalDealDigestSha256:h4,initialPrizeCounts:[6,6]}
    ]
  };
  const audit=auditRow(row);
  assert.equal(audit.singleEpisode,false);
  assert.equal(audit.visibleSourceDealEpochs,2);
  assert.equal(audit.reverseNativeClockRoots.length,1);
  assert.equal(audit.crossEpochBilateralAllowed,false);
});

test('corrupted digest, missing after-turn and hidden-field leakage are vetoed',()=>{
  const row=fixture();
  const altered=structuredClone(row);
  altered.rootActionLedger[1].turnAfter=2;
  assert.throws(()=>auditRow(altered),/digest differs/);
  const missing=structuredClone(row);
  delete missing.rootActionLedger[1].turnAfter;
  missing.rootActionLedgerSha256=digest(missing.rootActionLedger);
  assert.throws(()=>auditRow(missing));
  const privateCards=structuredClone(row);
  privateCards.rootActionLedger[0].opponentHand=['secret'];
  privateCards.rootActionLedgerSha256=digest(privateCards.rootActionLedger);
  assert.throws(()=>auditRow(privateCards),/nonpublic or unknown field/);
});

test('unmarked native reverse clock and copied deal hashes fail closed',()=>{
  const row=fixture();
  row.rootActionLedger[1].turnBefore=1;
  row.rootActionLedger[0].turnAfter=1;
  row.rootActionLedger[1].turnAfter=0;
  row.rootActionLedgerSha256=digest(row.rootActionLedger);
  assert.throws(()=>auditRow(row),/matching actual engine reset markers/);
  row.suddenDeathClockResets=[{
    actionOrdinal:1,fromTurn:1,toTurn:0,
    afterSuddenDeath:true,enteredSetup:true
  }];
  row.sourceDealEpochs.recordedNativeRestarts=1;
  row.sourceDealEpochs.recordedOpeningDeals=2;
  row.sourceDealEpochs.deals.push({
    episodeIndex:1,sourceDealDigestSha256:h3,
    fullPhysicalDealDigestSha256:h2,initialPrizeCounts:[6,6]
  });
  assert.throws(()=>auditRow(row),/independently identifiable physical deal/);
});

test('failure rows lacking a preserved Store ledger remain explicitly censored',()=>{
  const a=fixture();
  const b={trial:{id:'other-arm'},status:'engine-error'};
  const output=auditArchive({attempted:2,rows:[a,b]});
  assert.equal(output.rootsVerified,1);
  assert.deepEqual(output.rowsWithoutFullRoots,
    [{trialId:'other-arm',status:'engine-error'}]);
  assert.equal(output.competitiveQualifiedGames,0);
});
