'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {object} event @returns {object} */
function shortEvent(event){
  return {
    ordinal:event.actionOrdinal,turn:event.turnBefore,seat:event.playerSlot,
    action:event.action,card:event.card??null,attack:event.attack??null,
    ability:event.ability??null,
    selected:event.cardSelection?.selectedCards??null,
    sourceZone:event.cardSelection?.sourceZone??null,
    handBefore:event.decisionHandBefore??null
  };
}

/**
 * Interpret an immutable CI artifact after the fact, without replaying or
 * rerunning the pinned game. This is a chronological hypothesis aid, not an
 * independent confirmation of policy correctness or card legality.
 * @param {object} archive Prior source-matched Tool Power report.
 * @returns {object}
 */
function inspectArchive(archive){
  assert.equal(archive.schema,'rank8-hood-tool-power-source-contrast-v1');
  assert.equal(archive.seed,1260748957);
  const [baseline,experiment]=archive.arms||[];
  assert.equal(baseline?.name,'baseline');
  assert.equal(experiment?.name,'tool-power-v1');
  assert.equal(baseline.attachedToolPowerPolicy,false);
  assert.equal(experiment.attachedToolPowerPolicy,true);
  assert.deepEqual(baseline.deckHashes,experiment.deckHashes);
  assert.equal(baseline.verifiedByDrawLog,true);
  assert.equal(experiment.verifiedByDrawLog,true);
  assert.equal(baseline.firstTurnSlot,0);
  assert.equal(experiment.firstTurnSlot,0);
  const star=experiment.decisionTrace.find(event=>
    event.action==='UseAbilityAction'&&event.ability==='Star Alchemy' &&
    event.playerSlot===1);
  assert.ok(star,'The pinned source archive must contain candidate Star Alchemy');
  const selected=experiment.decisionTrace.find(event=>
    event.actionOrdinal>star.actionOrdinal &&
    event.actionOrdinal<=star.actionOrdinal+12 &&
    event.playerSlot===1 &&
    event.cardSelection?.message==='CHOOSE_CARD_TO_HAND');
  assert.ok(selected,'Actual post-Star search target must be observed');
  const selectedNames=selected.cardSelection.selectedCards;
  assert.ok(Array.isArray(selectedNames)&&selectedNames.length===1);
  const targetName=selectedNames[0].split(' ').slice(0,-1).join(' ');
  const after=arm=>arm.decisionTrace.filter(event=>
    event.playerSlot===1&&event.actionOrdinal>star.actionOrdinal);
  const laterTargetPlay=arm=>after(arm).filter(event=>
    event.action==='PlayCardAction'&&event.card===targetName)
    .map(shortEvent);
  const context=arm=>{
    const index=arm.decisionTrace.findIndex(event=>
      event.actionOrdinal>=star.actionOrdinal);
    return arm.decisionTrace.slice(Math.max(0,index-3),index+15)
      .map(shortEvent);
  };
  return {
    schema:'rank8-hood-stone-search-archive-inspection-v1',
    sourceRun:archive.sourceResearchRevision,
    immutableSourceSeed:archive.seed,
    candidateSeat:1,
    recordedFirstDifference:archive.firstRootDecisionDifference,
    starUse:shortEvent(star),
    ownDeckSelection:shortEvent(selected),
    selectedNames,
    laterCandidateTargetPlays:{
      baseline:laterTargetPlay(baseline),
      toolPolicy:laterTargetPlay(experiment)
    },
    aroundFirstDifference:{
      baseline:context(baseline),toolPolicy:context(experiment)
    },
    finalPrizeCounts:{
      baseline:baseline.prizeCounts,toolPolicy:experiment.prizeCounts
    },
    limitations:[
      'The stored action trace summarizes Store dispatches and omits independent complete prompt lineage',
      'Card selection is from the actual source deck after an Ability search and thus legitimately reveals card identity',
      'This fixed known outcome is not an independent win-rate sample or competent opponent audit'
    ]
  };
}
if(require.main===module){
  const filename=process.argv[2]||'rank8-hood-stone-policy-contrast.json';
  const report=inspectArchive(JSON.parse(fs.readFileSync(filename,'utf8')));
  console.log(JSON.stringify(report,null,2));
}
module.exports={inspectArchive,shortEvent};
