'use strict';

const assert = require('node:assert/strict');

const SOURCE_SHA256 = 'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const SCOPES = ['off', 'source', 'candidate', 'both'];
const TARGET = 'Tapu Lele-GX GRI';

/**
 * Detect a source owner's genuine archived paid-attack/cooldown/Guzma passage
 * into an opponent's freshly Benched two-Prize GX. The alternative is a
 * paper-rules hypothesis, not a Store-executed move or winning outcome.
 * @param {object} row Original source native Store trial row.
 * @returns {object[]} Read-only, tightly bounded opportunities.
 */
function inspectSourceGuzmaFinisher(row) {
  const seat = row.sourceSeat;
  assert.ok(seat === 0 || seat === 1);
  const opponent = 1 - seat;
  const roots = row.rootActionLedger;
  const sidecar = row.nativeAcceptedTargetSidecar?.events;
  const mobility = row.sourceOwnerPostPassMobility?.observations;
  const settlements = row.sourceAttackSettlement?.attacks;
  assert.ok(Array.isArray(roots) && Array.isArray(sidecar) &&
    Array.isArray(mobility) && Array.isArray(settlements));
  const results = [];
  for (const pass of mobility) {
    if (!(pass.mobilityHeld?.Guzma >= 1 &&
      pass.activeName === 'Mew VMAX' &&
      pass.activeEnergyCards?.includes('Double Colorless Energy') &&
      pass.benchNames?.includes('Mew VMAX') &&
      pass.benchNames?.includes('Genesect V'))) continue;
    const turn = pass.globalTurn;
    const originalPass = roots.find(e => e.actionOrdinal === pass.ordinal &&
      e.playerSlot === seat && e.turnBefore === turn &&
      e.pendingPrompt === null && e.action === 'PassTurnAction');
    assert.ok(originalPass, 'Owner snapshot must join authentic source Pass');
    if (roots.some(e => e.playerSlot === seat && e.turnBefore === turn &&
      e.action === 'RetreatAction')) continue;
    if (roots.some(e => e.playerSlot === seat && e.turnBefore === turn &&
      e.action === 'PlayCardAction' &&
      /^(Guzma|Marnie|Karen|Crispin|Lillie|Raihan|Iono|Professor)/.test(e.card ?? ''))) continue;
    const attack = roots.find(e => e.turnBefore === turn-2 &&
      e.playerSlot === seat && e.action === 'AttackAction' &&
      e.attack === 'Cross Fusion Strike' &&
      roots.some(choice => choice.initiatingRootActionOrdinal === e.actionOrdinal &&
        choice.pendingPrompt === 'ChooseAttackPrompt' &&
        choice.attackChoice?.attackName === 'Techno Blast' &&
        choice.attackChoice?.printing === 'Genesect V FST'));
    if (!attack) continue;
    const settled = settlements.find(e => e.turnBefore === turn-2 &&
      Array.isArray(e.prizesAfter) && e.prizesAfter[seat] === 2);
    if (!settled) continue;
    const t = sidecar.filter(e => e.playerSlot === opponent &&
      e.turnBefore === turn-1 && e.action === 'PlayCardAction' &&
      e.storeAccepted === true && e.declared?.ownerHandPrinting === TARGET)
      .flatMap(e => e.publicBoardChanges.filter(c =>
        c.seat === opponent && c.position === 'bench' &&
        c.before?.pokemon == null && c.after?.pokemon === TARGET &&
        c.after?.tools?.length === 0 && c.after?.energies?.length === 0)
        .map(c => ({event:e, change:c})));
    if (t.length !== 1) continue;
    const candidatePass = roots.find(e => e.playerSlot === opponent &&
      e.turnBefore === turn-1 && e.action === 'PassTurnAction' &&
      e.pendingPrompt === null && e.actionOrdinal > t[0].event.rootActionOrdinal);
    if (!candidatePass) continue;
    if (roots.some(e => e.turnBefore === turn-1 &&
      e.playerSlot === opponent && e.action === 'AttackAction')) continue;
    results.push({
      sourceSeat:seat, opponentSeat:opponent, sourceTurn:turn,
      sourcePassRoot:pass.ordinal, previousCopiedAttackRoot:attack.actionOrdinal,
      sourceRemainingPrizes:2, originalHeldGuzma:pass.mobilityHeld.Guzma,
      activeFundedMew:true, spareBenchedMew:true,
      benchGenesectDonor:true, ownBenchFull:pass.benchNames.length === 5,
      candidateTapuPlayRoot:t[0].event.rootActionOrdinal,
      candidateTapuBenchIndex:t[0].change.index,
      candidateTapuWithoutTool:true, candidatePassRoot:candidatePass.actionOrdinal,
      proposedSequence:['Guzma opponent Tapu Lele GX to Active',
        'switch own funded Mew VMAX to spare Mew VMAX',
        'free retreat spare back into funded Mew VMAX',
        'Cross Fusion Strike copying Benched Genesect V Techno Blast'],
      conditionalNominalDamage:210, targetPrintedHp:170,
      targetPrizeValue:2, possibleImmediatePrizeCompletion:true,
      executedInNativeStore:false, competitivelyQualified:false
    });
  }
  return results;
}

/**
 * Verify all original physical-scope comparisons without treating repeated
 * policy aliases as independent game attempts.
 * @param {object} archive Original source native Store four-scope archive.
 * @returns {object}
 */
function auditArchive(archive) {
  assert.equal(archive.sourcePrinted60Sha256,SOURCE_SHA256);
  assert.equal(archive.nativeAttemptCount,32);
  assert.deepEqual(archive.scopeOrder,SCOPES);
  assert.equal(archive.modeOrder.length,2);
  const result=[];
  for (const mode of archive.modeOrder) {
    for (const scope of SCOPES) {
      const arms=archive.rawArms[scope].modes[mode].attempts;
      assert.equal(arms.length,4);
      for (const arm of arms) {
        const witnesses=inspectSourceGuzmaFinisher(arm.rawNativeRow);
        for (const witness of witnesses)result.push({mode,scope,trialId:arm.trial.id,
          dealFingerprint:arm.rawNativeRow.sourceDealFingerprint,
          rootLedgerSha256:arm.rawNativeRow.rootActionLedgerSha256,...witness});
      }
    }
  }
  const keys=new Set(result.map(e=>[e.scope,e.trialId,e.sourceTurn].join('|')));
  return {attemptsInspected:32,uniqueScopeTrialTurnOpportunities:keys.size,
    modeDuplications:result.length-keys.size, observedWinnersFromProposedMove:0,
    witnessedOpportunities:result};
}

/**
 * Additional late-game opportunity: the opposing Tapu is already on the
 * public Bench at the prior attack settlement and the opponent subsequently
 * only passed. The archived snapshots expose its absence of Tools, but not
 * a certified live legal action menu on the source turn.
 * @param {object} row Genuine native original source row.
 * @returns {object[]} Unexecuted, owner/public evidence only.
 */
function inspectPersistentTapuFinishers(row) {
  const seat=row.sourceSeat, opponent=1-seat;
  assert.ok(seat===0||seat===1);
  const roots=row.rootActionLedger;
  const observations=row.sourceOwnerPostPassMobility?.observations;
  const settlements=row.sourceAttackSettlement?.attacks;
  assert.ok(Array.isArray(roots)&&Array.isArray(observations)&&
    Array.isArray(settlements));
  const results=[];
  for(const pass of observations){
    const turn=pass.globalTurn;
    if(!(pass.mobilityHeld?.Guzma>=1&&pass.activeName==='Mew VMAX'&&
      pass.activeEnergyCards?.includes('Double Colorless Energy')&&
      pass.benchNames?.includes('Mew VMAX')&&
      pass.benchNames?.includes('Genesect V')))continue;
    const prior=settlements.find(e=>e.turnBefore===turn-2&&
      e.attackName==='Cross Fusion Strike'&&
      e.prizesAfter?.[seat]===2&&
      Array.isArray(e.publicBoardAfter?.[opponent]?.bench));
    if(!prior)continue;
    const selectedCopy=roots.some(e=>e.playerSlot===seat&&
      e.actionOrdinal===prior.actionOrdinal&&
      e.action==='AttackAction'&&
      roots.some(choice=>choice.initiatingRootActionOrdinal===e.actionOrdinal&&
        choice.pendingPrompt==='ChooseAttackPrompt'&&
        choice.attackChoice?.printing==='Genesect V FST'&&
        choice.attackChoice?.attackName==='Techno Blast'));
    if(!selectedCopy)continue;
    const opponentActs=roots.filter(e=>e.playerSlot===opponent&&
      e.turnBefore===turn-1);
    if(!opponentActs.some(e=>e.action==='PassTurnAction')||
      opponentActs.some(e=>e.action!=='PassTurnAction'&&
        e.action!=='ResolvePromptAction'))continue;
    const sourceActs=roots.filter(e=>e.playerSlot===seat&&
      e.turnBefore===turn);
    if(!sourceActs.some(e=>e.action==='PassTurnAction'&&
      e.actionOrdinal===pass.ordinal)||
      sourceActs.some(e=>e.action!=='PassTurnAction'&&
        e.action!=='ResolvePromptAction'))continue;
    const targets=prior.publicBoardAfter[opponent].bench;
    const index=targets.findIndex(t=>t.name==='Tapu Lele-GX'&&
      t.damage===0&&t.toolCards?.length===0);
    if(index<0)continue;
    results.push({sourceSeat:seat,sourceTurn:turn,
      sourcePassRoot:pass.ordinal,previousCopiedAttackRoot:prior.actionOrdinal,
      sourceRemainingPrizes:2,originalHeldGuzma:pass.mobilityHeld.Guzma,
      sourceFundedMew:true,spareBenchedMew:true,benchGenesectDonor:true,
      candidateTapuBenchIndex:index,targetPrintedHp:170,targetPrizeValue:2,
      originalOpposingPass:opponentActs.find(e=>e.action==='PassTurnAction').actionOrdinal,
      sourcePublicBoardSnapshot:'sourceAttackSettlement.publicBoardAfter',
      candidateTurnHadOnlyPassAndPrompts:true,
      possibleImmediatePrizeCompletion:true,executedInNativeStore:false,
      competitivelyQualified:false});
  }
  return results;
}

/**
 * Separate independent initial deals from repeated policy-label observations.
 * @param {object} archive Full original pinned native archival JSON.
 * @returns {object}
 */
function auditPersistentArchive(archive){
  assert.equal(archive.sourcePrinted60Sha256,SOURCE_SHA256);
  assert.equal(archive.nativeAttemptCount,32);
  const observed=[];
  for(const mode of archive.modeOrder){
    for(const scope of SCOPES){
      const arms=archive.rawArms[scope].modes[mode].attempts;
      assert.equal(arms.length,4);
      for(const arm of arms){
        for(const found of inspectPersistentTapuFinishers(arm.rawNativeRow)){
          observed.push({mode,scope,trialId:arm.trial.id,
            physicalSourceDeal:arm.rawNativeRow.sourceDealFingerprint,...found});
        }
      }
    }
  }
  const distinctScopeTurn=new Set(observed.map(e=>
    [e.scope,e.trialId,e.sourceTurn].join('|')));
  return {attemptsInspected:32,nativeOpportunities:observed.length,
    distinctScopeTrialTurns:distinctScopeTurn.size,
    modeDuplications:observed.length-distinctScopeTurn.size,
    executedAlternativeFinisherCount:0,observed};
}

module.exports={inspectSourceGuzmaFinisher,inspectPersistentTapuFinishers,auditArchive,auditPersistentArchive};
