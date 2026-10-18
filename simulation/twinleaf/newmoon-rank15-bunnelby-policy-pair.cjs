'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {observeSourceLock}=require('./newmoon-rank15-source-duallock-census.cjs');

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Report actual root-action attempts, separately from verified board states.
 * A declaration is not assumed to have resolved its intended evolution.
 *
 * @param {object} game Original headless game record
 * @param {number} seat Original physical rank15 seat
 * @returns {object}
 */
function rootPolicyTrace(game,seat) {
  const roots=game.rootActionLedger.filter(r=>r.playerSlot===seat);
  const evolutionRoots=roots.filter(r=>
    String(r.attack??'')==='Evolution' ||
    r.attackChoice?.attackName==='Evolution');
  const watched=['Tag Call','Guzma & Hala',
    'Technical Machine: Evolution','Jet Energy','Grand Tree'];
  const cardsPlayed=Object.fromEntries(watched.map(name=>
    [name,Object.entries(game.cardsPlayedBySeat[seat])
      .filter(([card])=>card.startsWith(name))
      .reduce((total,[,count])=>total+count,0)]));
  return {
    rootActions:roots.length,cardsPlayed,
    evolutionRootDecisions:evolutionRoots.map(r=>({
      actionOrdinal:r.actionOrdinal,turnBefore:r.turnBefore,
      action:r.action,attack:r.attack??null,
      choice:r.attackChoice?.attackName??null
    })).slice(0,12)
  };
}

/**
 * Compare eight original source deals under generic and source-aware
 * Bunnelby/TM Evolution policies. Each policy arm keeps its independently
 * observed true-start and complete prepolicy hidden-deal digest.
 */
function run() {
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const source=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===15);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const rows=[];
  for(let repeat=0;repeat<4;repeat++) {
    for(const candidateSeat of [0,1]) {
      const rank15Seat=1-candidateSeat;
      const seed=deriveSlotSeeds(20261018,'pilot',15,repeat)[
        candidateSeat===0?'A':'B'];
      const base={
        deckA:candidateSeat===0?candidate:source.cards,
        deckB:candidateSeat===1?candidate:source.cards,
        seed,maxActions:260,
        label:'rank15-bunnelby-tm-evolution-original-deal-policy-pair',
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        supporterDecisionCorrection:true,
        leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        isolatePolicyRandomness:true,
        pendingEndTurnSwitchCleanupCorrection:true,
        captureDecisionTrace:true
      };
      const sample=enabled=>observeSourceLock(Store,rank15Seat,candidateSeat,
        ()=>runMatch({...base,...(enabled?{
          bunnelbyK0SafeEvolution:true,
          bunnelbyObservedK1:true,
          bunnelbyTargetAwareEvolution:true,
          bunnelbyGuzmaHalaMode1:true,
          bunnelbyGuzmaHalaSearch:true
        }:{})}));
      const control=sample(false),evolution=sample(true);
      assert.equal(control.result.verifiedByDrawLog,true);
      assert.equal(evolution.result.verifiedByDrawLog,true);
      assert.ok(control.firstNormalTurnZoneDigest);
      assert.ok(control.firstNormalTurnPrizeGate);
      assert.ok(evolution.firstNormalTurnPrizeGate);
      assert.equal(control.firstNormalTurnZoneDigest,
        evolution.firstNormalTurnZoneDigest,
        'Policy arm changed the original first-turn physical deal');
      assert.deepEqual(control.firstNormalTurnPrizeGate,
        evolution.firstNormalTurnPrizeGate,
        'Policy arm changed the original physical Prize prerequisites');
      assert.equal(control.result.firstTurnSlot,
        evolution.result.firstTurnSlot,
        'Policy arm changed the original true starting player');
      assert.deepEqual(control.result.deckHashes,evolution.result.deckHashes);
      for(const observed of [control,evolution]){
        assert.ok(observed.rootSnapshots>0);
        assert.equal(observed.result.rootActionLedger.length,
          observed.result.actions);
      }
      const summarize=observed=>({
        finished:observed.result.finished,
        endReason:observed.result.endReason,
        rootActions:observed.result.actions,
        rootSnapshots:observed.rootSnapshots,
        first:observed.first,
        max:observed.max,
        firstNormalTurnPrizeGate:observed.firstNormalTurnPrizeGate,
        rootActionDigest:hash(observed.result.rootActionLedger),
        policyActions:rootPolicyTrace(observed.result,rank15Seat)
      });
      rows.push({
        repeat,seed,candidateSeat,rank15Seat,
        actualFirstSlot:control.result.firstTurnSlot,
        identicalPrepolicySourceDeal:true,
        originalSourceDealDigest:control.firstNormalTurnZoneDigest,
        deckHashes:control.result.deckHashes,
        generic:summarize(control),
        bunnelbyEvolution:summarize(evolution)
      });
    }
  }
  assert.equal(rows.length,8);
  const count=(arm,name)=>rows.filter(r=>r[arm].first[name]!==null).length;
  return {
    schema:'newmoon-rank15-authentic-bunnelby-opponent-policy-pair-v1',
    sourceRank:15,sourcePlayer:'Ryotaro Nozawa',
    candidate:'frozen-New-Moon-Lockbreaker-v1-English-mechanics-proxy-60',
    twinleafPin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seedPlan:'decorrelated-slots-v3; base 20261018, pilot rank15 repeats0..3, physical A/B',
    opportunityPairs:8,actualFirstCandidateCount:rows.filter(
      r=>r.actualFirstSlot===r.candidateSeat).length,
    sourceDeckAndInitialDealMatchedInEveryPair:true,
    sourcePrizePrerequisitesEligible:rows.filter(r=>
      r.generic.firstNormalTurnPrizeGate?.beforeTakingPrizesEligible===true).length,
    sourcePrizePrerequisitesUnavailable:rows.filter(r=>
      r.generic.firstNormalTurnPrizeGate?.beforeTakingPrizesEligible===false).length,
    generic:{aor:count('generic','aor'),
      bus:count('generic','bus'),dual:count('generic','dual')},
    bunnelbyEvolution:{aor:count('bunnelbyEvolution','aor'),
      bus:count('bunnelbyEvolution','bus'),dual:count('bunnelbyEvolution','dual')},
    policyDelta:'Opt-in source-aware K0 then witnessed own-deck K1 Bunnelby Evolution attack/second Barrage prompt, target-aware stage choice, Guzma & Hala mode-1 and own-deck resource selection',
    interpretation:'Both arms still generic SimpleTacticsAi except named Bunnelby policies; changed root decisions are diagnosed but no policy is independently competitive-qualified, no simulator winner admitted.',
    qualifiedForCompetitiveInference:false,
    rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={rootPolicyTrace,run};
