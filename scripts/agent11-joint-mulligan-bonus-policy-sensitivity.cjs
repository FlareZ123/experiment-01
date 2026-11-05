'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  candidateSoloScreen,sourceResourceAccess,jointExposure
}=require('./agent11-newmoon-thorns-joint-mulligan-screen.cjs');
const {candidateCategories}=require(
  './agent11-newmoon-thorns-firstturn-exposure.cjs');

/**
 * Exact marginal setup conjunction for four fixed deterministic bonus-choice
 * rules (all/none) by both players. This is an offline physical subset only.
 *
 * @param {1|3} dce Original Iron Thorns Double Colorless count.
 * @param {2|3|4} mail Original Iron Thorns Trainers' Mail count.
 * @param {object} categories Frozen New Moon physical category totals.
 * @param {number} [sourceTail=10] Maximum enumerated source bonus.
 * @returns {object} Four policy outcomes, in probabilities, with tail bound.
 */
function bonusChoiceSensitivity(dce,mail,categories,sourceTail=10){
  const all=jointExposure(dce,mail,categories,sourceTail);
  const initialCandidateScreen=candidateSoloScreen(categories,0)
    .conditionalProbability;
  const initialSourceAccess=sourceResourceAccess(dce,mail,0);
  const fixed=initialCandidateScreen*initialSourceAccess;
  const sourceBonusMass=all.sourceGetsAtLeastOneBonus;
  const candidateBonusMass=all.candidateGetsAtLeastOneBonus;
  const candidateAllSourceNone=
    all.bothValidContribution+
    all.candidateCompensationContribution+
    sourceBonusMass*fixed;
  const candidateNoneSourceAll=
    all.bothValidContribution+
    candidateBonusMass*fixed+
    all.sourceCompensationContribution;
  const bothAll=all.observedJointConjunction;
  const bothNone=fixed;
  assert.ok(candidateAllSourceNone<=bothAll);
  assert.ok(bothAll<=candidateNoneSourceAll);
  assert.ok(candidateNoneSourceAll<=bothNone+
    all.uncomputedJointUpperBound+1e-14);
  return {
    schema:'agent11-joint-opponent-mulligan-bonus-choice-four-policy-v1',
    dce,mail,
    probabilities:{
      candidateAll_sourceAll:bothAll,
      candidateAll_sourceNone:candidateAllSourceNone,
      candidateNone_sourceAll:candidateNoneSourceAll,
      candidateNone_sourceNone:bothNone
    },
    sourceAcceptAllTailAbsoluteBound:all.uncomputedJointUpperBound,
    candidateChoiceCondition:'Take every offered mulligan bonus or decline every offered bonus',
    sourceChoiceCondition:'Take every offered mulligan bonus or decline every offered bonus',
    fixedCandidateManifest:true,
    sourceSecond:true,
    candidateFirst:true,
    claimedGameWins:0,
    explanation:'Only the named paper resource-access x restrictive sole-fragile-Basic exposure conjunction; no game, strategy, clock, or win evaluation'
  };
}

/** @returns {object} */
function fromRepo(){
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const categories=candidateCategories(manifest);
  const profiles=[[6,1,3],[24,3,4],[29,1,2]];
  return {
    schema:'agent11-original-thorns-newmoon-bonus-choice-sensitivity-v1',
    profiles:profiles.map(([rank,dce,mail])=>{
      const printed=roster.decks.find(deck=>deck.rank===rank);
      assert.ok(printed);
      assert.equal(printed.cards.filter(c=>c.name==="Trainers' Mail")
        .reduce((n,c)=>n+c.count,0),mail);
      assert.equal(printed.cards.filter(c=>c.name==='Double Colorless Energy')
        .reduce((n,c)=>n+c.count,0),dce);
      return {rank,...bonusChoiceSensitivity(dce,mail,categories)};
    }),
    competitiveQualifiedGames:0
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(fromRepo(),null,2)+'\n');
module.exports={bonusChoiceSensitivity,fromRepo};
