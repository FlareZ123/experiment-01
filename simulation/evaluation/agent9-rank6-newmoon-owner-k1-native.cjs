'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {developmentTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {withOwnerDeckSearchWitness}=
  require('../twinleaf/owner-deck-search-witness.cjs');
const {inferOwnerPrizesAtSearch}=
  require('../twinleaf/owner-k1-prize-inference.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Replay one previously registered real source-dealt rank6 New Moon censor.
 * First owner deck-search inference is genuinely legal to the candidate;
 * the observer must not change either actor's actual Store decisions.
 * @returns {object}
 */
function main(){
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const manifest=loadNewMoonCandidate();
  const plan=planAichi({label:'new-moon-lockbreaker-v1',cards:manifest.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const candidatePrinting=plan.candidate.cards
    .filter(name=>name.startsWith('Mewtwo & Mew-GX '));
  assert.ok(candidatePrinting.length>=1,'Expected a printed Mewtwo donor');
  const map=new Map([['new-moon-lockbreaker-v1',{plan}]]);
  const trial=developmentTrials().find(row=>
    row.rank===6&&row.candidateId==='new-moon-lockbreaker-v1');
  assert.ok(trial);
  assert.equal(trial.candidateSlot,'A');
  const candidateSeat=0;
  const options={paperSupporterQuota:true};
  const execute=()=>executeDevelopment(trial,map,options);
  const baseline=execute();
  const ownerSearchInferences=[];
  const observed=withOwnerDeckSearchWitness(
    Store,candidateSeat,candidatePrinting,execute,
    ({owner,prompt,rootOrdinal,globalTurn})=>{
      const inferred=inferOwnerPrizesAtSearch({
        owner,prompt,registered:plan.candidate.cards
      });
      const counts=Object.fromEntries(inferred.inferredPrizePrintings.map(
        item=>[item.printing,item.copies]));
      const mewtwoRemainingInDeck=prompt.cards.cards.filter(card=>
        candidatePrinting.includes(card.fullName)).length;
      ownerSearchInferences.push({
        globalTurn,rootOrdinal,
        ownerDeckCount:inferred.ownerVisibleDeckCount,
        remainingPrizeCount:inferred.prizeCount,
        mewtwoInOwnerDeck:mewtwoRemainingInDeck,
        mewtwoInferredPrized:candidatePrinting.reduce(
          (n,printing)=>n+(counts[printing]??0),0),
        mewtwoOwnedVisibleZoneCounts:inferred.ownerVisibleZoneCounts,
        physicalPrizeInferenceComplete:true,
        inferredPrizeMultiset:inferred.inferredPrizePrintings
      });
    }
  );
  const replay=observed.result;
  assert.ok(ownerSearchInferences.length>0,
    'Expected candidate to resolve at least one real own-deck search');
  assert.equal(replay.rootActionLedgerSha256,baseline.rootActionLedgerSha256,
    'Read-only owner K1 inference perturbed actual Store root trace');
  assert.equal(replay.sourceDealFingerprint,baseline.sourceDealFingerprint);
  assert.equal(replay.actualStarterSeat,baseline.actualStarterSeat);
  assert.deepEqual(replay.finalPrizes,baseline.finalPrizes);
  assert.deepEqual(replay.attackDeclarations,baseline.attackDeclarations);
  assert.deepEqual(replay.candidateOwnDeckSelectionEvidence,
    baseline.candidateOwnDeckSelectionEvidence);
  assert.equal(replay.nativeSupporterQuotaQualified,true);
  assert.equal(baseline.nativeSupporterQuotaQualified,true);
  const report={
    schema:'agent9-rank6-newmoon-authenticated-first-owner-k1-prize-inference-v1',
    evidenceType:'same-deal-read-only-real-Store-retrospective-source',
    enginePin:PIN,researchRevision:process.env.GITHUB_SHA??null,
    trial:{id:trial.id,seed:trial.seed,sourceRank:6,
      candidate:trial.candidateId,candidateSeat},
    baseline:{
      sourcePhysicalDeal:baseline.sourceDealFingerprint,
      candidateActuallyFirst:baseline.actualStarterSeat===candidateSeat,
      rootSha256:baseline.rootActionLedgerSha256,
      rootActions:baseline.actionCount,finished:baseline.finished,
      actionCap:baseline.endReason,
      candidateAttackDeclarations:baseline.attackDeclarations.candidate,
      paperSupporterQuotaQualified:baseline.nativeSupporterQuotaQualified
    },
    observations:ownerSearchInferences,
    ownerNativePromptCount:observed.events.length,
    identicalGenuineRootTrace:true,
    identicalSourceDeal:true,
    competitiveQualifiedGames:0,
    caveat:'Only own registered 60 and card identities at real owner-deck prompt and own visible zones are used. Full inference may identify own Prize identities after the native search, never at K0. Selected 260-root old-policy censor, existing information-set/paper-clock/decision competence remains unqualified.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module) main();
module.exports={main};
