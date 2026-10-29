'use strict';

const assert=require('node:assert/strict');
const fullField=require('../../results/aichi-2026/full-decklists.json');

const SCHEMA='agent8-canonical-original-source-play-coverage-v1';
const PRINTED_NAME_ALIASES=Object.freeze({
  'Thunder Mountain Prism Star':'Thunder Mountain ♢'
});
const SUPPORTERS=Object.freeze({
  6:Object.freeze(['Plumeria','Guzma','Guzma & Hala',
    'Team Flare Grunt','Lusamine','Cynthia & Caitlin',
    'Team Skull Grunt','Faba','Eri','Sidney','Gladion',
    "Lillie's Determination","Team Rocket's Handiwork"]),
  11:Object.freeze(['Carmine','Marnie','Guzma'])
});
const PRIORITY_CARDS=Object.freeze({
  6:Object.freeze(['Plumeria','Crushing Hammer','Enhanced Hammer',
    'Team Flare Grunt','Lusamine',"Team Rocket's Handiwork",
    'Guzma','Captivating Poké Puff','Echoing Horn']),
  11:Object.freeze(['Carmine','Marnie','Battle VIP Pass','Quick Ball',
    "Professor's Letter",'Dark Patch','VS Seeker','Secret Box'])
});

/**
 * Read-only count of accepted first-person source actions and printed-card
 * tactic coverage. Every printed name is verified against its registered
 * original source 60. No rejected proposals, owner's hidden hand or inferred
 * legal play opportunity is counted.
 *
 * @param {object[]} rows Archived native Store result rows.
 * @param {object[]} sourceDecks Printed exact original 60s.
 * @returns {object} Failure-inclusive source-action coverage, not quality score.
 */
function originalSourcePlayCoverage(rows,sourceDecks=fullField.decks){
  assert.ok(Array.isArray(rows)&&rows.length>0);
  assert.ok(Array.isArray(sourceDecks));
  const decks=new Map(sourceDecks.map(deck=>[deck.rank,deck]));
  const group=new Map();
  for(const row of rows){
    const rank=row.trial?.rank;
    assert.ok(rank===6||rank===11,'This fixed audit covers only source ranks 6/11');
    const original=decks.get(rank);
    assert.ok(original&&Array.isArray(original.cards));
    assert.equal(original.cards.reduce((n,x)=>n+x.count,0),60);
    assert.equal(row.qualifiesForCompetitiveInference,false);
    assert.ok(row.sourceSeat===0||row.sourceSeat===1);
    assert.ok(row.sourceActuallyFirst===true||row.sourceActuallyFirst===false);
    assert.ok(Array.isArray(row.rootActionLedger));
    const printing=new Map(original.cards.map(card=>[card.name,card]));
    const printedSupporters=new Set(SUPPORTERS[rank]);
    const priority=new Set(PRIORITY_CARDS[rank]);
    for(const name of [...printedSupporters,...priority]){
      assert.equal(printing.get(name)?.category,'Trainer',
        'Source tactic category is not a printed source Trainer: '+name);
    }
    const summary=group.get(rank)??{
      rank,sourcePlayer:original.player,attemptedArms:0,
      physicalSourceFirstArms:0,physicalSourceSecondArms:0,
      nativeRootCounts:{},sourceCardPlays:{},
      playedByPrintedCategory:{'Pokémon':0,Trainer:0,Energy:0},
      sourceSupporterPlays:0,sourcePriorityPlanCardPlays:0,
      firstOwnTurnsWithOnlyPass:0,firstOwnTurnsObserved:0,
      firstOwnTurnsWithAnyCardPlay:0,
      sourceCardPlayUnknownPrintings:[],
      censoredArms:0,naturalTerminals:0
    };
    group.set(rank,summary);
    summary.attemptedArms++;
    if(row.sourceActuallyFirst)summary.physicalSourceFirstArms++;
    else summary.physicalSourceSecondArms++;
    if(row.finished===true)summary.naturalTerminals++;
    else summary.censoredArms++;

    const roots=row.rootActionLedger.filter(e=>
      e.playerSlot===row.sourceSeat&&e.pendingPrompt===null);
    for(const root of roots){
      assert.ok(typeof root.action==='string');
      summary.nativeRootCounts[root.action]=
        (summary.nativeRootCounts[root.action]??0)+1;
      if(root.action!=='PlayCardAction')continue;
      assert.ok(typeof root.card==='string');
      const name=PRINTED_NAME_ALIASES[root.card]??root.card;
      const card=printing.get(name);
      assert.ok(card,'Store accepted unknown original-source card: '+root.card);
      summary.sourceCardPlays[name]=(summary.sourceCardPlays[name]??0)+1;
      summary.playedByPrintedCategory[card.category]++;
      if(printedSupporters.has(name))summary.sourceSupporterPlays++;
      if(priority.has(name))summary.sourcePriorityPlanCardPlays++;
    }
    const firstTurn=row.sourceActuallyFirst?1:2;
    const firstRoots=roots.filter(e=>e.turnBefore===firstTurn);
    if(firstRoots.length>0){
      summary.firstOwnTurnsObserved++;
      if(firstRoots.length===1&&firstRoots[0].action==='PassTurnAction')
        summary.firstOwnTurnsWithOnlyPass++;
      if(firstRoots.some(e=>e.action==='PlayCardAction'))
        summary.firstOwnTurnsWithAnyCardPlay++;
    }
  }
  const perRank=[...group.values()].sort((a,b)=>a.rank-b.rank);
  return {schema:SCHEMA,attemptedArms:rows.length,
    sourceRanks:perRank.map(x=>x.rank),
    perRank,allArmsRetained:true,
    qualifiedCompetitiveGames:0,
    limitations:'Accepted native Store root actions only; no owner hand opportunity inference, native turn cap is censoring, Ability lock can be passive and source LO deliberately avoids early attack'};
}

/** Original archived 32-arm JSON, never launches a new game. */
function auditOriginalSourcePlayCoverage(archive){
  const {auditOriginalScout}=
    require('../../scripts/agent8-audit-registered-source-pairs.cjs');
  auditOriginalScout(archive);
  const report=originalSourcePlayCoverage(archive.developmentResult.rows);
  assert.equal(report.attemptedArms,32);
  assert.deepEqual(report.perRank.map(x=>x.attemptedArms),[16,16]);
  return report;
}

module.exports={SCHEMA,SUPPORTERS,PRIORITY_CARDS,
  originalSourcePlayCoverage,auditOriginalSourcePlayCoverage};
