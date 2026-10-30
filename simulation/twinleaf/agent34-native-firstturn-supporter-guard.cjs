'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {withPaperSupporterQuotaGuard,PaperFirstTurnSupporterError}=
  require('./paper-supporter-quota-guard.cjs');
const {scenario,SEEDS}=require('./agent48-firstturn-carmine-native-probe.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const CARMINE='Carmine TWM';

/**
 * Repeat the original 24-deal predeclared native Carmine study under a real
 * root pre-dispatch Supporter paper guard. Only the four naturally eligible
 * deals receive the allow/deny interventions; all other deals remain visible
 * negative exposure controls. No deck or engine internals are modified.
 *
 * @returns {object} Full seeded source-input and native Store receipts.
 */
function runAudit(){
  const {Store}=require(path.join(OUTPUT,'game/store/store'));
  const {TrainerType}=require(path.join(OUTPUT,'game/store/card/card-types'));
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank=n=>manifest.decks.find(x=>x.rank===n);
  const one=rank(1),eleven=rank(11);
  assert.ok(one?.playableUnderEngine&&eleven?.playableUnderEngine);
  assert.equal(one.cardIds.length,60);
  assert.equal(eleven.cardIds.length,60);

  const beforeDescriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const attempts=[];
  for(const seed of SEEDS){
    const setup={seed,deckA:one.cardIds,deckB:eleven.cardIds};
    const baseline=scenario(setup,true);
    const eligible=baseline.firstOwner?.forcedOpportunity===true;
    assert.equal(baseline.error,null,
      'Original pinned Carmine positive control must complete without error');
    assert.equal(baseline.game?.verifiedByDrawLog,true);
    if(eligible){
      assert.equal(baseline.settlement?.status,'accepted');
      assert.equal(baseline.settlement?.ownerDeckCardsDrawn,5);
    }
    let authorized=null,blocked=null;
    if(eligible){
      const allowVetoes=[];
      const passed=withPaperSupporterQuotaGuard(Store,
        TrainerType.SUPPORTER,()=>scenario(setup,true),{
          enforceFirstPlayerSupporter:true,
          allowFirstPlayerSupporter:({state,card})=>
            state.turn===1&&card.fullName===CARMINE,
          onViolation:row=>allowVetoes.push(row)
        });
      authorized={scenario:passed.result,allowVetoes,
        guardSupporterRoots:passed.legalSupporterRoots};
      assert.deepEqual(authorized.scenario.firstOwner,baseline.firstOwner);
      assert.deepEqual(authorized.scenario.firstBotAction,baseline.firstBotAction);
      assert.equal(authorized.scenario.settlement?.status,'accepted');
      assert.equal(authorized.scenario.settlement?.ownerDeckCardsDrawn,5);
      assert.equal(authorized.scenario.settlement?.supporterQuotaChange,1);
      assert.equal(authorized.scenario.error,null);
      assert.equal(allowVetoes.length,0);
      assert.ok(passed.legalSupporterRoots.some(x=>
        x.card===CARMINE&&x.turn===1&&x.quotaBefore===0));

      const deniedVetoes=[];
      const denied=withPaperSupporterQuotaGuard(Store,
        TrainerType.SUPPORTER,()=>scenario(setup,true),{
          enforceFirstPlayerSupporter:true,
          onViolation:row=>deniedVetoes.push(row)
        });
      blocked={scenario:denied.result,deniedVetoes,
        guardSupporterRoots:denied.legalSupporterRoots};
      assert.deepEqual(blocked.scenario.firstOwner,baseline.firstOwner);
      assert.deepEqual(blocked.scenario.firstBotAction,baseline.firstBotAction);
      assert.equal(blocked.scenario.error?.name,
        PaperFirstTurnSupporterError.name);
      assert.equal(blocked.scenario.settlement?.status,'rejected');
      assert.equal(blocked.scenario.settlement?.after?.ownerSupporterTurn,0);
      assert.ok(blocked.scenario.settlement?.after?.ownerHand.includes(CARMINE));
      assert.equal(deniedVetoes.length,1);
      assert.equal(deniedVetoes[0].card,CARMINE);
      assert.equal(deniedVetoes[0].turn,1);
      assert.equal(deniedVetoes[0].rejectedBeforeNativeDispatch,true);
      assert.equal(denied.legalSupporterRoots.length,0);
    }
    assert.strictEqual(
      Object.getOwnPropertyDescriptor(Store.prototype,'dispatch').value,
      beforeDescriptor.value,'Each reversible guard must restore native Store');
    attempts.push({seed,eligible,sourceRanks:[1,11],
      originalOwner:baseline.firstOwner,
      originalBotChoice:baseline.firstBotAction,
      baselineSettlement:baseline.settlement,
      baselineError:baseline.error,
      nativeAuthorized:authorized,nativeBlocked:blocked});
  }
  const count=attempts.filter(x=>x.eligible).length;
  assert.equal(attempts.length,24);
  assert.equal(count,4,'Predeclared Agent48 native held-card exposure should reproduce');
  return {
    schema:'agent34-native-firstturn-supporter-allowdeny-v1',
    pinnedSourceRanks:[1,11],sourceSeedCount:attempts.length,
    eligibleNaturallyHeldCarmine:count,
    allowedNativeStoreCarmine:attempts.filter(x=>
      x.nativeAuthorized?.scenario?.settlement?.status==='accepted').length,
    preventedBeforeNativeDispatch:attempts.filter(x=>
      x.nativeBlocked?.scenario?.error?.name===
        PaperFirstTurnSupporterError.name).length,
    qualifiedCompetitiveGames:0,
    limitations:'Native original-source first-turn printed-exception mechanic and default-off research guard only. Owner strategy, all opponents, event clock and competitive games remain unqualified.',
    attempts
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={runAudit};
