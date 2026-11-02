'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {classifyNativeAttempt}=
  require('../simulation/evaluation/agent13-v3-rank5-original-release.cjs');

const VERSION='agent37-original-rank5-native-zero-attack-frontier-v2';

/**
 * Read only actual public, post-dispatch roots. A missing root does not prove
 * that the owner's hand lacked the card or that a different root was legal.
 * @param {object} row Original native Store row.
 * @param {number} sourceSeat Physical source seat.
 * @returns {object}
 */
function publicSourceRoots(row,sourceSeat){
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const accepted=roots.filter(x=>x.playerSlot===sourceSeat&&
    x.action!=='ResolvePromptAction');
  const names=accepted.map(x=>x.action);
  const tail=accepted.slice(-10).map(x=>({
    turnBefore:x.turnBefore??null,
    actionOrdinal:x.actionOrdinal??null,
    action:x.action??null,
    card:x.card??null,
    attack:x.attack??null
  }));
  return {
    acceptedSourceRootCount:accepted.length,
    sourceRootTypes:Object.fromEntries([...new Set(names)].sort()
      .map(name=>[name,names.filter(x=>x===name).length])),
    acceptedSourceMewVmaxPlayRoots:accepted.filter(x=>
      x.action==='PlayCardAction'&&typeof x.card==='string'&&
      x.card.startsWith('Mew VMAX')).length,
    // Genuine archived Store roots encode an ordinary hand Energy play as
    // PlayCardAction with the Energy's printed name. Treat these only as
    // accepted public plays, without inventing an unobserved recipient.
    acceptedSourceDcePlayCardRoots:accepted.filter(x=>
      x.action==='PlayCardAction'&&typeof x.card==='string'&&
      x.card.startsWith('Double Colorless Energy')).map(x=>({
        turnBefore:x.turnBefore??null,actionOrdinal:x.actionOrdinal??null
      })),
    sourceAcceptedCardPlays:accepted.filter(x=>
      x.action==='PlayCardAction').map(x=>({
        turnBefore:x.turnBefore??null,
        actionOrdinal:x.actionOrdinal??null,card:x.card??null
      })),
    acceptedSourceAttackRoots:accepted.filter(x=>x.action==='AttackAction')
      .map(x=>({turnBefore:x.turnBefore??null,
        attack:x.attack??null,actionOrdinal:x.actionOrdinal??null})),
    sourceRootTail:tail
  };
}

/**
 * Project a source player's actually accepted card recipient changes.
 * Sidecar snapshots are public after dispatch and do not reveal source hand
 * inventory, attempted alternate targets, or legal unused actions.
 * @param {object} row Original native Store row.
 * @param {number} sourceSeat Physical source seat.
 * @returns {object}
 */
function sourceCardTargetChanges(row,sourceSeat){
  const events=row.nativeAcceptedTargetSidecar?.events??[];
  const plays=events.filter(x=>x.playerSlot===sourceSeat&&
    x.storeAccepted===true&&x.action==='PlayCardAction');
  return {
    acceptedDceRecipients:plays.filter(x=>
      x.declared?.ownerHandPrinting?.startsWith('Double Colorless Energy'))
      .map(x=>({
        turnBefore:x.turnBefore??null,
        recipientChanges:(x.publicBoardChanges??[])
          .filter(y=>y.seat===sourceSeat&&
            y.after?.energies?.some(e=>e.startsWith('Double Colorless Energy')))
          .map(y=>({
            position:y.position,slotIndex:y.index??null,
            pokemon:y.after?.pokemon??null
          }))
      })),
    acceptedMewVmaxEvolutions:plays.filter(x=>
      x.declared?.ownerHandPrinting?.startsWith('Mew VMAX')).map(x=>({
        turnBefore:x.turnBefore??null,
        targetChanges:(x.publicBoardChanges??[])
          .filter(y=>y.seat===sourceSeat&&
            y.after?.pokemon==='Mew VMAX FST')
          .map(y=>({position:y.position,slotIndex:y.index??null}))
      }))
  };
}

/**
 * Find public transitions in settled opposing attacks that physically changed
 * this source player's Active. These are pressure windows, never automatic
 * evidence that a particular replacement or alternate attack was legal.
 * @param {object} row Original native Store row.
 * @param {number} sourceSeat Physical source seat.
 * @returns {object[]}
 */
function opponentActiveChanges(row,sourceSeat){
  const attacks=row.candidateAttackSettlement?.attacks??[];
  return attacks.filter(a=>
    a.settledPromptChain===true &&
    a.publicBoardBefore?.[sourceSeat]?.active?.name&&
    a.publicBoardAfter?.[sourceSeat]?.active?.name&&
    a.publicBoardBefore[sourceSeat].active.name !==
      a.publicBoardAfter[sourceSeat].active.name)
    .map(a=>({
      attackTurn:a.turnBefore??null,
      attackName:a.attackName??null,
      sourceActiveBefore:a.publicBoardBefore[sourceSeat].active.name,
      sourceActiveAfter:a.publicBoardAfter[sourceSeat].active.name,
      prizesBefore:a.prizesBefore??null,
      prizesAfter:a.prizesAfter??null,
      nextSourceSameEpochProven:a.nextSourceSameEpochProven??false
    }));
}

/**
 * Classify the unchanged archived v3.1 registered original-rank5 source arms
 * without conflating source policy strength with native terminal status.
 * @param {object} archive Archived rank5 experiment.
 * @returns {object}
 */
function auditRank5Archive(archive){
  assert.equal(archive.schema,
    'agent13-integrated-rank5-v31-corrected-root-release-v1');
  assert.equal(archive.attempted,16);
  assert.equal(archive.competitiveQualifiedGames,0);
  assert.equal(archive.actualSourcePrinted60Sha256,
    'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05');
  const control=archive.modes?.frozenV2Control?.attempts;
  const treatment=archive.modes?.integratedV3?.attempts;
  assert.ok(Array.isArray(control)&&Array.isArray(treatment));
  assert.equal(control.length,8);
  assert.equal(treatment.length,8);
  const summarise=(entry,mode)=>{
    const row=entry.rawNativeRow;
    assert.ok(row&&row.trial);
    assert.equal(row.trial.rank,5);
    assert.equal(entry.trial.id,row.trial.id);
    const candidateSlot=row.trial.candidateSlot;
    assert.ok(candidateSlot==='A'||candidateSlot==='B');
    const sourceSeat=candidateSlot==='A'?1:0;
    assert.equal(entry.evidence.sourceSeat,sourceSeat);
    const count=row.attackDeclarations?.source;
    const rootSummary=publicSourceRoots(row,sourceSeat);
    return {
      trialId:row.trial.id,mode,candidateSlot,
      sourceSeat,actualSourceFirstTurn:row.actualStarterSeat===sourceSeat,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      nativeStatus:classifyNativeAttempt(row),
      rawEndReason:row.endReason??null,
      rootActionCount:row.actionCount??null,
      originalSourceAttackDeclarations:Number.isSafeInteger(count)?count:null,
      ownerGenesectCopySelections:
        entry.evidence.ownerSourceGenesectCopiedSelections?.length??null,
      ...rootSummary,
      ...sourceCardTargetChanges(row,sourceSeat),
      opponentActiveChanges:opponentActiveChanges(row,sourceSeat)
    };
  };
  const baseline=control.map(x=>summarise(x,'frozenV2Control'));
  const integrated=treatment.map(x=>summarise(x,'integratedV3'));
  for(let i=0;i<8;i++){
    assert.equal(baseline[i].trialId,integrated[i].trialId);
  }
  const neverAttacked=integrated.filter(x=>
    x.originalSourceAttackDeclarations===0);
  const unknownAttackCount=integrated.filter(x=>
    x.originalSourceAttackDeclarations===null);
  return {
    schema:VERSION,sourceRank:5,
    originalPrinted60Sha256:archive.actualSourcePrinted60Sha256,
    nativeArchivedAttemptCount:16,
    treatmentAttemptCount:integrated.length,
    integratedZeroDeclaredAttackCount:neverAttacked.length,
    integratedUnknownAttackCount:unknownAttackCount.length,
    integratedPositiveAttackCount:integrated.filter(x=>
      Number.isSafeInteger(x.originalSourceAttackDeclarations)&&
      x.originalSourceAttackDeclarations>0).length,
    rows:integrated,
    noAttackRows:neverAttacked,
    controlRows:baseline.map(x=>({
      trialId:x.trialId,nativeStatus:x.nativeStatus,
      originalSourceAttackDeclarations:x.originalSourceAttackDeclarations,
      sourceDealFingerprint:x.sourceDealFingerprint
    })),
    competitiveQualifiedGames:0,
    caveat:'Accepted public roots and counts only; a missing native action does not show whether an owner-visible legal opportunity existed. No opponent-policy, paper clock or full-action-chain certification.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'Usage: node scripts/agent37-rank5-native-zero-attack-frontier.cjs archive.json');
  process.stdout.write(JSON.stringify(
    auditRank5Archive(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),
    null,2)+'\n');
}

module.exports={VERSION,publicSourceRoots,sourceCardTargetChanges,
  opponentActiveChanges,auditRank5Archive};
