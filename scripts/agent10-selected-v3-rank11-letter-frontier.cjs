'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const roster=require('../results/aichi-2026/full-decklists.json');

const VERSION='agent10-selected-v3-rank11-letter-frontier-v1';
const LETTER='Professors Letter BKT';
const SOURCE=roster.decks.find(x=>x.rank===11);
assert.ok(SOURCE);
assert.equal(SOURCE.cards.reduce((n,c)=>n+c.count,0),60);
const darkness=SOURCE.cards.find(x=>x.name==='Darkness Energy');
const letter=SOURCE.cards.find(x=>x.name==="Professor's Letter");
assert.equal(darkness.count,8);
assert.equal(letter.count,4);

/**
 * Read-only exact archived source-owner decision extraction. Observed offered
 * actions and negative-only necessity rows are never promoted to complete
 * legality, strategic improvement, or competitive outcome claims.
 *
 * @param {object} archive Actual native selected-v3 archive.
 * @returns {object} Reproducible descriptive owner-root census.
 */
function analyze(archive){
  assert.equal(archive.schema,
    'agent4-selected-v3-paper-owner-floatstone-source-a-b-a-v1');
  const mode=archive.modes.find(x=>
    x.id==='selected-v3-paper-plus-funded-mobility');
  assert.ok(mode);
  const sourceRows=mode.fullNative.rows.filter(x=>x.trial.rank===11);
  assert.equal(sourceRows.length,4);
  const cases=[],allLetter=[];
  for(const row of sourceRows){
    assert.equal(row.sourceActuallyFirst,true);
    assert.equal(row.sourceSeat,row.actualStarterSeat);
    const observations=row.actorOnlyDecisionCoverage
      .ownerTrainerFrontierAudit.roots
      .filter(x=>x.seat===row.sourceSeat);
    assert.ok(observations.length>0);
    const first=observations[0];
    assert.equal(first.turn,1);
    assert.equal(first.seat,row.sourceSeat);
    const handSize=row.sourceFirstOwnedAffordances.firstOwnHand.handSize;
    assert.equal(handSize,7);
    assert.equal(first.trainers.length,7,
      'All seven physical opening-hand cards were Trainers');
    const events=[];
    for(const root of observations){
      const printed=root.trainers.filter(x=>x.printing===LETTER);
      if(!printed.length)continue;
      const rows=root.ownerPaperNecessity.rows;
      for(const original of printed){
        const paper=rows.find(x=>x.handIndex===original.handIndex);
        assert.ok(paper);
        assert.equal(paper.printing,original.printing);
        events.push({
          turn:root.turn,rootOrdinal:root.ordinal,
          handIndex:original.handIndex,
          offered:original.nativeEnumeratorOffered,
          publicBlocker:original.publicBlocker,
          necessaryBlockers:paper.necessaryBlockers,
          paperPlayable:paper.paperPlayable,
          chosen:root.chosen.action,
          chosenPrinting:root.chosen.trainer?.printing??null
        });
      }
    }
    const plays=(row.rootActionLedger??[]).filter(x=>
      x.playerSlot===row.sourceSeat &&
      x.action==='PlayCardAction'&&
      x.card?.includes('Letter'));
    const exactOpening=first.trainers.map(x=>x.printing);
    cases.push({
      trialId:row.trial.id,
      candidateId:row.trial.candidateId,
      sourceSeat:row.sourceSeat,
      sourceDealFingerprint:row.sourceDealFingerprint,
      sourceFirst:true,
      firstRoot:{
        turn:first.turn,handSize,trainerCount:first.trainers.length,
        exactlyAllTrainers:true,printings:exactOpening,
        letterHeld:exactOpening.includes(LETTER),
        letterNativeOffered:first.trainers.some(x=>
          x.printing===LETTER&&x.nativeEnumeratorOffered===true),
        choice:first.chosen,
        firstRootPaperCertificate:first.ownerPaperNecessity.rows.filter(x=>
          x.printing===LETTER)
      },
      letterHeldOwnerRoots:events.length?
        new Set(events.map(x=>x.rootOrdinal)).size:0,
      letterHeldCopyObservations:events.length,
      letterNativeOfferedCopyObservations:
        events.filter(x=>x.offered===true).length,
      letterHeldPassRootCount:
        new Set(events.filter(x=>x.chosen==='PassTurnAction')
          .map(x=>x.rootOrdinal)).size,
      letterNecessaryNegativeCopyObservations:
        events.filter(x=>x.necessaryBlockers.length>0).length,
      actualLetterPlayRootCount:plays.length,
      firstTurnLetterEnergyAccessBound:
        exactOpening.includes(LETTER)?
          Math.max(0,darkness.count-6):null,
      events
    });
    allLetter.push(...events);
  }
  const sourceDealGroups=new Map();
  for(const row of cases){
    const group=sourceDealGroups.get(row.sourceDealFingerprint)??[];
    group.push(row.trialId);
    sourceDealGroups.set(row.sourceDealFingerprint,group);
  }
  assert.equal(sourceDealGroups.size,2,
    'Two independent original source physical-opening fingerprints');
  assert.deepEqual([...sourceDealGroups.values()].map(x=>x.length),[2,2]);
  return {
    schema:VERSION,archiveArtifactId:13260514792,
    archivalZipSha256:'303d11947c39c7572b4302fef8666ab744491e9db745dd8ffadc55b1631c0850',
    rank:11,originalRegisteredDarknessEnergyCopies:darkness.count,
    originalRegisteredLetterCopies:letter.count,
    exactOriginalPhysicalSourceDeals:sourceDealGroups.size,
    pairedCandidateContexts:cases.length,
    initialSourceHandsFullyTrainer:cases.filter(x=>
      x.firstRoot.exactlyAllTrainers).length,
    openingSourceDealsWithLetter:new Set(cases.filter(x=>
      x.firstRoot.letterHeld).map(x=>x.sourceDealFingerprint)).size,
    openingLetterEnergyMinimumInDeckGivenAllSevenTrainers:darkness.count-6,
    repeatedLetterHeldCopyObservations:allLetter.length,
    repeatedLetterNativeOfferedCopyObservations:
      allLetter.filter(x=>x.offered===true).length,
    repeatedLetterNecessaryNegativeCopyObservations:
      allLetter.filter(x=>x.necessaryBlockers.length>0).length,
    sourceSelectedLetterRoots:cases.reduce((n,x)=>
      n+x.actualLetterPlayRootCount,0),
    sourcePassRootObservationsHoldingLetter:cases.reduce((n,x)=>
      n+x.letterHeldPassRootCount,0),
    ownerRootObservationsNotIndependent:true,
    completePaperLegalityCertified:false,
    actualPaidLetterEffectWitness:false,
    competitivelyQualifiedGames:0,
    cases
  };
}

if(require.main===module){
  assert.ok(process.argv[2],'Original extracted native JSON path is required');
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(analyze(archive),null,2)+'\n');
}

module.exports={VERSION,analyze};
