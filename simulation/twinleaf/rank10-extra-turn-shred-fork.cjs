'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {loadDefaultCampaign} = require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {unknown} x @returns {string} */
function sha(x) {
  return crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
}

/** @param {object} game @returns {object} */
function boundedView(game) {
  return {
    winner:game.winner, finished:game.finished, actions:game.actions,
    prizesRemaining:game.prizesRemaining,
    copycatAttacks:game.attackTrace.filter(e=>
      e.seat===1 && e.activePokemon==='Mimikyu' && e.attack==='Copycat')
      .map(({turn,prizeCountBefore,prizeCountAfter})=>
        ({turn,prizeCountBefore,prizeCountAfter})),
    postExtraTurnEvents:game.decisionTrace
      .filter(e=>e.turnBefore>=28 && e.turnBefore<=30)
      .map(e=>({turn:e.turnBefore,action:e.action,attack:e.attack||null,
        prizes:e.prizesAfter})),
    copiedTurnStart:game.copycatTurnStartEvidence.filter(e=>e.turn===28),
    nextCandidateTurnStart:game.copycatTurnStartEvidence
      .find(e=>e.turn>28)||null
  };
}

/**
 * One genuine, frozen 60-vs-60 game source fork. No injected cards; only the
 * candidate's opt-in turn28 attack and nested choice policy can diverge.
 */
function main() {
  const resolved=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(resolved.decks.map(deck=>[deck.rank,deck]));
  const candidate=byRank.get(1), opponent=byRank.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  const schedule=loadDefaultCampaign('decorrelated-slots-v3');
  const trial=schedule.trials.find(t=>t.phase==='pilot' && t.rank===10 &&
    t.candidateId==='champion-reference' && t.repeat===0 &&
    t.candidateEngineSlot==='B');
  assert.ok(trial);
  assert.equal(trial.seed,4246551499);
  const common={
    deckA:opponent.cardIds,deckB:candidate.cardIds,seed:trial.seed,
    maxActions:350,label:trial.trialId,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureCopycatTurnStartSeat:1,
    postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const turn27={
    ...common,mimikyuApexTimelessPolicy:true,
    mimikyuApexTimelessPolicySeat:1,mimikyuTurn27SetupSeat:1
  };
  const baseline=runMatch(turn27);
  const alternate=runMatch({...turn27,mimikyuExtraTurnShredSeat:1});
  const repeated=runMatch(turn27);
  assert.deepEqual(repeated,baseline,
    'The opt-in Shred fork contaminated an unchanged repeated source control');
  assert.deepEqual(alternate.deckHashes,baseline.deckHashes);
  assert.equal(alternate.firstTurnSlot,baseline.firstTurnSlot);
  assert.equal(alternate.firstTurnSlot,1);
  const extraTurn=game=>game.copycatTurnStartEvidence
    .find(snapshot=>snapshot.turn===28);
  assert.ok(extraTurn(baseline),'Baseline must have the authentic turn28');
  assert.deepEqual(extraTurn(alternate),extraTurn(baseline),
    'The optional Shred tactic changed the source state before the turn28 decision');
  let firstDecisionDivergence=null;
  for (let i=0;i<Math.max(baseline.decisionTrace.length,
    alternate.decisionTrace.length);i++) {
    const control=baseline.decisionTrace[i]||null;
    const changed=alternate.decisionTrace[i]||null;
    if (JSON.stringify(control)!==JSON.stringify(changed)) {
      firstDecisionDivergence={index:i,control,changed};
      break;
    }
  }
  assert.ok(firstDecisionDivergence,
    'Source Shred policy did not change any recorded decision');
  assert.equal(firstDecisionDivergence.control.actionOrdinal,213,
    'Unexpected source pre-fork meaningful-action mismatch');
  assert.equal(firstDecisionDivergence.control.turnBefore,28);
  assert.equal(firstDecisionDivergence.control.action,'RetreatAction');
  assert.equal(firstDecisionDivergence.changed.action,'AttackAction');
  assert.equal(firstDecisionDivergence.changed.attack,'Copycat');
  const copied=alternate.attackTrace.filter(row=>
    row.turn===28 && row.seat===1 && row.activePokemon==='Mimikyu' &&
    row.attack==='Copycat');
  assert.equal(copied.length,1,'Expected an actual source-dealt turn28 Copycat action');
  const post=alternate.decisionTrace.filter(row=>row.turnBefore>=28);
  const prizeTaken=post.some(row=>row.prizesAfter[1]<=2) ||
    alternate.prizesRemaining[1]<=2;
  assert.ok(prizeTaken,'No confirmed two-Prize pickup after the Shred source fork');
  return {
    experiment:'agent28-source-ranked-turn28-shred-fork',
    label:'one fixed-seed source-policy counterfactual, no competitive win-rate inference',
    engine:resolved.engineRevision,
    trial:{id:trial.trialId,seed:trial.seed,candidateActuallyFirst:true,
      planDigest:schedule.planDigest,
      deckHashes:[sha(common.deckA),sha(common.deckB)]},
    unchangedSourceSetupThroughTurn28:true,
    replayedBaselineByteIdentical:true,
    firstDecisionDivergence:{actionOrdinal:firstDecisionDivergence.control.actionOrdinal,
      control:firstDecisionDivergence.control.action,
      experimental:firstDecisionDivergence.changed.action},
    observedSourceCopycatTurn28:copied.length===1,
    observedTwoPrizePickupAfterTurn28:prizeTaken,
    control:boundedView(baseline),experimental:boundedView(alternate),
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    limitations:['one source seed','experimental simulator clone',
      'unqualified bot opponent','full Store-mechanism replay remains unverified',
      'possible pinned card/text semantic gaps']
  };
}
if (require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,boundedView};
