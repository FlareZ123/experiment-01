'use strict';
const assert=require('node:assert/strict');
const {inspectPowerglassWinningKo}=
  require('./agent37-powerglass-winning-ko-native.cjs');
const {withPaperKoBeforeEndTurn}=
  require('./agent37-paper-ko-before-endturn-hook.cjs');
const {withInstanceScopedPaperKoBeforeEndTurn,VERSION,PINNED}=
  require('./agent37-paper-ko-instance-scoped-hook.cjs');

/**
 * Exact native physical transactions, compared against the previously tested
 * prototype-level research hook, for every physical seat and winning shape.
 * A second Store in the same JS process must retain its original reducer.
 * @returns {object} Twelve isolated A/B transcript comparisons.
 */
function testScopedKoStore(){
  const scenarios=[
    {label:'passTurn',actionKind:'pass'},
    {label:'noKo',targetDamage:0},
    {label:'regularPrize'},
    {label:'tagTeamThree',targetPrinting:'Trevenant & Dusknoir-GX SMP',
      targetDamage:260},
    {label:'lastPrize',lastPrize:true},
    {label:'lastPokemon',opponentHasBench:false}
  ];
  const cases=scenarios.flatMap(({label,...args})=>
    [0,1].map(actorSeat=>{
      const opts={...args,actorSeat,settleAll:true};
      const reference=withPaperKoBeforeEndTurn(
        ()=>inspectPowerglassWinningKo(opts));
      const isolated=inspectPowerglassWinningKo({
        ...opts,withStoreHook:withInstanceScopedPaperKoBeforeEndTurn
      });
      const audit=isolated.scopedHookAudit;
      assert.ok(audit.originalRestored&&audit.otherStoresUnmodified);
      assert.deepEqual(isolated.seenPrompts,reference.result.seenPrompts);
      assert.deepEqual(isolated.finalState,reference.result.finalState);
      assert.equal(audit.intercepted,label==='passTurn'?0:1);
      assert.equal(audit.terminalSuppressed,
        label==='lastPrize'||label==='lastPokemon'?1:0);
      assert.equal(audit.completed,
        label==='lastPrize'||label==='lastPokemon'||label==='passTurn'
          ?0:1);
      const choices=isolated.seenPrompts.filter(p=>p!=='WaitPrompt');
      return {label,actorSeat,choices,
        winner:isolated.finalState.winner,
        prizes:isolated.finalState.ownerPrizesRemaining,
        opponentActive:isolated.finalState.sourceActive,
        attachedPsychic:isolated.finalState.ownerActiveEnergy.length,
        hookCount:audit.intercepted,
        terminalSuppressed:audit.terminalSuppressed,
        peerStoreUnchanged:audit.otherStoresUnmodified,
        perStoreMethodRestored:audit.originalRestored};
    }));
  return {version:VERSION,pinnedTwinleaf:PINNED,
    twelvePhysicalSeatComparisonsPassed:true,
    noPrototypeMutation:true,allPromptChainsClosed:true,
    paperQualifiedGames:0,cases};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(testScopedKoStore(),null,2)+'\n');
module.exports={testScopedKoStore};
