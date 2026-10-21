'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent1-charged-promotion-postgame-archive-audit-v1';

/**
 * Read an immutable same-checkout paired native archive without inspecting
 * any native State or recomputing game results. Source private cards are only
 * exposed to the source's own post-decision observer, and may never be given
 * to the challenger decision policy.
 * @param {object} archive Native paired results.
 * @returns {object} Bounded, after-game diagnostics only.
 */
function audit(archive){
  assert.equal(archive.version,'agent1-charged-promotion-native-pair-v1');
  assert.equal(archive.competitiveQualifiedGames,0);
  assert.equal(archive.sourceFirstHistoricallySelected,true);
  assert.equal(archive.control?.attempted,4);
  assert.equal(archive.treatment?.attempted,4);
  assert.equal(archive.pairs?.length,4);
  return {
    version:VERSION,
    selector:archive.selectorVersion,
    fourSourceDealsMatch:archive.allFourSameSourceDeals,
    fourStartersMatch:archive.allFourSameActualStarters,
    genuineNativeRootComparisons:archive.pairs.map((pair,i)=>{
      const c=archive.control.rows[i];
      const t=archive.treatment.rows[i];
      assert.equal(c.trial.id,pair.id);
      assert.equal(t.trial.id,pair.id);
      const choices={
        baseline:c.actorOnlyDecisionCoverage?.detailedComponentAudits
          ?.choosePokemon??null,
        treatment:t.actorOnlyDecisionCoverage?.detailedComponentAudits
          ?.choosePokemon??null
      };
      const source=c.sourceOwnerPostPassMobility??null;
      const restricted=source?.observations?.filter(row=>
        row.strandedGarbodor && row.hasHeldMobility)??[];
      const allMobility=source?.observations?.filter(row=>
        row.hasHeldMobility)??[];
      return {
        id:pair.id,
        realSourceFirst:c.sourceActuallyFirst===true,
        identicalGenuineRootLedger:pair.identicalRootLedger,
        nativeRootActions:[pair.baselineRoots,pair.treatmentRoots],
        originalSourceDealMatched:pair.sameSourceDeal,
        nativeChoosePokemonSelected:[
          choices.baseline?.selected??null,
          choices.treatment?.selected??null
        ],
        nativeChoosePokemonConfirmed:[
          choices.baseline?.postconditionsConfirmed??null,
          choices.treatment?.postconditionsConfirmed??null
        ],
        nativeChoosePokemonOffered:
          (choices.baseline?.boundedSelections??[]).slice(0,12).map(x=>({
            turn:x.turn,choice:x.choiceIndex,
            numberOffered:x.offered,selectedPrinting:x.selectedPrinting
          })),
        sourcePostPassMobilityObserved:Boolean(source),
        sourcePostPassTotalPasses:source?.totalSourcePasses??null,
        sourcePostPassHoldingMobility:allMobility.length,
        sourceStrandedGarbodorPasses:source?.strippedGarbodorPasses??null,
        sourceStrandedAndHeldMobility:restricted.length,
        strandedHeldMobilityExamples:restricted.slice(0,8).map(x=>({
          turn:x.globalTurn,
          activeName:x.activeName,
          activeEnergyCards:x.activeEnergyCards,
          mobilityHeld:x.mobilityHeld,
          benchNames:x.benchNames
        })),
        competitivelyQualified:false
      };
    }),
    limitation:'Owner-held card is only a post-Pass possibility, not native legal action proof. Historical source-first deals and generic policy remain unqualified.',
    competitiveGames:0
  };
}

if(require.main===module){
  const file=process.argv[2];
  if(!file)throw new Error('Give path to immutable paired JSON artifact');
  process.stdout.write(JSON.stringify(audit(JSON.parse(fs.readFileSync(file,'utf8'))),null,2)+'\n');
}
module.exports={VERSION,audit};
