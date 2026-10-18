'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile}=require('./policy-profiles.cjs');
const {SOURCE}=require('./rank26-cologne-autonomous-source-regression.cjs');
const {withMailScout}=require('./rank26-mail-recovery.cjs');
/** @returns {object} */
function compare(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(x=>x.rank===6);
  assert.equal(source.length,60);
  assert.equal(opponent?.status,'ready');
  const request={deckA:opponent.cards,deckB:source,rank26SourceSeat:SOURCE.rank26Seat,
    seed:SOURCE.seed,maxActions:80,strictPromptValidation:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true};
  /** @param {object} g */
  function examine(g){
    assert.equal(g.firstTurnSlot,SOURCE.rank26Seat);
    assert.equal(g.verifiedByDrawLog,true);
    const first=(g.decisionTrace||[]).filter(x=>x.playerSlot===SOURCE.rank26Seat && x.turnBefore===1);
    assert.equal(first[0]?.card,'Canceling Cologne');
    return {first,mail:g.cardsPlayedBySeat[SOURCE.rank26Seat]["Trainers' Mail"]||0,
      pumps:g.cardsPlayedBySeat[SOURCE.rank26Seat]['Damage Pump']||0,
      turns:g.actions,finished:g.finished,winner:g.winner};
  }
  const baseline=examine(runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
  const changed=withMailScout(SOURCE.rank26Seat,
    ()=>runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
  const candidate=examine(changed.result);
  assert.ok(changed.policyAudit.selections.length>=1);
  assert.ok(candidate.mail>baseline.mail);
  return {seed:SOURCE.seed,sourceRank:26,opponentRank:6,
    source60s:[source.length,opponent.cards.length],baseline,candidate,
    mailAudit:changed.policyAudit,qualifiedForCompetitiveInference:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(compare(),null,2)+'\n');
module.exports={compare};
