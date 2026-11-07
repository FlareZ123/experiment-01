'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const VERSION='agent35-v9-physical-powerglass-prize-pair-v1';

/** @param {object} control Existing native v9 Lillie-only JSON. @param {object} treatment Native Lillie+Powerglass JSON. */
function auditPair(control,treatment){
  const a=control.nativeAttempt,b=treatment.nativeAttempt;
  const same=['id','sourceSeat','candidateSeat','actualFirstPlayerSeat',
    'sourceDeckFingerprint','candidateDeckFingerprint',
    'sourceDealFingerprint','fullPhysicalDealFingerprint'];
  for(const k of same)assert.deepEqual(a[k],b[k],'same physical deal and deck '+k);
  assert.equal(a.sourceSeat,0);assert.equal(a.candidateSeat,1);
  assert.equal(a.status,'native-terminal-unqualified');
  assert.equal(a.finished,true);assert.equal(a.winner,0);
  assert.equal(b.status,'root-cap-unqualified');
  assert.equal(b.finished,false);assert.equal(b.winner,null);
  assert.deepEqual(a.rootActionLedger.slice(0,98),b.rootActionLedger.slice(0,98),
    'first 98 native accepted roots must match exactly');
  const at=(arr,n)=>arr.find(x=>x.actionOrdinal===n);
  assert.equal(at(a.rootActionLedger,98)?.action,'PassTurnAction');
  assert.equal(at(b.rootActionLedger,98)?.action,'PlayCardAction');
  assert.equal(at(b.rootActionLedger,98)?.card,'Powerglass');
  assert.equal(at(b.rootActionLedger,100)?.pendingPrompt,'AttachEnergyPrompt');
  assert.equal(at(b.rootActionLedger,103)?.attack,'Super Poison Breath');
  assert.equal(at(b.rootActionLedger,107)?.attack,'Hidden Power');
  assert.equal(at(b.rootActionLedger,109)?.pendingPrompt,'AttachEnergyPrompt');
  assert.equal(at(b.rootActionLedger,110)?.pendingPrompt,'ChoosePrizePrompt');
  assert.equal(at(b.rootActionLedger,111)?.pendingPrompt,'ChoosePokemonPrompt');
  assert.equal(at(b.rootActionLedger,118)?.attack,'Hidden Power');
  const ko=b.candidateAttackSettlement?.attacks?.find(x=>x.actionOrdinal===107);
  assert.ok(ko?.settledPromptChain&&ko?.nextSourceSameEpochProven);
  assert.deepEqual(ko.prizesBefore,[5,6]);
  assert.deepEqual(ko.prizesAfter,[5,5]);
  assert.equal(ko.publicBoardBefore[0].active.printing,'Trubbish FST');
  assert.equal(ko.publicBoardBefore[0].active.damage,60);
  assert.equal(ko.publicBoardAfter[0].active.printing,'Tapu Lele-GX GRI');
  assert.equal(ko.publicBoardAfter[1].active.printing,'Unown AOR');
  assert.equal(ko.publicBoardAfter[1].active.energyCards.length,2);
  assert.deepEqual(ko.publicBoardAfter[1].active.toolCards,['Powerglass']);
  const tool=treatment.nativeAdapterAudit?.agent35Powerglass;
  assert.equal(tool?.rootAccepted,1);
  assert.equal(tool?.rootRejected,0);
  assert.equal(tool?.promptAccepted,2);
  assert.equal(tool?.attachedFromDiscard,2);
  assert.equal(tool?.opponentConcealedRead,false);
  assert.equal(tool?.ownerDeckIdentityRead,false);
  assert.deepEqual(a.finalPrizes,[0,6]);
  assert.deepEqual(b.finalPrizes,[4,5]);
  assert.equal(b.rootActionCount,260);
  const attacks=roots=>roots.filter(x=>x.playerSlot===1&&
    x.action==='AttackAction'&&x.actionOrdinal>93).length;
  return {schema:VERSION,firstIdenticalNativeRoots:98,
    sourceDealFingerprint:b.sourceDealFingerprint,
    fullPhysicalDealFingerprint:b.fullPhysicalDealFingerprint,
    nativeObserved:'Powerglass98 -> discard Psychic100 -> source attack103 -> Unown KO107 -> Psychic109 -> Prize110 and promotion111',
    candidatePrizesBeforeAfterKO:[6,5],
    candidatePostLillieAttackCount:{
      control:attacks(a.rootActionLedger),
      powerglass:attacks(b.rootActionLedger)},
    rootCapWithoutWinner:true,finalRemainingPrizes:b.finalPrizes,
    physicallyAcceptedToolCount:tool.rootAccepted,
    physicallyAcceptedBasicEnergyTransfers:tool.attachedFromDiscard,
    sourceCompetitivePolicyVerified:false,
    paperOrderVerified:false,confirmedMatchupWins:0};
}
if(require.main===module){
  assert.equal(process.argv.length,4,
    'Provide two extracted JSON files in control/treatment order');
  const [p,q]=process.argv.slice(2);
  const read=x=>fs.readFileSync(x);
  const report={
    artifactSha256:{
      control:crypto.createHash('sha256').update(read(p)).digest('hex'),
      powerglass:crypto.createHash('sha256').update(read(q)).digest('hex')
    },
    ...auditPair(JSON.parse(read(p)),JSON.parse(read(q)))
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,auditPair};
