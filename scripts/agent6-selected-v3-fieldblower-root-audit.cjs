'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent6-selected-v3-fieldblower-source-root-audit-v1';
const SELECTED_MODE='selected-v3-paper-plus-funded-mobility';
const PRINT='Field Blower GRI';
const POSITIVE='public-target-and-physical-cost-present-unresolved';
const NEGATIVE='necessary-condition-failed';

/**
 * Audit the original archived selected-v3 paper-visible Field Blower target
 * certificates against every actually dispatched native owner-root action.
 * Observations, roots, turns and independent trials have separate denominators.
 *
 * @param {object} archive Original native 48-arm JSON, unchanged.
 * @returns {object} Conservative, strictly observed custody summary.
 */
function auditOriginalSelectedV3Blower(archive) {
  assert.ok(Array.isArray(archive?.modes));
  const selected=archive.modes.find(mode=>mode.id===SELECTED_MODE);
  assert.ok(selected&&selected.selectedObserver===true&&
    selected.fundedFloatStone===true&&Array.isArray(selected.fullNative?.rows),
  'Expected exact selected-v3 source-mode evidence');
  const totals={
    originalAttemptRows:selected.fullNative.rows.length,
    rowsWithLiveRootLedger:0,rowsWithoutLiveRootLedger:0,
    nativeOwnerRootsChecked:0,heldPhysicalCopyRootObservations:0,
    missingPublicTargetCopyRoots:0,positivePublicTargetCopyRoots:0,
    positiveDistinctNativeRoots:0,positiveDistinctOwnerTurns:0,
    positiveDistinctTrials:0,positiveActorSelectedFieldBlower:0,
    nativeFieldBlowerPlaysAllIntactTrials:0
  };
  const roots=new Set(),turns=new Set(),trials=new Set(),targets=new Set();
  const firstPositive=[];
  const errors=[];
  for(const game of selected.fullNative.rows){
    const trial=game.trial?.id;
    assert.equal(typeof trial,'string');
    const frontier=game.actorOnlyDecisionCoverage?.ownerTrainerFrontierAudit?.roots;
    if(!Array.isArray(frontier)){
      totals.rowsWithoutLiveRootLedger++;
      errors.push({trial,reason:'missing-live-root-frontier',
        nativeError:typeof game.error==='string'?game.error.split('\n')[0]:null});
      continue;
    }
    totals.rowsWithLiveRootLedger++;
    const native=game.rootActionLedger.filter(action=>
      action.action!=='ResolvePromptAction');
    assert.equal(frontier.length,native.length,
      'Owner frontier/root cardinality mismatch: '+trial);
    for(let i=0;i<frontier.length;i++){
      const root=frontier[i],actual=native[i];
      assert.equal(root.ordinal,i,'Nonsequential frontier ordinal: '+trial);
      assert.equal(root.turn,actual.turnBefore,'Native turn mismatch: '+trial);
      assert.equal(root.seat,actual.playerSlot,'Native owner-seat mismatch: '+trial);
      assert.equal(root.chosen.action,actual.action,'Native root-action mismatch: '+trial);
      totals.nativeOwnerRootsChecked++;
      if(actual.action==='PlayCardAction'&&actual.card==='Field Blower'){
        totals.nativeFieldBlowerPlaysAllIntactTrials++;
      }
      for(const item of root.ownerPaperNecessity.rows){
        if(item.printing!==PRINT)continue;
        totals.heldPhysicalCopyRootObservations++;
        const cert=item.removalTargetCertificate;
        assert.equal(cert?.printing,PRINT);
        assert.equal(cert.publicItemLocked,false);
        assert.equal(cert.printedRuleKnown,true);
        assert.equal(cert.paperPlayableCertified,false);
        if(cert.status===NEGATIVE){
          assert.equal(cert.eligibleTargetCount,0);
          totals.missingPublicTargetCopyRoots++;
          continue;
        }
        assert.equal(cert.status,POSITIVE,
          'Unexpected certificate status, requires source review');
        assert.equal(cert.eligibleTargetCount,cert.targets.length);
        assert.ok(cert.eligibleTargetCount>0);
        totals.positivePublicTargetCopyRoots++;
        const rootId=trial+':'+actual.actionOrdinal;
        if(!roots.has(rootId)&&firstPositive.length<6){
          firstPositive.push({trial,rank:game.trial.rank,
            sourceSeat:game.sourceSeat,actorSeat:root.seat,
            turn:root.turn,realNativeActionOrdinal:actual.actionOrdinal,
            realAction:actual.action,
            heldFieldBlowerHandIndex:item.handIndex,
            targets:cert.targets.map(target=>({...target})),
            nativeSourceDealSha256:game.sourceDealFingerprint,
            originalPhysicalDealSha256:game.fullPhysicalDealFingerprint});
        }
        roots.add(rootId);
        turns.add(trial+':'+root.seat+':'+root.turn);
        trials.add(trial);
        for(const target of cert.targets){
          targets.add(JSON.stringify(target));
        }
        if(actual.action==='PlayCardAction'&&actual.card==='Field Blower'){
          totals.positiveActorSelectedFieldBlower++;
        }
      }
    }
  }
  totals.positiveDistinctNativeRoots=roots.size;
  totals.positiveDistinctOwnerTurns=turns.size;
  totals.positiveDistinctTrials=trials.size;
  return {
    version:VERSION,
    originalArchiveSchema:archive.schema,
    archiveSourceMode:SELECTED_MODE,
    originalSelectedDecisionPolicySha256:selected.decisionPolicySha256,
    engineRevision:archive.pinnedEngineRevision,
    originalTrialRanks:archive.originalSourceRanks,
    totals,
    positivePublicTargetIdentities:[...targets].map(JSON.parse),
    firstPositiveRoots:firstPositive,
    unobservedAttempts:errors,
    limitations:[
      'A repeat of the same held copy at successive roots is not an independent game or opportunity.',
      'Public target and physical cost are necessary but insufficient to prove printed play, benefit, or winning counterfactual.',
      'Native Store action transport is compared with read-only owner-frontier records; no intervention was selected.',
      'No source 60, decision policy, native pin, paper timer, match winner or competitive qualification was modified.'
    ],
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const result=auditOriginalSelectedV3Blower(
    JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,SELECTED_MODE,PRINT,auditOriginalSelectedV3Blower};
