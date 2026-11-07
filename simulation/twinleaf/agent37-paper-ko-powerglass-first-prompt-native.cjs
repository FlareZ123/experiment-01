'use strict';
const assert=require('node:assert/strict');
const {inspectPowerglassWinningKo}=
  require('./agent37-powerglass-winning-ko-native.cjs');
const {withPaperKoBeforeEndTurn,VERSION}=
  require('./agent37-paper-ko-before-endturn-hook.cjs');

/**
 * Distinguish original pinned ordering from the reversible paper-order hook.
 * This first-prompt probe intentionally stops before a subsequent prize reply;
 * later tests must settle the full prompt chain before qualification.
 * @returns {object} Original and hooked actual Store prompt observations.
 */
function compareNativePromptOrder(){
  const scenarios=[
    {label:'regularPrize',lastPrize:false,opponentHasBench:true},
    {label:'lastPrize',lastPrize:true,opponentHasBench:true},
    {label:'lastPokemon',lastPrize:false,opponentHasBench:false}
  ];
  const arms=scenarios.map(({label,...options})=>{
    const baseline=inspectPowerglassWinningKo(options);
    const treatment=withPaperKoBeforeEndTurn(
      ()=>inspectPowerglassWinningKo(options));
    const t=treatment.result,a=treatment.audit;
    assert.equal(baseline.firstChoicePrompt,'AttachEnergyPrompt');
    assert.equal(a.attackEndTurnIntercepts,1);
    assert.equal(a.originalStoreMethodRestored,true);
    const expectedFirst=label==='lastPokemon'?null:'ChoosePrizePrompt';
    const exactFirstMatch=t.firstChoicePrompt===expectedFirst;
    const auditMatch=a.attackEndTurnIntercepts===1;
    return {label,baseline,treatment:t,audit:a,
      expectedFirst,exactFirstMatch,auditMatch};
  });
  return {
    version:VERSION,realPinnedStore:true,threeActualAcceptedAttacks:true,
    allPaperFirstPromptInvariantsPassed:arms.every(x=>x.exactFirstMatch),
    followupFullPromptClosureNeeded:true,
    competitiveGamesQualified:0,arms
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(compareNativePromptOrder(),null,2)+'\n');
module.exports={compareNativePromptOrder};
