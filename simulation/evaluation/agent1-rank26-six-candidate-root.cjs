'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {studyField,readCardIndex,printedPokemon}=
  require('./aichi-forced-active-opener.cjs');
const {joint}=require('../../scripts/agent3-rank26-coupled-lone-basic-root.cjs');

/**
 * A source-independent candidate-intake extension of Agent3's existing
 * exact rank26 first-turn direct-Energy-and-one-opposing-Basic coupling.
 *
 * The source-side line requires five physically settled self-KOs,
 * Debut Performance active, actual Energy, TM Crisis Punch acquisition,
 * a legal attack, and no protection from the opposing Active. The joint
 * physical root below establishes none of these subsequent actions.
 *
 * @param {string} root Repository root.
 * @returns {object}
 */
function sixCandidateRank26Root(root){
  const rank26=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'))
    .decks.find(d=>d.rank===26);
  assert.ok(rank26,'Original rank26 printing is needed');
  const index=readCardIndex(root);
  const melo=printedPokemon(rank26.cards.find(c=>c.name==='Meloetta ex'),index);
  assert.ok(melo?.abilities?.some(a=>a.name==='Debut Performance'&&
    /first turn/i.test(a.text)),
  'The original Meloetta must retain printed first-turn Ability');
  const tm=index.byId.get('sv4pt5-90');
  assert.equal(tm?.name,'Technical Machine: Crisis Punch');
  assert.equal(tm?.attacks?.find(a=>a.name==='Crisis Punch')?.damage,'280');
  assert.ok(rank26.cards.some(c=>c.name==='Technical Machine: Crisis Punch'&&
    c.printing.set==='PAF'&&c.printing.number==='90'));

  const screen=studyField(root);
  assert.equal(screen.admittedOriginals,29);
  assert.equal(screen.admittedCandidates,6);
  const candidates=screen.candidates.map(c=>{
    const h280=c.hpTiers.find(x=>x.hpAtMost===280);
    const rootJoint=joint(c.basics,'hand-aware');
    return {name:c.name,basics:c.basics,
      conditionalExactlyOneBasic:c.exactlyOneBasicProbability,
      basicCopiesAtMost280:h280.lowHpBasicCopies,
      conditionalExactlyOneHpAtMost280:h280.conditionalForcedActive,
      psychic280PrintedKnockoutBasicCopies:c.psychic280.printedKOCopies,
      conditionalForcedPsychic280KO:c.psychic280.conditionalForcedLoneKO,
      sourceDirectRootWithExactlyOneOpposingBasic:
        rootJoint.conditionalJointSetupAndSourceRoot,
      sourceDirectRootWithPrintedPsychic280LoneKO:
        rootJoint.conditionalJointSetupAndSourceRoot*
        c.psychic280.printedKOCopies/c.basics,
      excludedGeometricTailUpperBound:rootJoint.excludedTailBound,
      ...{rootComponents:rootJoint.components}};
  });
  return {schema:'agent1-rank26-source-energy-root-six-fixed-candidates-v1',
    sourceRank:26,attack:'Crisis Punch',printedDamage:280,
    attackingAbility:'Debut Performance',
    candidateCount:candidates.length,candidates,
    certifiedPaperGames:0,estimatedWinRates:null,
    evidenceLimit:'This is a coupled setup/direct-Energy root from Agent3 plus source-exact candidate Basics. It does not model the five self-KOs, Tool, paid actual attack, opposing Ability locks, resistance, damage modifiers, opponent decisions or match clock. It is not a win-rate estimate.'};
}

module.exports={sixCandidateRank26Root};
