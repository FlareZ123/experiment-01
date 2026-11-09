'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {classifyVoltDonorDebt}=
  require('../agent45-volt-cyclone-donor-debt.cjs');

const SOURCE_RUN=42555406144;
const ARTIFACT_SHA='909fc3293b4d96533cc1fd5ce5cb4636e21501ad4b631ff62c5ae29a9b9526a9';

/**
 * Read one completed immutable raw native artifact, never trigger matches.
 * Current set of rows is eight exact original-source physical trials per arm.
 * @param {string} filename
 */
function audit(filename){
  const raw=JSON.parse(fs.readFileSync(filename,'utf8'));
  assert.equal(raw.schema,'agent23-integrated-original-rank6-owner-volt-v3-native-pair');
  assert.equal(raw.nativePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(raw.allEightSourceDealsMatch,true);
  assert.equal(raw.matchedFirstSeats,8);
  assert.equal(raw.pairs.length,8);
  assert.equal(raw.originalNativeRows.length,8);
  assert.equal(raw.treatmentNativeRows.length,8);
  const base=new Map(raw.originalNativeRows.map(x=>[x.trial.id,x]));
  const treatment=new Map(raw.treatmentNativeRows.map(x=>[x.trial.id,x]));
  const summary=raw.pairs.map(pair=>{
    const a=base.get(pair.trialId),b=treatment.get(pair.trialId);
    assert.ok(a&&b);
    const game=row=>({
      status:row.status??null,
      gameFinished:row.gameFinished??row.finished??false,
      winner:row.winner??null,
      remainingPrizes:row.finalPrizes??null,
      roots:row.rootActionLedger?.length??null,
      attacks:(row.sourceAttackSettlement?.attacks??[])
        .filter(x=>x.attackName==='Volt Cyclone')
        .map(x=>({
          turn:x.turnBefore,
          donor:classifyVoltDonorDebt(x,row.sourceSeat)
        }))
    });
    const c=game(a),t=game(b);
    return {
      id:pair.trialId,sourceSeat:pair.sourceSeat,
      prefix:pair.rawRootCommonPrefix,
      physicallyMatched:pair.matchedBaselineAndTreatmentSourceDeal,
      unchangedRootActions:pair.rawRootIdentical,
      control:c,treatment:t,
      prizeVectorChanged:JSON.stringify(c.remainingPrizes)!==
        JSON.stringify(t.remainingPrizes),
      terminalWinnerChanged:c.gameFinished&&t.gameFinished&&
        c.winner!==t.winner
    };
  });
  return {
    schema:'agent23-integrated-rank6-owner-v3-postrun-native-outcome-audit',
    inputRun:SOURCE_RUN,expectedRawArtifactZipSha256:ARTIFACT_SHA,
    completeSourceDealPairs:summary.filter(x=>x.physicallyMatched).length,
    v3NativePromptChoices:raw.actualOwnerPromptSelections,
    selectedOwnerReplies:raw.promptAudits.flatMap(x=>
      x.sourceOnlyPromptAudit?.publicOwnerSelectionReceipts??[]),
    nativeRootDivergences:summary.filter(x=>!x.unchangedRootActions).length,
    sourceAttackCount:{
      control:summary.reduce((n,x)=>n+x.control.attacks.length,0),
      treatment:summary.reduce((n,x)=>n+x.treatment.attacks.length,0)
    },
    prizeVectorChangedPairs:summary.filter(x=>x.prizeVectorChanged)
      .map(x=>x.id),
    terminalWinnerChangedPairs:summary.filter(x=>x.terminalWinnerChanged)
      .map(x=>x.id),
    trials:summary,competitivePaperQualifiedGames:0,winRate:null
  };
}

if(require.main===module){
  const source=process.argv[2]??
    path.resolve('artifacts/agent23-rank6-integrated-owner-volt-pair.json');
  const report=audit(source);
  process.stdout.write('AGENT23_RANK6_ARTIFACT_AUDIT '+
    JSON.stringify(report)+'\n');
}
module.exports={SOURCE_RUN,ARTIFACT_SHA,audit};
