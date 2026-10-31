'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {
  unseenTrainerHypergeometric,nominalPrintedDamageAtLeast
}=require('./agent23-unseen-trainer-hypergeometric.cjs');

/**
 * A standardized WHAT-IF conditional field profile. All 29 authenticated
 * source rosters are known to the researcher, exactly one publicly visible
 * non-Trainer Pokémon is removed, and exactly four cards remain in a
 * hypothetical opponent hand drawn uniformly from the 59 unresolved cards.
 * These conditions are deliberately NOT asserted to hold in actual games.
 *
 * @param {object} manifest Authenticated original source roster JSON.
 * @returns {object} A hypothetical score-space census only.
 */
function profilePaperField(manifest){
  assert.ok(manifest&&Array.isArray(manifest.decks));
  const rows=manifest.decks.map(deck=>{
    const c=deck.category_counts;
    assert.ok(c&&Number.isSafeInteger(c.Trainer));
    assert.equal(c.Pokémon+c.Trainer+c.Energy,60);
    assert.ok(c.Pokémon>=1,'Visible Basic is a conditional assumption');
    const model=unseenTrainerHypergeometric({
      unknownCards:59,unknownTrainers:c.Trainer,unknownHand:4
    });
    return {
      rank:deck.rank,
      archetype:deck.archetype,
      originalTrainers:c.Trainer,
      nominalExpectedPrintedDamage:model.expectedPrintedDamage,
      nominalChanceAtLeast150:nominalPrintedDamageAtLeast(model,150),
      nominalChanceAtLeast200:nominalPrintedDamageAtLeast(model,200)
    };
  }).sort((a,b)=>a.rank-b.rank);
  assert.equal(new Set(rows.map(x=>x.rank)).size,rows.length);
  const byCount=rows.slice().sort((a,b)=>
    a.originalTrainers-b.originalTrainers||a.rank-b.rank);
  return {
    schema:'agent23-paper-field-roster-conditioned-unseen-trainers-v1',
    sourceScope:'Aichi Open League 2026 verified source deck category counts',
    verifiedOpposingSixties:rows.length,
    missingSourceRanks:manifest.missing_full_lists?.map(x=>x.rank)??null,
    hypotheticalVisibleNonTrainerPokemon:1,
    hypotheticalUnseenHandSize:4,
    unresolvedCardsPerRoster:59,
    minTrainers:byCount[0]?.originalTrainers??null,
    maxTrainers:byCount.at(-1)?.originalTrainers??null,
    minNominalExpectedPrintedDamage:byCount[0]?.nominalExpectedPrintedDamage??null,
    maxNominalExpectedPrintedDamage:byCount.at(-1)?.nominalExpectedPrintedDamage??null,
    rankingsByOriginalTrainerCount:byCount.map(x=>x.rank),
    rows,
    actualUnseenHandPosteriorModeled:false,
    publicRosterKnowledgeAvailableDuringPlay:false,
    sourcePolicyOrOpponentResponseModeled:false,
    actualAttackAvailabilityEvaluated:false,
    competitiveGameQualified:false
  };
}

function run(){
  const root=path.resolve(__dirname,'../../');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  return profilePaperField(manifest);
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={profilePaperField,run};
