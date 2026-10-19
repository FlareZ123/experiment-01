'use strict';

const assert=require('node:assert/strict');
const {scheduledArms,executeArm,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {preparedFrozenDecks}=
  require('./agent17-crossrank-trigger-replay.cjs');

const ARCHIVED_CENSORS=Object.freeze({
  '6:0:B:champion-reference':{turns:32,prizes:[3,6],attacks:[0,4]},
  '6:0:B:new-moon-lockbreaker-v1':{turns:36,prizes:[5,6],attacks:[0,1]},
  '6:1:A:new-moon-lockbreaker-v1':{turns:46,prizes:[6,6],attacks:[0,0]},
  '6:1:B:champion-reference':{turns:31,prizes:[2,2],attacks:[3,6]},
  '6:2:B:champion-reference':{turns:30,prizes:[4,6],attacks:[0,4]},
  '6:2:B:new-moon-lockbreaker-v1':{turns:31,prizes:[3,6],attacks:[5,3]},
  '11:0:A:champion-reference':{turns:36,prizes:[2,6],attacks:[3,1]},
  '11:0:B:new-moon-lockbreaker-v1':{turns:41,prizes:[6,3],attacks:[5,9]},
  '11:1:B:new-moon-lockbreaker-v1':{turns:37,prizes:[1,6],attacks:[9,8]},
  '11:2:B:new-moon-lockbreaker-v1':{turns:49,prizes:[6,6],attacks:[0,23]}
});

/** @returns {object[]} */
function selectedCensors() {
  const lookup=new Map(scheduledArms().map(row=>[row.id,row]));
  const rows=Object.keys(ARCHIVED_CENSORS).map(id=>{
    const trial=lookup.get(id);
    assert(trial && trial.repeat<=2);
    return trial;
  });
  assert.equal(rows.length,10);
  assert.equal(new Set(rows.map(row=>row.id)).size,10);
  return rows;
}

/**
 * Retrospective: no new unbiased trials or deck win-rate denominator.
 * Records final face-up board, unresolved prompt types, last 24 accepted
 * roots, last Pass public boards and last logged attacks.
 * @returns {object}
 */
function run() {
  assertManifest();
  const prepared=preparedFrozenDecks();
  const rows=selectedCensors().map(trial=>{
    try {
      const out=executeArm(trial,prepared,{captureFinalCapEvidence:true});
      const expected=ARCHIVED_CENSORS[trial.id];
      const candidateSlot=trial.candidateSlot==='A'?0:1;
      const observedAttacks=[out.candidateAttackDeclarations,
        out.sourceAttackDeclarations];
      const originalCountsMatched=
        out.actions===260 && out.turns===expected.turns &&
        JSON.stringify(out.prizesRemaining)===JSON.stringify(
          candidateSlot===0?expected.prizes:expected.prizes.slice().reverse()) &&
        JSON.stringify(observedAttacks)===JSON.stringify(expected.attacks);
      return {
        id:trial.id,rank:trial.rank,repeat:trial.repeat,seed:trial.seed,
        candidateSlot:trial.candidateSlot,sourceActuallyFirst:out.sourceActuallyFirst,
        verifiedFirstTurn:out.verifiedFirstTurn,
        status:out.status,actions:out.actions,turns:out.turns,
        candidateAttackDeclarations:out.candidateAttackDeclarations,
        sourceAttackDeclarations:out.sourceAttackDeclarations,
        prizesByPhysicalSeat:out.prizesRemaining,
        originalOutcomeCountsMatched:Boolean(originalCountsMatched),
        rootActionLedgerSha256:out.rootActionLedgerSha256,
        finalCapEvidence:out.finalCapEvidence,
        qualifiedCompetitiveGame:false
      };
    }catch(error) {
      return {id:trial.id,rank:trial.rank,seed:trial.seed,
        status:'retrospective-cap-forensic-error',
        error:String(error?.stack||error),qualifiedCompetitiveGame:false};
    }
  });
  return {
    schema:'agent17-retrospective-crossrank-censor-tail-v1',
    originalSourceRun:39193837824,originalPartition0Arms:24,
    originalActionLimit:260,
    selectedArchiveCensors:10,physicalSeedSlots:new Set(
      selectedCensors().map(x=>[x.rank,x.repeat,x.candidateSlot].join(':'))).size,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    rows,qualifiedCompetitiveGames:0,rankingPermitted:false,
    sampling:'retrospectively selected historical action caps only',
    limitations:'Recorded public late roots can identify last action types, not certify legal alternatives, human timing or competitive deck performance.'
  };
}

module.exports={ARCHIVED_CENSORS,selectedCensors,run};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
