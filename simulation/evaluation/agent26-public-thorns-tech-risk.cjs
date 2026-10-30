'use strict';
const assert=require('node:assert/strict');
const {publicFailedHandHistoryPosterior}=
  require('../../scripts/agent26-public-mulligan-fullhistory.cjs');
const {nextValidHandMarkerChance}=
  require('../../scripts/agent26-public-mulligan-inference-boundary.cjs');
const VERSION='agent26-source-hypothesis-public-thorns-risk-v1';
const THORNS_RANKS=[6,24,29];

/**
 * Query an optional owner-only, detached first-root public observation for
 * the chance of a four-copy Crushing Hammer source under a declared, limited
 * original-Aichi source prior. This is a source-inventory risk hypothesis,
 * not a known card in the opponent's hand or a legal action recommendation.
 *
 * @param {object} view Authenticated owner-only root observation with
 *   publicFailedOpponentSevens attached by the opt-in public-history bridge.
 * @param {object} manifest Exactly the 29 recovered original source 60s.
 * @returns {object|null} Thorns source-tech belief or null for other Actives.
 */
function publicThornsTechRisk(view,manifest){
  assert.equal(view?.decisionKind,'owner-root');
  const active=view.opponentPublic?.active;
  if(active?.name!=='Iron Thorns ex')return null;
  const publicHands=view.publicFailedOpponentSevens;
  assert.ok(Array.isArray(publicHands));
  const unsupported=reason=>Object.freeze({version:VERSION,
    status:'out-of-model',reason,recommendedAction:null,
    probabilityOriginalSourceHasFourCrushingHammer:null,
    noOpponentCurrentHandKnowledge:true,gameWinEvidence:false});
  let inference;
  try{inference=publicFailedHandHistoryPosterior(manifest,publicHands);}
  catch(error){
    if(error.message==='Impossible public history for recovered sources')
      return unsupported('public history outside 29-source hypothesis universe');
    throw error;
  }
  const family=inference.models.filter(x=>THORNS_RANKS.includes(x.rank));
  assert.equal(family.length,3);
  const familyMass=family.reduce((n,x)=>n+x.posterior,0);
  if(familyMass===0)
    return unsupported('public history incompatible with recovered Thorns family');
  const sources=family.map(x=>{
    const deck=manifest.decks.find(d=>d.rank===x.rank);
    const hammer=deck.cards.filter(c=>c.name==='Crushing Hammer')
      .reduce((n,c)=>n+c.count,0);
    assert.ok(hammer===0||hammer===4,
      'Printed Thorns original resource census changed');
    return {rank:x.rank,crushingHammerCopies:hammer,
      posterior:x.posterior/familyMass,
      nextValidSevenHammerChance:nextValidHandMarkerChance({
        basics:4,markers:hammer})};
  });
  const hammerSourceProbability=sources.filter(x=>x.crushingHammerCopies===4)
    .reduce((n,x)=>n+x.posterior,0);
  return Object.freeze({
    version:VERSION,model:'uniform prior over 29 recovered original Aichi sixties',
    opponentPublicActiveName:active.name,
    revealedPublicFailedSevenCount:publicHands.length,
    sourceRankHypotheses:Object.freeze(sources.map(x=>Object.freeze(x))),
    probabilityOriginalSourceHasFourCrushingHammer:hammerSourceProbability,
    probabilityNextBasicValidSevenIncludesHammer:sources.reduce((n,x)=>
      n+x.posterior*x.nextValidSevenHammerChance,0),
    assumesExactOriginalSources:true,
    excludesUnrecoveredSourcesAndUnknownCompetitors:true,
    noOpponentCurrentHandKnowledge:true,
    gameWinEvidence:false,
    recommendedAction:null
  });
}
module.exports={VERSION,publicThornsTechRisk};
