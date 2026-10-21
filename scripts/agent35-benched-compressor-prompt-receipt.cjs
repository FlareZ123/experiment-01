'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Source-deal-locked, postgame only prompt receipt for an already registered
 * historical paired run. Reads whole-game JSON artifacts, never joins a
 * decision policy and never accesses a concealed Store zone.
 * @param {object} base Original common-policy four-arm JSON.
 * @param {object} treatment Identical physical deals, Benched-Mewtwo opt-in.
 * @returns {object} One development-only conversion packet.
 */
function audit(base,treatment){
  assert.equal(base.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(base.competitiveQualifiedGames,0);
  assert.equal(treatment.competitiveQualifiedGames,0);
  const id='11:2:B:new-moon-lockbreaker-v1';
  const before=base.rows.find(row=>row.trial.id===id);
  const after=treatment.rows.find(row=>row.trial.id===id);
  assert.ok(before&&after);
  assert.equal(before.trial.seed,after.trial.seed);
  assert.equal(before.sourceDealFingerprint,after.sourceDealFingerprint);
  assert.equal(before.actualStarterSeat,after.actualStarterSeat);
  const roots=after.candidateBattleCompressorRoots??[];
  const ownerDeck=after.candidateOwnDeckSelectionEvidence??[];
  const ownerPrompt=(after.nativePromptChoices?.events??[])
    .filter(row=>row.actorSeat===after.candidateSeat &&
      row.kind==='ChooseCardsPrompt' && row.sourceZone==='deck' &&
      row.sourcePlayerSlot===after.candidateSeat);
  const root=roots.find(row=>row.turn===3&&row.ordinal===21);
  assert.ok(root,'Original same-deal turn3 root21 Compressor disappeared');
  const candidateSelection=ownerDeck.filter(row=>
    row.initiatingCard==='Battle Compressor'||
    row.parentRootOrdinal===root.ordinal);
  return {
    schema:'agent35-owner-native-prompt-after-actual-turn3-compressor-v1',
    trial:id,
    provenance:{head:'read from workflow checkout',sourceDeal:after.sourceDealFingerprint,
      seed:after.trial.seed,actualStarterSeat:after.actualStarterSeat,
      controlRoot:before.rootActionLedgerSha256,
      treatmentRoot:after.rootActionLedgerSha256},
    observedCompressorRoots:roots,
    candidateOwnedDeckSelectionEvidence:candidateSelection,
    ownerDeckPrompts:ownerPrompt.filter(row=>
      row.turn<=7 || candidateSelection.some(x=>x.ordinal===row.ordinal)),
    sourceDeckSelectionDuringSameEarlyWindow:ownerPrompt.filter(row=>
      row.turn<=7).length,
    actualCandidateAttacks:after.candidateAttackDeclarationEvidence??[],
    control:{actions:before.actionCount,finished:before.finished,
      winner:before.winner,prizes:before.finalPrizeCounts??null},
    treatment:{actions:after.actionCount,finished:after.finished,
      winner:after.winner,prizes:after.finalPrizeCounts??null},
    // Native Store prompt resolution and real post-prompt zone movement must
    // be checked independently before declaring donor discard completion.
    demonstratedDonorDiscard:false,
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const [baseFile,treatmentFile]=process.argv.slice(2);
  assert.ok(baseFile&&treatmentFile);
  const packet=audit(
    JSON.parse(fs.readFileSync(baseFile,'utf8')),
    JSON.parse(fs.readFileSync(treatmentFile,'utf8'))
  );
  process.stdout.write(JSON.stringify(packet,null,2)+'\n');
  process.stderr.write('BENCHED_COMPRESSOR_NATIVE_OWNER_PROMPT '+
    JSON.stringify({trial:packet.trial,roots:packet.observedCompressorRoots,
      choices:packet.candidateOwnedDeckSelectionEvidence,
      earlyNativePrompts:packet.ownerDeckPrompts})+'\n');
}

module.exports={audit};
