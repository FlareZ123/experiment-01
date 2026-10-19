'use strict';

const assert=require('node:assert/strict');

/**
 * Reconcile a candidate's real Store attack log with the post-prompt public
 * board, physical Prize changes, retrospective printed Poltergeist base
 * damage, and the first actual opposing action on the next global turn.
 * Read-only: neither hidden cards nor postgame audits enter the bot's policy.
 * @param {object} game Headless Store output with public attack and root capture.
 * @param {0|1} candidateSeat Actual physical player slot.
 * @returns {object} Independent transport/lineage evidence; no rules or win certificate.
 */
function candidateAttackSettlement(game,candidateSeat) {
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.equal(game.rootActionLedgerProtocol,'actual-store-root-action-ledger-v1');
  assert.equal(game.attackDeclarationTraceProtocol,'real-store-attack-log-declarations-v1');
  assert.equal(game.publicAttackTransitionsProtocol,'actual-store-public-attack-transitions-v1');
  assert.ok(Array.isArray(game.rootActionLedger));
  assert.ok(Array.isArray(game.attackDeclarationTrace));
  assert.ok(Array.isArray(game.publicAttackTransitions));
  const roots=game.rootActionLedger;
  const sourceSeat=1-candidateSeat;
  const candidates=game.attackDeclarationTrace.filter(row=>
    row.playerSlot===candidateSeat);
  const audits=Array.isArray(game.poltergeistEffectTrace)?
    game.poltergeistEffectTrace:[];
  const attacks=candidates.map(declaration=>{
    const event=game.publicAttackTransitions.find(row=>
      row.actionOrdinal===declaration.actionOrdinal &&
      row.triggerPlayerSlot===candidateSeat &&
      row.declarations.some(entry=>
        entry.attackName===declaration.attackName &&
        entry.playerName===declaration.playerName));
    assert.ok(event,'Candidate real attack declaration missing from public Store observation');
    const declaringRoot=roots[event.actionOrdinal];
    assert.ok(declaringRoot &&
      declaringRoot.playerSlot===candidateSeat &&
      declaringRoot.turnBefore===declaration.turnBefore &&
      declaringRoot.action===declaration.triggerAction,
    'Candidate public attack and root action disagree');
    const completion=event.settled?.completionRootActionOrdinal;
    const closingRoot=Number.isSafeInteger(completion)?roots[completion]:null;
    const settled=Boolean(closingRoot && completion>=event.actionOrdinal &&
      Array.isArray(event.before) && event.before.length===2 &&
      Array.isArray(event.settled.after) && event.settled.after.length===2 &&
      Array.isArray(event.beforePrizesRemaining) &&
      event.beforePrizesRemaining.length===2 &&
      Array.isArray(event.settled.prizesRemaining) &&
      event.settled.prizesRemaining.length===2 &&
      (completion===event.actionOrdinal ||
        (closingRoot.action==='ResolvePromptAction' &&
         closingRoot.initiatingRootActionOrdinal===
           event.initiatingRootActionOrdinal)));
    const nextSource=settled?roots.find(row=>
      row.actionOrdinal>completion && row.playerSlot===sourceSeat &&
      row.turnBefore===declaration.turnBefore+1 &&
      row.action!=='ResolvePromptAction'):null;
    // Only authenticated physical source roots on the immediately following
    // global turn; selection prompts never disclose selected hidden cards.
    const sourceTurnActions=nextSource?roots.filter(row=>
      row.actionOrdinal>=nextSource.actionOrdinal &&
      row.playerSlot===sourceSeat &&
      row.turnBefore===declaration.turnBefore+1).map(row=>({
      ordinal:row.actionOrdinal,action:row.action,
      ...(row.card===undefined?{}:{card:row.card}),
      ...(row.attack===undefined?{}:{attack:row.attack}),
      ...(row.ability===undefined?{}:{ability:row.ability})
    })):[];
    const printed=declaration.attackName==='Poltergeist'?
      audits.find(row=>row.attackerSeat===candidateSeat &&
        row.actionOrdinal===event.actionOrdinal):null;
    // Explicitly redact the observer's hidden opponent hand names.
    const base=printed?.assessment??null;
    return {
      actionOrdinal:event.actionOrdinal,
      turnBefore:event.turnBefore,
      attackName:declaration.attackName,
      triggerAction:event.triggerAction,
      delegatedCopy:declaration.triggerAction==='ResolvePromptAction',
      settledPromptChain:settled,
      completionRootOrdinal:settled?completion:null,
      publicBoardBefore:event.before,
      publicBoardAfter:settled?event.settled.after:null,
      prizesBefore:event.beforePrizesRemaining,
      prizesAfter:settled?event.settled.prizesRemaining:null,
      nextSourceRoot:nextSource?{
        ordinal:nextSource.actionOrdinal,
        turn:nextSource.turnBefore,
        action:nextSource.action,
        ...(nextSource.card===undefined?{}:{card:nextSource.card}),
        ...(nextSource.attack===undefined?{}:{attack:nextSource.attack})
      }:null,
      nextSourceTurnActionCount:sourceTurnActions.length,
      nextSourceTurnActions:sourceTurnActions.slice(0,24),
      sourceTurnActionsTruncated:sourceTurnActions.length>24,
      printedPoltergeist:base?{
        trainerCount:base.sourceHandTrainerCount,
        baseDamage:base.printedBaseDamage,
        defenderBefore:base.defenderBefore,
        defenderPrintedHp:base.defenderPrintedHp,
        defenderDamageBefore:base.defenderDamageBefore,
        baseReachesPrintedRemainingHp:base.printedBaseDamageReachesPrintedRemainingHp,
        inPlayPokemonChange:base.defenderInPlayChange,
        attackerPrizeChange:base.prizeChange
      }:null
    };
  });
  return {
    schema:'agent37-actual-candidate-attack-public-settlement-v1',
    candidateSeat,
    declarations:attacks.length,
    settled:attacks.filter(row=>row.settledPromptChain).length,
    withImmediateSourceReturn:attacks.filter(row=>row.nextSourceRoot).length,
    withRetrospectivePoltergeistBase:attacks.filter(row=>row.printedPoltergeist).length,
    attacks,
    paperRuleAuditPassed:false,
    fullPolicyInformationSetAuditPassed:false,
    tournamentClockAuditPassed:false,
    qualifiedForCompetitiveInference:false
  };
}

module.exports={candidateAttackSettlement};
