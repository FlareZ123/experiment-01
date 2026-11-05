'use strict';

const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const {TRIAL,EXPECTED}=require('./agent17-skyliner-reply-owner-pass-native.cjs');

const VERSION='agent17-original-rank1-after-Team-Flare-owner-recovery-pass-v1';
const TURNS=Object.freeze([60,62,64,66,68,70,72,74,76,78,80,82,84,86,88]);
const REFERENCE_ROOT=
  '2750bdc1f465e364ec7e0c4bfa221681c4394f29b02dd9ec80ed94f79d28de7d';

/** Independently observe genuine rank1 own-hand and board at 15 Pass roots. */
function run(){
  initializeCards();
  const cards=originals();
  const arm=runArm({...TRIAL,
    id:TRIAL.id+':source-TeamFlare-rank1-post-denial-own-Passes',
    targetedTeamFlareNative:true,captureOwnerPassSnapshots:true,
    captureOwnerPassSeat:1,captureOwnerPassTurns:[...TURNS]
  },cards);
  assert.equal(arm.status,'native-terminal');
  assert.equal(arm.winner,0);
  assert.equal(arm.fullDealSha256,EXPECTED.fullDeal);
  assert.equal(arm.rank3DealSha256,EXPECTED.sourceDeal);
  assert.equal(arm.rootLedgerSha256,REFERENCE_ROOT,
    'Retrospective owner observer changed original physical Team Flare experiment');
  const observed=arm.ownerPassFrontierAudit;
  assert.equal(observed?.rootOrdinalLinked,true);
  assert.deepEqual(observed.events.map(row=>row.globalTurn),[...TURNS]);
  assert.ok(observed.events.every(row=>row.actorSeat===1));

  const records=observed.events.map(row=>{
    const cards=row.actorHandPrintings;
    return {
      turn:row.globalTurn,
      genuineRoot:row.rootActionOrdinal,
      ownerHandSize:cards.length,
      ownerHandPrintings:cards,
      nativeBasicPsychicHeld:cards.filter(s=>s==='Psychic Energy MEE').length,
      ownActive:row.actorPublic.active?.printing??null,
      ownActiveEnergyPrintings:row.actorPublic.active?.energies??null,
      ownBench:row.actorPublic.bench.map(pokemon=>pokemon?
        {printing:pokemon.printing,energies:pokemon.energies,
          abilities:pokemon.abilities,tools:pokemon.tools}:null),
      ownActivePrintedAttacks:row.actorPublic.active?.attacks??null,
      ownSupporterQuota:row.actorTurnResources.supporterPlayedTurn,
      ownerPublicLock:row.actorPublic.publicTurnRestrictions,
      opponentActive:row.opponentPublic.active?.printing??null,
      candidateOwnerAlternativesPaperQualified:false
    };
  });
  const first=records[0];
  return {
    version:VERSION,sourceOriginalRank3:3,referenceOriginalRank1:1,
    originalSeed:TRIAL.seed,nativeResult:'original source rank3 wins after one accepted Team Flare root',
    originalPhysicalFullDeal:arm.fullDealSha256,
    targetNativeLedgerSha256:arm.rootLedgerSha256,
    identicalPostdecisionRootHistory:true,
    observedRank1PassCount:records.length,
    earliestPostDenialRank1Pass:first,
    rank1PassOwnerSnapshots:records,
    nativeRank1TotalAttackRoots:arm.rank1AttackCount,
    finalNativeTerminal:arm.nativeTerminal,
    rank1PolicyCompetenceUnproven:true,
    nativeStoreRetrospectiveOnly:true,
    competitiveGamesQualified:0
  };
}

if(require.main===module){
  try{
    process.stdout.write(JSON.stringify(run())+'\n');
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'native-source-replay-abort',
      error:String(error?.stack??error).slice(0,5000),
      competitiveGamesQualified:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,TURNS,REFERENCE_ROOT,run};
