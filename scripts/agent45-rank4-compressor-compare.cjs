'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');

/**
 * Compare exact rank4 paired native Store transcripts.
 * Abort on any seed/deck/policy mismatch or unconfirmed causal prefix.
 * @param {any} control
 * @param {any} treatment
 */
function compare(control,treatment) {
  assert.equal(control.totalScheduled,8);
  assert.equal(treatment.totalScheduled,8);
  for(const k of ['planDigest','fieldDigest','researchRevision','expectedEngineRevision']){
    assert.equal(control[k],treatment[k]);
  }
  const cf={...control.policyFlags},tf={...treatment.policyFlags};
  assert.equal(cf.rank4RaichuCompressorSource,false);
  assert.equal(tf.rank4RaichuCompressorSource,true);
  assert.equal(cf.battleCompressorPositiveSelectionCorrection,true);
  assert.equal(tf.battleCompressorPositiveSelectionCorrection,true);
  delete cf.rank4RaichuCompressorSource;
  delete tf.rank4RaichuCompressorSource;
  assert.deepEqual(cf,tf);
  const rows=[];
  for(let i=0;i<8;i++){
    const b=control.records[i],a=treatment.records[i];
    assert.equal(b.trialId,a.trialId);
    assert.equal(b.status,'completed-engine-game');
    assert.equal(a.status,'completed-engine-game');
    assert.equal(b.seed,a.seed);
    assert.equal(b.candidateDigest,a.candidateDigest);
    assert.equal(b.opponentDigest,a.opponentDigest);
    assert.deepEqual(b.engineDeckHashes,a.engineDeckHashes);
    assert.deepEqual(b.turnEvidence,a.turnEvidence);
    assert.equal(b.engineRevision,a.engineRevision);
    const source=a.candidateEngineSlot==='A'?1:0;
    assert.equal(a.sourceCompressorSeat,source);
    assert.equal(b.sourceCompressorSeat,null);
    const rb=b.traceSummary.rootActionLedger;
    const ra=a.traceSummary.rootActionLedger;
    const mb=b.traceSummary.chronologicalActionTrace;
    const ma=a.traceSummary.chronologicalActionTrace;
    const sourcePlayed=events=>events.filter(e=>e.playerSlot===source &&
      e.action==='PlayCardAction'&&e.card==='Battle Compressor');
    assert.equal(sourcePlayed(mb).length,0);
    const item=sourcePlayed(ma);
    assert.equal(item.length,1);
    const ordinal=item[0].actionOrdinal;
    assert.equal(item[0].turnBefore,source===0?1:2);
    assert.equal(ra[ordinal].actionOrdinal,ordinal);
    assert.equal(ra[ordinal].action,'PlayCardAction');
    assert.equal(ra[ordinal].playerSlot,source);
    assert.deepEqual(rb.slice(0,ordinal),ra.slice(0,ordinal));
    const nativePromptChain=ra.slice(ordinal+1,ordinal+4);
    assert.deepEqual(nativePromptChain.map(x=>[
      x.action,x.pendingPrompt,x.initiatingRootActionOrdinal
    ]),[
      ['ResolvePromptAction','ChooseCardsPrompt',ordinal],
      ['ResolvePromptAction','ShuffleDeckPrompt',ordinal],
      ['ResolvePromptAction','WaitPrompt',ordinal]
    ]);
    const selection=ma.find(x=>x.actionOrdinal===ordinal+1)?.cardSelection;
    assert.equal(selection?.message,'CHOOSE_CARD_TO_DISCARD');
    assert.equal(selection?.sourceZone,'deck');
    assert.equal(selection?.sourcePlayerSlot,source);
    assert.deepEqual(selection?.selectedCards,[
      'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR'
    ]);
    const before=b.traceSummary.electrodeOpportunitySummary.positionFrontier
      .countsBySeat[source];
    const after=a.traceSummary.electrodeOpportunitySummary.positionFrontier
      .countsBySeat[source];
    rows.push({
      trialId:a.trialId,sourceSeat:source,seed:a.seed,
      firstDifferentRootOrdinal:ordinal,
      itemTurn:item[0].turnBefore,
      cardSelection:selection.selectedCards,
      control:{
        actions:b.actions,sourceAttacks:b.opponentAttacks,
        sourceWon:b.winnerIndex===source,
        bothStageOneBenched:before.bothBenched,
        bothWithThreeDiscard:before.bothBenchedWithThreeDiscardSpecial,
        heldRopeResourceWindow:before.heldEscapeRopePrizeWindow
      },
      treatment:{
        actions:a.actions,sourceAttacks:a.opponentAttacks,
        sourceWon:a.winnerIndex===source,
        bothStageOneBenched:after.bothBenched,
        bothWithThreeDiscard:after.bothBenchedWithThreeDiscardSpecial,
        heldRopeResourceWindow:after.heldEscapeRopePrizeWindow
      }
    });
  }
  const sum=(arm,key)=>rows.reduce((n,r)=>n+Number(r[arm][key]),0);
  return {
    protocol:'agent45-rank4-source-first-compressor-pair-v1',
    researchRevision:control.researchRevision,
    planDigest:control.planDigest,
    totalPairs:rows.length,
    itemRootAndPromptChainAcceptedInAll:true,
    itemPlays:{control:0,treatment:rows.length},
    sourceAttackDeclarations:{
      control:sum('control','sourceAttacks'),treatment:sum('treatment','sourceAttacks')
    },
    bothStageOneBenchedDecisionSnapshots:{
      control:sum('control','bothStageOneBenched'),
      treatment:sum('treatment','bothStageOneBenched')
    },
    bothStageOneWithThreeEnergyDiscardSnapshots:{
      control:sum('control','bothWithThreeDiscard'),
      treatment:sum('treatment','bothWithThreeDiscard')
    },
    heldRopeResourceDecisionSnapshots:{
      control:sum('control','heldRopeResourceWindow'),
      treatment:sum('treatment','heldRopeResourceWindow')
    },
    sourceEngineWins:{
      control:sum('control','sourceWon'),treatment:sum('treatment','sourceWon')
    },
    changedWinnerRecords:rows.filter(r=>r.control.sourceWon!==r.treatment.sourceWon)
      .map(r=>r.trialId),
    competitivelyQualifiedGames:0,
    rows
  };
}
if(require.main===module){
  const control=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const treatment=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(compare(control,treatment),null,2)+'\n');
}
module.exports={compare};
