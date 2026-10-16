'use strict';
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_PROFILE}=require('./policy-profiles.cjs');

/**
 * Bounded execution probes over distinct source archetypes. They characterize
 * whether opt-in action policies can progress live games; no win-rate claims.
 */
function runFixture() {
  const resolved=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(resolved.decks.map(deck=>[deck.rank,deck.cardIds]));
  const samples=[{rankA:1,rankB:2,seed:20261021},
    {rankA:1,rankB:10,seed:20261022}];
  const games=samples.map(sample=>{
    const {rankA,rankB,seed}=sample;
    try {
      const game=runWithResearchProfile({
        deckA:byRank.get(rankA),deckB:byRank.get(rankB),seed,
        maxActions:800,label:'Extended policy fixture '+rankA+' versus '+rankB
      },EXPANDED_PROFILE);
      return {
        ...sample,status:game.finished?'finished':'action-limited',
        actions:game.actions,turns:game.turns,winnerSlot:game.winner,
        firstTurnSlot:game.firstTurnSlot,verifiedByDrawLog:game.verifiedByDrawLog,
        deckHashes:game.deckHashes,policy:game.policy,
        researchPolicyProfile:game.researchPolicyProfile,
        experimentalTactics:game.experimentalTactics,
        randomnessProtocol:game.randomnessProtocol,
        cardsPlayedBySeat:game.cardsPlayedBySeat,
        attacksBySeat:game.attackTrace
      };
    } catch(error) {
      return {...sample,status:'engine-exception',message:String(error.message)};
    }
  });
  return {kind:'expanded action-policy source-deck feasibility, not strength',
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    profile:EXPANDED_PROFILE,games};
}
if(require.main===module){
  const report=runFixture();
  console.log(JSON.stringify(report,null,2));
  if(report.games.every(game=>game.status==='engine-exception'))process.exitCode=1;
}
module.exports={runFixture};
