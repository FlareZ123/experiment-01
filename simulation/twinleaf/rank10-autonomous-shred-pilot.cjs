'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');

/**
 * Prospective tactic wiring within one deliberately archived opportunity.
 * The new policy has no turn or source-ordinal predicate, whereas this
 * reproducer fixes the prior game seed solely to compare a known opportunity.
 * This is a mechanism test and must not be counted as a fresh win sample.
 */
function main(){
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const ranks=new Map(manifest.decks.map(deck=>[deck.rank,deck]));
  const candidate=ranks.get(1),opponent=ranks.get(10);
  assert.ok(candidate?.playableUnderEngine&&opponent?.playableUnderEngine);
  initializeCards();
  const compiled=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(compiled,'game/store/store'));

  const request={
    deckA:opponent.cardIds,deckB:candidate.cardIds,
    seed:4246551499,maxActions:350,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    doubleDragonArchiveV3:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:1,
    mimikyuTurn27SetupSeat:1,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };

  /** @param {boolean} on */
  const run=on=>withStoreDispatchTranscript(Store,
    ()=>runMatch({...request,...(on?{mimikyuAutonomousShredSeat:1}:{})}),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const baseline=run(false),pilot=run(true);
  const a=baseline.actionTrace,b=pilot.actionTrace;
  const target=215;
  assert.deepEqual(a.slice(0,target),b.slice(0,target),
    'State-only tactic changed real physical prefix before the trigger');
  assert.equal(a[target]?.action,'RetreatAction',
    'Historical initial game root215 no longer proposes Retreat');
  assert.equal(b[target]?.action,'AttackAction',
    'Autonomous state predicate did not produce a true-root attack');
  assert.equal(b[target]?.parameters?.name,'Copycat');
  assert.equal(a[target].zoneDigestBefore,b[target].zoneDigestBefore);
  assert.equal(a[target].continuityDigestBefore,b[target].continuityDigestBefore);
  assert.equal(a[target].zoneDigestBefore,
    '5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d');
  const chosen=b.slice(target).map(event=>event.attackChoice?.selection)
    .find(selection=>selection?.printing==='Dialga-GX UPR'&&
      selection.attackName==='Shred');
  assert.ok(chosen,'Live nested ChooseAttackPrompt never resolved to printed Shred');
  const pickup=b.slice(target).find(event=>
    event.before?.prizesRemaining?.[1]===4 &&
    event.after?.prizesRemaining?.[1]===2);
  assert.ok(pickup,'Actual root Store did not collect the two Prize cards');
  assert.ok(pickup.step>target,'Two-Prize pickup preceded the Copycat decision');
  assert.equal(pilot.result.mimikyuAutonomousShredSeat,1);
  assert.equal(baseline.result.mimikyuAutonomousShredSeat,null);
  assert.equal(pilot.result.doubleDragonArchiveV3,true);
  assert.equal(baseline.result.doubleDragonArchiveV3,true);
  assert.ok(pilot.result.attackTrace.some(event=>
    event.turn===28&&event.seat===1&&event.attack==='Copycat'),
    'Proposed Copycat did not reach an actual printed attack declaration');

  const summary=game=>({
    finished:game.finished,winner:game.winner,turns:game.turns,
    actions:game.actions,prizesRemaining:game.prizesRemaining,
    attackedFromTurn27:game.attackTrace.filter(event=>event.turn>=27)
  });
  return {
    schema:'rank10-archived-opportunity-autonomous-shred-pilot-v1',
    source:{ranks:[10,1],candidateSeat:1,seed:request.seed,
      sourceRootOpportunity:target,initialPolicy:'DoubleDragonAttachTactic-v3-archive',
      candidatePreparation:'opt-in MimikyuTurn27SetupSeat, same in both arms'},
    policy:{name:'AutonomousApexShred-v1',candidateSeat:1,
      turnIndependent:true,rootOrdinalIndependent:true,
      opponentHiddenCardAccess:false,
      note:'Conservative two-Prize threshold is specific to damaged Regidrago VSTAR'},
    sourcePrefixMatchThroughRoot214:true,
    firstRootDivergence:{
      rootAction:target,baseline:a[target].action,alternative:b[target].action,
      beforeZone:a[target].zoneDigestBefore,
      beforeHistory:a[target].continuityDigestBefore
    },
    resolvedShredPrompt:{printing:chosen.printing,
      attackName:chosen.attackName,promptSourceIndex:chosen.index,
      attackIndex:chosen.attackIndex},
    observedTwoPrizePickupAtRoot:pickup.step,
    baseline:summary(baseline.result),
    alternative:summary(pilot.result),
    sourceReplayMechanicsVerified:false,qualifiedForCompetitiveInference:false,
    limitations:[
      'Single frozen source opportunity, with an opt-in turn27 setup policy',
      'Natural other seeds and starts, opponent competence and all paper mechanics unqualified',
      'The predicate checks static board eligibility but delegates full attack legality to engine'
    ]
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
