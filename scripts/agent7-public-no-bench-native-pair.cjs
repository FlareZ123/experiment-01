'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {firstActionDifference}=require('./agent7-same-root-pass-attack-pair.cjs');

const VERSION='agent7-native-public-single-pokemon-terminal-ko-v1';

/**
 * Exact same-deal original Store screen, with a held-out negative control:
 * a known lone Active is in range of a paid public printed attack. All other
 * historical arms must remain unaltered when the opponent has a Bench or
 * the knockout is unavailable. This is a diagnostic development check.
 *
 * @param {object} control Genuine owner-root chooser observer only.
 * @param {object} selected Identical setup with public terminal KO option on.
 * @returns {object} Actual native accepted action and post-KO board result.
 */
function comparePublicTerminalPair(control,selected){
  for(const report of [control,selected]){
    assert.equal(report.attempted,4);
    assert.equal(report.rows?.length,4);
    assert.equal(report.competitiveQualifiedGames,0);
    assert.equal(report.winRateCertified,false);
    assert.equal(report.actorOnlyCompositionOptIn,true);
    assert.equal(report.sameRootProposalAuditedArms,4);
    assert.equal(report.sameRootPublicNoBenchTerminalOptIn,true);
    assert.equal(report.sameRootPassAttackProbeGlobalTurn,null);
    assert.equal(report.sameRootProbeAllOptIn,false);
    assert.equal(report.nativeAcceptedTargetsOptIn,true);
  }
  assert.equal(control.sameRootChoiceApplyOptIn,false);
  assert.equal(selected.sameRootChoiceApplyOptIn,true);
  assert.equal(control.sameRootChangedRoots,0);
  assert.equal(selected.sameRootChangedRoots,1,
    'Expected exactly one authentic discrete terminal policy choice');
  let terminalChanged=0;
  const rows=[];
  for(let i=0;i<4;i++){
    const a=control.rows[i],b=selected.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceSeat,b.sourceSeat);
    assert.equal(a.sourceDeckFingerprint,b.sourceDeckFingerprint);
    assert.equal(a.candidateDeckFingerprint,b.candidateDeckFingerprint);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.qualifiesForCompetitiveInference,false);
    assert.equal(b.qualifiesForCompetitiveInference,false);
    const point=firstActionDifference(a.rootActionLedger,b.rootActionLedger);
    let acceptedAttack=null,settledAttack=null,retainedPrefix=null;
    if(point>=0){
      assert.equal(a.trial.id,'6:0:A:champion-reference',
        'Unexpected selected branch outside the predeclared lone-Active state');
      const old=a.rootActionLedger[point],now=b.rootActionLedger[point];
      assert.ok(old&&now);
      assert.equal(old.playerSlot,a.sourceSeat);
      assert.equal(now.playerSlot,b.sourceSeat);
      assert.equal(old.turnBefore,now.turnBefore);
      assert.equal(old.turnBefore,4);
      assert.equal(old.action,'PassTurnAction');
      assert.equal(now.action,'AttackAction');
      assert.equal(now.attack,'Volt Cyclone');
      retainedPrefix=point;
      acceptedAttack=now;
      settledAttack=b.sourceAttackSettlement.attacks.find(entry=>
        entry.attackName==='Volt Cyclone'&&entry.turnBefore===4);
      assert.ok(settledAttack?.settledPromptChain===true,
        'Native Store attack failed to settle its actual prompts');
      assert.equal(settledAttack.settlementCrossesClockReset,false);
      const before=settledAttack.publicBoardBefore[b.candidateSeat];
      const after=settledAttack.publicBoardAfter[b.candidateSeat];
      assert.ok(before?.active);
      assert.equal(before.bench.length,0);
      assert.equal(after.active,null);
      assert.equal(after.bench.length,0);
      assert.equal(b.finished,true);
      assert.equal(b.winner,b.sourceSeat);
      assert.equal(b.endReason,'engine-game-end');
      assert.equal(b.rootActionLedgerSha256===a.rootActionLedgerSha256,false);
      terminalChanged++;
    }else{
      assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
      assert.equal(a.finished,b.finished);
      assert.equal(a.winner,b.winner);
      assert.equal(a.endReason,b.endReason);
      assert.equal(a.actionCount,b.actionCount);
    }
    rows.push({id:a.trial.id,sourceSeat:a.sourceSeat,
      firstActionDivergenceIndex:point,
      nativeBeforeActionsPreserved:retainedPrefix,
      acceptedAttack,settledAttack,
      sourceChanged:a.rootActionLedgerSha256!==b.rootActionLedgerSha256,
      control:{finished:a.finished,winner:a.winner,
        actions:a.actionCount,endReason:a.endReason,
        prizes:a.finalPrizes},
      selected:{finished:b.finished,winner:b.winner,
        actions:b.actionCount,endReason:b.endReason,
        prizes:b.finalPrizes}});
  }
  assert.equal(terminalChanged,1);
  return {
    version:VERSION,pinnedTwinleaf:control.enginePin,
    pairedHistoricalOriginalStoreArms:4,
    terminalSingleActiveAttackChanged:terminalChanged,
    preservedOtherThreeArms:true,
    initialOriginal60AndPhysicalDealsIdentical:true,
    rows,competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'A genuine accepted and settled Store terminal KO in one known state is not a certified paper-rule or 32-field win rate; it does not prove future states, protected defenders, or full-game policy competence.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Usage: node scripts/agent7-public-no-bench-native-pair.cjs OFF.json ON.json');
  const parse=path=>JSON.parse(fs.readFileSync(path,'utf8'));
  const result=comparePublicTerminalPair(
    parse(process.argv[2]),parse(process.argv[3]));
  process.stdout.write('PUBLIC_LONE_ACTIVE_NATIVE_PAIR '+
    JSON.stringify(result)+'\n');
}

module.exports={VERSION,comparePublicTerminalPair};
