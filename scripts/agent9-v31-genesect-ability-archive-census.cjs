'use strict';

const assert=require('node:assert/strict');

const VERSION='agent9-v31-genesect-ability-native-archive-census-v1';
const SOURCE_PRINT='Genesect V FST';
const MODES=Object.freeze(['frozenV2Control','integratedV3']);

/**
 * Detect native accepted source-hand Genesect V placement with the post-Store
 * public Pokémon location change. Counts physical accepted placements, not
 * unique physical copies or turns with an Ability actually available.
 * @param {object} event Actual Store accepted-target sidecar event.
 * @param {0|1} sourceSeat Original source player's physical seat.
 * @returns {boolean}
 */
function isAcceptedGenesectBench(event,sourceSeat){
  if(event?.storeAccepted!==true||
      event?.action!=='PlayCardAction'||
      event?.playerSlot!==sourceSeat||
      event?.declared?.ownerHandPrinting!==SOURCE_PRINT)return false;
  return (event.publicBoardChanges??[]).some(change=>
    change.seat===sourceSeat&&change.position==='bench'&&
    change.after?.pokemon===SOURCE_PRINT&&
    change.before?.pokemon!==SOURCE_PRINT);
}

/**
 * Read complete immutable 16-arm native original rank5 archive. The active
 * Ability must be invoked through a native UseAbilityAction; this ledger
 * distinguishes that action from passive board Ability effects and non-play.
 *
 * @param {object} archive Parsed rank5 integrated v3.1 native archive JSON.
 * @returns {object} Both-policy owner-seat action census; zero win claims.
 */
function censusArchivedGenesectAbility(archive){
  assert.equal(archive?.schema,
    'agent13-integrated-rank5-v31-corrected-root-release-v1');
  assert.equal(archive.attempted,16);
  const output={version:VERSION,sourceOriginalRank:5,
    pinnedEngine:archive.enginePin,
    modes:{},all16NativeAttemptsCovered:false,
    competitiveQualifiedGames:0};
  let observed=0;
  for(const mode of MODES){
    const attempts=archive.modes?.[mode]?.attempts;
    assert.ok(Array.isArray(attempts)&&attempts.length===8);
    const ids=new Set();
    const report={attempts:0,sourceAcceptedUseAbilityAction:0,
      bothSeatsAcceptedUseAbilityAction:0,
      sourceAcceptedAttackAction:0,
      sourceAcceptedGenesectHandBenchPlays:0,
      sourceAcceptedPlayCardAction:0,
      sourceAcceptedPassTurnAction:0,
      sourceAcceptedResolvePromptAction:0,
      rootsInspected:0,sourceRootActionsInspected:0,rows:[]};
    for(const attempt of attempts){
      const r=attempt.rawNativeRow;
      const id=attempt.trial?.id;
      assert.ok(typeof id==='string'&&!ids.has(id));
      ids.add(id);
      assert.equal(attempt.trial?.rank,5);
      assert.ok(r?.sourceSeat===0||r?.sourceSeat===1);
      const sourceSeat=r.sourceSeat;
      const roots=r.rootActionLedger;
      assert.ok(Array.isArray(roots));
      assert.equal(roots.length,r.rootActionCount);
      assert.equal(roots.length,r.actionCount);
      const zoneEvents=r.nativeAcceptedTargetSidecar?.events;
      assert.ok(Array.isArray(zoneEvents));
      const sourceRoots=roots.filter(e=>e.playerSlot===sourceSeat);
      const sourceActions=sourceRoots.map(e=>e.action);
      const genesect=zoneEvents.filter(e=>
        isAcceptedGenesectBench(e,sourceSeat));
      const abilities=sourceActions.filter(x=>x==='UseAbilityAction').length;
      const both=roots.filter(e=>e.action==='UseAbilityAction').length;
      const attacks=sourceActions.filter(x=>x==='AttackAction').length;
      report.attempts++;
      report.rootsInspected+=roots.length;
      report.sourceRootActionsInspected+=sourceRoots.length;
      report.sourceAcceptedUseAbilityAction+=abilities;
      report.bothSeatsAcceptedUseAbilityAction+=both;
      report.sourceAcceptedAttackAction+=attacks;
      report.sourceAcceptedGenesectHandBenchPlays+=genesect.length;
      report.sourceAcceptedPlayCardAction+=sourceActions.filter(x=>x==='PlayCardAction').length;
      report.sourceAcceptedPassTurnAction+=sourceActions.filter(x=>x==='PassTurnAction').length;
      report.sourceAcceptedResolvePromptAction+=sourceActions.filter(x=>x==='ResolvePromptAction').length;
      report.rows.push({trialId:id,sourceSeat,acceptedSourceAbilityActions:abilities,
        acceptedAnyAbilityActions:both,sourceAttackActions:attacks,
        sourceGenesectHandBenchPlays:genesect.map(e=>e.actionOrdinal),
        rootCount:roots.length,engineTerminal:r.finished===true,
        actionCap:r.finished===false,qualification:false});
    }
    output.modes[mode]=report;
    observed+=report.attempts;
  }
  output.all16NativeAttemptsCovered=observed===16;
  return output;
}

module.exports={VERSION,SOURCE_PRINT,MODES,
  isAcceptedGenesectBench,censusArchivedGenesectAbility};
