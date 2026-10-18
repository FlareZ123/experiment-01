'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('./headless.cjs');
const {RANK26_COLOGNE_PUMP_PROFILE,RANK26_PROPAGATION_PROFILE,
  runWithResearchProfile}=require('./policy-profiles.cjs');
const {SOURCE}=require('./rank26-cologne-autonomous-source-regression.cjs');

/**
 * Compare only recorded decisions on the same printed source deal.
 * Policies diverging later can consume randomness differently.
 * @returns {object}
 */
function compare(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const attacker=plan.candidate.cards;
  const opponent=plan.opponents.find(row=>row.rank===6);
  assert.equal(attacker.length,60);
  assert.equal(opponent?.status,'ready');
  const request={
    deckA:opponent.cards,deckB:attacker,
    rank26SourceSeat:SOURCE.rank26Seat,seed:SOURCE.seed,
    maxActions:80,strictPromptValidation:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    forestSealSearchCorrection:true,
    leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,
    label:'rank26-held-cologne-first-own-source-diagnostic'
  };
  /** @param {string} profile */
  function arm(profile){
    const result=runWithResearchProfile(request,profile);
    assert.equal(result.seed,SOURCE.seed);
    assert.equal(result.firstTurnSlot,SOURCE.rank26Seat);
    assert.equal(result.verifiedByDrawLog,true);
    assert.equal(result.researchPolicyProfile,profile);
    assert.equal(result.cardsPlayedBySeat[SOURCE.rank26Seat]['Canceling Cologne'],1);
    const root=(result.decisionTrace||[])
      .filter(row=>row.playerSlot===SOURCE.rank26Seat &&
        row.turnBefore===1);
    assert.equal(root[0]?.card,'Canceling Cologne');
    return {
      profile,sourceFirst:true,
      sourceFirstActions:root.slice(0,36),
      rank26ColognePolicy:result.rank26ColognePolicy||null,
      rank26PumpPolicy:result.rank26PumpPolicy||null,
      rank26PropagationPolicy:result.rank26PropagationPolicy||null,
      experimentalTactics:result.experimentalTactics||[],
      completed:result.finished===true,
      observedEngineWinner:result.winner??null,
      actualActionCount:result.actions,
      actualCardsPlayed:result.cardsPlayedBySeat[SOURCE.rank26Seat],
      sourceTurnDecisionCount:root.length
    };
  }
  const v2=arm(RANK26_COLOGNE_PUMP_PROFILE);
  const v3=arm(RANK26_PROPAGATION_PROFILE);
  return {
    schema:'rank26-source-identical-seed-propagation-v2-v3-root-diagnostic-v1',
    seed:SOURCE.seed,rank26PhysicalSeat:SOURCE.rank26Seat,
    defenderRank:6,attackerRank:26,
    source60sIntact:true,
    startingOrderDrawLogVerified:true,
    v2,v3,
    firstTurnDecisionsEqual:JSON.stringify(v2.sourceFirstActions)===
      JSON.stringify(v3.sourceFirstActions),
    competitiveGameQualified:false,
    caveat:'Prospectively identical registered 60s and seed; no staged root action. Source first 80 actions only. No strategic opponent policy competence or complete first-turn Crisis Punch.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(compare(),null,2)+'\n');
module.exports={compare};
