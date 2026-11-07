'use strict';
/**
 * Read-only audit of two actual compiled native Store receipts.
 * It consumes the post-game owner-only Pass frontier, not opponent hidden data.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const VERSION='agent35-v9-lillie-pair-root-and-pass-audit-v1';
const FIRST_DIFFERENCE=93;
const LILLIE="Lillie's Determination";

/** @param {object[]} roots Accepted Store actions. @param {number} seat */
function actionCounts(roots,seat){
  return {
    attacks:roots.filter(x=>x.playerSlot===seat&&x.action==='AttackAction').length,
    passes:roots.filter(x=>x.playerSlot===seat&&x.action==='PassTurnAction').length,
    energyPlays:roots.filter(x=>x.playerSlot===seat&&x.action==='PlayCardAction'&&
      typeof x.card==='string'&&x.card.endsWith(' Energy')).length,
    attacksAfterFirstDifference:roots.filter(x=>x.actionOrdinal>FIRST_DIFFERENCE&&
      x.playerSlot===seat&&x.action==='AttackAction').length
  };
}

/** @param {object} attempt Native attempt with genuine owner Pass receipts. */
function candidatePassEpisodes(attempt){
  const seat=attempt.candidateSeat;
  const receipts=attempt.nativeAllOwnerPassFrontier?.receipts;
  assert.ok(Array.isArray(receipts));
  return receipts.filter(r=>r.actorSeat===seat).map(r=>{
    const board=r.publicBoardBeforePass?.[seat];
    assert.ok(board);
    const spots=[board.active,...(board.bench??[])].filter(Boolean);
    assert.ok(spots.every(s=>Array.isArray(s.energyCards)));
    const hand=r.ownerHandAtChosenPass;
    assert.ok(Array.isArray(hand));
    return {
      ordinal:r.actionOrdinal,turn:r.turn,
      activePrinting:board.active?.printing??null,
      ownEnergyAttached:spots.reduce((sum,s)=>sum+s.energyCards.length,0),
      ownerHandCount:hand.length,
      heldSecretBox:hand.includes('Secret Box TWM'),
      heldLillie:hand.filter(x=>x==="Lillie's Determination M1L").length,
      heldBattleVipPass:hand.filter(x=>x==='Battle VIP Pass FST').length,
      heldEscapeRope:hand.includes('Escape Rope BST')
    };
  });
}

/** @param {object} baseline Full baseline JSON. @param {object} treatment Full treatment JSON. */
function compare(baseline,treatment){
  const A=baseline.nativeAttempt,B=treatment.nativeAttempt;
  for(const key of ['id','sourceSeat','candidateSeat','actualFirstPlayerSeat',
    'sourceDeckFingerprint','candidateDeckFingerprint','sourceDealFingerprint',
    'fullPhysicalDealFingerprint']){
    assert.deepEqual(A[key],B[key],'Same-deal or seat invariant: '+key);
  }
  assert.equal(A.candidateSeat,1);
  assert.equal(A.sourceSeat,0);
  for(const arm of [A,B]){
    assert.equal(arm.status,'native-terminal-unqualified');
    assert.equal(arm.finished,true);
    assert.equal(arm.winner,0);
    assert.equal(arm.rootActionLedger.length,arm.rootActionCount);
  }
  const a=A.rootActionLedger,b=B.rootActionLedger;
  assert.ok(a.length>FIRST_DIFFERENCE&&b.length>FIRST_DIFFERENCE);
  assert.deepEqual(a.slice(0,FIRST_DIFFERENCE),b.slice(0,FIRST_DIFFERENCE),
    'Accepted pre-intervention root prefix must match exactly');
  assert.equal(a[FIRST_DIFFERENCE].action,'PassTurnAction');
  assert.equal(b[FIRST_DIFFERENCE].action,'PlayCardAction');
  assert.equal(b[FIRST_DIFFERENCE].card,LILLIE);
  assert.equal(a[FIRST_DIFFERENCE].playerSlot,1);
  assert.equal(b[FIRST_DIFFERENCE].playerSlot,1);
  assert.equal(a[FIRST_DIFFERENCE].turnBefore,14);
  assert.equal(b[FIRST_DIFFERENCE].turnBefore,14);
  assert.ok(b.some(r=>r.actionOrdinal===95&&r.action==='ResolvePromptAction'&&
    r.pendingPrompt==='ShuffleDeckPrompt'&&r.initiatingRootActionOrdinal===93),
    'Actual Lillie shuffle prompt must settle');
  const audit=treatment.nativeAdapterAudit?.agent7LillieAfterPass;
  assert.equal(audit?.acceptedLillieRoots,1);
  assert.equal(audit?.rejectedLillieRoots,0);
  assert.deepEqual(audit.rootEvents?.map(x=>({seat:x.seat,turn:x.globalTurn,
    action:x.sourceAction,printing:x.chosenPrinting,accepted:x.StoreAccepted})),
    [{seat:1,turn:14,action:'PassTurnAction',
      printing:"Lillie's Determination M1L",accepted:true}]);
  const aPass=candidatePassEpisodes(A),bPass=candidatePassEpisodes(B);
  for(const [roots,episodes] of [[a,aPass],[b,bPass]]){
    assert.deepEqual(episodes.map(x=>x.ordinal),
      roots.filter(x=>x.playerSlot===1&&x.action==='PassTurnAction')
        .map(x=>x.actionOrdinal));
  }
  return {
    schema:VERSION,trialId:A.id,
    sharedPhysicalSourceDealSha256:A.sourceDealFingerprint,
    sharedFullPhysicalDealSha256:A.fullPhysicalDealFingerprint,
    firstDivergentOrdinal:FIRST_DIFFERENCE,
    identicalAcceptedPrefixLength:FIRST_DIFFERENCE,
    nativeLillieAccepted:true,nativeLillieShuffleRootAccepted:true,
    intervention:'Actor-owner both-seat Lillie replacing candidate Pass',
    baseline:{roots:A.rootActionCount,turns:A.turns,finalPrizes:A.finalPrizes,
      actions:actionCounts(a,1),candidatePassEpisodes:aPass},
    treatment:{roots:B.rootActionCount,turns:B.turns,finalPrizes:B.finalPrizes,
      actions:actionCounts(b,1),candidatePassEpisodes:bPass},
    retrospectiveAfterSourceExposure:true,
    noCompetitivelyQualifiedGames:true,
    opponentPolicyAndPaperRulesQualified:false,officialClockQualified:false
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,'Provide extracted baseline and treatment JSON');
  const [a,b]=process.argv.slice(2);
  const read=p=>fs.readFileSync(p);
  process.stdout.write(JSON.stringify({
    artifactSha256:{
      baseline:createHash('sha256').update(read(a)).digest('hex'),
      treatment:createHash('sha256').update(read(b)).digest('hex')
    },
    ...compare(JSON.parse(read(a)),JSON.parse(read(b)))
  },null,2)+'\n');
}
module.exports={VERSION,FIRST_DIFFERENCE,actionCounts,candidatePassEpisodes,compare};
