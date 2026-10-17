'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withTurn28CopycatShredFork}=
  require('./mimikyu-turn28-shred-fork.cjs');

/**
 * A single source-locked policy fork. This is a diagnosed opportunity in
 * seed 4246551499, never a randomized matchup or a win-rate estimate.
 */
function main() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(x=>[x.rank,x]));
  const champion=byRank.get(1),regidrago=byRank.get(10);
  assert.ok(champion?.playableUnderEngine&&regidrago?.playableUnderEngine);
  initializeCards();
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {AttackAction}=require(path.join(output,'game/store/actions/game-actions'));
  const {ResolvePromptAction}=
    require(path.join(output,'game/store/actions/resolve-prompt-action'));
  const types={Store,Bot:SimpleTacticsAi,AttackAction,ResolvePromptAction};
  const request={
    deckA:regidrago.cardIds,deckB:champion.cardIds,
    seed:4246551499,maxActions:350,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:1,
    mimikyuTurn27SetupSeat:1,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const run=(forceShred,rootActionOrdinal)=>withStoreDispatchTranscript(Store,
    ()=>withTurn28CopycatShredFork(types,()=>runMatch(request),
      {forceShred,rootActionOrdinal}),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const original=run(false),forked=run(true);
  const ordinalAudit=process.env.COPYCAT_ORDINAL_AUDIT==='1'
    ? run(true,215) : null;
  const control=original.result.result,alternate=forked.result.result;
  assert.deepEqual(runMatch(request),control,
    'Observer/fork experiment must preserve the original source game');
  assert.equal(original.result.opportunities.length,1);
  assert.equal(forked.result.opportunities.length,1);
  assert.equal(forked.result.shredSelections.length,1);
  assert.equal(original.result.forcedAttack,false);
  assert.equal(forked.result.forcedAttack,true);
  const before=original.actionTrace,after=forked.actionTrace;
  const pick=e=>({
    action:e.action,parameters:e.parameters,
    pendingPrompt:e.pendingPrompt||null,
    zoneDigestBefore:e.zoneDigestBefore,
    zoneDigestAfter:e.zoneDigestAfter,
    continuityDigestBefore:e.continuityDigestBefore,
    continuityDigestAfter:e.continuityDigestAfter
  });
  const firstIndex=Array.from({length:Math.min(before.length,after.length)},
    (_,i)=>i).find(i=>JSON.stringify(pick(before[i]))!==
      JSON.stringify(pick(after[i])));
  assert.equal(firstIndex,215,
    'Source replay prefix changed before historical turn-28 retreat');
  assert.equal(before[firstIndex].action,'RetreatAction');
  assert.equal(after[firstIndex].action,'AttackAction');
  assert.equal(after[firstIndex].parameters.name,'Copycat');
  assert.equal(before[firstIndex].zoneDigestBefore,
    after[firstIndex].zoneDigestBefore);
  assert.equal(before[firstIndex].continuityDigestBefore,
    after[firstIndex].continuityDigestBefore);
  assert.equal(before[firstIndex].zoneDigestBefore,
    '5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d');
  assert.equal(before[firstIndex].continuityDigestBefore,
    '0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548');
  let ordinalSourceAudit=null;
  if (ordinalAudit) {
    const ordained=ordinalAudit.actionTrace;
    const ordinalDifference=Array.from(
      {length:Math.min(before.length,ordained.length)},(_,i)=>i)
      .find(i=>JSON.stringify(pick(before[i]))!==
        JSON.stringify(pick(ordained[i])));
    assert.equal(ordinalDifference,215,
      'Direct-ordinal policy diverged before archived root retreat');
    assert.equal(ordained[215].action,'AttackAction');
    assert.equal(ordained[215].parameters.name,'Copycat');
    assert.equal(ordinalAudit.result.forcedAttack,true);
    assert.equal(ordinalAudit.result.opportunities.length,1);
    assert.equal(ordinalAudit.result.opportunities[0].rootActionOrdinal,215);
    assert.equal(ordinalAudit.result.shredSelections.length,1);
    ordinalSourceAudit={
      sourceOrdinal:215,
      bypassedGenericBotDecisionAtFork:true,
      firstActionDivergence:ordinalDifference,
      controlAction:before[215].action,
      directAction:ordained[215].action,
      sourceZoneFingerprintMatches:
        before[215].zoneDigestBefore===ordained[215].zoneDigestBefore,
      cardHistoryFingerprintMatches:
        before[215].continuityDigestBefore===
          ordained[215].continuityDigestBefore,
      ordinalBranchOutcomeEqualsBotProposalFork:
        JSON.stringify(ordinalAudit.result.result)===
          JSON.stringify(forked.result.result),
      sourceZoneDigestAtAction:ordained[215].zoneDigestBefore,
      sourceHistoryDigestAtAction:ordained[215].continuityDigestBefore,
      ordinalBranchRootActions:ordained.length,
      ordinalBranchWinner:ordinalAudit.result.result.winner,
      ordinalBranchPrizeCounts:ordinalAudit.result.result.prizesRemaining
    };
  }
  const compact=game=>({actions:game.actions,turns:game.turns,
    winner:game.winner,finished:game.finished,
    prizeCounts:game.prizesRemaining,
    attacks:game.attackTrace.filter(t=>t.turn>=27)});
  return {
    schema:'rank10-mimikyu-turn28-shred-fork-v1',
    sourceRanks:[10,1],candidatePhysicalSeat:1,seed:request.seed,
    firstSourceDivergence:{index:firstIndex,
      controlAction:before[firstIndex].action,
      counterfactualAction:after[firstIndex].action,
      preActionZoneDigest:before[firstIndex].zoneDigestBefore,
      preActionContinuityDigest:before[firstIndex].continuityDigestBefore},
    sourceOpportunity:original.result.opportunities[0],
    forcedOpportunity:forked.result.opportunities[0],
    chosenAttack:forked.result.shredSelections[0],
    original:compact(control),counterfactual:compact(alternate),
    ordinalSourceAudit,
    graphQualification:false,paperMechanicsQualified:false,
    qualifiedForCompetitiveInference:false,
    caveat:'Exact one-deal scripted counterfactual; all generic-bot actions remain unqualified'
  };
}
if(require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
