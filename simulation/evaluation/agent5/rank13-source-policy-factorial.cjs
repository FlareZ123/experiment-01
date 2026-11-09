'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent32-prospective-vip-perfection-transition-20261108.json');
const {runNativeBatch,summarizeRow}=
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {withSourceOwnerTrainerPassAudit}=
  require('../../twinleaf/agent5/rank13-owner-pass-trainers.cjs');
const {firstRootDivergence}=
  require('../agent24-v8-perfection-paired-native.cjs');

const SOURCE_DECKS=require('../../../results/aichi-2026/full-decklists.json');
const SOURCE_TRAINER_NAMES=new Set(SOURCE_DECKS.decks
  .find(deck=>deck.rank===13).cards
  .filter(card=>card.category==='Trainer').map(card=>card.name));

const VERSION='agent5-rank13-owner-search-energy-factorial-v3';
const TARGET='13:2026:A:new-moon-lockbreaker-v1';
const OUTPUT=path.resolve(__dirname,
  '../../../artifacts/agent5-rank13/source-policy-four-cell.json');

/**
 * Identify the first *accepted native* action affected by the opponent
 * challenger. A flag with no original-source action difference is inactive.
 * @param {object[]} attempts Original 2x2 physical comparison cells.
 * @returns {object[]}
 */
function sourcePolicyDifferences(attempts){
  assert.equal(attempts.length,4);
  return [false,true].map(pivot=>{
    const control=attempts.find(x=>!x.sourceChallenger&&
      x.candidatePaidPivot===pivot);
    const challenged=attempts.find(x=>x.sourceChallenger&&
      x.candidatePaidPivot===pivot);
    assert.ok(control&&challenged);
    const first=firstRootDivergence(
      control.acceptedNativeRoots??[],challenged.acceptedNativeRoots??[]);
    const sourceOwned=first.ordinal!==null&&
      (first.baseline?.playerSlot===1||first.treatment?.playerSlot===1);
    return {
      candidatePaidPivot:pivot,
      firstNativeRootDifference:first,
      sourceOwnedFirstDifference:sourceOwned,
      sourcePolicyChangedAnAcceptedNativeRoot:sourceOwned
    };
  });
}

/**
 * Four developmental reproductions of one *historically exposed* real
 * original-source physical deal. One source policy changes only on actual
 * held/payable owner cards, with all native payments and prompts adjudicated
 * by the pinned Store. It is not a prospective win-rate sample.
 *
 * @param {{execute?:(pivot:boolean,source:boolean,group:object)=>object}} [deps]
 */
function run(deps={}){
  assert.equal(registration.nativePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const group=registration.groups.find(row=>row.id===TARGET);
  assert.ok(group);
  assert.equal(group.rank,13);
  assert.equal(group.seed,269814871);
  assert.equal(group.candidateSlot,'A');
  const attempts=[];

  for(const source of [false,true]){
    for(const pivot of [false,true]){
      const execute=()=>deps.execute?
        deps.execute(pivot,source,group):
        runNativeBatch(true,options=>runDevelopment({
          ...options,
          // Both options are from existing native-tested original Regidrago
          // policies and are a single registered source-challenger bundle.
          mysteriousTreasureRoot:source,
          firstRegidragoBenchGrass:source,
          sourceScopedQuickBallRoot:source,
          // Identical real owner-hand payments and own-deck search closure
          // in all cells, as in the successful Agent8 source-search panel.
          actorOnlySingleSearch:true,
          actorHandDiscard:true
        }),{
          registeredTrials:[{...group}],
          registeredFrameName:registration.schema,
          singleHistoricalReplay:true,
          nativeRootActionLimit:registration.nativeRootLimit,
          vipAfterPass:true,vipPreferMewtwoDonor:true,
          perfectionTransition:pivot
        });
      const observed=withSourceOwnerTrainerPassAudit(execute,{
        sourceSeat:1
      });
      const raw=observed.result.selected.rawDevelopment.rows[0];
      assert.equal(raw.trial.id,TARGET);
      const row=summarizeRow(raw,true);
      const sourceActions=(row.rootActionLedger??[])
        .filter(a=>a.playerSlot===1&&
          ['PlayCardAction','AttackAction','UseAbilityAction'].includes(a.action));
      const ownTrainerPlays=sourceActions.filter(a=>
        a.action==='PlayCardAction'&&SOURCE_TRAINER_NAMES.has(a.card));
      attempts.push({
        sourceChallenger:source,candidatePaidPivot:pivot,
        id:row.id,rank:row.rank,seed:row.seed,
        originalSourceSeat:1,candidateSeat:0,
        status:row.status,finished:row.finished,winnerSeat:row.winner,
        candidateNativeWinner:row.status==='native-terminal'&&row.winner===0,
        nativeRootActions:row.rootActions,
        nativePrizesRemaining:row.remainingPrizes,
        error:row.error,
        sourceActualActions:sourceActions,
        sourcePotentialTrainerPlays:ownTrainerPlays,
        sourcePassAudit:observed.audit,
        fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
        sourceDealFingerprint:row.sourceDealFingerprint,
        acceptedNativeRoots:row.rootActionLedger,
        competitivePaperQualified:false
      });
    }
  }
  assert.equal(attempts.length,4);
  const fixedDeal=attempts.every(a=>a.fullPhysicalDealFingerprint&&
    a.sourceDealFingerprint&&
    JSON.stringify(a.fullPhysicalDealFingerprint)===
      JSON.stringify(attempts[0].fullPhysicalDealFingerprint)&&
    JSON.stringify(a.sourceDealFingerprint)===
      JSON.stringify(attempts[0].sourceDealFingerprint));
  const prePivotSourcePass=attempts.map(a=>
    a.sourcePassAudit.events.find(e=>e.globalTurn===2)??null);
  const sourcePolicyCausalRoots=sourcePolicyDifferences(attempts);
  const result={
    version:VERSION,registration:registration.schema,
    originalSelectedRank13Deal:TARGET,
    cohort:'one retrospective historical physical deal, four-policy factorial',
    sourceChallenger:'original-source Quick Ball, Mysterious Treasure and Regidrago Bench Grass; constant owner-prompt resolution',
    candidateChallenger:'existing donor-funded native paid Perfection pivot',
    twinleafPin:registration.nativePin,
    physicalSixtiesUnchanged:true,
    fourCellFullPhysicalIdentityMatched:fixedDeal,
    prePivotT2SourcePasses:prePivotSourcePass,
    sourcePolicyCausalRoots,
    sourcePolicyActivatedOnOriginalSource:
      sourcePolicyCausalRoots.some(x=>x.sourceOwnedFirstDifference),
    attempts,
    independentPaperAcceptance:false,
    competitiveGamesQualified:0,
    estimatedWinRate:null
  };
  return result;
}

/** Locked exclusive atomic per-run file. */
function save(result){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx');
  const temp=OUTPUT+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return OUTPUT;
}

if(require.main===module){
  const report=run();
  const artifact=save(report);
  process.stdout.write(JSON.stringify({
    version:report.version,artifact,
    nativePhysicalMatched:report.fourCellFullPhysicalIdentityMatched,
    sourcePolicyRootActivations:report.sourcePolicyCausalRoots,
    outcomes:report.attempts.map(x=>({
      sourceChallenger:x.sourceChallenger,
      candidatePaidPivot:x.candidatePaidPivot,
      status:x.status,winnerSeat:x.winnerSeat,
      sourceActions:x.sourceActualActions.length,
      nativeRoots:x.nativeRootActions,
      sourceT2Hand:x.sourcePassAudit.events.find(e=>e.globalTurn===2)?
        'captured-owner-only':'not-exposed'
    })),
    competitiveGamesQualified:0
  },null,2)+'\n');
  if(!report.fourCellFullPhysicalIdentityMatched)process.exitCode=1;
}

module.exports={VERSION,TARGET,sourcePolicyDifferences,run,save};
