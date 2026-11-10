'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {summarizePhysicalZoneTransfers,attackTransferWindows}=
  require('./agent13-root-zone-transfers.cjs');

const ARCHIVE_SHA256=
  '1a46860dfb1b2953f97b4ba75afffb6552ebd4e11588da0ec02f2f14ff2387fd';
const REGISTRATION_SHA256=
  '4b1c51f6162cda8e585440349396560f7ac23f4442ea039e80abba781848473a';

/**
 * Independently account for every physical move in the first prospective
 * original-rank5 game. A hand index shuffle is never a new card transfer.
 * @param {object} doc Exact immutable native game artifact.
 * @returns {object} Concise physical transfer and causal attack audit.
 */
function audit(doc){
  assert.equal(doc.schema,'agent13-prospective-full-paper-native-source-rank5-v1');
  assert.equal(doc.registrationSha256,REGISTRATION_SHA256);
  assert.equal(doc.trial.id,'5:513001:A:new-moon-lockbreaker-v1');
  assert.equal(doc.status,'native-terminal');
  assert.equal(doc.nativeWinner,0);
  assert.equal(doc.nativeFinished,true);
  assert.equal(doc.qualifiedGame,false);
  assert.equal(doc.paperQualifiedGames,0);
  assert.deepEqual(doc.remainingPrizes,[0,6]);
  assert.equal(doc.fullNativePaperRootReceipts?.settledPhysicalIdentityClean,true);
  assert.equal(doc.fullNativePaperRootReceipts.acceptedStoreRootCount,128);
  assert.equal(doc.exactAcceptedRoots.length,128);
  const physical=summarizePhysicalZoneTransfers(
    doc.fullNativePaperRootReceipts);
  const causal=attackTransferWindows(
    doc.exactAcceptedRoots,doc.nativeAttackModalityLedger,physical);
  assert.equal(physical.originalPhysicalCardCount,120);
  assert.equal(physical.rootCount,128);
  assert.equal(physical.trueZoneTransfers,128);
  assert.equal(physical.withinZoneReorders,1863);
  assert.equal(physical.temporaryUnaccountedIdentityEvents,0);
  assert.equal(physical.crossSeatPhysicalMovements,0);
  assert.equal(physical.prizeCardsMovedToOwnerHand,6);
  assert.equal(physical.energyDeckAttachments,2);
  assert.equal(physical.timeline[97].rawChangedPhysicalCards,25);
  assert.equal(physical.timeline[97].withinZoneReorders,24);
  assert.equal(physical.timeline[97].zoneTransferCount,1);
  assert.equal(physical.timeline[107].rawChangedPhysicalCards,7);
  assert.equal(physical.timeline[107].withinZoneReorders,6);
  assert.equal(physical.timeline[107].zoneTransferCount,1);
  assert.deepEqual(physical.timeline
    .filter(x=>x.energyDeckAttachments.length).map(x=>({
      root:x.rootOrdinal,
      energy:x.energyDeckAttachments[0].printing,
      destination:x.energyDeckAttachments[0].toZone
    })),[
      {root:97,energy:'Double Colorless Energy SUM',
        destination:'s1.bench0'},
      {root:107,energy:'Double Colorless Energy SUM',
        destination:'s1.bench2'}
    ]);
  const windows=causal.windows.map(w=>({
    root:w.initiatingRootOrdinal,turn:w.turnBefore,
    actorSeat:w.actorSeat,ordinaryAttackName:w.ordinaryAttackName,
    copiedAttackName:w.copiedAttackName,
    claimedPrizeCards:w.prizeClaims,
    zoneTransfers:w.collectedZoneTransfers,
    observedPrizes:w.physicalPrizeChangeFromSeparateObserver,
    consistency:w.prizeObserversAgree,
    energyDeckAttachments:w.energyAttachmentsFromDeck.map(x=>({
      printing:x.printing,destination:x.toZone
    }))
  }));
  assert.deepEqual(windows.map(x=>x.root),[88,95,101,105,111,126]);
  assert.deepEqual(windows.map(x=>x.claimedPrizeCards),[2,0,0,0,3,1]);
  assert.ok(windows.every(x=>x.consistency===true),
    'Full physical movement Prize claims must agree with independently captured prize snapshots');
  assert.deepEqual(windows.filter(x=>x.actorSeat===1)
    .map(x=>x.copiedAttackName),['Energy Mix','Energy Mix']);
  assert.equal(doc.nativeAttackModalityLedger.ordinaryRootAttackInitiations,6);
  assert.equal(doc.nativeAttackModalityLedger.perfectionInitiations,0);
  assert.equal(doc.nativeAttackModalityLedger.paperPaymentCertified,false);
  return {
    schema:'agent13-prospective-physical-zone-transfer-audit-v1',
    originalArchiveSha256:ARCHIVE_SHA256,
    registrationSha256:REGISTRATION_SHA256,
    trialId:doc.trial.id,
    status:doc.status,nativeWinner:doc.nativeWinner,
    nativeGameRoots:doc.exactAcceptedRoots.length,
    originalPhysicalCards:physical.originalPhysicalCardCount,
    rootLinkedFullPhysicalReceipts:physical.rootCount,
    fullOriginalIdentityConservation:physical.completeOriginalFullPhysicalCustodyClaim,
    trueZoneTransfers:physical.trueZoneTransfers,
    withinZonePositionReorders:physical.withinZoneReorders,
    temporaryUnaccountedIdentityEvents:
      physical.temporaryUnaccountedIdentityEvents,
    opponentPhysicalCardsCrossedSeats:physical.crossSeatPhysicalMovements,
    prizeCardsClaimed:physical.prizeCardsMovedToOwnerHand,
    energyDeckAttachments:physical.energyDeckAttachments,
    copiedOrdinaryRootAttackPrompts:
      windows.filter(x=>x.copiedAttackName!==null).map(x=>({
        root:x.root,actorSeat:x.actorSeat,
        action:x.ordinaryAttackName,sourceAttack:x.copiedAttackName
      })),
    attackPhysicalTransferWindows:windows,
    allAttackPrizeClaimsConsistent:true,
    paperPaymentCertified:false,officialClockVerified:false,
    competitiveGamesQualified:0
  };
}

function main(file){
  assert.equal(typeof file,'string');
  const bytes=fs.readFileSync(file);
  const digest=createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest,ARCHIVE_SHA256,
    'Downloaded native original JSON archive changed bytes');
  const output=audit(JSON.parse(bytes.toString('utf8')));
  process.stdout.write('AGENT13_PROSPECTIVE_PHYSICAL_TRANSFER_AUDIT '+
    JSON.stringify(output)+'\n');
  return output;
}

if(require.main===module)main(process.argv[2]);
module.exports={ARCHIVE_SHA256,REGISTRATION_SHA256,audit,main};
