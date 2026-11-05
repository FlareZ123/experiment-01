'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const {SEEDS,pairGroup,summarizeGroups}=require(
  './agent6-rank1-rank3-energy-recipient-aba.cjs');
const {FROZEN}=require(
  './agent2-original-recipient-skyliner-effective-retreat.cjs');

const VERSION='agent2-original-eight-bilateral-skyliner-free-retreat-aba-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Certify public native Store transfer of the original Active after a typed
 * RetreatAction: old Active moves into a Bench slot, no Energy leaves if
 * the actor's Skyliner plan was indeed costless.
 * @param {object} e Actual native accepted Store sidecar root.
 * @returns {object|null} Physical board receipt or null.
 */
function freeRetreatReceipt(e){
  if(e?.storeAccepted!==true||e.action!=='RetreatAction'||
     e.declared?.kind!=='retreat'||e.declared.status!=='captured'||
     e.visibility!=='public-after-dispatch'||
     !Array.isArray(e.publicBoardChanges))return null;
  const active=e.publicBoardChanges.find(c=>
    c.seat===e.playerSlot&&c.position==='active'&&
    c.before?.pokemon&&c.after?.pokemon&&
    c.before.pokemon!==c.after.pokemon);
  if(!active)return null;
  const retired=e.publicBoardChanges.find(c=>
    c.seat===e.playerSlot&&c.position==='bench'&&
    c.after?.pokemon===active.before.pokemon);
  if(!retired||!Array.isArray(active.before.energies)||
     !Array.isArray(retired.after.energies))return null;
  const debit=active.before.energies.length-
    retired.after.energies.length;
  return {
    ownerSeat:e.playerSlot,turn:e.turnBefore,
    authenticRootOrdinal:e.rootActionOrdinal??null,
    sourceActive:active.before.pokemon,
    promotedActive:active.after.pokemon,
    plannedBenchIndex:e.declared.benchIndex,
    observedEnergyCardDebit:debit,
    nativeFreePhysicalRetreat:debit===0,
    actualStoreAccepted:e.storeAccepted,
    paperFullLegalityCertified:false
  };
}

/**
 * Locate actual same-turn native source attack and first genuine opponent
 * post-retreat decision, excluding setup/prompt acknowledgments.
 * @param {object} retreat Accepted physical-retreat receipt.
 * @param {object[]} roots Original native action-ledger records.
 * @returns {object} Exact ordinal and first follow-through observations.
 */
function followThrough(retreat,roots){
  const root=roots.find(x=>x.action==='RetreatAction'&&
    x.actionOrdinal===retreat.authenticRootOrdinal);
  if(!root)return {
    actualRetreatRootFound:false,attackedSameTurn:false,
    opponentMeaningfulReplyObserved:false
  };
  const nextAttack=roots.find(x=>x.actionOrdinal>root.actionOrdinal&&
    x.playerSlot===retreat.ownerSeat&&x.turnBefore===root.turnBefore&&
    x.action==='AttackAction');
  const later=roots.find(x=>x.actionOrdinal>root.actionOrdinal&&
    x.playerSlot!==retreat.ownerSeat&&
    x.turnBefore>root.turnBefore&&
    ['PlayCardAction','RetreatAction','AttackAction','PassTurnAction']
      .includes(x.action));
  return {
    actualRetreatRootFound:true,
    nativeRetreatRootOrdinal:root.actionOrdinal,
    actualSameTurnAttack:nextAttack?{
      ordinal:nextAttack.actionOrdinal,action:nextAttack.action,
      turn:nextAttack.turnBefore
    }:null,
    attackedSameTurn:Boolean(nextAttack),
    firstOpponentMeaningfulPostRetreatRoot:later?{
      ordinal:later.actionOrdinal,turn:later.turnBefore,action:later.action
    }:null,
    opponentMeaningfulReplyObserved:Boolean(later)
  };
}

/** @returns {object} All eight original A/B/A physical matches, failure-inclusive. */
function run(){
  initializeCards();
  const cards=originals();
  assert.equal(digest(cards.source),SOURCE);
  assert.equal(digest(cards.candidate),REFERENCE);
  assert.deepEqual(SEEDS,[3565472974,130758722,3792360798,1654918696]);
  const prior=[
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ];
  const groups=[];
  try{
    for(const [key] of prior)process.env[key]='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const arms=[
          {name:'recipient-control',mode:'control'},
          {name:'skyliner-free-pivot',mode:'bilateral-skyliner-free-retreat'},
          {name:'recipient-control-repeat',mode:'control'}
        ].map(spec=>runArm({
          id:[seed,rank3Seat,spec.name].join(':'),
          seed,rank3Seat,mode:spec.mode,
          energyRecipient:true,captureTargets:true
        },cards));
        groups.push({seed,rank3Seat,arms});
      }
    }
  }finally{
    for(const [key,value] of prior){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const paired=groups.map(g=>pairGroup(g.arms));
  const outcomes=groups.map((g,index)=>{
    const [a,b,c]=g.arms;
    const source=FROZEN.find(x=>x[0]===g.seed&&x[1]===g.rank3Seat);
    assert.ok(source);
    const exactArchivedA=a.status==='native-terminal'&&
      a.fullDealSha256===source[2]&&
      a.rank3DealSha256===source[3]&&
      a.rootLedgerSha256===source[4]&&
      a.rootLedgerSha256===c.rootLedgerSha256;
    const actions=b.rootActionLedger??[];
    const witnessed=(b.nativeAcceptedTargetSidecar?.events??[])
      .map(freeRetreatReceipt).filter(Boolean)
      .map(receipt=>({...receipt,followThrough:followThrough(
        receipt,actions)}));
    const offers=b.genericAudit?.proposals??[];
    return {
      seed:g.seed,rank3Seat:g.rank3Seat,
      matchedSourceOriginal60:SOURCE,
      matchedReferenceOriginal60:REFERENCE,
      frozenPriorAExact:exactArchivedA,
      A_B_A_InitialPhysicalMatched:
        paired[index].matchedAuthenticInitialPhysicalDeal,
      A_Aprime_RootLedgerExact:paired[index].exactControlRepeat,
      allArmsNativeTerminals:g.arms.every(x=>x.status==='native-terminal'),
      controlWinner:a.winner,treatmentWinner:b.winner,
      controlRank1Attacks:a.rank1AttackCount,
      treatmentRank1Attacks:b.rank1AttackCount,
      controlRank3Attacks:a.rank3AttackCount,
      treatmentRank3Attacks:b.rank3AttackCount,
      originalPassesBySeat:b.genericAudit?.originalPassesBySeat??null,
      nominalOffersBySeat:b.genericAudit?.nominalOffersBySeat??null,
      nativeCostZeroBySeat:b.genericAudit?.nativeZeroCostBySeat??null,
      typedProposalsBySeat:
        b.genericAudit?.typedRetreatProposalsBySeat??null,
      treatmentPolicyReceipts:offers,
      acceptedNativeRetreatReceipts:witnessed,
      actualTreatmentNativeRetreatRoots:
        actions.filter(x=>x.action==='RetreatAction'),
      classification:paired[index].classification,
      actualGameStatus:[a.status,b.status,c.status],
      nativeErrors:g.arms.map(x=>x.error??null),
      qualifiedGames:0
    };
  });
  const arms=groups.flatMap(g=>g.arms);
  const totals=outcomes.reduce((sum,row)=>({
    ownerPasses:sum.ownerPasses+
      (row.originalPassesBySeat??[]).reduce((a,b)=>a+b,0),
    nominalOffers:sum.nominalOffers+
      (row.nominalOffersBySeat??[]).reduce((a,b)=>a+b,0),
    typedProposals:sum.typedProposals+
      (row.typedProposalsBySeat??[]).reduce((a,b)=>a+b,0),
    confirmedFreeNativeRetreats:sum.confirmedFreeNativeRetreats+
      row.acceptedNativeRetreatReceipts.filter(x=>x.nativeFreePhysicalRetreat).length,
    sameTurnNativeAttacks:sum.sameTurnNativeAttacks+
      row.acceptedNativeRetreatReceipts.filter(x=>
        x.followThrough.attackedSameTurn).length,
    opponentMeaningfulReplies:sum.opponentMeaningfulReplies+
      row.acceptedNativeRetreatReceipts.filter(x=>
        x.followThrough.opponentMeaningfulReplyObserved).length
  }),{ownerPasses:0,nominalOffers:0,typedProposals:0,
    confirmedFreeNativeRetreats:0,sameTurnNativeAttacks:0,
    opponentMeaningfulReplies:0});
  return {
    version:VERSION,pinnedTwinleaf:PIN,
    sourceOriginal60Sha256:SOURCE,referenceOriginal60Sha256:REFERENCE,
    sourcePreviouslyObservedSeedSeats:8,expectedArms:24,
    actualArms:arms.length,allOriginalArchivedControlsExact:
      outcomes.every(x=>x.frozenPriorAExact),
    A_B_A_PhysicalControlsPaired:
      paired.every(x=>x.classification==='paired-development'),
    nativeErrors:arms.filter(x=>x.status==='native-error').length,
    nativeCaps:arms.filter(x=>x.status==='native-cap').length,
    actualNativeSummary:summarizeGroups(paired),
    offerAndSettlementTotals:totals,
    outcomes,rawArms:arms,
    competitivelyQualifiedGames:0,
    limitations:[
      'Historical eight seed-seat groups already selected, no fresh independent cohort',
      'A native accepted retreat and settled attack may still be incomplete paper rules',
      'Only original ranks1/3, no competent opponent policy or 25-minute clock',
      'Three original field lists not yet admitted; no fixed 60 win-rate claim'
    ]
  };
}
if(require.main===module){
  try{
    const x=run();
    // Separately registered retrospective read-only replay of one known
    // positive historical case; preserve the frozen 24-arm native result.
    x.selectedCaseAttackTrace=require(
      './agent2-skyliner-retrospective-attack-trace.cjs').run();
    // Four pre-registered fresh OS-seeded physical source pairs, both seats;
    // separate future validation cohort, never pooled with selected evidence.
    x.independentFreshSkylinerCohort=require(
      './agent2-skyliner-fresh-independent-aba.cjs').run();
    process.stdout.write(JSON.stringify(x)+'\n');
    if(!x.allOriginalArchivedControlsExact||
       !x.A_B_A_PhysicalControlsPaired||
       x.actualArms!==24||x.nativeErrors>0||x.nativeCaps>0)
      process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'runner-failure',
      error:String(error?.stack??error).slice(0,6000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,freeRetreatReceipt,followThrough,run};
