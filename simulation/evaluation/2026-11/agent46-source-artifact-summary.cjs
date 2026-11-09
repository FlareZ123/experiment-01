'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

/**
 * Read a previously produced, immutable GitHub Actions JSON artifact.
 * Never rerun or invent native games. Event callbacks are diagnostic
 * proposals and may occur during a Simulator branch; actual attacks
 * are sourced exclusively from the returned native attackTrace.
 *
 * @param {string} directory Extracted one-artifact directory.
 * @returns {object}
 */
function summarize(directory){
  const names=fs.readdirSync(directory).filter(name=>name.endsWith('.json'));
  assert.equal(names.length,1,'Expected exactly one immutable JSON source artifact');
  const source=path.join(directory,names[0]);
  const x=JSON.parse(fs.readFileSync(source,'utf8'));
  const rows=x.rows??[];
  const pairs=x.matches??x.pairs??[];
  const statuses=Object.fromEntries([...new Set(rows.map(row=>row.status))]
    .map(status=>[status,rows.filter(row=>row.status===status).length]));
  const sourcePairs=pairs.map(pair=>{
    const before=pair.baselineCopycat??pair.fogCopycat??null;
    const after=pair.treatmentCopycat??pair.treasureCopycat??null;
    return {
      seed:pair.seed,seat:pair.seat,
      matchedPhysicalOpening:pair.sameInitialSourceDeal??
        pair.samePhysicalDeal??null,
      baselineStatus:pair.baselineStatus??pair.fogStatus??null,
      treatmentStatus:pair.treatmentStatus??pair.treasureStatus??null,
      baselineCopycat:before,treatmentCopycat:after,
      observedCopycatDelta:before!==null&&after!==null?after-before:null,
      proposedPriority:pair.proposals??null,
      selectedFogPrompt:pair.actualFogSelections??null,
      proposedTreasure:pair.treasureProposals??null,
      selectedTreasureDiscardPrompt:pair.physicalDragonDiscards??null,
      selectedTreasureSearchPrompt:pair.physicalMimikyuSelections??null
    };
  });
  const pairedGameRows=sourcePairs.map((pair,i)=>{
    const before=rows[i*2]??{},after=rows[i*2+1]??{};
    const beforeFinal=before.nativeFinalState?.[pair.seat]??{};
    const afterFinal=(after.nativeFinalState??after.finalState)?.[pair.seat]??{};
    return {...pair,
      baselineOpponentApex:
        before.actualOpponentApexCount??before.actualOpponentApex??null,
      treatmentOpponentApex:
        after.actualOpponentApexCount??after.actualOpponentApex??null,
      baselineOwnerFinalBench:beforeFinal.benchedPokemon??null,
      treatmentOwnerFinalBench:afterFinal.benchedPokemon??null,
      baselineWinnerSeat:before.winnerSeat??null,
      treatmentWinnerSeat:after.winnerSeat??null
    };
  });
  const countOpponentApex=key=>pairedGameRows.reduce((sum,pair)=>
    sum+(pair[key]??0),0);
  const output={
    schema:'agent46-immutable-native-artifact-summary-v1',
    sourceArtifact:names[0],originalSchema:x.schema,
    originalRunPreserved:true,
    nativeAttempts:x.nativeAttempts??x.attempts??rows.length,
    pairCount:sourcePairs.length,
    matchedPhysicalOpenings:sourcePairs.filter(row=>
      row.matchedPhysicalOpening===true).length,
    nativeStatusCounts:statuses,
    observedOpponentApexAttacks:{
      baseline:countOpponentApex('baselineOpponentApex'),
      treatment:countOpponentApex('treatmentOpponentApex')
    },
    nativeReportedWinnerSeats:{
      baseline:pairedGameRows.map(x=>x.baselineWinnerSeat),
      treatment:pairedGameRows.map(x=>x.treatmentWinnerSeat)
    },
    selectedCounterPolicyAttacks:{
      before:sourcePairs.reduce((sum,row)=>
        sum+(row.baselineCopycat??0),0),
      after:sourcePairs.reduce((sum,row)=>
        sum+(row.treatmentCopycat??0),0)
    },
    sourceProposalCallbacksAreNotNativeAcceptedActions:true,
    competitivePaperGames:0,
    diagnostics:pairedGameRows
  };
  return output;
}
if(require.main===module){
  const dir=path.resolve(process.argv[2]||'replay');
  console.log('AGENT46_ARCHIVED_SOURCE_SUMMARY '+JSON.stringify(summarize(dir)));
}
module.exports={summarize};
