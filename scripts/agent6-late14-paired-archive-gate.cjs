'use strict';

const assert=require('node:assert/strict');

const ID='11:2:B:new-moon-lockbreaker-v1';
const REQUIRED_DONORS=['Gengar & Mimikyu-GX TEU','Trevenant & Dusknoir-GX SMP'];

/**
 * Independently classify the four archived fixed-seed development arms.
 * The historical baseline is intentionally capped: its missing result is
 * censoring rather than a loss. Every deck/source-seat fingerprint must
 * remain identical before comparing decisions.
 *
 * @param {object} baseline Archived canonical default common-policy packet.
 * @param {object} late Archived same four-arm late14 Compressor packet.
 * @returns {object} Strictly mechanical evidence, never a win-rate estimate.
 */
function classifyPairedLate14(baseline,late){
  assert.equal(baseline.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(late.enginePin,baseline.enginePin);
  assert.equal(baseline.rows.length,4);
  assert.equal(late.rows.length,4);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(late.competitiveQualifiedGames,0);
  assert.equal(late.ownerCompressorLate14OptIn,true);
  const before=new Map(baseline.rows.map(r=>[r.trial.id,r]));
  const after=new Map(late.rows.map(r=>[r.trial.id,r]));
  assert.equal(before.size,4);
  assert.equal(after.size,4);
  const contrasts=[];
  for(const [id,b] of before){
    const a=after.get(id);
    assert.ok(a,'Missing paired trial '+id);
    assert.deepEqual(a.trial,b.trial);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.sourceFirstOwnHandSha256,b.sourceFirstOwnHandSha256);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.candidateSeat,b.candidateSeat);
    assert.equal(a.sourceSeat,b.sourceSeat);
    assert.equal(a.verifiedFirstTurn,true);
    assert.equal(b.verifiedFirstTurn,true);
    contrasts.push({
      id,sourceActuallyFirst:a.sourceActuallyFirst,
      sourceDealFingerprint:a.sourceDealFingerprint,
      rootLedgerUnchanged:a.rootActionLedgerSha256===b.rootActionLedgerSha256,
      baseline:{actions:b.actionCount,finished:b.finished,
        endReason:b.endReason,winner:b.winner,
        candidateAttackDeclarations:b.attackDeclarations.candidate,
        sourceAttackDeclarations:b.attackDeclarations.source},
      late:{actions:a.actionCount,finished:a.finished,
        endReason:a.endReason,winner:a.winner,
        candidateAttackDeclarations:a.attackDeclarations.candidate,
        sourceAttackDeclarations:a.attackDeclarations.source}
    });
  }
  const b=before.get(ID),a=after.get(ID);
  assert.ok(a && b);
  const compressor=(a.candidateBattleCompressorRoots||[]).find(root=>
    root.turn===11&&root.card==='Battle Compressor');
  assert.ok(compressor,'No actual archived turn-11 owner Compressor root');
  const selection=(a.candidateOwnDeckSelectionEvidence||[]).find(row=>
    row.parentRootOrdinal===compressor.ordinal);
  assert.ok(selection,'No search selection linked to the actual Item root');
  for(const donor of REQUIRED_DONORS){
    assert.ok(selection.selectedCards.includes(donor),'Missing donor '+donor);
  }
  const copied=a.candidateAttackDeclarationEvidence||[];
  assert.deepEqual(copied.map(x=>({turn:x.turn,attack:x.attackName})),[
    {turn:21,attack:'Poltergeist'},
    {turn:23,attack:'Poltergeist'}
  ]);
  assert.equal(b.attackDeclarations.candidate,0);
  assert.equal(b.finished,false);
  assert.equal(b.endReason,'action-limit');
  assert.equal(a.finished,true);
  assert.equal(a.winner,a.candidateSeat);
  assert.equal(a.finalPrizes[a.candidateSeat],0);
  assert.equal(a.sourceAudit?.completed,false,
    'This result is not a witnessed completed source early-lock line');
  for(const row of contrasts){
    assert.equal(row.rootLedgerUnchanged,row.id!==ID,
      'Unexpected extra policy divergence at '+row.id);
  }
  return {
    schema:'agent6-late14-four-arm-paired-qualification-boundary-v1',
    id:ID,enginePin:late.enginePin,sourceDealIdenticalForAllFour:true,
    unchangedRootArms:contrasts.filter(x=>x.rootLedgerUnchanged).length,
    changedRootArms:contrasts.filter(x=>!x.rootLedgerUnchanged).length,
    donorPreparation:{
      turn:compressor.turn,rootOrdinal:compressor.ordinal,
      searchOrdinal:selection.ordinal,
      selectedDonors:selection.selectedCards,
      evidence:'actual owner-Item root linked to genuine own-deck prompt selection'
    },
    candidateAttackDeclarations:copied,
    earliestAttackGlobalTurnLag:copied[0].turn-compressor.turn,
    sourceEarlyGarbodorLockCompleted:false,
    engineWinnerOnly:a.winner,
    effectQualification:{
      settledPublicAttacksAllActors:a.settledPublicAttackCount,
      archivedFirstSettledOnly:a.firstSettledPublicAttack?.length??0,
      candidatePerAttackSettledDamageVerified:false,
      printedPoltergeistEffectVerified:false,
      missing:'per-actor post-prompt-settled damage, Knock Outs, and source response for both candidate declarations'
    },
    contrasts,competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'One retrospectively selected, candidate-first rank-11 development deal. Original control was action-censored and opposing Boost Shake source early-lock did not complete. Engine terminal is not a qualified paper-game outcome.'
  };
}

if(require.main===module){
  const fs=require('node:fs');
  const [baselinePath,latePath]=process.argv.slice(2);
  if(!baselinePath || !latePath){
    throw new Error('Provide extracted baseline and late14 research JSON paths');
  }
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  process.stdout.write(JSON.stringify(classifyPairedLate14(
    read(baselinePath),read(latePath)),null,2)+'\n');
}
module.exports={classifyPairedLate14,ID};
