'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const registration = require('../results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json');
const published = require('../results/aichi-2026/full-decklists.json');

const VERSION = 'agent10-rank11-heldout-source-selected-trainer-roots-v1';
const rank11 = published.decks.find(x => x.rank === 11);
assert.ok(rank11, 'Authenticated original rank-11 source list required');
assert.equal(rank11.cards.reduce((n,x) => n + x.count, 0), 60);

const SUPPORTERS = new Set(['Carmine','Marnie','Guzma']);
const ITEMS = new Set(['Battle VIP Pass','Quick Ball',"Professor's Letter",
  'Dark Patch','Boost Shake','Escape Rope','Super Rod','VS Seeker','Secret Box']);
const TOOLS = new Set(['Float Stone','Forest Seal Stone','Muscle Band']);
const STADIUMS = new Set(['Shopping Center','Temple of Sinnoh']);
const relevant = [...SUPPORTERS,...ITEMS,...TOOLS,...STADIUMS];
const cardCounts = new Map(rank11.cards.map(c => [c.name,c.count]));
for (const name of relevant) assert.ok(cardCounts.has(name),
  'Expected Trainer must be included in original published 60: '+name);

/**
 * Native root cards often append a printing code to the unique card name.
 * Do not interpret a nonmatching token as a played card.
 * @param {unknown} printedCard
 * @returns {{name:string,category:string}|null}
 */
function originalTrainerRoot(printedCard) {
  if(typeof printedCard !== 'string') return null;
  for(const name of relevant) {
    if(printedCard !== name && !printedCard.startsWith(name+' ')) continue;
    return {
      name,
      category: SUPPORTERS.has(name)?'Supporter':
        ITEMS.has(name)?'Item':
        TOOLS.has(name)?'Tool':'Stadium'
    };
  }
  return null;
}

/**
 * @param {object} row A completed or capped archived original native Store row
 * @param {0|1} sourceSeat Authenticated original source physical seat
 */
function extractSourceRoots(row,sourceSeat) {
  assert.ok(sourceSeat===0 || sourceSeat===1);
  const roots=(row.rootActionLedger??[]).filter(r=>
    r.playerSlot===sourceSeat);
  const firstTurns=[...new Set(roots
    .map(r=>r.turnBefore)
    .filter(n=>Number.isSafeInteger(n)))].sort((a,b)=>a-b).slice(0,2);
  const issued=roots.filter(r=>r.action==='PlayCardAction');
  const trainerRootEvents=issued.flatMap(r=>{
    const trainer=originalTrainerRoot(r.card);
    if(!trainer)return [];
    return [{
      name:trainer.name,category:trainer.category,
      turn:r.turnBefore,ordinal:r.actionOrdinal??null,
      isOneOfFirstTwoSourceTurns:firstTurns.includes(r.turnBefore)
    }];
  });
  const countByCategory={Supporter:0,Item:0,Tool:0,Stadium:0};
  const countByNamedTrainer={};
  for(const e of trainerRootEvents) {
    countByCategory[e.category]++;
    countByNamedTrainer[e.name]=(countByNamedTrainer[e.name]??0)+1;
  }
  const attacks=roots.filter(r=>r.action==='AttackAction');
  const sourceDarkness=(row.nativeAcceptedTargetSidecar?.events??[])
    .filter(e=>e.playerSlot===sourceSeat && e.storeAccepted===true &&
      e.declared?.ownerHandPrinting==='Darkness Energy MEE' &&
      e.publicBoardChanges?.some(x=>
        x.seat===sourceSeat && x.after?.energies?.length >
          (x.before?.energies?.length??0)));
  return {
    sourceSeat,sourceTurnsObserved:[...new Set(roots.map(r=>r.turnBefore)
      .filter(Number.isSafeInteger))].length,
    firstTwoOriginalSourceTurns:firstTurns,
    actualSourceRootCount:roots.length,
    sourceSelectedCardRoots:issued.length,
    sourceUnclassifiedCardRoots:issued
      .filter(r=>originalTrainerRoot(r.card)===null)
      .map(r=>({turn:r.turnBefore,card:r.card??null})),
    trainerRootEvents,countByCategory,countByNamedTrainer,
    firstTwoSourceTurnTrainerRoots:trainerRootEvents
      .filter(e=>e.isOneOfFirstTwoSourceTurns),
    sourceAttackRoots:attacks.map(r=>({
      turn:r.turnBefore,attack:r.attack??null
    })),
    darknessPhysicalAttachments:sourceDarkness.length,
    nativeDisposition:row.finished?'terminal':
      row.endReason==='action-limit'?'action-limit':
        row.error?'error':'unclassified',
    competitiveQualified:false
  };
}

/** @param {object} archive Preregistered frozen actual native archive */
function inspect(archive) {
  assert.equal(archive.schema,'agent10-rank11-heldout-headway-4seed-v1');
  assert.equal(archive.actualNativeAttempts,24);
  const factors=Object.keys(registration.factors);
  assert.deepEqual(factors,['control','staged','activeHeadway']);
  const rows=[];
  for(const factor of factors) {
    const cases=archive.rawFactors?.[factor]?.rows;
    assert.equal(cases?.length,8);
    for(let i=0;i<registration.trialRows.length;i++){
      const trial=registration.trialRows[i];
      const row=cases[i];
      assert.equal(row.trial?.id,trial.id);
      const sourceSeat=trial.candidateSlot==='A'?1:0;
      rows.push({
        factor,
        registeredId:trial.id,
        seed:trial.seed,sourceSeat,candidateId:trial.candidateId,
        originalSource60MatchesRegistered:
          row.sourceDeckFingerprint===
          archive.rawFactors.control.rows[i].sourceDeckFingerprint,
        native:extractSourceRoots(row,sourceSeat)
      });
    }
  }
  assert.equal(rows.length,24);
  assert.ok(rows.every(r=>r.originalSource60MatchesRegistered));
  const aggregate={};
  for(const factor of factors) {
    const selected=rows.filter(r=>r.factor===factor);
    const counts={Supporter:0,Item:0,Tool:0,Stadium:0};
    const perCard={};
    let sourceRootCount=0;
    let firstTwoTurnTrainerEvents=0;
    let darknessPhysicalAttachments=0;
    let nativeCensors=0;
    for(const row of selected){
      sourceRootCount+=row.native.actualSourceRootCount;
      firstTwoTurnTrainerEvents+=row.native.firstTwoSourceTurnTrainerRoots.length;
      darknessPhysicalAttachments+=row.native.darknessPhysicalAttachments;
      nativeCensors+=Number(row.native.nativeDisposition==='action-limit');
      for(const [cat,n] of Object.entries(row.native.countByCategory))
        counts[cat]+=n;
      for(const [name,n] of Object.entries(row.native.countByNamedTrainer))
        perCard[name]=(perCard[name]??0)+n;
    }
    aggregate[factor]={
      sourceContexts:selected.length,
      originalSourceRootActions:sourceRootCount,
      sourceTrainerRootEventsByCategory:counts,
      sourceTrainerRootEventsByCard:perCard,
      contextsWithSourceTrainerRoot:selected.filter(r=>
        r.native.trainerRootEvents.length>0).length,
      firstTwoOriginalSourceTurnTrainerEvents:firstTwoTurnTrainerEvents,
      nativeDarknessPhysicalAttachments:darknessPhysicalAttachments,
      sourceClawContexts:selected.filter(r=>
        r.native.sourceAttackRoots.some(x=>
          x.attack==='Claw of Darkness')).length,
      actionCensors:nativeCensors
    };
  }
  return {schema:VERSION,archivedNativeRunId:41597727878,
    sourceOriginalRank:11,sourceOriginalPrintedSixty:rank11.cards,
    factors,aggregate,rows,
    originalTrialGroups:registration.seedGroups.length,
    qualifiedCompetitiveGames:0,
    limitation:'Selected post-choice source native PlayCardAction roots; untargeted Trainer roots do not by themselves prove native Store acceptance, payment, strategic merit or paper legality. Cases share source deals across fixed candidates; no independent sampling assertion from 24 rows.'};
}

if(require.main===module){
  assert.ok(process.argv[2],'Archived JSON input required');
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const result=inspect(archive);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={VERSION,originalTrainerRoot,extractSourceRoots,inspect};
