'use strict';

const assert = require('node:assert/strict');
const nodePath = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile} = require('./policy-profiles.cjs');
const {withRank26SourceSetup} = require('./agent3-rank26-energy-setup.cjs');
const {withDealFingerprint} = require('./rank26-natural-pre-koko-cologne-cohort.cjs');
const {withSourceCompressorSettlementAudit} = require('./agent3-compressor-discard-settlement.cjs');
const {withSourceCompressorRootProvenance} = require('./agent3-compressor-root-provenance-v3.cjs');
const {saveResult} = require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const SOURCE_RANK = 26;
const OPPONENT_RANK = 6;
const ORIGINAL_V2_SEED_BASE = 20261106;
const MAX_ACTIONS = 120;
const ENGINE = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT = 'agent3-rank26-compressor-v3-full-retrospective.json';

/**
 * Retrospectively rerun every original v2 physical source deal under its two
 * unchanged historical policy arms. A shadow observer reproduces the old broad
 * Store measurement, while a nested v3 observer restricts custody to actual
 * game Store, issuing owner PlayCardAction, matching unresolved prompt and
 * changed owner deck/discard card-object identities.
 *
 * Neither observer changes decisions or counts a competitive-quality game.
 * @returns {object} Full original-source attempted-arm ledger
 */
function run() {
  initializeCards();
  const field=planAichi(SOURCE_RANK,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=field.candidate.cards;
  const opponent=field.opponents.find(x=>x.rank===OPPONENT_RANK)?.cards;
  assert.equal(source.length,60);
  assert.equal(opponent?.length,60);
  const deals=[];
  const seenSeeds=new Set();

  for(let repeat=72;repeat<=83;repeat++) {
    const seeds=deriveSlotSeeds(ORIGINAL_V2_SEED_BASE,'pilot',SOURCE_RANK,repeat);
    for(const [slot,seat,seed] of [['A',0,seeds.A],['B',1,seeds.B]]) {
      assert.ok(Number.isSafeInteger(seed) && seed>0 && !seenSeeds.has(seed));
      seenSeeds.add(seed);
      const deckA=seat===0?source:opponent;
      const deckB=seat===1?source:opponent;
      const request={
        deckA,deckB,rank26SourceSeat:seat,seed,maxActions:MAX_ACTIONS,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        captureDecisionTrace:true,battleCompressorPositiveSelectionCorrection:true,
        forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'agent3-rank26-compressor-physical-v2-'+repeat+'-'+slot
      };
      const arms=[];
      for(const arm of ['baseline','treatment']) {
        const observed=withDealFingerprint(()=>
          withSourceCompressorSettlementAudit(seat,()=>
            withSourceCompressorRootProvenance(seat,()=>
              arm==='baseline'?
                runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE):
                withRank26SourceSetup(seat,()=>
                  runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)))));
        const oldAudit=observed.result?.audit??null;
        const newAudit=observed.result?.result?.audit??null;
        const inner=observed.result?.result?.result??null;
        const game=arm==='treatment'?inner?.result:inner;
        const actions=(game?.decisionTrace??[]).filter(x=>
          x.playerSlot===seat && x.turnBefore===1);
        const receipts=(newAudit?.receipts??[]).map(r=>({
          turn:r.globalTurn,paperMinimumMet:r.paperMinimumMet,
          originatingCard:r.sourceCard,
          moved:r.physicallyMoved
        }));
        arms.push({
          arm,physicalRoot:observed.physicalRoot?.digestSha256??null,
          liveRootIdentified:observed.liveRootIdentified,
          error:observed.error,sourceFirst:game?.firstTurnSlot===seat,
          originalSourcePlayCards:actions.filter(x=>x.action==='PlayCardAction').map(x=>x.card),
          originalSourceFirstTurnBattleCompressorPlays:actions.filter(x=>
            x.action==='PlayCardAction' && x.card==='Battle Compressor').length,
          originalSourceFirstTurnCrisisPunches:actions.filter(x=>
            x.action==='AttackAction' && x.attack==='Crisis Punch').length,
          nativeTerminal:game?.finished===true,
          oldSpeculativeObserver:{
            positiveResolutions:oldAudit?.acceptedPositiveResolutions??null,
            prompts:oldAudit?.sourcePromptResolutions??null,
            movedCards:oldAudit?.physicalMovedCopies??null
          },
          actualStoreV3:{
            identified:newAudit?.liveRootIdentified??false,
            simulatedDispatchesIgnored:newAudit?.ignoredSpeculativeDispatches??null,
            cardPlayProposals:newAudit?.selectedSourcePlays??null,
            cardPlaysAccepted:newAudit?.acceptedSourcePlays??null,
            newlyIssuedPrompts:newAudit?.linkedPromptsIssued??null,
            positiveSettlements:newAudit?.positiveLinkedSettlements??null,
            receipts
          },
          competitivelyQualified:false
        });
      }
      deals.push({
        repeat,slot,seat,seed,
        physicalPair:arms[0].physicalRoot && arms[1].physicalRoot ?
          (arms[0].physicalRoot===arms[1].physicalRoot?
            'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT'):'UNVERIFIED',
        arms
      });
    }
  }
  const armRows=deals.flatMap(d=>d.arms);
  const sourceFirstDeals=deals.filter(d=>d.arms.every(a=>a.sourceFirst===true));
  const sourceFirstRows=sourceFirstDeals.flatMap(d=>d.arms);
  const sum=(rows,fn)=>rows.reduce((n,x)=>n+fn(x),0);
  const byArm=(arm,fn)=>sum(sourceFirstRows.filter(x=>x.arm===arm),fn);
  const summary={
    sourceDeals:deals.length,nativeAttempts:armRows.length,
    exactPhysicalPairs:deals.filter(d=>d.physicalPair==='EXACT_SOURCE_DEAL_MATCH').length,
    sourceFirstDeals:sourceFirstDeals.length,
    errors:armRows.filter(x=>x.error).length,
    baselineFirstTurnCardPlays:byArm('baseline',x=>
      x.originalSourceFirstTurnBattleCompressorPlays),
    treatmentFirstTurnCardPlays:byArm('treatment',x=>
      x.originalSourceFirstTurnBattleCompressorPlays),
    baselineOldObserverPositives:byArm('baseline',x=>
      x.oldSpeculativeObserver.positiveResolutions??0),
    treatmentOldObserverPositives:byArm('treatment',x=>
      x.oldSpeculativeObserver.positiveResolutions??0),
    baselineLiveRootPositives:byArm('baseline',x=>
      x.actualStoreV3.positiveSettlements??0),
    treatmentLiveRootPositives:byArm('treatment',x=>
      x.actualStoreV3.positiveSettlements??0),
    ignoredSpeculativeDispatches:sum(armRows,x=>
      x.actualStoreV3.simulatedDispatchesIgnored??0),
    competitiveQualifiedGames:0
  };
  return {
    schema:'agent3-rank26-compressor-full-retrospective-source-v3',
    interpretation:'historical 20261106 seed replay, zero new independent games',
    originalSourceRank:SOURCE_RANK,opponentRank:OPPONENT_RANK,
    originalSourceCardCount:60,originalOpponentCardCount:60,
    engineRevision:ENGINE,sourceProfile:RANK26_PROPAGATION_PROFILE,
    seedBase:ORIGINAL_V2_SEED_BASE,repeats:[72,83],
    actorPolicy:'unchanged original v2 baseline and optional source setup arms',
    summary,deals
  };
}

module.exports={run};
if(require.main===module) {
  const result=run();
  saveResult(nodePath.resolve(process.cwd(),OUTPUT),result);
  process.stdout.write('FULL_RETROSPECTIVE_NATIVE '+JSON.stringify(result.summary)+'\n');
  if(result.summary.sourceDeals!==24 ||
     result.summary.nativeAttempts!==48 ||
     result.summary.exactPhysicalPairs!==24 ||
     result.summary.sourceFirstDeals!==14 ||
     result.summary.errors!==0) process.exitCode=1;
}
