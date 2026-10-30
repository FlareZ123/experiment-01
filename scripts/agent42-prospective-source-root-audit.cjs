'use strict';

const assert=require('node:assert/strict');

/**
 * Posthoc, observer-only census of source player choices in the original
 * preregistered 32-arm Agent41 canonical native scout. The original archived
 * JSON must be supplied by the caller; no hidden state is exposed to an actor.
 * An attempted game/arm is the denominator, including caps and unfinished arms.
 * This diagnostic cannot establish that a held mobility card was legal to play.
 *
 * @param {Array<object>} rows Original developmentResult.rows, never filtered
 *   by game outcome or source first-player status.
 * @returns {{arms:number,sourcePairs:number,byRank:Record<string,object>}}
 */
function auditProspectiveSourceRoots(rows){
  assert.ok(Array.isArray(rows)&&rows.length===32,
    'Require full 32 original registered arms, without selective exclusion');
  const ids=new Set();
  const byRank={};
  for(const row of rows){
    const trial=row.trial;
    assert.ok(trial&&typeof trial.id==='string');
    assert.ok(!ids.has(trial.id),'Duplicate frozen trial '+trial.id);
    ids.add(trial.id);
    assert.ok(row.sourceSeat===0||row.sourceSeat===1);
    assert.ok(trial.rank===6||trial.rank===11);
    const key=String(trial.rank);
    const stat=byRank[key]??={
      attemptedArms:0,sourceFirstArms:0,sourceSecondArms:0,
      firstSourceTurnPassArms:0,firstSourceTurnCardActionCounts:{},
      sourceRootActions:{},sourceRootCardActions:{},
      sourcePasses:0,sourcePassesHoldingMobility:0,
      sourcePassesHoldingMobilityWithBench:0,
      sourcePassesFirstSixTurns:0,
      sourcePassesHoldingMobilityFirstSixTurns:0,
      sourceDeclaredAttacks:{},
      sourceLinePackets:0,sourceLineVerified:0,
      nativeTerminals:0,actionCaps:0
    };
    stat.attemptedArms++;
    if(row.sourceActuallyFirst)stat.sourceFirstArms++;
    else stat.sourceSecondArms++;
    if(row.finished===true)stat.nativeTerminals++;
    if(row.endReason==='action-limit')stat.actionCaps++;
    const roots=(row.rootActionLedger??[]).filter(r=>
      r.playerSlot===row.sourceSeat&&r.pendingPrompt==null);
    assert.ok(roots.length>0,'Missing first source root '+trial.id);
    for(const r of roots){
      stat.sourceRootActions[r.action]=(stat.sourceRootActions[r.action]??0)+1;
      if(r.action==='PlayCardAction'){
        const card=r.card??'unidentified';
        stat.sourceRootCardActions[card]=
          (stat.sourceRootCardActions[card]??0)+1;
      }
      if(r.action==='AttackAction'){
        const attack=r.attack??'unidentified';
        stat.sourceDeclaredAttacks[attack]=
          (stat.sourceDeclaredAttacks[attack]??0)+1;
      }
    }
    const firstTurn=roots[0].turnBefore;
    const firstActions=roots.filter(r=>r.turnBefore===firstTurn);
    assert.equal(firstActions.at(-1).action,'PassTurnAction'||
      firstActions.at(-1).action==='AttackAction',true,
      'Expected source first turn to close by native pass or attack');
    if(firstActions.some(r=>r.action==='PassTurnAction'))
      stat.firstSourceTurnPassArms++;
    for(const action of firstActions.filter(r=>r.action==='PlayCardAction')){
      const c=action.card??'unidentified';
      stat.firstSourceTurnCardActionCounts[c]=
        (stat.firstSourceTurnCardActionCounts[c]??0)+1;
    }
    const passes=roots.filter(r=>r.action==='PassTurnAction');
    const observer=row.sourceOwnerPostPassMobility;
    assert.ok(observer&&Array.isArray(observer.observations));
    assert.equal(observer.totalSourcePasses,passes.length,
      'Unmatched source pass count '+trial.id);
    assert.deepEqual(observer.observations.map(o=>o.ordinal).sort((a,b)=>a-b),
      passes.map(p=>p.actionOrdinal).sort((a,b)=>a-b),
      'Source-only native pass ordinal mismatch '+trial.id);
    stat.sourcePasses+=passes.length;
    for(const o of observer.observations){
      if(o.globalTurn<=6)stat.sourcePassesFirstSixTurns++;
      if(!o.hasHeldMobility)continue;
      stat.sourcePassesHoldingMobility++;
      if(o.globalTurn<=6)stat.sourcePassesHoldingMobilityFirstSixTurns++;
      if(Array.isArray(o.benchNames)&&o.benchNames.length>0)
        stat.sourcePassesHoldingMobilityWithBench++;
    }
    const packet=row.sourceLinePacket;
    if(packet){
      stat.sourceLinePackets++;
      if(packet.matchingSourceAttackDeclared===true)
        stat.sourceLineVerified++;
    }
  }
  assert.equal(byRank[6]?.attemptedArms,16);
  assert.equal(byRank[11]?.attemptedArms,16);
  return {arms:32,sourcePairs:16,byRank};
}

module.exports={auditProspectiveSourceRoots};
